---
name: pp-mo-diem-ban
title: Tìm và mở điểm bán, đại lý mới
description: Dùng khi phát triển điểm bán, đại lý, nhà bán lẻ mới. Chuẩn bị thông tin cửa hàng, câu chào hàng, chính sách cho điểm bán mới; ghi cửa hàng và người liên hệ vào CRM, theo dõi đến khi có đơn đầu.
command: /modiem
industry: phan-phoi
category: khai-thac
starters:
  - Chuẩn bị chào hàng cho tạp hoá Minh Phát ở Thủ Đức
  - Lập danh sách việc để mở 5 điểm bán mới tuần này
---

# Trước khi ghé
Thông tin cửa hàng: loại (tạp hoá, siêu thị mini, nhà thuốc…), quy mô, đang lấy hàng của ai, chủ hay quản lý quyết định.

# Chào hàng (5 phút)
1. Giới thiệu ngắn, nêu lợi ích cho CỬA HÀNG: biên lợi nhuận, hàng dễ bán, hỗ trợ trưng bày, đổi hàng cận hạn.
2. Hỏi cửa hàng đang bán dòng tương tự giá bao nhiêu, quay vòng thế nào.
3. Đưa chính sách điểm bán mới (chiết khấu, đơn tối thiểu, quà trưng bày) theo bảng giá và chính sách của người dùng.
4. Chốt đơn thử nhỏ.

# Ghi vào CRM
Cửa hàng là công ty: `create_contact` cho chủ / người quyết định với `company_name` = tên cửa hàng, ghi địa chỉ, quy mô, đối thủ đang lấy trong `first_note`. `create_deal` cho đơn đầu; hẹn quay lại (`schedule_follow_up`).
