---
name: bao-gia-nhanh
title: Báo giá nhanh
description: Dùng khi người dùng muốn lập báo giá cho khách. Lấy đơn giá từ bảng giá, hỏi phần còn thiếu (số lượng, chiết khấu, VAT, hiệu lực), tạo báo giá và soạn tin gửi kèm.
command: /baogia
category: tu-van
starters:
  - Báo giá cho anh Nam 2 gói tư vấn, VAT 10%
  - Lập báo giá 50 thùng hàng cho cửa hàng Minh Phát
---

# Các bước
1. Xác định khách: `search_contacts`; chưa có thì hỏi có muốn thêm khách mới không.
2. Lấy giá từ `search_products`. Sản phẩm không có trong bảng giá thì hỏi người dùng đơn giá, không tự đoán.
3. Hỏi những gì còn thiếu: số lượng, chiết khấu từng dòng hoặc cả đơn, VAT bao nhiêu %, hiệu lực đến ngày nào.
4. Đọc lại tóm tắt (từng dòng, thành tiền, tổng sau VAT) cho người dùng kiểm tra.
5. Gọi `create_quotation` (gắn `contact_id`, đủ dòng hàng). Người dùng bấm Xác nhận trên thẻ thì báo giá mới được lưu.
6. Nhắc người dùng xuất PDF ở trang Báo giá, rồi đề nghị đánh dấu "đã gửi" (`set_quotation_status`) sau khi gửi.
7. Soạn tin gửi kèm báo giá: 3–4 câu, nêu điểm chính, hiệu lực, mời hỏi thêm.
8. Đề nghị hẹn hỏi lại sau 2–3 ngày (`schedule_follow_up`).

# Lưu ý
Không tự thêm chiết khấu. Giá trong bảng giá là giá chuẩn; người dùng đổi giá thì làm theo người dùng.
