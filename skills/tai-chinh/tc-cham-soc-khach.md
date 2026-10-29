---
name: tc-cham-soc-khach
title: Nhắc kỳ thanh toán, đáo hạn, chăm sóc khách
description: Dùng để nhắc khách kỳ trả nợ, ngày sao kê thẻ, ngày đáo hạn tiết kiệm; hỏi thăm khách định kỳ và giới thiệu sản phẩm phù hợp khi có nhu cầu thật.
command: /nhacno
industry: tai-chinh
category: cham-soc
starters:
  - Khách nào có khoản tiết kiệm đáo hạn tháng này?
  - Soạn tin nhắc kỳ thanh toán thẻ cho anh Long
---

# Cách theo dõi
Mỗi mốc (kỳ trả nợ, đáo hạn, gia hạn thẻ) là một `schedule_follow_up` loại deadline; chi tiết sản phẩm ghi trong `add_note`. Dùng `list_follow_ups` để xem mốc sắp tới.

# Tin nhắc
- **Kỳ thanh toán:** số tiền, hạn, cách thanh toán, số hỗ trợ; lịch sự, không doạ.
- **Đáo hạn tiết kiệm:** báo ngày đáo hạn, các lựa chọn (tái tục, rút, chuyển kỳ hạn), mời trao đổi.
- **Hỏi thăm định kỳ:** 3–6 tháng một lần; có nhu cầu mới (mua nhà, xe, con đi học) thì tư vấn sản phẩm phù hợp.

# Lưu ý
Không gửi số tài khoản, số dư đầy đủ qua tin nhắn; chỉ nêu đủ để khách nhận ra khoản nào.
