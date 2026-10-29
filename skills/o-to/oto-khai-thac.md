---
name: oto-khai-thac
title: Khai thác nhu cầu mua xe
description: Dùng khi có khách hỏi mua ô tô hoặc xe máy. Hỏi mục đích, ngân sách, số chỗ, kiểu dáng, xe cũ đổi, mua trả góp, thời điểm; gợi ý dòng xe phù hợp và ghi vào CRM.
command: /nhucauxe
industry: o-to
category: khai-thac
starters:
  - Khách hỏi xe 7 chỗ tầm 1 tỷ cho gia đình
  - Anh Phong muốn đổi xe cũ lên SUV, chưa biết chọn dòng nào
---

# Câu hỏi khai thác
1. **Mục đích:** đi gia đình, chạy dịch vụ, đi công việc, đi tỉnh nhiều hay chỉ trong phố.
2. **Số chỗ, kiểu dáng:** sedan, SUV, MPV, bán tải; máy xăng, dầu, hybrid, điện.
3. **Ngân sách:** giá lăn bánh mong muốn (không phải giá niêm yết).
4. **Thanh toán:** trả thẳng hay trả góp; trả trước bao nhiêu (trả góp thì xem `/tragop`).
5. **Xe đang đi:** có đổi xe cũ không (đời, số km, tình trạng).
6. **Thời điểm** cần xe; đã xem / lái thử hãng nào chưa.
7. **Ưu tiên:** tiết kiệm xăng, an toàn, công nghệ, rộng rãi, giữ giá.

# Ghi vào CRM
`create_contact` có `first_note` theo các mục trên. Có ngân sách + thời điểm trong 3 tháng thì tier hot và đề nghị `create_deal` (giá trị = giá xe dự kiến). Hẹn lái thử bằng `/laithu`.

# Gợi ý dòng xe
Dựa trên danh mục người dùng nhập ở trang Sản phẩm (`search_products`). Chọn 2 dòng hợp nhất, nói vì sao hợp nhu cầu khách; không chê hãng khác.
