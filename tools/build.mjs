#!/usr/bin/env node
// Đóng gói mọi kịch bản thành dist/<id>-<phiên bản>.zip rồi dựng dist/catalog.json đã ký Ed25519, sẵn để gắn vào một
// GitHub Release (dist/RELEASE.md ghi từng bước). Không đăng gì lên mạng.
//   node tools/build.mjs                     (khoá bí mật từ Keychain macOS, mục "CNV Cowork library signing key")
//   node tools/build.mjs --tag v2026.10.29   (tên tag của bản phát hành; mặc định vNĂM.THÁNG.NGÀY-GIỜPHÚT)
//   node tools/build.mjs --key-file <tệp>    (PEM hoặc PKCS#8 DER base64, tệp nằm ngoài repo)
// Không bao giờ commit khoá bí mật.
import fs from 'node:fs';
import path from 'node:path';
import { buildZip, DIST, imageMetadataProblems, LIMITS, listFiles, loadConfig, loadScenario, openCatalog, scanSecrets, scenarioIds, sha256, signCatalog, signingKey } from './lib.mjs';

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

if (problems.length) {
  console.error('Chưa đóng gói được:');
  for (const line of problems) console.error(`   ${line}`);
  process.exit(1);
}

const payload = { format: 1, issued_at: new Date().toISOString(), categories: config.categories, scenarios };
const envelope = signCatalog(payload, await signingKey(arg('key-file')));
openCatalog(envelope, config.public_key); // khoá bí mật phải khớp khoá công khai app ghim
fs.writeFileSync(path.join(DIST, 'catalog.json'), `${JSON.stringify(envelope, null, 2)}\n`);
const files = ['catalog.json', ...scenarios.map((scenario) => scenario.archive.url.split('/').pop())];
const where = owner ? `https://github.com/${owner}/${repo}` : '(chưa điền github.owner trong library.config.json)';
fs.writeFileSync(
  path.join(DIST, 'RELEASE.md'),
  `# Phát hành ${tag}

Repo: ${where} (CÔNG KHAI). Chỉ đăng khi người phụ trách của CNV đã duyệt.

1. Kiểm \`npm run check\` sạch, đẩy nhánh \`main\` lên GitHub (\`git push -u origin main\`).
2. GitHub › Releases › Draft a new release › tag **${tag}** (tạo mới, trỏ vào commit vừa đẩy).
3. Kéo thả ĐỦ các tệp sau trong thư mục dist/ vào ô «Attach binaries»:
${files.map((file) => `   - ${file}`).join('\n')}
4. Để trống «Set as a pre-release», chọn **Set as the latest release**, bấm Publish.
5. Kiểm: mở ${owner ? `https://github.com/${owner}/${repo}/releases/latest/download/catalog.json` : '<repo>/releases/latest/download/catalog.json'}
   phải tải về đúng tệp này; \`npm run verify\` ở máy vẫn xanh.

App chỉ tải qua link tải thẳng github.com/…/releases/…/download/… (chuyển hướng sang *.githubusercontent.com),
không gọi api.github.com. Xoá / sửa release cũ thì danh mục cũ trong máy người dùng vẫn trỏ gói theo tag cũ: giữ lại.
`,
);
console.log(`✔ dist/catalog.json: ${scenarios.length} kịch bản, ký lúc ${payload.issued_at}, tag ${tag}`);
console.log(`  Bước đăng lên GitHub: dist/RELEASE.md`);
