---
name: gd-nhan-xet-hoc-sinh
title: Nhận xét học sinh từ bảng điểm
description: Dùng khi giáo viên cần viết nhận xét cho cả lớp (sổ theo dõi, học bạ, phiếu liên lạc) từ bảng điểm Excel, theo Thông tư 22/2021 (THCS, THPT) hoặc Thông tư 27/2020 (tiểu học): mỗi học sinh một câu riêng, không lặp, giọng tích cực, đúng mức đánh giá.
command: /nhanxet
industry: giao-duc
category: soan-giang
starters:
  - Viết nhận xét cuối kì 1 môn Toán cho lớp 7A1 từ file điểm trong thư mục
  - Nhận xét học sinh lớp 3B theo Thông tư 27 từ bảng điểm
  - Nhận xét giữa kì môn Ngữ văn, mỗi em 1 câu ngắn
---

# Hỏi ít, làm luôn
Cần tệp bảng điểm (thư mục làm việc hoặc tệp gửi kèm) + môn + kì. Có tệp là đọc ngay; hỏi tối đa một câu (vd cột nào là điểm cuối kì khi không rõ).

# Các bước
1. Đọc tệp: `workspace_list` → `inspect_office_file` (đọc hết mọi hàng, «from_row» cho lớp đông). Xác định cột họ tên, điểm thường xuyên, giữa kì, cuối kì, trung bình, cột ghi nhận xét (có sẵn hay thêm mới).
2. Mức đánh giá đúng thông tư (không tự đặt thang khác):
   - THCS, THPT (Thông tư 22/2021/TT-BGDĐT): môn chỉ đánh giá bằng nhận xét (Giáo dục thể chất, Nghệ thuật, Âm nhạc, Mĩ thuật, Nội dung giáo dục của địa phương, Hoạt động trải nghiệm, hướng nghiệp) ghi «Đạt» / «Chưa đạt»; môn khác tính điểm trung bình môn học kì = (tổng điểm đánh giá thường xuyên + 2 × giữa kì + 3 × cuối kì) / (số điểm thường xuyên + 5), cả năm = (học kì I + 2 × học kì II) / 3. Kết quả học tập, rèn luyện: Tốt, Khá, Đạt, Chưa đạt. Giáo viên môn học nhận xét «sự tiến bộ, ưu điểm nổi bật, hạn chế chủ yếu (nếu có)»; giáo viên chủ nhiệm thêm «những biểu hiện nổi bật» và «những vấn đề cần quan tâm giúp đỡ thêm».
   - Tiểu học (Thông tư 27/2020/TT-BGDĐT): môn học «Hoàn thành tốt» / «Hoàn thành» / «Chưa hoàn thành»; phẩm chất, năng lực «Tốt» / «Đạt» / «Cần cố gắng»; cuối năm «Hoàn thành xuất sắc» / «Hoàn thành tốt» / «Hoàn thành» / «Chưa hoàn thành»; điểm bài kiểm tra định kì thang 10, không cho điểm thập phân.
   - Từ 01/12/2026 (Thông tư 89/2026/TT-BGDĐT) có Học bạ số; các mức đánh giá trên không đổi.
3. Viết nhận xét từng em dựa trên SỐ LIỆU của em đó (điểm, tiến bộ so với giữa kì, cột ghi chú nếu có):
   - Nêu điểm mạnh cụ thể trước, rồi một việc cần cố gắng (nếu có) kèm cách làm; tiểu học thêm động viên.
   - Giọng tích cực, tôn trọng: không chê bai, không so sánh với bạn, không dùng từ nặng («kém», «lười», «yếu kém», «dốt»), không nhắc hoàn cảnh gia đình, sức khoẻ.
   - Mỗi câu 15–35 từ (học bạ thường giới hạn), câu của các em KHÔNG trùng nhau và không chỉ khác tên — đổi điểm mạnh, cách khuyến khích, cấu trúc câu.
   - Học sinh thiếu điểm: ghi «chưa đủ điểm để nhận xét», không đoán.
4. Ghi vào tệp: `edit_office_file` với «save_as» (tệp mới, giữ bản gốc), «set_cells» vào cột nhận xét (thêm tiêu đề cột nếu chưa có); hoặc `create_spreadsheet` một bảng mới (Họ tên | Điểm | Mức đánh giá | Nhận xét) nếu không muốn sửa tệp gốc.
5. Tự soát trước khi đề xuất: đủ số học sinh, đúng hàng – đúng tên, không câu nào trùng, mức đánh giá khớp điểm.

# Xong
Tóm tắt (bao nhiêu em, phân bố mức) + «Tiếp theo: bấm Xác nhận để lưu tệp nhận xét; thầy cô đọc lại vài em đặc biệt trước khi chép vào học bạ.»
