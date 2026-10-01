# M11 — source and ownership before implementation

User requested MOTION_P11_Bao_mat on 2026-10-01. Read the supplied prompt/MOTION_CONTRACT, Contract v2.0, latest UI_STANDARD and P11 r03 + UX audit r02. FLOW_GATE is PASS UI_FIXTURE (24 boards / 91 panels); M00 ready, M01–M10 consumers present. These are historical gates, not new production acceptance.

| Source | Decision |
|---|---|
| B11 snapshot / P11 r03 result balance / current source | Keep four IDs, 494×950, header/footer, fonts/colors, errors and dialogs. Capture actual current source before changing. |
| M00 primitives/tokens | Reuse press100, notice140 (reduced80), rowFeedback160 (reduced/off0); no engine, scroller, provider or overlay replacement. |
| M02 ownership | Security route remains STATIC_BY_DESIGN using existing securitySensitive guard; no protected outgoing snapshot. |
| P11.S01/S02 | SecureFormFeedback fades label/error text only, never input or layout. Native outline/validation, text and guards apply immediately. Password type toggle keeps connected input/focus/selection. |
| P11.S03 | Existing success check fades160 only on a verified changed response. Re-entry/mode change does not replay. No completion callback changes a password or route. |
| P11.S04 | SettingsRows press on action buttons. Rows remain static, IDs from account owner; confirmed revoke/list verification alone removes session. No exit animation and no virtualization for the existing two-row fixture. |
| Lifecycle | Home fans mode/cancel to P11; existing module show/hide/dispose owns consumer. Cancel handles on re-render/overlay/security teardown. |
| Evidence privacy | Test-only account. No credential payloads/logs/DOM snapshots in traces. Trace only non-secret interactions; screenshots mask form inputs. Record counters/IDs/results/geometry and WAAPI opacity samples, not password strings. |

New animation values are contract implementation choices, not Designer measurements. Visual after settle compared to the pre-change actual source; user review still required. Real backend/password policy/devices remain unverified. No deploy and no business tracking overwritten.
