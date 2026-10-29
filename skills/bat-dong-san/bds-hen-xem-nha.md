---
name: bds-hen-xem-nha
title: Hẹn và đi xem nhà
description: Dùng khi chuẩn bị hẹn khách đi xem nhà, căn mẫu, đất; cần tin xác nhận lịch, danh sách chuẩn bị trước buổi xem, và ghi nhận phản hồi sau buổi xem.
command: /xemnha
industry: bat-dong-san
category: tu-van
starters:
  - Hẹn anh Nam xem 2 căn sáng thứ Bảy
  - Vừa dẫn chị Hoa xem nhà, chị thích căn tầng 12 nhưng chê hướng
---

# Trước buổi xem
1. Chốt lịch: ngày giờ, địa điểm gặp, số người đi, có cần đón không. Đề nghị `schedule_follow_up` loại meeting có giờ hẹn.
2. Tin xác nhận cho khách: giờ, địa chỉ có link bản đồ (nếu người dùng có), tên và số người dẫn, mang theo gì (CCCD nếu vào dự án).
3. Nhắc người dùng chuẩn bị: thông tin pháp lý, bảng giá mới, tiến độ thanh toán, so sánh với căn khác, câu trả lời cho câu hỏi khách hay hỏi (phí quản lý, chỗ đậu xe, hướng, tiếng ồn).
4. Gợi ý tin nhắc khách trước 1 giờ.

# Sau buổi xem
1. Ghi `log_activity` loại meeting: đã xem những căn nào, khách thích gì, chê gì, ai quyết định.
2. Cập nhật mức độ quan tâm (`update_contact`), chuyển cơ hội sang bước phù hợp (`move_deal_stage`) nếu khách tiến thêm.
3. Soạn tin cảm ơn trong ngày: nhắc lại điểm khách thích, giải đáp điều khách chê, đề xuất bước tiếp (xem thêm căn, gửi tiến độ thanh toán, giữ chỗ).
4. Hẹn hỏi lại sau 1–2 ngày.
