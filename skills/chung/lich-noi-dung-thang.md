---
name: lich-noi-dung-thang
title: Lịch nội dung tháng (Excel)
description: Dùng khi người dùng cần lịch đăng bài cả tháng dạng bảng Excel để theo dõi (ngày, kênh, chủ đề, dạng nội dung, trạng thái, người làm).
command: /lichnoidung
category: noi-dung
starters:
  - Lập lịch nội dung tháng 11 ra file Excel
  - Lịch đăng bài Facebook, TikTok tháng 12 cho shop
---

# Hỏi trước (chỉ phần còn thiếu)
Tháng nào, kênh nào (Facebook, Zalo OA, TikTok, Instagram…), mỗi tuần mấy bài, sản phẩm / khuyến mãi cần đẩy (`search_products`), ngày lễ hay sự kiện của shop.

# Chia nội dung
40% giá trị (mẹo, kiến thức), 30% câu chuyện (khách thật, hậu trường), 20% sản phẩm / ưu đãi, 10% tương tác (hỏi đáp, mini game). Bám ngày lễ Việt Nam và mùa vụ trong tháng.

# Tạo tệp
Gọi `create_spreadsheet` với hai sheet:
1. «Lịch đăng»: cột Ngày (`date`), Thứ, Kênh (`options` các kênh), Chủ đề, Dạng (`options`: Bài viết, Ảnh, Video ngắn, Livestream, Tin OA), Câu mở gợi ý, Lời kêu gọi, Trạng thái (`options`: Ý tưởng, Đang làm, Chờ duyệt, Đã đăng), Người làm.
2. «Tổng hợp»: số bài theo kênh và theo trạng thái bằng `=COUNTIF('Lịch đăng'!C:C,"Facebook")`…

Tiêu đề sheet ghi tháng + tên shop. Sau khi tạo, gợi ý gõ `/vietbai` kèm một dòng trong lịch để viết bài đó.
