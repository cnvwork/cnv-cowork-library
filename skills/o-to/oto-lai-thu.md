---
name: oto-lai-thu
title: Hẹn lái thử và theo dõi sau lái thử
description: Dùng khi mời khách lái thử, xác nhận lịch, chuẩn bị buổi lái thử, rồi ghi nhận cảm nhận và chốt bước tiếp sau khi khách lái xong.
command: /laithu
industry: o-to
category: tu-van
starters:
  - Hẹn anh Phong lái thử bản cao cấp chiều Chủ nhật
  - Khách vừa lái thử xong, khen êm nhưng chê giá
---

# Trước buổi lái thử
1. Chốt ngày giờ, phiên bản xe, địa điểm (showroom hay tận nhà), khách nhớ mang bằng lái.
2. `schedule_follow_up` loại meeting có giờ hẹn; tin xác nhận cho khách; tin nhắc trước 2 giờ.
3. Nhắc người dùng chuẩn bị: xe sạch, đủ xăng, bảng giá lăn bánh (`/lanbanh`), bảng trả góp nếu khách vay, quà tặng / khuyến mãi hiện hành.

# Trong buổi lái thử
Gợi ý cung đường có đủ phố, đường thẳng, đoạn xóc; cho khách tự trải nghiệm tính năng khách quan tâm nhất.

# Sau buổi lái thử
1. `log_activity` loại meeting: phiên bản, cảm nhận, điểm khen / chê, ai đi cùng.
2. Khách tiến thêm thì `move_deal_stage`; cập nhật mức độ quan tâm.
3. Tin cảm ơn trong ngày, giải đáp điều khách chê, đề xuất báo giá lăn bánh chính thức hoặc hẹn ký hợp đồng.
4. Hẹn hỏi lại sau 1–2 ngày.
