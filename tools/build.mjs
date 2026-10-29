#!/usr/bin/env node
// Đóng gói mọi kịch bản thành dist/<id>-<phiên bản>.zip, bộ kỹ năng thành dist/skills-<sha256 12 ký tự>.json, rồi dựng
// dist/catalog.json đã ký Ed25519 (ghim sha256 của từng tệp), sẵn để gắn vào một GitHub Release (dist/RELEASE.md ghi từng
// bước). Không đăng gì lên mạng.
//   node tools/build.mjs                     (khoá bí mật từ Keychain macOS, mục "CNV Cowork library signing key")
//   node tools/build.mjs --tag v2026.10.29   (tên tag của bản phát hành; mặc định vNĂM.THÁNG.NGÀY-GIỜPHÚT)
//   node tools/build.mjs --key-file <tệp>    (PEM hoặc PKCS#8 DER base64, tệp nằm ngoài repo)
// Không bao giờ commit khoá bí mật.
import fs from 'node:fs';
import path from 'node:path';
import { buildSkillPack, buildZip, DIST, imageMetadataProblems, LIMITS, listFiles, loadChangelog, loadConfig, loadScenario, loadSkills, openCatalog, scanSecrets, scenarioIds, sha256, signCatalog, signingKey } from './lib.mjs';

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index > 0 ? process.argv[index + 1] : undefined;
}

const config = loadConfig();
const now = new Date();
const pad = (value) => String(value).padStart(2, '0');
const tag = arg('tag') ?? `v${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
if (!/^v[0-9A-Za-z._-]{1,60}$/.test(tag)) throw new Error(`Tag «${tag}» không hợp lệ (vd v2026.10.29).`);
const { owner, repo } = config.github ?? {};
// Gói ghim theo tag (không theo «latest»): danh mục cũ còn trong bộ nhớ đệm vẫn tải đúng gói của nó. Chưa có chủ repo
// thì để đường dẫn tương đối (cạnh catalog.json).
const archiveUrl = (file) => (owner ? `https://github.com/${owner}/${repo}/releases/download/${tag}/${file}` : file);
const scenarios = [];
const problems = [];
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

for (const id of scenarioIds()) {
  const { dir, manifest, problems: manifestProblems } = loadScenario(id, config);
  const { files, problems: fileProblems, total } = listFiles(dir);
  const secrets = scanSecrets(files, config.scan_allow ?? []);
  const found = [...manifestProblems, ...fileProblems, ...imageMetadataProblems(files), ...secrets.map((line) => `bí mật? ${line}`)];
  if (found.length) {
    problems.push(...found.map((line) => `${id}: ${line}`));
    continue;
  }
  const zip = buildZip(files);
  if (zip.length > LIMITS.archiveBytes) {
    problems.push(`${id}: gói nén lớn quá ${LIMITS.archiveBytes / 1024 / 1024} MB`);
    continue;
  }
  const name = `${id}-${manifest.version}.zip`;
  fs.writeFileSync(path.join(DIST, name), zip);
  scenarios.push({
    ...manifest,
    tags: manifest.tags ?? [],
    skill: manifest.skill ?? null,
    readme: manifest.readme ?? null,
    archive: { url: archiveUrl(name), sha256: sha256(zip), bytes: zip.length, files: files.length, unpacked_bytes: total },
  });
  console.log(`✔ ${name}: ${files.length} tệp, ${(zip.length / 1024).toFixed(0)} KB`);
}

const skills = loadSkills(config);
problems.push(...skills.problems);
let skillPack = null;
if (skills.entries.length) {
  const pack = buildSkillPack(skills.entries);
  const name = `skills-${sha256(pack).slice(0, 12)}.json`;
  fs.writeFileSync(path.join(DIST, name), pack);
  skillPack = { url: archiveUrl(name), sha256: sha256(pack), bytes: pack.length, count: skills.entries.length };
  console.log(`✔ ${name}: ${skills.entries.length} kỹ năng, ${(pack.length / 1024).toFixed(0)} KB`);
}

const changelog = loadChangelog();
problems.push(...changelog.problems);
if (changelog.entries.length) console.log(`✔ changelog: ${changelog.entries.length} bản đè nhật ký «Có gì mới» của app`);

if (problems.length) {
  console.error('Chưa đóng gói được:');
  for (const line of problems) console.error(`   ${line}`);
  process.exit(1);
}

// `content`: nội dung app tự cập nhật không cần bản app mới (bộ kỹ năng có sẵn; nhật ký «Có gì mới» nằm luôn trong danh mục
// vì nhỏ). App cũ không biết trường nào thì bỏ qua.
const content = { skills: skillPack, ...(changelog.entries.length ? { changelog: changelog.entries } : {}) };
const payload = { format: 1, issued_at: new Date().toISOString(), categories: config.categories, scenarios, content };
const envelope = signCatalog(payload, await signingKey(arg('key-file')));
openCatalog(envelope, config.public_key); // khoá bí mật phải khớp khoá công khai app ghim
fs.writeFileSync(path.join(DIST, 'catalog.json'), `${JSON.stringify(envelope, null, 2)}\n`);
const files = ['catalog.json', ...scenarios.map((scenario) => scenario.archive.url.split('/').pop()), ...(skillPack ? [skillPack.url.split('/').pop()] : [])];
const where = owner ? `https://github.com/${owner}/${repo}` : '(chưa điền github.owner trong library.config.json)';
fs.writeFileSync(
  path.join(DIST, 'RELEASE.md'),
  `# Phát hành ${tag}

Repo: ${where} (CÔNG KHAI). Chỉ đăng khi người phụ trách của CNV đã duyệt.

1. Kiểm \`npm run check\` sạch, commit, đẩy nhánh \`main\`: \`git push origin main\` (remote push của repo là alias SSH
   \`git@github-cnv-library:cnvwork/cnv-cowork-library.git\` trong \`~/.ssh/config\`, deploy key riêng của repo này).
2. GitHub › Releases › Draft a new release › tag **${tag}** (tạo mới, trỏ vào commit vừa đẩy). Mỗi lần phát hành một
   tag mới, không sửa release cũ.
3. Kéo thả ĐỦ các tệp sau trong thư mục dist/ vào ô «Attach binaries»:
${files.map((file) => `   - ${file}`).join('\n')}
4. Để trống «Set as a pre-release», chọn **Set as the latest release**, bấm Publish.
5. Kiểm: mở ${owner ? `https://github.com/${owner}/${repo}/releases/latest/download/catalog.json` : '<repo>/releases/latest/download/catalog.json'}
   phải tải về đúng tệp này; \`npm run verify\` ở máy vẫn xanh.

App chỉ tải qua link tải thẳng github.com/…/releases/…/download/… (chuyển hướng sang *.githubusercontent.com),
không gọi api.github.com. Xoá / sửa release cũ thì danh mục cũ trong máy người dùng vẫn trỏ gói theo tag cũ: giữ lại.
`,
);
console.log(`✔ dist/catalog.json: ${scenarios.length} kịch bản, ${skillPack?.count ?? 0} kỹ năng, ký lúc ${payload.issued_at}, tag ${tag}`);
console.log(`  Bước đăng lên GitHub: dist/RELEASE.md`);
