---
name: pp-nhan-don-si
title: Nhận đơn sỉ
description: Dùng khi khách sỉ, đại lý đặt hàng. Xác nhận mã hàng, số lượng, chiết khấu theo bậc, khuyến mãi, ngày giao, điều kiện thanh toán; lập đơn hoặc báo giá và hẹn giao.
command: /donhang
industry: phan-phoi
category: chot-don
starters:
  - "Đại lý Hoàng Long đặt: 50 thùng nước suối 500ml, 20 thùng 1,5L"
  - Lên đơn cho cửa hàng Minh Phát như tháng trước
---

# Các bước
1. Xác định khách (`search_contacts` / `search_companies`). "Như tháng trước": đọc báo giá / đơn gần nhất bằng `list_quotations`.
2. Từng dòng: mã hàng, tên, quy cách, số lượng, đơn giá sỉ từ `search_products`, chiết khấu theo bậc số lượng theo chính sách người dùng.
3. Khuyến mãi đi kèm (tặng hàng, chiết khấu thêm) chỉ áp dụng khi chính sách có.
4. Đọc lại tóm tắt đơn: tổng tiền, ngày giao, nơi giao, thanh toán (tiền mặt khi giao, chuyển khoản, công nợ X ngày).
5. Tạo `create_quotation` làm phiếu đơn hàng; hẹn giao (`schedule_follow_up`); đơn có công nợ thì hẹn ngày thu (`/congno`).
