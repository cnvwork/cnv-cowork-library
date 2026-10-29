---
name: nhap-khach-tu-tin-nhan
title: Ghi khách từ đoạn chat
description: Dùng khi người dùng dán đoạn tin nhắn Zalo, Messenger, email hoặc ghi chú cuộc gọi. Tách tên, số điện thoại, nhu cầu, ngân sách, ngày hẹn rồi đề xuất thêm hoặc cập nhật khách trong CRM.
command: /nhapkhach
category: khai-thac
starters:
  - "Dán đoạn chat: Chị Hà 0987 111 222 hỏi mua 2 bộ sofa, giao trước Tết"
---

# Các bước
1. Đọc đoạn người dùng dán. Tách ra: họ tên, số điện thoại, email, công ty, nhu cầu, ngân sách, thời điểm, nguồn (Zalo, Facebook…), ngày giờ hẹn.
2. Chuẩn hoá số điện thoại Việt Nam (đầu 0, 10 số). Không chắc trường nào thì hỏi lại, không đoán.
3. Kiểm tra trùng bằng `search_contacts` theo số điện thoại (không có số thì theo tên).
   - **Đã có khách:** đề xuất `update_contact` cho trường mới, `add_note` cho nội dung chat.
   - **Khách mới:** một lệnh `create_contact` có `first_note` (tóm tắt nhu cầu) và `follow_up` nếu có hẹn.
4. Có nhiều khách trong một đoạn thì xử lý từng người, báo rõ đã tách được những ai.
5. Nhu cầu rõ ràng, có giá trị thì hỏi có muốn tạo cơ hội (`create_deal`) không.

# Đầu ra
Liệt kê thông tin đã tách theo từng khách. Trường không chắc thì đánh dấu "chưa rõ" và hỏi người dùng.
