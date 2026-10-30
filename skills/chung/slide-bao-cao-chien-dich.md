---
name: slide-bao-cao-chien-dich
title: Bộ slide báo cáo chiến dịch
description: Dùng khi người dùng cần bộ slide PowerPoint báo cáo kết quả một chiến dịch marketing / bán hàng (tháng, quý, đợt khuyến mãi) cho sếp, đối tác hoặc khách.
command: /baocaoslide
category: noi-dung
starters:
  - Làm bộ slide báo cáo chiến dịch tháng 10
  - Slide tổng kết đợt sale 11/11 cho sếp
---

# Hỏi trước (chỉ phần còn thiếu)
- Báo cáo cho ai (sếp, đối tác, khách), giai đoạn nào, chiến dịch nào.
- Số liệu: doanh thu, chi phí quảng cáo, số đơn, khách mới, CTR / CPC nếu có. Lấy từ `crm_summary`, `list_deals`, `list_invoices`, tệp báo cáo trong thư mục làm việc (`workspace_read`). Thiếu số nào thì hỏi, KHÔNG bịa.
- Có ảnh sản phẩm / ảnh chiến dịch không (ảnh gửi kèm, ảnh vừa tạo bằng `generate_image`, ảnh trong thư mục).

# Dàn ý gợi ý (8–12 slide)
1. `title`: tên chiến dịch + giai đoạn + tên shop, ảnh nền nếu có.
2. `stats`: 3–4 con số nổi bật (doanh thu, tăng trưởng %, khách mới, chi phí / đơn).
3. `chart` cột: doanh thu hoặc đơn theo tuần / tháng; `chart` tròn: nguồn khách theo kênh.
4. `table`: hiệu quả từng kênh (chi phí, đơn, chi phí / đơn).
5. `two_columns`: trước / sau, hoặc làm tốt / chưa tốt.
6. `bullets`: bài học rút ra (3–5 ý ngắn).
7. `quote`: một lời khách thật nếu người dùng có.
8. `timeline`: kế hoạch giai đoạn tới (3–5 bước).
9. `closing`: cảm ơn + liên hệ.

# Cách làm
- Mỗi slide một ý, gạch đầu dòng dưới 15 chữ, **đậm** chỗ quan trọng. Ghi chú người nói (`notes`) cho mọi slide nội dung: câu nói mở, số cần nhấn, câu chuyển.
- Đọc dàn ý cho người dùng duyệt nhanh trước, rồi gọi `create_presentation` (màu, logo theo Nhận diện thương hiệu). Cần gửi khách thì thêm `pdf: true`.
- Sau khi tạo, nhắc người dùng mở tệp kiểm lại số liệu trước khi trình bày.
