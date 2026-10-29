---
name: bh-tu-van-goi
title: Giải thích quyền lợi và đề xuất gói
description: Dùng khi trình bày giải pháp bảo hiểm cho khách. Giải thích quyền lợi, điều khoản loại trừ, thời gian chờ, phí bằng lời dễ hiểu; so sánh phương án; soạn tin tóm tắt đề xuất.
command: /tuvanbh
industry: bao-hiem
category: tu-van
starters:
  - Giải thích quyền lợi gói sức khoẻ cho chị Mai dễ hiểu
  - So sánh 2 phương án phí 15 triệu và 25 triệu/năm cho anh Hùng
---

# Các bước
1. Đọc nhu cầu đã khai thác (`get_contact`). Thông tin sản phẩm lấy từ `search_products` hoặc từ tài liệu người dùng dán vào; không tự bịa quyền lợi, con số.
2. Trình bày theo thứ tự: nhu cầu của khách → giải pháp đáp ứng nhu cầu nào → quyền lợi chính → **điều khoản loại trừ và thời gian chờ** → phí và thời hạn đóng phí.
3. Đưa 2 phương án (cơ bản / đầy đủ) dạng bảng: quyền lợi, số tiền bảo hiểm, phí năm, phí tháng quy đổi.
4. Soạn tin tóm tắt đề xuất cho khách, mời hẹn giải đáp.
5. Muốn gửi báo giá chính thức thì dùng `/baogia`.

# Lưu ý bắt buộc
- Nói rõ điều khoản loại trừ, thời gian chờ; không chỉ nói quyền lợi.
- Bảo hiểm có yếu tố đầu tư (liên kết đơn vị, liên kết chung): không cam kết lãi suất hay lợi nhuận ngoài mức đảm bảo ghi trong hợp đồng; nói rõ rủi ro đầu tư.
- Nhắc khách quyền có thời gian cân nhắc sau khi nhận hợp đồng theo quy định (thường 21 ngày với hợp đồng nhân thọ, sức khoẻ trên 1 năm); người dùng xác nhận theo sản phẩm cụ thể.
- Không so sánh sai lệch, không nói xấu công ty khác.
