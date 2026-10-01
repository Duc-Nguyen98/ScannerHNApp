# P16 r01 — nguồn và số đo trước triển khai

Target: prototype HTML/CSS/JS; HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78. Giữ working copy hiện tại, đặc biệt P12 r09, P15 và các revision của chat khác.

| Thành phần | Nguồn | Áp dụng |
|---|---|---|
| Bốn trạng thái, thứ tự nội dung | OBSERVED_IMAGE B16 / VERIFIED_SOURCE P16 | S01 skeleton avatar/text/badge + spinner; S02 tạo; S03 xóa lọc/sửa query; S04 retry |
| Crop raster | OBSERVED_IMAGE, estimated | B16 1536×1024; panel khoảng x29/407/781/1157, y107, rộng353, cao835. Không kéo méo làm baseline 494×950 |
| Shell | USER_CONFIRMED 494×950; Home/P03 | scale đồng nhất; footer hiện hữu 75px, scan62px; không sửa |
| Header | VERIFIED_SOURCE documents/style.css | min86px; padding16px 20px 24px; h1 26px; body bo24px, offset−12px |
| Controls | VERIFIED_SOURCE P12 r07–r09, history-controls | search50px, tab44px, date44px, toolbar có count/sort. Giữ bổ sung hiện có dù B16 chỉ có search/tab |
| Body | VERIFIED_SOURCE P12 + implementation choice | padding18px; controls cố định ngoài list scroll; list flex chiếm vùng còn lại, không đè nav |
| Skeleton | OBSERVED_IMAGE estimated + P12 card | 6 hàng; card bo12px, avatar40px, text hai dòng, badge; cao60px để vừa controls hiện hành |
| Empty/error | OBSERVED_IMAGE estimated, adaptation | artwork128px; glyph có sẵn64px, h2 25px, copy18px/1.5; CTA56px; layout căn giữa vùng list |
| Icon/palette | VERIFIED_SOURCE UI_STANDARD, icon source | dùng glyph document/search/alert/rotate sẵn có, pastel trung tính; không trace raster hay tải asset |
| Retry/race | VERIFIED_SOURCE P16 | read controller với sequence/abort/timeout, scope actor/kho; cache chỉ đúng query/scope; null/error không thành [] |
| Quyền tạo | VERIFIED_SOURCE sessionGuard + owner guard | CTA/route/action đều kiểm lại; kho dừng không tạo. Read-only fixture chỉ thu hẹp quyền, không cấp quyền mới |

Adaptation cần review: giữ date/count/sort hiện hành; icon có sẵn thay illustration chính xác của raster; chiều cao skeleton theo không gian còn lại. Font Arial từ P12, không tuyên bố đúng font raster. Capture trước–sau cùng viewport494×950, DPR1, zoom1, Chromium; visual chưa được nghiệm thu bởi kiểm thử logic.
