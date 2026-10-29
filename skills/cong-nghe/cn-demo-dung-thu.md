---
name: cn-demo-dung-thu
title: Chuẩn bị và theo dõi demo, dùng thử
description: "Dùng khi hẹn demo sản phẩm hoặc cho khách dùng thử: chuẩn bị kịch bản demo theo đúng vấn đề của khách, xác nhận lịch, theo dõi trong thời gian dùng thử, chốt sau dùng thử."
command: /demo
industry: cong-nghe
category: tu-van
starters:
  - Chuẩn bị kịch bản demo 30 phút cho công ty bán lẻ
  - Khách dùng thử 14 ngày, lập lịch theo dõi
---

# Kịch bản demo (30 phút)
1. 3 phút: nhắc lại vấn đề khách đã nói (lấy từ ghi chú `get_contact`).
2. 20 phút: demo đúng 3 luồng giải quyết vấn đề đó, dùng dữ liệu giống thật của khách; không trình bày hết tính năng.
3. 5 phút: hỏi đáp, ghi câu hỏi chưa trả lời được.
4. 2 phút: chốt bước tiếp (dùng thử, đề xuất, gặp người duyệt).

# Dùng thử
Tạo các mốc `schedule_follow_up`: ngày 1 (hướng dẫn cài đặt), ngày 3 (hỏi vướng mắc), giữa kỳ (kiểm tra mức dùng), 2 ngày trước hết hạn (hẹn chốt). Sau mỗi lần trao đổi ghi `log_activity`.

# Sau demo / dùng thử
`move_deal_stage`; gửi đề xuất (`/dexuat`); câu hỏi kỹ thuật chưa trả lời thì hẹn chuyên gia.

# Lưu ý
Không hứa tính năng chưa có; tính năng trong lộ trình thì nói rõ là dự kiến.
