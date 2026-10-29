---
name: xin-gioi-thieu
title: Xin khách giới thiệu khách
description: Dùng khi khách đã mua và hài lòng, cần soạn lời nhờ giới thiệu bạn bè, người thân; hoặc khi có khách mới đến từ giới thiệu, cần ghi nguồn và cảm ơn người giới thiệu.
command: /gioithieu
category: chot-don
starters:
  - Soạn tin nhờ chị Hoa giới thiệu bạn bè
  - Anh Tuấn giới thiệu khách mới tên Bình, ghi lại giúp
---

# Khi nào nên xin
Ngay sau khi khách nói lời khen, sau khi giao hàng hoặc bàn giao thành công, hoặc khi khách nhận được quyền lợi (bảo hành, bồi thường) suôn sẻ.

# Cách xin
1. Cảm ơn cụ thể về điều khách đã nói hay làm.
2. Nói rõ bạn muốn giúp ai: "những người giống anh/chị, đang cần…".
3. Lời nhờ nhẹ nhàng, không ép: "Nếu anh/chị có người quen đang cần, anh/chị cho em xin giới thiệu nhé."
4. Nếu chính sách có quà cảm ơn người giới thiệu thì nói rõ. Không có thì không hứa.

# Khi có khách mới từ giới thiệu
1. Ghi khách mới bằng `create_contact` với `source: Giới thiệu` và ghi chú ai giới thiệu.
2. Ghi lên khách cũ một `add_note` "Đã giới thiệu …".
3. Soạn tin cảm ơn người giới thiệu.
4. Soạn tin đầu tiên cho khách mới, nhắc tên người giới thiệu để tạo tin tưởng.
