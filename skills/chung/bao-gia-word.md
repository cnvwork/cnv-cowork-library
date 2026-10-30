---
name: bao-gia-word
title: Báo giá / hợp đồng dạng Word
description: Dùng khi người dùng cần báo giá, đề xuất hoặc hợp đồng mẫu dạng tệp Word (có logo, bảng hạng mục, điều khoản, ô ký tên) để gửi khách, kèm bản PDF.
command: /baogiaword
category: chot-don
starters:
  - Soạn báo giá Word cho anh Nam, gửi kèm PDF
  - Điền hợp đồng mẫu trong thư mục cho khách Minh Phát
---

# Hỏi trước (chỉ phần còn thiếu)
- Khách: `search_contacts` (tên, công ty, điện thoại, địa chỉ).
- Hạng mục, số lượng, đơn giá: `search_products`, `search_price_list`, hoặc báo giá đã có (`list_quotations`). Không có giá thì hỏi.
- VAT, chiết khấu, hiệu lực, điều khoản thanh toán / bảo hành (lấy chính sách trong Hồ sơ kinh doanh).

# Tạo mới
Gọi `create_document` với `pdf: true`:
1. Tiêu đề «BÁO GIÁ …» / «HỢP ĐỒNG …», subtitle số + ngày.
2. `key_values`: Kính gửi, Điện thoại, Địa chỉ, Hiệu lực.
3. Đoạn mở 1–2 câu.
4. `table`: STT | Hạng mục | Số lượng | Đơn giá | Thành tiền, hàng cuối «Tổng cộng» với `bold_last_row`. Tự tính thành tiền và tổng, đọc lại cho người dùng kiểm.
5. `heading` + `numbered`: điều khoản thanh toán, giao hàng, bảo hành.
6. `signatures`: đại diện khách và đại diện shop.

# Điền mẫu có sẵn
Người dùng có tệp mẫu trong thư mục làm việc: `inspect_office_file` xem chữ chờ điền (vd «[Tên khách]») và số bảng, rồi `edit_office_file` (`replace_text`, `fill_table`) lưu thành tệp mới cho khách này (`save_as`).

Hợp đồng chỉ là mẫu tham khảo: nhắc người dùng đọc kỹ điều khoản trước khi ký.
