---
name: fnb-dat-ban-tiec
title: Nhận đặt bàn, đặt tiệc
description: Dùng khi khách đặt bàn, đặt tiệc sinh nhật, liên hoan công ty, sự kiện. Hỏi đủ số khách, ngày giờ, thực đơn, ngân sách, yêu cầu đặc biệt; báo giá, nhận cọc, xác nhận.
command: /datban
industry: fnb
category: tu-van
starters:
  - Công ty đặt tiệc tất niên 40 người, ngân sách 300 nghìn/người
  - Khách đặt bàn 6 người tối thứ Sáu, có 2 bé
---

# Hỏi đủ
Ngày giờ, số khách (người lớn, trẻ em), loại tiệc, ngân sách / người, thực đơn mong muốn, đồ uống, trang trí, âm thanh, dị ứng / ăn chay, xuất hoá đơn VAT, người liên hệ.

# Các bước
1. Gợi ý thực đơn hoặc set phù hợp ngân sách từ `search_products`.
2. Báo giá bằng `create_quotation` (món / set × số khách, đồ uống, phí phục vụ, VAT nếu có); nêu chính sách cọc, huỷ, phụ thu.
3. Tin xác nhận: thời gian, số khách, thực đơn, số tiền cọc và hạn cọc, ghi chú đặc biệt.
4. `schedule_follow_up`: nhắc cọc, chốt số khách trước 1–2 ngày, ngày tiệc.
5. Tiệc công ty: ghi công ty bằng `search_companies` / `create_contact` kèm tên công ty, để lần sau chăm sóc.

# Lưu ý
Hỏi kỹ dị ứng thực phẩm; ghi rõ trong ghi chú cho bếp.
