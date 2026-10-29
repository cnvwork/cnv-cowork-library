---
name: gd-tu-van-khoa-hoc
title: Tư vấn khoá học
description: Dùng khi phụ huynh hoặc học viên hỏi khoá học. Hỏi mục tiêu, trình độ, độ tuổi, lịch học, ngân sách; gợi ý khoá phù hợp, báo học phí và mời kiểm tra đầu vào hoặc học thử.
command: /tuvankhoa
industry: giao-duc
category: tu-van
starters:
  - Phụ huynh hỏi khoá tiếng Anh cho bé lớp 3
  - Bạn sinh viên muốn luyện IELTS 6.5 trong 4 tháng
---

# Câu hỏi khai thác
1. Người học: độ tuổi / lớp, trình độ hiện tại (điểm thi, chứng chỉ), đã học ở đâu.
2. Mục tiêu cụ thể và hạn: điểm số, kỳ thi, giao tiếp, du học…
3. Lịch có thể học (buổi, khung giờ), học trực tiếp hay online, cơ sở gần nhà.
4. Ngân sách và ai quyết định (phụ huynh).

# Tư vấn
1. Gợi ý 1–2 khoá từ bảng giá (`search_products`): thời lượng, số buổi, sĩ số, giáo viên, học phí, ưu đãi.
2. Giải thích lộ trình từ trình độ hiện tại tới mục tiêu, có mốc kiểm tra.
3. Mời kiểm tra đầu vào hoặc học thử (`/hocthu`).

# Ghi vào CRM
Phụ huynh là người liên hệ: `create_contact` (tên phụ huynh), `first_note` ghi tên, tuổi con và mục tiêu. `create_deal` với giá trị học phí dự kiến.

# Lưu ý
Không cam kết đầu ra tuyệt đối ("đảm bảo 7.0", "100% đỗ") trừ khi trung tâm có chính sách cam kết bằng văn bản; nếu có thì nói đúng điều kiện.
