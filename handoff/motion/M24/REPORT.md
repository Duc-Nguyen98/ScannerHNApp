# MOTION_P24 — Trạng thái Scanner

01/10/2026 · **PASS_SCOPED_UI_FIXTURE** · Motion visual **USER_REVIEW_PENDING**. Không thay trạng thái nghiệm thu business/backend/hardware của P24 r03.

[Review](REVIEW.html) · [Quyết định/nguồn](DESIGN_TRACE.md) · [Summary](SUMMARY.json) · [Source/diff](SOURCE_MANIFEST.json) · [Release gate](../MOTION_RELEASE_GATE.json).

## Thực thi

Đã đối chiếu MOTION_CONTRACT1.0, contract v2/context lưu trong repo, AGENTS/UI_STANDARD, FLOW_GATE PASS và M00. Source HEAD `da9f623a19d0359c3e80c14f8cc612636ec6ab78` + working copy đã có M01–M23. Stack HTML/CSS/ESmodules; chỉ sửa3file runtime của owner P19, không thêm engine/provider/scroller/virtualizer.

| Panel | Auto | Auto với OS reduced | Off | Quyết định |
|---|---|---|---|---|
| P24.S01 | Lỗi text/viền tức thì, không shake | Như auto | Như auto | STATIC_BY_DESIGN; sheet REUSED M19/AppModal |
| P24.S02 | Notice lỗi opacity140ms | Opacity80ms | Hiện ngay, không effect | APPLIED trong controller M19 |
| P24.S03 | Hero160ms sau verified record | Tĩnh | Tĩnh | REUSED M04/M05 shared scan-flow-feedback |
| P24.S04 | Guard closed tức thì; lịch sử đọc bình thường | Như auto | Như auto | STATIC_BY_DESIGN; reuse M20/M02 |

- `issue-motion.mjs` thêm `rejected()` gọi M00 noticeFeedback. Chỉ `flow.scan()` trả unavailable mới phát feedback; mount/Back/render/mode change không phát lại lỗi cũ.
- `issue-view.mjs` gọi feedback trên `.p24-rejection-note` sau dữ liệu/guard đã áp dụng. Không animate camera/reticle, không sửa accepted list hoặc tự mở service.
- `issue.css` thêm border/outline đỏ cho input quantity invalid. Đây là thay đổi màu có nguồn từ MOTION_P24; không đổi kích thước/geometry. Validation và chặn submit vẫn thuộc owner, không đợi animation.
- S03 giữ owner M04/M05 hiện hữu, không thêm fade/controller thứ hai. Hai mẫu B24 PN-0005/12 mã và PX-0004/10 mã được record qua owner; không thay seed/fixture.
- M00 core/tokens, AppShell, overlay, domain models/fixtures và business RUN_STATE/SCREEN_COVERAGE giữ nguyên hash. Virtualization tiếp tục DEFERRED theo profile M00/M20, không thêm thư viện.

## Kết quả kiểm tra

- **765/765 test logic toàn bộ source hiện hành**, gồm5 test motion P24 mới về3mode, OS/hidden/cleanup và target camera/input/disconnected.
- **24 nhóm M24**:8×3mode, bao gồm quantity13/0/âm/thập phân, IME/cancel, effect đúng140/80/0 và160/0/0, receipt/no-replay, rapid tap, live mode/OS/hidden, case đóng khi Post đang chuẩn bị, stale CTA, resume, pagination/dedup, focus/Back và lifecycle4vòng.
- **15/15 geometry và số node sau settle bằng trước** (S03 có2biến thể); text bằng nhau sau chuẩn hóa UUID tạo riêng. S01 màu viền đổi theo yêu cầu mới, không gọi pixel-identical. Đã xem actual screenshots.
- Domain của cả3mode giống nhau: nhập12 mã/record1/tồn delta0; xuất10 mã/record1/tồn delta0; Post bắt đầu rồi case đóng:1attempt/0commit/khôngreceipt; stale CTA không gửi thêm; lịch sử2ID bất biến/2lần đọc. Camera hardware calls0; không HTTP mutation.
- **21 nhóm regression M19** (7×3mode), **11 nhóm P24 r03** (main5+edge6), **25 tổ hợp layout P24**, **4 viewport footer Home/P03** đạt. Lifecycle/geometry của M19 kiểm riêng trong suite của owner.
- **36 hành trình release**:12hành trình FLOW_GATE×3mode đều PASS; domain/operation summaries bằng nhau sau chuẩn hóa UUID. Dùng đúng các assertion flow đã có: auth/logout/refresh, stock record/UNKNOWN, history/document/PDF, invalid IDs, warranty/Post/closed, resume và P03/P14 live owners.
- Release inventory giữ **24board/91panel**, đủ PASS normal/reduced/off/flow. Báo cáo và check mở rộng trước đó được tham chiếu trong [runtime inventory](RUNTIME_STATE_INVENTORY.json); không coi91panel là toàn bộ state runtime hoặc91route.

## Bằng chứng và lệnh

Ảnh và trace trước ở `before/`; sau ở `evidence/`. Trace thật: [auto](evidence/auto-trace.zip), [OS reduced](evidence/os-reduced-trace.zip), [off](evidence/off-trace.zip). Samples opacity/transform theo frame nằm trong [results](evidence/results.json). 36trace hành trình liên luồng nằm dưới `release/<mode>/Jxx-trace.zip`.

```text
node scripts/check_motion_p24.cjs --before
node scripts/check_motion_p24.cjs
node --test tests/*.mjs tests/*.cjs
node scripts/regression_motion_p24.cjs check_motion_p19.cjs
node scripts/regression_motion_p24.cjs check_p24.cjs after
node scripts/regression_motion_p24.cjs check_p24_edges.cjs after
node scripts/release_motion_p24.cjs auto
node scripts/release_motion_p24.cjs os-reduced
node scripts/release_motion_p24.cjs off
# HOME_FOOTER_EVIDENCE_DIR=handoff/motion/M24/footer
node scripts/check_home_footer_locked.cjs
python -X utf8 scripts/finalize_motion_p24.py
git diff --check
```

Hành trình logout có draft phải xác nhận đúng dialog của owner; test đã bổ sung bước này, không bỏ guard. OS-change event được đợi đến khi browser phát policy mới trước assertion; lượt off chạy lại bằng `--mode=off`, hai mode đã đạt trước đó giữ evidence cùng source. Wrapper M19 giữ đường baseline cũ để so geometry và chỉ chuyển output sang M24. Các failure artifacts là chẩn đoán harness trước khi sửa; results/SUMMARY cuối là kết quả nghiệm thu.

## Performance và giới hạn

Source bytes delta và hash có trong SUMMARY/manifest; đây không phải production bundle. DOM count/geometry trước–sau không tăng. Trace/frame samples là dữ liệu Chromium local; workload trước/sau có thêm thao tác khác nhau nên không suy cải thiện FPS từ long tasks. Input latency riêng/dropped frames trên thiết bị thật **NOT_MEASURED**; không báo60fps bằng cảm giác.

Release gate chỉ **UI_FIXTURE READY_FOR_FINAL**, không phải visual user approval, production/backend/hardware hoặc public deployment. Giữ UNKNOWN, actor/kho/case guard, request/receipt identity và hạn chế page-memory. FINAL sẽ tự kiểm source/gate/build/public theo yêu cầu riêng; lượt M24 chỉ bàn giao [FINAL_BRIDGE](../FINAL_BRIDGE.md) và [FINAL gốc](../ScannerHNApp_FINAL_Noi_Luong_Public_Preview_v1.0.md), chưa commit/push/deploy.

Preview: http://localhost:8766/flows/auth-session/?v=motion-p24 · minhanh/preview → xác nhận phiên. Mở công cụ P24 ngoài khung app; chọn mẫu B24 riêng cho kết quả nhập/xuất. Bộ chọn Motion P02/AppShell đổi auto/reduced/off; auto luôn tôn trọng OS reduced.
