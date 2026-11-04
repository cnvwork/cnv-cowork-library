---
name: gd-phieu-hoc-tap
title: Phiếu học tập
description: Dùng khi giáo viên cần phiếu học tập / phiếu bài tập cho một bài hay một hoạt động (cá nhân, cặp đôi, nhóm): nhiệm vụ rõ ràng, chỗ trống để học sinh viết, bảng, công thức thật, kèm đáp án tách riêng.
command: /phieuhoctap
industry: giao-duc
category: soan-giang
starters:
  - Làm phiếu học tập nhóm cho hoạt động hình thành kiến thức Toán 7 bài 3
  - Phiếu bài tập cuối tuần Tiếng Việt lớp 3
  - Phiếu học tập KHTN 6 bài tế bào, có đáp án
---

# Hỏi ít, làm luôn
Có bài (hoặc giáo án vừa soạn trong cuộc) là làm. Mặc định: phiếu nhóm 4–6 học sinh, 10–15 phút, 3–5 nhiệm vụ từ dễ đến khó.

# Các bước
1. Bài và yêu cầu cần đạt: `search_textbook_lessons` / `search_curriculum` (mỗi nhiệm vụ nhắm một yêu cầu cần đạt; không tự đặt).
2. Gọi `create_document` với «style: "school"» (Times New Roman, chữ đen, lề nhà trường):
   - Đầu phiếu: khối «columns» (trái: «Trường …», «Lớp …»; phải: «PHIẾU HỌC TẬP SỐ …», «Nhóm / Họ tên: ……»).
   - Mục tiêu một dòng in nghiêng; thời gian làm.
   - Mỗi nhiệm vụ: tiêu đề «Nhiệm vụ 1», đề bài rõ, chỗ trống bằng dòng chấm «……………………» hoặc bảng điền («table» có cột trống), công thức trong `$…$`.
   - Cuối phiếu: ô tự đánh giá ngắn (mức hiểu bài) nếu hợp.
3. Đáp án / gợi ý chấm: tài liệu riêng (tên tệp «… - Dap an.docx») để in phiếu không lộ đáp án; tự giải lại mọi câu trước khi đưa.
4. Phiếu đi kèm giáo án: có thể đặt vào phần «appendix» của `create_lesson_plan` thay vì tệp riêng.

# Xong
«Tiếp theo: bấm Xác nhận để lưu phiếu; cần in nhiều bản thì mở tệp Word in trực tiếp.»
