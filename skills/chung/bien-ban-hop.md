---
name: bien-ban-hop
title: Biên bản họp, tóm tắt bài giảng từ ghi âm / video
description: Dùng khi người dùng gửi ghi âm / video cuộc họp, buổi học, hội thảo, phỏng vấn (hoặc tệp trong thư mục làm việc) và cần biên bản họp, tóm tắt bài giảng, danh sách việc cần làm hoặc bản chép lời có mốc thời gian; xuất được tệp Word.
command: /bienban
category: quan-ly
starters:
  - Làm biên bản cuộc họp từ ghi âm này
  - Tóm tắt bài giảng trong video, xuất Word
  - Chép lời ghi âm phỏng vấn, có mốc thời gian
---

# Lấy bản chép lời
1. Tệp người dùng gửi kèm (có `local_file_id`) hoặc tệp trong thư mục làm việc (`workspace_list` để tìm, rồi `folder` + `path`). Chưa có tệp thì nhờ kéo tệp ghi âm / video vào ô chat (hoặc gửi qua Telegram).
2. `transcribe_recording` chép ngay trên máy (miễn phí, không gửi tiếng ra ngoài). Tệp dài mất vài phút: nói một câu «đang chép lời, xong em làm biên bản» rồi gọi. Đọc HẾT các phần (`part` 2, 3…) rồi mới viết.
3. Công cụ báo thiếu gói chép lời: đưa thẻ `speech_kit_install` (video hoặc ghi âm dài hơn 45 phút: `include_reader: true`); báo thiếu bộ đọc: thẻ `video_kit_install` với `items: ["engine"]`. Dừng ở thẻ, không tự tải.
4. Bản chép trên máy có thể nghe nhầm tên riêng, con số: sửa chỗ hiển nhiên theo ngữ cảnh, chỗ không chắc ghi «(?)». Không bịa người, số liệu, quyết định không có trong bản chép.

# Biên bản họp (mặc định)
Câu trả lời CHÍNH LÀ biên bản: viết đủ các mục dưới đây ngay trong câu trả lời (không chỉ báo «đã xong», không hẹn «bên dưới» mà bỏ trống).
- **Thông tin chung**: tên cuộc họp (đoán từ nội dung nếu người dùng không nói), ngày (không rõ thì ghi «theo ngày gửi tệp»), thời lượng.
- **Thành phần**: chỉ người được gọi tên hoặc tự giới thiệu trong bản chép (anh Minh, chị Lan…). Bản chép chưa tách người nói: không đoán ai nói câu nào; ghi «Người được nhắc tên: …».
- **Nội dung chính**: theo từng vấn đề, mỗi ý 1–3 câu, kèm mốc [mm:ss] để tra lại.
- **Quyết định, thống nhất**: chỉ điều đã chốt («thống nhất», «đồng ý», «chốt», «quyết định»…).
- **Việc cần làm**: bảng Việc | Người phụ trách | Hạn | Ghi chú. Người / hạn không rõ ghi «chưa giao» / «chưa có hạn», không tự đặt.
- **Vấn đề còn mở / cần hỏi thêm**.

# Tóm tắt bài giảng (bài học, lớp, hội thảo, khoá đào tạo)
- Chủ đề, người giảng (nếu được nhắc), thời lượng.
- Ý chính theo trình tự, có mốc [mm:ss].
- Khái niệm, định nghĩa, công thức (chép đúng), ví dụ minh hoạ.
- Bài học / khoá học: 5–10 câu hỏi ôn tập kèm đáp án ngắn.

# Xuất Word
Người dùng đã nói «xuất / gửi / in / Word» thì làm luôn; chưa nói thì cuối câu trả lời hỏi đúng một câu «Xuất biên bản ra Word không ạ?». `create_document` (cần thư mục làm việc cho phép ghi), `pdf: true` khi cần gửi:
1. `title` «BIÊN BẢN CUỘC HỌP» (hoặc «TÓM TẮT BÀI GIẢNG»), `subtitle` tên cuộc họp · ngày.
2. `key_values`: Thời gian, Thời lượng, Thành phần, Người ghi «Trợ lý CNV Cowork (từ ghi âm)».
3. `heading` + `bullets` cho Nội dung chính, Quyết định.
4. `table` Việc cần làm: header Việc | Người phụ trách | Hạn | Ghi chú.
5. `heading` + `bullets` Vấn đề còn mở.
6. `signatures`: Chủ trì, Thư ký (không rõ tên thì để trống).
Tên tệp: «Biên bản/bien-ban-hop-<yyyy-mm-dd>.docx».

# Sau biên bản
- Việc của chính người dùng có hạn rõ: đề nghị tạo nhắc việc / task (thẻ chờ xác nhận), không tự tạo.
- Cần bản chép lời đầy đủ: tạo thêm tệp «Bản chép lời» (Word hoặc .txt) giữ nguyên mốc thời gian.
