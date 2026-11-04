---
name: gd-slide-bai-giang
title: Slide bài giảng theo giáo án
description: Dùng khi giáo viên cần bộ slide PowerPoint cho một bài dạy (từ giáo án vừa soạn hoặc tên bài): có hoạt động khởi động, slide theo từng hoạt động, công thức hiển thị sắc nét, câu hỏi luyện tập, dặn dò.
command: /slidebai
industry: giao-duc
category: soan-giang
starters:
  - Làm slide bài giảng cho giáo án Toán 7 bài 3 vừa soạn
  - Slide Ngữ văn 8 bài 1 có trò chơi khởi động
  - Slide Vật lí 11 bài dao động điều hoà, 2 tiết
---

# Hỏi ít, làm luôn
Có giáo án trong cuộc thì bám đúng giáo án (thứ tự hoạt động, câu hỏi, sản phẩm). Chưa có thì tra bài như /giaoan rồi làm slide luôn.

# Bố cục (`create_presentation`)
1. Bìa: tên bài như sách in, môn – lớp, tên giáo viên / trường (hồ sơ giáo viên).
2. Khởi động (1–2 slide): trò chơi nhanh (ai nhanh hơn, ô chữ, đoán hình, đúng / sai) hoặc câu hỏi tình huống gợi vấn đề; ghi luật chơi ngắn.
3. Mục tiêu bài học (một slide, 3–4 ý theo yêu cầu cần đạt — tra `search_curriculum`, không tự đặt).
4. Hình thành kiến thức: mỗi đơn vị kiến thức 1–3 slide (câu hỏi dẫn dắt → kết luận cần ghi nhớ, dùng «two_columns» để so sánh, «table» cho bảng, «timeline» cho quy trình). Định nghĩa / định lí / công thức đóng khung bằng «quote».
5. Luyện tập: mỗi bài một slide, đáp án để ở «notes» (ghi chú người nói) hoặc slide kế tiếp.
6. Vận dụng: tình huống thực tế.
7. Tổng kết + dặn dò («closing»): việc về nhà, bài sau.
- Mỗi slide ≤ 6 dòng, chữ to; «notes» ghi lời giảng, câu hỏi gợi mở, thời gian.
- Công thức Toán / Lí / Hoá: LaTeX trong `$…$` (thành công thức PowerPoint thật, sửa được); hoá học `$\ce{…}$`. Bảng trên slide chỉ hiện công thức dạng chữ một dòng: công thức quan trọng đặt ở gạch đầu dòng, không đặt trong bảng.
- Ảnh: logo trường (Hồ sơ), ảnh giáo viên gửi, hoặc ảnh từ thẻ `generate_image` đã duyệt; không lấy ảnh trên mạng.

# Xong
«Tiếp theo: bấm Xác nhận để lưu slide (mở bằng PowerPoint để thấy công thức chuẩn, sửa được từng công thức).»
