// Dùng chung cho check.mjs, build.mjs, verify.mjs: đọc cấu hình, kiểm kịch bản, quét bí mật, dựng zip, ký danh mục.
// Luật tên tệp chép theo app (cnv-cowork `src/main/services/workspace/guard.ts`): app từ chối cả gói nếu một tệp sai luật,
// nên kiểm ở đây trước khi phát hành.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

export const ROOT = path.resolve(import.meta.dirname, '..');
export const SCENARIOS = path.join(ROOT, 'scenarios');
export const SKILLS = path.join(ROOT, 'skills');
export const OFFICES = path.join(ROOT, 'offices');
export const DIST = path.join(ROOT, 'dist');
export const CATALOG_FORMAT = 'cnv-cowork-library-catalog';
/** Chuỗi đứng trước dữ liệu khi ký: chữ ký danh mục không dùng lại được cho việc khác (và ngược lại). */
export const SIGN_PREFIX = 'CNV-COWORK-LIBRARY.v1.';
export const KEYCHAIN_SERVICE = 'CNV Cowork library signing key';

// Trần khớp với app (src/shared/library.ts): vượt là app từ chối.
export const LIMITS = { files: 2000, fileBytes: 32 * 1024 * 1024, unpackedBytes: 128 * 1024 * 1024, archiveBytes: 64 * 1024 * 1024, pathChars: 240, depth: 16 };

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const VERSION = /^(0|[1-9]\d{0,3})\.(0|[1-9]\d{0,3})\.(0|[1-9]\d{0,3})$/;
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤⁦-⁩﻿]/;
const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
const SECRET_EXTENSIONS = /\.(pem|key|p12|pfx|p8|keychain|keychain-db|kdbx|kdb|ppk|jks|keystore|gpg|pgp|asc|ovpn|mobileprovision|cer|crt|der|csr|age)$/;
const SECRET_NAMES = /^(id_(rsa|dsa|ecdsa|ed25519)\b.*|known_hosts|authorized_keys|htpasswd|shadow|master\.key|login data|cookies)$/;
const SECRET_WORDS =
  /(credential|secret|token|passw(or)?d|passwd|mat[\s._-]*khau|service[\s._-]*account|wallet|private[\s._-]*key|recovery[\s._-]*(code|key)|seed[\s._-]*phrase|backup[\s._-]*codes?|2fa|otp[\s._-]*codes?)/;

export function foldName(name) {
  return name.normalize('NFKC').toUpperCase().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd');
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function loadConfig({ needKey = true } = {}) {
  const config = readJson(path.join(ROOT, 'library.config.json'));
  if (needKey && !config.public_key?.includes('BEGIN PUBLIC KEY')) throw new Error('library.config.json thiếu public_key (chạy npm run keygen).');
  return config;
}

/** Lỗi của một đoạn tên trong đường dẫn, null nếu ổn. */
function segmentProblem(segment) {
  if (!segment || segment === '.' || segment === '..') return 'đoạn rỗng hoặc . / ..';
  if (segment.startsWith('.')) return 'tệp / thư mục ẩn (app không giải nén tệp ẩn)';
  if (CONTROL.test(segment)) return 'ký tự điều khiển / vô hình';
  if (/[\\:*?"<>|]/.test(segment)) return 'ký tự Windows không cho dùng (\\ : * ? " < > |)';
  if (segment.trim() !== segment || segment.endsWith('.')) return 'tên bắt đầu / kết thúc bằng dấu cách hoặc dấu chấm';
  if (WINDOWS_RESERVED.test(segment)) return 'tên dành riêng của Windows';
  if (Buffer.byteLength(segment, 'utf8') > 255) return 'tên dài quá';
  const folded = foldName(segment);
  if (SECRET_EXTENSIONS.test(folded) || SECRET_NAMES.test(folded) || SECRET_WORDS.test(folded)) return 'tên trông như tệp bí mật (chứng chỉ, khoá, mật khẩu, token)';
  return null;
}

/** Mọi tệp của kịch bản (đường dẫn tương đối, dấu /, NFC), đã kiểm luật tên; symlink / tệp đặc biệt là lỗi. */
export function listFiles(dir) {
  const files = [];
  const problems = [];
  const walk = (abs, rel) => {
    for (const dirent of fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const name = dirent.name.normalize('NFC');
      const relPath = rel ? `${rel}/${name}` : name;
      if (name === '.DS_Store') continue;
      const problem = segmentProblem(name);
      if (problem) {
        problems.push(`${relPath}: ${problem}`);
        continue;
      }
      const full = path.join(abs, dirent.name);
      const stat = fs.lstatSync(full);
      if (stat.isSymbolicLink()) problems.push(`${relPath}: là symlink (app không giải nén liên kết)`);
      else if (stat.isDirectory()) walk(full, relPath);
      else if (!stat.isFile()) problems.push(`${relPath}: không phải tệp thường`);
      else files.push({ rel: relPath, abs: full, size: stat.size });
    }
  };
  walk(dir, '');
  const seen = new Map();
  for (const file of files) {
    if (file.rel.length > LIMITS.pathChars) problems.push(`${file.rel}: đường dẫn dài quá (${LIMITS.pathChars} ký tự)`);
    if (file.rel.split('/').length > LIMITS.depth) problems.push(`${file.rel}: sâu quá ${LIMITS.depth} cấp`);
    if (file.size > LIMITS.fileBytes) problems.push(`${file.rel}: lớn quá ${LIMITS.fileBytes / 1024 / 1024} MB`);
    const key = foldName(file.rel);
    if (seen.has(key)) problems.push(`${file.rel}: trùng tên với ${seen.get(key)} khi không phân biệt hoa thường`);
    seen.set(key, file.rel);
  }
  if (files.length > LIMITS.files) problems.push(`quá ${LIMITS.files} tệp`);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > LIMITS.unpackedBytes) problems.push(`tổng dung lượng quá ${LIMITS.unpackedBytes / 1024 / 1024} MB`);
  return { files, problems, total };
}

// ── Quét bí mật ────────────────────────────────────────────────────────────────────────────

const TEXT_EXT = /\.(js|mjs|cjs|ts|tsx|jsx|css|scss|html?|xml|svg|json|md|txt|sh|py|ya?ml|toml|ini|conf|env|csv)$/i;
const SECRET_PATTERNS = [
  [/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/, 'khoá bí mật'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
  [/\bsk-[A-Za-z0-9_-]{20,}/, 'API key dạng sk-…'],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, 'Google API key'],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}\b/, 'GitHub token'],
  [/\bxox[abprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/\b[0-9]{8,10}:[A-Za-z0-9_-]{35}\b/, 'Telegram bot token'],
  [/(api[_-]?key|secret|token|passw(or)?d)\s*[:=]\s*['"][^'"\s]{8,}['"]/i, 'gán khoá / mật khẩu'],
  [/\b(?=[a-f0-9]*[a-f])(?=[a-f0-9]*\d)[a-f0-9]{20,}\b/, 'chuỗi hex dài (token?)'],
];
const IPV4 = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;

/**
 * Danh sách chuỗi riêng của CNV (DUID TV, mã album, địa chỉ máy chủ…) KHÔNG nằm trong repo: tệp
 * `~/.config/cnv-cowork-library/denylist.txt`, mỗi dòng một chuỗi. Chuỗi nằm trong repo là tự lộ.
 */
function denylist() {
  const file = process.env.CNV_LIBRARY_DENYLIST ?? path.join(os.homedir(), '.config', 'cnv-cowork-library', 'denylist.txt');
  try {
    return fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
  } catch {
    return [];
  }
}

/**
 * Dòng đáng ngờ trong các tệp chữ. `allow`: chuỗi cho phép (IP ví dụ, hash thư viện đã biết). `allowWords`: chữ trong
 * danh sách cấm được phép ở nhóm tệp này (vd tên nền tảng trong kỹ năng bán hàng).
 */
export function scanSecrets(files, allow = [], allowWords = []) {
  const denied = denylist().filter((word) => !allowWords.includes(word));
  const findings = [];
  for (const file of files) {
    if (!TEXT_EXT.test(file.rel) || file.rel.includes('/vendor/')) continue;
    const lines = fs.readFileSync(file.abs, 'utf8').split('\n');
    lines.forEach((line, index) => {
      const where = `${file.rel}:${index + 1}`;
      for (const [pattern, label] of SECRET_PATTERNS) {
        const match = pattern.exec(line);
        if (match && !allow.some((ok) => match[0].includes(ok))) findings.push(`${where}: ${label}`);
      }
      for (const ip of line.match(IPV4) ?? []) {
        if (!['127.0.0.1', '0.0.0.0', ...allow].includes(ip)) findings.push(`${where}: địa chỉ IP ${ip}`);
      }
      for (const word of denied) if (line.includes(word)) findings.push(`${where}: chuỗi trong danh sách cấm (denylist)`);
    });
  }
  return findings;
}

// ── Siêu dữ liệu ảnh ───────────────────────────────────────────────────────────────────────

/**
 * Ảnh còn siêu dữ liệu (EXIF: tên người chụp, máy, ngày, có khi toạ độ GPS; XMP / IPTC của Photoshop; chữ trong PNG)
 * thì báo: repo công khai. Gỡ bằng công cụ xuất ảnh «không kèm siêu dữ liệu» rồi chép lại.
 */
export function imageMetadataProblems(files) {
  const problems = [];
  for (const file of files) {
    const data = fs.readFileSync(file.abs);
    if (/\.jpe?g$/i.test(file.rel)) {
      let i = 2;
      while (i + 4 <= data.length && data[i] === 0xff) {
        const marker = data[i + 1];
        if (marker === 0xda) break;
        // APP2 chứa hồ sơ màu ICC thì giữ (không có thông tin người / máy), còn APP1–APP15 khác và COM là siêu dữ liệu.
        const icc = marker === 0xe2 && data.toString('latin1', i + 4, i + 16) === 'ICC_PROFILE\0';
        if (((marker >= 0xe1 && marker <= 0xef) || marker === 0xfe) && !icc) {
          problems.push(`${file.rel}: ảnh JPEG còn siêu dữ liệu (đoạn 0x${marker.toString(16)}: EXIF / XMP / IPTC / chú thích)`);
          break;
        }
        i += 2 + data.readUInt16BE(i + 2);
      }
    } else if (/\.png$/i.test(file.rel)) {
      for (let i = 8; i + 8 <= data.length; i += 12 + data.readUInt32BE(i)) {
        const type = data.toString('latin1', i + 4, i + 8);
        if (['tEXt', 'iTXt', 'zTXt', 'eXIf', 'tIME'].includes(type)) {
          problems.push(`${file.rel}: ảnh PNG còn siêu dữ liệu (${type})`);
          break;
        }
      }
    }
  }
  return problems;
}

// ── Kịch bản ───────────────────────────────────────────────────────────────────────────────

function text(value, max) {
  return typeof value === 'string' && value.trim() && value.length <= max;
}

/** Đọc + kiểm manifest.json của một kịch bản. Trả lỗi dạng danh sách để in hết một lần. */
export function loadScenario(id, config) {
  const dir = path.join(SCENARIOS, id);
  const problems = [];
  let manifest;
  try {
    manifest = readJson(path.join(dir, 'manifest.json'));
  } catch (err) {
    return { dir, manifest: null, problems: [`manifest.json: ${err.message}`] };
  }
  if (manifest.id !== id || !ID.test(id)) problems.push('id phải trùng tên thư mục, chữ thường không dấu, số, gạch nối');
  if (!text(manifest.name, 80)) problems.push('name: 1–80 ký tự');
  if (!text(manifest.summary, 200)) problems.push('summary: 1–200 ký tự');
  if (!text(manifest.description, 4000)) problems.push('description: 1–4000 ký tự');
  if (!config.categories.some((category) => category.id === manifest.category)) problems.push(`category "${manifest.category}" chưa khai trong library.config.json`);
  if (!VERSION.test(manifest.version ?? '')) problems.push('version dạng 1.2.3');
  if (!Array.isArray(manifest.requirements) || manifest.requirements.length > 12 || !manifest.requirements.every((item) => text(item, 200))) {
    problems.push('requirements: danh sách tối đa 12 dòng, mỗi dòng ≤ 200 ký tự');
  }
  if (!text(manifest.license, 300)) problems.push('license: 1–300 ký tự');
  if (manifest.tags !== undefined && (!Array.isArray(manifest.tags) || manifest.tags.length > 10 || !manifest.tags.every((tag) => text(tag, 30)))) problems.push('tags: tối đa 10, mỗi cái ≤ 30 ký tự');
  for (const key of ['readme', 'skill']) {
    const rel = manifest[key];
    if (rel === null || (key === 'skill' && rel === undefined)) continue;
    if (typeof rel !== 'string' || !fs.existsSync(path.join(dir, rel))) problems.push(`${key}: không thấy tệp ${rel}`);
  }
  if (typeof manifest.skill === 'string') {
    const skill = fs.readFileSync(path.join(dir, manifest.skill), 'utf8');
    const head = /^---\n([\s\S]*?)\n---\n/.exec(skill)?.[1] ?? '';
    if (!/^name: [a-z0-9]+(-[a-z0-9]+)*$/m.test(head) || !/^description: .+$/m.test(head)) problems.push(`${manifest.skill}: thiếu phần đầu --- name / description ---`);
    if (skill.length > 30_000) problems.push(`${manifest.skill}: dài quá 30.000 ký tự`);
  }
  return { dir, manifest, problems };
}

export function scenarioIds() {
  return fs
    .readdirSync(SCENARIOS, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('.'))
    .map((dirent) => dirent.name)
    .sort();
}

// ── Bộ kỹ năng ─────────────────────────────────────────────────────────────────────────────

export const SKILL_PACK_FORMAT = 'cnv-cowork-skills';
/** Nhóm = thư mục: `chung` (dùng chung) + mã ngành, khớp `INDUSTRIES` của app (src/shared/skills.ts). */
export const SKILL_GROUPS = ['chung', 'bat-dong-san', 'bao-hiem', 'o-to', 'ban-le', 'spa-lam-dep', 'giao-duc', 'fnb', 'du-lich', 'noi-that', 'tai-chinh', 'phan-phoi', 'y-te', 'cong-nghe'];
const SKILL_MAX_CHARS = 30_000;
const SKILL_MAX_COUNT = 500;

function headerValue(head, key) {
  return new RegExp(`^${key}:[ \\t]*(.*)$`, 'm').exec(head)?.[1].trim() ?? '';
}

/**
 * Kỹ năng có sẵn của trợ lý: `skills/<nhóm>/<name>.md` (SKILL.md: phần đầu --- name / description … --- rồi hướng dẫn).
 * Kiểm phần app kiểm theo luật «có sẵn» (tên tệp = name, thư mục = industry, không trùng tên / lệnh); app vẫn kiểm lại đủ.
 */
export function loadSkills(config = {}) {
  const entries = [];
  const problems = [];
  if (!fs.existsSync(SKILLS)) return { entries, problems };
  const names = new Map();
  const commands = new Map();
  for (const group of fs.readdirSync(SKILLS).filter((name) => !name.startsWith('.')).sort()) {
    const groupDir = path.join(SKILLS, group);
    if (!fs.lstatSync(groupDir).isDirectory()) {
      problems.push(`skills/${group}: chỉ được có thư mục nhóm`);
      continue;
    }
    if (!SKILL_GROUPS.includes(group)) problems.push(`skills/${group}: nhóm không có (dùng ${SKILL_GROUPS.join(', ')})`);
    for (const file of fs.readdirSync(groupDir).filter((name) => name !== '.DS_Store').sort()) {
      const rel = `${group}/${file}`;
      const abs = path.join(groupDir, file);
      if (!/^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(file) || !fs.lstatSync(abs).isFile()) {
        problems.push(`skills/${rel}: tên tệp chữ thường không dấu, gạch nối, đuôi .md`);
        continue;
      }
      const content = fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');
      const head = /^---\n([\s\S]*?)\n---\n/.exec(content)?.[1];
      if (head === undefined) {
        problems.push(`skills/${rel}: thiếu phần đầu --- … ---`);
        continue;
      }
      const name = headerValue(head, 'name');
      const industry = headerValue(head, 'industry');
      const command = headerValue(head, 'command').toLowerCase();
      if (`${name}.md` !== file) problems.push(`skills/${rel}: tên tệp phải trùng "name" (${name || 'trống'})`);
      if (!headerValue(head, 'description')) problems.push(`skills/${rel}: thiếu "description"`);
      if ((group === 'chung' ? '' : group) !== industry) problems.push(`skills/${rel}: thư mục «${group}» không khớp "industry" (${industry || 'trống'})`);
      if (content.length > SKILL_MAX_CHARS) problems.push(`skills/${rel}: dài quá ${SKILL_MAX_CHARS.toLocaleString('vi-VN')} ký tự`);
      if (names.has(name)) problems.push(`skills/${rel}: trùng tên với ${names.get(name)}`);
      names.set(name, rel);
      if (command) {
        if (commands.has(command)) problems.push(`skills/${rel}: trùng lệnh ${command} với ${commands.get(command)}`);
        commands.set(command, rel);
      }
      entries.push({ path: rel, content, abs });
    }
  }
  if (entries.length > SKILL_MAX_COUNT) problems.push(`skills: quá ${SKILL_MAX_COUNT} kỹ năng`);
  const files = entries.map((entry) => ({ rel: `skills/${entry.path}`, abs: entry.abs, size: Buffer.byteLength(entry.content) }));
  problems.push(...scanSecrets(files, config.scan_allow ?? [], config.skills_scan_allow_words ?? []).map((line) => `bí mật? ${line}`));
  return { entries, problems };
}

/**
 * Bộ kỹ năng dựng cố định (sắp theo đường dẫn, không khoảng trắng thừa): cùng nội dung thì cùng sha256. App tính đúng
 * kiểu này cho bản đóng sẵn trong bộ cài (`skills/builtin/snapshot.json`) để biết khỏi tải lại.
 */
export function buildSkillPack(entries) {
  const skills = [...entries].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0)).map((entry) => ({ path: entry.path, content: entry.content }));
  return Buffer.from(JSON.stringify({ format: SKILL_PACK_FORMAT, version: 1, skills }), 'utf8');
}

// ── Zip cố định ────────────────────────────────────────────────────────────────────────────

/**
 * Zip dựng lại y hệt từ cùng nội dung (giờ cố định 1980-01-01, thứ tự tệp cố định): băm sha256 không đổi khi không
 * sửa gì. Không có mục thư mục, symlink hay quyền chạy: mọi tệp là tệp thường 0644, tên UTF-8 (cờ 11).
 */
export function buildZip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const file of files) {
    // Tệp sinh lúc đóng gói (vd styles.json của bộ làm video) đưa thẳng `data`, không có trên đĩa.
    const data = file.data ?? fs.readFileSync(file.abs);
    const name = Buffer.from(file.rel, 'utf8');
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    const stored = deflated.length >= data.length;
    const body = stored ? data : deflated;
    const crc = zlib.crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(stored ? 0 : 8, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0x21, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE((3 << 8) | 20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(stored ? 0 : 8, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    locals.push(local, name, body);
    centrals.push(central, name);
    offset += local.length + name.length + body.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}

// ── Ký ────────────────────────────────────────────────────────────────────────────────────

export function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/** Khoá bí mật: `--key-file <tệp>` (PEM / PKCS#8 DER base64) hoặc Keychain của macOS (mục KEYCHAIN_SERVICE). */
export async function signingKey(keyFile) {
  let raw;
  if (keyFile) raw = fs.readFileSync(keyFile, 'utf8').trim();
  else {
    const { execFileSync } = await import('node:child_process');
    raw = execFileSync('security', ['find-generic-password', '-s', KEYCHAIN_SERVICE, '-w'], { encoding: 'utf8' }).trim();
  }
  return raw.includes('BEGIN') ? crypto.createPrivateKey(raw) : crypto.createPrivateKey({ key: Buffer.from(raw, 'base64'), format: 'der', type: 'pkcs8' });
}

export function signCatalog(payload, privateKey) {
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto.sign(null, Buffer.from(SIGN_PREFIX + data), privateKey).toString('base64url');
  return { format: CATALOG_FORMAT, version: 1, payload: data, signature };
}

/** Kiểm danh mục đã ký bằng khoá công khai; trả nội dung nếu đúng. */
export function openCatalog(envelope, publicKeyPem) {
  if (envelope.format !== CATALOG_FORMAT || envelope.version !== 1) throw new Error('Không phải danh mục Thư viện CNV Cowork.');
  const ok = crypto.verify(null, Buffer.from(SIGN_PREFIX + envelope.payload), crypto.createPublicKey(publicKeyPem), Buffer.from(envelope.signature, 'base64url'));
  if (!ok) throw new Error('Chữ ký danh mục không khớp khoá công khai.');
  return JSON.parse(Buffer.from(envelope.payload, 'base64url').toString('utf8'));
}

// ── Nhật ký «Có gì mới» của app ──────────────────────────────────────────────────────────────

/**
 * `changelog.json` ở gốc repo: sửa câu chữ nhật ký «Có gì mới» của Cowork không cần ra bản app (app đè mục CÙNG số bản của
 * bản đóng gói `src/shared/changelog.json`; thêm được bản bị sót). Rỗng = không đè gì. Khuôn và luật trùng
 * `changelogProblems` của app (`src/shared/changelog.ts`): sai khuôn thì app bỏ cả nhật ký trên mạng, dùng bản đóng gói.
 */
export const CHANGELOG_FILE = path.join(ROOT, 'changelog.json');
export const CHANGELOG_TEXT_MAX = 180;

export function loadChangelog() {
  if (!fs.existsSync(CHANGELOG_FILE)) return { entries: [], problems: [] };
  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(CHANGELOG_FILE, 'utf8'));
  } catch (err) {
    return { entries: [], problems: [`changelog.json: không đọc được JSON (${err.message}).`] };
  }
  if (!Array.isArray(entries)) return { entries: [], problems: ['changelog.json: phải là một danh sách.'] };
  const problems = [];
  let previous = Number.POSITIVE_INFINITY;
  for (const entry of entries) {
    const where = `changelog.json bản ${entry?.build}`;
    if (!Number.isInteger(entry?.build) || entry.build <= 0) problems.push(`${where}: số bản không hợp lệ.`);
    if (entry?.build >= previous) problems.push(`${where}: phải xếp mới nhất trước, không trùng số bản.`);
    previous = entry?.build;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry?.date ?? '') || Number.isNaN(Date.parse(entry.date))) problems.push(`${where}: ngày phải dạng YYYY-MM-DD.`);
    if (!Array.isArray(entry?.items) || !entry.items.length) problems.push(`${where}: chưa có dòng nào.`);
    for (const item of entry?.items ?? []) {
      if (item?.type !== 'new' && item?.type !== 'fix') problems.push(`${where}: loại «${item?.type}» lạ (new | fix).`);
      const text = typeof item?.text === 'string' ? item.text.trim() : '';
      if (!text) problems.push(`${where}: có dòng trống.`);
      if (text.length > CHANGELOG_TEXT_MAX) problems.push(`${where}: dòng dài quá ${CHANGELOG_TEXT_MAX} ký tự.`);
      if (/`|\bcommit\b|\bmigration\b|\bIPC\b|\bnpm\b/i.test(text)) problems.push(`${where}: dòng có từ kỹ thuật («${text.slice(0, 40)}…»).`);
    }
  }
  return { entries, problems };
}


// ── Mẫu Thư viện văn phòng ─────────────────────────────────────────────────────────────────

/**
 * Mẫu văn phòng AI theo ngành (`offices/<id>.json`): các phòng (agent) có vai + lời dặn, chuỗi chuyền việc có tên (Kiểm
 * Brand luôn tự chạy cuối, KHÔNG ghi trong chuỗi), lịch mẫu (app tạo sẵn nhưng để tắt), câu giao việc mẫu, khung ghi chú Bộ
 * não. Luật khớp app (cnv-cowork `src/main/services/aiOffice/catalog.ts`, `src/shared/officeTemplates.ts`): mẫu sai thì
 * app bỏ riêng mẫu đó.
 */
export const OFFICE_PACK_FORMAT = 'cnv-cowork-offices';
export const OFFICE_GROUPS = ['sales_marketing', 'office', 'professional', 'services', 'other'];
export const OFFICE_ICONS = ['megaphone', 'briefcase', 'shopping-bag', 'headphones', 'users', 'calculator', 'scale', 'building', 'graduation-cap', 'sparkles', 'utensils', 'stethoscope', 'hammer', 'shield', 'car'];
const AGENT_COLORS = ['blue', 'violet', 'emerald', 'amber', 'rose', 'slate'];
const BRAIN_KINDS = ['company', 'department', 'product', 'customer', 'process', 'competitor', 'brand', 'note'];
const OFFICE = { rooms: 10, chains: 4, chainRooms: 6, schedules: 3, samplePrompts: 6, brainNotes: 12, name: 60, role: 200, instructions: 4000, summary: 160, description: 600, chainDescription: 300, prompt: 1000, noteTitle: 120, noteBody: 4000 };
const COORDINATOR = 'Điều phối';
const BRAIN_TITLE_FORBIDDEN = /[\\/:*?"<>|#^[\]\n\r\t]/;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const officeKey = (name) => name.normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();

function officeProblems(office, file) {
  const problems = [];
  const text = (value, max, label) => {
    if (typeof value !== 'string' || !value.trim()) problems.push(`${label} trống`);
    else if (value.trim().length > max) problems.push(`${label} dài quá ${max} ký tự`);
  };
  if (!ID.test(office.id ?? '') || office.id.length > 40) problems.push('id chữ thường không dấu, gạch nối, ≤ 40 ký tự');
  if (`${office.id}.json` !== file) problems.push(`tên tệp phải là ${office.id}.json`);
  text(office.name, OFFICE.name, 'name');
  text(office.industry, OFFICE.name, 'industry');
  if (!OFFICE_GROUPS.includes(office.group)) problems.push(`group «${office.group}» lạ (${OFFICE_GROUPS.join(', ')})`);
  if (!OFFICE_ICONS.includes(office.icon)) problems.push(`icon «${office.icon}» lạ (${OFFICE_ICONS.join(', ')})`);
  text(office.summary, OFFICE.summary, 'summary');
  text(office.description, OFFICE.description, 'description');
  if (!/^\d+\.\d+\.\d+$/.test(office.version ?? '')) problems.push('version dạng 1.0.0');
  const rooms = Array.isArray(office.rooms) ? office.rooms : [];
  if (rooms.length < 2 || rooms.length > OFFICE.rooms) problems.push(`rooms: 2–${OFFICE.rooms} phòng`);
  const roomNames = new Set();
  for (const room of rooms) {
    text(room.name, OFFICE.name, 'phòng: name');
    text(room.role, OFFICE.role, `phòng «${room.name}»: role`);
    text(room.instructions, OFFICE.instructions, `phòng «${room.name}»: instructions`);
    if (!AGENT_COLORS.includes(room.color)) problems.push(`phòng «${room.name}»: color lạ`);
    const key = officeKey(room.name ?? '');
    if (roomNames.has(key)) problems.push(`trùng phòng «${room.name}»`);
    if (key === officeKey(COORDINATOR)) problems.push(`phòng «${room.name}» trùng tên Điều phối (app tự có)`);
    roomNames.add(key);
  }
  if (!roomNames.has(officeKey(office.brand_check ?? ''))) problems.push(`brand_check «${office.brand_check}» không có trong rooms`);
  const chains = Array.isArray(office.chains) ? office.chains : [];
  if (!chains.length || chains.length > OFFICE.chains) problems.push(`chains: 1–${OFFICE.chains} chuỗi`);
  const chainNames = new Set();
  for (const chain of chains) {
    text(chain.name, OFFICE.name, 'chuỗi: name');
    text(chain.description, OFFICE.chainDescription, `chuỗi «${chain.name}»: description`);
    if (chainNames.has(officeKey(chain.name ?? ''))) problems.push(`trùng chuỗi «${chain.name}»`);
    chainNames.add(officeKey(chain.name ?? ''));
    const steps = Array.isArray(chain.rooms) ? chain.rooms : [];
    if (!steps.length || steps.length > OFFICE.chainRooms) problems.push(`chuỗi «${chain.name}»: 1–${OFFICE.chainRooms} phòng`);
    if (new Set(steps.map(officeKey)).size !== steps.length) problems.push(`chuỗi «${chain.name}» lặp phòng`);
    for (const step of steps) {
      if (!roomNames.has(officeKey(step))) problems.push(`chuỗi «${chain.name}»: phòng lạ «${step}»`);
      if (officeKey(step) === officeKey(office.brand_check ?? '')) problems.push(`chuỗi «${chain.name}»: không ghi Kiểm Brand (luôn tự chạy cuối)`);
    }
  }
  const schedules = Array.isArray(office.schedules) ? office.schedules : [];
  if (schedules.length > OFFICE.schedules) problems.push(`schedules: tối đa ${OFFICE.schedules}`);
  for (const schedule of schedules) {
    text(schedule.name, OFFICE.name, 'lịch: name');
    text(schedule.prompt, OFFICE.prompt, `lịch «${schedule.name}»: prompt`);
    if (!roomNames.has(officeKey(schedule.room ?? '')) && officeKey(schedule.room ?? '') !== officeKey(COORDINATOR)) problems.push(`lịch «${schedule.name}»: phòng lạ «${schedule.room}»`);
    if (!HHMM.test(schedule.time ?? '')) problems.push(`lịch «${schedule.name}»: time dạng HH:mm`);
    if (!Array.isArray(schedule.days) || !schedule.days.length || schedule.days.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) problems.push(`lịch «${schedule.name}»: days 0–6 (0 = Chủ nhật)`);
  }
  const prompts = Array.isArray(office.sample_prompts) ? office.sample_prompts : [];
  if (prompts.length < 3 || prompts.length > OFFICE.samplePrompts) problems.push(`sample_prompts: 3–${OFFICE.samplePrompts} câu`);
  for (const prompt of prompts) text(prompt, OFFICE.prompt, 'sample_prompts');
  const notes = Array.isArray(office.brain_notes) ? office.brain_notes : [];
  if (notes.length > OFFICE.brainNotes) problems.push(`brain_notes: tối đa ${OFFICE.brainNotes}`);
  const noteTitles = new Set();
  for (const note of notes) {
    text(note.title, OFFICE.noteTitle, 'ghi chú: title');
    if (BRAIN_TITLE_FORBIDDEN.test(note.title ?? '') || (note.title ?? '').startsWith('.')) problems.push(`ghi chú «${note.title}»: tên có ký tự \\ / : * ? " < > | # ^ [ ]`);
    if (!BRAIN_KINDS.includes(note.kind)) problems.push(`ghi chú «${note.title}»: kind lạ`);
    if (typeof note.body !== 'string' || note.body.length > OFFICE.noteBody) problems.push(`ghi chú «${note.title}»: body`);
    if (noteTitles.has(officeKey(note.title ?? ''))) problems.push(`trùng ghi chú «${note.title}»`);
    noteTitles.add(officeKey(note.title ?? ''));
  }
  return problems;
}

export function loadOffices(config = {}) {
  const entries = [];
  const problems = [];
  if (!fs.existsSync(OFFICES)) return { entries, problems };
  for (const file of fs.readdirSync(OFFICES).filter((name) => name !== '.DS_Store').sort()) {
    const abs = path.join(OFFICES, file);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*\.json$/.test(file) || !fs.lstatSync(abs).isFile()) {
      problems.push(`offices/${file}: tên tệp chữ thường không dấu, gạch nối, đuôi .json`);
      continue;
    }
    let office;
    try {
      office = readJson(abs);
    } catch (err) {
      problems.push(`offices/${file}: không đọc được JSON (${err.message})`);
      continue;
    }
    problems.push(...officeProblems(office, file).map((line) => `offices/${file}: ${line}`));
    entries.push({ office, abs, rel: `offices/${file}` });
  }
  const files = entries.map((entry) => ({ rel: entry.rel, abs: entry.abs, size: fs.statSync(entry.abs).size }));
  problems.push(...scanSecrets(files, config.scan_allow ?? [], config.skills_scan_allow_words ?? []).map((line) => `bí mật? ${line}`));
  return { entries, problems };
}

/**
 * Bộ mẫu dựng cố định (sắp theo id, không khoảng trắng thừa): cùng nội dung thì cùng sha256. App dựng y hệt cho bản chụp
 * trong bộ cài (`npm run offices:sync` của cnv-cowork) để biết bộ trong danh mục trùng bản chụp mà khỏi tải.
 */
export function buildOfficePack(entries) {
  const offices = entries.map((entry) => entry.office).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return Buffer.from(JSON.stringify({ format: OFFICE_PACK_FORMAT, version: 1, offices }), 'utf8');
}

// ── Bộ dựng video ──────────────────────────────────────────────────────────────────────────

/**
 * `video/engine.json`: bộ dựng video (ffmpeg + ffprobe) của Trình dựng video theo nền tảng, ghim URL + SHA-256 + số byte.
 * Build đưa vào `content.video_engine` của danh mục; app (cnv-cowork `src/main/services/video/catalog.ts`
 * `remoteVideoEngine`) dùng thay bảng ghim mang sẵn, bản sai khuôn thì bỏ riêng bản đó. Luật trùng app: host tải trong
 * `VIDEO_ENGINE_HOSTS`, https, không «latest», zip của tệp chạy phải có trong danh sách tải.
 */
export const VIDEO_ENGINE_FILE = path.join(ROOT, 'video', 'engine.json');
export const VIDEO_ENGINE_HOSTS = ['github.com', 'objects.githubusercontent.com', 'release-assets.githubusercontent.com', 'ffmpeg.martin-riedl.de'];
const VIDEO_PLATFORMS = ['darwin-arm64', 'darwin-x64', 'win32-x64', 'win32-arm64'];
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;

export function loadVideoEngine() {
  if (!fs.existsSync(VIDEO_ENGINE_FILE)) return { engine: null, problems: [] };
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(VIDEO_ENGINE_FILE, 'utf8'));
  } catch (err) {
    return { engine: null, problems: [`video/engine.json: không đọc được JSON (${err.message}).`] };
  }
  const problems = [];
  const builds = raw?.builds;
  if (!builds || typeof builds !== 'object') return { engine: null, problems: ['video/engine.json: thiếu «builds».'] };
  for (const platform of VIDEO_PLATFORMS) if (!builds[platform]) problems.push(`video/engine.json: thiếu bản cho ${platform}.`);
  for (const [platform, build] of Object.entries(builds)) {
    const where = `video/engine.json ${platform}`;
    if (!VIDEO_PLATFORMS.includes(platform)) problems.push(`${where}: nền tảng lạ (${VIDEO_PLATFORMS.join(', ')}).`);
    if (!SEGMENT.test(build?.id ?? '')) problems.push(`${where}: «id» chỉ gồm chữ, số, . _ - (đổi khi đổi bản dựng).`);
    if (!build?.id?.includes(build?.version ?? '\u0000')) problems.push(`${where}: «id» nên chứa phiên bản để mỗi bản dựng một thư mục.`);
    for (const key of ['version', 'license', 'source']) if (typeof build?.[key] !== 'string' || !build[key].trim()) problems.push(`${where}: thiếu «${key}».`);
    if (!/^https:\/\//.test(build?.source ?? '')) problems.push(`${where}: «source» phải là link https tới nơi phát hành.`);
    if (!SEGMENT.test(build?.download?.id ?? '')) problems.push(`${where}: thiếu «download.id».`);
    const files = Array.isArray(build?.download?.files) ? build.download.files : [];
    if (!files.length || files.length > 4) problems.push(`${where}: «download.files» phải có 1–4 tệp.`);
    for (const file of files) {
      if (!SEGMENT.test(file?.name ?? '')) problems.push(`${where}: tên tệp «${file?.name}» không hợp lệ.`);
      let url = null;
      try {
        url = new URL(file?.url);
      } catch {
        problems.push(`${where}: link «${file?.url}» không hợp lệ.`);
      }
      if (url && (url.protocol !== 'https:' || !VIDEO_ENGINE_HOSTS.includes(url.hostname))) problems.push(`${where}: chỉ tải https từ ${VIDEO_ENGINE_HOSTS.join(', ')} (app chặn host khác).`);
      if (url && /latest/i.test(url.pathname)) problems.push(`${where}: link phải ghim phiên bản, không dùng «latest».`);
      if (!/^[a-f0-9]{64}$/.test(file?.sha256 ?? '')) problems.push(`${where}: «sha256» phải là 64 ký tự hex.`);
      if (!Number.isInteger(file?.bytes) || file.bytes <= 0 || file.bytes > 600 * 1024 * 1024) problems.push(`${where}: «bytes» không hợp lệ (tối đa 600 MB).`);
    }
    const names = new Set(files.map((file) => file?.name));
    for (const tool of ['ffmpeg', 'ffprobe']) {
      const bin = build?.binaries?.[tool];
      if (!bin || !names.has(bin.zip)) problems.push(`${where}: «binaries.${tool}.zip» phải là một tệp trong download.files.`);
      if (!/^[A-Za-z0-9._/-]{1,200}$/.test(bin?.entry ?? '') || String(bin?.entry).split('/').includes('..')) problems.push(`${where}: «binaries.${tool}.entry» không hợp lệ.`);
    }
  }
  return { engine: problems.length ? null : { builds }, problems };
}
