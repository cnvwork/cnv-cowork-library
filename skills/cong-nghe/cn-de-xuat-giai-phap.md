---
name: cn-de-xuat-giai-phap
title: Soạn đề xuất giải pháp và báo giá
description: "Dùng khi soạn đề xuất cho doanh nghiệp: tóm tắt vấn đề, giải pháp, phạm vi, lộ trình triển khai, chi phí theo hạng mục, điều khoản; tạo báo giá trong CRM."
command: /dexuat
industry: cong-nghe
category: tu-van
starters:
  - Soạn đề xuất phần mềm quản lý bán hàng cho chuỗi 20 cửa hàng
  - Báo giá gói 50 người dùng, triển khai và đào tạo
---

# Cấu trúc đề xuất
1. **Tóm tắt cho người duyệt:** vấn đề, giải pháp, lợi ích chính, tổng chi phí — nửa trang.
2. **Hiện trạng và vấn đề** (dùng chính lời khách trong ghi chú).
3. **Giải pháp:** module / dịch vụ, đáp ứng từng vấn đề ra sao.
4. **Phạm vi:** gồm gì, không gồm gì.
5. **Lộ trình triển khai:** giai đoạn, thời gian, trách nhiệm hai bên.
6. **Chi phí:** bản quyền / thuê bao theo người dùng hoặc gói, triển khai, đào tạo, tuỳ chỉnh, hỗ trợ năm.
7. **Điều khoản:** thanh toán, cam kết dịch vụ, bảo mật dữ liệu.

# Các bước
Giá lấy từ `search_products`; tạo `create_quotation` (mỗi hạng mục một dòng); soạn email / tin gửi kèm; hẹn buổi giải đáp với người duyệt.
