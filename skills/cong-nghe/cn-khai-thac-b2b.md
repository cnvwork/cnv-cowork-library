---
name: cn-khai-thac-b2b
title: Khai thác nhu cầu khách doanh nghiệp
description: Dùng khi có doanh nghiệp quan tâm phần mềm, giải pháp, dịch vụ IT. Hỏi vấn đề, quy mô, quy trình mua, người quyết định, ngân sách, thời điểm (kiểu BANT); ghi công ty, người liên hệ, cơ hội vào CRM.
command: /nhucaub2b
industry: cong-nghe
category: khai-thac
starters:
  - Công ty bán lẻ 20 cửa hàng hỏi phần mềm quản lý bán hàng
  - Chuẩn bị câu hỏi cho buổi gặp đầu với công ty Hưng Thịnh
---

# Câu hỏi khai thác
1. **Vấn đề:** đang gặp khó khăn gì, ảnh hưởng thế nào (thời gian, tiền, khách hàng), đang làm bằng gì (Excel, phần mềm khác).
2. **Quy mô:** số nhân viên dùng, số chi nhánh, khối lượng dữ liệu.
3. **Người quyết định và quy trình mua:** ai dùng, ai duyệt ngân sách, cần qua bước nào (báo giá, demo, thử, hợp đồng).
4. **Ngân sách:** đã có ngân sách chưa, khoảng bao nhiêu, trả theo tháng hay mua đứt.
5. **Thời điểm:** cần triển khai khi nào, có hạn chót gì.
6. **Tiêu chí chọn:** tích hợp, bảo mật, hỗ trợ, giá.

# Ghi vào CRM
`search_companies` → người liên hệ bằng `create_contact` với `company_name`, chức vụ; `first_note` theo 6 mục; `create_deal` (giá trị theo năm hợp đồng dự kiến). Hẹn demo (`/demo`).
