# P08 r17 — màu nhận diện nghiệp vụ cho6 trang Lịch sử

User yêu cầu bổ sung màu cho Hoạt động theo ngày và đồng bộ6 trang history. Giữ bố cục/logic đã chốt.

## Thiết kế
- Palette trong category-colors.css, scope p08-app/data-history-tone, không tô nền toàn trang hoặc sửa màu trạng thái.
- Nhập kho:teal #0d6b60/#eaf7f2; Xuất kho:blue #225fa2/#edf4ff; Bảo hành:ochre #95601a/#fff5e6; NFC:purple #7550a2/#f3effb; Chứng từ:slate #466279/#eef3f7; Phiên quét:indigo #4e5da8/#eff1fd.
- Áp dụng cùng tone vào stat/icon/count củadaily; tile củaGeneral/Nhập-xuất/NFC/Bảo hành/Phiên; iconhero detail. Giữ tên/icon để không dựa vào màu đơn thuần.
- Giữ canvas liền mạch, listcard trắng, header/nav/filtershared brand màu cũ; Tổng cộng vẫn màu nhấn đã chốt. Statebadges waiting/success/etc giữ ý nghĩa/màu độc lập.
- Không đổi số liệu, thứ tự, kích thước/layout, datevalidation/Today, routing hoặc query.

## Kiểm chứng r17
- Color suite2/2 groups PASS. Daily6viewport ởtop/bottom,5tone distinct, mỗi tone stat=tile=count nhất quán; canvas3layers giống nhau; shell494×950/nooverflow/fixednav.
- Text/number contrast trong categorytiles >=4.5:1;6category icon palettes cùng mức>=4.5:1 theo actualcomputedRGB.
-5list + detail kiểm tone trùngdaily/recordkind; sessionindigo. Waiting/success statusbackground được kiểm không bị paletteghiđè.
- Shared regression7/7 PASS, Node toànworkspace148/148 PASS.
- Đã xem dailybottom/general/sessionactual. Visual user acceptancepending; integrationNOT_RUN.

## Evidence
evidence/revision-17/color-results.json; daily-bottom-494x1000.png và5viewport; history-general.png; documents.png; nfc.png; warranty.png; sessions.png vàdetail; unified-regression/browser-results.json; node-tests.txt.
Giữ91panel/24prompt, fixture/baseline. Khôngpush/merge/deploy.
