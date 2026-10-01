# List Audit

All candidates remain **DEFERRED** for virtualization. Snapshot DOM counts are not scroll/render performance profiles and do not justify installing a virtualizer. Existing native scroll/pagination is retained. No synthetic backend or event/session source was introduced.

| Candidate | Visible nodes | Rendered list rows | Decision |
|---|---:|---:|---|
| P06-lookup-list | 158 | 5 | DEFERRED |
| P08-history-list | 182 | 6 | DEFERRED |
| P12-documents | 444 | 24 | DEFERRED |
| P20-component-history | 81 | 1 | DEFERRED |
| P22-nfc-unavailable | 26 | 0 | DEFERRED |
| P23-sessions-unavailable | 59 | 0 | DEFERRED |

P20 uses explicit sample=history; P22/P23 default event/session sources are unavailable, not empty-success. P06/P08/P12 counts describe the current render only, not total server record counts. Resource bytes and navigation timing are recorded in baseline.json. Trace ZIPs cover representative routes/modal/scanner/lists; no hardware fps claim.
