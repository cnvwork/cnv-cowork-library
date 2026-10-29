#!/usr/bin/env node
// Tạo cặp khoá Ed25519 ký danh mục Thư viện (CNV chạy MỘT lần). Khoá bí mật cất vào Keychain của macOS (mục
// "CNV Cowork library signing key"), KHÔNG ghi vào repo; khoá công khai ghi vào library.config.json và phải ghim
// vào app (cnv-cowork `src/main/services/library/catalog.ts`, LIBRARY_PUBLIC_KEY).
//   node tools/keygen.mjs            (từ chối nếu Keychain đã có khoá: đổi khoá là mọi bản app cũ không đọc được danh mục mới)
//   node tools/keygen.mjs --force
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { KEYCHAIN_SERVICE, ROOT } from './lib.mjs';

let exists = false;
try {
  execFileSync('security', ['find-generic-password', '-s', KEYCHAIN_SERVICE], { stdio: 'ignore' });
  exists = true;
} catch {
  exists = false;
}
if (exists && !process.argv.includes('--force')) {
  console.error(`Keychain đã có "${KEYCHAIN_SERVICE}". Không tạo đè (bản app đã phát hành ghim khoá công khai cũ).`);
  process.exit(1);
}
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
const secret = privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64');
execFileSync('security', ['add-generic-password', '-U', '-a', 'cnv', '-s', KEYCHAIN_SERVICE, '-w', secret]);
const pem = publicKey.export({ format: 'pem', type: 'spki' }).toString().trim();
const configPath = path.join(ROOT, 'library.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
config.public_key = pem;
fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Đã cất khoá bí mật vào Keychain ("${KEYCHAIN_SERVICE}"). Sao lưu nó (vd 1Password): mất khoá là không ký được danh mục mới.`);
console.log('Khoá công khai (đã ghi vào library.config.json, ghim vào app):');
console.log(pem);
