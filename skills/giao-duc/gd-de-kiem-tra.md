---
name: gd-de-kiem-tra
title: Ra đề kiểm tra (ma trận, đặc tả, đề, đáp án)
description: Dùng khi giáo viên cần đề kiểm tra giữa kì / cuối kì theo khung Công văn 7991/BGDĐT-GDTrH: ma trận, bản đặc tả, đề nhiều mã (trắc nghiệm nhiều lựa chọn, đúng sai, trả lời ngắn, tự luận), đáp án và hướng dẫn chấm; ma trận kèm bản Excel.
command: /dekiemtra
industry: giao-duc
category: soan-giang
starters:
  - Ra đề kiểm tra giữa kì 1 Toán 7, 90 phút, 4 mã đề
  - Đề cuối kì 1 Vật lí 11 theo cấu trúc mới, 45 phút
  - Làm ma trận và đề 15 phút Hoá học 10 chương 1
---

# Hỏi ít, làm luôn
Cần: môn, lớp, kì (giữa / cuối kì I / II), phạm vi (các bài / chương). Thiếu phạm vi thì lấy các bài từ đầu năm tới thời điểm đó theo `search_textbook_lessons`. Thời gian làm bài theo Thông tư 22/2021 Điều 7: 45 phút với môn có từ 70 tiết / năm trở xuống, 60–90 phút với môn trên 70 tiết / năm (ghi lựa chọn ở dòng «Tiếp theo…»). Hỏi tối đa một câu.

# Khung mặc định (tổ / Sở có quy định khác thì theo quy định đó)
- Theo khung tham khảo của Công văn 7991/BGDĐT-GDTrH (văn bản hướng dẫn cho THPT; THCS dùng khi Sở / tổ hướng dẫn):
  - Điểm theo dạng câu: Nhiều lựa chọn 3,0 · «Đúng – Sai» 2,0 · Trả lời ngắn 2,0 · Tự luận 3,0. Môn không dùng trả lời ngắn thì 2,0 điểm đó chuyển sang «Đúng – Sai».
  - Mức độ (theo điểm): Biết khoảng 40% · Hiểu khoảng 30% · Vận dụng khoảng 30%. Chỉ ba mức Biết / Hiểu / Vận dụng (không có «Vận dụng cao»).
- Cách cho điểm từng câu (theo đề thi tốt nghiệp THPT, Quyết định 764/QĐ-BGDĐT, thường dùng cho bài kiểm tra): nhiều lựa chọn 0,25 điểm / câu (3,0 điểm = 12 câu); đúng sai tối đa 1 điểm / câu (1 ý 0,1 · 2 ý 0,25 · 3 ý 0,5 · 4 ý 1); trả lời ngắn Toán 0,5 điểm / câu, môn khác 0,25.
- Tổng luôn đúng 10 điểm (app tự cộng, lệch là thẻ bị từ chối). Tiểu học (Thông tư 27/2020): câu hỏi theo Mức 1 / Mức 2 / Mức 3, điểm thang 10 không cho điểm thập phân — làm bằng `create_document` (kiểu nhà trường), không dùng khung 7991.

# Các bước
1. Phạm vi + yêu cầu cần đạt: `search_textbook_lessons` (các bài trong phạm vi) và `search_curriculum`. Mỗi câu gắn mã yêu cầu cần đạt nó kiểm tra — app in bản đặc tả nguyên văn từ đó.
2. Phân bổ trước (ma trận nháp): mỗi chủ đề bao nhiêu câu, dạng nào, mức nào, cộng đúng 10 điểm.
3. Viết câu hỏi:
   - Nhiều lựa chọn: 4 phương án KHÔNG kèm nhãn «A.», một đáp án đúng, phương án nhiễu hợp lý (sai lầm hay gặp của học sinh), không «tất cả đều đúng» trừ khi cần (khi đó `fixed_options: true`).
   - Đúng sai: một tình huống + 4 ý a) b) c) d), ghi đúng / sai và mức độ từng ý.
   - Trả lời ngắn: đáp án là một số hoặc cụm ngắn, kiểm tra được ngay.
   - Tự luận: hướng dẫn chấm từng bước có điểm (cộng đúng điểm câu).
   - Công thức trong `$…$`; hoá học `\ce{…}`.
4. Tự giải lại TỪNG câu (Toán / Lí / Hoá: giải đầy đủ, tính số), đối chiếu đáp án; sửa câu nào có hai đáp án đúng hoặc không có đáp án.
5. Gọi `create_exam` (versions = số mã đề, mặc định 4). App tự trộn câu và phương án, đổi đáp án theo từng mã, lập ma trận + bản đặc tả, ghi 4 tệp: đề (mọi mã), đáp án + hướng dẫn chấm, ma trận + đặc tả (Word ngang), ma trận Excel.
6. Ma trận / bản đặc tả: mỗi câu có thể ghi «chapter» (Chủ đề/Chương) và «topic» (Nội dung/đơn vị kiến thức); bỏ trống thì app lấy theo yêu cầu cần đạt.
7. Tổ chuyên môn muốn soát trước: chuyền qua chuỗi «Ra đề kiểm tra» của Văn phòng AI (Tổ chuyên môn AI) rồi mới gọi `create_exam`.

# Xong
Tóm tắt (số câu từng dạng, tỉ lệ mức độ, số mã) + «Tiếp theo…» (vd «Tiếp theo: bấm Xác nhận để lưu bộ đề — mã đầu là đề gốc, số câu trong bản đặc tả theo mã đó.»).
