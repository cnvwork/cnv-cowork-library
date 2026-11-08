---
name: nghien-cuu-sau
title: Nghiên cứu sâu nhiều nguồn, ra báo cáo có trích dẫn
description: Dùng khi người dùng cần tìm hiểu kỹ một chủ đề từ nhiều nguồn trên web (thị trường, đối thủ, giá, quy định, xu hướng, nhà cung cấp, sản phẩm, công nghệ) và cần một báo cáo tổng hợp có link nguồn từng ý, nói rõ chỗ các nguồn nói khác nhau; xuất được Word / PDF.
command: /nghiencuu
category: quan-ly
starters:
  - Nghiên cứu thị trường cà phê đóng gói ở Việt Nam năm nay
  - So sánh giá, bảo hành, khuyến mãi của 3 đối thủ cùng ngành
  - Tổng hợp quy định mới về hoá đơn điện tử cho hộ kinh doanh
---

# Trước khi tra
1. Chủ đề quá rộng hoặc hiểu được nhiều nghĩa (vd «nghiên cứu thị trường» mà không rõ sản phẩm, vùng, khách nào): hỏi lại MỘT câu bằng `ask_user_choice` (2–4 cách hiểu) rồi dừng. Đã đủ rõ thì làm luôn, không hỏi.
2. Không có công cụ `web_search`: nói một dòng là chưa tìm web được, chỉ chỗ bật (Kết nối › Tìm trên web: khoá Tavily / Brave miễn phí, hoặc nối gói ChatGPT / Claude ở Kết nối AI); vẫn đọc được link người dùng gửi bằng `web_fetch`.
3. Không đưa dữ liệu riêng của người dùng (tên khách, số điện thoại, đơn hàng, giá vốn) vào truy vấn tìm hay vào việc giao.

# Chia hướng, giao agent con tra song song
1. Chia câu hỏi thành 3–5 hướng KHÔNG trùng nhau, mỗi hướng một câu hỏi con cụ thể. Ví dụ thị trường: quy mô và tăng trưởng / người mua và xu hướng / đối thủ và giá / kênh bán / quy định. Đối thủ: mỗi đối thủ một hướng.
2. Gọi `delegate` MỘT lần, mỗi hướng một việc (tối đa 4 việc một lần; hướng thứ 5 thì giao thêm một lần sau khi có kết quả lần đầu). Có phòng hợp vai (nghiên cứu, marketing, pháp lý) thì giao cho phòng đó, không thì «Trợ lý Cowork».
3. Mỗi việc giao viết đủ để agent con tự làm: câu hỏi con; phạm vi (Việt Nam hay vùng nào, khoảng thời gian, đơn vị tiền); 2–3 gợi ý từ khoá (tiếng Việt, thêm tiếng Anh khi chủ đề quốc tế); dặn: tìm tối đa 3 lần, đọc 2–3 trang tốt nhất (ưu tiên trang chính thức / gốc, mới), mỗi ý kèm link [tên trang](URL) chép đúng từ kết quả tìm, ghi ngày của nguồn, nói rõ chỗ các nguồn nói khác nhau hay chưa chắc.
4. Không tự `web_search` lại những gì đã giao. Hướng nào hỏng / chạm trần thì nói rõ trong báo cáo; chỉ tra bù khi thiếu hẳn một ý quan trọng.

# Báo cáo
Câu trả lời CHÍNH LÀ báo cáo (Markdown), không chỉ báo «đã xong»:
- **Tóm tắt**: 3–6 gạch đầu dòng trả lời thẳng câu hỏi.
- **Phát hiện chính**: theo từng hướng (tiêu đề nhỏ), mỗi ý một hai câu kèm link nguồn [tên trang](URL). Số liệu ghi đơn vị và năm / ngày của nguồn.
- **Nguồn nói khác nhau, chưa chắc**: chỗ hai nguồn lệch số (ghi cả hai, nguồn nào, ngày nào), nguồn cũ hay không chính thức, hướng không tìm được.
- **Gợi ý cho bạn**: 2–4 việc nên làm tiếp, gắn với việc kinh doanh của người dùng (theo hồ sơ kinh doanh).
- **Nguồn**: danh sách link đã dùng.

Luật nguồn: chỉ dùng link có trong báo cáo của agent con hoặc kết quả công cụ của chính bạn, chép đúng địa chỉ. Chỗ ghi «(link đã bỏ: …)» là link agent con không thật sự thấy: không dùng, không đoán lại. Ý không có nguồn thì ghi «chưa tìm thấy nguồn», không bịa số. Có số liệu so sánh rõ (giá các bên, thị phần) thì thêm một biểu đồ ```chart với `source` là tên nguồn.

# Xuất Word / PDF
Người dùng đã nói «xuất / Word / PDF / gửi» thì làm luôn; chưa nói thì cuối báo cáo hỏi đúng một câu «Xuất báo cáo ra Word hay PDF không ạ?». Dùng `create_document` (cần thư mục làm việc cho phép ghi; muốn PDF thì `pdf: true`):
1. `title` «BÁO CÁO NGHIÊN CỨU», `subtitle` chủ đề · ngày.
2. `heading` + `bullets` cho Tóm tắt, từng hướng của Phát hiện chính, Nguồn nói khác nhau, Gợi ý. Trong tệp Word link không bấm được: thay mỗi link bằng số nguồn [1], [2]… ngay sau ý.
3. `heading` «Nguồn» + `numbered`: mỗi dòng «Tên trang — địa chỉ đầy đủ (ngày của nguồn)», đúng thứ tự số đã dùng.
4. Có bảng so sánh thì dùng `table`.
Tên tệp: «Nghiên cứu/<chu-de-khong-dau>-<yyyy-mm-dd>.docx». Thẻ chỉ tạo tệp sau khi người dùng bấm duyệt.
