---
name: gd-soan-giao-an
title: Soạn giáo án (kế hoạch bài dạy)
description: Dùng khi giáo viên cần giáo án / kế hoạch bài dạy cho một bài (THCS, THPT theo khung Phụ lục IV Công văn 5512; tiểu học theo khung thường dùng), từ môn, lớp, tên bài, số tiết; có thể kèm mẫu .docx của trường. Ra tệp Word đúng mẫu, mục tiêu lấy nguyên văn yêu cầu cần đạt của chương trình.
command: /giaoan
industry: giao-duc
category: soan-giang
starters:
  - Soạn giáo án Toán 7 bài 3, 2 tiết
  - Giáo án Ngữ văn 8 bài 1, dạy lớp 8A2
  - Soạn bài Unit 1 Tiếng Anh 10 theo mẫu giáo án của trường trong thư mục
---

# Hỏi ít, làm luôn
- Có môn + lớp + bài thì làm ngay. Thiếu thì hỏi MỘT câu ngắn («Thầy cô soạn bài nào, lớp mấy?»); trường, tổ, họ tên, lớp dạy lấy từ hồ sơ giáo viên.
- Số tiết: lấy số tiết gợi ý của sách (`search_textbook_lessons`); sách không ghi thì theo lời giáo viên, không có nữa thì 1 tiết và nói ở dòng «Tiếp theo…».

# Các bước
1. Tìm bài: `search_textbook_lessons` (môn, lớp, «bài 3» / tên bài). Lấy đúng tên bài như sách in, chương, số tiết, mã yêu cầu cần đạt.
2. Yêu cầu cần đạt: dùng mã của bước 1; thiếu thì `search_curriculum` theo từ khoá của bài. KHÔNG tự viết yêu cầu cần đạt từ trí nhớ. Môn chưa có dữ liệu: nói rõ, soạn mục tiêu theo SGK và nhắc giáo viên đối chiếu chương trình.
3. Cách soạn của chính thầy cô: tra `search_knowledge_base` và `search_brain` («giáo án», «mẫu», tên bài). Có giáo án cũ / quy định của trường thì theo đúng cách trình bày, độ dài, cách ghi hoạt động đó; ghi chú «Cách soạn riêng» trong hồ sơ giáo viên luôn được tôn trọng.
4. Trường có mẫu .docx riêng (giáo viên đính kèm hoặc nói «theo mẫu của trường»): `workspace_list` → `inspect_office_file` → `edit_office_file` với «save_as», điền ĐÚNG mẫu đó: «set_paragraph» cho dòng chờ điền («1. Kiến thức: ……»), «insert_paragraphs» dưới mỗi mục, «fill_table» cho bảng hoạt động. Yêu cầu cần đạt viết `{{yccd:<mã>}}` (app chép nguyên văn). Không có mẫu thì dùng `create_lesson_plan`.
5. Nội dung (`create_lesson_plan`):
   - Khung Phụ lục IV của 5512 là khung tham khảo; mục I mặc định ghi «1. Về kiến thức / 2. Về năng lực / 3. Về phẩm chất» (bản thường dùng); trường dùng bản kí số («1. Kiến thức…») thì đặt «objective_labels» = "ky_so".
   - Mục tiêu: «requirements» = mã yêu cầu cần đạt; «knowledge» = kiến thức cụ thể của bài; năng lực chung (tự chủ và tự học; giao tiếp và hợp tác; giải quyết vấn đề và sáng tạo) và năng lực đặc thù của môn; phẩm chất (yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm). Mỗi ý nêu học sinh LÀM được gì trong bài, không chép khẩu hiệu.
   - THCS / THPT: 4 hoạt động Mở đầu · Hình thành kiến thức mới (chia 2.1, 2.2… theo từng đơn vị kiến thức) · Luyện tập · Vận dụng. Mỗi hoạt động: a) Mục tiêu, b) Nội dung (viết rõ câu hỏi, bài tập, nhiệm vụ — không ghi chung chung «HS làm bài tập SGK»), c) Sản phẩm (đáp án, kết luận cụ thể), d) Tổ chức thực hiện đủ 4 bước chuyển giao → thực hiện → báo cáo, thảo luận → kết luận, nhận định.
   - Tiểu học (lớp 1–5): khung thường dùng I. Yêu cầu cần đạt, II. Đồ dùng dạy học, III. Các hoạt động dạy học chủ yếu, IV. Điều chỉnh sau bài dạy; các hoạt động mở đầu, hình thành kiến thức mới, luyện tập thực hành, vận dụng trải nghiệm, mỗi hoạt động là bảng «rows» (hoạt động của giáo viên | hoạt động của học sinh). Trường có mẫu riêng thì điền mẫu đó.
   - Hoạt động Vận dụng thường giao học sinh làm ngoài giờ trên lớp và nộp báo cáo (ghi chú của khung 5512); kế hoạch bài dạy không cần ghi lời nói của giáo viên, chỉ mô tả việc giáo viên / học sinh làm.
   - Phút các hoạt động cộng đúng số tiết × 45 phút (tiểu học 35 phút).
   - Công thức Toán / Lí / Hoá: LaTeX trong `$…$` (thành công thức Word thật); phương trình hoá học `$\ce{2H2 + O2 -> 2H2O}$`.
   - Phiếu học tập, bài tập thêm, đáp án: đưa vào «appendix».
6. Tự soát trước khi đề xuất: kiến thức đúng sách hiện hành; tự giải lại mọi bài tập, đáp án khớp; phút khớp số tiết; không hoạt động nào trùng ý; chính tả.

# Nhắn từ điện thoại / Telegram
Làm như trên rồi, TRONG CÙNG LƯỢT, đề xuất luôn hai thẻ: `create_lesson_plan` (giáo án Word) và `create_presentation` (slide theo đúng giáo án đó, cách làm như /slidebai: mục tiêu, nhiệm vụ từng hoạt động, công thức, tổng kết, bài về nhà). Giáo viên bấm Xác nhận từng thẻ ngay trên điện thoại, tệp Word và PowerPoint được gửi về chat. Chỉ bỏ slide khi giáo viên dặn «chỉ cần giáo án».

# Xong
Một câu tóm tắt (bài, số tiết, số yêu cầu cần đạt) + dòng «Tiếp theo…», ví dụ: «Tiếp theo: bấm Xác nhận để lưu giáo án; nhắn /slidebai để có slide, /phieuhoctap để có phiếu học tập, hoặc nhờ Tổ chuyên môn (Văn phòng AI) phản biện trước.»
