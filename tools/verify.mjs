#!/usr/bin/env node
// Kiểm một danh mục đã phát hành giống app làm: chữ ký, rồi sha256 + kích thước từng gói (và bộ kỹ năng) cạnh catalog.json.
//   node tools/verify.mjs [dist/catalog.json]
import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, openCatalog, readJson, sha256 } from './lib.mjs';

const file = path.resolve(process.argv[2] ?? 'dist/catalog.json');
const payload = openCatalog(readJson(file), loadConfig().public_key);
let failed = false;
for (const scenario of payload.scenarios) {
  const zipPath = path.join(path.dirname(file), scenario.archive.url.split('/').pop());
  const data = fs.existsSync(zipPath) ? fs.readFileSync(zipPath) : null;
  const ok = data && data.length === scenario.archive.bytes && sha256(data) === scenario.archive.sha256;
  if (!ok) failed = true;
  console.log(`${ok ? '✔' : '✖'} ${scenario.id} ${scenario.version} (${scenario.archive.url})`);
}
const pack = payload.content?.skills;
if (pack) {
  const packPath = path.join(path.dirname(file), pack.url.split('/').pop());
  const data = fs.existsSync(packPath) ? fs.readFileSync(packPath) : null;
  const ok = data && data.length === pack.bytes && sha256(data) === pack.sha256 && JSON.parse(data.toString('utf8')).skills.length === pack.count;
  if (!ok) failed = true;
  console.log(`${ok ? '✔' : '✖'} bộ kỹ năng: ${pack.count} kỹ năng (${pack.url})`);
}
console.log(`Chữ ký đúng, ký lúc ${payload.issued_at}.`);
process.exit(failed ? 1 : 0);
