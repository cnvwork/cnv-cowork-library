---
name: nt-khao-sat-nhu-cau
title: Khai thác nhu cầu và hẹn khảo sát
description: Dùng khi khách hỏi thiết kế, thi công nội thất, sửa nhà, xây mới. Hỏi hiện trạng, diện tích, phong cách, ngân sách, thời gian; hẹn khảo sát công trình và ghi vào CRM.
command: /khaosat
industry: noi-that
category: khai-thac
starters:
  - Khách cần làm nội thất căn hộ 70m2, phong cách hiện đại
  - Anh Quang muốn sửa lại nhà phố 3 tầng
---

# Câu hỏi khai thác
1. Loại công trình (căn hộ, nhà phố, văn phòng, quán), địa chỉ, diện tích, số phòng; nhà mới bàn giao hay cải tạo.
2. Hạng mục: thiết kế, thi công trọn gói, hay chỉ đồ rời (tủ bếp, tủ áo, sofa).
3. Phong cách, màu sắc yêu thích; có ảnh mẫu không (xin khách gửi).
4. Ngân sách tổng, có thể chia giai đoạn không.
5. Thời gian mong muốn hoàn thành, ngày vào ở.
6. Người quyết định (vợ chồng, bố mẹ).

# Các bước
1. `create_contact` với `first_note` theo các mục trên; `create_deal` (giá trị = ngân sách dự kiến).
2. Hẹn khảo sát đo đạc: `schedule_follow_up` loại meeting; tin xác nhận nhắc khách chuẩn bị bản vẽ hiện trạng / bản vẽ căn hộ nếu có.
3. Sau khảo sát: `log_activity` ghi kích thước, hiện trạng, yêu cầu; hẹn ngày gửi phương án và báo giá (`/baogiatc`).
