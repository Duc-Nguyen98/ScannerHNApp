# M00 Motion Ownership

Motion may only be applied inside the existing owner boundaries below. The harness primitives are not consumers yet.

| Domain / node | Owner | Consumer boards | Motion property/controller boundary |
|---|---|---|---|
| Auth `#app`, `.screen` | `docs/flows/auth-session/app.mjs` | P01 | Local press/feedback only; do not animate auth security teardown. |
| AppShell `.hn-screen`, `fitPreview` | `docs/flows/home/home.mjs` | P02-P24 | Geometry/scale owner. No motion transform on this ancestor. |
| `#hn-destination` route content | Home router (`showRoute`) | P02-P24 | Future RouteTransition owns opacity/local content only; router remains navigation source of truth. |
| `.app-modal-host` / dialog | `shared/app-modal.mjs`, `action-dialog.mjs`, `dialog-route.mjs` | P01-P24 | Overlay enter/exit, focus trap, inert, and scroll lock have one owner. No second dialog controller. |
| P03 `.p03-host` / `.p03-dialog` | scanner dialogs module | P03 | Sheet/dialog local opacity and <=8px translation; preserve existing close/back lifecycle. |
| `.p04-app`, `.p05-app`, scanner status | inbound/outbound modules | P04-P05, P17, P24 | Press/feedback only. Scanner reticle/video and status guards are static by design. |
| `.p06-scroll`, `.p08-scroll`, `.p12-scroll`, `.p20-scroll`, `.p22-scroll`, `.p23-scroll` | respective domain module | P06/P08/P12/P20/P22/P23 | Native scroll owner; no smooth-scroll controller or competing restoration. |
| History/document rows | history/documents modules | P08/P12/P20/P22/P23 | Row feedback inside row content; never animate height/position of a measured/recycled row. |
| Security and session guards | security/profile/auth owners | P01/P10/P11/P14 | Immediate removal/guard. No exit animation retaining protected content. |

Cleanup requirements: cancel WAAPI handles, remove listeners and timers on module dispose, restore focus through existing overlay owner, and ensure rapid navigation leaves only the final valid route. Motion completion must never submit, post, approve, write audit data, alter inventory, or change authentication state.
