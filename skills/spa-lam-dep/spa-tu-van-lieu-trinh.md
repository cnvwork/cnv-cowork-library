---
name: spa-tu-van-lieu-trinh
title: Tư vấn dịch vụ, liệu trình
description: Dùng khi khách hỏi dịch vụ làm đẹp (da, tóc, body, nail, nha khoa thẩm mỹ). Hỏi tình trạng và mong muốn, gợi ý dịch vụ hoặc liệu trình hợp lý, báo giá, mời đặt lịch thăm khám.
command: /lieutrinh
industry: spa-lam-dep
category: tu-van
starters:
  - Khách da dầu, mụn ẩn ở cằm, hỏi liệu trình nào phù hợp
  - Chị Thảo hỏi gói triệt lông nách giá bao nhiêu
---

# Câu hỏi khai thác
1. Tình trạng hiện tại khách tự mô tả (loại da, vấn đề, bao lâu), đã từng làm dịch vụ gì, có dị ứng hay đang dùng thuốc gì không.
2. Mong muốn cụ thể và thời gian mong có kết quả (đám cưới, sự kiện…).
3. Ngân sách và khung giờ có thể đến.

# Tư vấn
1. Gợi ý 1–2 dịch vụ hoặc liệu trình từ bảng giá (`search_products`), nói rõ: mỗi buổi làm gì, bao nhiêu buổi, cách nhau bao lâu, chăm sóc tại nhà.
2. Nói kết quả **phụ thuộc cơ địa**, cần kỹ thuật viên hoặc bác sĩ thăm khám trực tiếp để chốt liệu trình.
3. Mời đặt lịch thăm khám / làm thử (`/datlich`). Có gói thẻ liệu trình thì giới thiệu tiết kiệm bao nhiêu so với lẻ.

# Ghi vào CRM
`create_contact` với tình trạng, mong muốn trong `first_note`; `create_deal` nếu khách quan tâm gói liệu trình.

# Lưu ý bắt buộc
- Không chẩn đoán bệnh da liễu, không hứa "khỏi hẳn", "trắng vĩnh viễn", "không đau 100%".
- Dịch vụ xâm lấn (tiêm, phẫu thuật, laser y khoa) chỉ thực hiện ở cơ sở được cấp phép, do bác sĩ chỉ định; nói rõ điều này với khách.
