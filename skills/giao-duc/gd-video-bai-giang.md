---
name: gd-video-bai-giang
title: Video bài giảng ngắn từ giáo án
description: Dùng khi giáo viên muốn một video bài giảng ngắn (2–5 phút, khung 16:9) từ giáo án / slide / chương giáo trình — cảnh chữ động cho từng ý chính, công thức, ví dụ giải từng bước, câu hỏi nhanh, tổng kết, lồng tiếng đọc và phụ đề — làm bằng Trình dựng video của app.
command: /videobai
industry: giao-duc
category: soan-giang
starters:
  - Làm video bài giảng 3 phút từ giáo án Toán 7 bài 3
  - Video ôn tập nhanh Vật lí 11 bài 3 có lồng tiếng
  - Biến chương 1 giáo trình thành video giới thiệu 2 phút
---

# Hỏi ít, làm luôn
Lấy nội dung từ giáo án / slide / chương thầy cô chỉ (tệp trong thư mục làm việc, Kho tri thức, hoặc vừa soạn trong cuộc trò chuyện). Mặc định: khung 16:9, 2–4 phút, giọng đọc tiếng Việt của app, có phụ đề. Không hỏi thêm; chỉ hỏi khi không biết bài nào.

# Kịch bản (gửi trong tin nhắn trước khi dựng, rồi dựng luôn)
1. Mở đầu 10–15 giây: câu hỏi gợi tò mò lấy từ hoạt động Mở đầu của giáo án.
2. Mỗi ý chính một cảnh 20–40 giây (theo «Hình thành kiến thức»): định nghĩa / quy tắc, công thức, hình ảnh minh hoạ.
3. Một ví dụ giải từng bước (từng dòng hiện dần).
4. Câu hỏi nhanh: hiện câu hỏi, chờ 3 giây, hiện đáp án.
5. Tổng kết 3 ý + bài về nhà.
Lời đọc khoảng 3 từ / giây, câu ngắn, xưng «các em» (hoặc «các bạn» với người lớn); kiến thức đúng sách, tự giải lại ví dụ.

# Dựng
- `video_kit_install` nếu máy chưa có bộ dựng video; `video_project_create` (tên «Bài giảng <môn> <lớp> – <bài>», khung 16:9).
- Mỗi cảnh: `video_project_motion` — kiểu có sẵn trong `video_styles` khi hợp; cảnh công thức / bài giải thì tự viết HTML (nền sáng, chữ lớn, mỗi dòng hiện dần; công thức viết bằng MathML `<math>…</math>` vì trang HTML không đổi `$…$`).
- Lồng tiếng: `video_project_voiceover` với lời đọc của các cảnh theo thứ tự, có phụ đề; kiểm độ dài lời đọc khớp tổng thời lượng các cảnh (`video_project_get`).
- Xuất: `video_project_export` (MP4 16:9) — đây là thẻ duy nhất cần thầy cô bấm.

# Xong
Một câu tóm tắt (số cảnh, độ dài) + «Tiếp theo: bấm Xác nhận ở thẻ xuất để lưu MP4; muốn sửa cảnh nào thì mở Marketing › Video hoặc nhắn em.»
