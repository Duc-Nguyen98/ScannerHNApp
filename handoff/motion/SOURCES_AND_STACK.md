# Motion Sources and Stack

This setup follows `MOTION_CONTRACT.md`, `00_CONTRACT_CHUNG.md`, and the retained Flow Gate. Source evidence is local and inspectable; no external package or remote asset was added.

| Decision | Evidence | Status |
|---|---|---|
| Vanilla CSS/WAAPI | Native `.mjs` entrypoints, no package manifest | APPLIED in M00 harness only |
| Native scroll | Existing domain scrollers in `docs/flows/*` | REUSED |
| One overlay owner | `docs/flows/shared/app-modal.mjs`, `action-dialog.mjs`, `dialog-route.mjs` | REUSED |
| No React motion engine | No React/package metadata in editable source | NOT_NEEDED |
| No GSAP/Lenis/Locomotive | No dependency or sequence requiring them | NOT_NEEDED |
| Virtualization | Existing bounded list slices; no stress profile in M00 | DEFERRED |

Harness artifacts: `M00/harness/motion-tokens.css` and `M00/harness/motion-primitives.mjs`. They are not production consumers until the Flow Gate is complete and all affected consumers have evidence.
