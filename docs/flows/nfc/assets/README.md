# Nguồn artwork

`B07-artwork-source.png` là bản sao byte-for-byte của B07 người dùng cung cấp, khớp git `da9f623a19d0359c3e80c14f8cc612636ec6ab78:design/01_Main/BOARDS/01_UPDATED_BOARDS/05_nfc.png`.

SHA256: `63f4b3876547ffec943f0e8f369eb22b48ba715ec38b14c51030a150b19a3b65`.

Đến r05, CSS hiển thị crop artwork điện thoại NFC x512,y383,w244,h191. Từ r06, theo yêu cầu animation của user, S02 dùng SVG điện thoại nội tuyến và sóng CSS riêng để có thể chuyển động phía sau. Ảnh này được giữ nguyên làm nguồn tham khảo, không còn dùng làm nền UI S02. Các heading, UID, thông tin và control đều là HTML tương tác. Hình học NFC dùng icon hiện có; khung điện thoại là hình học SVG đơn giản.

Hộp sản phẩm tái sử dụng `../../lookup/assets/demo/box.png`, ảnh AI demo P06 đã được user cho phép, chưa phải ảnh chính thức của Designer/sản phẩm WMS. Icon SVG hình học lấy từ repository, license `../../auth-session/ICONS-LICENSE.txt`.


R09: theo yêu cầu chỉ sửa vùng minh họa để khớp B07, S02 quay lại dùng đúng crop gốc x512,y383,w244,h191 bằng CSS background (không caption/control). Bỏ điện thoại SVG dựng lại. Các vòng tỏa animation mờ nằm phía sau crop, cùng tâm x122/y119 của hình gốc; khung ngoài194px giữ nguyên. Source PNG không sửa.


R10: cùng crop B07 được tách bằng CSS thành backdrop(z0) và phần điện thoại clip-path(z2); sóng infinite ở z1, không multiply. File ảnh gốc không đổi.


M07 (MOTION_P07 v1.0, user30/09/2026): bỏ vòng sóng chạy vô hạn và ripple thành công theo chỉ thị motion mới. Giữ crop B07 tĩnh và foreground nguyên vẹn. Chỉ báo đọc do adapter/flow cung cấp listening, không phải artwork. Kết quả xác minh/check dùng M00 opacity140/160ms; reduced/off dùng policy chung.
