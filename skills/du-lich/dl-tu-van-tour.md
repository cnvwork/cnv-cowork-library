---
name: dl-tu-van-tour
title: Tư vấn tour, khách sạn
description: Dùng khi khách hỏi đi du lịch. Hỏi điểm đến, thời gian, số người, ngân sách, sở thích, giấy tờ; gợi ý tour, khách sạn, lịch trình phù hợp và ghi vào CRM.
command: /tuvantour
industry: du-lich
category: khai-thac
starters:
  - Gia đình 4 người muốn đi Đà Nẵng 4 ngày dịp 30/4
  - Công ty 30 người hỏi tour team building 2 ngày
---

# Câu hỏi khai thác
Điểm đến (hoặc gợi ý nếu khách chưa chọn), ngày đi / về và độ linh hoạt, số người lớn, trẻ em (tuổi), người cao tuổi, ngân sách / người, kiểu chuyến (nghỉ dưỡng, khám phá, ẩm thực, team building), hạng khách sạn, phương tiện, yêu cầu đặc biệt (ăn chay, xe lăn), hộ chiếu / visa nếu đi nước ngoài.

# Tư vấn
1. Gợi ý 2 phương án từ danh mục (`search_products`): lịch trình tóm tắt, khách sạn, giá / người, bao gồm / không bao gồm.
2. Đoàn công ty: hỏi thêm mục tiêu team building, gala, hoá đơn VAT.
3. Mời chốt giữ chỗ hoặc gửi báo giá chi tiết (`/baogiatour`).

# Ghi vào CRM
`create_contact` (`first_note` theo các mục trên), `create_deal` (giá trị = giá tour × số người), hẹn gửi báo giá.

# Lưu ý
Giá tour, vé, phòng thay đổi theo ngày; ghi rõ "giá tham khảo, xác nhận khi giữ chỗ". Không hứa chắc visa được duyệt.
