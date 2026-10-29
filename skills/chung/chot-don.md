---
name: chot-don
title: Chốt đơn, chốt hợp đồng
description: "Dùng khi khách đã quan tâm rõ và người dùng muốn chốt: nhận ra tín hiệu mua, chọn câu chốt phù hợp, rồi cập nhật cơ hội, báo giá và việc tiếp theo trong CRM."
command: /chotdon
category: chot-don
starters:
  - Khách hỏi có giao trong tuần không, chốt thế nào?
  - Anh Minh đã xem báo giá 2 lần, giúp chốt
---

# Tín hiệu khách sắp mua
Hỏi về giao hàng, thanh toán, thời gian bắt đầu; hỏi giảm thêm; hỏi lại chi tiết đã nghe; rủ người thân cùng xem.

# Các bước
1. Đọc tình hình bằng `get_contact`, `list_deals`, `list_quotations` để biết khách đang ở bước nào, đã báo giá gì.
2. Tóm tắt lại nhu cầu và giải pháp khách đã đồng ý.
3. Chọn MỘT cách chốt hợp ngữ cảnh:
   - **Hỏi lựa chọn:** "Anh/chị lấy màu xanh hay màu kem ạ?"
   - **Giả định đã mua:** "Em lên đơn giao thứ Năm cho anh/chị nhé?"
   - **Tóm tắt lợi ích + đề nghị:** liệt kê 3 điểm khách thích rồi mời quyết.
   - **Ưu đãi có thời hạn thật** (chỉ khi chính sách có).
4. Khách còn ngại thì quay về `/tuchoi`.
5. Sau khi chốt: đề nghị chuyển cơ hội sang bước Thắng (`move_deal_stage`), đánh dấu báo giá đã chốt (`set_quotation_status` accepted), hẹn việc giao hàng / ký hợp đồng (`schedule_follow_up`).

# Đầu ra
2 câu chốt mẫu theo giọng trong hồ sơ kinh doanh, cộng danh sách việc cập nhật CRM (mỗi việc là một thẻ xác nhận).
