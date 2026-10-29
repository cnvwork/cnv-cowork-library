---
name: nt-bao-hanh
title: Bảo hành, bảo trì sau bàn giao
description: "Dùng sau khi bàn giao công trình: tiếp nhận yêu cầu bảo hành, hẹn thợ, nhắc bảo trì định kỳ, hỏi thăm sau vài tháng, xin giới thiệu."
command: /baohanh
industry: noi-that
category: cham-soc
starters:
  - Khách báo cánh tủ bếp bị lệch, xử lý bảo hành
  - Lập lịch hỏi thăm khách sau bàn giao 3 tháng
---

# Tiếp nhận bảo hành
1. Hỏi rõ hạng mục, hiện tượng, ảnh / video, thời điểm phát sinh.
2. Kiểm tra còn trong hạn bảo hành không (ngày bàn giao trong ghi chú khách).
3. Hẹn ngày thợ đến (`schedule_follow_up`), tin xác nhận cho khách; sau khi xử lý thì `log_activity`.

# Chăm sóc sau bàn giao
Hỏi thăm sau 1 tháng, 3 tháng, 1 năm; nhắc bảo trì (bản lề, ray kéo, keo, sơn) nếu phù hợp. Khách hài lòng thì xin ảnh công trình và `/gioithieu`.
