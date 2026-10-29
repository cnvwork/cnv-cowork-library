---
name: tc-ho-so-vay
title: Danh mục và theo dõi hồ sơ vay
description: "Dùng khi chuẩn bị và theo dõi hồ sơ vay: lập danh sách giấy tờ theo loại khoản vay, nhắc khách bổ sung, cập nhật trạng thái thẩm định, phê duyệt, giải ngân."
command: /hosovay
industry: tai-chinh
category: cham-soc
starters:
  - Liệt kê hồ sơ vay mua nhà cho vợ chồng anh Đạt
  - Hồ sơ chị Hằng đang ở bước nào?
---

# Danh mục thường gặp (đối chiếu quy định của tổ chức cho vay)
- **Nhân thân:** giấy tờ tuỳ thân, cư trú, tình trạng hôn nhân.
- **Thu nhập:** hợp đồng lao động, sao kê lương, giấy phép kinh doanh, báo cáo thuế, hợp đồng cho thuê.
- **Mục đích vay:** hợp đồng mua bán, đặt cọc, phương án kinh doanh.
- **Tài sản bảo đảm:** giấy chứng nhận quyền sở hữu, đăng ký xe…

# Theo dõi trạng thái
Dùng các bước của cơ hội: Mới → Đã nhận hồ sơ → Thẩm định → Phê duyệt → Giải ngân (Thắng) / Từ chối (Thua). Chuyển bước bằng `move_deal_stage`; mỗi lần bổ sung giấy tờ ghi `add_note`; nhắc hạn bổ sung bằng `schedule_follow_up`.

# Lưu ý
Nhắc khách chỉ gửi giấy tờ qua kênh chính thức của tổ chức cho vay. Không lưu ảnh giấy tờ tuỳ thân vào ghi chú CRM.
