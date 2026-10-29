---
name: cham-soc-khach
title: Soạn tin chăm sóc khách
description: Dùng khi cần nhắn hỏi thăm, nhắc lại, chúc mừng hay chăm sóc một khách cụ thể. Đọc lịch sử khách trong CRM rồi soạn tin riêng cho khách đó để người dùng sao chép gửi.
command: /chamsoc
category: cham-soc
starters:
  - Soạn tin hỏi thăm anh Nam sau buổi gặp hôm qua
  - Nhắn chúc mừng sinh nhật chị Lan
  - Khách nào lâu rồi chưa liên lạc, soạn tin hỏi thăm giúp
---

# Mục tiêu
Một tin nhắn ngắn, đúng người, đúng lúc, nhắc được chi tiết riêng của khách. Không phải tin mẫu chung chung.

# Các bước
1. Tìm khách bằng `search_contacts`, rồi `get_contact` để đọc ghi chú, lần liên hệ gần nhất, cơ hội và báo giá đang mở.
   Người dùng hỏi "khách lâu chưa liên lạc" thì dùng `search_contacts` với `sort: stale`.
2. Xác định lý do nhắn: hỏi thăm sau buổi gặp, nhắc báo giá, chúc mừng, báo sản phẩm mới, hay nối lại với khách lâu không liên lạc.
3. Soạn một tin chính và một bản ngắn hơn. Mỗi tin 2–5 câu, có ít nhất một chi tiết riêng của khách và đúng MỘT lời mời hành động (hẹn gọi, gửi thông tin, ghé xem…).
4. Xưng hô, giọng văn và chữ ký theo hồ sơ kinh doanh.
5. Hỏi người dùng có muốn ghi lại lần chăm sóc này (`log_activity`) và hẹn bước tiếp (`schedule_follow_up`) không.

# Khung tin theo tình huống
- **Sau buổi gặp:** cảm ơn, nhắc lại điều khách quan tâm, đề xuất bước tiếp.
- **Nhắc báo giá:** hỏi khách đã xem chưa, nêu một lợi ích chính, mời hỏi thêm. Không hối thúc.
- **Khách lâu không liên lạc:** hỏi thăm thật lòng, nhắc lại nhu cầu cũ, chia sẻ một thông tin có ích. Chưa chào bán ngay.
- **Chúc mừng (sinh nhật, khai trương, ngày lễ):** ngắn, ấm, không kèm quảng cáo.

# Lưu ý
- Không bịa chi tiết không có trong CRM. Thiếu thông tin thì hỏi người dùng.
- Chỉ soạn để người dùng sao chép; trợ lý không tự gửi.
- Không viết hoa cả câu, tối đa 2 emoji.
