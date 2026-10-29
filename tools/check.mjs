#!/usr/bin/env node
// Kiểm mọi kịch bản, bộ kỹ năng và nhật ký «Có gì mới» trước khi đóng gói: manifest, luật tên tệp (giống app), trần dung lượng, quét bí mật.
//   node tools/check.mjs            (in lỗi, thoát mã 1 nếu có)
import { imageMetadataProblems, listFiles, loadChangelog, loadConfig, loadScenario, loadSkills, scanSecrets, scenarioIds } from './lib.mjs';

const config = loadConfig({ needKey: false });
let failed = false;
for (const id of scenarioIds()) {
  const { dir, manifest, problems } = loadScenario(id, config);
  const { files, problems: fileProblems, total } = listFiles(dir);
  const secrets = scanSecrets(files, config.scan_allow ?? []);
  const all = [...problems, ...fileProblems, ...imageMetadataProblems(files), ...secrets.map((line) => `bí mật? ${line}`)];
  if (all.length) {
    failed = true;
    console.error(`✖ ${id}`);
    for (const line of all) console.error(`   ${line}`);
  } else {
    console.log(`✔ ${id} ${manifest.version}: ${files.length} tệp, ${(total / 1024).toFixed(0)} KB`);
  }
}
const skills = loadSkills(config);
if (skills.problems.length) {
  failed = true;
  console.error('✖ skills');
  for (const line of skills.problems) console.error(`   ${line}`);
} else {
  console.log(`✔ skills: ${skills.entries.length} kỹ năng`);
}
const changelog = loadChangelog();
if (changelog.problems.length) {
  failed = true;
  console.error('✖ changelog');
  for (const line of changelog.problems) console.error(`   ${line}`);
} else {
  console.log(`✔ changelog: ${changelog.entries.length} bản đè nhật ký của app`);
}
process.exit(failed ? 1 : 0);
