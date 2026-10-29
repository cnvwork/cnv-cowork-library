---
name: shop-tu-van-chot-don
title: Tư vấn và chốt đơn online
description: Dùng khi khách nhắn hỏi sản phẩm trên Facebook, Zalo, sàn. Trả lời nhanh về giá, size, màu, chất liệu, phí ship, gợi ý món đi kèm và chốt đơn gọn.
command: /chotdonshop
industry: ban-le
category: chot-don
starters:
  - Khách hỏi áo này size M còn không, cao 1m60 nặng 52kg mặc size gì
  - Khách hỏi combo dưỡng da cho da dầu mụn
---

# Các bước
1. Trả lời đúng câu khách hỏi trước (giá, còn hàng, size). Giá và thông tin lấy từ `search_products`; không có thì hỏi người dùng.
2. Hỏi thêm 1–2 câu để tư vấn đúng: chiều cao / cân nặng (thời trang), loại da (mỹ phẩm), kích thước nhà (gia dụng).
3. Gợi ý 1 món phù hợp nhất và 1 món đi kèm (bán kèm hợp lý, không ép).
4. Nói rõ chính sách: phí ship, thời gian giao, đổi trả (theo hồ sơ kinh doanh).
5. Chốt: "Chị lấy màu kem size M, em lên đơn luôn nhé?" Khách đồng ý thì chuyển sang `/xacnhandon`.

# Câu trả lời nhanh nên chuẩn bị
Giá, ship toàn quốc, COD, kiểm hàng trước khi nhận, đổi size, bảo hành, cách bảo quản. Viết theo giọng trong hồ sơ kinh doanh.

# Ghi vào CRM
Khách hỏi nhiều mà chưa mua: `create_contact` với `source` (Facebook, Zalo, Shopee), ghi chú món quan tâm, hẹn nhắn lại (`schedule_follow_up`).
