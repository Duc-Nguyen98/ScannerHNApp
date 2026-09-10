# Scanner — nền ảnh đã tách từ asset sheet approved

Bộ này cung cấp các ảnh nền và ảnh nhân sự dùng cho UI/UX Scanner. Nguồn đối chiếu là `SOURCE_APPROVED_ASSET_SHEET.png` (contact sheet 1536×1024 được cung cấp trong bàn giao).

## Cấu trúc

- `01_backgrounds/`: nền kho cho Login, Home và các trạng thái hero.
- `02_people_staff/`: ảnh nhân sự cho màn Xác nhận phiên/Start Shift và hero.
- `03_overlays_gradients/`: lớp gradient PNG có alpha để đặt trên ảnh nền.

## Gợi ý dùng

```css
.screen-hero {
  background-image:
    url('./03_overlays_gradients/overlay_hero.png'),
    url('./01_backgrounds/bg_warehouse_main.jpg');
  background-position: center;
  background-size: cover;
}

.shift-hero {
  background-image:
    url('./03_overlays_gradients/overlay_right.png'),
    url('./02_people_staff/staff_warehouse.jpg');
  background-position: center;
  background-size: cover;
}
```

`bg_warehouse_main.jpg` và `staff_warehouse.jpg` khớp byte với asset approved đang dùng trong workspace. Các biến thể còn lại là bản raster tách từ contact sheet; chúng giữ bố cục và màu tham chiếu nhưng không phải master Figma/vector. `overlay_*.png` là lớp gradient alpha được tái tạo để dùng trực tiếp trên hero/background. Không dùng `bg_warehouse_blur.jpg` làm backdrop runtime; dùng CSS/app overlay cho modal.

Các file được giữ nguyên định dạng và kích thước hiện có. Xem `ASSET_MANIFEST.json` để biết kích thước, dung lượng và SHA-256 của từng file.
