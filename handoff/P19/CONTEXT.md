# P19 r01 — source and decisions before implementation

- User 2026-09-29 temporarily accepts P18 r03; synchronized extra states may follow. P19 is now authorized.
- Actual HEAD / baseline: da9f623a19d0359c3e80c14f8cc612636ec6ab78. Target: editable HTML/CSS/JS prototype, served from docs at localhost:8766. No production API available.
- Preserve existing modified warranty-components/flow.js and index.html, all other concurrent module work, gallery and dist.
- Sources: supplied P19 prompt, Contract 2.0, BOARD_INDEX, B19.png; local AGENTS, UI_STANDARD, warranty-components/HANDOFF and DEV_PROPOSAL (proposal only).

| Element | Baseline / component | User change / implementation | Confidence |
|---|---|---|---|
| Canvas | prototype390×844, B19 four panels | locked494×950 CSS px, uniform scale from Home shell | confirmed user |
| Header | gradient110deg #073b52→#0c5d7d | 86px, existing P09 header metric; no fake status bar | source + adaptation |
| Content | white cards, teal muted canvas, stepper, case, scan/review/result | 20px padding,14px gaps; internal scroll | source/adaptation |
| Cards | radius12px, padding15px, border#dce9ef | retain12px,18px padding in494 frame | source/adaptation |
| Text | local Public Sans, ink#12384e, muted#527186 | body17px/1.5, header24px, action18px | source/adaptation |
| Controls | bottom quantity sheet and footer CTA | min56px CTA; quantity64px; in-app modal focus/Back/Escape; backdrop does not close | source + locked dialog policy |
| Footer | scan CTA / review totals+CTA / result CTA | dedicated workflow footer; Home/P03 nav CSS untouched | baseline + existing wizard component |
| Icons | existing inline SVG stroke1.8 | shared operation-icons palette,44px tile/26px SVG; status separate | user approved component |
| Camera crop | approved bg_shelf_detail_4k_enhanced.jpg cover | 230px tall; explicitly camera not connected; disabled lamp | verified source; hardware unverified |
| Success | XLK-0002/BH-001,2 codes,3 units | both isolated B19 panel fixtures and interactive issues use verified simulated receipts with unique DEMO IDs to avoid overwriting XLK-0002 | explicit fixture correction |

P19 keeps all four panel IDs. New modules reuse the existing prototype's structure/assets and shared dialogs; do not load its broad global CSS or reuse its optimistic Post handler. P09 receives scoped confirmed preview receipts; P20 full pagination, P21 durable resume, P24 full exception boards remain pending. Same-page owner retains request/document/version/scan-session during navigation and UNKNOWN. Production adapters and durable retention policy remain unverified.

Asset finding: bg_shelf_detail_4k_enhanced.jpg referenced by the baseline prototype is absent in this checkout (rg assets/docs/assets). Use existing approved bg_warehouse_main_4k_enhanced.jpg as explicit fallback; exact shelf crop remains a visual deviation, no external asset downloaded. Actual camera height210px so short scan content fits the locked frame.
