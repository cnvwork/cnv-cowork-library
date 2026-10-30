---
name: slide-gioi-thieu-san-pham
title: Slide giới thiệu sản phẩm / đề xuất cho khách
description: Dùng khi người dùng cần bộ slide giới thiệu sản phẩm, dịch vụ hoặc đề xuất giải pháp cho một khách cụ thể (gửi trước buổi gặp, trình bày khi tư vấn).
command: /slidesanpham
category: tu-van
starters:
  - Làm slide giới thiệu gói dịch vụ cho chị Lan
  - Bộ slide đề xuất giải pháp cho công ty Nam Phát
---

# Hỏi trước (chỉ phần còn thiếu)
- Khách là ai, đang cần gì: `search_contacts`, `get_contact` (ghi chú, cơ hội đang mở).
- Sản phẩm / gói nào, giá bao nhiêu: `search_products`, `search_price_list`. Không có giá thì hỏi, không đoán.
- Ảnh sản phẩm: ảnh người dùng gửi kèm, ảnh trong thư mục làm việc, hoặc đề nghị tạo bằng `generate_image` trước.

# Dàn ý gợi ý (7–10 slide)
1. `title`: tên giải pháp + «Dành cho <tên khách>» + ảnh sản phẩm.
2. `bullets`: hiểu nhu cầu của khách (3–4 ý lấy từ ghi chú CRM).
3. `bullets` có ảnh: sản phẩm / dịch vụ đề xuất và 3 lợi ích chính.
4. `two_columns`: gói cơ bản và gói nâng cao, hoặc trước / sau khi dùng.
5. `stats`: con số thật về hiệu quả, kinh nghiệm, số khách đã phục vụ (lấy từ Hồ sơ kinh doanh).
6. `table`: bảng giá / các hạng mục (giá thật từ bảng giá).
7. `quote`: lời khách cũ nếu người dùng cung cấp.
8. `timeline`: các bước triển khai.
9. `closing`: lời mời hành động + liên hệ.

# Cách làm
Ghi chú người nói cho từng slide. Gọi `create_presentation` với `pdf: true` để có bản gửi khách qua Zalo / email. Sau buổi gặp, gợi ý `log_activity` và `schedule_follow_up`.
