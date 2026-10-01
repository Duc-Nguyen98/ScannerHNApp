# M15 source / ownership decisions

User explicitly requested MOTION_P15 on2026-10-01. Input contract and prompt are copied under inputs/. FLOW_GATE gate_status=PASS,91panels; M00 and M01–M14 consumers already available. Baseline is current P15 r03 plus subsequent FLOW/M14 owner fixes, not a redesign of B15. Business contract/UI_STANDARD/footer/readable/dialog constraints remain.

SystemNotice and BlockingGuard consume unchanged M00 noticeFeedback (opacity .65→1,140ms auto,80ms OS reduced,0off); already visible content never waits for animation. Only .p15-state-copy animates. Root/shell, CTA dock, camera, context, numbers and device guidance are static. DeviceFeedback uses existing pressFeedback on eligible buttons,100ms auto/static reduced/off. Keys are scoped kind+document+intent+action; old/off/hidden notices consumed, no replay on Back. No provider/scroller/library/virtualizer added.

P15 flow fix required before adoption: expiry during pending history close had visible uninert Home and no expired panel in the same task (before/security-preflight.json). Security transitions now conceal caller synchronously before any history/overlay wait. Old dialog/exit content is hidden, old animations canceled by caller. Expired panel does not expose document identifiers while auth is lost. Owner objects remain page-memory for existing same-account reauth policy; no new persistence/secret checkpoint.

Shared primitive/token implementation is unchanged. Home fans policy to P15, cancels caller effects when system boundary opens, and releases P15 controller on hidden auth suspension. Existing overlay still owns dialogs/focus/history. New CSS/route provider is unnecessary. Source snapshots and before traces are kept. All business integration limits remain, no deployment.
