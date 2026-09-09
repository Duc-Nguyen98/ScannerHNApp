# P04 — INBOUND CREATE

Precondition:
P03 PASS / P01–P03 VISUAL LOCK PASS.

Scope:
**Nhập kho → Thông tin phiếu**

Áp dụng toàn bộ:
`COMMON_HOANAM_SCANNER_OPERATIONAL_PRO.md`

## MỤC TIÊU

Make UI màn tạo phiếu Nhập kho theo đúng Visual Grammar Operational Pro đã khóa ở P01–P03.

Không quay về generic form/card-based UI cũ.

## UI STRUCTURE

Header:
- Nhập kho
- workflow progress phù hợp
- Kho Hoa Nam / warehouse status nếu context hiện có

Form:
- logical form groups
- Tên / Lô phiếu
- các field nghiệp vụ hiện có
- ghi chú nếu hiện có
- draft state nếu có

Không card hóa từng field.
Không excessive border/radius.

CTA:
`Tiếp tục quét mã`

CTA phải mobile-safe và không bị bottom navigation/keyboard che.

## BUSINESS

Không thay:
- inbound validation
- RBAC
- warehouse paused
- draft protection
- scanner context
- route guard
- Post/inventory semantics

## MOBILE QA

Bắt buộc:
- 360×800
- 390×844
- 430×932
- keyboard-safe
- safe-area
- sticky CTA
- no overlap

## EVIDENCE

- BEFORE
- AFTER
- side-by-side
- regression
- accessibility checks
- console/page error

Output:
`SCANNER_P04_INBOUND_CREATE_REPORT.md`

Final:
`P04 PASS — READY FOR P05`
hoặc
`P04 FAIL — FIX REQUIRED`
