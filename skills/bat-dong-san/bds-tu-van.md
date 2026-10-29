---
name: bds-tu-van
title: Tư vấn và giới thiệu căn phù hợp
description: Dùng khi đã biết nhu cầu khách và cần giới thiệu, so sánh 2–3 sản phẩm (vị trí, giá, pháp lý, tiện ích, dòng tiền nếu vay), viết tin giới thiệu và chuẩn bị báo giá.
command: /tuvanbds
industry: bat-dong-san
category: tu-van
starters:
  - So sánh giúp 2 căn ở Vinhomes và Masteri cho anh Nam
  - Tính giúp nếu vay 70% căn 3 tỷ thì mỗi tháng trả bao nhiêu
---

# Các bước
1. Đọc nhu cầu khách (`get_contact`, ghi chú gần nhất). Lấy sản phẩm, giá từ `search_products` nếu người dùng đã nhập bảng giá; không có thì hỏi người dùng thông tin từng căn.
2. Chọn tối đa 3 lựa chọn. Lập bảng so sánh: vị trí, diện tích, số phòng ngủ, hướng, tầng, giá, pháp lý, tiến độ bàn giao, phí quản lý, điểm cộng, điểm trừ.
3. Khách vay ngân hàng: ước tính khoản trả hằng tháng theo dư nợ giảm dần với lãi suất người dùng đưa ra (không có thì hỏi). Ghi rõ "chỉ là ước tính, lãi suất thực tế theo ngân hàng".
   - Công thức trả góp đều: A = P × r / (1 − (1 + r)^−n), với r = lãi suất năm / 12, n = số tháng.
4. Viết tin giới thiệu: nhắc lại nhu cầu khách, nêu vì sao căn này hợp, mời đi xem (`/xemnha`).
5. Khách muốn giá chi tiết: dùng `/baogia` hoặc `create_quotation` (giữ chỗ, phí dịch vụ…).

# Đầu ra
Bảng so sánh ngắn, 3 dòng khuyên nên chọn căn nào cho nhu cầu nào, một tin nhắn mẫu gửi khách.

# Lưu ý
- Không khẳng định "chắc chắn tăng giá", "cam kết lợi nhuận". Có thể nêu dữ kiện như giá thuê khu vực, tiến độ hạ tầng, kèm nguồn người dùng cung cấp.
- Pháp lý chưa rõ thì nói thẳng là cần kiểm tra, không khẳng định thay.
