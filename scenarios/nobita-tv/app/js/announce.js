/*
 * Nobita TV announcements: big running / blinking text on a party background, confetti and a little
 * synthesized tune. Full screen on the TV, and on a preview page (announce-preview.html, or one your own relay
 * serves). One file for both, so the preview is exactly the TV.
 *
 *   var shown = NobitaAnnounce.show(hostElement, cfg, { music: true, duration: 30, onEnd: fn, hint: '...' });
 *   shown.stop();   shown.fit();   NobitaAnnounce.music.play('party');   NobitaAnnounce.music.stop();
 *
 * Plain ES5-style JS: the TV's browser is Chromium 76. Tunes are generated with WebAudio, no music files.
 */
(function (global) {
    'use strict';

    var W = 1920, H = 1080;

    var OPTIONS = {
        motion: [['marquee', 'Chữ chạy'], ['still', 'Đứng yên'], ['bounce', 'Nhảy nhót'], ['wave', 'Lượn sóng'],
            ['zoom', 'Nhịp tim'], ['shake', 'Rung lắc'], ['typing', 'Gõ từng chữ']],
        look: [['solid', 'Một màu'], ['blink', 'Chớp tắt'], ['rainbow', 'Cầu vồng'], ['neon', 'Đèn neon'],
            ['flash', 'Đổi màu liên tục']],
        bg: [['party', 'Tiệc tùng'], ['disco', 'Sàn nhảy'], ['led', 'Bảng LED'], ['night', 'Trời sao'],
            ['sunset', 'Hoàng hôn'], ['ocean', 'Biển xanh'], ['red', 'Đỏ rực'], ['black', 'Nền đen']],
        extra: [['none', 'Không'], ['confetti', 'Pháo giấy'], ['fireworks', 'Pháo hoa'], ['hearts', 'Tim bay'],
            ['balloons', 'Bóng bay'], ['snow', 'Tuyết rơi']],
        music: [['none', 'Không nhạc'], ['party', 'Quẩy lên'], ['birthday', 'Sinh nhật'], ['fanfare', 'Kèn chiến thắng'],
            ['drumroll', 'Trống dồn'], ['disco', 'Disco'], ['lullaby', 'Ru ngủ'], ['bell', 'Chuông gọi']],
        size: [['m', 'Vừa'], ['l', 'Lớn'], ['xl', 'Rất lớn']],
        colors: ['#ffffff', '#ffe14d', '#ff4d6d', '#4dd8ff', '#7dff6b', '#ff9f1c', '#c77dff']
    };

    var DEFAULTS = {
        name: '', text: 'Nobita TV xin chào!', sub: '', motion: 'marquee', look: 'rainbow', color: '#ffffff',
        bg: 'party', extra: 'confetti', music: 'party', musicUrl: '', speed: 3, size: 'l', duration: 0
    };

    // Ready-made ideas for the management page ("mục tiêu").
    var TEMPLATES = [
        { name: 'Sinh nhật', text: 'CHÚC MỪNG SINH NHẬT!', sub: 'Tuổi mới thật nhiều niềm vui', motion: 'bounce',
            look: 'rainbow', bg: 'party', extra: 'balloons', music: 'birthday', size: 'l' },
        { name: 'Cơm chín rồi', text: 'CƠM CHÍN RỒI! XUỐNG ĂN THÔI!', motion: 'marquee', look: 'blink',
            color: '#ffe14d', bg: 'red', extra: 'none', music: 'bell', size: 'xl' },
        { name: 'Đi ngủ', text: 'Đến giờ đi ngủ rồi nè', sub: 'Tắt TV, đánh răng, lên giường!', motion: 'wave',
            look: 'neon', color: '#c77dff', bg: 'night', extra: 'snow', music: 'lullaby', size: 'l', speed: 2 },
        { name: 'Vô địch', text: 'VÔ ĐỊCH!!!', motion: 'zoom', look: 'flash', bg: 'disco', extra: 'fireworks',
            music: 'fanfare', size: 'xl' },
        { name: 'Công bố', text: 'Và người chiến thắng là...', motion: 'typing', look: 'solid', color: '#ffe14d',
            bg: 'black', extra: 'none', music: 'drumroll', size: 'l' },
        { name: 'Họp gia đình', text: 'HỌP GIA ĐÌNH KHẨN CẤP', sub: 'Tập trung phòng khách sau 5 phút', motion: 'shake',
            look: 'blink', color: '#ffffff', bg: 'red', extra: 'none', music: 'bell', size: 'l' },
        { name: 'Quẩy', text: 'QUẨY LÊN NÀO!!!', motion: 'bounce', look: 'neon', color: '#4dd8ff', bg: 'disco',
            extra: 'confetti', music: 'disco', size: 'xl', speed: 4 },
        { name: 'Chào khách', text: 'Chào mừng quý khách đến chơi nhà', motion: 'marquee', look: 'solid',
            color: '#ffe14d', bg: 'led', extra: 'none', music: 'none', size: 'xl' },
        { name: 'Yêu thương', text: 'Yêu cả nhà nhiều lắm!', motion: 'wave', look: 'solid', color: '#ffffff',
            bg: 'sunset', extra: 'hearts', music: 'lullaby', size: 'l', speed: 2 }
    ];

    function keys(list) { return list.map(function (o) { return o[0]; }); }
    function pick(value, list, fallback) { return keys(list).indexOf(value) >= 0 ? value : fallback; }

    // Anything stored or sent over the network goes through here: only known values survive.
    function normalize(cfg) {
        cfg = cfg || {};
        var out = {};
        out.name = String(cfg.name || '').slice(0, 60);
        out.text = String(cfg.text == null ? DEFAULTS.text : cfg.text).slice(0, 300);
        out.sub = String(cfg.sub || '').slice(0, 120);
        out.motion = pick(cfg.motion, OPTIONS.motion, DEFAULTS.motion);
        out.look = pick(cfg.look, OPTIONS.look, DEFAULTS.look);
        out.bg = pick(cfg.bg, OPTIONS.bg, DEFAULTS.bg);
        out.extra = pick(cfg.extra, OPTIONS.extra, DEFAULTS.extra);
        out.music = cfg.music === 'url' ? 'url' : pick(cfg.music, OPTIONS.music, DEFAULTS.music);
        out.musicUrl = /^https:\/\/\S+$/.test(cfg.musicUrl || '') ? String(cfg.musicUrl).slice(0, 500) : '';
        if (out.music === 'url' && !out.musicUrl) out.music = 'none';
        out.color = /^#[0-9a-f]{6}$/i.test(cfg.color || '') ? cfg.color : DEFAULTS.color;
        out.size = pick(cfg.size, OPTIONS.size, DEFAULTS.size);
        out.speed = Math.max(1, Math.min(5, Math.round(+cfg.speed || DEFAULTS.speed)));
        out.duration = Math.max(0, Math.min(3600, Math.round(+cfg.duration || 0)));
        return out;
    }

    function el(tag, cls, parent) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (parent) parent.appendChild(e);
        return e;
    }

    function chars(s) { return Array.from ? Array.from(s) : s.split(''); }

    // Words stay whole when the text wraps. Every letter is two boxes: the outer one jumps (motion),
    // the inner one changes colour (look), so any motion goes with any look.
    function fillLetters(target, text) {
        var letters = [];
        text.split('\n').forEach(function (line, li) {
            if (li) el('br', null, target);
            line.split(/( +)/).forEach(function (part) {
                if (!part) return;
                if (/^ +$/.test(part)) { target.appendChild(document.createTextNode(part)); return; }
                var word = el('span', 'na-word', target);
                chars(part).forEach(function (ch) {
                    var outer = el('span', 'na-ch', word);
                    el('span', 'na-in', outer).textContent = ch;
                    letters.push(outer);
                });
            });
        });
        return letters;
    }

    function animate(node, seconds, delay) {
        node.style.animationDuration = seconds.toFixed(2) + 's';
        if (delay != null) node.style.animationDelay = delay.toFixed(2) + 's';
    }

    var SPEED = [0.6, 0.8, 1, 1.35, 1.8];
    var RAINBOW = ['#ff4d6d', '#ff9f1c', '#ffe14d', '#7dff6b', '#4dd8ff', '#c77dff'];
    var STILL_SIZE = { m: 120, l: 170, xl: 230 };
    var RUN_SIZE = { m: 200, l: 280, xl: 380 };

    function show(host, cfg, opts) {
        cfg = normalize(cfg);
        opts = opts || {};
        var sp = SPEED[cfg.speed - 1];
        var timers = [];
        var stopped = false;

        var box = el('div', 'na na-bg-' + cfg.bg + ' na-look-' + cfg.look + ' na-motion-' + cfg.motion);
        box.style.setProperty('--na-color', cfg.color);
        var bg = el('div', 'na-bg', box);
        if (cfg.bg === 'disco') ['a', 'b', 'c'].forEach(function (k) { el('div', 'na-spot na-spot-' + k, bg); });
        if (cfg.bg === 'night') { el('div', 'na-stars', bg); el('div', 'na-stars na-stars-2', bg); }
        var canvas = cfg.extra !== 'none' ? el('canvas', 'na-fx', box) : null;
        var stage = el('div', 'na-stage', box);
        var line = el('div', 'na-line', stage);
        var text = el('div', 'na-text', line);
        if (cfg.bg === 'led') el('div', 'na-led', box);
        if (opts.brand !== false) el('div', 'na-brand', box).textContent = opts.brandText || 'Nobita TV';
        if (opts.hint) el('div', 'na-hint', box).textContent = opts.hint;

        var marquee = cfg.motion === 'marquee';
        var content = marquee ? cfg.text.replace(/\s*\n\s*/g, '   •   ') : cfg.text;
        var letters = fillLetters(text, content || ' ');
        if (cfg.sub) el('div', 'na-sub', marquee ? box : stage).textContent = cfg.sub;

        // Rainbow letters step through the colours a few times a second from JS: a CSS colour
        // animation repaints every letter on every frame, which the TV can't keep up with.
        var rainbowPhase = 0;
        function paintRainbow() {
            letters.forEach(function (s, i) { s.firstChild.style.color = RAINBOW[(i + rainbowPhase) % RAINBOW.length]; });
            rainbowPhase = (rainbowPhase + RAINBOW.length - 1) % RAINBOW.length;
        }
        if (cfg.look === 'rainbow') paintRainbow();
        if (cfg.look === 'blink') animate(text, 1.2 / sp);
        if (cfg.look === 'flash') animate(text, 2.4 / sp);
        if (cfg.motion === 'bounce') letters.forEach(function (s, i) { animate(s, 0.9 / sp, -i * 0.08 / sp); });
        if (cfg.motion === 'wave') letters.forEach(function (s, i) { animate(s, 1.6 / sp, -i * 0.11 / sp); });
        if (cfg.motion === 'zoom') animate(line, 1.1 / sp);
        if (cfg.motion === 'shake') animate(line, 0.5 / sp);

        host.appendChild(box);

        function fit() {
            var w = host.clientWidth || W;
            var s = w / W;
            box.style.transform = s === 1 ? '' : 'scale(' + s + ')';
        }
        fit();

        if (marquee) {
            text.style.fontSize = RUN_SIZE[cfg.size] + 'px';
            var width = line.offsetWidth || 1000;
            animate(line, (W + width) / (420 * sp));
        } else {
            // biggest size that still fits the screen (measured standing still: tilted letters overflow)
            box.classList.add('na-measuring');
            var size = STILL_SIZE[cfg.size];
            var maxH = cfg.sub ? 700 : 820;
            text.style.fontSize = size + 'px';
            for (var n = 0; n < 14 && (text.scrollWidth > text.clientWidth + 2 || text.offsetHeight > maxH) && size > 40; n++) {
                size = Math.round(size * 0.9);
                text.style.fontSize = size + 'px';
            }
            box.classList.remove('na-measuring');
        }

        if (cfg.motion === 'typing') {
            letters.forEach(function (s) { s.classList.add('na-hidden'); });
            var shownCount = 0;
            var typeTick = function () {
                if (stopped) return;
                if (shownCount < letters.length) {
                    letters[shownCount++].classList.remove('na-hidden');
                    timers.push(setTimeout(typeTick, 110 / sp));
                } else {
                    timers.push(setTimeout(function () {
                        letters.forEach(function (s) { s.classList.add('na-hidden'); });
                        shownCount = 0;
                        typeTick();
                    }, 2600));
                }
            };
            timers.push(setTimeout(typeTick, 400));
        }

        var intervals = [];
        if (cfg.look === 'rainbow') intervals.push(setInterval(paintRainbow, 170 / sp));

        var fx = canvas ? new Particles(canvas, cfg.extra, sp) : null;
        if (opts.music) music.play(cfg.music, cfg.musicUrl);

        var duration = opts.duration != null ? opts.duration : cfg.duration;
        if (duration > 0) timers.push(setTimeout(function () { handle.stop(); if (opts.onEnd) opts.onEnd(); }, duration * 1000));

        var handle = {
            cfg: cfg,
            fit: fit,
            stop: function () {
                if (stopped) return;
                stopped = true;
                timers.forEach(clearTimeout);
                intervals.forEach(clearInterval);
                if (fx) fx.stop();
                if (opts.music) { if (opts.releaseAudio) music.release(); else music.stop(); }
                if (box.parentNode) box.parentNode.removeChild(box);
            }
        };
        return handle;
    }

    // ------------------------------------------------------------------ particles (drawn at half size)

    var PALETTE = ['#ff4d6d', '#ffe14d', '#4dd8ff', '#7dff6b', '#ff9f1c', '#c77dff', '#ffffff'];
    var CW = 960, CH = 540;

    function rnd(a, b) { return a + Math.random() * (b - a); }
    function anyOf(list) { return list[Math.floor(Math.random() * list.length)]; }

    function Particles(canvas, kind, sp) {
        canvas.width = CW;
        canvas.height = CH;
        var ctx = canvas.getContext('2d');
        var items = [], sparks = [], last = 0, nextRocket = 0, frame = 0, alive = true;
        var count = { confetti: 110, snow: 130, hearts: 26, balloons: 12, fireworks: 0 }[kind] || 0;
        for (var i = 0; i < count; i++) items.push(spawn(true));

        function spawn(anywhere) {
            var p = { x: rnd(0, CW), phase: rnd(0, 6.3), color: anyOf(PALETTE) };
            if (kind === 'confetti') {
                p.y = anywhere ? rnd(-CH, CH) : rnd(-60, -10); p.w = rnd(5, 9); p.h = rnd(8, 14);
                p.vy = rnd(45, 90); p.rot = rnd(0, 6.3); p.vr = rnd(-3, 3);
            } else if (kind === 'snow') {
                p.y = anywhere ? rnd(0, CH) : -6; p.r = rnd(1, 3.4); p.vy = rnd(18, 48); p.color = '#ffffff';
            } else if (kind === 'hearts') {
                p.y = anywhere ? rnd(0, CH + 200) : CH + rnd(20, 120); p.s = rnd(9, 22); p.vy = rnd(35, 70);
                p.color = anyOf(['#ff4d6d', '#ff7aa2', '#ff2e63', '#ffb3c6']);
            } else if (kind === 'balloons') {
                p.y = anywhere ? rnd(0, CH + 300) : CH + rnd(40, 200); p.r = rnd(18, 28); p.vy = rnd(30, 60);
            }
            return p;
        }

        function heart(x, y, s) {
            ctx.beginPath();
            ctx.moveTo(x, y + s * 0.3);
            ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
            ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
            ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
            ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
            ctx.fill();
        }

        function rocket(t) {
            var x = rnd(120, CW - 120), y = rnd(70, 230), color = anyOf(PALETTE), n = 56;
            for (var k = 0; k < n; k++) {
                var a = (k / n) * Math.PI * 2, v = rnd(70, 190);
                sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, born: t, life: rnd(1.1, 1.7), color: color });
            }
        }

        function draw(now) {
            if (!alive) return;
            frame = requestAnimationFrame(draw);
            var t = now / 1000;
            var dt = last ? Math.min(t - last, 0.05) : 0.016;
            last = t;
            var mv = dt * sp;
            if (kind === 'fireworks') {
                // fade what is there instead of clearing: the sparks leave short trails
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = 'rgba(0,0,0,0.22)';
                ctx.fillRect(0, 0, CW, CH);
                ctx.globalCompositeOperation = 'lighter';
                if (t > nextRocket) { rocket(t); nextRocket = t + rnd(0.6, 1.1) / sp; }
                sparks = sparks.filter(function (s) { return t - s.born < s.life; });
                sparks.forEach(function (s) {
                    s.vy += 90 * mv; s.vx *= 0.985; s.vy *= 0.985;
                    s.x += s.vx * mv; s.y += s.vy * mv;
                    ctx.globalAlpha = Math.max(0, 1 - (t - s.born) / s.life);
                    ctx.fillStyle = s.color;
                    ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
                });
                ctx.globalAlpha = 1;
                return;
            }
            ctx.clearRect(0, 0, CW, CH);
            items.forEach(function (p, idx) {
                p.phase += dt * 2;
                if (kind === 'confetti') {
                    p.y += p.vy * mv; p.x += Math.sin(p.phase) * 18 * dt; p.rot += p.vr * dt;
                    if (p.y > CH + 20) items[idx] = spawn(false);
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.scale(Math.cos(p.phase * 1.7), 1); // the paper turning over
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    ctx.restore();
                } else if (kind === 'snow') {
                    p.y += p.vy * mv; p.x += Math.sin(p.phase) * 10 * dt;
                    if (p.y > CH + 6) items[idx] = spawn(false);
                    ctx.globalAlpha = 0.85;
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.fill();
                    ctx.globalAlpha = 1;
                } else if (kind === 'hearts') {
                    p.y -= p.vy * mv; p.x += Math.sin(p.phase) * 22 * dt;
                    if (p.y < -40) items[idx] = spawn(false);
                    ctx.globalAlpha = Math.max(0, Math.min(1, p.y / 160));
                    ctx.fillStyle = p.color;
                    heart(p.x, p.y, p.s);
                    ctx.globalAlpha = 1;
                } else if (kind === 'balloons') {
                    p.y -= p.vy * mv; p.x += Math.sin(p.phase * 0.7) * 14 * dt;
                    if (p.y < -p.r * 3) items[idx] = spawn(false);
                    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y + p.r * 1.2);
                    ctx.quadraticCurveTo(p.x + Math.sin(p.phase) * 8, p.y + p.r * 2.2, p.x, p.y + p.r * 3.2);
                    ctx.stroke();
                    ctx.fillStyle = p.color;
                    ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 1.2, 0, 0, 6.3); ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.35)';
                    ctx.beginPath(); ctx.ellipse(p.x - p.r * 0.35, p.y - p.r * 0.45, p.r * 0.22, p.r * 0.34, -0.5, 0, 6.3); ctx.fill();
                }
            });
        }
        frame = requestAnimationFrame(draw);

        this.stop = function () {
            alive = false;
            cancelAnimationFrame(frame);
        };
    }

    // ------------------------------------------------------------------ music (WebAudio, made up on the spot)

    // Notes as "C5:4" = C in octave 5 for 4 sixteenths, "-:4" = rest. Melodies are original, or old enough
    // to be free (Happy Birthday's 1893 tune, Brahms' lullaby of 1868).
    var SONGS = {
        party: {
            bpm: 128,
            tracks: [
                { wave: 'square', vol: 0.10, env: 'pluck', notes:
                    'C5:2 E5:2 G5:2 C6:2 -:2 G5:2 E5:2 G5:2 A5:2 G5:2 E5:2 D5:2 -:2 C5:2 D5:2 E5:2 ' +
                    'F5:2 A5:2 C6:2 A5:2 G5:2 E5:2 C5:2 E5:2 D5:2 E5:2 F5:2 D5:2 G5:4 -:4' },
                { wave: 'triangle', vol: 0.30, env: 'pluck', notes:
                    'C3:2 C4:2 C3:2 C4:2 C3:2 C4:2 C3:2 C4:2 A2:2 A3:2 A2:2 A3:2 A2:2 A3:2 A2:2 A3:2 ' +
                    'F2:2 F3:2 F2:2 F3:2 F2:2 F3:2 F2:2 F3:2 G2:2 G3:2 G2:2 G3:2 G2:2 G3:2 G2:2 G3:2' }
            ],
            drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.' }
        },
        birthday: {
            bpm: 100,
            tracks: [
                { wave: 'triangle', vol: 0.32, env: 'sustain', notes:
                    '-:8 G4:3 G4:1 A4:4 G4:4 C5:4 B4:8 G4:3 G4:1 A4:4 G4:4 D5:4 C5:8 G4:3 G4:1 ' +
                    'G5:4 E5:4 C5:4 B4:4 A4:4 F5:3 F5:1 E5:4 C5:4 D5:4 C5:12' },
                { wave: 'sine', vol: 0.22, env: 'pluck', notes:
                    '-:12 C3:4 E3:4 G3:4 G2:4 B2:4 D3:4 G2:4 B2:4 F3:4 C3:4 E3:4 G3:4 ' +
                    'C3:4 E3:4 G3:4 F2:4 A2:4 C3:4 C3:4 G2:4 B2:4 C3:4 E3:4 C3:4' }
            ]
        },
        fanfare: {
            bpm: 120,
            tracks: [
                { wave: 'sawtooth', vol: 0.08, env: 'sustain', notes:
                    'G4:2 G4:2 G4:2 C5:10 -:4 E5:2 E5:2 E5:2 G5:6 E5:2 G5:2 C6:12 -:16' },
                { wave: 'square', vol: 0.06, env: 'sustain', notes:
                    'E4:2 E4:2 E4:2 G4:10 -:4 C5:2 C5:2 C5:2 E5:6 C5:2 E5:2 G5:12 -:16' },
                { wave: 'triangle', vol: 0.28, env: 'pluck', notes: 'C3:8 C3:8 C3:8 G2:8 C3:8 G2:4 C3:4 -:16' }
            ],
            drums: { kick: 'x.......x.......x.......x.......x.......x.......', snare: '................................................1234567899999999', crash: '................................................................' }
        },
        drumroll: {
            bpm: 120,
            tracks: [],
            drums: {
                snare: '1111222233334444555566667777888899999999999999999...............',
                kick: '................................................x...............',
                crash: '................................................x...............'
            }
        },
        disco: {
            bpm: 118,
            tracks: [
                { wave: 'square', vol: 0.07, env: 'pluck', notes:
                    '-:2 G5:2 -:2 G5:2 -:2 A5:2 G5:2 E5:2 -:2 E5:2 -:2 E5:2 -:2 G5:2 E5:2 C5:2 ' +
                    '-:2 F5:2 -:2 F5:2 -:2 A5:2 F5:2 C5:2 -:2 D5:2 -:2 D5:2 G5:4 B4:4' },
                { wave: 'triangle', vol: 0.34, env: 'pluck', notes:
                    'C2:2 C3:2 C2:2 C3:2 C2:2 C3:2 C2:2 C3:2 A1:2 A2:2 A1:2 A2:2 A1:2 A2:2 A1:2 A2:2 ' +
                    'F1:2 F2:2 F1:2 F2:2 F1:2 F2:2 F1:2 F2:2 G1:2 G2:2 G1:2 G2:2 G1:2 G2:2 G1:2 G2:2' }
            ],
            drums: { kick: 'x...x...x...x...', clap: '....x.......x...', hat: '..o...o...o...o.' }
        },
        lullaby: {
            bpm: 84,
            tracks: [
                { wave: 'sine', vol: 0.30, env: 'bell', notes:
                    'E4:2 E4:2 G4:8 E4:2 E4:2 G4:8 E4:2 G4:2 C5:4 B4:6 A4:2 A4:4 G4:4 D4:2 E4:2 ' +
                    'F4:4 D4:4 D4:2 E4:2 F4:8 D4:2 F4:2 B4:2 A4:2 G4:4 B4:4 C5:8 C4:2 C4:2 ' +
                    'C5:8 A4:2 F4:2 G4:8 E4:2 C4:2 F4:4 G4:4 A4:4 G4:8 C4:2 C4:2 C5:8 A4:2 F4:2 ' +
                    'G4:8 E4:2 C4:2 F4:4 E4:4 D4:4 C4:12 -:12' }
            ]
        },
        bell: {
            bpm: 90,
            tracks: [{ wave: 'sine', vol: 0.4, env: 'bell', notes: 'G5:4 E5:4 C5:8 -:16 G5:4 E5:4 C5:8 -:32' }]
        }
    };

    var NOTE_INDEX = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

    function parseNotes(str) {
        var at = 0, out = [];
        str.trim().split(/\s+/).forEach(function (tok) {
            var p = tok.split(':'), d = +p[1] || 1;
            var m = /^([A-G]#?)(\d)$/.exec(p[0]);
            if (m) out.push({ at: at, d: d, f: 440 * Math.pow(2, (NOTE_INDEX[m[1]] + (+m[2] + 1) * 12 - 69) / 12) });
            at += d;
        });
        return { notes: out, len: at };
    }

    // Each tune is rendered once into a sound buffer (OfflineAudioContext) and then played as a loop.
    // Playing a buffer happens entirely on the audio thread, so busy animations can't make it stutter
    // the way note-by-note scheduling from the page did on the TV.
    var music = (function () {
        var ctx = null, source = null, out = null, audio = null, token = 0;
        var rendered = {}; // song name -> promise of { buffer, loopEnd }
        var RATE = 32000;

        function AC() { return global.AudioContext || global.webkitAudioContext; }
        function OfflineAC() { return global.OfflineAudioContext || global.webkitOfflineAudioContext; }

        function context() {
            if (!ctx && AC()) ctx = new (AC())();
            if (ctx && ctx.state === 'suspended' && ctx.resume) ctx.resume();
            return ctx;
        }

        function tone(c, dest, t, f, dur, wave, vol, env) {
            var o = c.createOscillator(), g = c.createGain();
            o.type = wave;
            o.frequency.setValueAtTime(f, t);
            var end = env === 'bell' ? t + Math.max(dur, 1.4) : t + dur;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
            if (env === 'bell' || env === 'pluck') g.gain.exponentialRampToValueAtTime(0.0001, end);
            else {
                g.gain.setValueAtTime(vol, Math.max(t + 0.02, end - 0.05));
                g.gain.exponentialRampToValueAtTime(0.0001, end);
            }
            o.connect(g); g.connect(dest);
            o.start(t); o.stop(end + 0.05);
        }

        function hit(c, dest, noise, t, kind, vel) {
            if (kind === 'kick') {
                var o = c.createOscillator(), g = c.createGain();
                o.frequency.setValueAtTime(150, t);
                o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
                g.gain.setValueAtTime(0.9 * vel, t);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
                o.connect(g); g.connect(dest);
                o.start(t); o.stop(t + 0.35);
                return;
            }
            var src = c.createBufferSource(), filter = c.createBiquadFilter(), gain = c.createGain();
            src.buffer = noise;
            var len = { snare: 0.14, hat: 0.05, open: 0.22, clap: 0.12, crash: 1.3 }[kind];
            filter.type = kind === 'clap' ? 'bandpass' : 'highpass';
            filter.frequency.value = { snare: 1400, hat: 7000, open: 6500, clap: 1500, crash: 4000 }[kind];
            var peak = { snare: 0.5, hat: 0.18, open: 0.2, clap: 0.55, crash: 0.35 }[kind] * vel;
            gain.gain.setValueAtTime(peak, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
            src.connect(filter); filter.connect(gain); gain.connect(dest);
            src.start(t, Math.random() * 0.5); src.stop(t + len + 0.02);
        }

        // Every step of the loop gets its list of things to play, worked out once.
        function prepare(song) {
            var parsed = song.tracks.map(function (tr) { return parseNotes(tr.notes); });
            var len = 16;
            parsed.forEach(function (p) { len = Math.max(len, p.len); });
            Object.keys(song.drums || {}).forEach(function (k) { len = Math.max(len, song.drums[k].length); });
            var steps = [];
            for (var i = 0; i < len; i++) steps.push([]);
            parsed.forEach(function (p, ti) {
                var tr = song.tracks[ti];
                p.notes.forEach(function (n) { steps[n.at % len].push({ f: n.f, d: n.d, wave: tr.wave, vol: tr.vol, env: tr.env }); });
            });
            Object.keys(song.drums || {}).forEach(function (k) {
                var pat = song.drums[k];
                for (var i = 0; i < len; i++) {
                    var c = pat.charAt(i % pat.length);
                    if (c === '.' || !c) continue;
                    var vel = c === 'x' ? 0.8 : c === 'o' ? 0.8 : (+c || 5) / 9;
                    steps[i].push({ drum: k === 'hat' && c === 'o' ? 'open' : k, vel: vel });
                }
            });
            return { steps: steps, len: len, stepSec: 60 / song.bpm / 4 };
        }

        function render(name) {
            if (rendered[name]) return rendered[name];
            var plan = prepare(SONGS[name]);
            var loopSec = plan.len * plan.stepSec;
            var tail = 2; // bells ring on past the end of the loop
            var off = new (OfflineAC())(1, Math.ceil((loopSec + tail) * RATE), RATE);
            var noise = off.createBuffer(1, RATE, RATE);
            var nd = noise.getChannelData(0);
            for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
            for (var st = 0; st < plan.len; st++) {
                var t = st * plan.stepSec;
                plan.steps[st].forEach(function (e) {
                    if (e.drum) hit(off, off.destination, noise, t, e.drum, e.vel);
                    else tone(off, off.destination, t, e.f, e.d * plan.stepSec * 0.92, e.wave, e.vol, e.env);
                });
            }
            rendered[name] = off.startRendering().then(function (buffer) {
                // fold the ringing tail back onto the start, so the loop joins without a cut
                var data = buffer.getChannelData(0);
                var loopLen = Math.round(loopSec * RATE);
                for (var k = loopLen; k < data.length; k++) data[k - loopLen] += data[k];
                return { buffer: buffer, loopEnd: loopLen / RATE };
            });
            rendered[name].catch(function () { delete rendered[name]; });
            return rendered[name];
        }

        function stop() {
            token++;
            if (audio) { try { audio.pause(); audio.removeAttribute('src'); audio.load(); } catch (e) { /* ignore */ } audio = null; }
            if (source && ctx) {
                var oldSource = source, oldOut = out;
                oldOut.gain.setTargetAtTime(0, ctx.currentTime, 0.03); // short fade, no click
                setTimeout(function () {
                    try { oldSource.stop(); oldSource.disconnect(); oldOut.disconnect(); } catch (e) { /* ignore */ }
                }, 150);
            }
            source = null;
            out = null;
        }

        // Stops and also lets go of the sound output (the TV's clips use it next).
        function release() {
            stop();
            var old = ctx;
            ctx = null;
            if (old && old.close) setTimeout(function () { try { old.close(); } catch (e) { /* ignore */ } }, 200);
        }

        function play(name, url) {
            stop();
            var mine = token;
            if (name === 'url' && url) {
                audio = new Audio(url);
                audio.loop = true;
                audio.volume = 0.8;
                var p = audio.play();
                if (p && p.catch) p.catch(function () { /* blocked or bad link */ });
                return true;
            }
            if (!SONGS[name] || !AC() || !OfflineAC()) return false;
            context(); // created now, while the key press / click still counts as the user's
            render(name).then(function (r) {
                if (mine !== token || !context()) return;
                out = ctx.createGain();
                out.gain.value = 0.7;
                out.connect(ctx.destination);
                source = ctx.createBufferSource();
                source.buffer = r.buffer;
                source.loop = true;
                source.loopStart = 0;
                source.loopEnd = r.loopEnd;
                source.connect(out);
                source.start(ctx.currentTime + 0.03);
            }, function () { /* no sound then */ });
            return true;
        }

        return { play: play, stop: stop, release: release, playing: function () { return !!(source || audio); } };
    })();

    global.NobitaAnnounce = {
        OPTIONS: OPTIONS,
        DEFAULTS: DEFAULTS,
        TEMPLATES: TEMPLATES,
        normalize: normalize,
        show: show,
        music: music
    };
})(window);
