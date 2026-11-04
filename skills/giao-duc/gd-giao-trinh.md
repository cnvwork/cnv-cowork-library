---
name: gd-giao-trinh
title: Soạn giáo trình (đề cương → từng chương → bản đầy đủ)
description: Dùng khi giảng viên đại học, cao đẳng, trường nghề, trung tâm hoặc người đào tạo nội bộ doanh nghiệp cần soạn giáo trình / tài liệu học phần: đề cương chi tiết để duyệt, rồi từng chương (mục tiêu, nội dung, ví dụ, tóm tắt, câu hỏi), ghép thành Word có mục lục, đánh số chương / mục / bảng / hình, tài liệu tham khảo; kèm slide từng chương và ngân hàng câu hỏi.
command: /giaotrinh
industry: giao-duc
category: soan-giang
starters:
  - Soạn giáo trình Kế toán đại cương 3 tín chỉ cho sinh viên năm nhất
  - Giáo trình mô đun Điện dân dụng cho trường nghề, 60 giờ
  - Viết tiếp chương 3 giáo trình Marketing căn bản
---

# Hỏi ít, làm luôn
- Cần: tên học phần / khoá, cấp (đại học – cao đẳng, trường nghề, trung tâm, doanh nghiệp), đối tượng, thời lượng (tín chỉ hoặc giờ). Thiếu thì hỏi MỘT câu gộp; trường, khoa, người biên soạn lấy từ hồ sơ giáo viên.
- Đề cương, giáo trình cũ, quy định trình bày của trường (thầy cô gửi kèm hoặc có trong Kho tri thức: `search_knowledge_base`, `search_brain`): bám đúng cấu trúc, thuật ngữ, cách trình bày đó.
- «Viết tiếp giáo trình …»: `textbook_status` (query = tên) để lấy mã gt-… và xem chương nào đã soạn.

# Bước 1 — Đề cương chi tiết (thẻ để duyệt)
`create_course_outline`: mô tả, mục tiêu, chuẩn đầu ra (CLO1, CLO2…), các chương (tên, giờ lý thuyết / thực hành, chuẩn đầu ra, mục tiêu bằng động từ đo được, các mục), phương pháp dạy học, đánh giá (tỉ trọng cộng đủ 100%), tài liệu học tập theo thứ tự — các chương trích dẫn [1], [2]… theo số này.
- Chỉ ghi tài liệu có thật (thầy cô đưa, có trong Kho tri thức hoặc tra được); không bịa tên sách, tác giả, năm.
- Tổng giờ các chương khớp tổng giờ học phần (app kiểm, lệch là thẻ bị từ chối).
- Dừng ở thẻ cho thầy cô duyệt; muốn sửa thì đề xuất thẻ đề cương mới.

# Bước 2 — Từng chương
Mỗi lượt một chương bằng `write_textbook_chapter` (mã gt-… từ `textbook_status`), đúng các mục của đề cương và đúng thứ tự:
- Mở đầu ngắn; mỗi mục giải thích rõ, có ví dụ thực tế Việt Nam khi hợp; bảng ghi «caption» (app tự đánh số «Bảng 2.1»); hình chỉ dùng ảnh trong thư mục làm việc hoặc ảnh đã tạo.
- Ví dụ minh hoạ có lời giải đầy đủ — tự giải lại, số liệu khớp.
- Tóm tắt chương; câu hỏi ôn tập (tự luận, trắc nghiệm 4 phương án có đáp án, bài tập, thảo luận) kèm đáp án / gợi ý.
- Công thức trong `$…$`; trích dẫn [n] chỉ dùng số có trong danh mục tài liệu.
- Thẻ có «Kiểm tra» (khớp đề cương, trích dẫn) và «Lưu ý» (mục còn thiếu): soạn bổ sung trước khi sang chương sau.
- Sau mỗi chương đề xuất luôn slide của chương bằng `create_presentation` (mỗi mục 1–2 slide, công thức thật, ghi chú giảng trong notes).

# Bước 3 — Bản đầy đủ
Đủ các chương thì gọi `assemble_textbook` với lời nói đầu (mục đích, đối tượng, cấu trúc, lời cảm ơn), nơi, năm. App ghép bìa, mục lục (Word điền số trang khi mở tệp), các chương, tài liệu tham khảo, phụ lục đáp án, kèm ngân hàng câu hỏi Excel. Không tệp nào bị ghi đè: soạn lại / ghép lại là tệp mới.

# Soát trước khi đề xuất
Thuật ngữ thống nhất giữa các chương; không lặp nội dung chương trước; số liệu, ví dụ đúng; chính tả.

# Xong
Một câu tóm tắt + «Tiếp theo…» (vd «Tiếp theo: bấm Xác nhận đề cương; nhắn "soạn chương 1" để em viết chương đầu.»).
