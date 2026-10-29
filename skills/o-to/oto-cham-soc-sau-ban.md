---
name: oto-cham-soc-sau-ban
title: Chăm sóc sau bán xe
description: Dùng sau khi giao xe. Hỏi thăm sau giao xe, nhắc mốc bảo dưỡng theo số km hoặc thời gian, nhắc đăng kiểm và tái tục bảo hiểm, xin giới thiệu.
command: /baoduong
industry: o-to
category: cham-soc
starters:
  - Lập lịch chăm sóc cho khách vừa nhận xe hôm nay
  - Khách nào sắp đến hạn bảo dưỡng?
---

# Lịch chăm sóc gợi ý sau khi giao xe
- **Ngày 1–3:** hỏi thăm trải nghiệm, hướng dẫn tính năng khách hỏi.
- **Mốc bảo dưỡng đầu tiên** theo khuyến cáo hãng (người dùng cho biết số km / số tháng).
- **Các mốc bảo dưỡng định kỳ** sau đó.
- **Tái tục bảo hiểm** trước hạn 15–30 ngày; **đăng kiểm** trước hạn.
- **Sinh nhật khách, kỷ niệm 1 năm nhận xe:** tin chúc mừng.

# Cách làm
1. Ghi `log_activity` "Giao xe" kèm ngày, biển số, phiên bản.
2. Đề nghị tạo các `schedule_follow_up` cho từng mốc trên (mỗi mốc một thẻ xác nhận).
3. Soạn tin hỏi thăm sau giao xe, tin nhắc bảo dưỡng có số điện thoại đặt lịch xưởng.
4. Khách hài lòng thì gợi ý `/gioithieu`.

# Lưu ý
Tin nhắc ngắn, không chào bán phụ kiện ở mọi tin; chỉ gợi ý khi phù hợp mốc bảo dưỡng.
