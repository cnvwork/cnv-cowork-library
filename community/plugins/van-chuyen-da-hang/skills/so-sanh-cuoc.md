---
name: so-sanh-cuoc
title: So sánh cước giao hàng nhiều hãng
description: Dùng khi người dùng muốn biết gửi đơn này qua hãng nào rẻ / nhanh hơn (GHN, GHTK, Viettel Post đã nối ở Kết nối). Gom thông tin đơn một lần, tính cước ở từng hãng (chỉ đọc), bày bảng so sánh, rồi đề xuất tạo vận đơn ở hãng người dùng chọn qua thẻ duyệt.
command: /sosanhcuoc
category: chot-don
starters:
  - So cước gửi 2 kg từ Hà Nội về Cần Thơ, thu hộ 450 nghìn
  - Đơn của chị Lan gửi hãng nào rẻ nhất?
---

# Các bước
1. Xem lời dặn có những kết nối nào trong ba hãng «GHN», «GHTK», «Viettel Post». Chưa nối hãng nào: chỉ người dùng mở Kết nối › Vận chuyển, chọn hãng rồi dán mã ở ô bảo mật (không xin mã qua chat). Chỉ so các hãng đã nối.
2. Đọc `api_docs` của từng kết nối một lần.
3. Gom thông tin đơn MỘT lần (lấy từ CRM nếu có: `search_contacts`, `list_invoices`): nơi lấy hàng, địa chỉ nhận đủ phường / xã + tỉnh, cân nặng (gram), kích thước nếu hàng to, giá trị hàng, tiền thu hộ, ai trả cước. Không tự đặt số.
4. Tính cước ở từng hãng (chỉ đọc, chạy luôn):
   - GHN: POST `/v2/shipping-order/fee` (cần mã quận / phường của GHN: tra GET `/master-data/…`).
   - GHTK: GET `/services/shipment/fee` (tên tỉnh / huyện).
   - Viettel Post: POST `/v2/order/getPriceAllNlp` (địa chỉ chữ) hoặc `/v2/order/getPriceAll` (mã địa chỉ của Viettel Post): ra mọi dịch vụ có trên tuyến kèm cước. Lỗi vẫn trả HTTP 200: đọc `error` / `message` trong thân.
   Hãng nào lỗi thì ghi rõ lỗi của hãng đó, vẫn so các hãng còn lại.
5. Bày bảng so sánh: hãng, dịch vụ, cước (VND), thời gian dự kiến nếu hãng trả, ghi chú (phí thu hộ, bảo hiểm). Nói rõ số lấy từ phản hồi của hãng lúc này, có thể đổi khi tạo đơn.
6. Người dùng chọn hãng thì soạn thẻ tạo vận đơn bằng `api_request` ở đúng kết nối đó (người dùng duyệt trên máy); mã đơn của shop = số đơn trong CRM để gửi lại không tạo trùng. Ghi `purpose` một câu: «Tạo vận đơn Viettel Post cho đơn INV-0012, thu hộ 450.000đ».
7. Thẻ chạy xong: báo mã vận đơn; đề xuất `add_note` vào khách (hãng, mã vận đơn, cước) — cũng qua thẻ. In vận đơn: GHN `/v2/a5/gen-token`, Viettel Post `/v2/order/printing-code` (chỉ đọc) rồi đưa link in cho người dùng tự mở.

# Lưu ý
- Không tạo đơn ở nhiều hãng cho cùng một gói hàng. Huỷ đơn chỉ khi người dùng nhờ rõ, qua thẻ.
- Viettel Post chưa có API tra trạng thái một đơn: trạng thái xem trên trang của hãng.
- Không gửi dữ liệu khách khác ngoài người nhận của đơn này.
