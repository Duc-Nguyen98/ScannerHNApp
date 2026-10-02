# UI/UX audit and corrective pass — 2026-10-03

Scope: editable `docs/flows/` source, existing P01–P24 contracts, UI_STANDARD.md and AGENTS.md. No UI artwork, footer lock, motion primitive, route ID, or business policy was changed.

## Corrected defects

- Home recent-list header had an 8px internal horizontal bleed from the negative right margin on `Xem tất cả`. The hit area remains 44px; the margin no longer expands the section beyond its client width.
- Home task and primary navigation buttons now declare `type="button"`, preventing accidental form submission if the shell is embedded in a form.
- P08/P12/P22/P23 history filters were exposed as ARIA tabs without IDs or tabpanels. They are filters, so the controls now use `role="group"` with `aria-pressed`, preserving keyboard filter navigation and removing invalid tab semantics.
- Home scroll content now reserves space for the floating scan circle; the last recent row no longer sits beneath the locked footer control at compact viewports.
- The deferred stylesheet loader now activates existing head slots in original DOM order, rejects failed stylesheets, has a timeout, waits for duplicate callers, and replaces failed slots on retry. Home does not mount after a missing or stalled route stylesheet.
- Audit harnesses now select `dialog[open]`, wait for document readiness after navigation, and respect the locked rule that modal backdrops do not dismiss dialogs. These were false-negative test defects, not product behavior changes.
- Route-mounted non-form controls across 18 source routes now receive an explicit `type="button"` normalization guard; the browser audit found **0** remaining implicit-submit buttons in the app shell.

## Verification

- Full Node suite: **767/767 PASS**, 0 failed/cancelled/skipped.
- Focused UI contract suite: **38/38 PASS**.
- `check_ui_nitpicks.cjs`: PASS; Home section/head `454/454`, four filter groups, no page errors.
- `check_home_audit.cjs`: **10/10 PASS** after the compact footer overlap fix.
- `check_app_surfaces.cjs`: all shared scrollbar, tab width, modal, backdrop, touch-scroll and warranty/history scene checks PASS.
- `check_ux_touch_upgrade.cjs`: 12/12 groups PASS, 66 measurements, no errors.
- `check_deferred_styles.cjs`: PASS; P01 8 active styles before auth, Home CSS activated after auth, 0 response errors.
- `check_p15_ux.cjs`: 6/6 PASS; expiry continues to conceal sensitive owner context as required by the current security contract.
- `check_p17.cjs`: 6/6 PASS.
- `check_button_types.cjs`: 18 routes, **0** missing button types.

## Contract decisions retained

Older P04/P05 runners expecting inline “Đã thêm…” success text and older P17/P15 runners expecting obsolete controls/context were not used as product evidence. The current action-feedback, security concealment, UNKNOWN and unavailable-source contracts remain authoritative. The generated `docs/review/runtime/` copy was not regenerated because repository instructions prohibit changing generated preview assets without an explicit publish/build request.
