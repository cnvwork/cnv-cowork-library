#!/usr/bin/env python3
"""Thumbnails for the "Video" button of Nobita TV, made on a Mac while the USB drive is plugged in.

The TV won't hand video frames to an app, so the pictures are made here once, with ffmpeg, into a
hidden ".thumbs" folder next to the videos:
    <video name>.jpg   320x180, a frame at about 10 % of the video
    index.json         {"<video file name>": length in seconds, ...}
The app reads them when it lists the drive. Videos that already have a picture are skipped;
pictures of videos that are gone are removed. Nothing leaves this computer.

    python3 make-thumbs.py "/Volumes/<USB name>/Private Video"   (every folder below it too)
"""

import json
import os
import shutil
import subprocess
import sys

VIDEO_EXT = ('.mp4', '.m4v', '.mov', '.webm', '.mkv', '.3gp')


def tool(name):
    path = shutil.which(name) or '/opt/homebrew/bin/' + name
    if not os.path.exists(path):
        sys.exit('Cần %s (brew install ffmpeg)' % name)
    return path


FFMPEG, FFPROBE = tool('ffmpeg'), tool('ffprobe')


def length(path):
    out = subprocess.run([FFPROBE, '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                         capture_output=True, text=True, timeout=120).stdout.strip()
    try:
        return round(float(out))
    except ValueError:
        return 0


def thumbnail(path, seconds, dest):
    at = max(1, min(seconds * 0.1, 600)) if seconds else 5
    cmd = [FFMPEG, '-v', 'error', '-y', '-ss', '%.1f' % at, '-i', path, '-frames:v', '1',
           '-vf', 'scale=320:180:force_original_aspect_ratio=increase,crop=320:180', '-q:v', '5', dest]
    subprocess.run(cmd, capture_output=True, timeout=180)
    return os.path.exists(dest) and os.path.getsize(dest) > 0


def do_folder(folder):
    videos = sorted(f for f in os.listdir(folder)
                    if f.lower().endswith(VIDEO_EXT) and not f.startswith('.'))
    if not videos:
        return 0, 0
    thumbs = os.path.join(folder, '.thumbs')
    os.makedirs(thumbs, exist_ok=True)
    index_path = os.path.join(thumbs, 'index.json')
    try:
        index = json.load(open(index_path, encoding='utf-8'))
    except (OSError, ValueError):
        index = {}
    made = 0
    for i, name in enumerate(videos, 1):
        src = os.path.join(folder, name)
        dest = os.path.join(thumbs, os.path.splitext(name)[0] + '.jpg')
        if name not in index:
            index[name] = length(src)
        if not os.path.exists(dest):
            ok = thumbnail(src, index[name], dest)
            made += ok
            print('  [%d/%d] %s %s' % (i, len(videos), 'ok ' if ok else 'LỖI', name), flush=True)
    keep = set(os.path.splitext(v)[0] + '.jpg' for v in videos)
    for f in os.listdir(thumbs):  # pictures of videos that are gone, and macOS ._ leftovers
        if f.endswith('.jpg') and (f not in keep or f.startswith('._')):
            os.remove(os.path.join(thumbs, f))
    index = {k: v for k, v in index.items() if k in videos}
    with open(index_path, 'w', encoding='utf-8') as out:
        json.dump(index, out, ensure_ascii=False, indent=0)
    return len(videos), made


def main():
    if len(sys.argv) != 2 or not os.path.isdir(sys.argv[1]):
        sys.exit(__doc__)
    total = made = 0
    for folder, dirs, _ in os.walk(sys.argv[1]):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        n, m = do_folder(folder)
        total += n
        made += m
    print('Xong: %d video, %d ảnh mới.' % (total, made))


if __name__ == '__main__':
    main()
