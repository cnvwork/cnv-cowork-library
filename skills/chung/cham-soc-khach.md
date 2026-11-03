---
name: cham-soc-khach
title: Soạn tin chăm sóc khách
description: Dùng khi cần nhắn hỏi thăm, nhắc lại, chúc mừng hay chăm sóc một khách cụ thể, hoặc nhắn lại khách đã hỏi mà chưa chốt. Đọc lịch sử khách trong CRM, chọn đúng lúc và đúng nội dung theo trạng thái của khách, rồi soạn tin riêng cho khách đó để người dùng sao chép gửi.
command: /chamsoc
category: cham-soc
starters:
  - Soạn tin hỏi thăm anh Nam sau buổi gặp hôm qua
  - Nhắn chúc mừng sinh nhật chị Lan
  - Khách nào lâu rồi chưa liên lạc, soạn tin hỏi thăm giúp
  - Khách hỏi giá hôm qua mà chưa chốt, nhắn lại thế nào?
---

# Mục tiêu
Một tin nhắn ngắn, đúng người, đúng lúc, nhắc được chi tiết riêng của khách. Không phải tin mẫu chung chung.

# Nguyên tắc 3Đ
- **Đúng người**: biết khách đang ở trạng thái nào trước khi viết: mới hỏi, đang cân nhắc, vừa mua, mua nhiều lần, lâu không quay lại, từng không vui.
- **Đúng thông điệp**: mỗi trạng thái một kiểu tin (bảng dưới), không gửi cùng một tin cho mọi người.
- **Đúng lúc**: tin đúng mà đến muộn thì mất tác dụng; theo các mốc ở dưới.

| Trạng thái | Nên nhắn | Tránh |
|---|---|---|
| Mới hỏi, chưa chốt | Trả lời nốt điều khách còn băn khoăn, một câu hỏi mở | Dồn dập ưu đãi |
| Đang cân nhắc | Lý do tin: đánh giá thật, đổi trả, hình thật | Giảm giá vội |
| Vừa mua | Cảm ơn, xác nhận, hướng dẫn dùng | Chào bán thêm ngay |
| Mua nhiều lần | Ưu đãi riêng, mời giới thiệu bạn bè (`/gioithieu`) | Tin chung như khách mới |
| Lâu không quay lại | Hỏi thăm, một thông tin có ích | Chào bán ngay câu đầu |
| Từng không vui | Nhận phần lỗi, nói cách sửa cụ thể | Tin mẫu, né tránh |

# Mốc nhắn lại khách đã hỏi mà chưa chốt
Messenger và Instagram chỉ cho trang gửi tin chào bán trong **24 giờ** kể từ tin cuối của khách. Trong khung đó, nhắn lại tối đa ba lần, mỗi lần một nội dung mới; khách trả lời thì dừng chuỗi và trò chuyện bình thường:
1. **Sau 4–6 giờ**: trả lời nốt điều khách còn hỏi hoặc ngại (giá, size, cách dùng), kết bằng một câu hỏi mở.
2. **Sau 10–12 giờ**: thêm một lý do tin: đánh giá thật, chính sách đổi trả, hình / video thật của sản phẩm.
3. **Sau 18–22 giờ**, trước khi hết 24 giờ: hỏi khách có cần giúp đặt không, nhắc ưu đãi nếu có thật.
Quá 24 giờ trên Messenger / Instagram thì không gửi tin chào bán nữa; chỉ gửi các loại tin Meta cho phép (vd cập nhật về đơn đã đặt) hoặc chờ khách nhắn lại. Zalo, điện thoại không có khung này nhưng vẫn giữ nhịp trên, tối đa ba lần, rồi chuyển sang chăm sóc thưa (vài ngày đến một tuần một lần).

# Mốc sau khi mua
- Trong 1–2 giờ sau khi chốt: cảm ơn, xác nhận đơn, thời gian giao.
- Khi hàng tới / 1–3 ngày sau buổi dịch vụ: hỏi dùng thế nào, gửi hướng dẫn.
- Sau 7–14 ngày: hỏi cảm nhận, xin đánh giá nếu khách hài lòng.
- Gần lúc dùng hết (mỹ phẩm, thực phẩm, vật tư…): nhắc mua lại.
- Lâu không tương tác (vài tuần đến vài tháng, tuỳ ngành): hỏi thăm, chưa chào bán.

# Các bước
1. Tìm khách bằng `search_contacts`, rồi `get_contact` để đọc ghi chú, lần liên hệ gần nhất, cơ hội và báo giá đang mở. Người dùng hỏi "khách lâu chưa liên lạc" thì dùng `search_contacts` với `sort: stale`. Khách nhắn qua Zalo đã nối vào Cowork thì đọc thêm cuộc trò chuyện (`list_zalo_chats`, `read_zalo_chat`) để biết khách hỏi gì, lúc nào.
2. Xác định trạng thái (3Đ) và lý do nhắn; tính mốc theo giờ tin cuối của khách.
3. Soạn một tin chính và một bản ngắn hơn. Mỗi tin 2–5 câu, có ít nhất một chi tiết riêng của khách và đúng MỘT lời mời hành động (hẹn gọi, gửi thông tin, ghé xem…).
4. Xưng hô, giọng văn và chữ ký theo hồ sơ kinh doanh.
5. Mặc định để người dùng sao chép gửi. Khách ở Zalo đã nối và người dùng muốn gửi luôn: đề xuất thẻ `send_zalo_message` (thẻ hiện đủ nội dung, người dùng bấm mới gửi).
6. Hỏi người dùng có muốn ghi lại lần chăm sóc này (`log_activity`) và hẹn các mốc tiếp theo (`schedule_follow_up`, mỗi mốc một thẻ) không. Khách chưa có trong sổ liên hệ thì ghi khách vào trước bằng `/nhapkhach`.

# Khung tin theo tình huống
- **Sau buổi gặp:** cảm ơn, nhắc lại điều khách quan tâm, đề xuất bước tiếp.
- **Nhắc báo giá:** hỏi khách đã xem chưa, nêu một lợi ích chính, mời hỏi thêm. Không hối thúc.
- **Khách lâu không liên lạc:** hỏi thăm thật lòng, nhắc lại nhu cầu cũ, chia sẻ một thông tin có ích. Chưa chào bán ngay.
- **Chúc mừng (sinh nhật, khai trương, ngày lễ):** ngắn, ấm, không kèm quảng cáo.

# Lưu ý
- Không bịa chi tiết không có trong CRM. Thiếu thông tin thì hỏi người dùng.
- Không tự gửi: chỉ soạn, hoặc đề xuất thẻ gửi khi người dùng yêu cầu.
- Không viết hoa cả câu, tối đa 2 emoji. Khách đã nói không muốn nhận tin thì thôi nhắn.
