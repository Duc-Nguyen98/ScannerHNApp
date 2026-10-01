# ScannerHNApp Public Preview

App: https://duc-nguyen98.github.io/ScannerHNApp/review/?view=app

Review: https://duc-nguyen98.github.io/ScannerHNApp/review/?view=review&panel=P01.S01&motion=auto

Build: `final-2e8357d7f52d`. Public verification status is authoritative in `FINAL_GATE.json` and `DEPLOYMENT.md`.

## Demo

- Use `minhanh` / `preview`. These are published fixture credentials, not a company account. Never enter real credentials or customer data.
- App Preview starts with the existing Login and confirmation screens. Review Mode signs into the demo through the same controls to reconstruct the selected panel.
- Select a board and panel, then **Mo mau**. The interface contains all 24 boards and 91 reference panels. Original, adapted and migrated dispositions are retained.
- Each panel begins a separate in-memory fixture scenario. Related screens within that scenario use the same existing owner, document/case/session identity and receipts.
- Review tools stay outside the app. On mobile, **Cong cu** opens/closes the tool panel. Arrow controls select the preceding/following reference panel.
- **Nap ma mau** uses the current P04/P05 batch tool. **Doc NFC mau** uses the existing NFC simulation. The outcome selector selects confirmed, failed or UNKNOWN through the current owners' fixture controls.
- Motion auto follows the OS; reduced and off use the existing controllers. Changing motion does not reset data or issue business commands.
- **Khoi phuc du lieu mau**, changing panels, or applying another identity asks before resetting. Cancel/Escape keeps the current draft. Reset reloads only this preview iframe; no localStorage.clear(), cross-tab state or production calls are used.
- Refresh restores the scenario in the review URL, not edits made after opening it. Runtime drafts, receipts, changed demo passwords and sessions remain page-memory only. Reload restores the seed; this is not durable WMS storage.
- A cold first load may take longer on a slow connection. Review Mode allows up to 45 seconds for the Home UI module; it does not resend authentication/start/record/Post to fill that wait. If a transport error remains, use **Mo mau** to reload the scenario.

## Important Boundaries

Stock documents wait for Web and do not Post/change inventory. Warranty component issue may Post only after its fixture owner confirms. UNKNOWN keeps the same request for reconciliation. P07 current mappings do not generate P22 audit events; B22 and B23 are explicit review sources. B08/PQ-0001 and B23/PQ-0001 remain distinct. Home's recent-documents View all opens P12; History footer opens P22.

The public build uses two-city geography fixtures already present in tests, matching the owner's pre-July-2025 geography version. This is not current administrative data. Camera/NFC, WMS, notifications, uploads and closing a handoff case are not real integrations. Permission controls simulate preview scope only.

## Bug Report

Use **Mau ghi loi** to copy build, panel, scenario, motion, URL and viewport, then add steps, expected/actual behavior and an image. Nothing is sent automatically. Links are copied only to the clipboard; if clipboard permission is unavailable, the selectable text area appears.

Visual review remains pending; functional/layout checks are not a new design approval or a universal FPS guarantee.
