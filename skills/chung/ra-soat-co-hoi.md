---
name: ra-soat-co-hoi
title: Rà soát cơ hội bán hàng
description: "Dùng khi người dùng muốn xem lại pipeline: cơ hội nào sắp chốt, cơ hội nào đứng yên lâu, báo giá nào sắp hết hạn, việc nhắc nào quá hạn; rồi đề xuất việc cần làm ngay."
command: /rasoat
category: quan-ly
starters:
  - Rà soát cơ hội tuần này giúp
  - Có cơ hội nào đang bị bỏ quên không?
---

# Các bước
1. Lấy dữ liệu: `list_deals` (giá trị, bước, ngày dự kiến chốt), `list_quotations` (đã gửi, sắp hết hạn), `list_follow_ups` (quá hạn, hôm nay), `crm_summary`.
2. Chia nhóm:
   - **Sắp chốt:** bước Thương lượng / Đề xuất, hoặc ngày dự kiến trong 14 ngày tới.
   - **Đứng yên:** không có hoạt động hơn 14 ngày.
   - **Báo giá chờ phản hồi:** đã gửi, chưa chốt, hoặc sắp hết hạn trong 3 ngày.
   - **Việc quá hạn.**
3. Chọn **5 việc nên làm ngay**, ưu tiên theo giá trị × khả năng chốt. Mỗi việc ghi: khách, lý do, hành động cụ thể (gọi, gửi tin, cập nhật báo giá).
4. Đề nghị tạo thẻ: `schedule_follow_up` cho từng việc, `move_deal_stage` cho cơ hội đã đổi trạng thái thật (hỏi người dùng trước).

# Đầu ra
Ngắn gọn: tổng giá trị đang mở; ba nhóm trên, mỗi nhóm tối đa 5 dòng; 5 việc ưu tiên. Không liệt kê toàn bộ CRM.
