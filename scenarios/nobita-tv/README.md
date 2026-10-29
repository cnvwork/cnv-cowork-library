# Nobita TV

Màn hình chính tự làm cho TV Samsung (Tizen): ô app hay dùng, trình chiếu ảnh từ Google Drive và USB,
thời tiết, màn hình thông báo chữ chạy có nhạc, ô «Video» có mã để phát video trong USB.

Đây là **mã nguồn mẫu** từ Thư viện của CNV Cowork. Bạn sửa tiếp cho nhà mình rồi tự cài lên TV của mình.

## Trong thư mục có gì

| Đường dẫn | Là gì |
|---|---|
| `app/` | App web Tizen, chạy trên trình duyệt Chromium 76 của TV |
| `app/js/config.js` | **Cấu hình của nhà bạn**: tên, album Drive, thành phố thời tiết, mã ô Video. Sửa tệp này trước |
| `app/js/app.js` | Toàn bộ màn hình chính (app, ảnh, thời tiết, USB, điều khiển bằng remote) |
| `app/js/announce.js`, `app/css/announce.css` | Màn hình thông báo chữ chạy |
| `app/css/style.css` | Giao diện |
| `app/img/splash.jpg` | Ảnh bên phải màn chào (ảnh của tác giả Nobita TV): thay bằng ảnh của bạn |
| `app/config.xml` | Khai báo app Tizen: mã app, quyền, tên |
| `app/announce-preview.html` | Xem thử màn hình thông báo trên máy tính |
| `scripts/install.sh` | Kiểm tra, đóng gói, ký và cài lên TV (macOS) |
| `scripts/make-thumbs.py` | Tạo ảnh thu nhỏ cho video trong USB (cần ffmpeg) |
| `cowork/SKILL.md` | Kỹ năng cho trợ lý CNV Cowork: cấu trúc dự án, cách sửa tiếp |
| `manifest.json` | Thông tin kịch bản (phiên bản, yêu cầu) |

## 1. Sửa cho nhà bạn

Mở `app/js/config.js` và điền:

- `tvName`: tên hiện trên màn hình.
- `driveFolderId`: tạo một thư mục Google Drive, chia sẻ **«Bất kỳ ai có đường liên kết»**, dán mã thư mục
  (đoạn sau `/folders/` trong đường liên kết). Mỗi thư mục con là một album. Để trống thì chỉ có ảnh USB.
- `weather`: tên thành phố và toạ độ (mặc định Hà Nội; tra toạ độ trên Google Maps: bấm chuột phải vào chỗ đó).
- `usbPin`: mã 4 số mở ô «Video». **Đổi, đừng để `0000`.**
- `splashPhoto`: ảnh bên phải màn chào. Mặc định `img/splash.jpg` là ảnh của tác giả Nobita TV: thay tệp đó bằng ảnh
  của bạn (dọc, khoảng 900×1400), hoặc để trống nếu không cần ảnh.

Không ghi mật khẩu, mã API hay thứ gì bí mật vào `config.js`: tệp này nằm trong gói cài lên TV.

## 2. Xem thử trên máy tính

Mở Terminal trong thư mục `app/` và chạy:

```bash
python3 -m http.server 8000
```

rồi mở `http://localhost:8000/?nosplash=1` bằng Chrome. Trên máy tính, app dùng ảnh và danh sách app giả,
bấm phím mũi tên / Enter thay remote. Màn hình thông báo: mở `http://localhost:8000/announce-preview.html`.

## 3. Chuẩn bị máy Mac (một lần)

1. Cài **Tizen Studio 6** bản CLI vào `~/tizen-studio` (Samsung chỉ có bản x86_64). Máy chip Apple cần Rosetta:
   tự chạy `sudo softwareupdate --install-rosetta` (lệnh hỏi mật khẩu máy).
2. Mở Package Manager của Tizen Studio, cài **Samsung TV Extension** và **Samsung Certificate Extension**.

Máy Windows: script `install.sh` chỉ chạy trên macOS. Dùng Tizen Studio bản đầy đủ: tạo dự án
*Tizen Project › Template › TV › Web Application › Basic Project*, chép đè các tệp trong `app/` vào dự án,
rồi *Run As › Tizen Web Application* khi TV đã kết nối (bước 5).

## 4. Chứng chỉ Samsung (mỗi người một chứng chỉ)

TV Samsung chỉ cài app đã ký bằng **chứng chỉ Samsung có mã DUID của chính TV đó**. Chứng chỉ của người khác
không cài được lên TV của bạn, và bạn không nên dùng chung chứng chỉ hay mật khẩu chứng chỉ với ai.

1. Bật TV và làm bước 5 (Developer mode) trước, để Certificate Manager nhận được TV.
2. Mở **Certificate Manager** (`~/tizen-studio/tools/certificate-manager/`), tạo hồ sơ mới tên **`nobita-tv`**:
   Samsung › TV › tạo author certificate › Distributor, quyền **Public**. Lúc TV đang kết nối, Certificate
   Manager tự điền DUID của TV.
3. Tự đăng nhập tài khoản Samsung và tự gõ mật khẩu chứng chỉ. Đừng gửi mật khẩu cho ai, kể cả trợ lý.
4. **Đóng Certificate Manager** (nó làm `sdb` mất kết nối).

Chứng chỉ nằm ngoài thư mục dự án (`~/SamsungCertificate/`, `~/tizen-studio-data/`). Đừng chép chứng chỉ vào
thư mục này. Hồ sơ tên khác `nobita-tv` thì chạy script với `NOBITA_TV_PROFILE=<tên>`.

### Thêm TV vào chứng chỉ

Chứng chỉ không sửa được, phải tạo lại. `install.sh --check` in ra DUID của TV và các DUID chứng chỉ đang có.
Tạo lại chứng chỉ Distributor với **tất cả TV cũ lẫn TV mới** (thiếu TV cũ thì lần cập nhật sau TV cũ không cài được).

## 5. Bật Developer mode trên TV

1. Xem IP của máy Mac: `ipconfig getifaddr en0` (hoặc `en1`).
2. Trên TV mở **Ứng dụng (Apps)**, bấm lần lượt **1 2 3 4 5** trên remote (remote không có số thì dùng bàn phím
   số trên màn hình). Bật **Developer mode: On**, **Host PC IP** = IP máy Mac, bấm OK.
3. **Tắt TV rồi mở lại**: giữ nút nguồn tới khi TV khởi động lại, hoặc rút điện 30 giây.
4. Xem IP của TV: Cài đặt › Chung › Mạng › Trạng thái mạng › Cài đặt IP.

Máy Mac và TV phải cùng một mạng Wi-Fi.

## 6. Cài lên TV

Mở Terminal trong thư mục dự án:

```bash
bash scripts/install.sh 192.168.1.50 --check
```

(thay bằng IP của TV). Lệnh này chỉ kiểm tra kết nối và chứng chỉ, chưa cài gì. Ổn rồi thì cài thật:

```bash
bash scripts/install.sh 192.168.1.50
```

Cài xong TV tự mở Nobita TV, kể cả khi đang có người xem: báo cả nhà trước. Muốn cài lại từ đầu (mất ghim và
thiết lập trên TV) thì thêm `--clean`. Để bật TV là vào Nobita TV: Cài đặt › Chung › Tính năng thông minh ›
**Tự chạy ứng dụng cuối cùng** › Bật.

Mỗi lần sửa mã thì chạy lại lệnh cài cho từng TV.

## 7. Ô «Video» (video trong USB) và ảnh thu nhỏ

TV không cho app lấy khung hình video, nên ảnh thu nhỏ được tạo một lần trên máy Mac:

1. Cắm USB vào máy Mac, cài ffmpeg (`brew install ffmpeg`).
2. Chạy `python3 scripts/make-thumbs.py "/Volumes/<tên USB>/<thư mục video>"`. Script ghi `.thumbs/` cạnh video,
   bỏ qua video đã có ảnh, không gửi gì ra ngoài máy.
3. Tháo USB an toàn, cắm vào TV. Thư mục `TV_ALBUM` ở gốc USB (nếu có) là album ảnh; video khác chỉ hiện sau mã.

## 8. Viết mã cho TV

- TV chạy **Chromium 76**: không có `?.`, `??`, `flex gap`, `aspect-ratio`. Viết JavaScript kiểu ES5 / ES2017
  (`var`, `function`, `async` được), xem `app/js/app.js` làm mẫu.
- Màn hình 1920×1080, điều khiển bằng remote: mọi thứ phải chọn được bằng phím mũi tên + OK.
- Sửa `announce.js` / `announce.css` thì xem lại bằng `announce-preview.html`.

## 9. Code tiếp với trợ lý CNV Cowork

Nếu bạn tải kịch bản này từ **Thư viện** của CNV Cowork và chọn gắn làm Thư mục làm việc, trợ lý đọc được
mã trong thư mục và kỹ năng **/nobitatv** đã cài sẵn. Gõ ví dụ «/nobitatv đổi thành phố thời tiết sang Đà Nẵng».

- Trợ lý chỉ **đề xuất** sửa từng tệp; bạn xem toàn bộ nội dung trên thẻ duyệt rồi mới ghi.
- Trợ lý **không tự chạy lệnh**. Nếu bạn bật «Cho trợ lý chạy lệnh terminal» (Cài đặt › Thư mục làm việc), trợ lý đề xuất
  lệnh cài ở mục 6 trên một thẻ, bạn đọc rồi bấm «Chạy»; chưa bật thì trợ lý chỉ bạn lệnh để bạn tự chạy.
- Tệp quá lớn để hiện hết trên thẻ duyệt (như `app/js/app.js`) thì trợ lý chỉ chỗ cần sửa để bạn sửa tay,
  hoặc đề xuất tách phần mới ra tệp nhỏ.

## Sự cố

| Triệu chứng | Cách xử lý |
|---|---|
| Không thấy TV ở cổng 26101 | TV chưa bật, Developer mode chưa bật, Host PC IP sai, hoặc chưa khởi động lại TV |
| `sdb` không kết nối dù cổng mở | Đóng Certificate Manager; chạy `~/tizen-studio/tools/sdb kill-server` rồi thử lại |
| Cài lỗi chữ ký / certificate | DUID của TV chưa có trong chứng chỉ, hoặc chứng chỉ hết hạn |
| IP máy Mac đổi | Nhập lại Host PC IP mới trên TV, rồi khởi động lại TV |
| Không có ảnh Drive | Thư mục chưa chia sẻ «Bất kỳ ai có đường liên kết», hoặc `driveFolderId` sai |
| Không có thời tiết | TV chưa có mạng, hoặc toạ độ sai |

## Giấy phép

Mã nguồn của CNV, được dùng và sửa cho TV của bạn. `app/js/vendor/html2canvas.min.js` là html2canvas 1.4.1
(Niklas von Hertzen, giấy phép MIT, giữ nguyên thông báo bản quyền trong tệp). `app/img/splash.jpg` là ảnh của tác giả
Nobita TV, chỉ để làm mẫu màn chào: dùng app cho nhà mình thì thay bằng ảnh của bạn. Biểu tượng app của hãng khác
(YouTube, Netflix…) không kèm theo: nếu tự thêm, bạn tự chịu trách nhiệm về quyền dùng hình.
