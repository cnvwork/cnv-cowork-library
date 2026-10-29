/*
 * Cấu hình Nobita TV cho nhà bạn. Sửa tệp này rồi cài lại lên TV (README.md, mục «Cài lên TV»).
 * TV chạy Chromium 76: chỉ viết JavaScript kiểu cũ (var, function), không dùng `?.`, `??`.
 *
 * Không ghi mật khẩu, mã API hay thứ gì bí mật vào đây: tệp này nằm trong gói cài lên TV.
 */
var NOBITA_TV_CONFIG = {
    // Tên hiện ở góc màn hình và trên màn chào.
    tvName: 'Nobita TV',

    // Album ảnh từ Google Drive: tạo một thư mục, chia sẻ «Bất kỳ ai có đường liên kết», rồi dán mã thư mục
    // (đoạn sau /folders/ trong đường liên kết). Mỗi thư mục con là một album. Để trống = không lấy ảnh Drive.
    driveFolderId: '',

    // Thời tiết (Open-Meteo, miễn phí, không cần key): tên hiện trên màn hình và toạ độ của thành phố.
    weather: { name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },

    // Mã 4 số để mở ô «Video» (phát video trong USB). ĐỔI trước khi cài, đừng để 0000.
    usbPin: '0000',

    // Ảnh bên phải màn chào. Mặc định là ảnh của tác giả Nobita TV: thay tệp app/img/splash.jpg bằng ảnh của bạn
    // (hoặc trỏ sang tệp khác trong app/img). Để trống = không có ảnh.
    splashPhoto: 'img/splash.jpg',

    // Biểu tượng kiểu điện thoại cho app trên TV: thêm tệp app/img/apps/<mã app>.png rồi ghi mã app vào đây,
    // vd ['9Ur5IzDKqV.TizenYouTube']. App không có trong danh sách dùng biểu tượng của TV.
    bundledIcons: [],

    // Máy chủ trung chuyển riêng của bạn (tuỳ chọn, KHÔNG kèm trong kịch bản này): địa chỉ feed.json liệt kê
    // ảnh / clip và giữ thông báo. Để trống = không dùng; ảnh lấy thẳng từ thư mục Drive ở trên.
    feedUrl: '',
    // Gửi nhật ký hoạt động của TV về máy chủ trung chuyển (chỉ khi có feedUrl).
    debugLog: false
};
