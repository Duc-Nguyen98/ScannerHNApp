# P08 r16 — validation khoảng ngày và shortcut Hôm nay

Phạm vi:6 shared history filters. User yêu cầu siết Từ ngày<=Đến ngày theo cả2 chiều và thêm nút Hôm nay.

## Áp dụng
- validatePickerDates kiểm format/ngày thực/cửa sổ90 ngày/quan hệ2đầu. Reverse range có lỗi riêng ởfrom vàto, aria-invalid/aria-describedby + thông báo tại ô. Apply disabled trongdraft sai.
- Nhập đầy đủ ngày sai hiển thị ngay; nhập dở khóaApply nhưng chờblur để báo lỗi format. Không rerender input khi gõ, giữcaret/focus.
- Calendar giao90-day bounds với đầu còn lại: from.max<=to, to.min>=from. Ngày ngoài miền disabled, navmonth dừng tại biên, arrowkey không focus ngày disabled.
- Handler kiểm lại relativebounds ngay khi chọn (không chỉdựa disabledDOM); submit validate lại khicommit để chặn Enter/programmatic submit. Không tự sửa giá trị ngày còn lại.
- Hôm nay ở cạnh Khoảng thời gian và calendarfooter. Đặt cả2ô về ngày Việt Nam hiện tại, giữstatus, chỉ sửa draft; Apply mớicommit. Trongcalendar, quay về form cùng cặp ngày hôm nay.
- Đặt lại xóa2ngày/status trongdraft, lỗi hết; Cancel/Escape giữcommitted state. Equal dates và no-date/one-sided normalization giữ nghiệp vụ đã chốt.
- Không đổi layout3footerbuttonr14, bộ lọc trạng thái, source, ngày90 policy hoặc P05 choice UI.

## Kiểm chứng
- Validation suite4/4 groups PASS:6 filters, both directions/equality, liveerrors/disabledApply, submitbypass khôngcommit; calendar forgeddisabled click rejected; Today draft-only/preserve status; Vietnam midnight; reset; partialtyping; focus trap.
-6viewports trongstateinvalid vàtoday. Dialogtrongapp, footerusable, today44px, khôngtràn ngang. Redinvalid border giữ ngay khi inputfocus.
- Unified regression7/7 PASS; source r16. Node toànworkspace148/148 PASS (2unit mới chofieldvalidation/relativecalendarbounds).
- Đã xem actualToday/error/calendar. Visual reviewpending; integrationNOT_RUN. Khôngtuyênbốcác hệ thống bên ngoài được kiểmchứng.

## Evidence
evidence/revision-16/validation-results.json; today-494x1000.png; errors-494x1000.png; calendar-from.png; calendar-to.png;6surfaceinvalid/today; unified-regression/browser-results.json; node-tests.txt.
Khôngđổi24prompt/91panel, baseline hoặc dữ liệu. Khôngpush/merge/deploy.
