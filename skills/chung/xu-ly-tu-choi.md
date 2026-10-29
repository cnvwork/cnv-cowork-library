---
name: xu-ly-tu-choi
title: Xử lý lời từ chối
description: Dùng khi khách nói đắt quá, để suy nghĩ thêm, hỏi ý gia đình, bên khác rẻ hơn, chưa có nhu cầu hoặc không tin. Gợi ý cách trả lời khéo, trung thực, giữ được quan hệ.
command: /tuchoi
category: chot-don
starters:
  - Khách chê giá cao hơn bên kia 10%, trả lời sao?
  - Khách bảo để về hỏi ý chồng đã
---

# Cách làm: Nghe → Thừa nhận → Hỏi rõ → Trả lời → Kiểm tra lại
1. **Nghe hết** điều khách nói, không cắt ngang.
2. **Thừa nhận** cảm nhận của khách ("Dạ em hiểu, ai mua cũng muốn chắc chắn…"). Không cãi.
3. **Hỏi rõ** lý do thật: "Ngoài giá ra thì anh/chị còn băn khoăn điều gì không ạ?"
4. **Trả lời** đúng lý do thật, bằng giá trị, bằng chứng (khách thật, bảo hành, chính sách) hoặc phương án khác.
5. **Kiểm tra lại**: "Như vậy anh/chị thấy ổn hơn chưa ạ?" rồi đề xuất bước tiếp nhỏ.

# Gợi ý theo từng câu từ chối
- **"Đắt quá":** tách giá ra theo ngày, theo lần dùng; so sánh những gì được bao gồm (bảo hành, hỗ trợ, phí ẩn); đưa phương án gói nhỏ hơn. Không hạ giá ngay.
- **"Để suy nghĩ thêm":** hỏi khách còn đang cân nhắc điểm nào, gửi tóm tắt để khách dễ quyết, hẹn thời điểm hỏi lại cụ thể.
- **"Hỏi ý vợ/chồng/sếp":** đề nghị gửi tài liệu ngắn để khách chuyển cho người kia, hoặc mời cả hai cùng nghe tư vấn.
- **"Bên kia rẻ hơn":** hỏi bên kia đã gồm những gì; nêu khác biệt thật. Không chê đối thủ.
- **"Chưa có nhu cầu":** hỏi khi nào có thể cần, xin phép giữ liên lạc, ghi lịch nhắc.
- **"Không tin / sợ lừa":** đưa thông tin pháp nhân, hợp đồng, khách đã dùng, chính sách hoàn tiền nếu có.

# Đầu ra
Cho người dùng 2–3 câu trả lời mẫu, mỗi câu 2–4 dòng, xưng hô theo hồ sơ kinh doanh. Nêu luôn bước tiếp nên đề xuất.
Nếu khách cụ thể đã có trong CRM, đề nghị ghi chú lý do từ chối (`add_note`) và hẹn ngày hỏi lại (`schedule_follow_up`).

# Lưu ý
Không bịa khuyến mãi, không hứa điều chính sách không có, không tạo khan hiếm giả.
