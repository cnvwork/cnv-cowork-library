#!/usr/bin/env node
// Tải thử bộ dựng video ghim ở video/engine.json, khớp SHA-256 + số byte (trước khi build danh mục có bảng ghim mới).
// Tải nhiều (~400 MB đủ 4 nền tảng): chỉ chạy khi đổi bản dựng.
//   node tools/video-verify.mjs                (mọi nền tảng)
//   node tools/video-verify.mjs darwin-arm64   (một nền tảng)
import crypto from 'node:crypto';
import { loadVideoEngine } from './lib.mjs';

const { engine, problems } = loadVideoEngine();
if (problems.length || !engine) {
  for (const line of problems) console.error(`✖ ${line}`);
  process.exit(1);
}
const only = process.argv[2];
let failed = false;
for (const [platform, build] of Object.entries(engine.builds)) {
  if (only && platform !== only) continue;
  for (const file of build.download.files) {
    const response = await fetch(file.url, { redirect: 'follow' });
    if (!response.ok || !response.body) {
      failed = true;
      console.error(`✖ ${platform} ${file.name}: HTTP ${response.status}`);
      continue;
    }
    const hash = crypto.createHash('sha256');
    let bytes = 0;
    for await (const chunk of response.body) {
      hash.update(chunk);
      bytes += chunk.length;
    }
    const sha = hash.digest('hex');
    if (sha !== file.sha256 || bytes !== file.bytes) {
      failed = true;
      console.error(`✖ ${platform} ${file.name}: tải về ${bytes} byte, sha256 ${sha} — ghim ${file.bytes} byte, ${file.sha256}`);
    } else {
      console.log(`✔ ${platform} ${file.name}: ${(bytes / 1024 / 1024).toFixed(1)} MB, khớp sha256`);
    }
  }
}
process.exit(failed ? 1 : 0);
