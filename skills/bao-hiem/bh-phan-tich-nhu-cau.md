---
name: bh-phan-tich-nhu-cau
title: Phân tích nhu cầu bảo vệ
description: Dùng khi gặp khách tiềm năng bảo hiểm nhân thọ, sức khoẻ. Hỏi về gia đình, thu nhập, chi tiêu, khoản vay, bảo hiểm đang có; tính khoảng thiếu hụt bảo vệ và ghi hồ sơ khách vào CRM.
command: /nhucaubh
industry: bao-hiem
category: khai-thac
starters:
  - Anh Hùng 35 tuổi, 2 con nhỏ, đang vay mua nhà, cần tư vấn
  - Lập bảng phân tích nhu cầu cho chị Mai
---

# Câu hỏi khai thác (giọng quan tâm, không ép)
1. **Gia đình:** tuổi, tình trạng hôn nhân, số con và tuổi các con, có phụng dưỡng bố mẹ không.
2. **Thu nhập và chi tiêu:** thu nhập hằng tháng của khách và gia đình, chi tiêu cố định.
3. **Khoản vay:** nhà, xe, kinh doanh; còn bao nhiêu, bao lâu.
4. **Mục tiêu:** quỹ học vấn cho con, quỹ hưu trí, bảo vệ thu nhập, chi phí y tế.
5. **Đang có gì:** bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm công ty, hợp đồng bảo hiểm khác.
6. **Sức khoẻ:** bệnh đang điều trị (để biết cần kê khai, không để tư vấn y khoa).
7. **Ngân sách** có thể dành mỗi tháng / năm.

# Tính khoảng thiếu hụt (ước tính để trao đổi)
- Nhu cầu bảo vệ thu nhập ≈ chi tiêu năm của gia đình × số năm cần bảo vệ (thường đến khi con tự lập) + dư nợ vay.
- Trừ đi quyền lợi đã có → khoảng thiếu hụt.
- Phí bảo hiểm gợi ý thường trong khoảng 10–15% thu nhập năm; để khách tự quyết.
Trình bày dạng bảng, ghi rõ đây là ước tính để trao đổi.

# Ghi vào CRM
`create_contact` hoặc `update_contact` với nhu cầu chính; `add_note` ghi bảng tóm tắt (không ghi chi tiết bệnh án nhạy cảm nếu khách không đồng ý); `create_deal` với giá trị = phí năm dự kiến; hẹn buổi trình bày giải pháp (`schedule_follow_up`).

# Lưu ý
Thông tin sức khoẻ và tài chính là riêng tư: chỉ ghi điều cần cho tư vấn, hỏi ý khách trước khi lưu.
