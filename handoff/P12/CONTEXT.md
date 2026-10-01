# P12 · decisions before implementation · r01

- Source HEAD: da9f623a19d0359c3e80c14f8cc612636ec6ab78. Target: prototype, docs/flows/documents, shared P01/Home AppShell. Working tree already contains P01–P11 and concurrent revisions; preserve them. User temporarily accepted P11 r03; additional synchronized states deferred.
- Sources read: supplied P12, Contract v2.0, BOARD_INDEX.csv, B12.png, AGENTS.md, shared/UI_STANDARD.md, warranty-components/HANDOFF.md and DEV_PROPOSAL.md. Local baseline is available; gallery is not an implementation target.
- CONFIRMED_HANDOFF: main inbound/outbound waiting means recorded for Web, not POSTED; posted rows retain their status. No approve/post/delete/cancel/export actions added.
- VERIFIED_SOURCE: 494×950 shell, header 88/min and overlapping white body radius24 from P11; shared Home nav. In-app action-dialog and dialog-route are mandatory. Reuse history-picker date validation/timezone/reset/apply semantics.

## Measurements

| Area | Source | Implementation measure | Confidence |
|---|---|---|---|
| Shell | Home CSS + user lock | 494×950 CSS px, uniform fit | verified |
| B12 panel | supplied image 1536×1024 | panel approx344×887 at x36/412/782/1156 y37; fake status bar excluded | estimated |
| Header/content/nav | B12 + shared shell | header88 including white overlap12; nav existing ~92; remaining body flex | estimated/verified source |
| Padding/gap | B12 cards x48–369 | content18–24, card gap12, icon gap12 | estimated |
| Type/control | B12 + P11 | body19, title25, labels18, metadata16; input56; CTA60 | estimated/adapted |
| Radius/border | B12 | card12, controls10, body24, 1px pale border | estimated |
| Icon | UI_STANDARD | lg56/30; stroke1.8; operation-icons.css pastel palette | verified |
| Product thumbnails | existing P06 assets | box/printer demonstration where available, neutral icon for unavailable exact ZD421/DS2208 images | known limitation; no new artwork |

## Data/navigation decisions

- Preserve P12.S01–S04. Explicit document IDs separate from display numbers. Six visible B12 fixture rows; list count reports6 rather than inventing18 unseen records to display24. All fixture/source limitations live outside the app.
- P12 keeps metadata as form state only; P04/P05 remain sole draft/record owners. Inbound supplier/note transferred only to a fresh P04 draft. Existing draft/UNKNOWN preserved and user informed before opening it. P05 retains its required recipient/address/planned validation; P09 retains intake flow.
- Document date is read-only: editable date policy is unverified, P04 createdAt is adapter-owned. Do not invent a required editable date policy.
- P18 source is unavailable: retain B12 attachment metadata as fixture, file buttons disclose unavailability in dialog, never download a fabricated PDF. History uses explicit mapping to existing P08 events only; no event inferred from current status.
- Real backend, attachment contents, hardware, exact designer font/images remain unverified. Review visual separately from fixture behavior.

## Verified implementation follow-through

- Provided B12 is byte-identical to the HEAD Git object; SHA256 in evidence/revision-01/baseline-verification.json. Gallery index still points to the same board.
- P04/P05 confirmed receipts now feed P12 via a read adapter; unverified/draft/UNKNOWN records excluded. Owner draft/submit functions unchanged; result Back preserves exact document ID. Receipt line raw codes are not promoted to verified serials.
- Shared choice-dialog default was changed to dismissOnBackdrop=false by the concurrent authorized dialog synchronization. P12 passes false explicitly. Preserve this newer shared default.
- All4 panels fit six viewports after spacing refinement; 56 Node +18 P12 browser groups +5 history groups PASS. Exact font/product artwork and production still pending.
