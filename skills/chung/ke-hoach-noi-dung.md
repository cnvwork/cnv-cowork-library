---
name: ke-hoach-noi-dung
title: Kế hoạch nội dung tuần
description: Dùng khi người dùng muốn lên lịch đăng bài cho tuần, tháng hoặc một đợt chiến dịch trên Facebook, Zalo, TikTok dựa trên hồ sơ kinh doanh, sản phẩm và mùa vụ. Chọn ý lớn của đợt, chia trụ nội dung, kiểm trùng với bài đã đăng / đã hẹn, ra bảng có cột duyệt, rồi đưa bài đã duyệt vào Lịch đăng bài qua thẻ.
command: /kehoach
category: noi-dung
starters:
  - Lên kế hoạch đăng bài tuần này
  - Kế hoạch nội dung tháng 11 cho shop
  - Lên ý lớn và lịch bài cho đợt sale cuối năm
---

# Hỏi trước (chỉ phần còn thiếu)
Đăng ở những kênh nào, mỗi tuần mấy bài, khoảng thời gian, mục tiêu của đợt (nhiều người biết, nhiều người hỏi, bán, khách cũ quay lại), sản phẩm muốn đẩy (`search_products`), khuyến mãi hay sự kiện sắp tới, ai duyệt bài.

# 1. Ý lớn của đợt
Với kế hoạch tháng hoặc một đợt chiến dịch (kế hoạch một tuần lẻ thì bỏ qua bước này). Đề xuất 3 ý lớn, mỗi ý gồm:
- Tên ngắn, dễ nhớ.
- Điều khách đang nghĩ hay lo, lấy từ câu hỏi thật của khách (`/tuinbox`) hoặc hồ sơ kinh doanh, không đoán.
- Góc nói xuyên suốt đợt.
- Vì sao hợp lúc này (mùa, dịp, sản phẩm mới).
Ghi ý nào nên chọn và vì sao. Người dùng chọn xong mới chia bài; mọi bài trong đợt phải phục vụ ý lớn đó.

# 2. Trụ nội dung
Chọn 3–5 trụ, mỗi trụ ghi mục đích và tỉ trọng. Mặc định cho shop nhỏ (đổi theo mục tiêu đợt):
- 40% **giá trị**: mẹo, kiến thức, giải đáp thắc mắc thường gặp.
- 30% **câu chuyện**: khách thật đã đồng ý, hậu trường, chuyện của người bán.
- 20% **sản phẩm, ưu đãi**.
- 10% **tương tác**: câu hỏi, bình chọn, mini game.
Bám ngày lễ Việt Nam và mùa vụ trong khoảng kế hoạch. Đổi dạng bài cho đều (bài viết, ảnh, video ngắn, live), đừng cùng một dạng cả tuần.

# 3. Kiểm trùng trước khi xếp lịch
Đọc `social_list_posts` từ 30 ngày trước tới hết khoảng kế hoạch (một lần đọc tối đa 62 ngày; chưa nối kênh thì hỏi người dùng các bài gần đây). Tóm mỗi bài, cũ lẫn mới, thành một câu «bài này giúp ai, việc gì, mời làm gì», rồi so từng câu:
1. **Trùng**: câu tóm của bài mới giống câu tóm của một bài đã đăng trong 30 ngày qua, đã hẹn hoặc đang nháp. Bỏ, hoặc thay bằng ý khác.
2. **Na ná**: cùng chủ đề, câu tóm chỉ khác chữ. Viết lại cho khác hẳn (nói với nhóm khách khác, trả lời câu hỏi khác, hoặc đưa bằng chứng mới) rồi tóm lại; câu tóm mới vẫn giống thì bỏ.
3. **Loạt bài cố ý** (phần 1, phần 2…): được, ghi rõ là loạt, và phần sau phải có điều mới.
Không xếp hai bài cùng kênh vào cùng một buổi; ngày đã có bài hẹn thì dời bài mới.

# 4. Đầu ra
Bảng: Ngày | Kênh | Trụ | Chủ đề | Dạng (bài viết, ảnh, video ngắn, live) | Câu mở gợi ý | Lời kêu gọi | Kiểm trùng (Mới / Đã đổi góc / Loạt) | Duyệt.
Cột **Duyệt** luôn bắt đầu là «Chờ duyệt»; chỉ người dùng (hoặc người duyệt họ chỉ định) đổi sang «Đã duyệt» hay «Cần sửa». Bài sửa sau khi đã duyệt thì quay về «Chờ duyệt».
Cần tệp Excel để cả nhóm theo dõi thì dùng `/lichnoidung`. Viết bài: gõ `/vietbai` kèm một dòng trong bảng; video: `/livestream` (kịch bản) hoặc `/video` (dựng).

# 5. Đưa vào Lịch đăng bài
Chỉ khi người dùng muốn, và chỉ với bài đã viết xong, «Đã duyệt»:
1. `social_list_channels` lấy kênh đăng được.
2. Kiểm lại `social_list_posts` xem bài đó chưa có trong lịch (tránh đăng hai lần).
3. Mỗi bài một thẻ `social_schedule_post`, giờ hẹn theo bảng. Thẻ khoá chữ, ảnh và giờ lúc người dùng duyệt; sửa bài ở Lịch đăng bài thì thẻ hết hiệu lực và phải duyệt lại bản mới.
