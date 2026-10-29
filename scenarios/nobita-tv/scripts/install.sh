#!/bin/bash
# Cài / cập nhật Nobita TV lên một TV Samsung (Tizen) cùng mạng Wi-Fi với máy Mac này.
#   bash scripts/install.sh 192.168.1.50            kiểm tra, đóng gói, cài rồi mở app trên TV
#   bash scripts/install.sh 192.168.1.50 --check    chỉ kiểm tra kết nối + chứng chỉ, chưa cài gì
#   bash scripts/install.sh 192.168.1.50 --clean    gỡ bản cũ (mất ghim/thiết lập) rồi cài lại
# Chạy trên macOS có Tizen Studio. Hồ sơ chứng chỉ Samsung mặc định tên "nobita-tv"; hồ sơ tên khác thì
# chạy NOBITA_TV_PROFILE=<tên> bash scripts/install.sh ...  Cách tạo chứng chỉ: README.md, mục «Chứng chỉ Samsung».
# Không hỏi gì giữa chừng, không cần sudo (chạy được qua thẻ «Chạy lệnh» của CNV Cowork, không có bàn phím).
# Mã thoát: 0 = xong (hoặc --check ổn), 1 = lỗi (dòng ✖ cuối nói vì sao, cách sửa ở README.md mục «Sự cố»), 2 = sai cách gọi.
set -euo pipefail

TV_IP="${1:-}"
MODE="${2:-}"
USAGE="Cách dùng: bash scripts/install.sh <IP của TV> [--check|--clean]"
[[ "$TV_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "$USAGE"; exit 2; }
[[ -z "$MODE" || "$MODE" == "--check" || "$MODE" == "--clean" ]] || { echo "Không hiểu «$MODE». $USAGE"; exit 2; }
[ "$#" -le 2 ] || { echo "$USAGE"; exit 2; }
TV="$TV_IP:26101"
PROFILE="${NOBITA_TV_PROFILE:-nobita-tv}"
TIZEN=~/tizen-studio/tools/ide/bin/tizen
SDB=~/tizen-studio/tools/sdb
PROFILES=~/tizen-studio-data/profile/profiles.xml
APP="$(cd "$(dirname "$0")/.." && pwd)/app"
APP_ID=$(sed -n 's/.*tizen:application id="\([^"]*\)".*/\1/p' "$APP/config.xml")
[ -n "$APP_ID" ] || { echo "Không đọc được tizen:application id trong app/config.xml."; exit 1; }

step() { printf '\n▶ %s\n' "$*"; }
fail() { printf '\n✖ %s\n' "$*"; exit 1; }

[ -x "$SDB" ] && [ -x "$TIZEN" ] || fail "Máy này chưa có Tizen Studio ở ~/tizen-studio (README.md, mục «Chuẩn bị máy Mac»)."
grep -q "profile name=\"$PROFILE\"" "$PROFILES" 2>/dev/null || fail "Chưa có hồ sơ chứng chỉ Samsung \"$PROFILE\" (README.md, mục «Chứng chỉ Samsung»)."

MAC_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "?")
step "Máy Mac: $MAC_IP  ·  TV: $TV_IP"

step "Kết nối TV"
nc -z -G 3 "$TV_IP" 26101 2>/dev/null || fail "Không thấy TV ở $TV_IP:26101. TV đang bật chưa? Developer mode đã bật với Host PC IP = $MAC_IP và TV đã khởi động lại chưa?"
if ! "$SDB" devices 2>/dev/null | grep -q "$TV"; then
  "$SDB" kill-server >/dev/null 2>&1 || true
  "$SDB" start-server >/dev/null 2>&1
  "$SDB" connect "$TV" >/dev/null 2>&1 || true
  for i in 1 2 3 4 5; do "$SDB" devices | grep -q "$TV" && break; sleep 1; done
fi
"$SDB" devices | grep "$TV" || fail "sdb không kết nối được. Đóng Tizen Certificate Manager nếu đang mở; Host PC IP trên TV phải là $MAC_IP."

step "Chứng chỉ \"$PROFILE\" có cho phép TV này không"
DUID=$("$SDB" -s "$TV" shell 0 getduid 2>/dev/null | tr -d '\r\n ')
[ -n "$DUID" ] || fail "Không đọc được DUID của TV."
DIST_KEY=$(awk -v p="$PROFILE" '$0 ~ "profile name=\""p"\"" {on=1} on && /distributor="1"/ {print; exit}' "$PROFILES" | sed 's/.*key="\([^"]*\)".*/\1/')
DEVICES="$(dirname "$DIST_KEY")/device-profile.xml"
[ -f "$DEVICES" ] || fail "Không thấy $DEVICES: hồ sơ \"$PROFILE\" chưa dùng chứng chỉ distributor của Samsung."
if ! grep -q "<TestDevice>$DUID</TestDevice>" "$DEVICES"; then
  CURRENT=$(grep -o '<TestDevice>[^<]*' "$DEVICES" | sed 's/<TestDevice>//' | tr '\n' ' ')
  fail "TV này (DUID $DUID) chưa có trong chứng chỉ. Đang có: $CURRENT. Tạo lại chứng chỉ distributor với cả các DUID đó lẫn $DUID (README.md, mục «Thêm TV vào chứng chỉ») rồi chạy lại."
fi
echo "DUID $DUID có trong chứng chỉ."
if [ "$MODE" = "--check" ]; then echo; echo "Kiểm tra xong, TV sẵn sàng để cài. Chưa cài gì."; exit 0; fi

step "Đóng gói app"
BUILD="$(mktemp -d)"
trap 'rm -rf "$BUILD"' EXIT
cp -R "$APP/config.xml" "$APP/index.html" "$APP/icon.png" "$APP/css" "$APP/js" "$BUILD/"
if [ -d "$APP/img" ]; then cp -R "$APP/img" "$BUILD/"; fi
# stdin đóng: hồ sơ chưa lưu mật khẩu chứng chỉ thì Tizen không hỏi được, lệnh lỗi và in lý do ở đây.
if ! PACK="$("$TIZEN" package -t wgt -s "$PROFILE" -- "$BUILD" 2>&1 </dev/null)"; then
  echo "$PACK" | tail -8
  fail "Đóng gói / ký app thất bại. Mở Certificate Manager, kiểm hồ sơ \"$PROFILE\" còn hạn và đã lưu mật khẩu chứng chỉ."
fi
WGT=$(ls "$BUILD"/*.wgt 2>/dev/null | head -1)
[ -n "$WGT" ] || { echo "$PACK" | tail -8; fail "Tizen không tạo ra tệp .wgt (xem dòng trên)."; }
mv "$WGT" "$BUILD/NobitaTV.wgt"   # trình cài của TV không chịu tên file có dấu cách

if [ "$MODE" = "--clean" ]; then
  step "Gỡ bản cũ"
  "$TIZEN" uninstall -p "$APP_ID" -s "$TV" 2>&1 | tail -1 || true
fi

step "Cài lên TV"
OUT="$("$TIZEN" install -n NobitaTV.wgt -s "$TV" -- "$BUILD" 2>&1)"   # lệnh này báo thành công cả khi lỗi
if echo "$OUT" | grep -qiE "fail|error"; then echo "$OUT" | tail -8; fail "Cài lên TV thất bại."; fi
echo "Đã cài."

step "Mở Nobita TV"
"$TIZEN" run -p "$APP_ID" -s "$TV" </dev/null | tail -1 || fail "Đã cài nhưng chưa mở được app trên TV. Mở Nobita TV bằng remote (Ứng dụng)."
echo
echo "Xong. Để bật TV là vào Nobita TV: Cài đặt → Chung → Tính năng thông minh → Tự chạy ứng dụng cuối cùng → Bật."
