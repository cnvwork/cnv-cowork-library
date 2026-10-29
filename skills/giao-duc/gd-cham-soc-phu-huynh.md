---
name: gd-cham-soc-phu-huynh
title: Báo cáo tiến độ, chăm sóc phụ huynh
description: Dùng khi cần gửi nhận xét định kỳ, báo vắng học, báo kết quả kiểm tra, hoặc giải đáp thắc mắc của phụ huynh và học viên trong khoá học.
command: /phuhuynh
industry: giao-duc
category: cham-soc
starters:
  - Soạn nhận xét tháng 10 cho phụ huynh bé Minh
  - Bé Lan nghỉ 2 buổi liền, nhắn phụ huynh thế nào?
---

# Các loại tin
- **Nhận xét định kỳ:** điều con đã làm tốt (cụ thể) → điểm cần cải thiện → việc phụ huynh có thể hỗ trợ ở nhà → mục tiêu tháng sau.
- **Báo vắng:** hỏi thăm lý do trước, nhắc bài cần bù, đề xuất buổi học bù.
- **Kết quả kiểm tra:** điểm, so với lần trước, kế hoạch tiếp theo.
- **Thắc mắc, phàn nàn:** nghe hết, cảm ơn góp ý, hẹn giáo viên trao đổi; ghi lại để xử lý.

# Cách làm
Đọc ghi chú học viên (`get_contact`), soạn tin, ghi `log_activity` sau khi gửi; vấn đề cần xử lý thì `schedule_follow_up`.
