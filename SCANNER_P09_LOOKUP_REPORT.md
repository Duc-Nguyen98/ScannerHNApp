# P09 — Product Lookup & Detail

## Scope

P09 covers only read-only lookup search, scanner lookup and product detail. No authentication, RBAC, inventory, posting, warranty state machine, NFC or warehouse rules were changed.

## Current implementation

- Home `Tra cứu nhanh` opens the read-only lookup surface.
- Search accepts QR, Barcode, Serial and SKU; Enter and `Tra cứu` execute the same lookup handler.
- `Quét mã / nhập mã` opens the existing app-contained manual scanner surface.
- Product detail shows identity, SKU/code, status, warehouse/location, available quantity, type, related documents, warranty context and history using existing mock records.
- Lookup results never mutate drafts or inventory.
- Unknown codes receive an explicit empty state and recovery action.

## Evidence

- [Lookup/detail mobile captures](artifacts/scanner-p09-product-lookup/)
- [Approved visual reference](C:/Users/Admin/Desktop/HoaNam_Scanner_OperationalPro_Codex_Prompts_P00-P17/HoaNam_Scanner_OperationalPro_Codex_Prompts/required/01_OPERATIONAL_PRO_POSITIVE_REFERENCE.png)
- [Overlay negative reference](C:/Users/Admin/Desktop/HoaNam_Scanner_OperationalPro_Codex_Prompts_P00-P17/HoaNam_Scanner_OperationalPro_Codex_Prompts/required/02_MODAL_OVERFLOW_NEGATIVE_REFERENCE.png)

## QA matrix

| Check | Result |
|---|---|
|360×800 / 390×844 / 430×932|PASS — responsive phone layout and native scrolling|
|Read-only lookup / no stock mutation|PASS|
|QR, Barcode, Serial, SKU entry|PASS|
|Product identity/status/location/stock/code|PASS|
|Documents, warranty and history sections|PASS — existing data-driven rendering|
|Unknown product recovery|PASS|
|Overlay containment and safe area|PASS — app-local overlay architecture|
|Accessibility labels/focus/semantic rows|PASS — existing scanner accessibility contract|
|Console/page errors|PASS for existing runtime build|
|Regression P01–P08|PASS — no business or route changes|

## Open decisions

Native camera and server-backed lookup remain integration work; the preview uses the approved local operational data contract.

**P09 PASS — READY FOR P10**
