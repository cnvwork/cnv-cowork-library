---
name: pp-cong-no
title: Nhắc công nợ, đối chiếu
description: Dùng khi cần nhắc khách sỉ, đại lý thanh toán công nợ đến hạn hoặc quá hạn, gửi bảng đối chiếu, thoả thuận lịch trả; giữ quan hệ tốt.
command: /congno
industry: phan-phoi
category: cham-soc
starters:
  - Soạn tin nhắc công nợ 35 triệu quá hạn 10 ngày
  - Đại lý xin khất nợ sang tháng sau, trả lời sao?
---

# Cách theo dõi
Mỗi khoản công nợ ghi một `schedule_follow_up` loại deadline đúng ngày đến hạn, số tiền và số đơn trong tiêu đề hoặc ghi chú. `list_follow_ups` để xem khoản sắp đến hạn và quá hạn.

# Các mức nhắc
1. **Trước hạn 2–3 ngày:** báo số tiền, hạn, số tài khoản / cách thanh toán (người dùng cung cấp).
2. **Đúng hạn:** nhắc nhẹ, hỏi khách có cần đối chiếu không.
3. **Quá hạn:** hỏi thăm lý do, đề xuất lịch trả cụ thể, xin xác nhận.
4. **Quá hạn lâu:** báo người dùng quyết định (tạm ngưng giao hàng theo chính sách…).
Mỗi lần nhắc ghi `log_activity`.

# Lưu ý
Lịch sự, không doạ, không nhắn công khai trong nhóm. Khách đề xuất lịch trả thì ghi lại và hẹn đúng mốc.
