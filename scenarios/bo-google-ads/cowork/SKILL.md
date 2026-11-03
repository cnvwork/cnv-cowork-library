---
name: bo-google-ads
title: Bộ Google Ads cho shop nhỏ
description: Dùng khi người dùng chạy hoặc sắp chạy quảng cáo tìm kiếm Google Ads. Bốn việc - lập kế hoạch đo chuyển đổi bằng Google Tag Manager (bấm gọi, Zalo, Messenger, gửi form, thanh toán VNPay / MoMo); viết quảng cáo tìm kiếm thích ứng (RSA) đúng giới hạn ký tự; lập kế hoạch chiến dịch và theo dõi hằng ngày bằng số thật; lọc từ khoá phủ định từ báo cáo cụm từ tìm kiếm.
command: /googleads
category: quan-ly
starters:
  - Lập kế hoạch đo chuyển đổi Google Ads cho web bán nội thất
  - Viết 15 tiêu đề và 4 mô tả cho nhóm quảng cáo sửa máy lạnh
  - Đọc báo cáo cụm từ tìm kiếm tôi vừa tải, lọc từ khoá phủ định
  - Hôm qua Google Ads chạy thế nào, có gì bất thường không?
---

# Chung cho cả bộ
- Tài khoản Google Ads đã nối (Kết nối › Google, quyền Google Ads) thì đọc được: `ads_list_accounts`, `ads_list_campaigns`, `ads_report` (theo chiến dịch, tối đa 30 ngày). Cowork KHÔNG tạo / sửa chiến dịch, nhóm, từ khoá, mẫu quảng cáo, thẻ Tag Manager: người dùng tự làm theo hướng dẫn trợ lý soạn. Đổi ngân sách / tạm dừng chiến dịch: thẻ `ads_set_budget` / `ads_pause`, người dùng bấm duyệt (tăng ngân sách chỉ duyệt trên máy, trong trần chi họ đặt).
- Báo cáo Cowork chưa đọc thẳng (cụm từ tìm kiếm, từ khoá, ý tưởng từ khoá, hành động chuyển đổi): người dùng tải từ Google Ads dạng .xlsx hoặc .csv thường (không chọn «Excel .csv», dạng đó là UTF-16) vào thư mục `bao-cao/` của bộ này. Đọc bằng `workspace_list` rồi `workspace_read` (mỗi lần 12.000 ký tự, đọc tiếp bằng `offset`).
- Kết quả ghi tệp qua thẻ: `create_spreadsheet` (bảng), `create_document` (kế hoạch), `workspace_write_file` (danh sách chữ).
- Không bịa số: CPC, lượng tìm kiếm, tỉ lệ chuyển đổi lấy từ tài khoản, từ Công cụ lập kế hoạch từ khoá (người dùng tải), hoặc ghi «[Giả định]».
- Giao diện Google Ads hay đổi tên mục: tả đúng việc cần làm; người dùng không thấy mục đó thì hỏi họ đang thấy gì.
Chưa rõ người dùng cần việc nào thì hỏi: 1 đo chuyển đổi, 2 viết quảng cáo, 3 kế hoạch / theo dõi, 4 từ khoá phủ định.

# 1. Đo chuyển đổi (làm trước khi tiêu tiền)
Đo sai thì Google tối ưu sai và mọi số phía sau vô nghĩa.
**Hỏi**: địa chỉ web, nền web (WordPress, Haravan, Shopify, Ladipage, tự code), ngành, hành động quan trọng nhất của khách, web đã có Google Tag Manager, Google Analytics 4, thẻ Google Ads chưa, ai cài (người dùng hay người làm web).
**Xem web** bằng `browser_open` (chỉ xem, không gửi form thật): nút gọi (đường dẫn `tel:`), nút Zalo (`zalo.me`), Messenger (`m.me`), khung chat nổi, form và trang / thông báo cảm ơn, giỏ hàng, cổng thanh toán.
**Chọn hành động đo**, mỗi hành động ghi: tên, chính hay phụ, cách đếm, giá trị.
- Chính (Google dùng để tối ưu): đơn mua thành công, gửi form thành công, cuộc gọi (nếu bán chủ yếu qua điện thoại).
- Phụ (chỉ quan sát): bấm gọi, bấm Zalo, bấm Messenger, thêm vào giỏ, bắt đầu thanh toán.
- Bấm Zalo / Messenger / gọi mới là ý định, chưa phải đơn. Shop bán gần như toàn bộ qua đó thì mới để chính, và nhớ rằng CPA lúc này là «chi phí mỗi lần bấm»: đối chiếu đơn thật ở việc 3.
- Cách đếm: form, gọi, lead → «Một» (một lượt nhấp quảng cáo chỉ đếm một); đơn mua → «Mọi», kèm giá trị đơn (VND) và mã đơn để chống đếm trùng.
**Kế hoạch Tag Manager** (bảng: thứ cần đo | trình kích hoạt | điều kiện | thẻ | ghi chú):
- Bấm gọi: trình kích hoạt Nhấp – Chỉ liên kết (Click – Just Links), Click URL bắt đầu bằng `tel:` → sự kiện GA4 `click_call` + chuyển đổi Google Ads phụ. Bật biến Click URL.
- Bấm Zalo: Nhấp – Chỉ liên kết, Click URL chứa `zalo.me` → `click_zalo`.
- Bấm Messenger: Nhấp – Chỉ liên kết, Click URL chứa `m.me` hoặc `messenger.com` → `click_messenger`.
- Khung chat nổi của Zalo OA, Facebook nằm trong iframe: Tag Manager không thấy cú bấm bên trong. Đo bằng nút / đường dẫn riêng mở chat, hoặc sự kiện do mã nhúng phát ra (người làm web kiểm).
- Gửi form: kích hoạt ở trang cảm ơn (Xem trang, đường dẫn trang = trang cảm ơn) hoặc sự kiện lớp dữ liệu (dataLayer) do web phát khi gửi THÀNH CÔNG (vd `generate_lead`). Không đo bằng cú bấm nút gửi: bấm cả khi form lỗi.
- Thanh toán VNPay / MoMo: đo ở trang xác nhận đơn của chính web, sau khi web đã kiểm kết quả từ cổng; sự kiện `purchase` có `value`, `currency` = VND, `transaction_id` = mã đơn. Không đo ở trang chuyển hướng / trang chờ của cổng. Web chỉ có trang trả về từ cổng thì thêm điều kiện mã thành công trên đường dẫn (VNPay `vnp_ResponseCode=00`, MoMo `resultCode=0`) và chống đếm trùng bằng mã đơn (khách tải lại trang).
- Chuyển đổi nâng cao (enhanced conversions): bật trong Google Ads và thẻ Google để gửi email / số điện thoại từ form ở dạng đã băm (mã hoá một chiều), đo đủ hơn khi cookie bị chặn. Web cần câu đồng ý và chính sách dữ liệu cá nhân.
**Kiểm trước khi bật quảng cáo**: Tag Manager › Xem trước (Tag Assistant): bấm từng nút, gửi form thử, mua đơn thử → mỗi thẻ kích hoạt đúng MỘT lần; xuất bản (Submit / Publish) vùng chứa; vài giờ đến một ngày sau, hành động chuyển đổi trong Google Ads phải chuyển sang trạng thái đang ghi nhận.
**Lỗi hay gặp**: hai hành động «mua» cùng để chính (vd nhập từ GA4 và thẻ Google Ads) → đếm đôi; đo cú bấm thay vì gửi thành công; trang cảm ơn vào thẳng được → đếm trùng; quên mã đơn; để bấm Zalo là chuyển đổi chính rồi tưởng CPA rẻ.
**Giao**: `create_spreadsheet` ba sheet «Hành động», «Tag Manager», «Kiểm thử», hoặc `create_document` nếu gửi người làm web.

# 2. Viết quảng cáo tìm kiếm thích ứng (RSA)
**Đầu vào**: nhóm quảng cáo và từ khoá chính (người dùng đưa hoặc từ tệp từ khoá); trang đích (mở bằng `browser_open` để lời quảng cáo khớp trang); sản phẩm, giá / ưu đãi thật (`search_products`); điểm khác biệt có thật; khách gõ từ khoá này đang ở bước nào: muốn mua ngay, đang so, hay tìm hiểu.
**Giới hạn của Google** (đếm từng ký tự; chữ có dấu tính một, dấu cách tính một):
- Tiêu đề: tối đa 15, mỗi cái ≤ 30 ký tự. Mô tả: tối đa 4, mỗi cái ≤ 90 ký tự.
- Đường dẫn hiển thị: 2 ô, mỗi ô ≤ 15 ký tự.
- Đường liên kết trang web (sitelink): chữ ≤ 25, hai dòng mô tả mỗi dòng ≤ 35. Chú thích (callout): ≤ 25. Đoạn thông tin có cấu trúc (structured snippet): mỗi giá trị ≤ 25, tiêu đề đoạn chọn trong danh sách của Google.
**Ba câu người tìm kiếm cần thấy trả lời.** Google tự ghép tiêu đề và mô tả theo nhiều tổ hợp, nên mỗi dòng phải đọc riêng vẫn đủ nghĩa, và cả bộ phải trả lời đủ ba câu:
1. **«Đúng thứ tôi tìm không?»** — khoảng 5 tiêu đề: từ khoá chính hoặc biến thể gần (ít nhất 3 cái), tên sản phẩm / dịch vụ, khu vực phục vụ.
2. **«Sao chọn chỗ này?»** — khoảng 7 tiêu đề: lợi ích cụ thể, điểm khác có thật, cách làm, bảo hành / đổi trả, bằng chứng có nguồn, tên thương hiệu («Lắp Trong Ngày Ở Nội Thành», nếu đúng là làm được).
3. **«Làm gì tiếp?»** — khoảng 3 tiêu đề: ưu đãi thật, giá, lời kêu gọi.
Mười lăm tiêu đề phải khác ý nhau (không chỉ đổi chữ), có cái ngắn, cái dài. **4 mô tả** cũng chia theo ba câu: một cái cho câu 1 kèm lợi ích chính, hai cái cho câu 2, một cái cho câu 3 kèm lời kêu gọi.
**Theo bước của khách**: muốn mua ngay → giá, có sẵn, giao / làm nhanh, lời kêu gọi mạnh; đang so → điểm khác, cam kết; tìm hiểu → hướng dẫn, chưa ép mua (thường để chiến dịch sau).
**Ghim**: chỉ ghim khi bắt buộc (vd tên thương hiệu ở vị trí 1); ghim nhiều làm giảm số tổ hợp Google thử được.
**Hay bị từ chối**: số điện thoại trong chữ (dùng tài sản cuộc gọi); dấu chấm than trong tiêu đề; nhiều hơn một dấu chấm than trong mô tả; viết hoa cả chữ để gây chú ý; ký tự lặp (!!!, ★); «tốt nhất», «số 1» không có chứng minh (luật quảng cáo Việt Nam cũng yêu cầu tài liệu chứng minh hợp lệ khi dùng «nhất», «số một»).
**Tự kiểm trước khi giao**: ghi số ký tự cạnh từng dòng («28/30»); không hai tiêu đề trùng ý; đủ tiêu đề chứa từ khoá; số liệu có nguồn hoặc [cần kiểm].
**Giao**: `create_spreadsheet`, mỗi nhóm quảng cáo một hàng: Chiến dịch | Nhóm | Trang đích | Tiêu đề 1–15 | Mô tả 1–4 | Đường dẫn hiển thị 1–2 | Ghi chú ghim; sheet riêng cho đường liên kết trang web, chú thích. Người dùng dán vào Google Ads hoặc Google Ads Editor.

# 3. Kế hoạch chiến dịch và theo dõi hằng ngày
**Kế hoạch** (tài khoản mới hoặc mở rộng):
- Việc 1 chưa xong (chưa đo được chuyển đổi chính) thì chỉ chạy thử nhỏ để lấy số nhấp, ghi rõ «chưa đo được chuyển đổi».
- Bắt đầu bằng chiến dịch Tìm kiếm cho từ khoá «muốn mua ngay» (giá, mua, đặt, gần đây, tên sản phẩm / dịch vụ cụ thể); từ khoá tìm hiểu để sau. Performance Max, Demand Gen học từ dữ liệu chuyển đổi: chưa nên dùng khi tài khoản chưa có chuyển đổi đều.
- Cấu trúc gọn: ít chiến dịch; mỗi nhóm quảng cáo một chủ đề từ khoá hẹp, trang đích khớp nhóm.
- Từ khoá lấy từ Công cụ lập kế hoạch từ khoá (người dùng tải vào `bao-cao/`), cụm khách gõ thật (báo cáo cụm từ tìm kiếm), câu khách hay hỏi (`/tuinbox`). Từ khoá đắt dùng khớp cụm từ hoặc khớp chính xác; khớp rộng chỉ khi đã có chuyển đổi đều và giá thầu theo chuyển đổi.
- Giá thầu đi từng bậc: chưa có chuyển đổi → tối đa hoá lượt nhấp, đặt giới hạn CPC; chuyển đổi đã đo đúng và có đều mỗi tuần → tối đa hoá lượt chuyển đổi; ổn định nhiều tuần → CPA mục tiêu bắt đầu từ CPA thực tế (có giá trị đơn thì ROAS mục tiêu). Mức số chuyển đổi Google khuyên cho từng chiến lược thay đổi theo thời gian: kiểm trang trợ giúp Google Ads lúc làm. Mỗi lần đổi chiến lược chờ 1–2 tuần mới đánh giá.
- Ngân sách: chi chấp nhận cho một khách (giá trị đơn × lãi gộp) × số khách mục tiêu; kiểm ngân sách ngày đủ cho ít nhất vài chục lượt nhấp theo CPC ước. Không đủ thì thu hẹp từ khoá / vùng, đừng rải mỏng.
- Dự báo: lượt nhấp = ngân sách ÷ CPC ước; chuyển đổi = lượt nhấp × tỉ lệ chuyển đổi (của tài khoản / trang; chưa có thì [Giả định], đưa khoảng thấp – cao). Ghi nguồn từng số.
- Giao: `create_document` (kế hoạch) + `create_spreadsheet` (chiến dịch, nhóm, từ khoá, kiểu khớp, ngân sách).
**Theo dõi hằng ngày** (chỉ đọc và báo):
1. `ads_report` cho hôm qua (ngày đã trọn) và 7 ngày gần nhất; so với 7 ngày trước đó. Hôm nay chưa hết ngày thì chỉ xem chi tiêu.
2. Mỗi chiến dịch: chi so với ngân sách ngày (tiêu thiếu nhiều → từ khoá ít người tìm, giá thầu / chất lượng thấp, mẫu chưa duyệt; tiêu hết sớm → có thể thiếu ngân sách), lượt nhấp, CPC, chuyển đổi, chi phí mỗi chuyển đổi.
3. Báo bất thường khi: chi hôm qua bằng 0 hoặc gấp đôi mức thường; chuyển đổi về 0 hai ngày liền mà lượt nhấp vẫn có (nghi hỏng đo, kiểm lại việc 1); CPC hoặc chi phí mỗi chuyển đổi của 3 ngày gần nhất cao hơn trung bình 4 tuần từ 40% trở lên. Tài khoản chưa đủ 4 tuần số thì chỉ báo hai dấu hiệu đầu. Không gọi là bất thường khi người dùng vừa đổi ngân sách / giá thầu / mẫu trong 2–3 ngày, hoặc chiến dịch mới đang trong 1–2 tuần đầu (dao động là bình thường); ghi rõ thay đổi nào đang làm số dao động.
4. Mỗi tuần đối chiếu đơn / lead thật (`list_invoices`, `search_leads` với nguồn «Google»), cách tính như `/chandoanqc`.
5. Báo 3–5 dòng: tình hình, bất thường, việc nên làm. Muốn ghi theo ngày: lần đầu `create_spreadsheet` sheet «Theo dõi», các lần sau `edit_office_file` thêm dòng. Muốn có báo mỗi sáng: người dùng tạo Việc tự động ở Agent › Việc tự động với lời nhắc «Theo dõi Google Ads hôm qua»; việc tự động chỉ đọc và báo.

# 4. Từ khoá phủ định từ báo cáo cụm từ tìm kiếm
**Lấy báo cáo**: người dùng tải báo cáo cụm từ tìm kiếm 30–90 ngày vào `bao-cao/`. Đọc hết tệp. Cột cần: cụm từ tìm kiếm, chiến dịch, nhóm quảng cáo, hiển thị, lượt nhấp, chi phí, chuyển đổi.
**Hỏi trước khi lọc** (không đoán): sản phẩm / dịch vụ ĐANG bán và KHÔNG bán; khoảng giá; bán lẻ hay sỉ; vùng phục vụ; thương hiệu shop đang làm đại lý (không chặn) và thương hiệu muốn chặn; shop có tuyển người, nhận cộng tác viên không. Cùng một chữ («trả góp», «lắp đặt», «hàng trưng bày», «sỉ») là khách thật với shop này nhưng là tiền mất với shop khác.
**Thống kê nhanh**: tổng số cụm, chi, lượt nhấp, chuyển đổi; 10 cụm tốn tiền nhất; 10 cụm tốn tiền mà không có chuyển đổi.
**Phân loại**: với mỗi cụm hỏi một câu, «người gõ cụm này có thể thành khách trả tiền của shop không?»
- **Có** — cụm có chuyển đổi, hoặc đúng thứ shop bán: giữ; cụm hay thì gợi ý thêm làm từ khoá. Cụm có chuyển đổi mà nghi là chuyển đổi rác thì để «Xem tay», không chặn.
- **Không, vì họ không tìm để mua**: tìm việc, tìm đối tác, tìm đồ miễn phí, tìm kiến thức chung không dẫn tới mua.
- **Không, vì họ tìm thứ shop không có**: sản phẩm / dịch vụ shop không làm, mức giá shop không bán, khu vực shop không phục vụ.
- **Không, vì họ tìm đích danh nơi khác**: tên thương hiệu, cửa hàng khác mà shop không bán.
- **Chưa rõ** — «Xem tay», không tự quyết.
**Rút từ phủ định ngắn**: với mỗi cụm «Không», bỏ phần trùng với sản phẩm / thương hiệu của shop, phần còn lại thường là 1–2 chữ cần chặn («nồi chiên cũ thanh lý» → «thanh lý»). Một từ ngắn chặn được cả loạt cụm cùng kiểu.
**Thử ngược trước khi chốt**: với mỗi từ định chặn, tìm trong CHÍNH tệp này mọi cụm có chứa từ đó. Có cụm nào có chuyển đổi hoặc thuộc sản phẩm đang bán thì từ đó quá rộng: thêm một chữ cho hẹp lại, đổi sang khớp chính xác, hoặc bỏ. Ghi cạnh mỗi từ các cụm trong tệp sẽ bị chặn.
**Kiểu khớp phủ định** (không tự khớp biến thể gần, số nhiều, sai chính tả; có dấu và không dấu là hai từ khác nhau, cần thì thêm cả hai):
- Rộng `từ`: chặn khi cụm tìm kiếm có đủ các chữ, thứ tự bất kỳ.
- Cụm từ `"từ"`: chặn khi có đúng các chữ đó, đúng thứ tự.
- Chính xác `[từ]`: chặn khi cụm tìm kiếm đúng y như vậy.
Chọn kiểu theo kết quả bước thử ngược: từ ngắn chỉ xuất hiện trong cụm rác thì để cụm từ; từ đó cũng nằm trong cụm khách thật thì thu về chính xác, chỉ chặn đúng các cụm rác đã thấy.
**Chặn ở cấp nào**: cụm «không tìm để mua» thường rác với mọi chiến dịch → danh sách từ khoá phủ định dùng chung, gắn vào các chiến dịch; rác riêng một chiến dịch → cấp chiến dịch; hai nhóm tranh nhau một cụm → phủ định ở cấp nhóm.
**Giao**:
- `create_spreadsheet`: Từ phủ định | Kiểu khớp | Lý do | Cấp áp | Cụm trong tệp bị chặn | Chi phí đã tốn | Ghi chú; sheet «Xem tay» (cụm có chuyển đổi đáng ngờ, cụm không rõ); sheet «Từ khoá nên thêm».
- Danh sách dán thẳng vào Google Ads, mỗi dòng một từ, kiểu khớp viết bằng dấu như trên: đề xuất `workspace_write_file` thành `bao-cao/tu-khoa-phu-dinh-<ngày>.txt`.
Người dùng tự thêm vào Google Ads; trợ lý không đẩy lên tài khoản. Nhắc làm lại mỗi 2–4 tuần với báo cáo mới.

# Không được
- Không tạo, sửa, bật chiến dịch hay thẻ Tag Manager hộ người dùng; không hỏi, không nhận mật khẩu, mã truy cập Google.
- Không bịa CPC, lượng tìm kiếm, tỉ lệ chuyển đổi, đánh giá, «số 1».
- Không phủ định cụm có chuyển đổi khi người dùng chưa xem tay.
