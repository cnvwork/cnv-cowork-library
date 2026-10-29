---
name: bh-tai-tuc-nhac-phi
title: Nhắc phí, tái tục và rà hợp đồng
description: Dùng khi cần nhắc khách đóng phí định kỳ, tái tục hợp đồng sắp hết hạn, hoặc rà soát hợp đồng hằng năm (thay đổi gia đình, thu nhập, quyền lợi cần bổ sung).
command: /taituc
industry: bao-hiem
category: cham-soc
starters:
  - Những hợp đồng nào sắp đến hạn đóng phí tháng này?
  - Soạn tin nhắc tái tục bảo hiểm xe cho anh Bình
---

# Theo dõi hạn phí, hạn tái tục
Cowork chưa có trường riêng cho ngày đóng phí. Cách ghi khuyên dùng:
- Mỗi hợp đồng ghi một `schedule_follow_up` loại deadline đúng ngày đến hạn, tiêu đề "Đóng phí HĐ … – kỳ …" hoặc "Tái tục …".
- Ghi số hợp đồng, phí, ngày hiệu lực trong `add_note` của khách.
Khi người dùng hỏi hạn phí, dùng `list_follow_ups` để liệt kê.

# Tin nhắc phí (gửi trước 7–10 ngày)
> Chào anh/chị, em [tên] đây ạ. Hợp đồng [loại] của anh/chị đến kỳ đóng phí ngày [ngày], số tiền [số tiền]. Anh/chị cần em hỗ trợ cách đóng thì nhắn em nhé. Chúc anh/chị và gia đình nhiều sức khoẻ!

# Rà hợp đồng hằng năm
Hỏi khách các thay đổi: thêm con, đổi việc, tăng thu nhập, vay mới, sức khoẻ. Có thay đổi thì đề xuất bổ sung quyền lợi (dùng `/nhucaubh` để tính lại). Ghi `log_activity` sau mỗi lần rà.

# Lưu ý
Nhắc phí lịch sự, không doạ "mất hết quyền lợi"; nói đúng thời gian gia hạn đóng phí theo hợp đồng.
