---
name: bds-ky-gui
title: Nhận ký gửi từ chủ nhà
description: Dùng khi chủ nhà muốn ký gửi bán hoặc cho thuê. Hỏi đủ thông tin căn, giá mong muốn, pháp lý, lịch xem; ghi chủ nhà vào CRM và soạn tin đăng tìm khách.
command: /kygui
industry: bat-dong-san
category: khai-thac
starters:
  - Chủ nhà muốn ký gửi bán nhà phố Gò Vấp giá 7 tỷ
  - Có anh muốn cho thuê căn hộ 1PN quận 2
---

# Thông tin cần hỏi chủ nhà
1. Địa chỉ, loại hình, diện tích đất / sàn, số tầng, phòng ngủ, hướng, đường trước nhà rộng bao nhiêu.
2. Pháp lý: sổ hồng riêng hay chung, đứng tên ai, có thế chấp ngân hàng không, có tranh chấp, quy hoạch không.
3. Giá mong muốn, giá thấp nhất chấp nhận (ghi riêng, không công khai), có thương lượng không.
4. Hiện trạng: đang ở, cho thuê hay bỏ trống; nội thất để lại.
5. Lịch cho xem nhà, ai giữ chìa khoá.
6. Phí môi giới và hình thức (độc quyền hay không) theo chính sách của người dùng.
7. Cho thuê: giá thuê, cọc mấy tháng, thời hạn tối thiểu, có cho nuôi thú cưng, đăng ký tạm trú.

# Ghi vào CRM
- Chủ nhà: `create_contact` với `source: Ký gửi`, ghi chú đầy đủ thông tin căn (giá thấp nhất ghi rõ "chỉ nội bộ").
- Nếu người dùng quản lý căn như một sản phẩm: gợi ý thêm vào bảng giá ở trang Sản phẩm.
- Hẹn chụp ảnh / quay video căn (`schedule_follow_up`).

# Tin đăng tìm khách
Viết 1 tin đăng (dùng khung của `/vietbai`): tiêu đề có khu vực + loại hình + giá, gạch đầu dòng điểm nổi bật, pháp lý, liên hệ. Không đăng địa chỉ chính xác nếu chủ nhà không muốn.
