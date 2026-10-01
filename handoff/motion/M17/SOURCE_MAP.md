# M17 — source and ownership before code

FLOW_GATE.json gate_status PASS; M00 ready; M01–M16 consumers already present. Read MOTION_CONTRACT v1.0 and current AGENTS/UI_STANDARD. HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78; editable HTML/CSS/ES modules. UI P17 r03 + later shared flow/motion decisions are retained.

| Panel | Owner/decision |
|---|---|
| S01 | Extend existing P04/P05 ScanFeedback controller, M00 noticeFeedback140ms on error text only. Stable attempt.eventId; consume off/hidden/restored events; camera/reticle/counters/accepted list static |
| S02 | Same controller, ConflictNotice140ms on warning block; reason/data/guard immediate, no retry mutation. No whole-screen transform or route transition duplication |
| S03 | Mapping panel static; opt in conflict detail to existing AppModal/M00 enter220ms/backdrop140ms. Close stays immediate per shared overlay owner; no snapshot/exit delay or new overlay controller |
| S04 | UnknownState text and disabled resend static and immediate. Small24px indicator in existing status-check button slot, auto loop only while actual check pending; reduced/off static, hidden/overlay/cancel paused. No countdown, minimum busy duration or auto retry |

Reuse shared primitives/tokens unchanged. Shared scan-flow-feedback is a consumer shared by M04/M05, so both require scoped regression. No library, provider, scroller, fixture regeneration or virtualization. Error block is short; existing scan list profile/decision from M00/M04/M05 remains native.

Static geometry source: current 494×950 AppShell and P17 r03. All animation opacity is local; no height/padding/font/footer change. Pending indicator reuses24px occupied icon slot; pending branch artwork change is explicit and is not claimed pixel-identical to its former clock glyph. Baseline comparisons use settled idle panels with fixed fixture clock; screenshot evidence does not prove frame rate.
