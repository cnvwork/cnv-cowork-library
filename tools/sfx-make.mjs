#!/usr/bin/env node
// Tự tổng hợp bộ tiếng hiệu ứng của bộ làm video (video/sfx/) bằng ffmpeg — chỉ từ công thức toán (sóng sin, tiếng ồn
// giả ngẫu nhiên có hạt giống, bộ lọc một cực), KHÔNG dùng bản ghi âm của ai. CNV giữ quyền và phát hành CC0 (video/sfx/
// LICENSE.txt). Chạy lại ra đúng byte như cũ với cùng bản ffmpeg; mỗi tiếng: WAV 48 kHz mono 16-bit, đỉnh -2 dBFS, cuối
// tắt dần 15 ms cho khỏi «tách».
//   node tools/sfx-make.mjs            (ffmpeg trong PATH, hoặc đặt FFMPEG=<đường dẫn>)
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib.mjs';

const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const OUT = path.join(ROOT, 'video', 'sfx');
const RATE = 48_000;

/** Bộ lọc thông thấp một cực, tần số cắt `fc` (biểu thức theo t), trạng thái ở biến `slot`. */
const lowpass = (input, fc, slot) => `st(${slot}, ld(${slot}) + (1-exp(-2*PI*(${fc})/${RATE}))*((${input})-ld(${slot})))`;
const noise = (seed = 9) => `(2*random(${seed})-1)`;
/** Tắt dần theo hàm mũ từ lúc `at`. */
const hit = (at, decay) => `gte(t,${at})*exp(-${decay}*(t-${at}))*(1-exp(-1500*(t-${at})))`;
/** Nốt dừng mềm ở giây `at` (thay cho cắt cụt gây tiếng tách). */
const until = (at) => `exp(-600*max(0,t-${at}))`;
const tone = (freq, at = 0) => `sin(2*PI*${freq}*(t-${at}))`;
/** Dẫn đầu mềm (tránh tiếng tách ở đầu). */
const attack = (rate = 900) => `(1-exp(-${rate}*t))`;

/**
 * Mỗi tiếng: biểu thức aevalsrc (một kênh) + bộ lọc sau. `vars` dùng biến 0–7 cho trạng thái lọc; random dùng biến 9.
 * Nhãn / thẻ là thứ app hiện cho người dùng và trợ lý chọn.
 */
export const SFX = [
  {
    id: 'pop',
    label: 'Bụp (chữ bật lên)',
    tags: ['text', 'ui'],
    seconds: 0.2,
    expr: `${attack(1500)}*exp(-28*t)*sin(2*PI*(240*t+760*(1-exp(-36*t))/36)) + 0.12*${noise()}*exp(-420*t)`,
  },
  {
    id: 'click',
    label: 'Tách nhẹ',
    tags: ['ui', 'text'],
    seconds: 0.06,
    expr: `(0.55*${tone(2600)}+0.45*${noise()})*exp(-170*t)*${attack(4000)}`,
    after: 'highpass=f=900',
  },
  {
    id: 'tick',
    label: 'Tích tắc (đếm ngược)',
    tags: ['countdown'],
    seconds: 0.09,
    expr: `${tone(1900)}*exp(-85*t)*${attack(3000)} + 0.22*${noise()}*exp(-650*t)`,
  },
  {
    id: 'tock',
    label: 'Tắc (nhịp trầm)',
    tags: ['countdown'],
    seconds: 0.11,
    expr: `${tone(1150)}*exp(-65*t)*${attack(3000)} + 0.18*${noise()}*exp(-520*t)`,
  },
  {
    id: 'whoosh',
    label: 'Vút (chuyển cảnh)',
    tags: ['transition'],
    seconds: 0.7,
    expr: `${lowpass(lowpass(noise(), '250+3200*pow(sin(PI*t/0.7),2)', 0), '400+3600*pow(sin(PI*t/0.7),2)', 1)}*pow(sin(PI*t/0.7),2)*2.2`,
    after: 'highpass=f=160',
  },
  {
    id: 'swipe',
    label: 'Lướt nhanh',
    tags: ['transition', 'ui'],
    seconds: 0.3,
    expr: `${lowpass(noise(), '1200+6000*t/0.3', 0)}*pow(sin(PI*t/0.3),2)*1.6`,
    after: 'highpass=f=700',
  },
  {
    id: 'riser',
    label: 'Dồn lên (trước khi lộ giá)',
    tags: ['transition', 'impact'],
    seconds: 1.6,
    expr: `(${lowpass(noise(), '300*exp(3.1*t/1.6)', 0)}*1.3 + 0.18*sin(2*PI*(220*t+330*t*t/1.6)))*pow(t/1.6,2)`,
    after: 'highpass=f=120',
  },
  {
    id: 'boom',
    label: 'Bùm (nhấn mạnh)',
    tags: ['impact'],
    seconds: 1.2,
    expr: `tanh(1.6*(sin(2*PI*(38*t+42*(1-exp(-6*t))/6))*exp(-3.4*t)*${attack(600)} + 0.6*${lowpass(noise(), 420, 0)}*exp(-12*t)))`,
  },
  {
    id: 'kick',
    label: 'Trống (nhịp)',
    tags: ['impact', 'beat'],
    seconds: 0.45,
    expr: `sin(2*PI*(46*t+110*(1-exp(-32*t))/32))*exp(-7*t)*${attack(2500)} + 0.15*${noise()}*exp(-700*t)`,
  },
  {
    id: 'clap',
    label: 'Vỗ tay',
    tags: ['beat', 'success'],
    seconds: 0.35,
    expr: `${lowpass(`${noise()}-${lowpass(noise(11), 700, 1)}`, 2600, 0)}*(${hit(0, 260)}+${hit(0.011, 260)}+0.9*${hit(0.023, 240)}+0.45*${hit(0.03, 16)})*2.4`,
  },
  {
    id: 'ding',
    label: 'Ting',
    tags: ['success', 'ui'],
    seconds: 1.4,
    expr: `${attack(800)}*(${tone(1320)}*exp(-3.6*t) + 0.45*${tone(2640 * 1.003)}*exp(-5.2*t) + 0.2*${tone(3990)}*exp(-8*t))`,
  },
  {
    id: 'success',
    label: 'Xong rồi (ba nốt)',
    tags: ['success'],
    seconds: 1.0,
    expr: `${attack(700)}*(0.9*${tone(1046.5)}*${hit(0, 6)} + 0.9*${tone(1318.5, 0.09)}*${hit(0.09, 6)} + ${tone(1568, 0.18)}*${hit(0.18, 5)} + 0.25*${tone(3136, 0.18)}*${hit(0.18, 9)})`,
  },
  {
    id: 'cash',
    label: 'Ting ting (tiền về)',
    tags: ['money', 'success'],
    seconds: 0.9,
    expr: `0.7*sin(2*PI*180*t)*exp(-26*t) + 0.5*${lowpass(noise(), 5000, 0)}*exp(-90*t) + 0.8*${tone(2093, 0.06)}*${hit(0.06, 7)} + 0.8*${tone(2637, 0.13)}*${hit(0.13, 6)} + 0.25*${tone(5274, 0.13)}*${hit(0.13, 12)}`,
  },
  {
    id: 'coin',
    label: 'Đồng xu',
    tags: ['money', 'ui'],
    seconds: 0.45,
    expr: `${attack(2000)}*((${tone(988)}+0.33*${tone(2964)})*${until(0.075)} + (${tone(1319, 0.075)}+0.33*${tone(3957, 0.075)})*${hit(0.075, 9)})*0.8`,
  },
  {
    id: 'sparkle',
    label: 'Lấp lánh',
    tags: ['ui', 'success'],
    seconds: 0.9,
    expr: [
      [0, 2637],
      [0.08, 3136],
      [0.17, 3520],
      [0.29, 4186],
      [0.4, 3951],
      [0.55, 4699],
    ]
      .map(([at, freq], index) => `${(1 - index * 0.11).toFixed(2)}*${tone(freq, at)}*${hit(at, 24)}`)
      .join(' + '),
  },
  {
    id: 'typing',
    label: 'Gõ phím',
    tags: ['text', 'ui'],
    seconds: 0.62,
    expr: [0, 0.09, 0.16, 0.27, 0.33, 0.45, 0.52]
      .map((at, index) => `(0.6*${noise()}+0.4*${tone(3000 + index * 170, at)})*${hit(at, 260)}`)
      .join(' + '),
    after: 'highpass=f=600',
  },
  {
    id: 'shutter',
    label: 'Chụp ảnh',
    tags: ['ui'],
    seconds: 0.3,
    expr: `(${noise()}-${lowpass(noise(11), 1800, 0)})*(${hit(0, 120)}+0.8*${hit(0.12, 140)}) + 0.3*${tone(1500)}*${hit(0, 220)}`,
  },
  {
    id: 'notify',
    label: 'Báo tin',
    tags: ['ui'],
    seconds: 0.5,
    expr: `${attack(900)}*((${tone(880)}+0.3*${tone(1760)})*${hit(0, 12)}*${until(0.12)} + (${tone(1320, 0.12)}+0.3*${tone(2640, 0.12)})*${hit(0.12, 10)})`,
  },
];

function run(args) {
  return execFileSync(FFMPEG, ['-hide_banner', '-nostdin', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

/** Đỉnh (dBFS) của tệp: bộ lọc volumedetect ghi ra stderr. */
function maxVolume(file) {
  const probe = spawnSync(FFMPEG, ['-hide_banner', '-nostdin', '-i', file, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
  const match = /max_volume:\s*(-?[\d.]+) dB/.exec(probe.stderr ?? '');
  if (!match) throw new Error(`không đo được đỉnh của ${file}`);
  return Number(match[1]);
}

fs.mkdirSync(OUT, { recursive: true });
const manifest = [];
for (const sound of SFX) {
  const raw = path.join(OUT, `${sound.id}.raw.wav`);
  const file = path.join(OUT, `${sound.id}.wav`);
  const filters = ['highpass=f=30', sound.after].filter(Boolean).join(',');
  run(['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', `aevalsrc=exprs='${sound.expr}':s=${RATE}:d=${sound.seconds}`, '-af', filters, '-ac', '1', '-c:a', 'pcm_f32le', raw]);
  const peak = maxVolume(raw);
  const gain = (-2 - peak).toFixed(2);
  run([
    '-loglevel',
    'error',
    '-y',
    '-i',
    raw,
    '-af',
    `volume=${gain}dB,afade=t=out:st=${(sound.seconds - 0.015).toFixed(3)}:d=0.015`,
    '-ac',
    '1',
    '-ar',
    String(RATE),
    '-c:a',
    'pcm_s16le',
    '-map_metadata',
    '-1',
    '-fflags',
    '+bitexact',
    '-flags:a',
    '+bitexact',
    file,
  ]);
  fs.rmSync(raw);
  manifest.push({ id: sound.id, label: sound.label, file: `${sound.id}.wav`, seconds: sound.seconds, tags: sound.tags });
  console.log(`✔ ${sound.id}.wav (${sound.seconds} giây, chỉnh ${gain} dB)`);
}
fs.writeFileSync(path.join(OUT, 'sfx.json'), `${JSON.stringify({ format: 1, version: '2026.11.03', license: 'CC0-1.0', sounds: manifest }, null, 2)}\n`);
console.log(`✔ video/sfx/sfx.json: ${manifest.length} tiếng`);
