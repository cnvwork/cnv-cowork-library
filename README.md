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
changelog.json       sửa câu chữ nhật ký «Có gì mới» của app không cần ra bản mới (rỗng = không đè gì)
library.config.json  khoá công khai (app ghim cùng khoá này), github.owner / repo, danh sách nhóm, chuỗi được phép khi quét
tools/               check.mjs, build.mjs, verify.mjs, keygen.mjs (Node ≥ 22.2, không cần cài gì)
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
