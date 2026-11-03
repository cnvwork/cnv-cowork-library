---
name: viet-bai-ban-hang
title: Viết bài đăng bán hàng
description: Dùng khi người dùng cần bài đăng hoặc chữ quảng cáo Facebook, Zalo, TikTok hay sàn thương mại điện tử để giới thiệu sản phẩm, dịch vụ, khuyến mãi hoặc kể chuyện khách hàng. Viết 3 góc A / B / C để chọn hoặc chạy thử, câu mở theo mức độ khách đã biết về sản phẩm, gắn nhãn [cần kiểm] cho số liệu chưa có nguồn.
command: /vietbai
category: noi-dung
starters:
  - Viết bài Facebook giới thiệu gói chăm sóc da mới
  - Viết caption TikTok cho căn hộ 2 phòng ngủ view sông
  - Viết 3 bản quảng cáo cho combo khai trương, mỗi bản một góc
---

# Hỏi trước (chỉ hỏi phần còn thiếu)
- Đăng ở đâu: trang Facebook, nhóm Facebook, Zalo, TikTok, Shopee / Lazada; bài thường hay chữ chạy quảng cáo.
- Nói về gì: sản phẩm nào (tra giá bằng `search_products`), khuyến mãi gì, hạn tới bao giờ.
- Cho ai, và người đó đã biết tới đâu (bảng dưới). Lấy từ hồ sơ kinh doanh; bài nhắm nhóm khác thì hỏi thêm.

# Câu mở theo mức độ quen của khách
| Khách đang ở đâu | Câu mở nên | Khung gợi ý |
|---|---|---|
| Chưa nhận ra có vấn đề | Một tình huống đời thường họ gặp | «Chiều nào về nhà cũng …?» |
| Biết vấn đề, chưa biết cách | Gọi đúng nỗi lo, hé cách giải | «… mà không cần …» |
| Đang so các cách, các bên | Tiêu chí để chọn, điểm khác có thật | «Chọn … thì nhìn 3 điều này» |
| Biết shop, còn ngại | Bằng chứng, gỡ đúng nỗi ngại | «Sợ … ? Shop làm thế này» |
| Sắp mua | Ưu đãi, giá, cách đặt, hạn thật | «Giá … tới hết ngày …, đặt bằng cách …» |
Quảng cáo cho người lạ thường lùi một bậc so với bài trên trang; tin cho khách cũ hoặc người đã nhắn tin thì tiến một bậc.

# Ba góc A / B / C
Mặc định viết cả ba để người dùng chọn hoặc chạy thử. Cùng sản phẩm, cùng ưu đãi, cùng lời kêu gọi; chỉ khác góc:
- **A – Nỗi lo**: mở bằng vấn đề khách đang gặp, sản phẩm là cách gỡ.
- **B – Kết quả**: mở bằng cảnh sau khi dùng hoặc lợi ích chính, nói cụ thể.
- **C – Bằng chứng**: mở bằng khách thật (đã đồng ý), số đơn thật, chứng nhận, chính sách đổi trả có thật.
Không có bằng chứng thật cho C thì thay bằng góc «câu hỏi hay gặp» (lấy câu hỏi thật bằng `/tuinbox`) và nói rõ vì sao. Muốn thử nhiều góc có kế hoạch, ngưỡng thắng rõ ràng: `/thu10goc`.

# Thân bài
1. **Câu mở** 1–2 dòng, theo bảng trên.
2. **Vấn đề hoặc mong muốn** của khách.
3. **Giải pháp**: sản phẩm / dịch vụ, 3 lợi ích chính viết thành gạch đầu dòng ngắn.
4. **Bằng chứng**: khách thật, số liệu thật, chính sách bảo hành. Không có thì bỏ, không bịa.
5. **Ưu đãi** (nếu có) và thời hạn thật.
6. **Một lời kêu gọi**: nhắn tin, gọi số nào, bình luận gì.

# Số liệu và lời hứa: nhãn [cần kiểm]
Mọi con số, tỉ lệ, «đã có … khách», «bán chạy», kết quả sau khi dùng, so sánh: chỉ viết khi có nguồn (CRM, hồ sơ kinh doanh, kho tri thức, người dùng đưa). Chưa có nguồn thì vẫn để chỗ đó và gắn **[cần kiểm]** ngay sau, cuối bài liệt kê các chỗ cần người dùng xác nhận. Không thay bằng một con số «nghe hợp lý».
Không dùng «cam kết 100%», «tốt nhất», «rẻ nhất», «số 1», «duy nhất» khi không chứng minh được bằng giấy tờ. Không giả đánh giá của khách.

# Theo từng nơi đăng
- **Facebook:** 80–200 chữ, xuống dòng nhiều, ý chính trong 2–3 dòng đầu (phần sau bị gập), 3–5 hashtag ở cuối.
- **Nhóm Facebook:** nặng chia sẻ giá trị, nhẹ chào bán, theo luật của nhóm.
- **Zalo:** ngắn hơn, thân mật, có tên và số điện thoại.
- **TikTok:** caption dưới 150 ký tự, kèm 3–5 hashtag; kịch bản video gợi ý `/livestream`, dựng video gợi ý `/video`.
- **Sàn TMĐT:** tiêu đề có từ khoá, mô tả theo gạch đầu dòng.
- **Quảng cáo Facebook / Instagram:** chữ chính có ý chính trong khoảng 125 ký tự đầu, tiêu đề ngắn đọc hết trên điện thoại, mô tả hình kèm theo (ít chữ trên ảnh), nút kêu gọi phù hợp (Gửi tin nhắn, Mua ngay, Đăng ký).

# Đầu ra
Ba bản A / B / C, mỗi bản ghi mức độ quen đã nhắm và nơi đăng; giọng theo hồ sơ kinh doanh, chữ ký cuối nếu có; danh sách [cần kiểm] nếu có. Người dùng chọn xong mà đã nối kênh đăng thì đề xuất đưa vào Lịch đăng bài bằng thẻ `social_schedule_post`, chỉ khi bài không còn chỗ [cần kiểm].
