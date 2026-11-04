---
name: gd-ke-hoach-day-hoc
title: Kế hoạch dạy học cả năm (phân phối chương trình)
description: Dùng khi tổ chuyên môn / giáo viên THCS, THPT cần kế hoạch dạy học môn học cả năm theo Phụ lục I (của tổ) hoặc Phụ lục III (kế hoạch giáo dục của giáo viên) Công văn 5512; app tự lấy bài, chương, số tiết, yêu cầu cần đạt từ sách Kết nối tri thức, tính tuần, ra Word ngang + Excel.
command: /kehoachday
industry: giao-duc
category: soan-giang
starters:
  - Lập kế hoạch dạy học Toán 7 năm học 2026–2027 cho tổ
  - Kế hoạch giáo dục của giáo viên Vật lí 11, 2 tiết / tuần
  - Phân phối chương trình Tin học 8 kèm tuần thực hiện
---

# Hỏi ít, làm luôn
- Có môn + lớp là làm. «Kế hoạch dạy học», «phân phối chương trình», «của tổ» → Phụ lục I (kind "to_chuyen_mon"); «kế hoạch giáo dục của giáo viên», «kế hoạch cá nhân», «kèm tuần, thiết bị» → Phụ lục III (kind "giao_vien").
- Trường, tổ, họ tên, năm học lấy từ hồ sơ giáo viên. Số tiết / tuần theo lời thầy cô; không nói thì app chia đều 35 tuần (học kì I 18, học kì II 17).

# Các bước
1. `search_textbook_lessons` (môn, lớp, bỏ trống query) xem cả sách: bài nào chưa có số tiết.
2. Gọi `create_teaching_plan`:
   - Bỏ trống «lessons» để app lấy cả sách theo thứ tự (chương thành hàng tiêu đề, yêu cầu cần đạt in nguyên văn).
   - Bài chưa có số tiết: «adjust» [{lesson_id, periods}] theo phân phối của tổ; tổ chưa có thì đề xuất hợp lý — thẻ tự ghi đó là số tiết đề xuất.
   - Ôn tập / kiểm tra giữa kì, cuối kì: chèn bằng «adjust» với «after» (tên hoặc mã bài đứng trước), «title», «periods», để tổng khớp số tiết / tuần × 35.
   - Ngữ văn / Tiếng Việt (sách giáo viên không ghi tiết theo từng văn bản): «lessons» theo bài lớn [{unit: "Bài 1. …", periods: 12}, …].
   - Tin học 11, 12: «book» = "Khoa học máy tính" hoặc "Tin học ứng dụng".
   - THPT: chuyên đề lựa chọn tự lấy từ sách chuyên đề / chương trình; thiếu số tiết thì truyền «topics».
   - Phụ lục III: «default_equipment», «default_place»; bài thí nghiệm, thực hành, phòng máy thì «adjust» với «equipment», «place».
   - Phụ lục I mục I (đặc điểm tình hình, thiết bị, phòng học): chỉ điền số liệu tổ đưa; còn lại để dòng chấm cho tổ điền.
3. Thẻ có dòng «Lưu ý» (tổng tiết lệch số tuần, hàng đề xuất, thời gian bài kiểm tra theo Thông tư 22/2021 Điều 7): nói lại trong câu tóm tắt.

# Lưu ý
- Các phụ lục của Công văn 5512 là khung tham khảo; trường có mẫu riêng thì điền mẫu đó (`inspect_office_file`, `edit_office_file`).
- Từ 10/5/2026 Điều lệ trường (Thông tư 15/2026) chỉ bắt buộc kế hoạch bài dạy trong hồ sơ giáo viên; Phụ lục III làm khi trường còn yêu cầu.
- Tiểu học lập kế hoạch giáo dục theo Công văn 2345 ở cấp trường: công cụ này dành cho THCS, THPT.

# Xong
Câu tóm tắt (số bài, tổng tiết, số hàng đề xuất) + «Tiếp theo: bấm Xác nhận để lưu Word + Excel; nhắn /giaoan <bài> để soạn từng bài, /dekiemtra để ra đề giữa kì theo kế hoạch.»
