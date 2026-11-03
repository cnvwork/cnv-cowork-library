---
name: chan-doan-quang-cao
title: Chẩn đoán quảng cáo theo đơn thật
description: Dùng khi người dùng hỏi quảng cáo Facebook / Google đang chạy có hiệu quả không, chiến dịch nào nên giữ, sửa, giảm hay tắt, vì sao tin nhắn nhiều mà ít đơn. Đọc số của hãng, đối chiếu đơn và lead thật trong CRM (ROAS thật, chi phí mỗi lead thật), tìm chỗ hở trong phễu, đề xuất từng việc; mọi thay đổi ngân sách và tắt chiến dịch đi qua thẻ duyệt.
command: /chandoanqc
category: quan-ly
starters:
  - Quảng cáo 7 ngày qua, chiến dịch nào nên giữ, cái nào nên tắt?
  - Tin nhắn nhiều mà ít đơn, chẩn đoán giúp
  - Tính ROAS thật tháng này theo đơn bán hàng
---

# Nguyên tắc
- **Quyết bằng đơn và khách thật, không bằng số hãng báo.** «Kết quả» hãng đếm (tin nhắn, lead, lượt mua theo pixel) có thể trùng, ảo hoặc thiếu. Tin nhắn rẻ mà không ra đơn thì vẫn là lỗ.
- Luôn ghi nguồn số, khoảng ngày, tiền tệ. Khoảng có hôm nay thì ghi «hôm nay chưa hết ngày, số còn đổi».
- Thiếu số thì nói thiếu, không đoán, không lấy «mức chuẩn ngành» không nguồn.
- Chỉ đề xuất. Mọi thay đổi qua thẻ: `ads_set_budget` (đổi ngân sách, người dùng bấm duyệt trên máy), `ads_pause` (tạm dừng). Không bật lại chiến dịch (`ads_enable`) khi người dùng không yêu cầu.

# 1. Hỏi một lần (chỉ phần còn thiếu)
- Khoảng ngày: mặc định 7 ngày đã trọn (không tính hôm nay); muốn thấy xu hướng thì 14–30 ngày.
- Mục tiêu: bán hàng (đơn), thu lead (số điện thoại), tin nhắn, hay chỉ để nhiều người biết.
- Kinh tế một đơn: giá trị đơn trung bình, lãi gộp % (sau giá vốn, phí giao, phí sàn; chưa trừ quảng cáo), tỉ lệ hoàn / huỷ thật. Thu lead: tỉ lệ lead thành đơn.
- Đơn từ quảng cáo ghi ở đâu: Đơn bán hàng trong Cowork, phần mềm bán hàng / sàn khác, sổ tay.
Có rồi thì đọc lại bằng `search_brain` («kinh tế quảng cáo»); người dùng đồng ý thì lưu bằng `save_brain_note` (tên gợi ý «Kinh tế quảng cáo») để lần sau khỏi hỏi.

# 2. Lấy số
1. `ads_list_accounts`: tài khoản, tiền tệ, trần chi / ngày và / tháng người dùng đặt, vấn đề của tài khoản (thanh toán lỗi, bị hạn chế). Tài khoản có vấn đề thì báo và chỉ chỗ xử lý trên trang của hãng, không chẩn đoán tiếp tài khoản đó.
2. `ads_report` theo khoảng ngày: chi, hiển thị, nhấp, CTR, CPC, kết quả, chi phí mỗi kết quả theo chiến dịch. Gọi lần hai cho kỳ trước cùng độ dài (`since` / `until`) để so. Số lưu trên máy tối đa 30 ngày.
3. `ads_list_campaigns` (thêm `include_adsets` khi ngân sách nằm ở nhóm quảng cáo): trạng thái, ngân sách hiện tại, `platform_id` để soạn thẻ.
4. Số thật:
   - **Đơn**: `list_invoices` với `limit` 20 trả tối đa 20 đơn mới nhất. Cộng đơn trong kỳ, bỏ đơn «Nháp» và «Đã hủy bỏ». Cả 20 đơn đều nằm trong kỳ nghĩa là còn đơn cũ hơn chưa thấy: hỏi người dùng tổng số đơn, doanh thu của kỳ (trang Đơn bán hàng, phần mềm bán hàng, sàn).
   - **Lead**: `search_leads` với chữ nguồn (vd «Facebook», «Google») và `limit` 20, đếm lead tạo trong kỳ, bỏ lead «Không đủ điều kiện» (rác, trùng, sai số). Cả 20 lead đều trong kỳ thì như trên, hỏi người dùng số ở trang Leads.
   - **Đơn nào do quảng cáo**: chỉ tính khi biết nguồn (nguồn lead, ghi chú, người dùng xác nhận). Không tách được thì tính «ROAS cả shop» và ghi rõ, không gọi đó là ROAS quảng cáo.
Cowork đọc được số theo chiến dịch, chưa có số từng mẫu quảng cáo và giá trị mua hãng ghi. Cần thì nhờ người dùng xuất báo cáo từ trình quản lý quảng cáo (tệp .xlsx hoặc .csv) vào Thư mục làm việc rồi đọc bằng `workspace_read`.

# 3. Tính
- **ROAS thật** = doanh thu đơn thật (không nháp, không huỷ) gắn được với quảng cáo ÷ chi.
- **ROAS ròng** = ROAS thật × (1 − tỉ lệ hoàn / huỷ). Chưa biết tỉ lệ thì ghi «chưa trừ hoàn / huỷ». Đơn mới còn đang giao nên ROAS ròng của mấy ngày gần nhất là mức thấp nhất, sẽ còn đổi.
- **ROAS hoà vốn** = 1 ÷ lãi gộp. Vd lãi gộp 40% thì hoà vốn ở ROAS 2,5. Mục tiêu do người dùng đặt; chưa có thì gợi ý hoà vốn × 1,3 và hỏi lại.
- **Mức chi chấp nhận cho một đơn** = giá trị đơn trung bình × lãi gộp (chi hơn mức này là lỗ đơn đó).
- **CPL báo cáo** = chi ÷ kết quả hãng đếm; **CPL thực** = chi ÷ lead thật (liên lạc được, không trùng, không rác). CPL thực cao hơn CPL báo cáo từ 1,5 lần trở lên là dấu hiệu nhiều lead ảo / trùng / sai đối tượng: xem lại mẫu form, câu hỏi lọc, đối tượng.
- **Tỉ lệ chốt** = đơn ÷ tin nhắn (hoặc ÷ lead).
- Số hãng báo (lượt mua, ROAS trong trình quản lý quảng cáo) chỉ để tham khảo, ghi kèm chữ «hãng báo».

# 4. Tìm chỗ hở trong phễu
Đi từ trên xuống, dừng ở chỗ hở đầu tiên; sửa chỗ đó trước khi bàn chuyện tăng tiền.
1. **Chi ít hơn ngân sách nhiều, hiển thị thấp** → phân phối: đối tượng quá hẹp, mẫu chưa được duyệt / bị từ chối, giá thầu thấp. Kiểm trạng thái duyệt, nới đối tượng.
2. **Hiển thị nhiều, CTR thấp** → mẫu không dừng được người xem: câu mở, hình 3 giây đầu, ưu đãi không rõ. Làm góc mới (`/thu10goc`), không tăng tiền.
3. **Nhấp nhiều, ít tin nhắn / lead** → trang đích hoặc form: chậm, nói khác quảng cáo, form dài, nút khó thấy. Sửa trang, rút form.
4. **Tin nhắn / lead nhiều, ít đơn** → khâu bán: trả lời chậm, báo giá không rõ, khách sai đối tượng, lead ảo. Xem thời gian trả lời, kịch bản chốt (`/chotdon`), câu lọc khách, CPL thực.
5. **Có đơn nhưng hoàn / huỷ cao** → hứa quá lời, mô tả sai, giao chậm, khách nhận hàng chưa chắc. Sửa lời quảng cáo, xác nhận đơn trước khi giao.
6. **Đang tốt rồi xấu dần, CTR giảm, chi phí mỗi kết quả tăng** → mẫu đã mòn. Thay mẫu mới, giữ đối tượng.
Số nhỏ (vài chục nhấp, 1–2 đơn) thì ghi «chưa đủ số để chắc». Không kết luận theo một ngày.

# 5. Xếp loại từng chiến dịch (hoặc nhóm quảng cáo)
Chỉ xếp loại chiến dịch đã chạy ít nhất 3 ngày và không bị sửa lớn (ngân sách, đối tượng, mẫu) trong 48–72 giờ qua; còn lại ghi «Chờ đủ số».
- **Giữ, có thể tăng**: ROAS ròng đạt mục tiêu, có ít nhất 3 đơn thật trong kỳ (shop ít đơn, giá cao thì xét theo lead đạt), số ổn ít nhất 3 ngày liền, đang tiêu hết ngân sách. Tăng theo luật của `/ngansach`: mỗi lần tối đa +20–30%, cách nhau 2–3 ngày.
- **Giữ, chưa tăng**: đạt mục tiêu nhưng chưa đủ đơn, hoặc chưa tiêu hết ngân sách (tăng cũng không tiêu thêm).
- **Sửa**: ROAS ròng giữa hoà vốn và mục tiêu, hoặc đầu phễu tốt mà ít đơn. Sửa đúng chỗ hở ở mục 4, giữ ngân sách.
- **Giảm**: dưới hoà vốn nhưng vẫn có đơn. Giảm 20–50%, sửa chỗ hở, xem lại sau 3 ngày.
- **Tắt**: đã tiêu từ 2 lần mức chi chấp nhận cho một đơn trở lên mà chưa có đơn thật nào; hoặc dưới hoà vốn hai kỳ liền dù đã sửa.
Các ngưỡng trên là mặc định. Đơn giá, biên lãi, chu kỳ mua mỗi shop khác nhau: hỏi người dùng có ngưỡng riêng không và dùng ngưỡng của họ. Chiến dịch livestream, thương hiệu, nuôi tệp (không bán trực tiếp) thì không xếp theo ROAS, chỉ báo số và hỏi mục tiêu của chúng.

# 6. Đề xuất và thẻ duyệt
Bảng: Chiến dịch | Chi | Kết quả hãng báo | Đơn / lead thật | ROAS thật / ròng | CPL thực | Xếp loại | Việc cụ thể. Một dòng tóm tắt: giữ mấy, sửa mấy, giảm mấy, tắt mấy; tổng ngân sách / ngày trước và sau đề xuất.
Hỏi người dùng muốn làm việc nào. Khi họ đồng ý:
- **Đổi ngân sách**: mỗi chiến dịch / nhóm một thẻ `ads_set_budget`, `reason` ghi số chứng minh (vd «ROAS ròng 3,1 ≥ mục tiêu 2,8; 6 đơn thật; ổn 4 ngày»). Thẻ chỉ duyệt được trên máy. Tăng vượt trần chi / ngày, hoặc tài khoản chưa đặt trần, thì thẻ bị từ chối: chỉ người dùng tự đặt / nâng ở Quảng cáo › Tài khoản, menu «⋯» › «Trần chi…».
- **Tạm dừng**: thẻ `ads_pause` (duyệt được ở mọi kênh).
- **Sửa mẫu, trang, khâu bán**: chuyển sang `/thu10goc`, `/vietbai`, `/chotdon`, hoặc ghi thành việc cần làm.
Không dồn nhiều thay đổi làm tăng chi vào cùng một lúc. Cowork không sửa đối tượng, giá thầu, mẫu quảng cáo: chỉ hướng dẫn người dùng tự làm trong trình quản lý quảng cáo.

# 7. Xem lại
Hẹn xem lại sau 3 ngày bằng cùng câu lệnh, so với lần này. Muốn có báo cáo mỗi sáng thì tạo Việc tự động ở Agent › Việc tự động: việc tự động chỉ đọc số và báo; tăng ngân sách luôn cần người dùng bấm duyệt trên máy.
