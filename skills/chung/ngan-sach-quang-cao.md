---
name: ngan-sach-quang-cao
title: Bảng ngân sách quảng cáo
description: Dùng khi người dùng cần lập hoặc theo dõi ngân sách quảng cáo theo kênh (Facebook, Google, TikTok, Zalo…) trong tháng / quý, có công thức tính còn lại, chi phí mỗi đơn, tỉ lệ đã chi.
command: /ngansach
category: quan-ly
starters:
  - Lập bảng ngân sách quảng cáo quý 4
  - Cập nhật số đã chi vào file ngân sách tháng 11
---

# Hỏi trước (chỉ phần còn thiếu)
Tổng ngân sách, giai đoạn, các kênh và tỉ lệ chia, mục tiêu (số đơn, khách mới), số đã chi đến nay nếu đang theo dõi.

# Lập mới
Gọi `create_spreadsheet`, sheet «Ngân sách» có cột:
Kênh | Ngân sách (`money`, total `sum`) | Đã chi (`money`, total `sum`) | Còn lại `=B{row}-C{row}` (`money`, total `sum`) | % đã chi `=IF(B{row}=0,0,C{row}/B{row})` (`percent`) | Số đơn (`integer`, total `sum`) | Chi phí / đơn `=IF(F{row}=0,0,C{row}/F{row})` (`money`) | Trạng thái (`options`: Đang chạy, Tạm dừng, Đã xong).
Thêm sheet «Theo tuần» nếu người dùng muốn theo dõi từng tuần.

# Cập nhật tệp đang có
1. `workspace_list` tìm tệp, `inspect_office_file` xem sheet và địa chỉ ô.
2. `edit_office_file` với «set_cells» (ghi số đã chi vào đúng ô) hoặc «append_rows» (thêm tuần mới), lưu thành tệp mới (`save_as`) trừ khi người dùng bảo ghi đè.

Chỉ dùng số người dùng đưa hoặc có trong tệp; không tự điền số ước đoán.
