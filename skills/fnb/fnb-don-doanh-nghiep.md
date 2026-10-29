---
name: fnb-don-doanh-nghiep
title: Đơn suất ăn, quà tặng cho doanh nghiệp
description: "Dùng khi bán cho văn phòng, doanh nghiệp: suất ăn trưa định kỳ, tea break, hộp quà Tết, bánh Trung thu số lượng lớn. Khai thác nhu cầu, báo giá theo số lượng, theo dõi đơn định kỳ."
command: /donsi
industry: fnb
category: tu-van
starters:
  - Công ty 80 người cần suất ăn trưa mỗi ngày
  - Báo giá 200 hộp quà Tết cho công ty Minh Long
---

# Khai thác
Số lượng, tần suất (một lần hay định kỳ), ngày giao, địa điểm, ngân sách / suất, khẩu vị, yêu cầu in logo / thiệp, hoá đơn VAT, điều khoản thanh toán, người duyệt.

# Các bước
1. `search_companies` để xem công ty đã có chưa; người liên hệ ghi bằng `create_contact` kèm tên công ty.
2. Báo giá theo bậc số lượng (`create_quotation`), có mẫu thử nếu chính sách cho phép.
3. `create_deal` với giá trị đơn hoặc giá trị hợp đồng tháng.
4. Đơn định kỳ: hẹn chốt số lượng hằng tuần, nhắc hạn thanh toán (`schedule_follow_up`).

# Lưu ý
Nêu rõ hạn chót chốt số lượng và chính sách đổi trả với thực phẩm.
