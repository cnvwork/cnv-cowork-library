---
name: thu-10-goc-quang-cao
title: Thử 10 góc quảng cáo
description: Dùng khi người dùng muốn tìm mẫu quảng cáo thắng cho một sản phẩm, thấy quảng cáo đang mòn, hoặc muốn thử nhiều ý một lúc trên Facebook / Instagram. Dựng một nhóm quảng cáo với 10 mẫu theo 10 góc khác nhau, viết sẵn chữ và mô tả hình, ghi kế hoạch thử trước khi chạy (mỗi lần chỉ đổi một thứ, chỉ số chính, ngưỡng thắng / dừng), rồi đọc kết quả và chọn mẫu giữ.
command: /thu10goc
category: noi-dung
starters:
  - Thử 10 góc quảng cáo cho nồi chiên không dầu
  - Mẫu quảng cáo cũ mòn rồi, lên bộ 10 góc mới giúp
  - Đọc kết quả bộ thử 10 góc tuần trước
---

# Cách thử
Một chiến dịch, **một nhóm quảng cáo**, **mười mẫu**, mỗi mẫu một góc nói khác hẳn nhau. Nhóm để đối tượng rộng (vùng giao hàng thật, độ tuổi thật của khách, không chồng sở thích nhỏ lẻ), vị trí tự động, ngân sách đặt ở cấp nhóm để biết chắc mỗi ngày tiêu bao nhiêu. Facebook / Instagram ngày nay tự tìm người xem dựa nhiều vào chính nội dung mẫu, nên đổi góc nói thường mở ra nhóm khách mới nhanh hơn chia nhỏ đối tượng.
Hệ thống sẽ dồn tiền cho vài mẫu nó đoán tốt. Mẫu ít được chi không có nghĩa là dở, chỉ là chưa được thử đủ.

# 1. Hỏi một lần (chỉ phần còn thiếu)
Sản phẩm (giá, ưu đãi thật từ `search_products`), khách là ai, nỗi lo và mong muốn chính, bằng chứng có thật (đánh giá đã xin phép, số đơn thật, chứng nhận, chính sách đổi trả), mục tiêu (tin nhắn, đơn, lead), ngân sách thử mỗi ngày và số ngày, mẫu đang chạy tốt nhất (làm mẫu đối chứng), mức chi chấp nhận cho một kết quả (xem `/chandoanqc`).
Có câu hỏi thật của khách thì đọc trước bằng `/tuinbox`: góc lấy từ lời khách thường trúng hơn góc nghĩ ra.

# 2. Mười góc: năm câu khách tự hỏi, mỗi câu hai cách trả lời
Trước khi mua, khách lướt qua quảng cáo tự hỏi năm câu; mỗi mẫu trả lời đúng một câu, theo một cách. Cùng sản phẩm, cùng ưu đãi, cùng trang đích / nút, để biết chắc khác biệt đến từ góc nói.
| Câu khách tự hỏi | Mã | Góc | Mẫu nói gì |
|---|---|---|---|
| «Tôi có cần không?» | G01 | Chuyện hằng ngày | Tình huống khó chịu khách hay gặp, sản phẩm xuất hiện gỡ nó |
| | G02 | Cảnh sau khi có | Cuộc sống / công việc sau khi dùng: cụ thể, thấy được, đúng sự thật |
| «Nó làm được thật không?» | G03 | Làm thử trước mắt | Quay / chụp cách dùng trong 3 bước, thấy sản phẩm chạy thật |
| | G04 | Cách đang làm và cách mới | Cách khách đang xoay xở so với dùng sản phẩm (không nêu tên hãng khác) |
| «Có hợp với tôi không?» | G05 | Câu hỏi hay gặp | Mở bằng câu khách hỏi nhiều nhất trong tin nhắn, trả lời thẳng |
| | G06 | Hợp ai, chưa hợp ai | Nói rõ ai nên mua, ai chưa nên; khách tự biết đang ở nhóm nào |
| «Tin được không?» | G07 | Khách thật nói | Đánh giá thật đã xin phép (che tên nếu khách muốn), số đơn có nguồn |
| | G08 | Hậu trường | Người làm, nguồn hàng, cách đóng gói, cửa hàng thật |
| «Sao phải mua lúc này, ở đây?» | G09 | Ưu đãi thật | Quà, giá, miễn phí giao, hạn có thật |
| | G10 | Bớt rủi ro | Đổi trả, bảo hành, dùng thử, kiểm hàng trước khi trả tiền: điều shop thật sự làm |
Sản phẩm sức khoẻ, làm đẹp, tài chính: G02 không dùng ảnh trước – sau trên cơ thể, không hứa kết quả. Góc nào thiếu chất liệu thật (chưa có đánh giá cho G07, chưa có chính sách cho G10) thì bỏ, thay bằng cách trả lời khác cho cùng câu hỏi, và nói rõ với người dùng.

# 3. Mỗi mẫu gồm
- **Câu mở**: 2 dòng đầu trên điện thoại (video: 3 giây đầu).
- **Chữ chính**: ý chính nằm trong khoảng 125 ký tự đầu, phần sau bị gập «Xem thêm».
- **Tiêu đề** ngắn, đọc hết không bị cắt; **nút**: Gửi tin nhắn / Mua ngay / Đăng ký.
- **Hình / video**: tả cảnh, chữ trên hình (ít chữ), khổ 4:5 hoặc 9:16. Người dùng muốn thì đề xuất `generate_image` (thẻ có phí); video dùng `/video`.
- **Tên mẫu**: «G01 Chuyện hằng ngày – <sản phẩm>» để đọc kết quả khỏi nhầm. Mẫu tin nhắn thì mỗi mẫu một câu chào / câu hỏi gợi ý riêng, nhìn tin đầu của khách là biết khách đến từ mẫu nào.
Số liệu, lời khen, «bán chạy» chưa có nguồn: ghi **[cần kiểm]** để người dùng xác nhận, không tự điền.

# 4. Ghi kế hoạch thử trước khi chạy
Đưa bảng cho người dùng duyệt; khuyên lưu bằng `save_brain_note` (tên gợi ý «Thử góc – <sản phẩm> – <tháng>») để lúc đọc kết quả không ai đổi luật.
- **Câu hỏi cần trả lời** và việc sẽ làm khi có câu trả lời: «Góc nào ra đơn rẻ nhất cho sản phẩm này? Mẫu thắng chuyển sang chiến dịch chính.»
- **Chỉ đổi một thứ**: góc nói. Giữ nguyên đối tượng, ngân sách, vị trí, ưu đãi, trang đích, nút.
- **Đối chứng**: mẫu đang chạy tốt nhất (nếu có), để trong cùng nhóm.
- **Chỉ số chính**: chi phí mỗi kết quả thật (đơn, lead đủ điều kiện, tin nhắn có hỏi mua). Không chọn theo lượt thích hay lượt xem.
- **Chỉ số phụ** (để hiểu vì sao): CTR, chi phí mỗi tin nhắn, tỉ lệ xem hết 3 giây với video.
- **Tiền và thời gian**: chạy ít nhất 3–4 ngày trọn, không sửa giữa chừng; tổng tiền thử nên đủ để cả nhóm có khoảng 20–30 kết quả (cỡ 20–30 lần mức chi chấp nhận cho một kết quả). Ít tiền hơn thì thử 5 góc thay vì 10.
- **Ngưỡng thắng**: chi phí mỗi kết quả thấp hơn đối chứng (hoặc trung bình nhóm) từ 20% trở lên, với ít nhất 5 kết quả.
- **Ngưỡng dừng sớm**: mẫu đã tiêu từ 2 lần mức chi chấp nhận trở lên mà chưa có kết quả nào thì tắt mẫu đó. Mẫu nằm trong cùng nhóm nên người dùng tắt tay trong trình quản lý quảng cáo (`ads_pause` chỉ dừng được cả chiến dịch / cả nhóm).
- **Điều làm hỏng phép thử**: sửa mẫu, đối tượng, ngân sách giữa chừng; thêm mẫu mới vào nhóm; mẫu bị từ chối duyệt; trùng đợt sale lớn. Có thì ghi lại, kết quả coi như không dùng được.

# 5. Lên chiến dịch
Cowork chưa tạo được chiến dịch / mẫu quảng cáo. Đưa người dùng bảng dựng: tên chiến dịch, mục tiêu, tên nhóm, ngân sách / ngày, vùng, tuổi, 10 mẫu G01–G10 (chữ, tiêu đề, nút, tệp hình); họ tạo trong trình quản lý quảng cáo và bật cả 10 mẫu cùng lúc. Chiến dịch đã có trên tài khoản đã nối thì xem bằng `ads_list_campaigns`; đổi ngân sách nhóm chỉ khi người dùng yêu cầu, qua thẻ `ads_set_budget`.

# 6. Đọc kết quả (sau thời gian đã ghi)
1. `ads_report` chỉ có số theo chiến dịch. Số từng mẫu: người dùng xuất báo cáo cấp quảng cáo (.xlsx hoặc .csv) vào Thư mục làm việc để đọc bằng `workspace_read`, hoặc dán bảng / gửi ảnh chụp.
2. Ghép với đơn, lead thật (`list_invoices`, `search_leads`) khi biết khách đến từ mẫu nào (tên mẫu, câu chào riêng).
3. Chỉ dùng ngày đã trọn. Mẫu được chi dưới 1 lần mức chi chấp nhận ghi «chưa đủ số», không gọi là thua.
4. Xếp mỗi mẫu: **Thắng** (đạt ngưỡng đã ghi), **Thua** (tệ hơn rõ hoặc chạm ngưỡng dừng), **Không khác biệt**, **Chưa đủ số**, **Hỏng phép thử**.
5. Mẫu thắng: nhân bản sang chiến dịch chính, giữ nguyên chữ và hình; tăng tiền theo `/ngansach`. Góc thắng: làm 3–5 cách thể hiện mới cho vòng sau (câu mở khác, hình khác), vòng sau cũng chỉ đổi một thứ.
6. Ghi kết quả vào cùng ghi chú Bộ não, kể cả góc thua và «không khác biệt», để lần sau khỏi thử lại điều đã biết.

# Không được
- Không tuyên bố mẫu thắng từ số một ngày, trước thời gian đã ghi, hay khi chưa đạt ngưỡng. Không đổi ngưỡng sau khi đã xem số.
- Không bịa đánh giá, số khách, «hàng nghìn người đã dùng».
- Không lách bộ duyệt của nền tảng bằng chữ biến dạng, ký tự lạ; câu nào có thể vi phạm chính sách thì sửa cho đúng sự thật.
- Không tự bật hay tăng chi. Thẻ `ads_set_budget` chỉ duyệt trên máy.
