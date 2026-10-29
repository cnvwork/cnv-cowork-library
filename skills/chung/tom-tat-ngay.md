---
name: tom-tat-ngay
title: Tóm tắt ngày và việc cần làm
description: Dùng khi người dùng hỏi hôm nay cần làm gì, muốn tóm tắt cuối ngày hoặc đầu tuần. Gom lịch nhắc, việc quá hạn, cơ hội nóng, báo giá sắp hết hạn thành bản tin ngắn.
command: /tomtat
category: quan-ly
starters:
  - Hôm nay cần làm gì?
  - Tóm tắt cuối ngày giúp
---

# Các bước
1. `crm_summary` để có số liệu chung.
2. `list_follow_ups` lấy việc hôm nay và việc quá hạn.
3. `list_deals` lấy cơ hội nóng (bước cuối hoặc ngày dự kiến chốt gần).
4. `list_quotations` lấy báo giá đã gửi mà chưa có phản hồi hoặc sắp hết hạn.

# Đầu ra (dưới 15 dòng)
- **Ưu tiên số 1–3** hôm nay: khách, việc, lý do.
- **Việc trong ngày:** giờ, khách, việc.
- **Quá hạn:** số lượng và 3 việc quan trọng nhất.
- **Cơ hội nóng, báo giá chờ:** mỗi mục tối đa 3 dòng.
Cuối ngày thì thêm: việc đã xong hôm nay (`list_follow_ups` đã hoàn thành nếu có) và gợi ý việc cho ngày mai.
Có việc quá hạn đã xử lý xong thì đề nghị đánh dấu bằng `complete_follow_up`.
