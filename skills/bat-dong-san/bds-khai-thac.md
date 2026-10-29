---
name: bds-khai-thac
title: Khai thác nhu cầu khách mua, thuê nhà
description: Dùng khi có khách mới hỏi mua hoặc thuê căn hộ, nhà phố, đất nền. Hỏi đủ mục đích, ngân sách, khu vực, pháp lý mong muốn, thời điểm; ghi vào CRM và hẹn bước tiếp.
command: /nhucaubds
industry: bat-dong-san
category: khai-thac
starters:
  - Khách mới hỏi căn 2 phòng ngủ ở Thủ Đức, tầm 3 tỷ
  - Có chị hỏi thuê nhà nguyên căn quận 7, nuôi được chó
---

# Mục tiêu
Sau 1–2 lượt nói chuyện, biết đủ để lọc ra 2–3 sản phẩm phù hợp và hẹn được bước tiếp (gửi thông tin, đi xem).

# Câu hỏi khai thác (hỏi dần, không hỏi dồn)
1. **Mục đích:** ở thực, đầu tư cho thuê, đầu tư lướt sóng, mua cho con, làm văn phòng?
2. **Loại hình:** căn hộ, nhà phố, đất nền, biệt thự, shophouse; số phòng ngủ, diện tích.
3. **Khu vực:** quận/huyện ưu tiên, gần trường, chỗ làm, bệnh viện nào.
4. **Ngân sách:** tổng tiền; tự có bao nhiêu, cần vay bao nhiêu (vay thì gợi ý dùng `/phaplybds` phần vay).
5. **Pháp lý mong muốn:** sổ hồng riêng, hợp đồng mua bán, chấp nhận dự án đang xây?
6. **Thời điểm:** cần nhận nhà khi nào; đã đi xem đâu chưa, đang cân nhắc dự án nào.
7. **Người quyết định:** vợ/chồng, bố mẹ cùng quyết?
8. **Thuê:** thời hạn thuê, ngày vào ở, số người, thú cưng, đồ đạc.

# Ghi vào CRM
- Khách mới: một lệnh `create_contact` gồm tên, số, `source`, `first_note` tóm tắt nhu cầu theo các mục trên, `follow_up` nếu có hẹn.
- Đã có khách: `update_contact` + `add_note`.
- Nhu cầu rõ và có ngân sách: đề nghị `create_deal` (giá trị = ngân sách dự kiến, tên cơ hội ví dụ "Mua căn 2PN Thủ Đức – anh Nam").
- Mức độ: hot = có ngân sách và cần trong 1–3 tháng; warm = đang tìm hiểu; cold = chưa rõ thời điểm.

# Tin nhắn mẫu sau cuộc nói chuyện đầu
> Em cảm ơn anh/chị đã tin tưởng ạ. Em tóm tắt lại: anh/chị cần căn 2 phòng ngủ khu Thủ Đức, khoảng 3 tỷ, có sổ hồng, nhận nhà trong năm nay. Trong hôm nay em gửi anh/chị 2–3 căn sát nhất kèm pháp lý để mình xem trước nhé.

# Lưu ý
Không hứa tăng giá hay lợi nhuận đầu tư. Giá và chính sách dự án chỉ nói theo thông tin người dùng có.
