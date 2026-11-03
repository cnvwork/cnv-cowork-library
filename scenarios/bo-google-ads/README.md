# Bộ Google Ads cho shop nhỏ

Kỹ năng cho trợ lý CNV Cowork: bốn việc hay làm nhất khi tự chạy quảng cáo tìm kiếm Google. Bộ này chỉ có chữ, không có
mã chạy; trợ lý không sửa gì trên tài khoản Google Ads hay Google Tag Manager của bạn.

## Dùng thế nào

1. Ở Cowork › Thư viện, bấm «Sử dụng» bộ này, để bật «Gắn làm Thư mục làm việc» (cho phép đề xuất ghi) và «Cài kỹ năng».
2. Muốn trợ lý đọc số tự động: Kết nối › Google, bật quyền Google Ads cho tài khoản Google đang quản lý quảng cáo.
3. Trong Trợ lý, gõ `/googleads` kèm việc cần làm:
   - `/googleads Lập kế hoạch đo chuyển đổi cho web bán nội thất <địa chỉ web>`
   - `/googleads Viết 15 tiêu đề và 4 mô tả cho nhóm quảng cáo sửa máy lạnh`
   - `/googleads Lập kế hoạch chiến dịch tháng đầu, ngân sách 10 triệu`
   - `/googleads Hôm qua chạy thế nào, có gì bất thường không?`
   - `/googleads Đọc báo cáo cụm từ tìm kiếm tôi vừa tải, lọc từ khoá phủ định`

## Bốn việc

| Việc | Trợ lý làm | Bạn làm |
|---|---|---|
| Đo chuyển đổi | Xem web, soạn kế hoạch Tag Manager (gọi, Zalo, Messenger, form, VNPay / MoMo), cách kiểm, lỗi hay gặp | Cài theo kế hoạch (hoặc gửi người làm web), kiểm bằng chế độ xem trước, xuất bản |
| Viết quảng cáo (RSA) | 15 tiêu đề, 4 mô tả, đường liên kết trang web, chú thích, đúng giới hạn ký tự | Dán vào Google Ads |
| Kế hoạch + theo dõi | Kế hoạch chiến dịch, giá thầu đi từng bậc; mỗi ngày đọc số, báo bất thường | Tạo chiến dịch; đổi ngân sách qua thẻ duyệt |
| Từ khoá phủ định | Lọc báo cáo cụm từ tìm kiếm, rút từ phủ định, thử ngược | Tải báo cáo vào `bao-cao/`, dán danh sách vào Google Ads |

## Báo cáo bỏ vào đâu

Thư mục `bao-cao/`: báo cáo cụm từ tìm kiếm, báo cáo từ khoá, kết quả Công cụ lập kế hoạch từ khoá. Tải dạng **.xlsx**
hoặc **.csv** thường (dạng «Excel .csv» của Google Ads là UTF-16, trợ lý không đọc được). Xem `bao-cao/README.md`.

## An toàn

- Trợ lý chỉ đọc số. Đổi ngân sách, tạm dừng chiến dịch luôn là thẻ bạn bấm duyệt; tăng ngân sách chỉ duyệt được trên máy và
  phải nằm trong trần chi bạn đặt ở Quảng cáo › Tài khoản.
- Không ghi mật khẩu, mã truy cập Google vào thư mục này. Báo cáo bạn tải có thể chứa dữ liệu kinh doanh: thư mục chỉ nằm
  trên máy bạn.

## Trong thư mục có gì

| Đường dẫn | Là gì |
|---|---|
| `cowork/SKILL.md` | Kỹ năng cho trợ lý (cài cùng lúc tải) |
| `bao-cao/` | Chỗ bỏ báo cáo bạn tải từ Google Ads |
| `manifest.json` | Thông tin bộ (phiên bản, yêu cầu) |
