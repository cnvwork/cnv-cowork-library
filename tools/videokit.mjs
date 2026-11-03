// Bộ làm video của CNV Cowork (video/): phông OFL, phong cách chữ chuyển động, tiếng hiệu ứng tự tổng hợp, model chép lời
// trên máy. `check` kiểm từng phần; `build` đóng phông / phong cách / tiếng hiệu ứng thành 3 tệp zip cố định (đính kèm GitHub
// Release) và ghim cả model chép lời (Hugging Face, ghim commit) vào `content.video_kit` của danh mục. App
// (cnv-cowork `src/main/services/video/kitCatalog.ts` `remoteVideoKit`) kiểm lại đủ, gói sai khuôn thì bỏ gói đó.
import fs from 'node:fs';
import path from 'node:path';
import { missingVietnamese, readFont } from './font.mjs';
import { buildZip, listFiles, loadConfig, ROOT, scanSecrets, sha256 } from './lib.mjs';

export const VIDEO_DIR = path.join(ROOT, 'video');
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
const STYLE_ID = /^[a-z][a-z0-9_-]{0,39}$/;
const COLOR = /^#[0-9A-Fa-f]{6}$/;
const GROUPS = ['hook', 'opening', 'price', 'info', 'compare', 'ending'];
/** Ký hiệu phông được phép thiếu (vd «₫»: người bán hay viết «đ» / «k»; xuất video tự lấy phông dự phòng). */
const OPTIONAL_GLYPHS = new Set(['₫']);
const ASR_HOSTS = ['huggingface.co'];

function readJson(file, problems, label) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    problems.push(`${label}: không đọc được JSON (${err.message}).`);
    return null;
  }
}

function wavSeconds(file) {
  const data = fs.readFileSync(file);
  if (data.length < 44 || data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WAVE') return null;
  // Tìm khối «fmt » và «data» (bỏ qua khối phụ nếu có).
  let at = 12;
  let rate = 0;
  let block = 0;
  while (at + 8 <= data.length) {
    const id = data.toString('ascii', at, at + 4);
    const size = data.readUInt32LE(at + 4);
    if (id === 'fmt ') {
      rate = data.readUInt32LE(at + 12);
      block = data.readUInt16LE(at + 20);
    }
    if (id === 'data') return rate && block ? size / block / rate : null;
    at += 8 + size + (size % 2);
  }
  return null;
}

// ── Phông ──────────────────────────────────────────────────────────────────────────────────

function checkFonts(problems) {
  const dir = path.join(VIDEO_DIR, 'fonts');
  const manifest = readJson(path.join(dir, 'fonts.json'), problems, 'video/fonts/fonts.json');
  if (!manifest) return null;
  const listed = new Set(['fonts.json', 'README.txt']);
  for (const family of manifest.families ?? []) {
    const where = `video/fonts ${family.family}`;
    if (!/^[A-Za-z0-9 ]{1,60}$/.test(family.family ?? '')) problems.push(`${where}: tên họ phông chỉ gồm chữ, số, khoảng trắng.`);
    if (family.license !== 'OFL-1.1') problems.push(`${where}: chỉ nhận phông SIL OFL 1.1.`);
    const license = path.join(dir, family.license_file ?? '');
    if (!family.license_file || !fs.existsSync(license) || !/SIL Open Font License/i.test(fs.readFileSync(license, 'utf8'))) problems.push(`${where}: thiếu tệp giấy phép OFL.txt của chính phông.`);
    else listed.add(family.license_file);
    if (!Array.isArray(family.files) || !family.files.length) problems.push(`${where}: chưa có tệp phông.`);
    for (const file of family.files ?? []) {
      listed.add(file.file);
      const full = path.join(dir, file.file ?? '');
      if (!/\.ttf$/.test(file.file ?? '') || !fs.existsSync(full)) {
        problems.push(`${where}: không thấy tệp «${file.file}» (.ttf tĩnh, không dùng phông biến thiên).`);
        continue;
      }
      let font;
      try {
        font = readFont(full);
      } catch (err) {
        problems.push(`${where}: «${file.file}» ${err.message}.`);
        continue;
      }
      if (font.variable) problems.push(`${where}: «${file.file}» là phông biến thiên (libass của bộ xuất chỉ chọn đúng độ đậm với phông tĩnh).`);
      if (font.family !== family.family) problems.push(`${where}: «${file.file}» khai họ «${font.family}».`);
      if (font.weight !== file.weight) problems.push(`${where}: «${file.file}» độ đậm thật ${font.weight}, khai ${file.weight}.`);
      const missing = missingVietnamese(font).filter((char) => !OPTIONAL_GLYPHS.has(char));
      if (missing.length) problems.push(`${where}: «${file.file}» thiếu chữ tiếng Việt: ${missing.join(' ')}`);
    }
  }
  const { files } = listFiles(dir);
  for (const file of files) if (!listed.has(file.rel)) problems.push(`video/fonts: tệp «${file.rel}» không có trong fonts.json (bỏ đi hoặc khai vào).`);
  return { manifest, files };
}

// ── Tiếng hiệu ứng ─────────────────────────────────────────────────────────────────────────

function checkSfx(problems) {
  const dir = path.join(VIDEO_DIR, 'sfx');
  const manifest = readJson(path.join(dir, 'sfx.json'), problems, 'video/sfx/sfx.json');
  if (!manifest) return null;
  if (manifest.license !== 'CC0-1.0') problems.push('video/sfx: chỉ nhận tiếng CC0 (CNV tự tổng hợp, tools/sfx-make.mjs).');
  if (!fs.existsSync(path.join(dir, 'LICENSE.txt'))) problems.push('video/sfx: thiếu LICENSE.txt (ghi nguồn gốc + CC0).');
  const ids = new Set();
  const listed = new Set(['sfx.json', 'LICENSE.txt']);
  for (const sound of manifest.sounds ?? []) {
    const where = `video/sfx ${sound.id}`;
    if (!STYLE_ID.test(sound.id ?? '') || ids.has(sound.id)) problems.push(`${where}: mã trùng hoặc sai (chữ thường, số, _ -).`);
    ids.add(sound.id);
    if (typeof sound.label !== 'string' || !sound.label.trim() || sound.label.length > 60) problems.push(`${where}: thiếu nhãn (≤ 60 ký tự).`);
    listed.add(sound.file);
    const full = path.join(dir, sound.file ?? '');
    if (!/\.wav$/.test(sound.file ?? '') || !fs.existsSync(full)) {
      problems.push(`${where}: không thấy tệp WAV «${sound.file}».`);
      continue;
    }
    const seconds = wavSeconds(full);
    if (seconds === null) problems.push(`${where}: «${sound.file}» không phải WAV PCM.`);
    else if (Math.abs(seconds - sound.seconds) > 0.03) problems.push(`${where}: dài ${seconds.toFixed(3)} giây, khai ${sound.seconds}.`);
    if (seconds !== null && seconds > 3) problems.push(`${where}: tiếng hiệu ứng tối đa 3 giây.`);
  }
  const { files } = listFiles(dir);
  for (const file of files) if (!listed.has(file.rel)) problems.push(`video/sfx: tệp «${file.rel}» không có trong sfx.json.`);
  return { manifest, files };
}

// ── Phong cách ─────────────────────────────────────────────────────────────────────────────

/** Trang mẫu chạy trong cửa sổ dựng cô lập của app (chặn mạng); vẫn kiểm để mẫu không dựa vào thứ bị chặn. */
const FORBIDDEN = [
  [/\bfetch\s*\(/, 'gọi mạng (fetch)'],
  [/XMLHttpRequest|WebSocket|EventSource/, 'gọi mạng'],
  [/\bimport\s*\(|<link\b|@import\b/i, 'nạp tệp ngoài'],
  [/<iframe\b|<object\b|<embed\b/i, 'khung nhúng'],
  [/\beval\s*\(|new\s+Function\b/, 'chạy chuỗi thành mã'],
  [/(localStorage|sessionStorage|indexedDB|document\.cookie)/, 'lưu trữ của trình duyệt'],
  [/\bDate\.now\s*\(|new Date\s*\(/, 'giờ thật (dùng t của cwFrame)'],
];

function checkStyles(problems, fontFamilies) {
  const dir = path.join(VIDEO_DIR, 'styles');
  const styles = [];
  const ids = fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => fs.statSync(path.join(dir, name)).isDirectory()).sort() : [];
  for (const id of ids) {
    const where = `video/styles/${id}`;
    const base = path.join(dir, id);
    const style = readJson(path.join(base, 'style.json'), problems, `${where}/style.json`);
    if (!style) continue;
    if (style.id !== id || !STYLE_ID.test(id)) problems.push(`${where}: «id» phải trùng tên thư mục (chữ thường, số, _ -).`);
    if (!Number.isInteger(style.version) || style.version < 1) problems.push(`${where}: «version» là số nguyên ≥ 1 (tăng khi sửa mẫu).`);
    for (const [key, max] of [['label', 60], ['hint', 160], ['rules', 2000]]) if (typeof style[key] !== 'string' || !style[key].trim() || style[key].length > max) problems.push(`${where}: «${key}» trống hoặc dài quá ${max} ký tự.`);
    if (!GROUPS.includes(style.group)) problems.push(`${where}: «group» ∈ ${GROUPS.join(', ')}.`);
    if (typeof style.seconds !== 'number' || style.seconds < 1 || style.seconds > 30) problems.push(`${where}: «seconds» 1–30.`);
    const keys = new Set();
    if (!Array.isArray(style.fields) || !style.fields.length || style.fields.length > 8) problems.push(`${where}: 1–8 ô chữ.`);
    for (const field of style.fields ?? []) {
      if (!/^[a-z][a-z0-9_]{0,39}$/.test(field.key ?? '') || keys.has(field.key)) problems.push(`${where}: ô «${field.key}» sai mã hoặc trùng.`);
      keys.add(field.key);
      if (typeof field.label !== 'string' || typeof field.placeholder !== 'string' || !Number.isInteger(field.max) || field.max < 1 || field.max > 120) problems.push(`${where}: ô «${field.key}» thiếu nhãn / chữ mẫu / max (1–120).`);
      if (typeof field.placeholder === 'string' && field.placeholder.length > field.max) problems.push(`${where}: chữ mẫu của «${field.key}» dài hơn max.`);
    }
    if (!Array.isArray(style.palettes) || !style.palettes.length) problems.push(`${where}: cần ít nhất một bộ màu.`);
    for (const palette of style.palettes ?? []) {
      if (!STYLE_ID.test(palette.id ?? '') || palette.id === 'brand') problems.push(`${where}: bộ màu «${palette.id}» sai mã («brand» do app tự thêm).`);
      for (const key of ['bg', 'bg2', 'accent', 'ink', 'text']) if (!COLOR.test(palette[key] ?? '')) problems.push(`${where}: bộ màu «${palette.id}» thiếu màu «${key}» (#RRGGBB).`);
    }
    for (const role of ['display', 'body', 'number']) {
      const family = style.fonts?.[role];
      if (family && !fontFamilies.has(family)) problems.push(`${where}: phông «${family}» không có trong video/fonts.`);
    }
    const templateFile = path.join(base, 'template.html');
    const previewFile = path.join(base, 'preview.jpg');
    if (!fs.existsSync(templateFile)) {
      problems.push(`${where}: thiếu template.html.`);
      continue;
    }
    const template = fs.readFileSync(templateFile, 'utf8');
    if (template.length > 100_000) problems.push(`${where}: template.html dài quá 100.000 ký tự.`);
    for (const [pattern, why] of FORBIDDEN) if (pattern.test(template)) problems.push(`${where}: template.html có ${why}.`);
    const urls = template.match(/https?:\/\/[^\s"'<>)]+/g) ?? [];
    for (const url of urls) if (!url.startsWith('http://www.w3.org/')) problems.push(`${where}: template.html trỏ ra ngoài (${url}).`);
    if (!/cwKit/.test(template) || !/cwFrame/.test(template)) problems.push(`${where}: template.html phải dùng window.cwKit và window.cwFrame (khung sườn của app).`);
    for (const field of style.fields ?? []) if (!template.includes(`'${field.key}'`)) problems.push(`${where}: template.html không dùng ô «${field.key}».`);
    if (!fs.existsSync(previewFile)) problems.push(`${where}: thiếu preview.jpg (ảnh xem trước 270×480).`);
    else {
      const data = fs.readFileSync(previewFile);
      if (data[0] !== 0xff || data[1] !== 0xd8) problems.push(`${where}: preview.jpg không phải JPEG.`);
      if (data.length > 80 * 1024) problems.push(`${where}: preview.jpg lớn quá 80 KB.`);
    }
    const extra = listFiles(base).files.filter((file) => !['style.json', 'template.html', 'preview.jpg'].includes(file.rel));
    for (const file of extra) problems.push(`${where}: tệp thừa «${file.rel}».`);
    styles.push({ id, style, files: listFiles(base).files.map((file) => ({ rel: `${id}/${file.rel}`, abs: file.abs })) });
  }
  // Tên nền tảng (vd mạng video ngắn) được phép như ở bộ kỹ năng (`skills_scan_allow_words` của library.config.json).
  const config = loadConfig({ needKey: false });
  const secrets = scanSecrets(
    styles.flatMap((entry) => entry.files.map((file) => ({ ...file, size: fs.statSync(file.abs).size }))),
    config.scan_allow ?? [],
    config.skills_scan_allow_words ?? [],
  );
  for (const line of secrets) problems.push(`video/styles bí mật? ${line}`);
  return styles;
}

// ── Model chép lời ─────────────────────────────────────────────────────────────────────────

function checkAsr(problems, asr) {
  if (!asr) return;
  const where = 'video/kit.json asr';
  if (!SEGMENT.test(asr.version ?? '')) problems.push(`${where}: «version» chỉ gồm chữ, số, . _ -.`);
  for (const key of ['label', 'description', 'license', 'source']) if (typeof asr[key] !== 'string' || !asr[key].trim()) problems.push(`${where}: thiếu «${key}».`);
  const names = new Set();
  for (const file of asr.files ?? []) {
    if (!SEGMENT.test(file.name ?? '') || names.has(file.name)) problems.push(`${where}: tên tệp «${file.name}» sai hoặc trùng.`);
    names.add(file.name);
    let url = null;
    try {
      url = new URL(file.url);
    } catch {
      problems.push(`${where}: link «${file.url}» không hợp lệ.`);
    }
    if (url && (url.protocol !== 'https:' || !ASR_HOSTS.includes(url.hostname))) problems.push(`${where}: chỉ tải https từ ${ASR_HOSTS.join(', ')}.`);
    if (url && !/\/resolve\/[0-9a-f]{40}\//.test(url.pathname)) problems.push(`${where}: link phải ghim commit (…/resolve/<40 ký tự hex>/…).`);
    if (!/^[a-f0-9]{64}$/.test(file.sha256 ?? '')) problems.push(`${where}: «sha256» phải là 64 ký tự hex.`);
    if (!Number.isInteger(file.bytes) || file.bytes <= 0 || file.bytes > 400 * 1024 * 1024) problems.push(`${where}: «bytes» không hợp lệ.`);
  }
  for (const name of ['encoder.onnx', 'decoder.onnx', 'config.json', 'generation_config.json', 'vocab.json', 'merges.txt', 'added_tokens.json']) if (!names.has(name)) problems.push(`${where}: thiếu tệp «${name}» (app cần đủ để chạy).`);
}

/** Kiểm cả bộ làm video. Trả phần đã đọc (cho build) + lỗi. */
export function loadVideoKit() {
  const problems = [];
  const kitFile = path.join(VIDEO_DIR, 'kit.json');
  if (!fs.existsSync(kitFile)) return { kit: null, problems };
  const kit = readJson(kitFile, problems, 'video/kit.json');
  if (!kit) return { kit: null, problems };
  const fonts = checkFonts(problems);
  const sfx = checkSfx(problems);
  const families = new Set((fonts?.manifest.families ?? []).map((family) => family.family));
  const styles = checkStyles(problems, families);
  checkAsr(problems, kit.asr);
  for (const id of ['fonts', 'styles', 'sfx']) for (const key of ['label', 'description', 'license']) if (typeof kit[id]?.[key] !== 'string' || !kit[id][key].trim()) problems.push(`video/kit.json ${id}: thiếu «${key}».`);
  if (!SEGMENT.test(kit.styles?.version ?? '')) problems.push('video/kit.json styles: thiếu «version» (đổi khi sửa phong cách).');
  return { kit, fonts, sfx, styles, problems };
}

/**
 * Đóng 3 gói zip (cùng nội dung thì cùng byte) vào `dist/`, trả `content.video_kit` (link ghim tag qua `archiveUrl`) và tên
 * các tệp cần đính kèm release.
 */
export function buildVideoKit(loaded, dist, archiveUrl) {
  const { kit, fonts, sfx, styles } = loaded;
  const packages = [];
  const attachments = [];
  const pack = (id, version, files, unpacked) => {
    const zip = buildZip(files);
    const sum = sha256(zip);
    const name = `video-${id}-${sum.slice(0, 12)}.zip`;
    fs.writeFileSync(path.join(dist, name), zip);
    attachments.push(name);
    packages.push({
      id,
      version: `${version}-${sum.slice(0, 8)}`,
      label: kit[id].label,
      description: kit[id].description,
      license: kit[id].license,
      format: 'zip',
      files: [{ name, url: archiveUrl(name), sha256: sum, bytes: zip.length }],
      unpacked_bytes: unpacked,
    });
    return zip.length;
  };
  const size = (files) => files.reduce((sum, file) => sum + (file.data ? file.data.length : fs.statSync(file.abs).size), 0);
  const fontFiles = fonts.files.map((file) => ({ rel: file.rel, abs: file.abs }));
  pack('fonts', fonts.manifest.version, fontFiles, size(fontFiles));
  const manifest = {
    format: 1,
    styles: styles.map(({ id, style }) => ({ ...style, template: `${id}/template.html`, preview: `${id}/preview.jpg` })),
  };
  const styleFiles = [{ rel: 'styles.json', data: Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8') }, ...styles.flatMap((entry) => entry.files)].sort((a, b) => a.rel.localeCompare(b.rel));
  pack('styles', kit.styles.version, styleFiles, size(styleFiles));
  const sfxFiles = sfx.files.map((file) => ({ rel: file.rel, abs: file.abs }));
  pack('sfx', sfx.manifest.version, sfxFiles, size(sfxFiles));
  if (kit.asr) {
    packages.push({
      id: 'asr',
      version: kit.asr.version,
      label: kit.asr.label,
      description: kit.asr.description,
      license: kit.asr.license,
      format: 'files',
      files: kit.asr.files,
    });
  }
  return { content: { packages }, attachments };
}
