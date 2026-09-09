# P10 — WARRANTY HUB + SCAN

Precondition:
P09 PASS.

Scope:
- Warranty list/hub
- filters
- Warranty scanner
- eligibility result

Case list:
- code
- product
- customer/context
- status
- time

Không card-heavy.

Scan:
- Active case → mở case
- Exported + no active case → offer intake
- Not eligible → reason

Không tự tạo warranty case.

Output:
`SCANNER_P10_WARRANTY_SCAN_REPORT.md`

Final:
`P10 PASS — READY FOR P11`
