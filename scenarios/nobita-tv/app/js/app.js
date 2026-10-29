/*
 * Nobita TV — home screen for a Samsung Tizen TV: app shortcuts on one side, a photo & clip
 * slideshow on the other. Media comes from a shared Google Drive folder and from USB drives.
 * Written for the TV's Chromium 76 engine (Tizen 6.0): no optional chaining, no `??`.
 * Opened in a desktop browser (no `tizen` object) it runs on mock data for previewing.
 */
(function () {
    'use strict';

    var IS_TV = typeof tizen !== 'undefined';
    // Everything that belongs to one home (name, Drive folder, weather city, the Video code) lives in
    // js/config.js, so this file is the same for every TV. See README.md.
    var CONFIG = window.NOBITA_TV_CONFIG || {};
    var TV_NAME = CONFIG.tvName || 'Nobita TV';

    // Optional relay of your own (not part of this template): it lists media, streams clips the TV's
    // player can't open directly (Drive videos) and holds announcements. Empty = no relay.
    var FEED_URL = CONFIG.feedUrl || '';
    var FEED_SYNC_MS = 60000;
    // Photos come straight from this Google Drive folder (shared with "anyone with the link") when there
    // is no relay or it is down. Empty = no Drive album.
    var DRIVE_FOLDER_ID = CONFIG.driveFolderId || '';

    var ALBUM_FOLDER = 'tv_album'; // a folder with this name at the USB root limits the album to it
    var MAX_ITEMS = 5000;
    var MAX_DEPTH = 8;
    var IMAGE_EXT = /\.(jpe?g|png|webp|bmp|gif)$/i;
    var VIDEO_EXT = /\.(mp4|m4v|mov|webm|mkv|3gp)$/i;
    var MAX_VIDEO_MS = 5 * 60 * 1000; // a clip longer than this is cut short
    var SKIP_DIRS = { 'android': 1, 'lost.dir': 1, '$recycle.bin': 1, 'system volume information': 1, 'thumbnails': 1, 'cache': 1 };
    var INTERVALS = [5, 10, 20, 30, 60];
    var LONG_PRESS_MS = 650;

    // The only apps on the home screen, in this order. Every other app waits behind "Hiện app đã ẩn".
    // Two buttons that are not apps: "Thông báo" right after YouTube (it took VTVgo's place) and
    // "Video USB" last (it took VTVcab ON's place).
    var ANNOUNCE_TILE = 'nobita:announce';
    var USB_TILE = 'nobita:usb';
    var DEFAULT_APPS = [
        '9Ur5IzDKqV.TizenYouTube', ANNOUNCE_TILE, 'org.tizen.netflix-app',
        'ZTpEFWgfa9.FPTPlay', 'HJCS8hkoCO.TV360', USB_TILE
    ];

    // Phone-style icons you add yourself (img/apps/<app id>.png), listed in js/config.js (bundledIcons).
    // Other apps use the TV's own icon, then their initials.
    var BUNDLED_ICONS = CONFIG.bundledIcons || [];

    function iconFor(id, tvIconPath) {
        if (BUNDLED_ICONS.indexOf(id) >= 0) return 'img/apps/' + id + '.png';
        if (tvIconPath && tvIconPath.charAt(0) === '/') return 'file://' + tvIconPath;
        return tvIconPath || '';
    }

    // The TV's own user-facing apps (Samsung's app list). getAppsInfo() also reports ~190
    // system services, which must never show up, not even behind "Hiện app đã ẩn".
    var KNOWN_APPS = DEFAULT_APPS.concat([
        'OxWOiJOOyr.vtv', 'VSfj7TFNZ5.VTVcabON', '7wiJRozgP7.VieOn', 'oh3t6h6gyl.danettv', 'PP2MTMRMs9.MyTV', 'EwTa3zzuj8.Clipvn',
        'kdSsm4KCMz.vstv', 'YtpPp1gr9C.youku', 'org.tizen.primevideo', 'rJeHak5zRg.Spotify',
        'org.tizen.browser', 'com.samsung.tv.aria-video', 'com.samsung.tv.gallery',
        'IewQEY143t.GoogleDuoWeb', 'J9fZJDMi1v.SecurityCenter', 'jPPp4KCHp4.emanual'
    ]);

    // What the TV is doing (keys, app launches, errors) goes to the relay's log when config.debugLog is on.
    var DEBUG_LOG_URL = FEED_URL && CONFIG.debugLog ? FEED_URL.replace(/feed\.json$/, 'log') : '';

    // Desktop preview with the real feed: index.html?live=1 (&nosplash=1).
    var LIVE_PREVIEW = !IS_TV && /[?&]live=1/.test(location.search);
    var SHORT_NAMES = {
        'OxWOiJOOyr.vtv': 'VTVgo',
        'rJeHak5zRg.Spotify': 'Spotify',
        'EwTa3zzuj8.Clipvn': 'Clip TV',
        'PP2MTMRMs9.MyTV': 'MyTV',
        'kdSsm4KCMz.vstv': 'K+',
        'org.tizen.browser': 'Trình duyệt'
    };

    var KEY = {
        LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13,
        BACK: 10009, ESC: 27, BACKSPACE: 8,
        PLAY_PAUSE: 10252, PLAY: 415, PAUSE: 19, FF: 417, REW: 412,
        DIGIT_0: 48, DIGIT_1: 49, DIGIT_2: 50, DIGIT_3: 51, DIGIT_4: 52, DIGIT_5: 53, DIGIT_6: 54, DIGIT_7: 55, DIGIT_8: 56, DIGIT_9: 57
    };

    function $(sel, root) { return (root || document).querySelector(sel); }
    function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    // ------------------------------------------------------------------ settings

    var store = {
        get: function (key, fallback) {
            try {
                var raw = localStorage.getItem('tvhome.' + key);
                return raw === null ? fallback : JSON.parse(raw);
            } catch (e) { return fallback; }
        },
        set: function (key, value) {
            try { localStorage.setItem('tvhome.' + key, JSON.stringify(value)); } catch (e) { /* storage full / disabled */ }
        }
    };

    var state = {
        apps: [],
        pinned: store.get('pinned', []),
        shown: store.get('shownApps', DEFAULT_APPS.slice()),
        slideSec: store.get('slideSec', 10),
        shuffle: store.get('shuffle', true),
        remoteItems: [], // from the relay feed (or Drive photos when the relay is down)
        showAllApps: false, // "xem app khác" toggle; not remembered
        soundOn: false, // clips start muted every time; remote key 3 toggles
        usbItems: [],
        remoteKey: null,
        remoteError: '',
        usbKey: null,
        usbError: '',
        initialDone: false,
        scanned: [],
        photos: [], // display order (photos and clips)
        pos: 0,
        photoState: 'loading', // loading | none | ready
        paused: false,
        layer: 'splash' // splash | main | menu | fullscreen | announce | usblock | usblist | usbplay
    };
    if (store.get('homeVersion', 1) < 2) { // 22/10/2026: VTVgo makes room for the "Thông báo" button
        state.shown = state.shown.filter(function (id) { return id !== 'OxWOiJOOyr.vtv'; });
        store.set('shownApps', state.shown);
        store.set('homeVersion', 2);
    }
    if (store.get('homeVersion', 1) < 3) { // 24/10/2026: VTVcab ON makes room for "Video USB"
        state.shown = state.shown.filter(function (id) { return id !== 'VSfj7TFNZ5.VTVcabON'; });
        store.set('shownApps', state.shown);
        store.set('homeVersion', 3);
    }

    // ------------------------------------------------------------------ small helpers

    function log(msg) {
        if (!DEBUG_LOG_URL || !IS_TV) return;
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', DEBUG_LOG_URL, true);
            xhr.send(new Date().toTimeString().slice(0, 8) + ' ' + msg);
        } catch (e) { /* logging must never break the app */ }
    }
    window.addEventListener('error', function (e) { log('ERROR ' + e.message + ' @' + e.lineno); });
    window.addEventListener('unhandledrejection', function (e) {
        log('REJECT ' + (e.reason && e.reason.message ? e.reason.message : e.reason));
    });

    var toastTimer;
    function toast(text) {
        var el = $('#toast');
        el.textContent = text;
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2500);
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function decodeEntities(s) {
        return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
            .replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(+n); });
    }

    function hue(text) {
        var h = 0;
        for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) % 360;
        return h;
    }

    function initials(name) {
        var words = name.replace(/[^\p{L}\p{N}+ ]/gu, ' ').trim().split(/\s+/);
        var s = words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2);
        return s.toUpperCase();
    }

    function shuffled(list) {
        var a = list.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function fetchText(url, timeoutMs) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.timeout = timeoutMs || 15000;
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
                else reject(new Error('HTTP ' + xhr.status));
            };
            xhr.onerror = function () { reject(new Error('không kết nối được')); };
            xhr.ontimeout = function () { reject(new Error('quá thời gian chờ')); };
            xhr.send();
        });
    }

    // The browser's own network stack: it reaches Google fine, while the TV's video player
    // fails on these HTTPS links (MEDIA_ERR_SRC_NOT_SUPPORTED), so clips are downloaded first.
    function fetchBlob(url, timeoutMs) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'blob';
            xhr.timeout = timeoutMs;
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
                else reject(new Error('HTTP ' + xhr.status));
            };
            xhr.onerror = function () { reject(new Error('không kết nối được')); };
            xhr.ontimeout = function () { reject(new Error('quá thời gian chờ')); };
            xhr.send();
        });
    }

    // ------------------------------------------------------------------ clock

    var WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    function pad2(n) { return n < 10 ? '0' + n : '' + n; }
    function tickClock() {
        var d = new Date();
        var time = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
        $('#time').textContent = time;
        $('#date').textContent = WEEKDAYS[d.getDay()] + ', ' + d.getDate() + ' tháng ' + (d.getMonth() + 1) + ', ' + d.getFullYear();
        $('#fsBrand .time').textContent = time;
        setTimeout(tickClock, 60000 - (Date.now() % 60000)); // wake on the minute
    }

    // ------------------------------------------------------------------ apps

    function loadApps() {
        if (!IS_TV) {
            state.apps = MOCK_APPS.filter(function (a) { return KNOWN_APPS.indexOf(a[0]) >= 0; })
                .map(function (a) { return { id: a[0], name: SHORT_NAMES[a[0]] || a[1], icon: iconFor(a[0], '') }; });
            renderApps();
            return;
        }
        var selfId = '';
        try { selfId = tizen.application.getCurrentApplication().appInfo.id; } catch (e) { /* ignore */ }
        try {
            tizen.application.getAppsInfo(function (infos) {
                state.apps = infos
                    .filter(function (a) { return KNOWN_APPS.indexOf(a.id) >= 0; })
                    .map(function (a) {
                        return { id: a.id, name: SHORT_NAMES[a.id] || a.name, icon: iconFor(a.id, a.iconPath) };
                    });
                log('apps: ' + state.apps.length + ' installed, ' + sortedApps().length + ' shown');
                renderApps();
            }, function (err) {
                log('apps error: ' + err.message);
                toast('Không đọc được danh sách ứng dụng: ' + err.message);
            });
        } catch (e) {
            toast('Không đọc được danh sách ứng dụng: ' + e.message);
        }
    }

    function rank(id) {
        var i = DEFAULT_APPS.indexOf(id);
        return i < 0 ? 999 : i;
    }

    function isShown(id) { return state.shown.indexOf(id) >= 0; }

    function sortedApps() {
        var byId = {};
        state.apps.forEach(function (a) { byId[a.id] = a; });
        var top = state.pinned.map(function (id) { return byId[id]; }).filter(Boolean);
        var rest = state.apps.concat(FEATURE_TILES)
            .filter(function (a) { return a.feature || (state.pinned.indexOf(a.id) < 0 && (state.showAllApps || isShown(a.id))); })
            .sort(function (a, b) { return rank(a.id) - rank(b.id) || a.name.localeCompare(b.name, 'vi'); });
        return top.concat(rest);
    }

    function renderApps() {
        var grid = $('#appGrid');
        var focusedId = focused && focused.classList.contains('tile') ? focused.getAttribute('data-id') : null;
        grid.innerHTML = sortedApps().map(function (app) {
            if (app.feature) {
                return '<div class="focusable tile feature" data-action="' + app.action + '" data-id="' + app.id + '">' +
                    '<div class="icon ' + app.iconClass + '">' + app.svg + '</div><div class="label">' + app.name + '</div></div>';
            }
            var h = hue(app.name);
            var pinned = state.pinned.indexOf(app.id) >= 0;
            // Just the app's own icon; a coloured badge only when the icon can't be read.
            var badge = 'background:hsl(' + h + ',50%,32%)' + (app.icon ? ';display:none' : '');
            return '<div class="focusable tile" data-id="' + escapeHtml(app.id) + '">' +
                (app.icon ? '<img class="icon" src="' + escapeHtml(app.icon) + '">' : '') +
                '<div class="initials" style="' + badge + '">' + escapeHtml(initials(app.name)) + '</div>' +
                '<div class="label">' + escapeHtml(app.name) + '</div>' +
                (pinned ? '<div class="pin">★</div>' : '') +
                '</div>';
        }).join('');
        // Icons outside our sandbox may not load: fall back to initials.
        $all('img.icon', grid).forEach(function (img) {
            img.onerror = function () {
                img.style.display = 'none';
                img.nextElementSibling.style.display = '';
            };
        });
        var others = state.apps.filter(function (a) { return !isShown(a.id) && state.pinned.indexOf(a.id) < 0; }).length;
        $('#moreAppsLabel').textContent = state.showAllApps ? 'Thu gọn' : 'Xem ' + others + ' app khác';
        $('#moreApps').classList.toggle('hidden', others === 0);

        var target = focusedId && $('.tile[data-id="' + cssEscape(focusedId) + '"]');
        if (target) setFocus(target);
        else if (!focused || !document.body.contains(focused)) setFocus($('.tile') || $('#photoFrame'));
    }

    // White megaphone on the announcement screen's party colours, drawn like an app icon.
    var MEGAPHONE_ICON = '<svg viewBox="0 0 64 64" width="104" height="104">' +
        '<path d="M9 25.5a3 3 0 0 1 3-3h8l20-11.5a2 2 0 0 1 3 1.7v38.6a2 2 0 0 1-3 1.7L20 41.5h-8a3 3 0 0 1-3-3z" fill="#fff"/>' +
        '<path d="M19 41.5l4.2 12.3a2 2 0 0 0 1.9 1.4h4.4a1.5 1.5 0 0 0 1.4-2L27.5 41.5z" fill="#fff"/>' +
        '<g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round">' +
        '<path d="M49 25a10 10 0 0 1 0 14"/><path d="M54.5 19.5a18 18 0 0 1 0 25"/></g></svg>';

    // Just a play sign (nothing hints at a USB drive), and a padlock: it asks for a code first.
    var USB_ICON = '<svg viewBox="0 0 64 64" width="104" height="104">' +
        '<path d="M22 14.5c0-3.1 3.4-5 6-3.4l24.4 15.5c2.5 1.6 2.5 5.2 0 6.8L28 48.9c-2.6 1.6-6-.3-6-3.4z" fill="#fff"/></svg>' +
        '<div class="lock-badge"><svg viewBox="0 0 24 24" width="26" height="26">' +
        '<rect x="5" y="10" width="14" height="11" rx="2" fill="#fff"/>' +
        '<path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#fff" stroke-width="2.4"/></svg></div>';

    var FEATURE_TILES = [
        { id: ANNOUNCE_TILE, name: 'Thông báo', feature: true, action: 'announce', iconClass: 'announce-icon', svg: MEGAPHONE_ICON },
        { id: USB_TILE, name: 'Video', feature: true, action: 'usbVideos', iconClass: 'usb-icon', svg: USB_ICON }
    ];

    function cssEscape(s) { return String(s).replace(/["\\]/g, '\\$&'); }

    function appById(id) {
        for (var i = 0; i < state.apps.length; i++) if (state.apps[i].id === id) return state.apps[i];
        return null;
    }

    // Set while one of our apps is in front, so coming back from it doesn't replay the splash.
    var openedAnApp = false;

    function launchApp(id) {
        if (!IS_TV) { toast('(xem thử) Mở ' + appById(id).name); return; }
        try {
            openedAnApp = true;
            log('launch ' + id);
            tizen.application.launch(id, null, function (err) {
                log('launch failed ' + id + ': ' + err.message);
                openedAnApp = false;
                toast('Không mở được ứng dụng: ' + err.message);
            });
        } catch (e) {
            toast('Không mở được ứng dụng: ' + e.message);
        }
    }

    function savePinned() { store.set('pinned', state.pinned); renderApps(); }

    // ------------------------------------------------------------------ long-press menu

    function openAppMenu(id) {
        var app = appById(id);
        if (!app) return;
        var idx = state.pinned.indexOf(id);
        var items = [];
        if (idx < 0) items.push(['Ghim lên đầu danh sách', function () { state.pinned.push(id); savePinned(); }]);
        else items.push(['Bỏ ghim', function () { state.pinned.splice(idx, 1); savePinned(); }]);
        if (idx > 0) items.push(['Đưa lên trước', function () { movePinned(idx, -1); }]);
        if (idx >= 0 && idx < state.pinned.length - 1) items.push(['Đưa xuống sau', function () { movePinned(idx, 1); }]);
        if (isShown(id) || idx >= 0) {
            items.push(['Ẩn khỏi màn hình chính', function () {
                if (idx >= 0) state.pinned.splice(idx, 1);
                state.shown = state.shown.filter(function (x) { return x !== id; });
                store.set('shownApps', state.shown);
                savePinned();
                toast('Đã ẩn ' + app.name + '. Mở lại bằng icon "xem app khác" ở góc dưới.');
            }]);
        } else {
            items.push(['Thêm vào màn hình chính', function () {
                state.shown.push(id);
                store.set('shownApps', state.shown);
                renderApps();
            }]);
        }

        var menu = $('#menu');
        $('.title', menu).textContent = app.name;
        var box = $('.items', menu);
        box.innerHTML = '';
        items.forEach(function (item) {
            var el = document.createElement('div');
            el.className = 'focusable pill';
            el.textContent = item[0];
            el.onAction = function () { closeMenu(); item[1](); };
            box.appendChild(el);
        });
        menu.classList.remove('hidden');
        state.layer = 'menu';
        swallowEnterSince = Date.now();
        menuReturnFocus = focused;
        setFocus(box.firstChild);
    }

    var menuReturnFocus = null;
    function closeMenu() {
        $('#menu').classList.add('hidden');
        state.layer = 'main';
        var back = menuReturnFocus && document.body.contains(menuReturnFocus) ? menuReturnFocus : $('.tile');
        setFocus(back);
    }

    function movePinned(idx, delta) {
        var id = state.pinned.splice(idx, 1)[0];
        state.pinned.splice(idx + delta, 0, id);
        savePinned();
    }

    // ------------------------------------------------------------------ Google Drive

    // The public folder page lists every entry; no API key needed for a link-shared folder.
    var ENTRY_RE = /<div class="flip-entry" id="entry-([\w-]+)"[\s\S]*?<a href="([^"]*)"[\s\S]*?<div class="flip-entry-title">([^<]*)<\/div>/g;

    async function listDriveFolder(folderId, album, depth, out) {
        var html = await fetchText('https://drive.google.com/embeddedfolderview?id=' + encodeURIComponent(folderId));
        if (!album) {
            var t = /<title>([^<]*)<\/title>/.exec(html);
            album = t ? decodeEntities(t[1]).trim() : 'Google Drive';
        }
        var re = new RegExp(ENTRY_RE.source, 'g');
        var entries = [], m;
        while ((m = re.exec(html))) entries.push({ id: m[1], href: m[2], name: decodeEntities(m[3]).trim() });
        for (var i = 0; i < entries.length && out.length < MAX_ITEMS; i++) {
            var e = entries[i];
            if (/\/folders\//.test(e.href)) {
                if (depth < 2) await listDriveFolder(e.id, e.name, depth + 1, out);
            } else if (IMAGE_EXT.test(e.name)) {
                out.push({ uri: 'https://lh3.googleusercontent.com/d/' + e.id + '=w1920-h1080', album: album, video: false });
            } else if (VIDEO_EXT.test(e.name)) {
                // drive.usercontent.google.com answers the TV's user agent with 500/403; this form works.
                out.push({ uri: 'https://drive.google.com/uc?export=download&id=' + e.id, album: album, video: true });
            }
        }
    }

    // ------------------------------------------------------------------ remote screenshot
    // The relay can ask for one; the TV renders its own screen and posts a JPEG.
    // Clip frames come out black: the TV's video player can't be read back.
    var lastCapture = null;
    var lastCommand = null;

    // Lets the relay drive the TV for testing: the same actions as the remote keys.
    function runCommand(action) {
        if (action === 'toggle-order') setOrder(!isRandom());
        else if (action === 'random') setOrder(true);
        else if (action === 'ordered') setOrder(false);
        else if (action === 'zoom' && state.layer === 'main' && state.photoState === 'ready') openFullscreen();
        else if (action === 'close' && state.layer === 'fullscreen') closeFullscreen();
    }

    // html2canvas draws SVG icons as standalone images (CSS stroke/fill don't reach them) and
    // can't paint gradient-clipped text: bake both into the copy it renders.
    function fixForCapture(doc) {
        var view = doc.defaultView;
        Array.prototype.forEach.call(doc.querySelectorAll('svg'), function (svg) {
            var cs = view.getComputedStyle(svg);
            ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'].forEach(function (prop) {
                svg.setAttribute(prop, cs.getPropertyValue(prop));
            });
        });
        var originals = document.querySelectorAll('#slides img');
        Array.prototype.forEach.call(doc.querySelectorAll('#slides img'), function (copy, i) {
            var img = originals[i];
            if (!img || !img.naturalWidth) return;
            var box = img.parentNode.getBoundingClientRect();
            var pick = img.style.objectFit === 'cover' ? Math.max : Math.min;
            var scale = pick(box.width / img.naturalWidth, box.height / img.naturalHeight);
            var w = img.naturalWidth * scale, h = img.naturalHeight * scale;
            copy.style.cssText = 'position:absolute;object-fit:fill;width:' + w + 'px;height:' + h +
                'px;left:' + (box.width - w) / 2 + 'px;top:' + (box.height - h) / 2 + 'px';
        });
        Array.prototype.forEach.call(doc.querySelectorAll('.brand, .splash-brand'), function (el) {
            el.style.background = 'none';
            el.style.color = '#dbe7ff';
        });
    }

    function whenPhotoShows(fn, secondsLeft) {
        var item = state.photos[state.pos];
        if ((item && !item.video && slides.uri === item.uri && slides.front) || secondsLeft <= 0) {
            setTimeout(fn, 1200); // let the crossfade finish
            return;
        }
        setTimeout(function () { whenPhotoShows(fn, secondsLeft - 1); }, 1000);
    }

    function captureScreen() {
        var go = function () {
            html2canvas(document.body, {
                width: 1920, height: 1080, scale: 0.75, useCORS: true, logging: false,
                backgroundColor: '#0a0e16',
                ignoreElements: function (el) { return el.tagName === 'VIDEO'; },
                onclone: fixForCapture
            }).then(function (canvas) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', FEED_URL.replace(/feed\.json$/, 'screenshot'));
                xhr.setRequestHeader('Content-Type', 'text/plain');
                xhr.send(canvas.toDataURL('image/jpeg', 0.8));
            }, function (e) { log('capture failed: ' + e); });
        };
        if (window.html2canvas) { go(); return; }
        var script = document.createElement('script'); // loaded only when a screenshot is asked for
        script.src = 'js/vendor/html2canvas.min.js';
        script.onload = go;
        document.head.appendChild(script);
    }

    var lastUsbNames = null, lastUsbRename = null;
    async function syncFeed() {
        if (!IS_TV && !LIVE_PREVIEW) return;
        var items;
        try {
            if (!FEED_URL) throw new Error('no relay');
            var data = JSON.parse(await fetchText(FEED_URL, 20000));
            if (data.command && data.command !== lastCommand) {
                lastCommand = data.command;
                runCommand(data.command.split(' ')[1]);
            }
            if (data.usbNames && data.usbNames !== lastUsbNames) {
                lastUsbNames = data.usbNames;
                sendUsbNames();
            }
            if (data.usbRename && data.usbRename !== lastUsbRename) {
                lastUsbRename = data.usbRename;
                renameUsbFiles();
            }
            if (data.capture && data.capture !== lastCapture) {
                lastCapture = data.capture;
                if (/photo/.test(data.capture)) whenPhotoShows(captureScreen, 90);
                else captureScreen();
            }
            items = data.items.map(function (it) {
                return {
                    uri: new URL(it.url, FEED_URL).href,
                    album: it.album,
                    video: it.type === 'video'
                };
            });
            state.remoteError = '';
        } catch (e) {
            if (FEED_URL) log('feed error: ' + e.message + ', falling back to Drive photos');
            state.remoteError = FEED_URL ? e.message : '';
            try {
                items = [];
                if (DRIVE_FOLDER_ID) await listDriveFolder(DRIVE_FOLDER_ID, '', 0, items);
                items = items.filter(function (i) { return !i.video; });
            } catch (e2) {
                if (!state.scanned.length) mergeMedia();
                return; // keep showing what we already have
            }
        }
        var key = items.map(function (i) { return i.uri; }).join('|');
        if (key === state.remoteKey) return;
        log('feed: ' + items.length + ' items');
        state.remoteKey = key;
        state.remoteItems = items;
        mergeMedia();
    }

    // ------------------------------------------------------------------ USB

    var storagesLogged = '';
    function listStorages() {
        return new Promise(function (resolve) {
            if (!IS_TV) { resolve([]); return; }
            try {
                tizen.filesystem.listStorages(function (storages) {
                    var seen = storages.map(function (s) { return s.label + '/' + s.type + '/' + s.state; }).join(', ');
                    if (seen !== storagesLogged) { storagesLogged = seen; log('storages: ' + (seen || 'none')); }
                    resolve(storages
                        .filter(function (s) { return String(s.type).toUpperCase() === 'EXTERNAL' && String(s.state).toUpperCase() === 'MOUNTED'; })
                        .map(function (s) { return s.label; }));
                }, function (e) {
                    log('storages error: ' + (e && (e.name + ' ' + e.message)));
                    resolve([]);
                });
            } catch (e) {
                log('storages exception: ' + e.message);
                state.usbError = e.message;
                resolve([]);
            }
        });
    }

    // The older File API first: on this TV (Tizen 6.0) the newer listDirectory returns the right
    // number of entries but with names repeated (a folder of 60 files came back with 22–42 distinct).
    function listDir(path) {
        return listDirOld(path).then(function (entries) { return entries.length ? entries : listDirNew(path).then(function (e) { return e || []; }); });
    }

    // Tizen 5.0+ path API.
    function listDirNew(path) {
        return new Promise(function (resolve) {
            if (!tizen.filesystem.listDirectory) { resolve(null); return; }
            try {
                tizen.filesystem.listDirectory(path, function (names) {
                    resolve(names.map(function (name) {
                        var full = path + '/' + name;
                        var isDir = false;
                        try { isDir = tizen.filesystem.isDirectory(full); } catch (e) { /* unreadable */ }
                        return { name: name, path: full, isDir: isDir };
                    }));
                }, function () { resolve(null); });
            } catch (e) { resolve(null); }
        });
    }

    function listDirOld(path) {
        return new Promise(function (resolve) {
            try {
                tizen.filesystem.resolve(path, function (dir) {
                    dir.listFiles(function (files) {
                        resolve(files.map(function (f) {
                            return { name: f.name, path: path + '/' + f.name, isDir: f.isDirectory, uri: f.toURI() };
                        }));
                    }, function () { resolve([]); });
                }, function () { resolve([]); }, 'r');
            } catch (e) { resolve([]); }
        });
    }

    function toUri(entry) {
        return entry.uri || tizen.filesystem.toURI(entry.path);
    }

    async function walk(path, depth, out, token) {
        if (depth > MAX_DEPTH || out.length >= MAX_ITEMS || token !== usbToken) return;
        var entries = await listDir(path);
        entries.sort(function (a, b) { return a.name.localeCompare(b.name); });
        var album = path.split('/').pop();
        for (var i = 0; i < entries.length && out.length < MAX_ITEMS; i++) {
            var e = entries[i];
            if (e.name.charAt(0) === '.') continue;
            if (e.isDir) {
                if (!SKIP_DIRS[e.name.toLowerCase()]) await walk(e.path, depth + 1, out, token);
            } else if (IMAGE_EXT.test(e.name) || VIDEO_EXT.test(e.name)) {
                try { out.push({ uri: toUri(e), album: album, video: VIDEO_EXT.test(e.name) }); } catch (err) { /* skip */ }
            }
        }
    }

    var usbToken = 0;
    async function scanUsb(force) {
        var roots = await listStorages();
        var key = roots.join('|');
        if (!force && key === state.usbKey) return;
        state.usbKey = key;
        var token = ++usbToken;
        var found = [];
        for (var i = 0; i < roots.length; i++) {
            var top = await listDir(roots[i]);
            var album = top.filter(function (e) { return e.isDir && e.name.toLowerCase() === ALBUM_FOLDER; })[0];
            // Only a TV_ALBUM folder joins the album: the rest of a USB drive stays private (its videos
            // are listed behind the code of the "Video" button).
            if (album) await walk(album.path, 0, found, token);
        }
        if (token !== usbToken) return; // a newer scan started meanwhile
        state.usbItems = found;
        prepareUsbVideos(roots, key); // so the "Video" list is ready the moment the code is in
        log('usb: ' + roots.length + ' drives, ' + found.length + ' album items');
        mergeMedia();
    }

    // ------------------------------------------------------------------ media list

    function mergeMedia() {
        state.scanned = (IS_TV || LIVE_PREVIEW ? [] : MOCK_PHOTOS).concat(state.remoteItems, state.usbItems);
        applyOrder();
    }

    // A random order stays as dealt while the list changes underneath (a Drive photo is added or
    // removed, a USB drive comes in): items keep their places and new ones go right after the one on
    // screen, so nothing comes round again before the rest have played. Key 2 (order) deals afresh.
    function mergeOrder(list, random) {
        if (!random) return list; // in order: the list's own order (by name)
        var byUri = {}, seen = {}, kept = [];
        list.forEach(function (p) { byUri[p.uri] = p; });
        state.photos.forEach(function (p) {
            var q = byUri[p.uri];
            if (q && !seen[q.uri]) { kept.push(q); seen[q.uri] = true; }
        });
        var added = shuffled(list.filter(function (p) { return !seen[p.uri]; }));
        var cur = state.photos[state.pos];
        var at = cur ? kept.map(function (p) { return p.uri; }).indexOf(cur.uri) : -1;
        if (at < 0) at = Math.min(state.pos, kept.length) - 1;
        Array.prototype.splice.apply(kept, [at + 1, 0].concat(added));
        return kept;
    }

    function applyOrder(restart) {
        var current = restart ? null : state.photos[state.pos];
        var kind = isRandom() ? 'random' : 'order';
        var fresh = restart || kind !== state.orderKind || !state.photos.length;
        state.orderKind = kind;
        var album = state.scanned;
        state.photos = !fresh ? mergeOrder(album, state.shuffle) : state.shuffle ? shuffled(album) : album;
        var keep = current ? state.photos.map(function (p) { return p.uri; }).indexOf(current.uri) : -1;
        // the one on screen dropped out: carry on with the one that took its place, not from the top
        if (keep < 0 && current && !fresh) keep = Math.min(state.pos, state.photos.length - 1);
        state.pos = keep >= 0 ? keep : 0;
        if (state.photos.length) setPhotoState('ready');
        else if (state.initialDone) setPhotoState('none');
        updatePanelTitle();
        if (keep < 0) slides.uri = null; // the item on screen was removed
        showCurrent();
        restartTimer();
    }

    function setPhotoState(s) {
        state.photoState = s;
        var ready = s === 'ready';
        $('#photoMsg').classList.toggle('hidden', ready);
        $('#photoCaption').classList.toggle('hidden', !ready);
        $('#slides').classList.toggle('hidden', !ready);
        if (ready) return;
        var title, hint;
        if (s === 'loading') {
            title = 'Đang tải ảnh…';
            hint = '';
        } else {
            title = 'Album chưa có ảnh';
            hint = 'Thêm ảnh vào thư mục Google Drive đã khai trong js/config.js, hoặc cắm USB có thư mục TV_ALBUM.';
            if (state.remoteError) hint += ' (Chưa đọc được danh sách: ' + state.remoteError + ')';
        }
        $('#photoMsg .title').textContent = title;
        $('#photoMsg .hint').textContent = hint;
    }

    // ------------------------------------------------------------------ slideshow

    var imageCache = []; // last few decoded images: [{uri, promise}]
    function loadImage(uri) {
        for (var i = 0; i < imageCache.length; i++) if (imageCache[i].uri === uri) return imageCache[i].promise;
        var promise = new Promise(function (resolve, reject) {
            var img = new Image();
            if (/^https:\/\/lh3\.googleusercontent\.com\//.test(uri)) img.crossOrigin = 'anonymous';
            img.onload = function () { resolve(img); };
            img.onerror = reject;
            img.src = uri;
        }).then(function (img) {
            // Decode off the main thread so the crossfade doesn't stutter.
            return img.decode ? img.decode().then(function () { return img; }, function () { return img; }) : img;
        });
        imageCache.push({ uri: uri, promise: promise });
        if (imageCache.length > 4) imageCache.shift();
        promise.catch(function () { /* handled by callers */ });
        return promise;
    }

    // Album frame is 9:16 like a phone: phone-shaped media fill it; other shapes show whole on a
    // blurred backdrop rather than being cropped.
    var FRAME_RATIO = 9 / 16;
    function fitFor(w, h) {
        return w && h && Math.abs(w / h - FRAME_RATIO) / FRAME_RATIO < 0.12 ? 'cover' : 'contain';
    }

    // The frame takes the full height of the main area; the right column is exactly as wide.
    function sizeFrame() {
        var w = Math.round($('#photoFrame').clientHeight * FRAME_RATIO);
        $('#photoFrame').style.width = w + 'px';
        $('.photo-pane').style.width = w + 'px';
        paintCorners($('#photoFrame'), 24);
    }

    // Colour of the page background (135deg gradient #0e1522 -> #1a2333 at 55% -> #0a0e16 over the
    // 1920x1080 screen) at a point, to paint corner masks that blend in.
    function backgroundAt(x, y) {
        var t = ((x - 960) * 0.7071 + (y - 540) * 0.7071) / 2121.3 + 0.5;
        var a, b, f;
        if (t <= 0.55) { a = [14, 21, 34]; b = [26, 35, 51]; f = Math.max(t, 0) / 0.55; }
        else { a = [26, 35, 51]; b = [10, 14, 22]; f = Math.min((t - 0.55) / 0.45, 1); }
        return 'rgb(' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * f); }).join(',') + ')';
    }

    // The TV's video layer ignores rounded corners: cover each square corner with background colour,
    // leaving a quarter circle of the clip showing.
    function paintCorners(box, radius) {
        var r = box.getBoundingClientRect();
        var spots = { tl: [r.left, r.top, '100% 100%'], tr: [r.right, r.top, '0 100%'],
            bl: [r.left, r.bottom, '100% 0'], br: [r.right, r.bottom, '0 0'] };
        Object.keys(spots).forEach(function (k) {
            var s = spots[k];
            $('.corner.' + k, box).style.background = 'radial-gradient(circle at ' + s[2] + ', transparent ' +
                (radius - 0.5) + 'px, ' + backgroundAt(s[0], s[1]) + ' ' + radius + 'px)';
        });
    }

    function imageLayer(img) {
        var layer = document.createElement('div');
        layer.className = 'slide';
        img.style.objectFit = fitFor(img.naturalWidth, img.naturalHeight);
        var canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 27;
        drawCover(canvas, img);
        var dim = document.createElement('div');
        dim.className = 'dim';
        layer.appendChild(canvas);
        layer.appendChild(dim);
        layer.appendChild(img.parentNode ? img.cloneNode() : img);
        return layer;
    }

    // Resolves once the clip can play; TVs have few video decoders, so only one clip exists at a time.
    // Remote clips are streamed first; if the TV's player refuses the link, the browser downloads
    // the clip and the player gets the in-memory copy instead.
    function videoLayer(item) {
        return new Promise(function (resolve, reject) {
            var layer = document.createElement('div');
            layer.className = 'slide video';
            var video = document.createElement('video');
            video.muted = !wantsSound();
            video.loop = state.photos.length === 1;
            video.setAttribute('playsinline', '');
            video.preload = 'auto';
            var remote = /^https?:/.test(item.uri);
            var downloaded = false;
            var done = false;
            var timer = setTimeout(function () { finish(new Error('timeout')); }, remote ? 120000 : 20000);
            function finish(err) {
                if (done) return;
                done = true;
                clearTimeout(timer);
                if (err) { unloadVideo(video); reject(err); } else resolve(layer);
            }
            function useDownload() {
                downloaded = true;
                var started = Date.now();
                fetchBlob(item.uri, 110000).then(function (blob) {
                    log('clip downloaded ' + Math.round(blob.size / 1024) + 'KB in ' + ((Date.now() - started) / 1000).toFixed(1) + 's');
                    if (done) return;
                    video.blobUrl = URL.createObjectURL(blob);
                    video.src = video.blobUrl;
                    video.load();
                }, function (e) {
                    log('clip download failed: ' + e.message);
                    finish(e);
                });
            }
            video.addEventListener('canplay', function () {
                if (!done) log('clip ready (' + (downloaded ? 'downloaded' : 'streamed') + ')');
                finish();
            });
            video.addEventListener('error', function () {
                var code = video.error ? video.error.code : '?';
                if (done) return;
                if (remote && !downloaded) {
                    log('stream refused code=' + code + ', downloading instead');
                    useDownload();
                } else {
                    log('video error code=' + code);
                    finish(new Error('video'));
                }
            });
            video.addEventListener('loadedmetadata', function () {
                video.style.objectFit = fitFor(video.videoWidth, video.videoHeight);
                log('video duration=' + Math.round(video.duration) + 's');
            });
            // The end-of-clip timer is armed from the real duration once playback starts.
            video.addEventListener('playing', function () { if (slides.front === layer) restartTimer(); });
            video.addEventListener('ended', function () {
                log('video ended');
                if (slides.front === layer) advance(1);
            });
            layer.appendChild(video);
            video.src = item.uri;
            video.load();
        });
    }

    function unloadVideo(video) {
        try {
            video.pause();
            video.removeAttribute('src');
            video.load();
        } catch (e) { /* already gone */ }
        if (video.blobUrl) {
            URL.revokeObjectURL(video.blobUrl);
            video.blobUrl = null;
        }
    }

    function wantsSound() {
        return state.soundOn;
    }

    function syncMute() {
        var v = currentVideo();
        if (v) v.muted = !wantsSound();
        updateSoundBadge();
    }

    var SPEAKER = '<path d="M11 5 6 9H2v6h4l5 4V5z" fill="#fff"/>';
    function updateSoundBadge() {
        var item = state.photos[state.pos];
        var badge = $('#soundBadge');
        badge.classList.toggle('hidden', !(item && item.video));
        badge.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24">' + SPEAKER + (state.soundOn
            ? '<path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>'
            : '<path d="M22 9l-6 6M16 9l6 6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>') + '</svg>';
    }

    function toggleSound() {
        state.soundOn = !state.soundOn;
        syncMute();
        toast(state.soundOn ? 'Đã bật tiếng' : 'Đã tắt tiếng');
    }

    function currentVideo() {
        return slides.front ? slides.front.querySelector('video') : null;
    }

    // ------------------------------------------------------------------ loading runner

    // Pixel boy with round glasses (drawn here, 14x16 grid, 7px pixels). Legs: running / tucked.
    var RUNNER_COLORS = { H: '#1b1b1f', S: '#f6c99f', G: '#111111', W: '#ffffff', E: '#111111',
        M: '#e2574c', Y: '#ffd23f', B: '#1f3f9a', K: '#6b4226' };
    var RUNNER_BODY = [
        '....HHHHHH....', '..HHHHHHHHHH..', '.HHHHHHHHHHHH.', '.HHSSSSSSSSHH.',
        '.SGGGGGGGGGGS.', '.SGWEGSSGEWGS.', '.SGGGGSSGGGGS.', '.SSSSSSSSSSSS.',
        '..SSSSMMSSSS..', '...SSSSSSSS...', '..YYYYYYYYYY..', '.SYYYYYYYYYYS.',
        '.SYYYYYYYYYYS.', '...BBBBBBBB...'
    ];
    var RUNNER_LEGS_GROUND = ['...SS....SS...', '..KKK....KKK..'];
    var RUNNER_LEGS_AIR = ['....SS..SS....', '....KK..KK....'];
    var LOADER_LINES = [
        'Đợi xíu nha…',
        'Nobita đang chạy đi lấy clip, kiên nhẫn chút!',
        'Sắp xong rồi, đừng bấm lung tung nha!',
        'Mạng nhà mình đang chạy bộ…'
    ];

    function pixels(rows, top) {
        var out = '';
        rows.forEach(function (row, y) {
            for (var x = 0; x < row.length; x++) {
                var c = RUNNER_COLORS[row.charAt(x)];
                if (c) out += '<rect x="' + x * 7 + '" y="' + (y + top) * 7 + '" width="7" height="7" fill="' + c + '"/>';
            }
        });
        return out;
    }

    function drawRunner() {
        $('#loaderRunner').innerHTML = '<svg width="98" height="112" viewBox="0 0 98 112" shape-rendering="crispEdges">' +
            pixels(RUNNER_BODY, 0) +
            '<g class="legs-ground">' + pixels(RUNNER_LEGS_GROUND, 14) + '</g>' +
            '<g class="legs-air">' + pixels(RUNNER_LEGS_AIR, 14) + '</g></svg>';
    }

    var loaderTimer, loaderLineTimer;
    function showLoader(token) {
        clearTimeout(loaderTimer);
        loaderTimer = setTimeout(function () { // only when loading is actually slow: no flicker
            if (token !== slides.token) return;
            var line = 0;
            $('#loaderText').textContent = LOADER_LINES[0];
            clearInterval(loaderLineTimer);
            loaderLineTimer = setInterval(function () {
                line = (line + 1) % LOADER_LINES.length;
                $('#loaderText').textContent = LOADER_LINES[line];
            }, 2200);
            $('#loader').classList.remove('hidden');
        }, 350);
    }

    function hideLoader() {
        if (/[?&]loader=1/.test(location.search)) return; // preview: keep it on screen
        clearTimeout(loaderTimer);
        clearInterval(loaderLineTimer);
        $('#loader').classList.add('hidden');
    }

    var slides = { front: null, token: 0, uri: null };
    function showCurrent() {
        var item = state.photos[state.pos];
        updateCaptions();
        if (usbOpen()) { slides.uri = null; return; } // shown again when the USB screens close
        if (!item) {
            clearSlides();
            return;
        }
        if (item.uri === slides.uri) return;
        slides.uri = item.uri;
        var token = ++slides.token;
        showLoader(token);
        var old = currentVideo();
        if (old) { // free the decoder, and drop its black layer so the loading screen shows
            unloadVideo(old);
            old.parentNode.style.visibility = 'hidden';
        }
        var ready = item.video ? videoLayer(item) : loadImage(item.uri).then(imageLayer);
        ready.then(function (layer) {
            if (token !== slides.token) {
                var v = layer.querySelector('video');
                if (v) unloadVideo(v);
                return;
            }
            hideLoader();
            swapIn(layer);
        }, function () {
            if (token !== slides.token) return;
            hideLoader();
            log('load failed: ' + (item.video ? 'clip ' : 'photo ') + item.uri.slice(0, 80));
            toast(item.video ? 'Không phát được clip này, chuyển tiếp' : 'Không mở được ảnh này, chuyển tiếp');
            if (state.photos.length > 1) setTimeout(function () { advance(1); }, 1500);
        });
    }

    // The relay needs a moment to look a Drive clip up; ask for the next one now so it starts at once.
    var warmed = {}; // uri -> when it was looked up (the relay keeps a lookup ~20 min)
    var WARM_MS = 10 * 60 * 1000;
    function isWarm(item) { return item && warmed[item.uri] && Date.now() - warmed[item.uri] < WARM_MS; }

    function warm(item) {
        if (!item || !item.video || !/\/drive\/[\w-]+\.mp4$/.test(item.uri) || item.broken || isWarm(item)) return;
        warmed[item.uri] = Date.now();
        fetchText(item.uri.replace(/\.mp4$/, '.warm'), 30000).catch(function (e) {
            if (/404/.test(e.message)) item.broken = true; // gone from the relay: skip it
        });
    }

    // The relay pulls the next clip into its RAM while this one plays (the TV's own player can't
    // play an in-memory copy), so the switch is near instant.
    function warmNext() {
        if (state.photos.length) warm(state.photos[(state.pos + 1) % state.photos.length]);
    }

    function swapIn(layer) {
        warmNext();
        var root = $('#slides');
        root.appendChild(layer);
        var old = slides.front;
        slides.front = layer;
        var video = layer.querySelector('video');
        if (video && !state.paused && !document.hidden && state.layer !== 'announce') {
            video.play().catch(function (e) { log('play refused: ' + e.message); });
        }
        // Next frame, so the opacity transition actually runs.
        requestAnimationFrame(function () {
            layer.classList.add('show');
            if (old) old.classList.remove('show');
            setTimeout(function () {
                if (!old || !old.parentNode) return;
                var v = old.querySelector('video');
                if (v) unloadVideo(v);
                old.parentNode.removeChild(old);
            }, 1000);
        });
    }

    function clearSlides() {
        slides.uri = null;
        slides.token++;
        hideLoader();
        $all('#slides .slide').forEach(function (layer) {
            var v = layer.querySelector('video');
            if (v) unloadVideo(v);
            layer.parentNode.removeChild(layer);
        });
        slides.front = null;
    }

    function drawCover(canvas, img) {
        try {
            var ctx = canvas.getContext('2d');
            var scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
            var w = img.naturalWidth * scale, h = img.naturalHeight * scale;
            ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
        } catch (e) { /* backdrop is decoration only */ }
    }

    function updateCaptions() {
        var item = state.photos[state.pos];
        updateSoundBadge();
        renderZoomInfo();
        var count = state.photos.length ? (state.pos + 1) + ' / ' + state.photos.length : '';
        ['#photoCaption', '#fsCaption'].forEach(function (sel) {
            var title = !item ? '' : (item.video ? '▶ ' : '') + item.album;
            var paused = sel === '#fsCaption' && state.paused ? 'Đã tạm dừng' : '';
            $(sel + ' .album').textContent = title;
            $(sel + ' .count').innerHTML = escapeHtml(count + (paused ? '  ·  ' + paused : ''));
            $(sel).classList.toggle('empty', !item);
        });
    }

    var slideTimer;
    function restartTimer() {
        clearTimeout(slideTimer);
        if (state.paused || document.hidden || state.layer === 'announce' || usbOpen() || state.photos.length < 2) return;
        var item = state.photos[state.pos];
        var ms = state.slideSec * 1000;
        if (item && item.video) {
            // Clips move on at their end. Some TV players never fire "ended", so the timer is
            // a backstop: the clip's remaining time plus a little, or a long cap while unknown.
            var v = currentVideo();
            var d = v && slides.uri === item.uri ? v.duration : NaN;
            ms = isFinite(d) && d > 0 ? Math.min((d - v.currentTime + 2) * 1000, MAX_VIDEO_MS) : MAX_VIDEO_MS;
        }
        slideTimer = setTimeout(function () { advance(1); }, ms);
    }

    // Preloads the next photo before switching, skipping files that fail to decode.
    async function advance(step) {
        var list = state.photos;
        if (list.length < 2) return;
        var candidate = state.pos;
        for (var tries = 0; tries < Math.min(5, list.length - 1); tries++) {
            candidate = (candidate + step + list.length) % list.length;
            if (list[candidate].broken) continue;
            if (list[candidate].video) break; // clips are checked when they load
            try {
                await loadImage(list[candidate].uri);
                break;
            } catch (e) { /* broken file: try the next one */ }
        }
        if (list !== state.photos) return; // the list changed meanwhile
        log('advance ' + state.pos + ' -> ' + candidate + ' of ' + list.length + (list[candidate].video ? ' (clip)' : ''));
        state.pos = candidate;
        showCurrent();
        restartTimer();
    }

    function step(delta) {
        if (!state.photos.length) return;
        state.pos = (state.pos + delta + state.photos.length) % state.photos.length;
        showCurrent();
        restartTimer();
        flashFullscreenInfo();
    }

    // ------------------------------------------------------------------ album order (remote key 2)

    function isRandom() { return state.shuffle; }

    // Remote key 2 and the two order icons: by name / random.
    function setOrder(random) {
        state.shuffle = random;
        store.set('shuffle', random);
        toast(random ? 'Ngẫu nhiên' : 'Theo thứ tự');
        applyOrder();
    }

    function toggleZoom() {
        if (state.layer === 'fullscreen') { closeFullscreen(); return; }
        if (state.photoState === 'ready') openFullscreen();
    }

    function updatePanelTitle() {
        var random = state.shuffle;
        // the chip in the frame's corner says in which order the album plays
        $('#photoTitle').textContent = 'Album · ' + (random ? 'Ngẫu nhiên' : 'Thứ tự');
        $('#btnOrderSeq').classList.toggle('active', !random);
        $('#btnOrderRandom').classList.toggle('active', random);
        $('#photoNote').innerHTML = '<b>2</b>Thứ tự / ngẫu nhiên<b>3</b>Tiếng<b>4</b>Thông báo<b>6</b>Phóng to';
        syncMute();
    }

    // ------------------------------------------------------------------ fullscreen

    var infoTimer;
    function flashFullscreenInfo() {
        var cap = $('#fsCaption');
        cap.classList.remove('faded');
        clearTimeout(infoTimer);
        infoTimer = setTimeout(function () { cap.classList.add('faded'); }, 3000);
    }

    function openFullscreen() {
        $('#zoomMedia').insertBefore($('#slides'), $('#zoomMedia').firstChild); // the same slideshow, moved
        $('#fullscreen').classList.remove('hidden');
        paintCorners($('#zoomMedia'), 24);
        state.layer = 'fullscreen';
        swallowEnterSince = Date.now();
        syncMute();
        renderZoomInfo();
    }

    function closeFullscreen() {
        $('#photoFrame').insertBefore($('#slides'), $('#photoTitle'));
        $('#fullscreen').classList.add('hidden');
        state.layer = 'main';
        syncMute();
        if (state.paused) togglePause();
        updateCaptions();
        setFocus($('#photoFrame'));
    }

    function togglePause() {
        state.paused = !state.paused;
        var v = currentVideo();
        if (v) {
            if (state.paused) v.pause();
            else v.play().catch(function () { /* ignore */ });
        }
        toast(state.paused ? 'Tạm dừng' : 'Phát tiếp');
        updateCaptions();
        restartTimer();
    }

    // ---- zoom view: right-hand side (album name and position)

    function infoBody() {
        return state.layer === 'fullscreen' ? $('#zoomBody') : null;
    }

    function renderZoomInfo() {
        var body = infoBody();
        if (!body) return;
        var item = state.photos[state.pos];
        body.scrollTop = 0;
        if (!item) { body.innerHTML = ''; return; }
        body.innerHTML = '<div class="zoom-caption">' + escapeHtml(item.album) + '</div>' +
            '<div class="zoom-sub">' + (item.video ? 'Clip ' : 'Ảnh ') + (state.pos + 1) + ' / ' + state.photos.length + '</div>';
    }

    function scrollInfo(dir) {
        var body = infoBody();
        if (body) body.scrollTop += dir * 240;
    }

    // ------------------------------------------------------------------ top-bar actions

    function updateButtons() {
        $('#btnInterval').textContent = 'Chuyển ảnh: ' + state.slideSec + ' giây';
    }

    var ACTIONS = {
        fullscreen: function () {
            if (state.photoState === 'ready') openFullscreen();
        },
        interval: function () {
            state.slideSec = INTERVALS[(INTERVALS.indexOf(state.slideSec) + 1) % INTERVALS.length];
            store.set('slideSec', state.slideSec);
            updateButtons();
            restartTimer();
        },
        announce: function () { showLocalAnnouncement(); },
        usbVideos: function () { openUsbLock(); },
        orderSeq: function () { setOrder(false); },
        orderRandom: function () { setOrder(true); },
        moreApps: function () {
            state.showAllApps = !state.showAllApps;
            $('#appGrid').classList.toggle('expanded', state.showAllApps);
            renderApps();
        },
        photos: function () {
            if (state.photoState === 'ready') openFullscreen();
            else {
                setPhotoState('loading');
                state.remoteKey = null;
                Promise.all([syncFeed(), scanUsb(true)]).then(mergeMedia);
            }
        }
    };

    // ------------------------------------------------------------------ focus & spatial navigation

    var focused = null;
    function setFocus(el) {
        if (!el) return;
        if (focused) focused.classList.remove('focused');
        focused = el;
        el.classList.add('focused');
        keepVisible(el);
    }

    function keepVisible(el) {
        var box = el.parentNode;
        if (!box || box.id !== 'appGrid') return;
        var margin = 40;
        if (el.offsetTop - margin < box.scrollTop) box.scrollTop = el.offsetTop - margin;
        else if (el.offsetTop + el.offsetHeight + margin > box.scrollTop + box.clientHeight) {
            box.scrollTop = el.offsetTop + el.offsetHeight + margin - box.clientHeight;
        }
    }

    function candidates() {
        var root = state.layer === 'menu' ? $('#menu') : $('#home');
        return $all('.focusable', root).filter(function (el) { return el.offsetParent !== null; });
    }

    // Picks the nearest element in the pressed direction, preferring ones that line up.
    function move(dir) {
        if (!focused) { setFocus(candidates()[0]); return; }
        var a = focused.getBoundingClientRect();
        var best = null, bestScore = Infinity;
        candidates().forEach(function (el) {
            if (el === focused) return;
            var b = el.getBoundingClientRect();
            var gap, offset;
            if (dir === 'left' || dir === 'right') {
                gap = dir === 'right' ? b.left - a.right : a.left - b.right;
                offset = Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom));
            } else {
                gap = dir === 'down' ? b.top - a.bottom : a.top - b.bottom;
                offset = Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right));
            }
            if (gap < -30) return; // not in that direction (small overlap allowed for scaled items)
            var score = Math.max(gap, 0) + offset * 3;
            if (score < bestScore) { bestScore = score; best = el; }
        });
        if (best) setFocus(best);
    }

    function activate(el) {
        if (!el) return;
        if (el.onAction) el.onAction();
        else if (ACTIONS[el.getAttribute('data-action')]) ACTIONS[el.getAttribute('data-action')]();
        else if (el.classList.contains('tile')) launchApp(el.getAttribute('data-id'));
    }

    // ------------------------------------------------------------------ keys

    var enterDownAt = 0, longTimer, longFired = false;
    var swallowEnterSince = 0; // OK is still held after it switched screens

    function focusName() {
        if (!focused) return '-';
        return focused.getAttribute('data-id') || focused.getAttribute('data-action') || focused.id || focused.className;
    }

    function onKeyDown(e) {
        var k = e.keyCode;
        if (!e.repeat) log('key ' + k + ' layer=' + state.layer + ' focus=' + focusName());
        if (k === KEY.ENTER && swallowEnterSince && Date.now() - swallowEnterSince < 3000) {
            e.preventDefault();
            return;
        }
        if (state.layer === 'splash') {
            if ((k === KEY.ENTER || k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) && endSplash) {
                swallowEnterSince = Date.now();
                endSplash();
            }
            e.preventDefault();
            return;
        }
        if (state.layer === 'announce') {
            e.preventDefault();
            // the press (or held key) that opened it must not close it straight away
            if (e.repeat || Date.now() - announce.openedAt < 800) return;
            var arrow = k === KEY.LEFT || k === KEY.RIGHT || k === KEY.UP || k === KEY.DOWN;
            if (k === KEY.ENTER || k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE || k === KEY.DIGIT_4 || arrow) {
                if (k === KEY.ENTER) swallowEnterSince = Date.now(); // OK still held must not open what is underneath
                dismissAnnouncement();
                // arrows go straight on to the home screen: one press closes it and moves
                if (arrow) move(k === KEY.LEFT ? 'left' : k === KEY.RIGHT ? 'right' : k === KEY.UP ? 'up' : 'down');
            }
            return;
        }
        if (usbOpen() && e.repeat && k === KEY.ENTER) { e.preventDefault(); return; } // a held OK acts once
        if (state.layer === 'usblock') { usbLockKey(k); e.preventDefault(); return; }
        if (state.layer === 'usblist') { usbListKey(k); e.preventDefault(); return; }
        if (state.layer === 'usbplay') { usbPlayKey(k); e.preventDefault(); return; }
        var mediaLayer = state.layer === 'main' || state.layer === 'fullscreen';
        if (mediaLayer && (k === KEY.DIGIT_2 || k === KEY.DIGIT_3 || k === KEY.DIGIT_4 || k === KEY.DIGIT_6)) {
            // their own keys, because OK opens whatever app tile happens to be selected
            if (k === KEY.DIGIT_6) toggleZoom();
            else if (k === KEY.DIGIT_4) showLocalAnnouncement();
            else if (k === KEY.DIGIT_3) toggleSound();
            else setOrder(!isRandom()); // key 2: in order <-> random
            e.preventDefault();
            return;
        }
        if (state.layer === 'fullscreen') {
            if (k === KEY.LEFT || k === KEY.REW) step(-1);
            else if (k === KEY.RIGHT || k === KEY.FF) step(1);
            else if (k === KEY.PLAY_PAUSE || k === KEY.PLAY || k === KEY.PAUSE) togglePause();
            else if (k === KEY.UP || k === KEY.DOWN) scrollInfo(k === KEY.DOWN ? 1 : -1);
            else if (k === KEY.ENTER || k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) closeFullscreen();
            else return;
            e.preventDefault();
            return;
        }
        if (k === KEY.LEFT) move('left');
        else if (k === KEY.RIGHT) move('right');
        else if (k === KEY.UP) move('up');
        else if (k === KEY.DOWN) move('down');
        else if (k === KEY.ENTER) onEnterDown();
        else if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) {
            if (state.layer === 'menu') closeMenu();
            // On the home screen Back does nothing: there is nowhere to go back to.
        } else return;
        e.preventDefault();
    }

    // App tiles: short press opens, long press opens the menu. Everything else acts at once.
    function onEnterDown() {
        if (focused && focused.classList.contains('feature') && state.layer === 'main') {
            featureDown = focused;
            return;
        }
        if (!focused || !focused.classList.contains('tile') || state.layer !== 'main') {
            activate(focused);
            return;
        }
        if (enterDownAt && Date.now() - enterDownAt < 1500) return; // key repeat while held
        enterDownAt = Date.now();
        longFired = false;
        var tile = focused;
        clearTimeout(longTimer);
        longTimer = setTimeout(function () {
            longFired = true;
            enterDownAt = 0;
            openAppMenu(tile.getAttribute('data-id'));
        }, LONG_PRESS_MS);
    }

    var featureDown = null;
    function onKeyUp(e) {
        if (e.keyCode === KEY.ENTER) swallowEnterSince = 0;
        if (e.keyCode === KEY.ENTER && featureDown) {
            var tile = featureDown;
            featureDown = null;
            if (tile === focused && state.layer === 'main') activate(tile);
            return;
        }
        if (e.keyCode !== KEY.ENTER || !enterDownAt) return;
        clearTimeout(longTimer);
        enterDownAt = 0;
        if (!longFired) activate(focused);
    }

    function registerKeys() {
        if (!IS_TV) return;
        ['MediaPlayPause', 'MediaPlay', 'MediaPause', 'MediaFastForward', 'MediaRewind', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(function (name) {
            try { tizen.tvinputdevice.registerKey(name); } catch (e) { /* not on this remote */ }
        });
    }

    // ------------------------------------------------------------------ weather (Open-Meteo, no key)

    // City for the forecast: set it in js/config.js (weather); this is only the fallback.
    var WEATHER = CONFIG.weather || { name: 'Hà Nội', lat: 21.0285, lon: 105.8542 };
    var WEATHER_REFRESH_MS = 30 * 60 * 1000;
    var WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Filled weather icons, colours set on every shape (no CSS needed, so they draw the same on
    // the TV and in remote screenshots). 64x64 viewBox.
    var CLOUD = 'M18 50h28a11 11 0 0 0 1.6-21.9A15 15 0 0 0 19.2 29 10.5 10.5 0 0 0 18 50z';
    var WX_SVG = {
        sun: '<circle cx="32" cy="32" r="12" fill="#ffc83d"/>' +
            '<g stroke="#ffc83d" stroke-width="4" stroke-linecap="round">' +
            '<path d="M32 6v6M32 52v6M6 32h6M52 32h6M13.6 13.6l4.2 4.2M46.2 46.2l4.2 4.2M13.6 50.4l4.2-4.2M46.2 17.8l4.2-4.2"/></g>',
        moon: '<path d="M38 8a24 24 0 1 0 18 38A20 20 0 0 1 38 8z" fill="#e8edf7"/>',
        partly: '<circle cx="24" cy="24" r="11" fill="#ffc83d"/>' +
            '<g stroke="#ffc83d" stroke-width="3.5" stroke-linecap="round"><path d="M24 4v4M4 24h4M9.9 9.9l2.8 2.8M38.1 9.9l-2.8 2.8"/></g>' +
            '<path d="' + CLOUD + '" fill="#eef2f8"/>',
        cloud: '<path d="' + CLOUD + '" fill="#d5dce8"/>',
        fog: '<path d="' + CLOUD + '" fill="#c4ccd9"/>' +
            '<g stroke="#9aa6b8" stroke-width="4" stroke-linecap="round"><path d="M14 56h36M20 62h24"/></g>',
        rain: '<path d="' + CLOUD + '" transform="translate(0 -6)" fill="#c9d3e3"/>' +
            '<g stroke="#4da3ff" stroke-width="4" stroke-linecap="round"><path d="M24 50l-3 8M34 50l-3 8M44 50l-3 8"/></g>',
        storm: '<path d="' + CLOUD + '" transform="translate(0 -6)" fill="#9aa6b8"/>' +
            '<path d="M35 42l-9 12h7l-3 9 11-14h-7l4-7z" fill="#ffc83d"/>'
    };

    // One clear word per day: sun or rain is what matters. [word, icon, kind]
    function dayWeather(code, chance) {
        chance = chance || 0;
        if (code >= 95) return ['Dông', 'storm', 'rain'];
        if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82) || chance >= 60) return ['Mưa', 'rain', 'rain'];
        if (code >= 51 && code <= 57) return ['Mưa nhỏ', 'rain', 'rain'];
        if (code === 45 || code === 48) return ['Sương mù', 'fog', 'cloud'];
        if (code === 3) return ['Nhiều mây', 'cloud', 'cloud'];
        if (code === 2) return ['Ít mây', 'partly', 'sun'];
        return ['Nắng', 'sun', 'sun'];
    }

    var RAIN_DROP = '<svg width="18" height="18" viewBox="0 0 24 24">' +
        '<path d="M12 2c-3 4.5-7 8.5-7 13a7 7 0 0 0 14 0c0-4.5-4-8.5-7-13z" fill="#6fb6ff"/></svg>';

    function weatherIcon(name, size) {
        return '<svg class="ic" width="' + size + '" height="' + size + '" viewBox="0 0 64 64">' + WX_SVG[name] + '</svg>';
    }

    function loadWeather() {
        var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + WEATHER.lat + '&longitude=' + WEATHER.lon +
            '&current=temperature_2m,weather_code,is_day' +
            '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
            '&timezone=Asia%2FHo_Chi_Minh&forecast_days=7';
        fetchText(url, 20000).then(function (text) {
            var data = JSON.parse(text);
            store.set('weather', data);
            renderWeather(data);
        }, function (e) {
            log('weather error: ' + e.message);
            var cached = store.get('weather', null); // offline: keep the last forecast on screen
            if (cached) renderWeather(cached);
        });
    }

    function renderWeather(data) {
        var now = data.current, daily = data.daily;
        var today = dayWeather(now.weather_code, 0);
        var icon = today[1];
        if (now.is_day === 0 && (icon === 'sun' || icon === 'partly')) icon = 'moon';
        var html = '<div class="wx-now">' + weatherIcon(icon, 120) +
            '<div><div class="wx-temp">' + Math.round(now.temperature_2m) + '°</div>' +
            '<div class="wx-city">' + escapeHtml(WEATHER.name) + '</div></div></div><div class="wx-days">';
        for (var i = 0; i < daily.time.length && i < 7; i++) {
            var ymd = daily.time[i].split('-'); // already in Vietnam time
            var weekday = new Date(+ymd[0], +ymd[1] - 1, +ymd[2]).getDay();
            var chance = daily.precipitation_probability_max[i];
            var w = dayWeather(daily.weather_code[i], chance);
            // The icon says sun or rain; rainy days add the chance of rain under it.
            var rain = w[2] === 'rain' && chance ? RAIN_DROP + chance + '%' : '';
            html += '<div class="wx-day">' +
                '<div class="d">' + (i === 0 ? 'Hôm nay' : WEEKDAY_SHORT[weekday]) + '</div>' +
                weatherIcon(w[1], 88) +
                '<div class="t">' + Math.round(daily.temperature_2m_max[i]) + '°</div>' +
                '<div class="tmin">' + Math.round(daily.temperature_2m_min[i]) + '°</div>' +
                '<div class="w">' + rain + '</div></div>';
        }
        var box = $('#weather');
        box.innerHTML = html + '</div>';
        box.classList.remove('hidden');
    }

    // ------------------------------------------------------------------ announcements
    // Big running / blinking text with music over the whole screen (js/announce.js). Pushed from your
    // relay if you have one (the TV asks it every few seconds), or shown on demand with key 4 / the
    // megaphone button: the one on now, else the last one sent, else the built-in greeting.

    var ANNOUNCE_URL = FEED_URL ? FEED_URL.replace(/feed\.json$/, 'announce.json') : '';
    var ANNOUNCE_POLL_MS = 3000;
    var FALLBACK_ANNOUNCEMENT = { text: 'Nobita TV xin chào cả nhà!', motion: 'bounce', look: 'rainbow', bg: 'party',
        extra: 'confetti', music: 'party' };
    var announce = { shown: null, v: '', dismissed: '', active: null, last: null, before: 'main', resume: false, openedAt: 0 };

    function showAnnouncement(cfg, v, seconds) {
        if (!window.NobitaAnnounce || !cfg) return;
        if (announce.shown) { announce.shown.stop(); announce.shown = null; } // replaced by a newer one
        else {
            if (state.layer === 'menu') closeMenu();
            announce.before = state.layer === 'fullscreen' ? 'fullscreen' : 'main';
            var video = currentVideo();
            announce.resume = !!(video && !video.paused);
            if (video) video.pause();
        }
        state.layer = 'announce';
        clearTimeout(slideTimer);
        var box = $('#announce');
        box.classList.remove('hidden');
        announce.v = v || '';
        announce.openedAt = Date.now();
        announce.shown = NobitaAnnounce.show(box, cfg, {
            music: true, releaseAudio: true, duration: seconds, hint: 'Bấm OK để tắt thông báo',
            onEnd: function () { hideAnnouncement(); }
        });
        log('announcement on: ' + (cfg.text || '').slice(0, 40));
    }

    function hideAnnouncement() {
        if (!announce.shown) return;
        announce.shown.stop();
        announce.shown = null;
        announce.v = '';
        $('#announce').classList.add('hidden');
        state.layer = announce.before;
        var video = currentVideo();
        if (video && announce.resume && !state.paused && !document.hidden) video.play().catch(function () { /* ignore */ });
        restartTimer();
    }

    // OK / Back on the remote: a pushed announcement stays off until a new one is sent.
    function dismissAnnouncement() {
        if (announce.v) announce.dismissed = announce.v;
        hideAnnouncement();
    }

    function showLocalAnnouncement() {
        var a = announce.active;
        if (a) showAnnouncement(a.cfg, a.v, 0);
        else showAnnouncement(announce.last || FALLBACK_ANNOUNCEMENT, '', 0);
    }

    function pollAnnouncement() {
        if (!ANNOUNCE_URL || document.hidden || (!IS_TV && !LIVE_PREVIEW)) return;
        fetchText(ANNOUNCE_URL + '?showing=' + encodeURIComponent(announce.v), 8000).then(function (text) {
            var data = JSON.parse(text);
            var a = data.active;
            announce.active = a;
            if (data.last) announce.last = data.last;
            if (state.layer === 'splash' || usbOpen()) return; // shown after the welcome / USB screens
            if (a && a.v !== announce.v && a.v !== announce.dismissed) {
                var left = a.until ? Math.round(a.until - data.now) : 0;
                if (!a.until || left > 1) showAnnouncement(a.cfg, a.v, left);
            } else if (!a && announce.v) {
                hideAnnouncement(); // stopped from the management page, or its time is up
            }
        }, function () { /* offline: try again on the next round */ });
    }

    // ------------------------------------------------------------------ Video USB (behind a code)
    // The "Video USB" button asks for a 4-digit code (remote number keys, or the keypad on screen),
    // then lists every video on the USB drives; OK plays one full screen. Leaving locks it again.

    var USB_PIN = String(CONFIG.usbPin || '0000');
    var KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];
    var usb = { code: '', pad: 4, videos: [], index: 0, token: 0, osdTimer: null, scan: null, refresh: null, saved: 0 };

    function usbOpen() { return state.layer === 'usblock' || state.layer === 'usblist' || state.layer === 'usbplay'; }

    function openUsbLock() {
        if (state.layer === 'fullscreen') closeFullscreen();
        clearTimeout(slideTimer);
        clearSlides(); // the frame's clip lets go of the video decoder
        usb.code = '';
        usb.pad = -1; // nothing highlighted: number keys type straight away, arrows bring up a selection
        state.layer = 'usblock';
        $('#usbLock').classList.remove('hidden');
        renderUsbLock('Nhập mã bằng phím số trên remote');
    }

    function renderUsbLock(msg, wrong) {
        $('#usbDots').innerHTML = [0, 1, 2, 3].map(function (i) {
            return '<span class="' + (i < usb.code.length ? 'on' : '') + '"></span>';
        }).join('');
        var m = $('#usbLockMsg');
        m.textContent = msg;
        m.classList.toggle('wrong', !!wrong);
        $('#usbKeypad').innerHTML = KEYPAD.map(function (k, i) {
            var label = k === 'del' ? 'Xoá' : k === 'ok' ? 'OK' : k;
            return '<div class="key' + (i === usb.pad ? ' focused' : '') + '">' + label + '</div>';
        }).join('');
    }

    function usbLockKey(k) {
        if (k >= KEY.DIGIT_0 && k <= KEY.DIGIT_9) return usbType(String(k - KEY.DIGIT_0));
        if (k === KEY.BACK || k === KEY.ESC) return closeUsb();
        if (k === KEY.BACKSPACE) return usbType('del');
        var arrow = k === KEY.LEFT || k === KEY.RIGHT || k === KEY.UP || k === KEY.DOWN;
        if (usb.pad < 0) { // first arrow: just show the selection, in the middle
            if (arrow) { usb.pad = 4; renderUsbLock($('#usbLockMsg').textContent, $('#usbLockMsg').classList.contains('wrong')); }
            return;
        }
        var col = usb.pad % 3, row = Math.floor(usb.pad / 3);
        if (k === KEY.LEFT) col = (col + 2) % 3;
        else if (k === KEY.RIGHT) col = (col + 1) % 3;
        else if (k === KEY.UP) row = (row + 3) % 4;
        else if (k === KEY.DOWN) row = (row + 1) % 4;
        else if (k === KEY.ENTER) return usbType(KEYPAD[usb.pad]);
        else return;
        usb.pad = row * 3 + col;
        renderUsbLock($('#usbLockMsg').textContent, $('#usbLockMsg').classList.contains('wrong'));
    }

    function usbType(key) {
        if (key === 'del') usb.code = usb.code.slice(0, -1);
        else if (key !== 'ok' && usb.code.length < 4) usb.code += key;
        if (usb.code.length < 4 && key !== 'ok') { renderUsbLock('Nhập mã bằng phím số trên remote'); return; }
        if (usb.code === USB_PIN) { log('usb: unlocked'); openUsbList(); return; }
        log('usb: wrong code');
        usb.code = '';
        var card = $('#usbLock .usb-lock-card');
        card.classList.remove('shake');
        void card.offsetWidth;
        card.classList.add('shake');
        renderUsbLock('Sai mã, nhập lại nhé', true);
    }

    // Every video on every USB drive, folder by folder (the folder called "private…" first).
    async function findUsbVideos(path, depth, out, token, root) {
        if (depth > MAX_DEPTH || out.length >= MAX_ITEMS || !usb.scan || token !== usb.scan.token) return;
        if (usb.scan.dirs[path]) return; // already listed: the TV can hand the same folder back again
        usb.scan.dirs[path] = true;
        var entries = await listDir(path);
        var thumbs = await usbThumbs(entries);
        entries.sort(function (a, b) {
            var pa = /^private/i.test(a.name) ? 0 : 1, pb = /^private/i.test(b.name) ? 0 : 1;
            return pa - pb || a.name.localeCompare(b.name, 'vi', { numeric: true });
        });
        for (var i = 0; i < entries.length && out.length < MAX_ITEMS; i++) {
            var e = entries[i];
            if (e.name.charAt(0) === '.') continue;
            if (e.isDir) {
                if (!SKIP_DIRS[e.name.toLowerCase()]) await findUsbVideos(e.path, depth + 1, out, token, root);
            } else if (VIDEO_EXT.test(e.name) && !usb.scan.seen[e.path]) {
                usb.scan.seen[e.path] = true;
                var folder = path === root ? '' : path.slice(root.length + 1).split('/').join(' / ');
                var thumb = thumbs ? thumbs.images[nameKey(e.name.replace(VIDEO_EXT, '') + '.jpg')] || '' : '';
                var length = thumbs ? +thumbs.lengths[nameKey(e.name)] || 0 : 0;
                try { out.push({ name: e.name, folder: folder, path: e.path, uri: toUri(e), thumb: thumb, duration: length }); } catch (err) { /* skip */ }
            }
        }
    }

    function prepareUsbVideos(roots, key) {
        if (usb.scan && usb.scan.key === key && (usb.scan.done || usb.scan.running)) return;
        var scan = usb.scan = { key: key, token: (usb.scan ? usb.scan.token : 0) + 1, videos: [], done: false, running: true,
            seen: {}, dirs: {} };
        (async function () {
            for (var i = 0; i < roots.length; i++) await findUsbVideos(roots[i], 0, scan.videos, scan.token, roots[i]);
            if (usb.scan !== scan) return;
            arrangeUsbVideos(scan.videos);
            scan.done = true;
            scan.running = false;

            log('usb: ' + roots.length + ' drives, ' + scan.videos.length + ' videos');
        })();
    }

    async function openUsbList() {
        $('#usbLock').classList.add('hidden');
        $('#usbBrowser').classList.remove('hidden');
        state.layer = 'usblist';
        var token = ++usb.token;
        $('#usbList').innerHTML = '';
        var roots = await listStorages();
        if (token !== usb.token || state.layer !== 'usblist') return;
        if (!IS_TV) { // desktop preview
            roots = ['mock'];
            usb.scan = { key: 'mock', done: true, videos: arrangeUsbVideos(['Tập 1 - Ngày đầu tiên.mp4', 'Tập 2 - Gặp lại.mp4',
                '[Phim] Tập 3 - Bí mật_Auto.mp4', 'xvideos.com_4b4628f60e69f6056bbc67a8881305b1.mp4', 'Du lịch Đà Lạt 2025 (2).mp4',
                '720P_4000K_34406601.mp4', 'Sinh nhật bé.mov', 'video-1038130864 (3).mp4', 'Phim hoạt hình 01.mp4',
                '10000000_751434781888823_520274986569564160_n.mp4', 'Cả nhà đi biển.mp4', 'Họp lớp 2024.mp4'].map(function (n, i) {
                return { name: n, folder: '', uri: 'mock:' + i };
            })) };
        } else {
            prepareUsbVideos(roots, roots.join('|'));
        }
        // Start on the video watched last (it may turn up while the list is still growing); once the
        // owner moves, the selection stays where they put it.
        var last = store.get('usbLast', null);
        usb.index = 0;
        usb.firstRow = 0;
        usb.videos = [];
        usb.userMoved = false;
        var first = true;
        var showList = function () {
            if (token !== usb.token || state.layer !== 'usblist') return;
            var scan = usb.scan;
            if (first || scan.videos.length !== usb.videos.length) {
                var current = usb.videos[usb.index];
                var want = usb.userMoved ? current && current.uri : last && last.uri;
                usb.videos = arrangeUsbVideos(scan.videos.slice());
                var at = want ? usb.videos.map(function (v) { return v.uri; }).indexOf(want) : -1;
                usb.index = at >= 0 ? at : usb.userMoved ? Math.min(usb.index, usb.videos.length - 1) : 0;
                first = false;
                renderUsbList();
            }
            $('#usbSub').textContent = !roots.length ? 'Chưa thấy ổ nào. Cắm ổ vào TV rồi mở lại.' :
                !scan.done ? (usb.videos.length ? usb.videos.length + ' video, đang tìm tiếp…' : 'Đang tải danh sách…') :
                !usb.videos.length ? 'Chưa có video nào (mp4, mkv, mov, m4v, webm, 3gp).' : usb.videos.length + ' video';
            if (!scan.done) usb.refresh = setTimeout(showList, 800);
        };
        clearTimeout(usb.refresh);
        showList();
    }

    // ---- the list: a grid of thumbnails, 5 x 3 on screen, drawn a screen at a time

    var GRID_COLS = 5, GRID_ROWS = 3;
    var PLAY_MARK = '<svg class="usb-play" viewBox="0 0 24 24" width="64" height="64"><circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.45)"/>' +
        '<path d="M10 7.5v9l7-4.5z" fill="#fff"/></svg>';

    // "xvideos.com_4b46…e7.mp4" -> "", "[China AV] Tên phim_Auto (2).mp4" -> "Tên phim": what is left is the title.
    function cleanTitle(name) {
        var t = name.replace(VIDEO_EXT, '');
        t = t.replace(/^(?:www\.)?[a-z0-9-]+\.(?:com|net|org|tv|xxx|me|info|vn)[\s_-]*/i, '');  // site it came from
        t = t.replace(/\[[^\]]*\]/g, ' ');                                                      // [tags]
        t = t.replace(/\b[0-9a-f]{16,}\b/gi, ' ');                                              // hashes
        t = t.replace(/\b\d{3,4}p(?:_\d+k)?(?:_\d+)?\b/gi, ' ');                                // 720P_4000K_344…
        t = t.replace(/\bvideo[-_]\d{5,}\b/gi, ' ');                                            // video-1038130864
        t = t.replace(/\b\d{6,}(?:_\d{6,})*(?:_n)?\b/g, ' ');                                   // long numeric ids
        t = t.replace(/(^|[\s_-])(?:auto|sextop1|javhd|page)(?=$|[\s_.-])/gi, ' ');             // uploader junk
        t = t.replace(/\s*\(\d+\)\s*$/, '').replace(/\s*-\d{1,2}\s*$/, '');                     // copy markers
        t = t.replace(/_+/g, ' ').replace(/\s{2,}/g, ' ').replace(/^[\s\-.,:;]+|[\s\-.,:;]+$/g, '');
        return t;
    }

    // Titled videos A-Z first, then the untitled ones as "Video 1, 2, …".
    function arrangeUsbVideos(list) {
        list.forEach(function (v) { v.clean = cleanTitle(v.name); });
        list.sort(function (a, b) {
            if (!a.clean !== !b.clean) return a.clean ? -1 : 1;
            return (a.clean || a.name).localeCompare(b.clean || b.name, 'vi', { numeric: true });
        });
        var n = 0;
        list.forEach(function (v) { v.title = v.clean || 'Video ' + (++n); });
        return list;
    }

    function thumbBackground(name) {
        var h = hue(name);
        return 'linear-gradient(135deg, hsl(' + h + ',45%,28%), hsl(' + ((h + 50) % 360) + ',50%,16%))';
    }

    function usbCard(v, i, last) {
        var meta = { duration: v.duration || 0 };
        var thumb = v.thumb || '';
        var watched = last && last.uri === v.uri && last.t > 10;
        var progress = watched && meta.duration ? '<div class="usb-prog"><div style="width:' +
            Math.min(100, Math.round(last.t / meta.duration * 100)) + '%"></div></div>' : '';
        return '<div class="usb-card' + (i === usb.index ? ' focused' : '') + '">' +
            '<div class="usb-thumb" style="background:' + thumbBackground(v.name) + '">' + PLAY_MARK +
            (thumb ? '<img src="' + escapeHtml(thumb) + '" alt="">' : '') +
            (meta.duration ? '<span class="usb-dur">' + fmtTime(meta.duration) + '</span>' : '') + progress + '</div>' +
            '<div class="usb-card-title">' + escapeHtml(v.title || v.name) + '</div>' +
            (watched ? '<div class="usb-resume">Xem tiếp ' + fmtTime(last.t) + '</div>' : '') + '</div>';
    }

    function renderUsbList() {
        var total = usb.videos.length;
        var row = Math.floor(usb.index / GRID_COLS);
        usb.firstRow = usb.firstRow || 0;
        if (row < usb.firstRow) usb.firstRow = row;
        if (row >= usb.firstRow + GRID_ROWS) usb.firstRow = row - GRID_ROWS + 1;
        var start = usb.firstRow * GRID_COLS, end = Math.min(total, start + GRID_COLS * GRID_ROWS);
        var last = store.get('usbLast', null);
        var html = '';
        for (var i = start; i < end; i++) html += usbCard(usb.videos[i], i, last);
        var list = $('#usbList');
        list.innerHTML = html;
        usb.page = start;
        $all('.usb-thumb img', list).forEach(function (img) {
            img.onerror = function () { img.parentNode.removeChild(img); };
        });
        var rows = Math.ceil(total / GRID_COLS);
        $('#usbPage').textContent = rows > GRID_ROWS ? 'Hàng ' + (row + 1) + ' / ' + rows : '';
    }

    function moveUsbRow(delta) {
        if (!usb.videos.length) return;
        usb.userMoved = true;
        var next = Math.max(0, Math.min(usb.videos.length - 1, usb.index + delta));
        if (next === usb.index) return;
        var oldPage = usb.firstRow;
        usb.index = next;
        var row = Math.floor(next / GRID_COLS);
        if (row >= oldPage && row < oldPage + GRID_ROWS) { // same screen: just move the highlight
            var cards = $('#usbList').children;
            for (var i = 0; i < cards.length; i++) cards[i].classList.toggle('focused', usb.page + i === next);
            $('#usbPage').textContent = Math.ceil(usb.videos.length / GRID_COLS) > GRID_ROWS ?
                'Hàng ' + (row + 1) + ' / ' + Math.ceil(usb.videos.length / GRID_COLS) : '';
        } else {
            renderUsbList();
        }
    }

    function usbListKey(k) {
        if (k === KEY.LEFT) moveUsbRow(-1);
        else if (k === KEY.RIGHT) moveUsbRow(1);
        else if (k === KEY.UP) moveUsbRow(-GRID_COLS);
        else if (k === KEY.DOWN) moveUsbRow(GRID_COLS);
        else if (k === KEY.REW) moveUsbRow(-GRID_COLS * GRID_ROWS);
        else if (k === KEY.FF) moveUsbRow(GRID_COLS * GRID_ROWS);
        else if (k === KEY.ENTER || k === KEY.PLAY || k === KEY.PLAY_PAUSE) { if (usb.videos.length) playUsb(usb.index); }
        else if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) closeUsb();
    }

    // ---- thumbnails: the TV won't hand a video frame to an app (its library makes none, and frames
    // drawn into a canvas come out black), so they are made once on a computer: a hidden ".thumbs"
    // folder next to the videos holds "<video name>.jpg" and index.json { "<video file>": seconds }
    // (tools: scripts/make-thumbs.py in the nobita-tv-install skill).

    function readUsbIndex(path) {
        return new Promise(function (resolve) {
            try {
                tizen.filesystem.resolve(path, function (file) {
                    file.readAsText(function (text) {
                        try { resolve(JSON.parse(text) || {}); } catch (e) { resolve({}); }
                    }, function () { resolve({}); }, 'UTF-8');
                }, function () { resolve({}); }, 'r');
            } catch (e) { resolve({}); }
        });
    }

    // Vietnamese names can be stored composed or decomposed (Mac vs TV): compare them one way.
    function nameKey(name) {
        var n = String(name);
        return (n.normalize ? n.normalize('NFC') : n).toLowerCase();
    }

    async function usbThumbs(entries) {
        var dir = entries.filter(function (e) { return e.isDir && e.name === '.thumbs'; })[0];
        if (!dir) return null;
        var files = await listDir(dir.path), images = {};
        files.forEach(function (f) {
            if (/\.jpg$/i.test(f.name) && f.name.indexOf('._') !== 0) { // ._* are macOS leftovers
                try { images[nameKey(f.name)] = toUri(f); } catch (e) { /* skip */ }
            }
        });
        var raw = await readUsbIndex(dir.path + '/index.json'), lengths = {};
        Object.keys(raw).forEach(function (k) { lengths[nameKey(k)] = raw[k]; });
        return { images: images, lengths: lengths };
    }

    function playUsb(index) {
        var item = usb.videos[index];
        if (!item) return;
        usb.index = index;
        var video = $('#usbVideo');
        $('#usbPlayer').classList.remove('hidden');
        state.layer = 'usbplay';
        $('#usbOsd .usb-osd-name').textContent = item.name;
        $('#usbPlayer').classList.remove('failed');
        video.muted = false;
        var last = store.get('usbLast', null);
        usb.resumeAt = last && last.uri === item.uri && last.t > 10 ? last.t : 0;
        video.src = item.uri;
        video.play().catch(function (e) { log('usb play refused: ' + e.message); });
        log('usb: play ' + item.name + (usb.resumeAt ? ' from ' + fmtTime(usb.resumeAt) : ''));
        store.set('usbLast', { uri: item.uri, t: usb.resumeAt });
        showUsbOsd();
    }

    // Remembers where the video stopped (every few seconds), to carry on next time.
    function saveUsbPosition(force) {
        var v = $('#usbVideo'), item = usb.videos[usb.index];
        if (!item || !v.getAttribute('src') || (!force && Date.now() - usb.saved < 5000)) return;
        usb.saved = Date.now();
        var d = v.duration, t = v.currentTime;
        store.set('usbLast', { uri: item.uri, t: isFinite(d) && t > d - 30 ? 0 : Math.floor(t) });
    }

    function fmtTime(sec) {
        if (!isFinite(sec) || sec < 0) sec = 0;
        var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = Math.floor(sec % 60);
        return (h ? h + ':' + pad2(m) : m) + ':' + pad2(s);
    }

    function updateUsbOsd() {
        var v = $('#usbVideo');
        var d = v.duration;
        $('#usbOsd .usb-bar-fill').style.width = (isFinite(d) && d > 0 ? Math.min(100, v.currentTime / d * 100) : 0) + '%';
        $('#usbOsd .usb-osd-time').textContent = fmtTime(v.currentTime) + ' / ' + (isFinite(d) ? fmtTime(d) : '--:--');
        $('#usbPlayer').classList.toggle('paused', v.paused);
    }

    function showUsbOsd() {
        updateUsbOsd();
        $('#usbPlayer').classList.add('osd');
        clearTimeout(usb.osdTimer);
        usb.osdTimer = setTimeout(function () {
            if (!$('#usbVideo').paused) $('#usbPlayer').classList.remove('osd');
        }, 3500);
    }

    function seekUsb(seconds) {
        var v = $('#usbVideo');
        if (!isFinite(v.duration)) return;
        v.currentTime = Math.max(0, Math.min(v.duration - 1, v.currentTime + seconds));
    }

    function usbPlayKey(k) {
        var v = $('#usbVideo');
        if (k === KEY.ENTER || k === KEY.PLAY_PAUSE || k === KEY.PLAY || k === KEY.PAUSE) {
            if (v.paused && k !== KEY.PAUSE) v.play().catch(function () { /* ignore */ }); else v.pause();
        } else if (k === KEY.LEFT) seekUsb(-10);
        else if (k === KEY.RIGHT) seekUsb(10);
        else if (k === KEY.REW) seekUsb(-60);
        else if (k === KEY.FF) seekUsb(60);
        else if (k === KEY.UP && usb.index > 0) { playUsb(usb.index - 1); return; }
        else if (k === KEY.DOWN && usb.index < usb.videos.length - 1) { playUsb(usb.index + 1); return; }
        else if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) { stopUsb(); return; }
        else return;
        showUsbOsd();
    }

    // Back from a video: to the list, on the same video.
    function stopUsb() {
        saveUsbPosition(true);
        unloadVideo($('#usbVideo'));
        $('#usbPlayer').classList.add('hidden');
        state.layer = 'usblist';
        renderUsbList();
    }

    // Leaves the USB screens; the code is asked again next time.
    function closeUsb() {
        if (!usbOpen()) return;
        usb.token++;
        usb.code = '';
        clearTimeout(usb.refresh);
        if (state.layer === 'usbplay') saveUsbPosition(true);
        unloadVideo($('#usbVideo'));
        ['#usbLock', '#usbBrowser', '#usbPlayer'].forEach(function (sel) { $(sel).classList.add('hidden'); });
        state.layer = 'main';
        showCurrent();
        restartTimer();
    }

    function postJson(url, value) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'text/plain'); // a simple request: no CORS preflight
            xhr.send(JSON.stringify(value));
        } catch (e) { log('post failed: ' + e.message); }
    }

    // The relay asked (by hand) for the USB video names once, to plan clearer names.
    async function sendUsbNames() {
        var roots = await listStorages();
        prepareUsbVideos(roots, roots.join('|'));
        for (var i = 0; i < 240 && !usb.scan.done; i++) await new Promise(function (r) { setTimeout(r, 500); });
        postJson(FEED_URL.replace(/feed\.json$/, 'usb-names'), {
            drives: roots,
            done: usb.scan.done,
            videos: usb.scan.videos.map(function (v) { return v.path; })
        });
    }

    // Renames planned on the relay (after the owner agreed to the new names), each in its own folder.
    // The older File API first (it is the one that lists this TV's USB drive correctly).
    function renameOne(from, to) {
        var dir = from.replace(/\/[^\/]*$/, '');
        return new Promise(function (resolve) {
            var viaNewApi = function (why) {
                if (!tizen.filesystem.rename) { resolve({ from: from, ok: false, error: why }); return; }
                try {
                    tizen.filesystem.rename(from, to, function () { resolve({ from: from, ok: true, api: 'new' }); },
                        function (e) { resolve({ from: from, ok: false, error: why + ' / ' + e.name + ' ' + e.message }); });
                } catch (e) { resolve({ from: from, ok: false, error: why + ' / ' + e.message }); }
            };
            try {
                tizen.filesystem.resolve(dir, function (folder) {
                    try {
                        folder.moveTo(from, dir + '/' + to, false, function () { resolve({ from: from, ok: true, api: 'old' }); },
                            function (e) { viaNewApi(e.name + ' ' + e.message); });
                    } catch (e) { viaNewApi(e.message); }
                }, function (e) { viaNewApi(e.name + ' ' + e.message); }, 'rw');
            } catch (e) { viaNewApi(e.message); }
        });
    }

    async function renameUsbFiles() {
        var plan;
        try { plan = JSON.parse(await fetchText(FEED_URL.replace(/feed\.json$/, 'usb-rename.json'), 20000)); }
        catch (e) { log('usb rename: no plan (' + e.message + ')'); return; }
        var results = [];
        for (var i = 0; i < plan.length; i++) results.push(await renameOne(plan[i].from, plan[i].to));
        var ok = results.filter(function (r) { return r.ok; }).length;
        log('usb rename: ' + ok + '/' + results.length + ' done');
        postJson(FEED_URL.replace(/feed\.json$/, 'usb-rename-result'), results);
        usb.scan = null; // list the drive again with the new names
        var roots = await listStorages();
        prepareUsbVideos(roots, roots.join('|'));
    }

    function wireUsbPlayer() {
        var v = $('#usbVideo');
        v.addEventListener('timeupdate', function () {
            if ($('#usbPlayer').classList.contains('osd')) updateUsbOsd();
            saveUsbPosition(false);
        });
        v.addEventListener('loadedmetadata', function () {
            if (usb.resumeAt && isFinite(v.duration) && usb.resumeAt < v.duration - 20) v.currentTime = usb.resumeAt;
            usb.resumeAt = 0;
        });
        v.addEventListener('pause', showUsbOsd);
        v.addEventListener('ended', function () {
            if (state.layer !== 'usbplay') return;
            store.set('usbLast', { uri: (usb.videos[usb.index] || {}).uri, t: 0 });
            if (usb.index < usb.videos.length - 1) playUsb(usb.index + 1); else stopUsb();
        });
        v.addEventListener('error', function () {
            if (state.layer !== 'usbplay' || !v.getAttribute('src')) return;
            log('usb: cannot play ' + (usb.videos[usb.index] || {}).name + ' code=' + (v.error && v.error.code));
            $('#usbPlayer').classList.add('failed', 'osd');
            setTimeout(function () { if (state.layer === 'usbplay') stopUsb(); }, 3500);
        });
    }

    // ------------------------------------------------------------------ start-up splash

    var SPLASH_SECONDS = 5;
    var endSplash = null;

    // Counts down on the welcome screen; OK or Back skips it.
    function runSplash() {
        return new Promise(function (resolve) {
            var splash = $('#splash');
            splash.classList.remove('hidden', 'leaving');
            state.layer = 'splash';
            var ring = $('.splash-count .ring', splash); // restart the countdown ring animation
            ring.style.animation = 'none';
            void ring.offsetWidth;
            ring.style.animation = '';
            var img = $('.splash-photo', splash);
            var paint = function () { drawCover($('canvas', splash), img); };
            if (img.complete) paint(); else img.onload = paint;
            var left = SPLASH_SECONDS;
            $('#splashNum').textContent = left;
            var timer = setInterval(function () {
                left--;
                if (left <= 0) endSplash();
                else $('#splashNum').textContent = left;
            }, 1000);
            endSplash = function () {
                log('splash done');
                endSplash = null;
                clearInterval(timer);
                splash.classList.add('leaving');
                setTimeout(function () { splash.classList.add('hidden'); }, 600);
                state.layer = 'main';
                resolve();
            };
        });
    }

    // The TV only suspends apps when switched off (Instant On), so "start" doesn't run again on
    // power-up: replay the welcome screen whenever we come back without having opened an app.
    function replaySplash() {
        if (endSplash) return; // already showing
        if (state.layer === 'fullscreen') closeFullscreen();
        if (state.layer === 'menu') closeMenu();
        runSplash();
    }

    // ------------------------------------------------------------------ start

    function watchSources() {
        if (IS_TV) {
            try {
                tizen.filesystem.addStorageStateChangeListener(function () {
                    setTimeout(function () { scanUsb(true); }, 700); // events come in bursts
                });
            } catch (e) { /* fall back to polling below */ }
        }
        setInterval(function () { if (!document.hidden) scanUsb(false); }, 15000);
        setInterval(function () { if (!document.hidden) syncFeed(); }, FEED_SYNC_MS);
        setInterval(pollAnnouncement, ANNOUNCE_POLL_MS);
        document.addEventListener('visibilitychange', function () {
            log(document.hidden ? 'hidden' : 'visible');
            var v = currentVideo();
            if (document.hidden) {
                closeUsb(); // locked again next time
                hideAnnouncement(); // no music while another app is open or the TV is off
                if (v) v.pause();
            } else {
                if (!openedAnApp) replaySplash(); // TV switched back on (or reopened from Smart Hub)
                openedAnApp = false;
                if (v && !state.paused) v.play().catch(function () { /* ignore */ });
                scanUsb(false);
                syncFeed();
                loadApps();
                loadWeather(); // may have slept for hours
            }
            restartTimer();
        });
    }

    function start() {
        log('start, hidden=' + document.hidden);
        $('#brand').textContent = TV_NAME;
        sizeFrame();
        drawRunner();
        if (/[?&]loader=1/.test(location.search)) showLoader(slides.token);
        $('#fsBrand .name').textContent = TV_NAME;
        if (CONFIG.splashPhoto) {
            $('#splashPhoto').src = CONFIG.splashPhoto;
            $('#splashPhoto').classList.remove('hidden');
        }
        tickClock();
        updateButtons();
        registerKeys();
        wireUsbPlayer();
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        setPhotoState('loading');
        runSplash();
        loadApps(); // focuses the first app once the list arrives
        setTimeout(function () { if (!focused) setFocus($('#photoFrame')); }, 2000);
        updatePanelTitle();
        loadWeather();
        setInterval(loadWeather, WEATHER_REFRESH_MS);
        Promise.all([syncFeed(), scanUsb(true)]).then(function () {
            state.initialDone = true;
            mergeMedia();
            if (/[?&]zoom=1/.test(location.search)) openFullscreen();
            if (/[?&]usb=1/.test(location.search)) openUsbLock();
            if (/[?&]usb=list/.test(location.search)) { openUsbLock(); openUsbList(); } // desktop preview only
        });
        if (/[?&]nosplash=1/.test(location.search) && endSplash) endSplash();
        if (/[?&]apps=all/.test(location.search)) ACTIONS.moreApps();
        var demo = /[?&]announce=(\d+)/.exec(location.search); // desktop preview of a ready-made one
        if (demo && window.NobitaAnnounce) showAnnouncement(NobitaAnnounce.TEMPLATES[+demo[1]], '', 0);
        watchSources();
    }

    // ------------------------------------------------------------------ mock data (desktop preview only)

    var MOCK_APPS = [
        ['9Ur5IzDKqV.TizenYouTube', 'YouTube'], ['7wiJRozgP7.VieOn', 'VieON'], ['ZTpEFWgfa9.FPTPlay', 'FPT Play'],
        ['org.tizen.netflix-app', 'Netflix'], ['oh3t6h6gyl.danettv', 'DANET'], ['HJCS8hkoCO.TV360', 'TV360'],
        ['OxWOiJOOyr.vtv', 'VTVgo Truyền hình số Quốc gia cho TV'], ['VSfj7TFNZ5.VTVcabON', 'VTVcab ON'],
        ['PP2MTMRMs9.MyTV', 'MyTV - VNPT'], ['EwTa3zzuj8.Clipvn', 'Clip TV - Truyền hình Internet'],
        ['kdSsm4KCMz.vstv', 'Kplus Phim, Bóng Đá, TV'], ['YtpPp1gr9C.youku', 'YOUKU TV'],
        ['org.tizen.primevideo', 'Prime Video'], ['rJeHak5zRg.Spotify', 'Spotify - Nhạc và Podcast'],
        ['org.tizen.browser', 'Browser'], ['com.samsung.tv.aria-video', 'Apple TV'],
        ['IewQEY143t.GoogleDuoWeb', 'Google Meet'], ['J9fZJDMi1v.SecurityCenter', 'Security Center'],
        ['jPPp4KCHp4.emanual', 'e-Manual'], ['com.samsung.tv.gallery', 'Gallery']
    ];

    function mockPhoto(i) {
        var h = (i * 47) % 360;
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + (i % 3 ? 1600 : 900) + '" height="1200">' +
            '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + h + ',70%,60%)"/>' +
            '<stop offset="1" stop-color="hsl(' + ((h + 60) % 360) + ',70%,30%)"/></linearGradient></defs>' +
            '<rect width="100%" height="100%" fill="url(#g)"/><circle cx="70%" cy="30%" r="120" fill="#ffd45c"/>' +
            '<path d="M0 1200 L500 600 L800 900 L1100 650 L1600 1200 Z" fill="rgba(0,0,0,0.35)"/></svg>';
        return { uri: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), album: ['Đà Lạt 2025', 'Sinh nhật bé', 'Tết 2026'][i % 3], video: false };
    }
    var MOCK_PHOTOS = [0, 1, 2, 3, 4, 5].map(mockPhoto);

    start();
})();
