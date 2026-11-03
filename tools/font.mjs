// Đọc tệp phông TrueType / OpenType tối thiểu (không cần thư viện ngoài): tên họ phông, độ đậm, bảng ký tự (cmap) — để
// `check` kiểm phông trong bộ làm video có ĐỦ chữ tiếng Việt có dấu trước khi đóng gói.
import fs from 'node:fs';

/** Mọi chữ cái tiếng Việt (hoa + thường), chữ số và dấu câu hay dùng trong video bán hàng. */
export const VIETNAMESE_TEXT =
  'aàáảãạăằắẳẵặâầấẩẫậbcdđeèéẻẽẹêềếểễệghiìíỉĩịklmnoòóỏõọôồốổỗộơờớởỡợpqrstuùúủũụưừứửữựvxyỳýỷỹỵ' +
  'AÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬBCDĐEÈÉẺẼẸÊỀẾỂỄỆGHIÌÍỈĨỊKLMNOÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢPQRSTUÙÚỦŨỤƯỪỨỬỮỰVXYỲÝỶỸỴ' +
  'fjwzFJWZ0123456789.,:;!?%+-()/&"\'₫';

function tables(buf) {
  const count = buf.readUInt16BE(4);
  const out = new Map();
  for (let i = 0; i < count; i += 1) {
    const at = 12 + i * 16;
    out.set(buf.toString('latin1', at, at + 4), { offset: buf.readUInt32BE(at + 8), length: buf.readUInt32BE(at + 12) });
  }
  return out;
}

function cmapCodes(buf, table) {
  const codes = new Set();
  const subtables = buf.readUInt16BE(table.offset + 2);
  for (let i = 0; i < subtables; i += 1) {
    const at = table.offset + 4 + i * 8;
    const platform = buf.readUInt16BE(at);
    const encoding = buf.readUInt16BE(at + 2);
    const offset = table.offset + buf.readUInt32BE(at + 4);
    if (!(platform === 3 && (encoding === 1 || encoding === 10)) && platform !== 0) continue;
    const format = buf.readUInt16BE(offset);
    if (format === 4) {
      const segments = buf.readUInt16BE(offset + 6) / 2;
      const ends = offset + 14;
      const starts = ends + segments * 2 + 2;
      const deltas = starts + segments * 2;
      const ranges = deltas + segments * 2;
      for (let s = 0; s < segments; s += 1) {
        const end = buf.readUInt16BE(ends + s * 2);
        const start = buf.readUInt16BE(starts + s * 2);
        const delta = buf.readInt16BE(deltas + s * 2);
        const rangeOffset = buf.readUInt16BE(ranges + s * 2);
        for (let c = start; c <= end && c !== 0xffff; c += 1) {
          let glyph;
          if (rangeOffset === 0) glyph = (c + delta) & 0xffff;
          else {
            const glyphAt = ranges + s * 2 + rangeOffset + (c - start) * 2;
            glyph = buf.readUInt16BE(glyphAt);
            if (glyph) glyph = (glyph + delta) & 0xffff;
          }
          if (glyph) codes.add(c);
        }
      }
    } else if (format === 12) {
      const groups = buf.readUInt32BE(offset + 12);
      for (let g = 0; g < groups; g += 1) {
        const at2 = offset + 16 + g * 12;
        const start = buf.readUInt32BE(at2);
        const end = buf.readUInt32BE(at2 + 4);
        const glyph = buf.readUInt32BE(at2 + 8);
        for (let c = start; c <= end; c += 1) if (glyph + (c - start)) codes.add(c);
      }
    }
  }
  return codes;
}

function nameRecord(buf, table, id) {
  const count = buf.readUInt16BE(table.offset + 2);
  const strings = table.offset + buf.readUInt16BE(table.offset + 4);
  let fallback = null;
  for (let i = 0; i < count; i += 1) {
    const at = table.offset + 6 + i * 12;
    const platform = buf.readUInt16BE(at);
    const nameId = buf.readUInt16BE(at + 6);
    if (nameId !== id) continue;
    const length = buf.readUInt16BE(at + 8);
    const offset = strings + buf.readUInt16BE(at + 10);
    const raw = buf.subarray(offset, offset + length);
    if (platform === 3 || platform === 0) {
      let text = '';
      for (let k = 0; k + 1 < raw.length; k += 2) text += String.fromCharCode(raw.readUInt16BE(k));
      return text;
    }
    fallback ??= raw.toString('latin1');
  }
  return fallback;
}

/** Thông tin một tệp phông: họ (ưu tiên tên họ kiểu chữ 16 / 1), kiểu (17 / 2), độ đậm OS/2, tập mã ký tự. */
export function readFont(file) {
  const buf = fs.readFileSync(file);
  const tag = buf.toString('latin1', 0, 4);
  if (tag !== '\u0000\u0001\u0000\u0000' && tag !== 'OTTO' && tag !== 'true') throw new Error('không phải tệp phông TrueType / OpenType');
  const all = tables(buf);
  const name = all.get('name');
  const os2 = all.get('OS/2');
  const cmap = all.get('cmap');
  if (!name || !cmap) throw new Error('phông thiếu bảng name / cmap');
  const fvar = all.has('fvar');
  return {
    family: nameRecord(buf, name, 16) ?? nameRecord(buf, name, 1),
    style: nameRecord(buf, name, 17) ?? nameRecord(buf, name, 2),
    weight: os2 ? buf.readUInt16BE(os2.offset + 4) : 400,
    variable: fvar,
    codes: cmapCodes(buf, cmap),
  };
}

/** Ký tự tiếng Việt phông còn thiếu (rỗng = đủ). */
export function missingVietnamese(font) {
  return [...new Set([...VIETNAMESE_TEXT])].filter((char) => !font.codes.has(char.codePointAt(0)));
}
