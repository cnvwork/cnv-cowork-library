---
name: tc-khai-thac-vay
title: Khai thác nhu cầu vay
description: Dùng khi khách hỏi vay (tín chấp, thế chấp, mua nhà, mua xe, kinh doanh). Hỏi mục đích, số tiền, thời hạn, thu nhập, tài sản bảo đảm, lịch sử tín dụng; gợi ý sản phẩm phù hợp và ghi vào CRM.
command: /nhucauvay
industry: tai-chinh
category: khai-thac
starters:
  - Khách cần vay 500 triệu kinh doanh, có sổ đỏ
  - Chị Hằng hỏi vay tín chấp theo lương 
---

# Câu hỏi khai thác
1. Mục đích vay, số tiền cần, thời hạn mong muốn, khả năng trả mỗi tháng.
2. Thu nhập: nguồn (lương, kinh doanh, cho thuê), mức thu nhập, hình thức nhận (chuyển khoản / tiền mặt).
3. Tài sản bảo đảm (nếu có): loại, đứng tên ai, giá trị ước tính.
4. Khoản vay đang có, lịch sử trả nợ (khách tự khai; nhắc rằng ngân hàng sẽ tra cứu thông tin tín dụng).
5. Khi nào cần giải ngân.

# Tư vấn
Gợi ý sản phẩm phù hợp từ danh mục (`search_products`), ước tính trả hằng tháng theo lãi suất người dùng đưa (công thức trả góp đều A = P × r / (1 − (1 + r)^−n)), nêu điều kiện cơ bản. Hẹn nhận hồ sơ (`/hosovay`).

# Ghi vào CRM
`create_contact` + `first_note` (không ghi số CCCD hay số tài khoản vào ghi chú), `create_deal` (giá trị = số tiền vay).

# Lưu ý bắt buộc
Không hứa chắc duyệt vay, không hứa hạn mức hay lãi suất ngoài chính sách hiện hành. Không hướng dẫn làm đẹp hồ sơ sai sự thật.
