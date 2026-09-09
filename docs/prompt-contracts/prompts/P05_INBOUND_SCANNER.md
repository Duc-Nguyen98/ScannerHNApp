# P05 — INBOUND SCANNER

Precondition:
P04 PASS.

Scope:
INBOUND Scan.

## GOAL

One-hand warehouse scanning.

## MUST HAVE

- Header Nhập kho
- Context INBOUND
- scanner/viewfinder focal area
- manual input fallback
- scanned count
- success feedback
- duplicate reason
- invalid-state reason
- compact scanned list
- sticky `Kiểm tra phiếu`

Không card-in-card.

Scan không đổi stock.

Nếu camera mock:
ghi rõ preview simulation; không giả hardware thật.

## PASS

- Context clear.
- Duplicate không cộng.
- Invalid reason nghiệp vụ.
- No stock mutation.
- Keyboard/manual input safe.
- 360/390/430.

Output:
`SCANNER_P05_INBOUND_SCAN_REPORT.md`

Final:
`P05 PASS — READY FOR P06`
