---
name: oto-bao-gia-lan-banh
title: Báo giá lăn bánh
description: Dùng khi khách hỏi giá lăn bánh. Cộng giá xe, khuyến mãi và các khoản phí đăng ký theo tỉnh thành người dùng cung cấp, lập bảng rõ ràng và tạo báo giá.
command: /lanbanh
industry: o-to
category: tu-van
starters:
  - Giá lăn bánh bản cao cấp ở Hà Nội bao nhiêu?
  - Lập báo giá lăn bánh cho anh Phong, đăng ký ở Bình Dương
---

# Các khoản thường có trong giá lăn bánh
1. Giá xe (giá bán của đại lý, sau khuyến mãi nếu có).
2. Lệ phí trước bạ (tỷ lệ theo tỉnh thành và loại xe).
3. Phí cấp biển số (khác nhau theo khu vực).
4. Phí đăng kiểm, phí bảo trì đường bộ.
5. Bảo hiểm trách nhiệm dân sự bắt buộc.
6. Tuỳ chọn: bảo hiểm vật chất, phụ kiện, phí dịch vụ đăng ký.

# Các bước
1. Hỏi phiên bản xe, nơi đăng ký (tỉnh thành), có lấy bảo hiểm vật chất / phụ kiện không.
2. Giá xe lấy từ `search_products`. **Tỷ lệ trước bạ, phí biển số và các phí khác lấy theo con số người dùng đưa,** vì quy định thay đổi theo thời điểm và địa phương. Người dùng chưa đưa thì hỏi, không tự điền.
3. Lập bảng từng khoản, tổng lăn bánh, ghi "giá tham khảo tại thời điểm báo".
4. Khách đồng ý thì tạo báo giá bằng `create_quotation`: mỗi khoản là một dòng, thuế và phí nhà nước để thuế 0%.
5. Soạn tin gửi kèm báo giá và hẹn hỏi lại.
