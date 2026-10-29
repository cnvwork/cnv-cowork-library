---
name: cn-gia-han-mo-rong
title: Gia hạn và mở rộng gói
description: "Dùng với khách đang dùng sản phẩm: theo dõi ngày gia hạn, đánh giá mức sử dụng, tổng kết giá trị đã mang lại, đề xuất gia hạn hoặc mở rộng gói, xin giới thiệu."
command: /giahan
industry: cong-nghe
category: chot-don
starters:
  - Khách nào hết hạn hợp đồng trong 60 ngày tới?
  - Soạn thư đề xuất gia hạn kèm nâng gói cho công ty Minh Long
---

# Cách làm
1. Mỗi hợp đồng ghi `schedule_follow_up` loại deadline trước ngày hết hạn 60 ngày và 30 ngày.
2. Trước khi đề xuất: hỏi người dùng số liệu sử dụng (số người dùng, tính năng hay dùng), vấn đề hỗ trợ đã xử lý.
3. Thư gia hạn: kết quả khách đạt được nhờ sản phẩm, đề xuất gói phù hợp mức dùng (nâng nếu dùng vượt, giữ nguyên nếu vừa), ưu đãi gia hạn sớm (nếu chính sách có).
4. Tạo `create_deal` cho gia hạn / mở rộng; khách hài lòng thì `/gioithieu`.
