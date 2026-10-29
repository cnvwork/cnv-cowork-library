---
name: nobita-tv
title: Code tiếp Nobita TV
description: Dùng khi người dùng muốn sửa, thêm tính năng hoặc cài app Nobita TV (màn hình chính cho TV Samsung Tizen) tải từ Thư viện CNV Cowork. Đọc mã trong Thư mục làm việc «Nobita TV», đề xuất sửa từng tệp qua thẻ duyệt, cài lên TV bằng script qua thẻ terminal_run (hoặc chỉ người dùng tự chạy).
command: /nobitatv
category: noi-dung
starters:
  - Đổi thành phố thời tiết sang Đà Nẵng
  - Thêm ô app VieON lên màn hình chính
  - Chỉ tôi cách cài Nobita TV lên TV mới
---

# Dự án
Nobita TV là app web Tizen (TV Samsung, trình duyệt Chromium 76). Mã nằm trong Thư mục làm việc người dùng đã gắn
(thường tên «Nobita TV»). Gọi `workspace_list` để lấy mã thư mục, KHÔNG đoán.

- `app/js/config.js`: cấu hình của nhà người dùng (tvName, driveFolderId, weather, usbPin, splashPhoto,
  bundledIcons, feedUrl, debugLog). Việc nhỏ (đổi tên, album, thành phố, mã) chỉ sửa tệp này. Ảnh màn chào là
  `app/img/splash.jpg` (ảnh của tác giả): người dùng tự chép ảnh của họ đè lên, trợ lý không ghi được tệp ảnh.
- `app/js/app.js`: toàn bộ màn hình chính, chia mục bằng dòng `// ----- <tên mục>` (apps, Google Drive, weather,
  announcements, USB, start-up splash). Danh sách app mặc định: `DEFAULT_APPS`; tên ngắn: `SHORT_NAMES`.
- `app/js/announce.js` + `app/css/announce.css`: màn hình thông báo chữ chạy. `app/css/style.css`: giao diện.
- `app/index.html`: khung trang; `app/config.xml`: mã app Tizen, quyền.
- `scripts/install.sh`: đóng gói, ký, cài lên TV (người dùng tự chạy). `README.md`: hướng dẫn đầy đủ.

# Các bước khi sửa mã
1. Đọc tệp liên quan bằng `workspace_read` trước khi đề xuất. Tệp dài thì đọc tiếp bằng `offset`.
2. Viết mã cho Chromium 76: `var` / `function` / `async`, KHÔNG dùng `?.`, `??`, `flex gap`, `aspect-ratio`,
   class field. Mọi thứ trên màn hình phải chọn được bằng phím mũi tên + OK của remote.
3. Đề xuất ghi bằng `workspace_write_file` (kèm `sha256` của lần đọc khi ghi đè). Người dùng xem toàn bộ nội dung
   trên thẻ rồi mới bấm ghi. Nói ngắn gọn đã đổi gì và vì sao.
4. Tệp quá dài để hiện hết trên thẻ (như `app/js/app.js`): KHÔNG đề xuất ghi cả tệp. Hoặc chỉ đúng đoạn cần sửa
   (tên hàm, đoạn cũ → đoạn mới) để người dùng sửa tay, hoặc đặt phần mới vào tệp nhỏ (vd `app/js/extra.js`) và thêm
   `<script src="js/extra.js"></script>` vào `app/index.html` TRƯỚC `js/app.js` hay SAU tuỳ phần đó cần gì.
5. Sửa xong: nhắc người dùng xem thử trên máy tính (README mục 2) rồi cài lại lên TV (mục 6).

# Cài lên TV
Trước khi cài phải có: Tizen Studio, chứng chỉ Samsung RIÊNG của người dùng có DUID của TV đó (README mục 4),
Developer mode bật trên TV với Host PC IP = IP máy Mac (mục 5). Hỏi IP của TV nếu chưa có (README mục 5, bước 4).
Lệnh luôn là `bash scripts/...` (app bỏ quyền chạy của tệp khi tải về), chạy ở thư mục gốc của dự án.

Có công cụ `terminal_run` (người dùng đã bật «Cho trợ lý chạy lệnh terminal»):
1. Đề xuất `bash scripts/install.sh <IP của TV> --check` (folder = thư mục Nobita TV, timeout_seconds 120). Lệnh này chỉ kiểm
   kết nối và chứng chỉ, chưa cài gì.
2. Đọc kết quả, đối chiếu bảng «Sự cố» trong README; thiếu bước nào thì hướng dẫn người dùng làm bước đó rồi kiểm lại.
3. Kiểm ổn mới đề xuất `bash scripts/install.sh <IP của TV>` (timeout_seconds 300). Nói trước trên thẻ: cài xong TV tự chuyển
   sang Nobita TV, kể cả khi đang có người xem. `--clean` chỉ khi người dùng muốn cài lại từ đầu (mất ghim, thiết lập).
4. Mỗi lệnh một thẻ, người dùng bấm «Chạy». Không chạy lại lệnh đã chạy xong; lỗi thì giải thích rồi đề xuất bước sửa.

Không có `terminal_run`: chỉ người dùng đúng hai lệnh trên để họ tự chạy trong Terminal, ở thư mục dự án (bật được ở
Cài đặt › Thư mục làm việc nếu họ muốn trợ lý chạy qua thẻ). Windows: dùng Tizen Studio (README mục 3).

Bước chỉ người dùng làm được: bật Developer mode trên TV, đăng nhập tài khoản Samsung, gõ mật khẩu chứng chỉ trong
Certificate Manager. Không đề xuất lệnh `sudo`, không đổi cài đặt TV hộ người dùng.

# Không được
- Không hỏi, không nhận, không ghi mật khẩu tài khoản Samsung, mật khẩu chứng chỉ, tệp chứng chỉ. Người dùng dán
  mật khẩu vào chat thì nhắc họ đổi mật khẩu.
- Không ghi mã API, token hay bí mật vào `config.js` hay tệp nào trong `app/`: mọi thứ trong đó nằm trong gói cài
  lên TV.
- Không thêm thư viện tải từ mạng lúc chạy (CDN): TV có thể mất mạng; chép thư viện vào `app/js/vendor/` kèm
  thông báo bản quyền.
- Không đổi `tizen:application id` trong `config.xml` khi người dùng không yêu cầu (đổi là thành app khác trên TV).
