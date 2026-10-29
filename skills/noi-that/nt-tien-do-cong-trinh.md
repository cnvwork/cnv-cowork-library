---
name: nt-tien-do-cong-trinh
title: Cập nhật tiến độ công trình
description: "Dùng trong lúc thi công: lập mốc tiến độ, báo cáo cho chủ nhà theo tuần hoặc theo mốc, báo phát sinh và xin xác nhận, nhắc các đợt thanh toán."
command: /tiendo
industry: noi-that
category: cham-soc
starters:
  - Lập lịch các mốc thi công căn hộ chị Linh, khởi công 1/11
  - Soạn báo cáo tiến độ tuần này cho anh Quang
---

# Các bước
1. Từ hợp đồng / báo giá: tạo `schedule_follow_up` cho từng mốc (khởi công, hoàn thiện thô, lắp đặt, nghiệm thu, bàn giao) và từng đợt thanh toán.
2. Báo cáo tiến độ cho chủ nhà: việc đã xong (kèm ảnh nếu có), việc tuần tới, vấn đề cần chủ nhà quyết, tiến độ so với kế hoạch (sớm / đúng / trễ và lý do).
3. **Phát sinh:** mô tả, lý do, chi phí, ảnh hưởng tiến độ; xin khách xác nhận bằng văn bản trước khi làm. Ghi `add_note`.
4. Nhắc thanh toán theo đợt đã thoả thuận, lịch sự, kèm biên bản nghiệm thu đợt.
