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
    const data = fs.readFileSync(file.abs);
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
