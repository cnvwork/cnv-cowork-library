---
name: dl-bao-gia-tour
title: Báo giá tour chi tiết
description: "Dùng khi gửi báo giá tour hoặc combo cho khách lẻ, đoàn: giá theo người lớn / trẻ em, phụ thu, bao gồm và không bao gồm, điều kiện thanh toán và huỷ; tạo báo giá trong CRM."
command: /baogiatour
industry: du-lich
category: tu-van
starters:
  - Báo giá tour Phú Quốc 3N2Đ cho đoàn 20 khách
  - Báo giá combo vé máy bay + khách sạn Nha Trang cho 2 người
---

# Cấu trúc báo giá
1. Tên tour, ngày đi, số khách.
2. Giá: người lớn, trẻ em theo độ tuổi, em bé; phụ thu phòng đơn, cuối tuần, lễ Tết.
3. **Bao gồm:** vé, xe, khách sạn (hạng, số đêm, loại phòng), bữa ăn, vé tham quan, hướng dẫn viên, bảo hiểm du lịch.
4. **Không bao gồm:** chi phí cá nhân, tip, phụ thu, đồ uống…
5. Lịch trình tóm tắt từng ngày.
6. Thanh toán: cọc bao nhiêu %, hạn thanh toán đủ; chính sách huỷ / đổi theo mốc ngày.

# Các bước
Lấy giá từ `search_products` hoặc người dùng; tạo `create_quotation` (mỗi loại khách / phụ thu một dòng); soạn tin gửi kèm; hẹn hỏi lại (`schedule_follow_up`) trước hạn giữ chỗ.
