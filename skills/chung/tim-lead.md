---
name: tim-lead
title: Tìm khách doanh nghiệp theo ngành, tỉnh và số chi nhánh
description: Dùng khi người dùng muốn tìm khách hàng doanh nghiệp, brand, chuỗi theo ngành và tỉnh, có từ N chi nhánh trở lên, kèm website, trang mạng xã hội, liên hệ công khai của doanh nghiệp, đưa về bảng để duyệt rồi tạo Leads.
command: /timlead
category: khai-thac
starters:
  - Tìm chuỗi nha khoa ở Hà Nội có từ 3 chi nhánh
  - Tìm 20 brand trà sữa ở TP.HCM từ 5 chi nhánh trở lên
  - Tìm chuỗi spa cả nước từ 10 điểm, lấy web và fanpage
---

# Trước khi tìm
1. Ngành, tỉnh, số chi nhánh tối thiểu, số lượng là do người dùng quyết. Thiếu NGÀNH thì hỏi một câu rồi dừng. Thiếu tỉnh: tìm cả nước. Thiếu số chi nhánh: dùng 3 và nói rõ. Thiếu số lượng: 20.
2. Việc này chỉ TÌM, SÀNG, LƯU. Không tự kết bạn, không gửi Zalo hay email cho brand lạ. Người dùng nhờ soạn lời chào thì soạn nháp để họ tự gửi qua kênh công khai của brand.

# Các bước, làm một mạch
1. `lead_find_brands`: `keywords` gồm chữ tiếng Việt và chữ loại hình tiếng Anh (vd ["nha khoa", "dental clinic"]), `province`, `min_places` theo số người dùng nói, `limit` lớn hơn số cần một chút (có brand sẽ rụng). Chưa có `lead_find_brands` hoặc báo chưa có dữ liệu địa điểm: đề xuất thẻ `lead_places_install` (khoảng 100 MB, không tốn tiền) rồi dừng, chờ người dùng bấm và nhắn tiếp.
   Người dùng muốn lấy từ Google Maps, hoặc `lead_find_brands` ra quá ít: đề xuất thẻ `lead_maps_search` (mỗi thẻ tối đa 5 lượt tìm; thành phố lớn thì chia theo quận / huyện nhưng vẫn trong 5 lượt; từ khoá, khu vực, số lượng theo lời người dùng) rồi dừng, chờ người dùng bấm. Thẻ xong thì `lead_maps_results` (`min_listings` theo số chi nhánh người dùng nói), đi tiếp bước 2 với website của từng brand. Google chặn thì báo rõ đã giữ bao nhiêu điểm, KHÔNG đề xuất chạy lại.
2. Mỗi brand: `lead_check_site` với website của brand. Nhiều hơn 6 brand thì giao agent con bằng `delegate` (mỗi việc tối đa 5 brand, tối đa 4 việc một lần), dặn agent con gọi `lead_check_site` và trả lại nguyên văn `site_ref`, website, kết quả chi nhánh của từng brand.
3. Sàng: `branches.count` ≥ ngưỡng là đạt. `status` «unknown» là CHƯA RÕ: không đoán, không suy từ dữ liệu địa điểm, vẫn lưu để người dùng xem. Trang chỉ có trên Facebook hay web không còn thì bỏ, nói rõ lý do.
4. Danh sách nằm ở trang khác: được đọc thêm bằng `web_fetch` (trang dựng bằng JavaScript thì `lead_check_site` đã tự mở). Thấy trang ghi số chi nhánh thì truyền `branches` {count, quote, url} ở thẻ lưu, `quote` chép nguyên văn từ trang.
5. `lead_save_brands`: mỗi thẻ tối đa 30 brand, dùng `site_ref`, brand lấy từ Google Maps thêm `maps_ref`; điểm Google Maps không có web riêng chỉ truyền `maps_ref`. Không tự gõ số điện thoại hay email. Bảng mặc định «Tìm lead».
6. Trả lời ngắn: bao nhiêu brand đạt, bao nhiêu chưa rõ, bao nhiêu bị bỏ và vì sao; nhắc người dùng xem bảng, đặt cột Trạng thái, rồi nói brand nào tạo lead.

# Khi người dùng chốt brand
`query_data_table` lấy `row_id`, rồi mỗi brand một thẻ `create_lead` có `lead_row` {table, row_id}. App tự chép tên, hotline, email chung, tỉnh, nguồn, link bằng chứng từ dòng. Không điền tay các trường đó.

# Không bao giờ
- Không đọc Google Maps bằng trình duyệt hay `web_fetch`: chỉ qua thẻ `lead_maps_search` người dùng bấm. Không đăng nhập rồi đọc Facebook, LinkedIn, TikTok, không mở trang Zalo cá nhân.
- Không tìm, không ghi số di động, Zalo số điện thoại, email có tên người, tên chủ quán. Công cụ đã lọc: đừng tìm cách lấy lại qua `web_fetch`.
- Brand báo không muốn liên hệ: đề xuất thẻ `lead_opt_out`. Brand trong danh sách đó không đưa lại vào bảng hay Leads.
- Không nói một brand có bao nhiêu chi nhánh nếu không có link bằng chứng trên web chính chủ.
