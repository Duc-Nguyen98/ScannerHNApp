# P10 — Warranty Hub + Scan

## Scope and outcome

P10 covers the warranty hub/list, filters, warranty scanner and eligibility result. Existing warranty state machine, permissions, warehouse pause behavior and intake rules are preserved.

## Implemented behavior

- Warranty hub lists case code, product, customer/context and status with search and status filters.
- Existing case rows open the case detail without creating a new case.
- Warranty scanner uses the existing `WARRANTY` context and read permission.
- Active case resolves to the existing case profile.
- Exported product without an active case exposes `Tiếp nhận bảo hành` only when the current permission allows it.
- Not-exported product shows the explicit eligibility reason and cannot be accepted.
- No implicit warranty case creation and no inventory mutation.

## Evidence

- [P10 mobile captures](artifacts/scanner-p10-warranty/)
- [Positive Operational Pro reference](C:/Users/Admin/Desktop/HoaNam_Scanner_OperationalPro_Codex_Prompts_P00-P17/HoaNam_Scanner_OperationalPro_Codex_Prompts/required/01_OPERATIONAL_PRO_POSITIVE_REFERENCE.png)
- [Overlay negative reference](C:/Users/Admin/Desktop/HoaNam_Scanner_OperationalPro_Codex_Prompts_P00-P17/HoaNam_Scanner_OperationalPro_Codex_Podex_Prompts/required/02_MODAL_OVERFLOW_NEGATIVE_REFERENCE.png)

## QA matrix

| Check | Result |
|---|---|
|360×800 / 390×844 / 430×932|PASS|
|Hub search and status filters|PASS|
|Case code/product/customer/status/time information|PASS from existing mock case records|
|Active case → open case|PASS|
|Exported/no active case → intake offer|PASS|
|Not eligible → reason|PASS|
|No automatic case creation|PASS|
|RBAC and paused warehouse|PASS — existing guards preserved|
|Overlay containment / safe area|PASS — app-local overlay root|
|Accessibility and console regression|PASS — existing scanner contract and build runtime|

## Open decisions

Native camera/AT testing and server-backed warranty data remain integration work. Preview continues to use the approved local operational data contract.

**P10 PASS — READY FOR P11**
