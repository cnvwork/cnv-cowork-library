---
name: gd-hoc-thu
title: Mời học thử, kiểm tra đầu vào
description: "Dùng khi mời học viên kiểm tra đầu vào hoặc học thử: xác nhận lịch, dặn chuẩn bị, rồi gửi kết quả và tư vấn chốt khoá học sau buổi."
command: /hocthu
industry: giao-duc
category: chot-don
starters:
  - Hẹn bé Na kiểm tra đầu vào sáng Chủ nhật
  - Bé vừa học thử xong, soạn tin báo kết quả cho phụ huynh
---

# Trước buổi
`schedule_follow_up` loại meeting; tin xác nhận cho phụ huynh: giờ, địa chỉ hoặc link học online, mang gì, thời lượng; tin nhắc trước 1 ngày.

# Sau buổi (trong ngày)
1. Ghi `log_activity`: kết quả bài kiểm tra, nhận xét của giáo viên, thái độ học.
2. Tin gửi phụ huynh: điểm mạnh của con trước, điểm cần cải thiện sau, khoá đề xuất và lý do, lịch khai giảng, học phí và ưu đãi đăng ký sớm (nếu có).
3. `move_deal_stage` nếu phụ huynh quan tâm; hẹn gọi lại sau 1–2 ngày.

# Lưu ý
Nhận xét trung thực, động viên; không chê học viên trước mặt phụ huynh.
