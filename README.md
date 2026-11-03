# Thư viện kịch bản của CNV Cowork

Mã nguồn mẫu người dùng CNV Cowork tải về rồi code tiếp (màn «Thư viện» trong app). Mỗi kịch bản là một thư mục
trong `scenarios/`. Repo này là nơi **viết và quản lý**; app chỉ tải bản đã **đóng gói + ký** (`dist/`) từ
**GitHub Releases** của repo, không có mã mẫu nào trong bộ cài. Đặc tả phía app: `cnv-cowork/docs/library.md`.

> **Repo này CÔNG KHAI trên GitHub.** Mọi thứ commit vào đây ai cũng đọc được, kể cả lịch sử. Tuyệt đối không có bí mật
> hay dữ liệu riêng: key API, token, mật khẩu, DUID TV, chứng chỉ, IP, mã album, ảnh cá nhân. `npm run check` chặn
> các mẫu phổ biến, nhưng người commit vẫn phải tự đọc lại.

## Cấu trúc

```
scenarios/<id>/
  manifest.json      id, tên, mô tả, nhóm, phiên bản, yêu cầu, giấy phép, readme, skill
  README.md          hướng dẫn cho người dùng (mở trong VS Code / Finder)
  cowork/SKILL.md    kỹ năng cho trợ lý Cowork: cấu trúc dự án, cách code tiếp, việc KHÔNG được làm
  …                  mã nguồn
skills/<nhóm>/<tên>.md  kỹ năng CÓ SẴN của trợ lý (nhóm: chung hoặc mã ngành) — nơi DUY NHẤT sửa kỹ năng có sẵn
offices/<id>.json       mẫu Thư viện văn phòng (văn phòng AI theo ngành) — nơi DUY NHẤT sửa mẫu văn phòng
changelog.json       sửa câu chữ nhật ký «Có gì mới» của app không cần ra bản mới (rỗng = không đè gì)
video/engine.json    bộ dựng video (ffmpeg + ffprobe) của Trình dựng video theo nền tảng: link + sha256 + số byte
video/kit.json       bộ làm video: nhãn các gói + model chép lời trên máy (Hugging Face, ghim commit + sha256)
video/fonts/         phông tiếng Việt SIL OFL (mỗi họ kèm OFL.txt) + fonts.json (họ, độ đậm, vai trò)
video/styles/<id>/   phong cách chữ chuyển động: style.json (ô chữ, bộ màu, luật) + template.html + preview.jpg
video/sfx/           tiếng hiệu ứng CNV tự tổng hợp (tools/sfx-make.mjs, CC0) + sfx.json + LICENSE.txt
library.config.json  khoá công khai (app ghim cùng khoá này), github.owner / repo, danh sách nhóm, chuỗi được phép khi quét
tools/               check.mjs, build.mjs, verify.mjs, keygen.mjs, video-verify.mjs, sfx-make.mjs, videokit.mjs, font.mjs (Node ≥ 22.2, không cần cài gì)
dist/                (không commit) gói .zip + skills-<sha>.json + catalog.json đã ký + RELEASE.md: thứ gắn vào GitHub Release
```

## Luật cho mã trong kịch bản

App giải nén theo luật của Thư mục làm việc, sai một tệp là từ chối cả gói. `npm run check` kiểm trước:

- Không tệp / thư mục ẩn (`.gitignore`, `.vscode`…), không symlink, không tên trông như bí mật
  (`*.pem`, `*.p12`, `*.cer`, «password», «token»…), không ký tự `\ : * ? " < > |`, không tên dành riêng của Windows.
- Tối đa 2.000 tệp, 32 MB một tệp, 128 MB cả kịch bản, gói nén ≤ 64 MB, đường dẫn ≤ 240 ký tự, ≤ 16 cấp.
- App bỏ quyền chạy của mọi tệp: hướng dẫn chạy script bằng `bash scripts/x.sh`, không `./scripts/x.sh`.
- **Không dữ liệu riêng của ai**: IP, mã thiết bị (DUID), token, mã album, đường dẫn chứng chỉ, ảnh cá nhân.
  Cái người dùng phải tự điền thì để thành cấu hình mẫu (vd `app/js/config.js` của Nobita TV) và ghi rõ trong README.
  `check` quét mẫu khoá / token / IP phổ biến và mọi chuỗi trong `~/.config/cnv-cowork-library/denylist.txt`
  (danh sách chuỗi riêng của CNV, nằm NGOÀI repo).
- Thư viện bên thứ ba: chép vào kịch bản kèm thông báo bản quyền, ghi trong README + `license` của manifest.
- Trợ lý Cowork không chạy lệnh / tệp chạy: kỹ năng chỉ dặn trợ lý đọc, đề xuất sửa từng tệp (người dùng duyệt),
  và chỉ người dùng lệnh để họ tự chạy.

## Thêm hoặc sửa một kịch bản

1. Tạo `scenarios/<id>/` (id chữ thường không dấu, gạch nối), viết `manifest.json` theo mẫu Nobita TV.
   Nhóm (`category`) phải có trong `library.config.json`.
2. Sửa xong thì **tăng `version`** (app so phiên bản để hiện «Tải bản mới»; người dùng đã tải giữ bản cũ của họ,
   bản mới tải vào thư mục khác, không ghi đè).
3. `npm run check` cho tới khi sạch.
4. Commit.

## Mẫu Thư viện văn phòng

`offices/<id>.json` là mẫu văn phòng AI theo ngành (luật sư, bất động sản, sales, kế toán, spa…) hiện ở Cowork › Văn phòng
AI › Thư viện. `build` đóng cả thư mục thành MỘT tệp `offices-<sha256>.json` ghim trong danh mục, app tự tải khi sha256 đổi.
Luật (app kiểm lại đủ, sai thì bỏ mẫu đó):

- Tên tệp = `id`; `group` ∈ sales_marketing / office / professional / services; `icon` trong danh sách của `tools/lib.mjs`.
- Phòng không trùng tên, không tên «Điều phối» (app tự có); tên phòng nên riêng theo ngành (áp hai mẫu có phòng trùng tên
  thì app dùng lại phòng đã có, giữ lời dặn cũ) — trừ «Kiểm Brand» dùng chung.
- Chuỗi chỉ ghi các phòng làm việc, KHÔNG ghi Kiểm Brand (luôn tự chạy cuối); lịch chạy ở phòng có trong mẫu hoặc «Điều phối».
- Lời dặn chỉ dùng thông tin có thật; mọi thứ gửi / đăng / ghi qua thẻ chờ duyệt; luật riêng của ngành (luật: chỉ trích điều
  luật có trong Kho tri thức; y tế: không chẩn đoán; tài chính: chỉ soạn nháp; BĐS: không cam kết).
- Tên ghi chú Bộ não không có ký tự `\ / : * ? " < > | # ^ [ ]`.
- Bộ cài Cowork mang bản chụp: ở repo `cnv-cowork` chạy `npm run offices:sync`.

## Kỹ năng có sẵn của trợ lý

`skills/<nhóm>/<tên>.md` là kỹ năng có sẵn mọi máy Cowork dùng (báo giá, chăm sóc khách, kịch bản theo ngành…). Sửa / thêm
ở đây, `npm run check`, rồi phát hành như dưới: `build` đóng cả thư mục thành MỘT tệp `skills-<sha256>.json` ghim trong
danh mục, app đang chạy tự tải khi sha256 đổi, không cần bản app mới. Luật (app kiểm lại đủ, sai thì bỏ kỹ năng đó):

- Tên tệp = `name` trong phần đầu (chữ thường không dấu, gạch nối); thư mục = `industry` (`chung` thì không có `industry`).
- Không trùng `name` / `command`; tối đa 30.000 ký tự; chỉ là chữ (không mã chạy, không link tải thêm).
- Công cụ trợ lý nhắc trong hướng dẫn (`search_contacts`…) phải có thật trong app: app kiểm bản chụp của nó bằng test.
- Bộ cài Cowork mang một bản chụp để máy chưa tải được gì vẫn có kỹ năng: ở repo `cnv-cowork` chạy `npm run skills:sync`
  khi muốn bản cài mới mang luôn bộ mới.

## Nhật ký «Có gì mới» của app

Nhật ký chính nằm trong app (`src/shared/changelog.json` của repo `cnv-cowork`, đóng gói theo bản). `changelog.json` ở đây
chỉ để **sửa câu chữ sau khi bản đã phát** (hoặc bổ sung bản bị sót) mà không cần ra bản app mới: mục ở đây đè mục CÙNG số
bản trong app; app chỉ hiện các bản không mới hơn bản đang chạy. Khuôn giống hệt app:

```json
[{ "build": 38, "date": "2026-10-29", "items": [{ "type": "new", "text": "Một câu bằng lời người dùng." }] }]
```

Mới nhất trước, `type` là `new` («Mới») hoặc `fix` («Sửa»), câu ≤ 180 ký tự, không thuật ngữ / không nhắc commit.
`npm run check` kiểm khuôn; sai khuôn thì app bỏ cả nhật ký trên mạng và dùng bản đóng gói. `build` đưa nhật ký vào thẳng
`catalog.json` (`content.changelog`, không thêm tệp), phát hành như dưới; mọi máy thấy ở lần làm mới danh mục kế tiếp.

## Bộ dựng video

Trình dựng video của Cowork (Marketing › Video) cần ffmpeg + ffprobe. Bộ này KHÔNG nằm trong bộ cài app: người dùng bấm
«Cài trình dựng» (màn đầu của Marketing › Video, hoặc thẻ «Trình dựng video» ở Thư viện) thì app mới tải về máy họ, kiểm
sha256 + số byte, giải nén, gỡ được.

`video/engine.json` ghim bản dựng cho từng nền tảng (`darwin-arm64`, `darwin-x64`, `win32-x64`, `win32-arm64`). `build` đưa
bảng này vào thẳng `catalog.json` (`content.video_engine`, không thêm tệp đính kèm). App ưu tiên bảng trong danh mục, không
có thì dùng bảng mang sẵn (`src/main/services/video/catalog.ts` của cnv-cowork). Đổi bản dựng (vd lên ffmpeg mới):

1. Sửa `video/engine.json`: link ghim phiên bản (không «latest»), `sha256`, `bytes`, `id` MỚI có chứa phiên bản.
2. `npm run video:verify` (tải thử từng tệp, khớp sha256; ~400 MB đủ 4 nền tảng) và `npm run check`.
3. `npm run build`, phát hành như dưới. Máy đã cài thấy «Có bản mới · Cập nhật» ở thẻ Trình dựng video; bản cũ vẫn dùng được
   tới khi người dùng bấm cập nhật, cài xong bản mới thì app gỡ bản cũ.

App chỉ tải bộ dựng từ `github.com` (và kho tệp `*.githubusercontent.com`) và `ffmpeg.martin-riedl.de`; link host khác thì
app bỏ bản đó.

**Vì sao tệp ffmpeg tải thẳng từ nơi phát hành, chưa đăng lại trong release của repo này** (02/11/2026): repo này công
khai; đăng lại tệp chạy là CNV tự phát tán ffmpeg. Bản macOS đang dùng (Martin Riedl) là bản dựng GPL-3.0 (gồm x264…):
phát tán lại thì CNV phải kèm hoặc giữ sẵn TOÀN BỘ mã nguồn tương ứng (ffmpeg + mọi thư viện trong bản dựng) ít nhất 3
năm. Bản Windows (BtbN, LGPL) vốn đã nằm trên GitHub Releases, đăng lại không thêm gì. Muốn tự giữ hết trên GitHub: dựng
bản ffmpeg LGPL cho macOS (không x264, mã hoá bằng VideoToolbox) rồi đăng kèm mã nguồn — việc riêng, cần sếp duyệt.

## Bộ làm video

Màn «Chuẩn bị bộ làm video» của Cowork (Marketing › Video) tải về máy người dùng, khi họ bấm, mọi thứ để làm video đẹp:
bộ dựng (mục trên), phông, phong cách, tiếng hiệu ứng, model chép lời có mốc từng từ, giọng đọc. `build` đóng phông /
phong cách / tiếng hiệu ứng thành 3 tệp `video-fonts|styles|sfx-<sha>.zip` (PHẢI đính kèm release) và ghim chúng cùng model
chép lời vào `content.video_kit` của danh mục. App kiểm sha256 + số byte từng tệp, giải nén theo luật an toàn, báo «Có
bản mới» khi phiên bản gói đổi (bản cũ vẫn dùng tới khi người dùng bấm cập nhật).

- **Phông** (`video/fonts/`): chỉ phông TĨNH giấy phép SIL OFL 1.1, lấy nguyên tệp từ kho Google Fonts (commit ghi trong
  fonts.json), mỗi họ kèm OFL.txt của chính nó. `check` đọc bảng ký tự từng tệp: thiếu chữ tiếng Việt có dấu là lỗi
  (riêng «₫» được thiếu). Thêm phông: chép tệp + OFL.txt, khai vào fonts.json (đúng họ, độ đậm thật).
- **Phong cách** (`video/styles/<id>/`): `style.json` (mã = tên thư mục, nhóm, ô chữ ≤ 8, bộ màu #RRGGBB, phông có trong
  video/fonts, luật kiểm được cho trợ lý), `template.html` đọc chữ / màu / phông từ `window.CW_DATA` và dùng khung sườn
  `window.cwKit` + `window.cwFrame(t)` của app (không gọi mạng, không giờ thật), `preview.jpg` 270×480 ≤ 80 KB. Sửa mẫu
  thì tăng `version` của phong cách và `styles.version` trong kit.json. Ảnh xem trước dựng bằng chính bộ dựng chữ chuyển
  động của app, lấy khung lúc mọi chữ đã hiện.
- **Tiếng hiệu ứng** (`video/sfx/`): `node tools/sfx-make.mjs` (cần ffmpeg) tổng hợp lại từ công thức, ra đúng byte như cũ;
  không dùng bản ghi âm của ai. CC0, ghi rõ trong LICENSE.txt.
- **Model chép lời** (`video/kit.json` › `asr`): Whisper small bản ONNX «timestamped» (xuất cross-attention để căn mốc từng
  từ) của onnx-community, ghim commit Hugging Face + sha256 + số byte; app chạy bằng ONNX Runtime WebAssembly có sẵn (không
  thêm tệp chạy native). Đổi model: tải thử khớp sha256 rồi sửa kit.json (`version` mới).

## Phát hành (GitHub Releases)

```bash
npm run build -- --tag v2026.10.29   # dist/<id>-<phiên bản>.zip + catalog.json (ký bằng khoá trong Keychain) + RELEASE.md
npm run verify                       # kiểm lại chữ ký + sha256 như app
```

CNV Work (`api.cnvwork.com/api/v1/cowork/catalog`) tự chép `catalog.json` của release mới nhất trong vòng 5 phút; app đọc
ở đó trước, lỗi thì đọc thẳng GitHub. Gói zip và bộ kỹ năng app luôn tải từ GitHub theo link ghim tag.

Rồi làm theo `dist/RELEASE.md`: đẩy `main` (remote push là alias SSH `git@github-cnv-library:cnvwork/cnv-cowork-library.git`
khai trong `~/.ssh/config`, dùng deploy key riêng của repo), tạo release đúng tag đó trên GitHub, gắn `catalog.json` + mọi
`.zip`, đặt là **latest**. Bản phát hành đầu: `v2026.10.29`. App tải `https://github.com/<owner>/cnv-cowork-library/releases/latest/download/catalog.json` và gói theo
link ghim tag ghi trong danh mục; chỉ theo chuyển hướng tới `github.com`, `objects.githubusercontent.com`,
`release-assets.githubusercontent.com`; không gọi `api.github.com` (giới hạn 60 lần / giờ). Chủ repo
(`github.owner`) điền ở `library.config.json` và hằng số `LIBRARY_GITHUB_OWNER` của app
(`cnv-cowork/src/main/services/library/catalog.ts`). **Tạo repo / đăng release là đăng công khai: chỉ làm khi người
phụ trách của CNV đã duyệt.** Đừng xoá release cũ (danh mục cũ trong máy người dùng còn trỏ gói theo tag cũ).

Zip dựng cố định (giờ 1980-01-01, thứ tự tệp cố định, không quyền chạy): không sửa gì thì sha256 không đổi.

## Khoá ký

- Khoá bí mật Ed25519 nằm trong Keychain của máy phát hành của CNV, mục **«CNV Cowork library signing key»** (tạo bằng
  `npm run keygen` ngày 29/10/2026). KHÔNG commit, không gửi qua chat. Sao lưu sang 1Password.
- Khoá công khai ở `library.config.json` và ghim trong app (`LIBRARY_PUBLIC_KEY`). Đổi khoá thì mọi bản app cũ
  không đọc được danh mục mới: chỉ đổi khi lộ khoá, và ra bản app mới cùng lúc.
- Máy khác: `node tools/build.mjs --key-file <tệp PEM>` (tệp nằm ngoài repo).

## Kịch bản hiện có

| id | Tên | Nhóm |
|---|---|---|
| `nobita-tv` | Nobita TV: màn hình chính cho TV Samsung (Tizen) | tv |
