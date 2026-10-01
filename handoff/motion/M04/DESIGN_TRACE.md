# M04 pre-implementation decisions

Source: user-requested MOTION_P04, MOTION_CONTRACT v1.0; FLOW_GATE.json gate_status PASS, blockers empty; M00 harness ready and M01–M03 shared consumer ownership current. Stack is editable native HTML/CSS/modules. No dependencies installed, no source/baseline replacement.

| Target | Source / owner | Implementation |
|---|---|---|
| S01 focus/errors | FormFeedback, M00 noticeFeedback140 | Static field geometry; error occupies a fixed label-row slot, never pushes controls. Input/IME values remain immediate. |
| S02 accepted event | ScanFeedback, M00 rowFeedback160 | Explicit scan event ID generated only by domain scan; consumed once even if filtered/hidden. Old1.8s CSS pulse/timer removed. Duplicate/error/counters static. |
| S02 camera | Existing renderManualEntry owner | Preserve connected camera node on same-step updates; no getUserMedia, new reader or animation of camera/reticle. Optional preservation leaves P05 defaults unchanged. |
| S03 summary | Existing flow/router | Static final numbers, no stagger/height/order animation. Internal step changes not a new local router. |
| S04 confirmation | SubmitFeedback, M00 rowFeedback160 | Fade hero only after exact verified recorded receipt; no animation for request pending/rejection/UNKNOWN, no replay on P12 Back. |
| Policy/lifecycle | M00 controller and existing Home review mode | auto/reduced/off + OS policy; cancel before repaint/hide/overlay/dispose. No business work from completion callback. |

P04 module temporarily owns local motion policy on its active destination subtree, which is disposed before another module uses it. AppShell remains opacity owner of destination itself; P04 never animates that node. Modal/route/scroll/focus stay with existing owners.

Default12-scan seed preserved. Profile accepted-list only (up to11 unique seed lines); no evidence justifying virtualization, no new virtualizer/scroller. Long-list/stress simulation, if used for profiling, must not change the shipping fixture. Actuals/trace under evidence; motion visual acceptance remains user review, not inferred from tests.
