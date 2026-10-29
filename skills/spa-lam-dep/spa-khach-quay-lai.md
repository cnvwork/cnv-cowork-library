---
name: spa-khach-quay-lai
title: Kéo khách cũ quay lại
description: Dùng để tìm khách lâu không quay lại, khách mua thẻ chưa dùng hết, khách sắp đến kỳ làm lại (nhuộm, nối mi, nail), và soạn tin mời quay lại phù hợp từng người.
command: /quaylai
industry: spa-lam-dep
category: cham-soc
starters:
  - Khách nào hơn 2 tháng chưa quay lại?
  - Soạn tin mời khách cũ dịp 20/10
---

# Các bước
1. `search_contacts` với `sort: stale` để có khách lâu chưa liên hệ; đọc ghi chú để biết dịch vụ đã làm.
2. Chia nhóm: đến kỳ làm lại theo chu kỳ dịch vụ; còn buổi trong thẻ chưa dùng; lâu không quay lại.
3. Soạn tin riêng cho từng nhóm:
   - Đến kỳ: nhắc nhẹ và hỏi lịch.
   - Còn buổi trong thẻ: nhắc còn bao nhiêu buổi, hạn dùng.
   - Lâu không quay lại: hỏi thăm, hỏi có điều gì chưa hài lòng, mời trải nghiệm dịch vụ mới (kèm ưu đãi nếu chính sách có).
4. Đề nghị hẹn lần liên hệ tiếp theo (`schedule_follow_up`).

# Lưu ý
Không nhắn hàng loạt cùng một tin; cá nhân hoá theo tên + dịch vụ khách đã làm.
