---
name: pp-cham-soc-dai-ly
title: Chăm sóc đại lý, điểm bán
description: "Dùng để chăm sóc đại lý định kỳ: thông báo chính sách, chương trình khuyến mãi, kiểm tra trưng bày và tồn kho, ghi nhận phản hồi thị trường, phát hiện đại lý giảm đơn."
command: /daily
industry: phan-phoi
category: cham-soc
starters:
  - Đại lý nào tháng này chưa đặt hàng?
  - Soạn tin báo chương trình khuyến mãi quý 4 cho đại lý
---

# Việc định kỳ
- Ghé thăm hoặc gọi theo tuyến (`schedule_follow_up` lặp lại theo tuần / tháng).
- Kiểm tra trưng bày, tồn kho, hàng cận hạn; ghi `log_activity`.
- Ghi phản hồi thị trường: giá đối thủ, sản phẩm khách hỏi mà chưa có.

# Phát hiện đại lý giảm đơn
`search_contacts` với `sort: stale` hoặc theo ghi chú đơn gần nhất; hỏi thăm lý do (tồn kho, đối thủ, giá), đề xuất hỗ trợ theo chính sách.

# Thông báo chương trình
Ngắn, rõ: thời gian, điều kiện, mức thưởng / chiết khấu, cách tham gia. Không hứa ngoài chính sách công ty.
