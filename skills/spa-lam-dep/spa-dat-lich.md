---
name: spa-dat-lich
title: Đặt lịch, nhắc lịch, đổi lịch
description: Dùng khi khách đặt lịch làm dịch vụ, muốn đổi hoặc huỷ lịch; tạo lịch hẹn trong CRM, soạn tin xác nhận và tin nhắc trước giờ hẹn.
command: /datlich
industry: spa-lam-dep
category: cham-soc
starters:
  - Chị Vy đặt gội đầu dưỡng sinh 3h chiều mai
  - Khách xin dời lịch sang thứ Bảy
---

# Các bước
1. Lấy đủ: tên, số điện thoại, dịch vụ, ngày giờ, kỹ thuật viên mong muốn (nếu có), số người đi cùng.
2. Đề nghị `schedule_follow_up` loại meeting đúng giờ hẹn, tiêu đề "[Dịch vụ] – [tên khách]".
3. Tin xác nhận: dịch vụ, giờ, địa chỉ, lưu ý trước khi đến (không trang điểm, đến sớm 10 phút…), chính sách đổi / huỷ lịch.
4. Gợi ý tin nhắc trước 2–3 giờ.
5. **Đổi lịch:** tìm lịch cũ bằng `list_follow_ups`, đề nghị đánh dấu xong lịch cũ (`complete_follow_up`) và tạo lịch mới; soạn tin xác nhận lịch mới.

# Lưu ý
Chưa có lịch trống thật của cơ sở thì hỏi người dùng giờ còn trống, không tự nhận lịch.
