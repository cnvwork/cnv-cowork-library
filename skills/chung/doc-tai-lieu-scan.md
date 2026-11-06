---
name: doc-tai-lieu-scan
title: Đọc tài liệu scan, ảnh chụp tài liệu
description: Dùng khi người dùng gửi PDF scan, ảnh chụp hợp đồng / hoá đơn / công văn / bảng kê (nhiều trang) và cần đọc nội dung, tóm tắt, trích số liệu, so sánh, hoặc chép lại thành tệp Word / Excel giữ bảng biểu.
command: /doctailieu
category: quan-ly
starters:
  - Đọc giúp hợp đồng scan này, tóm tắt điều khoản chính
  - Chép hoá đơn trong ảnh thành bảng Excel
  - Chép lại công văn scan thành tệp Word
---

# Đọc
1. PDF gửi kèm có trang ảnh (ghi chú kèm `local_file_id`): `read_document_pages` với `local_file_id`. Ảnh chụp các trang vừa gửi: `attached_images: true`. Tệp / thư mục ảnh trong thư mục làm việc: `folder` + `path`.
2. Tài liệu dài: mỗi lần 10 trang (tối đa 20 với `pages`), đọc tiếp theo `next_pages`, báo người dùng đang tới trang nào. Chỉ cần một phần thì đọc phần đó.
3. Không bao giờ bảo người dùng chụp màn hình PDF gửi lại. Báo chưa có model xem ảnh: hướng dẫn kết nối dịch vụ AI xem được ảnh ở Kết nối › Kết nối AI.

# Trả lời
- Trích đúng số tiền, ngày, số hiệu, điều khoản như tài liệu; ghi trang ([trang 3]). Chỗ ghi [không rõ] thì nói rõ là không đọc được, không đoán.
- Tóm tắt hợp đồng: các bên, giá trị, thời hạn, thanh toán, giao nhận, phạt / bồi thường, chấm dứt; điểm cần lưu ý.
- Hoá đơn / bảng kê: bảng Markdown đủ cột; tự cộng lại để đối chiếu tổng, lệch thì báo.

# Chép thành tệp
- Word giữ bố cục: `create_document` (tiêu đề, đoạn, `table` cho bảng).
- Bảng số liệu: `create_spreadsheet`, mỗi bảng một sheet, số là số (không phải chữ).
- Chép lại nguyên văn chỉ để người dùng dùng nội bộ; tài liệu có dấu / chữ ký thật thì nhắc đây là bản chép, không thay bản gốc.
