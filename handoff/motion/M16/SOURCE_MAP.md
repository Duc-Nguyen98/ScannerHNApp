# M16 — source and ownership before editing

FLOW_GATE gate_status PASS; M00 harness passed and primitives promoted into shared/motion. Read MOTION_P16, MOTION_CONTRACT1.0, original Contract2.0 decisions, AGENTS/UI_STANDARD, FLOW_REPORT, M00 ownership/list audit and M12/M15 reports. Source target remains native HTML/CSS/JS prototype, reference HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78.

Current editable P16 includes r03 long-query/focus corrections and later P17 touch/accessibility changes. M12 already owns a single controller on documents root. Extend that owner; no second provider, scroller or animation engine.

| Panel | Choice | Source |
|---|---|---|
| S01 | Fixed six skeletons, no shimmer; spinner only for an actual pending read, static circle/text reduced/off. Debounce has text without rotation | MOTION_P16 + current P16/M12 |
| S02 | Icon/text opacity .65→1, feedback140ms; reduced≤80/off0; confirmed empty only | M00 dataState + MOTION_P16 |
| S03 | Same opacity for notice content; input/filter/CTA static, no route key from query | M00 + current P12 navigation |
| S04 | Error/CTA immediate, static by design; pending retry uses existing read state; cache anchor unchanged | MOTION_P16 + current data model |

Dedup by data context+state, retain across Back/hide; consume off/hidden events. Cancel on replacement/navigation/mode/security through M12 lifecycle. Prevent M12 filter feedback on a P16 empty state to avoid concurrent ancestor/descendant fades. No animation completion performs reads or mutations.

Geometry inherited:494×950, header86px, shared footer75px/scan62px, search50px, tabs44px; skeleton six60px rows, state artwork128px or104px with chips, text18px/1.5. No geometry/style baseline change intended. Capture actual before and after at identical fixture/date/viewport/DPR. Spinner phase may differ in auto; compare geometry and static states separately without masking.

M00/M12 virtualization profiling does not justify virtualization (24 fixture rows); preserve finite skeletons, native scrolling and fixture seed. No new library. No FPS or hardware claim.
