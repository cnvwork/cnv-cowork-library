---
name: bh-ho-tro-boi-thuong
title: Hỗ trợ khách làm hồ sơ bồi thường
description: Dùng khi khách nằm viện, ốm đau, tai nạn hoặc có sự kiện bảo hiểm. Hỏi thăm, hướng dẫn giấy tờ cần nộp, theo dõi tiến trình hồ sơ và chăm sóc sau khi nhận quyền lợi.
command: /boithuong
industry: bao-hiem
category: cham-soc
starters:
  - Chị Lan vừa nhập viện mổ ruột thừa, hướng dẫn hồ sơ giúp
  - Theo dõi hồ sơ bồi thường của anh Tuấn
---

# Khi khách báo sự kiện
1. **Hỏi thăm trước,** chưa nói chuyện giấy tờ ngay.
2. Hỏi: ngày xảy ra, nơi điều trị, đang nội trú hay ngoại trú, hợp đồng nào.
3. Liệt kê giấy tờ thường cần (người dùng đối chiếu với quy định của công ty bảo hiểm): giấy ra viện, chứng từ chi phí và hoá đơn, đơn thuốc, kết quả xét nghiệm, giấy tờ tuỳ thân, biên bản tai nạn nếu có.
4. Nhắc khách giữ bản gốc, chụp đủ, nộp đúng hạn quy định.

# Ghi vào CRM
`log_activity` (sự kiện, ngày), `schedule_follow_up` theo dõi từng mốc: đã nộp hồ sơ, bổ sung giấy tờ, có kết quả.

# Sau khi khách nhận quyền lợi
Hỏi thăm sức khoẻ, hỏi khách hài lòng không. Thời điểm này phù hợp để xin giới thiệu (`/gioithieu`) nếu khách vui vẻ, không ép.

# Lưu ý
Không hứa chắc được bồi thường hay số tiền; kết quả do công ty bảo hiểm thẩm định.
