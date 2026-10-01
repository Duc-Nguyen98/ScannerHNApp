# Review Flow Integration

Status: local verification passed; publication and complete archive verification are recorded separately in `ARCHIVE_RESULT.json` / `PUBLIC_RESULT.json` when finished.

Changes are scoped to the external review shell and repository handoff material. The app iframe and its owner/session remain the same when opening, changing or closing diagrams. Existing gallery, locked product artwork, business owners, shared motion primitives and fixture data are not redesigned.

- Two diagram tabs, auto-follow current board, independent P00-P24 selection, native scrolling, zoom/fit, separate full-size image and PNG/SVG/Mermaid downloads.
- Desktop side-by-side comparison; mobile closes the diagram back to the same app. Responsive control drawer closes when entering mobile layout so it cannot obscure the flow controls.
- URL state retains type, board and follow policy. Motion/scene settings retain their existing behavior. Hidden/reopened panels do not trigger record/Post or reset the draft.
- All 50 PNGs and all 150 file links were checked. Seven local browser groups passed, including iframe identity/data preservation, keyboard tabs, 360/390/430/1440 layouts and P00 refresh.
- The original design/reference packs and editable app/static source, reports, before/after evidence and all intermediate trace/log artifacts are included in the requested repository archive. Existing remote design objects are kept intact.

Trace scan found no known credential/private-key signatures in 1,810 readable text entries across 272 ZIPs. One pre-existing M09 reduced-motion trace has an incomplete ZIP directory; original bytes are retained, not repaired or relabeled as passing evidence. This signature scan is not a guarantee that historical fixtures are production data-safe; the application remains explicitly a demo.

Local visual evidence: `evidence/local/`. The archival helper maintains a SHA256 manifest and compares Git blob IDs against exact local bytes before promotion. It never removes local files or rewrites the primary checkout index.
