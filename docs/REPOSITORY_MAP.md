# ScannerHNApp Repository Map

## Deliverables

| Path | Purpose |
|---|---|
| `design/01_Main/BOARDS/` | Original, updated and current board images. Existing Git objects are preserved unchanged. |
| `design/specifications/` | The supplied 24-board contract/prompt/reference pack and Flow/Motion/FINAL pack. Reference documents, not commands executed during archival. |
| `design/flow-reference/` | The two Mermaid reference images supplied for visual style. |
| `assets/`, `docs/assets/` | Approved imagery and design asset sources, retained from repository history. |
| `docs/index.html` | Original gallery, not replaced by the new preview. |
| `docs/flows/` | Editable integrated application owners, adapters, styles, fixtures and motion. |
| `docs/review/` | Public review shell and a self-contained static runtime. |
| `docs/review/flows/` | 50 separate User Flow/Data Flow diagrams, PNG/SVG/Mermaid and index. P00 is foundation, not a new app board. |
| `handoff/P01` ... `handoff/P24` | Board reports, revisions, before/after pictures, test evidence and source checkpoints. |
| `handoff/motion/` | M00-M24 reports, coverage, visual evidence and browser traces. |
| `handoff/flow/`, `handoff/FINAL/` | Integration/public-release gates and their exact evidence. |
| `handoff/FLOW_IMAGES_P00_P24/` | Original flow image deliverables plus source/quality manifests. |
| `scripts/`, `tests/` | Build, renderer, verification and regression tools. Historical scripts are preserved rather than rewritten wholesale. |
| `RUN_STATE.json`, `SCREEN_COVERAGE.csv` | Progress and the original 24-board / 91-panel tracking. |

The user explicitly requested retaining intermediate traces/logs, including failed runs. Such files are diagnostic history, not proof that the current release fails or passes. Current gates and reports identify authoritative evidence. One historical M09 ZIP is incomplete and is retained exactly; see `handoff/REVIEW_FLOW_INTEGRATION/TRACE_SCAN.json`.

## Review Workflow

Open `/ScannerHNApp/review/?view=review&panel=P01.S01&scenario=default&motion=auto`. On a wide desktop, the flow panel opens beside the app. **Sơ đồ** closes/reopens it. **Theo màn đang mở** follows the rendered board; selecting P00-P24 manually makes the diagram independent. User Flow/Data Flow tabs change only the image. Zoom/fit use native scrolling; downloads expose the original PNG, SVG and Mermaid source.

On mobile the diagram replaces the visible app region without reloading the iframe; close it to return to the same draft. Technical controls stay outside product UI. A copied URL retains diagram type/board/follow policy as well as scene and motion mode.

The build copies already-verified runtime source and diagrams. It changes only the public preview's declared geography fixture port and tool visibility/CSP; business owners remain in `docs/flows/`. Review-only UI changes do not reapprove the locked artwork, Home footer, business rules or backend contracts.

## Archive Policy

All existing project source, design, images, before/after snapshots, trace ZIPs and logs are retained. No original evidence is removed to reduce size. An additive temporary index in a separate bare Git repository prepares bounded push batches without resetting the user's dirty checkout. Existing remote-only design/node_modules/history objects remain inherited from the base tree; missing files in a partial checkout are not interpreted as deletions.

The upload uses ordinary Git objects under GitHub's individual-file limits; no paid storage or LFS migration is introduced. The archive branch records transfer checkpoints, then the verified complete tree is promoted by fast-forward. Final commit/count/checksum verification is recorded in `handoff/REVIEW_FLOW_INTEGRATION/ARCHIVE_RESULT.json` when complete.
