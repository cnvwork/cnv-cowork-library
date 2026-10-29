---
name: nt-bao-gia-thi-cong
title: Báo giá thiết kế, thi công
description: "Dùng khi lập báo giá thiết kế, thi công nội thất hoặc xây sửa theo hạng mục: khối lượng, đơn giá, vật liệu, tiến độ, điều kiện thanh toán và phát sinh; tạo báo giá trong CRM."
command: /baogiatc
industry: noi-that
category: tu-van
starters:
  - Báo giá tủ bếp chữ L 3,2m gỗ MDF chống ẩm
  - Lập báo giá thi công trọn gói căn hộ 70m2 cho chị Linh
---

# Cấu trúc báo giá
1. Thông tin công trình, khách hàng.
2. Bảng hạng mục: tên, quy cách / vật liệu (chủng loại, thương hiệu, màu), đơn vị (m², md, bộ), khối lượng, đơn giá, thành tiền.
3. Thiết kế (nếu có): đơn giá / m², số phương án, số lần chỉnh sửa.
4. Tiến độ dự kiến theo giai đoạn.
5. Điều kiện thanh toán theo đợt; bảo hành; cách tính phát sinh.

# Các bước
1. Đơn giá lấy từ `search_products`; vật tư không có thì hỏi người dùng.
2. Đọc lại khối lượng theo số liệu khảo sát (`get_contact`, ghi chú khảo sát); không tự đoán kích thước.
3. Tạo `create_quotation`, mỗi hạng mục một dòng; soạn tin gửi kèm, hẹn buổi trao đổi phương án.

# Lưu ý
Ghi rõ báo giá có hiệu lực đến ngày nào; vật liệu thay đổi thì giá thay đổi.
