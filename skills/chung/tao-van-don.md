---
name: tao-van-don
title: Tạo vận đơn GHN / GHTK
description: Dùng khi người dùng muốn gửi hàng cho khách qua Giao Hàng Nhanh hoặc Giao Hàng Tiết Kiệm (kết nối API tuỳ chỉnh). Gom đủ thông tin người nhận, cân nặng, tiền thu hộ, tính phí trước, rồi soạn thẻ tạo vận đơn để người dùng duyệt; tra trạng thái và lấy link in nhãn.
command: /vandon
category: chot-don
starters:
  - Tạo vận đơn GHN cho đơn của chị Lan, thu hộ 450 nghìn
  - Đơn GHTK mã S1234.567 đang ở đâu rồi?
---

# Các bước
1. Xem lời dặn có kết nối «GHN» hoặc «GHTK». Chưa có: dặn người dùng chọn mẫu ở Kết nối › API tuỳ chỉnh › «Mẫu dịch vụ Việt Nam» (GHN cần ShopId, GHTK cần mã shop) và dán Token ở ô bảo mật.
2. Đọc `api_docs` của kết nối một lần.
3. Gom thông tin. Lấy từ CRM nếu có: `search_contacts` (tên, số điện thoại, địa chỉ của khách), `list_invoices` (đơn, số còn phải trả để làm tiền thu hộ). Hỏi những gì còn thiếu: địa chỉ đủ phường / xã + tỉnh, cân nặng, kích thước nếu lớn, tiền thu hộ (COD), ai trả phí ship, có cho xem hàng không. Không tự đặt số.
4. Tính phí trước (chỉ đọc, chạy luôn):
   - GHN: POST `/v2/shipping-order/fee` (cân gram); cần mã quận / phường thì tra GET `/master-data/…` hoặc `/v3/master-data/…`.
   - GHTK: GET `/services/shipment/fee` (tên tỉnh / huyện, cân gram).
   Báo phí cho người dùng.
5. Soạn thẻ tạo vận đơn bằng `api_request` (POST, người dùng duyệt trên máy):
   - GHN: POST `/v2/shipping-order/create` với `to_name`, `to_phone`, `to_address`, `to_ward_name`, `to_district_name`, `to_province_name`, `weight`, `service_type_id`, `payment_type_id` (1 shop trả, 2 người nhận trả), `required_note`, `cod_amount`, `client_order_code` = số đơn trong CRM (gửi lại không tạo trùng), `content` hoặc `items`.
   - GHTK: POST `/services/shipment/order` với `products` (tên, cân kg) và `order` (`id` = số đơn trong CRM, thông tin lấy hàng, người nhận, `pick_money` = tiền thu hộ, `value`).
   Ghi `purpose` một câu: «Tạo vận đơn GHN cho đơn INV-0012, thu hộ 450.000đ».
6. Thẻ chạy xong: đọc mã vận đơn trong phản hồi, báo người dùng; đề xuất `add_note` vào khách (mã vận đơn, phí, ngày gửi) — cũng qua thẻ.
7. Tra trạng thái: GHN GET `/v2/shipping-order/detail?order_code=…`; GHTK GET `/services/shipment/v2/{mã}`. In nhãn GHN: POST `/v2/a5/gen-token` (chỉ đọc) rồi đưa link `https://online-gateway.ghn.vn/a5/public-api/printA5?token=…` cho người dùng tự mở.

# Lưu ý
- Huỷ vận đơn (GHN `/v2/switch-status/cancel`, GHTK `/services/shipment/cancel/…`) chỉ khi người dùng nhờ rõ, qua thẻ.
- GHTK nhiều lỗi trả HTTP 200 kèm `"success": false`: đọc thân trước khi báo đã tạo.
- Không gửi dữ liệu khách khác ngoài người nhận của đơn này.
