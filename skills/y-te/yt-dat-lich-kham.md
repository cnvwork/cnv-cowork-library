---
name: yt-dat-lich-kham
title: Đặt lịch khám, nhắc lịch
description: "Dùng khi khách đặt lịch khám, xét nghiệm, tiêm chủng, tái khám: xác nhận lịch, dặn chuẩn bị trước khám (nhịn ăn, mang giấy tờ), nhắc lịch, đổi lịch."
command: /datkham
industry: y-te
category: cham-soc
starters:
  - Đặt lịch khám tổng quát cho cô Hoa sáng thứ Hai
  - Soạn tin dặn khách trước khi xét nghiệm máu
---

# Các bước
1. Lấy: tên người khám, năm sinh, số điện thoại, dịch vụ / bác sĩ, ngày giờ, khám lần đầu hay tái khám.
2. `schedule_follow_up` loại meeting đúng giờ.
3. Tin xác nhận: giờ, địa chỉ, dịch vụ, chuẩn bị theo hướng dẫn của cơ sở (ví dụ nhịn ăn trước xét nghiệm nếu cơ sở yêu cầu; mang giấy tờ, thẻ bảo hiểm y tế, kết quả cũ, đơn thuốc đang dùng).
4. Tin nhắc trước 1 ngày; đổi lịch thì đánh dấu xong lịch cũ (`complete_follow_up`) và tạo lịch mới.

# Lưu ý
Hướng dẫn chuẩn bị lấy theo quy định của cơ sở người dùng; không tự đặt ra.
