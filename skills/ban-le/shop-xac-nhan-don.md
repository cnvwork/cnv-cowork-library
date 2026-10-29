---
name: shop-xac-nhan-don
title: Xác nhận đơn và thông tin giao hàng
description: Dùng khi khách đồng ý mua. Tách tên, số điện thoại, địa chỉ, món hàng từ tin nhắn; lập tin xác nhận đơn, tạo báo giá / đơn và hẹn theo dõi giao hàng.
command: /xacnhandon
industry: ban-le
category: chot-don
starters:
  - "Khách gửi: Ngọc 0912 345 678, 12 Lê Lợi, P.Bến Nghé, Q1 — lấy 2 hũ kem"
  - Lên đơn cho chị Hà 1 nồi chiên size L, COD
---

# Các bước
1. Tách thông tin: người nhận, số điện thoại, địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh), món, số lượng, size/màu, hình thức thanh toán (COD, chuyển khoản), ghi chú.
2. Thiếu hoặc nghi sai (số điện thoại không đủ 10 số, thiếu phường) thì hỏi lại khách trước khi lên đơn.
3. Tính tiền: giá từ `search_products` × số lượng + phí ship − giảm giá (nếu có theo chính sách).
4. Soạn tin xác nhận đơn cho khách: món, số lượng, tổng tiền, địa chỉ, thời gian giao dự kiến, cách thanh toán.
5. Ghi CRM: `create_contact` hoặc `update_contact` (địa chỉ trong ghi chú), `create_quotation` làm phiếu đơn hàng nếu người dùng muốn lưu đơn, `schedule_follow_up` hỏi khách đã nhận hàng chưa sau ngày giao dự kiến.

# Lưu ý
Không hối khách chuyển khoản trước nếu shop có COD. Nhắc khách kiểm hàng khi nhận nếu chính sách cho phép.
