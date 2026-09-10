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

## Bản nâng cấp độ nét

Các file có hậu tố `_v2_1920`, `_v2_4k` và `_4k` là bản giao cho dev sau khi xử lý độ nét. `bg_warehouse_dark_v2_*` được tạo từ `bg_warehouse_main.jpg` sắc nét rồi color grade sang tông dark, vì file dark cũ trong sheet là thumbnail blur. Các bản 4K khác là upscale chất lượng cao từ nguồn approved hiện có; chúng không bổ sung chi tiết camera mới và không được xem là master native 4K.
