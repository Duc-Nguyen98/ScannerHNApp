# P05 — Source decisions and measurements before implementation

- VERIFIED_SOURCE: HEAD da9f623a19d0359c3e80c14f8cc612636ec6ab78, prototype docs/flows; existing P01–P04 and warranty work preserved. No package.json build at root; Node tests and Playwright preview checks available.
- User 2026-09-25: P04 temporarily accepted, proceed only P05. P01–P04 may receive later states.
- OBSERVED_IMAGE: supplied B05.png, 1536×1024; four panels. Image measurements below are estimated, not recovered CSS.
- Panel bounds approx x=30–381 / 404–755 / 780–1132 / 1156–1509, y=30–946. Content starts y=115 (status bar and illustrated frame excluded from product).
- Header product row approx 45px; content horizontal padding 15–17px on image, control height 44–48px; footer actions 50px, gap 8px; section gap 10–14px; body 14px, headings 18–22px, counter 28px, icon 22–26px. Card/control radius 8–10px, sheet top 18px, border pale blue approx #dce9f8; header dark teal gradient. Camera crop 318×200px at x421 y195; centered barcode box not available as standalone approved asset. Use existing warehouse photo and disclose visual difference.
- VERIFIED_SOURCE: Home/P04 shell 494×950 CSS px, common uniform viewport fit. P05 adopts this shell, inner scroll, stable header/footer; keep B05 one-column composition and paired CTAs. No fake OS status bar.
- CONFIRMED_HANDOFF: main outbound record goes to Web, no Post/inventory mutation. Migrate old approval copy in S03/S04. Reuse shared waiting-Web copy and existing icon geometries.
- P05 requirement: planned quantity remains 10, initial demonstration is 8 scans = 7 valid + 1 duplicate, SKU 5+2. Require receiver/phone/address, complete quantity before record. Three explicit further valid scans lead to 10/10; no implicit fill on send.
- PROPOSED only: incomplete metadata/quantity record from DEV_PROPOSAL is not enabled. Fixture metadata not a production create API.
- Direct dependency P17.S02: implement contextual cannot-export screen with reason and related fixture document; retain current document and accepted list. This does not complete the other three P17 panels.
- UNKNOWN: production create/source metadata, catalogue status/stock, API record/status, per-module permissions, camera/torch, P12. Existing PX-0004 remains its own pending route, never substituted with PX-0005.
- Browser captures: CSS viewport 494×1000 plus 360×800, 430×932, 1440×900, 340×420; DPR1/zoom1, Arial from existing prototype; exact font and camera/product pictures still need visual acceptance.
