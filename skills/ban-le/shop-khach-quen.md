---
name: shop-khach-quen
title: Chăm sóc khách quen, mua lại
description: "Dùng để kéo khách cũ mua lại: hỏi thăm sau khi dùng sản phẩm, nhắc khi sắp hết hàng theo chu kỳ, ưu đãi sinh nhật, báo hàng mới hợp gu khách."
command: /khachquen
industry: ban-le
category: cham-soc
starters:
  - Khách nào mua kem chống nắng hơn 1 tháng rồi, nhắc mua lại
  - Soạn tin báo hàng mới cho khách quen thích váy công sở
---

# Các tình huống
- **3–7 ngày sau khi nhận hàng:** hỏi khách dùng có ổn không, hướng dẫn dùng đúng cách. Xin đánh giá khi khách hài lòng.
- **Gần hết chu kỳ dùng** (mỹ phẩm, thực phẩm, đồ tiêu hao): nhắc mua lại trước khi khách hết.
- **Hàng mới hợp gu:** chỉ gửi cho khách đã từng mua hoặc hỏi món tương tự.
- **Sinh nhật, dịp lễ:** lời chúc + ưu đãi nếu chính sách có.

# Cách làm
1. Tìm khách bằng `search_contacts` (tag, ghi chú món đã mua, `sort: stale` cho khách lâu chưa mua).
2. Soạn tin riêng cho từng khách hoặc mẫu chung có chỗ điền tên + món đã mua.
3. Đề nghị gắn tag khách ("khách quen", "mua lại") bằng `update_contact` và hẹn lần chăm sóc sau.

# Lưu ý
Không nhắn quá dày (tối đa 2–3 tin mỗi tháng mỗi khách). Khách bảo không muốn nhận tin thì ghi chú và dừng.
