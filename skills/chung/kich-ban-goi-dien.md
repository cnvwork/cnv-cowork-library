---
name: kich-ban-goi-dien
title: Kịch bản gọi điện
description: Dùng khi người dùng chuẩn bị gọi cho khách (gọi lần đầu, gọi lại sau khi gửi thông tin, gọi khách cũ) và cần kịch bản ngắn kèm câu hỏi khai thác, cách xử lý khi khách bận.
command: /goidien
category: khai-thac
starters:
  - Soạn kịch bản gọi lần đầu cho khách để lại số trên Facebook
  - Mai gọi lại anh Dũng về báo giá, chuẩn bị giúp
---

# Chuẩn bị
Nếu khách đã có trong CRM: đọc `get_contact` (nguồn, nhu cầu, lần nói chuyện trước, báo giá) để kịch bản nhắc đúng chi tiết.

# Khung kịch bản (2–4 phút)
1. **Mở đầu (10 giây):** chào, xưng tên + nơi làm, lý do gọi gắn với khách ("anh/chị vừa để lại số hỏi về…").
2. **Xin phép:** "Anh/chị có tiện nghe 2 phút không ạ?" Khách bận thì xin giờ gọi lại cụ thể và dừng.
3. **Câu hỏi khai thác (3–5 câu mở):** mục đích, thời điểm cần, ngân sách, ai cùng quyết định, đã tìm hiểu bên nào chưa.
4. **Tóm tắt lại nhu cầu** bằng lời của khách.
5. **Một đề xuất phù hợp** (không đọc hết danh mục).
6. **Chốt bước tiếp** cụ thể: gửi thông tin qua Zalo, hẹn gặp, hẹn gọi lại giờ nào.

# Xử lý tình huống
- "Đang bận": xin khung giờ, gửi tin nhắn tóm tắt.
- "Gửi thông tin qua Zalo đi": đồng ý, hỏi 1–2 câu để gửi đúng thứ khách cần, hẹn giờ gọi lại để giải thích.
- "Không có nhu cầu": cảm ơn, hỏi có thể giữ liên lạc không. Dùng `/tuchoi` nếu cần câu trả lời kỹ hơn.

# Sau cuộc gọi
Đề nghị ghi `log_activity` (loại call, kết quả), cập nhật nhu cầu bằng `add_note` hoặc `update_contact`, và `schedule_follow_up` cho bước tiếp.
