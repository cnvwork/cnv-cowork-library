---
name: ngan-sach-quang-cao
title: Bảng ngân sách quảng cáo
description: Dùng khi người dùng cần lập hoặc theo dõi ngân sách quảng cáo theo kênh (Facebook, Google, TikTok, Zalo…) trong tháng / quý, có công thức tính còn lại, chi phí mỗi đơn, tỉ lệ đã chi; hoặc hỏi có nên tăng / giảm ngân sách chiến dịch đang chạy (tăng từng bậc, tối đa +20–30% mỗi lần, luật «3 KHÔNG»).
command: /ngansach
category: quan-ly
starters:
  - Lập bảng ngân sách quảng cáo quý 4
  - Cập nhật số đã chi vào file ngân sách tháng 11
  - Chiến dịch đang lời, tăng ngân sách được chưa?
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

# Tăng, giảm ngân sách chiến dịch đang chạy
## Luật «3 KHÔNG»
1. **KHÔNG tăng khi chưa có lời thật.** Chưa đủ đơn / lead thật (mặc định ít nhất 3 đơn thật trong kỳ) hoặc ROAS thật dưới hoà vốn thì chưa tăng. Số hãng báo không đủ: đối chiếu đơn thật bằng `/chandoanqc`.
2. **KHÔNG tăng khi số chưa chín.** Chiến dịch chạy chưa đủ 3 ngày, vừa sửa ngân sách / đối tượng / mẫu trong 48–72 giờ qua, hoặc chỉ có số của hôm nay (chưa hết ngày) thì chờ.
3. **KHÔNG tăng quá tay.** Mỗi lần tối đa +20–30%; lần sau cách ít nhất 2–3 ngày và chỉ khi số vẫn giữ; luôn nằm trong trần chi / ngày, / tháng người dùng đặt.

## Tăng từng bậc
Ví dụ bắt đầu 300.000 ₫/ngày: +20% lên 360.000 ₫ → 2–3 ngày sau, số giữ thì +25% lên 450.000 ₫ → 2–3 ngày sau, số giữ thì +25% lên khoảng 560.000 ₫. «Số giữ» là chi phí mỗi đơn thật không tăng quá chừng 20% và ROAS ròng vẫn trên mục tiêu; xấu đi thì về bậc trước và tìm nguyên nhân.
- Cần tăng nhanh hơn: người dùng nhân bản nhóm đang thắng sang nhóm mới với ngân sách riêng, giữ nguyên nhóm cũ (làm trong trình quản lý quảng cáo).
- Giảm: 20–50% một lần với chiến dịch dưới hoà vốn mà vẫn có đơn; chiến dịch tiêu tiền không ra đơn thì tạm dừng.

## Google Ads: giá thầu cũng đi từng bậc
- Chưa đo được chuyển đổi, hoặc chưa có chuyển đổi: tối đa hoá lượt nhấp, có đặt giới hạn giá thầu mỗi lượt nhấp.
- Đã đo chuyển đổi đúng và có chuyển đổi đều mỗi tuần: tối đa hoá lượt chuyển đổi.
- Chuyển đổi ổn định nhiều tuần: mới đặt CPA mục tiêu, bắt đầu bằng CPA thực tế (đừng đặt thấp hơn nhiều); có giá trị đơn thì ROAS mục tiêu.
Mức số chuyển đổi Google khuyên cho từng chiến lược thay đổi theo thời gian: kiểm trang trợ giúp của Google Ads lúc làm. Đổi chiến lược giá thầu là thay đổi lớn, chờ 1–2 tuần mới đánh giá.

## Làm
1. `ads_list_accounts` (trần chi, tiền tệ) và `ads_list_campaigns` (ngân sách hiện tại, `platform_id`).
2. Đề xuất bảng: chiến dịch | ngân sách hiện tại | đề xuất | bậc thứ mấy | lý do có số | ngày xem lại.
3. Người dùng đồng ý: mỗi thay đổi một thẻ `ads_set_budget`, `reason` ghi số chứng minh. Thẻ chỉ duyệt được trên máy. Vượt trần hoặc tài khoản chưa đặt trần thì thẻ bị từ chối: chỉ người dùng tự đặt / nâng ở Quảng cáo › Tài khoản, menu «⋯» › «Trần chi…». Tạm dừng: thẻ `ads_pause`.
4. Đang theo dõi bằng tệp thì ghi lần đổi vào sheet «Theo tuần».
