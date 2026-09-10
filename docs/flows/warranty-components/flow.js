/* Editable design specification. All records are fixtures; no WMS calls. */
"use strict";
const ASSET_ROOT = "../../assets/scanner-approved/";
const ICONS = {
  back: '<path d="m14 5-7 7 7 7M7 12h14"/>',
  arrow: '<path d="M3 12h17m-6-6 6 6-6 6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  scan: '<path d="M8 3H4a1 1 0 0 0-1 1v4m13-5h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4m8 0h4a1 1 0 0 0 1-1v-4M3 12h18M8 7v3m3-3v3m3-3v3m3-3v3m-9 5v2m3-2v2m3-2v2m3-2v2"/>',
  box: '<path d="m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5M12 13v9M7.5 5.5l9 5"/>',
  tool: '<path d="M15 4a5 5 0 0 0-6 6L3 16a3 3 0 0 0 4 4l6-6a5 5 0 0 0 6-6l-3 3-3-3 3-3z"/>',
  warehouse:
    '<path d="M3 21V9l9-6 9 6v12M3 21h18M7 21V11h10v10M7 15h10M7 18h10"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',
  flash: '<path d="m13 2-8 12h6l-1 8 9-13h-7z"/>',
  keyboard:
    '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  document: '<path d="M14 2H5v20h14V7zM14 2v5h5M8 11h8M8 15h8M8 18h5"/>',
  history: '<path d="M3 5v5h5M3 10a9 9 0 1 1 1 8M12 7v5l3 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  wifi: '<path d="M3 8a14 14 0 0 1 18 0M6 11a9 9 0 0 1 12 0M9 14a5 5 0 0 1 6 0M12 17h.01"/>',
  signal: '<path d="M4 18v-3m5 3v-6m5 6V9m5 9V5"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  refresh:
    '<path d="M20 5v5h-5M4 19v-5h5M20 10a8 8 0 0 0-14-5M4 14a8 8 0 0 0 14 5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  nfc: '<path d="M5 5a10 10 0 0 0 0 14M8 8a6 6 0 0 0 0 8M19 5a10 10 0 0 1 0 14M16 8a6 6 0 0 1 0 8"/><circle cx="12" cy="12" r="1"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v12h5"/>',
  monitor:
    '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v4M8 21h8"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2zM7 3v6h9V3M7 21v-8h10v8"/>',
};
const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${
    ICONS[name] || ICONS.box
  }</svg>`;
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
const SCENES = {
  scan: "Quét linh kiện / mã hộp",
  quantity: "Nhập số lượng hộp",
  review: "Xác nhận xuất linh kiện",
  success: "Xuất thành công",
  history: "Phiếu linh kiện đã xuất",
  "history-loading": "Tải thêm lịch sử",
  "history-error": "Lỗi tải lịch sử",
  empty: "Chưa có phiếu xuất",
  drafts: "Phiếu đang thực hiện",
  resume: "Tiếp tục đúng phiếu",
  reconcile: "Cần đối chiếu trên Web",
  "post-check": "Kiểm tra kết quả xuất",
  "history-hub": "Lịch sử thao tác",
  nfc: "Lịch sử NFC",
  "nfc-detail": "Chi tiết thao tác NFC",
  "events-unavailable": "Chưa có dữ liệu lịch sử",
  warranty: "Lịch sử bảo hành",
  "warranty-detail": "Quá trình xử lý hồ sơ",
  sessions: "Lịch sử phiên quét",
  "session-detail": "Chi tiết phiên quét",
  "quantity-invalid": "Số lượng vượt tồn",
  "scan-error": "Mã chưa thể xuất",
  "waiting-web": "Chờ xử lý trên Web",
  documents: "Lịch sử nhập / xuất",
  closed: "Hồ sơ đã trả khách",
};
const BOARDS = {
  17: {
    title: "Xuất linh kiện phục vụ bảo hành",
    sub: "Quét mã → kiểm tra → xác nhận xuất trực tiếp",
    scenes: ["scan", "quantity", "review", "success"],
    file: "17_xuat_linh_kien_bao_hanh.png",
  },
  18: {
    title: "Lịch sử linh kiện trong hồ sơ",
    sub: "Chỉ phiếu đã xuất · tải thêm · giữ dữ liệu khi lỗi",
    scenes: ["history", "history-loading", "history-error", "empty"],
    file: "18_lich_su_linh_kien.png",
  },
  19: {
    title: "Tiếp tục phiếu đang thực hiện",
    sub: "Giữ đúng phiếu · khôi phục mã đã quét · đối chiếu khi chưa rõ kết quả",
    scenes: ["drafts", "resume", "reconcile", "post-check"],
    file: "19_tiep_tuc_phieu_linh_kien.png",
  },
  20: {
    title: "Lịch sử thao tác & NFC",
    sub: "Danh sách → chi tiết sự kiện · trạng thái chưa có dữ liệu",
    scenes: ["history-hub", "nfc", "nfc-detail", "events-unavailable"],
    file: "20_lich_su_thao_tac_nfc.png",
  },
  21: {
    title: "Bảo hành & phiên quét",
    sub: "Dùng lại hồ sơ bảo hành · xem diễn biến từng phiên",
    scenes: ["warranty", "warranty-detail", "sessions", "session-detail"],
    file: "21_lich_su_bao_hanh_phien_quet.png",
  },
  22: {
    title: "Trạng thái xử lý khi quét",
    sub: "Số lượng · mã không hợp lệ · chờ Web · hồ sơ đã đóng",
    scenes: ["quantity-invalid", "scan-error", "waiting-web", "closed"],
    file: "22_trang_thai_scanner.png",
  },
};
const params = new URLSearchParams(location.search);
const mode = ["screen", "board"].includes(params.get("mode"))
  ? params.get("mode")
  : "interactive";
const boardId = Object.hasOwn(BOARDS, params.get("board"))
  ? params.get("board")
  : "17";
let selected = Object.hasOwn(SCENES, params.get("scene"))
  ? params.get("scene")
  : "scan";
const sceneStates = new WeakMap();
const fullDraft = () => [
  {
    code: "LK0001-HN001",
    sku: "LK-0001",
    name: "Đầu in nhiệt XP-420B",
    quantity: 1,
    kind: "ITEM",
  },
  {
    code: "BOX-LK-0002-01",
    sku: "LK-0002",
    name: "Adapter nguồn 24V",
    quantity: 2,
    kind: "BOX",
  },
];
const STORAGE_KEY = "hn-scanner-design-preview-v3";
const total = (draft) => draft.reduce((s, r) => s + r.quantity, 0);
const badge = (text, tone = "") =>
  `<span class="badge ${tone}">${esc(text)}</span>`;
const primary = (label, action, disabled = false, glyph = "arrow") =>
  `<button class="primary" data-action="${action}" ${
    disabled ? "disabled" : ""
  }>${esc(label)}${icon(glyph, "small")}</button>`;
const secondary = (label, action) =>
  `<button class="secondary" data-action="${action}">${esc(label)}</button>`;
const hint = (text, tone = "") =>
  `<div class="hint ${tone}">${icon("info")}<span>${esc(text)}</span></div>`;
const kv = (label, value) =>
  `<div class="kv"><span>${esc(label)}</span><strong>${esc(
    value
  )}</strong></div>`;
const gesture = '<div class="gesture" aria-hidden="true"></div>';
function footer(content) {
  return `<footer class="phone-footer">${content}${gesture}</footer>`;
}
function header(title, back = "back") {
  return `<header class="phone-header"><div class="statusbar"><span>9:41</span><div class="device">${icon(
    "signal"
  )}${icon(
    "wifi"
  )}<span class="battery"></span></div></div><div class="titlebar"><button class="icon-button" aria-label="Quay lại" data-action="${back}">${icon(
    "back"
  )}</button><h1>${esc(title)}</h1><span></span></div></header>`;
}
function steps(current) {
  return `<div class="steps" aria-label="Bước ${current + 1} trên 3">${[
    "Quét mã",
    "Kiểm tra",
    "Kết quả",
  ]
    .map(
      (s, i) =>
        `${i ? '<span class="step-line"></span>' : ""}<span class="step ${
          i === current ? "active" : i < current ? "past" : ""
        }"><i>${i < current ? "✓" : i + 1}</i>${s}</span>`
    )
    .join("")}</div>`;
}
function caseContext(closed = false) {
  return `<section class="card case-context"><div class="row"><div class="icon-tile">${icon(
    "tool"
  )}</div><div class="grow"><strong class="case-id">BH-001</strong><p class="model">Máy in nhiệt XP-420B</p></div>${badge(
    closed ? "Đã trả khách" : "Đang kiểm tra",
    closed ? "green" : ""
  )}</div></section>`;
}
function warehouse() {
  return `<div class="warehouse-fixed"><div class="row">${icon(
    "warehouse"
  )}<div><span class="tiny muted">Kho xuất</span><strong>Kho Hoa Nam</strong></div></div>${icon(
    "lock",
    "small"
  )}</div>`;
}
function partCard(item, index, locked = false) {
  return `<article class="card part"><div class="icon-tile ${
    item.kind === "BOX" ? "warm" : ""
  }">${icon(item.kind === "BOX" ? "box" : "tool")}</div><div><h3>${esc(
    item.sku
  )}</h3><p>${esc(item.name)}</p><span class="code">${esc(
    item.code
  )}</span><div class="part-bottom">${badge(
    locked
      ? "Đã lưu trên phiếu"
      : item.kind === "BOX"
      ? "Mã hộp"
      : "Mã linh kiện",
    locked ? "green" : ""
  )}<span class="quantity">× ${item.quantity}</span></div></div>${
    locked
      ? `<span class="remove" aria-label="Mã đã lưu trên phiếu">${icon(
          "lock"
        )}</span>`
      : `<button class="remove" data-action="remove" data-index="${index}" aria-label="Bỏ ${esc(
          item.sku
        )} khỏi danh sách">${icon("trash")}</button>`
  }</article>`;
}
function camera() {
  return `<div class="camera"><img src="${ASSET_ROOT}01_backgrounds/bg_shelf_detail_4k_enhanced.jpg" alt="Mã trên hộp linh kiện trong kho"><div class="camera-corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="scan-line" aria-hidden="true"></div><span class="camera-prompt">Giữ mã trong khung để nhận diện</span></div>`;
}
function scanView(state) {
  const n = state.draft.length,
    last = state.draft.at(-1);
  return `${header("Xuất linh kiện bảo hành")}<div class="body">${steps(
    0
  )}${caseContext()}<div class="scan-heading"><div class="icon-tile">${icon(
    "scan"
  )}</div><div><h2>Quét linh kiện hoặc mã hộp</h2><p class="small-copy muted">${
    state.documentId
      ? `Tiếp tục phiếu ${esc(state.documentId)}`
      : "Thêm linh kiện cho hồ sơ BH-001."
  }</p></div></div>${camera()}<div class="scan-tools"><button class="soft-button" data-action="light" aria-pressed="false">${icon(
    "flash",
    "small"
  )}Bật đèn</button><button class="soft-button" data-action="manual">${icon(
    "keyboard",
    "small"
  )}Nhập mã</button></div><section class="card"><div class="row between"><div class="count-value">${n}<span>mã đã quét</span></div><div class="inline-success">${icon(
    n ? "check" : "scan",
    "small"
  )}${n ? "Đã nhận diện" : "Sẵn sàng quét"}</div></div>${
    last
      ? `<div class="scan-record">${icon("box")}<div class="grow"><strong>${esc(
          last.sku
        )}</strong><p class="tiny muted">${esc(last.name)}</p></div><strong>× ${
          last.quantity
        }</strong></div>`
      : ""
  }</section>${hint(
    "Quét mã chỉ thêm vào danh sách. Xác nhận xuất mới làm thay đổi tồn kho."
  )}</div>${footer(primary("Kiểm tra linh kiện", "review", !n))}`;
}
function quantitySheet(invalid = false) {
  return `<button class="sheet-backdrop" data-action="dismiss" aria-label="Đóng hộp số lượng"></button><section class="sheet" role="dialog" aria-modal="true" aria-label="Hộp linh kiện" tabindex="-1"><div class="sheet-grip"></div><div class="sheet-title"><h2>Hộp linh kiện</h2><button class="icon-button" data-action="dismiss" aria-label="Đóng">${icon(
    "close"
  )}</button></div><div class="sheet-item"><div class="icon-tile warm">${icon(
    "box",
    "large"
  )}</div><div><strong>LK-0002</strong><p>Adapter nguồn 24V</p><p class="tiny">BOX-LK-0002-01</p></div></div><div class="stock-row"><span>Hộp số 01</span><strong>Tồn khả dụng: 12</strong></div><label class="field-label">Số lượng linh kiện cần xuất <span class="required">*</span><span class="quantity-input"><button type="button" data-action="decrease" aria-label="Giảm số lượng">${icon(
    "minus"
  )}</button><input aria-label="Số lượng linh kiện cần xuất" data-field="box-quantity" inputmode="numeric" value="${
    invalid ? "13" : "2"
  }" ${
    invalid ? 'aria-invalid="true"' : ""
  }><button type="button" data-action="increase" aria-label="Tăng số lượng">${icon(
    "plus"
  )}</button></span></label><p class="quantity-help">Nhập số lượng cần dùng cho hồ sơ BH-001.</p><p class="field-error" data-error="quantity" role="alert">${
    invalid ? "Số lượng cần xuất vượt tồn khả dụng của hộp (12)." : ""
  }</p>${hint("Chỉ xác nhận số lượng. Bước này chưa xuất kho.")}${primary(
    "Xác nhận số lượng",
    "confirm-quantity",
    false,
    "check"
  )}<button class="text-button" data-action="dismiss">Hủy</button>${gesture}</section>`;
}
function reviewView(state) {
  return `${header("Xác nhận xuất linh kiện")}<div class="body">${steps(
    1
  )}${caseContext()}${warehouse()}${
    state.documentId
      ? `<div class="tiny muted">Đang tiếp tục phiếu <strong>${esc(
          state.documentId
        )}</strong></div>`
      : ""
  }<div class="row between"><h2 class="section-title">Danh sách linh kiện</h2><span class="tiny muted">${
    state.draft.length
  } mã/hộp</span></div><div class="parts">${
    state.draft.length
      ? state.draft
          .map((r, i) => partCard(r, i, state.recordedCodes.includes(r.code)))
          .join("")
      : '<div class="card empty-state"><p>Chưa có linh kiện trong danh sách.</p></div>'
  }</div>${hint(
    "Xác nhận để xuất linh kiện ngay cho hồ sơ này."
  )}</div>${footer(
    `<div class="footer-total"><span>${
      state.draft.length
    } mã/hộp</span><strong>${total(
      state.draft
    )} linh kiện</strong></div>${primary(
      "Xác nhận xuất linh kiện",
      "submit",
      !state.draft.length
    )}<button class="text-button" data-action="scan">${icon(
      "back",
      "small"
    )}Quay lại quét</button>`
  )}`;
}
function successView(state) {
  return `${header(
    "Đã xuất linh kiện",
    "history"
  )}<div class="body success-body">${steps(
    2
  )}<div class="success-intro"><div class="success-mark"><div class="inner">${icon(
    "check"
  )}</div></div><h2>Xuất linh kiện<br>thành công</h2>${badge(
    "Đã xuất",
    "green"
  )}<p>Linh kiện đã được xuất cho hồ sơ BH-001.<br>Bạn có thể xem lại trong hồ sơ bảo hành.</p></div><section class="card summary-card">${kv(
    "Phiếu xuất",
    state.documentId || "XLK-0002"
  )}${kv("Hồ sơ bảo hành", "BH-001")}${kv(
    "Số mã/hộp",
    String(state.draft.length)
  )}${kv(
    "Tổng số lượng",
    `${total(state.draft)} linh kiện`
  )}</section><div class="success-tip">${icon(
    "history"
  )}<span>Phiếu đã xuất được lưu theo hồ sơ.</span></div></div>${footer(
    primary("Về hồ sơ bảo hành", "history")
  )}`;
}
const HISTORY_FIXTURES = [
  { id: "XLK-0002", at: "10/09/2026 · 14:45", lines: fullDraft() },
  {
    id: "XLK-0001",
    at: "09/09/2026 · 16:10",
    lines: [{ ...fullDraft()[1], quantity: 1 }],
  },
  { id: "XLK-0000", at: "08/09/2026 · 09:20", lines: [{ ...fullDraft()[0] }] },
];
function issuedDoc(doc) {
  return `<article class="issue-document" data-document-id="${esc(
    doc.id
  )}"><div class="document-heading"><div class="row">${icon(
    "document"
  )}<strong>${esc(doc.id)}</strong></div>${badge(
    "Đã xuất",
    "green"
  )}</div><p class="issue-time">${esc(doc.at)}</p>${doc.lines
    .map(
      (r) =>
        `<div class="issued-line"><div><strong>${esc(r.sku)}</strong><p>${esc(
          r.name
        )}</p></div><div class="issued-qty">${
          r.quantity
        } linh kiện<small>1 mã/hộp</small></div></div>`
    )
    .join("")}</article>`;
}
function caseSummary(closed = false) {
  return `<section class="card case-detail"><div class="row"><div class="icon-tile">${icon(
    "tool"
  )}</div><div class="grow"><strong class="case-id">BH-001</strong><p class="small-copy muted">Máy in nhiệt XP-420B</p></div>${badge(
    closed ? "Đã trả khách" : "Đang kiểm tra",
    closed ? "green" : ""
  )}</div><span class="serial">SN: HN12345</span><div class="divider"></div><div class="row between small-copy"><span class="muted">Khách hàng</span><strong>Công ty Minh Phát</strong></div></section>`;
}
function historyView(state) {
  const empty = state.scene === "empty",
    error = state.scene === "history-error",
    loading = state.scene === "history-loading",
    closed = state.scene === "closed";
  const docs = empty ? [] : state.historyDocs;
  return `${header(
    "Hồ sơ bảo hành",
    "history-hub"
  )}<div class="body">${caseSummary(
    closed
  )}<section class="card history-block"><div class="history-title"><h2>Linh kiện đã xuất</h2>${badge(
    `${docs.length} phiếu đã tải`,
    docs.length ? "green" : ""
  )}</div><p class="history-description">Phiếu đã xác nhận xuất kho cho hồ sơ này.</p>${
    empty
      ? `<div class="empty-state"><div class="icon-tile">${icon(
          "box",
          "large"
        )}</div><h3>Chưa có linh kiện đã xuất</h3><p>Phiếu xuất sẽ xuất hiện ở đây sau khi được xác nhận.</p></div>`
      : docs.map(issuedDoc).join("")
  }${
    loading
      ? '<div class="loading-rows" role="status"><div class="skeleton"></div><span class="tiny muted">Đang tải thêm phiếu…</span></div>'
      : error
      ? `<div class="more-error">${hint(
          "Chưa tải được các phiếu tiếp theo. Phiếu đã tải vẫn được giữ lại.",
          "danger"
        )}${secondary("Thử tải lại", "load-more")}</div>`
      : !empty
      ? state.hasMore
        ? secondary("Tải thêm phiếu", "load-more")
        : '<p class="end-list" role="status">Đã hiển thị hết phiếu đã xuất.</p>'
      : ""
  }</section>${
    closed
      ? hint("Hồ sơ đã trả khách. Bạn vẫn có thể xem các phiếu đã xuất.")
      : ""
  }<button class="case-more link-row" data-action="warranty-detail">Thông tin & quá trình xử lý ${icon(
    "arrow",
    "small"
  )}</button></div>${footer(
    closed
      ? secondary("Về lịch sử", "history-hub")
      : primary("Xuất linh kiện", "new-issue", false, "plus")
  )}`;
}
function draftCard(state, action = "resume") {
  return `<button class="card draft-card" data-action="${action}"><div class="row between"><strong>${esc(
    state.documentId || "Phiên quét đã lưu"
  )}</strong>${badge(
    state.scanCheckpoint === "UNKNOWN" ? "Cần đối chiếu" : "Đang thực hiện",
    "amber"
  )}</div><p>BH-001 · Máy in nhiệt XP-420B</p><div class="row between tiny muted"><span>Kho Hoa Nam</span><span>14:42 · Hôm nay</span></div><div class="row between small-copy gap-top"><span>Đã lưu ${
    state.draft.length
  } mã · ${total(state.draft)} linh kiện</span>${icon(
    "arrow",
    "small"
  )}</div></button>`;
}
function draftsView(state) {
  return `${header(
    "Phiếu đang thực hiện",
    "history-hub"
  )}<div class="body"><div class="row between"><h2 class="section-title">Tiếp tục công việc</h2>${badge(
    "1 phiếu",
    "amber"
  )}</div><p class="small-copy muted">Mở lại phiếu đã lưu để tiếp tục quét.</p>${draftCard(
    state
  )}${hint(
    "Các mã đã lưu trên phiếu được giữ lại khi bạn tiếp tục."
  )}<div class="card small-copy muted">Phiếu đã xuất chỉ hiển thị trong lịch sử và không thể quét tiếp.</div></div>${footer(
    secondary("Về lịch sử", "history-hub")
  )}`;
}
function resumeView(state) {
  return `${header(
    "Tiếp tục phiếu linh kiện",
    "drafts"
  )}<div class="body">${caseContext()}<section class="card"><div class="row between"><strong class="case-id">${esc(
    state.documentId || "Phiên quét đã lưu"
  )}</strong>${badge(
    "Chưa xuất kho",
    "amber"
  )}</div><p class="small-copy muted gap-top">Dữ liệu đã lưu lúc 14:42 · Hôm nay</p></section>${warehouse()}<div class="row between"><h2 class="section-title">Mã đã lưu trong phiên</h2>${badge(
    `${state.draft.length} mã`
  )}</div>${state.draft
    .map((r, i) => partCard(r, i, state.recordedCodes.includes(r.code)))
    .join("")}${hint(
    "Không cần quét lại mã đã lưu. Bạn sẽ tiếp tục trên đúng phiên này."
  )}<div class="checkpoint"><span>${icon("check", "small")}${
    state.documentId
      ? "Đã tải lại dữ liệu phiếu"
      : "Đã khôi phục dữ liệu trên thiết bị"
  }</span><span>${icon(
    "check",
    "small"
  )}Mã đã lưu trên phiếu được xác minh</span><span>${icon(
    "clock",
    "small"
  )}Chưa xác nhận xuất kho</span></div></div>${footer(
    primary("Tiếp tục quét", "continue-scan") +
      secondary("Kiểm tra phiếu", "review")
  )}`;
}
function reconcileView(state) {
  return `${header(
    "Cần đối chiếu trên Web",
    "drafts"
  )}<div class="body"><div class="empty-state reconcile-intro"><div class="icon-tile warm">${icon(
    "monitor",
    "large"
  )}</div><h3>Chưa xác minh được mã đã quét</h3><p>Phiếu được giữ lại để đối chiếu.<br>Không quét hoặc gửi lại phiếu lúc này.</p></div><section class="card summary-card">${kv(
    "Phiếu xuất",
    state.documentId || "XLK-0002"
  )}${kv("Hồ sơ", "BH-001")}${kv("Kho", "Kho Hoa Nam")}${kv(
    "Lần lưu gần nhất",
    "10/09/2026 · 14:42"
  )}</section>${hint(
    "Mở đúng phiếu trên Web WMS để kiểm tra mã đã ghi nhận và kết quả xuất.",
    "warning"
  )}<p class="small-copy muted">Sau khi đối chiếu, người quản lý sẽ hướng dẫn bước tiếp theo.</p></div>${footer(
    primary("Hướng dẫn đối chiếu", "web-guide", false, "monitor") +
      secondary("Về phiếu đang thực hiện", "drafts")
  )}`;
}
function postCheckView(state) {
  return `${header(
    "Kiểm tra kết quả xuất",
    "drafts"
  )}<div class="body"><div class="empty-state reconcile-intro"><div class="icon-tile">${icon(
    "clock",
    "large"
  )}</div><h3>Đang chờ xác định kết quả</h3><p>Yêu cầu xác nhận đã được gửi.<br>Không gửi lại khi chưa rõ kết quả.</p></div><section class="card summary-card">${kv(
    "Phiếu xuất",
    state.documentId || "XLK-0002"
  )}${kv("Hồ sơ", "BH-001")}${kv("Số mã/hộp", "2")}${kv(
    "Tổng số lượng",
    "3 linh kiện"
  )}</section>${hint(
    "Kiểm tra trạng thái phiếu trước khi tiếp tục để tránh xuất trùng.",
    "warning"
  )}</div>${footer(
    primary("Kiểm tra kết quả", "check-post", false, "refresh") +
      secondary("Đối chiếu trên Web", "web-guide")
  )}`;
}
const NFC_EVENTS = [
  {
    id: "NFC-E003",
    type: "Gán thẻ",
    time: "14:35",
    date: "Hôm nay · 10/09",
    uid: "NFC-8A2F",
    serial: "HN12345",
    actor: "Minh Anh",
    status: "Thành công",
  },
  {
    id: "NFC-E002",
    type: "Thay thẻ",
    time: "11:20",
    date: "Hôm nay · 10/09",
    uid: "NFC-7B10",
    serial: "HN12346",
    actor: "Minh Anh",
    status: "Thành công",
  },
  {
    id: "NFC-E001",
    type: "Thu hồi thẻ",
    time: "09:15",
    date: "Hôm nay · 10/09",
    uid: "NFC-5C22",
    serial: "HN12347",
    actor: "Minh Anh",
    status: "Đã thu hồi",
  },
];
const SESSION_EVENTS = [
  {
    id: "PQ-0003",
    type: "Xuất linh kiện",
    time: "14:30 – 14:45",
    count: "2 mã · 3 linh kiện",
    status: "Đã xuất",
    doc: "XLK-0002",
  },
  {
    id: "PQ-0002",
    type: "Nhập kho",
    time: "11:10 – 11:25",
    count: "12 mã được ghi nhận",
    status: "Chờ xử lý trên Web",
    doc: "PN-0005",
  },
  {
    id: "PQ-0001",
    type: "Tra cứu",
    time: "09:00 – 09:08",
    count: "5 lượt tra cứu",
    status: "Đã kết thúc",
    doc: "Không tạo phiếu",
  },
];
function filterButtons(values, active, kind) {
  return `<div class="filter-row" role="group" aria-label="Lọc ${kind}">${values
    .map(
      (v) =>
        `<button class="filter-chip ${
          v === active ? "active" : ""
        }" data-action="filter" data-kind="${kind}" data-value="${esc(
          v
        )}">${esc(v)}</button>`
    )
    .join("")}</div>`;
}
function historyHub() {
  const links = [
    [
      "document",
      "Nhập / xuất",
      "Phiếu đã gửi và trạng thái xử lý",
      "documents",
    ],
    ["nfc", "NFC", "Gán, thay và thu hồi thẻ", "nfc"],
    ["tool", "Bảo hành", "Hồ sơ và quá trình xử lý", "warranty"],
    ["scan", "Phiên quét", "Mã đã quét, thời gian và kết quả", "sessions"],
  ];
  return `${header(
    "Lịch sử thao tác",
    "exit"
  )}<div class="body"><div class="history-intro"><p class="eyebrow">KHO HOA NAM</p><h2>Xem lại công việc<br>đã thực hiện</h2><p class="small-copy muted">Tra cứu theo nghiệp vụ để mở đúng phiếu.</p></div><div class="history-links">${links
    .map(
      ([i, title, sub, action]) =>
        `<button class="card history-link" data-action="${action}"><span class="icon-tile">${icon(
          i
        )}</span><span class="grow"><strong>${title}</strong><small>${sub}</small></span>${icon(
          "arrow",
          "small"
        )}</button>`
    )
    .join(
      ""
    )}</div><button class="card resume-shortcut" data-action="drafts"><div class="row">${icon(
    "save"
  )}<div class="grow"><strong>Tiếp tục phiếu dở</strong><p class="small-copy muted">1 phiếu linh kiện đang thực hiện</p></div>${badge(
    "1",
    "amber"
  )}</div></button></div>${footer(secondary("Về Trang chủ", "exit"))}`;
}
function nfcView(state) {
  const list = NFC_EVENTS.filter(
    (e) => state.filter === "Tất cả" || e.type === state.filter
  );
  return `${header(
    "Lịch sử NFC",
    "history-hub"
  )}<div class="body"><p class="small-copy muted">Các thao tác đã ghi nhận trên thẻ NFC.</p>${filterButtons(
    ["Tất cả", "Gán thẻ", "Thay thẻ", "Thu hồi thẻ"],
    state.filter,
    "NFC"
  )}<label class="search-field">${icon(
    "search",
    "small"
  )}<input data-search="nfc" placeholder="Tìm UID hoặc serial" aria-label="Tìm UID hoặc serial"></label><div class="row between"><h2 class="section-title">Hôm nay</h2><span class="tiny muted">${
    list.length
  } thao tác</span></div><div class="event-list">${list
    .map(
      (e) =>
        `<button class="card event-card" data-action="nfc-detail" data-event="${
          e.id
        }" data-search-text="${e.uid} ${
          e.serial
        }"><div class="row between"><span class="row">${icon("nfc")}<strong>${
          e.type
        }</strong></span><time>${e.time}</time></div><p>${e.uid} <span>· ${
          e.serial
        }</span></p><div class="row between">${badge(
          e.status,
          e.type === "Thu hồi thẻ" ? "amber" : "green"
        )}<span class="tiny muted">${e.actor} ${icon(
          "arrow",
          "small"
        )}</span></div></button>`
    )
    .join(
      ""
    )}</div><p class="search-empty tiny muted" hidden>Không có thao tác khớp từ khóa.</p><p class="end-list">Đã hiển thị hết thao tác trong khoảng này.</p></div>${footer(
    secondary("Về lịch sử thao tác", "history-hub")
  )}`;
}
function nfcDetail(state) {
  const e = NFC_EVENTS.find((r) => r.id === state.eventId) || NFC_EVENTS[0];
  return `${header(
    "Chi tiết thao tác NFC",
    "nfc"
  )}<div class="body"><section class="card event-detail-heading"><div class="icon-tile">${icon(
    "nfc",
    "large"
  )}</div><h2>${e.type}</h2>${badge(
    e.status,
    e.type === "Thu hồi thẻ" ? "amber" : "green"
  )}</section><section class="card summary-card">${kv("UID thẻ", e.uid)}${kv(
    "Serial sản phẩm",
    e.serial
  )}${kv("Sản phẩm", "Máy in nhiệt XP-420B")}${kv(
    "Người thực hiện",
    e.actor
  )}${kv("Thời điểm", `10/09/2026 · ${e.time}`)}${kv(
    "Kho",
    "Kho Hoa Nam"
  )}</section><div class="card"><h3 class="section-title">Nội dung thao tác</h3><p class="small-copy muted gap-top">${
    e.type === "Gán thẻ"
      ? "Thẻ đã được liên kết với sản phẩm sau khi ghi và đọc lại nội dung thành công."
      : e.type === "Thay thẻ"
      ? "Thẻ mới đã thay thế thẻ cũ của sản phẩm."
      : "Thẻ đã ngừng sử dụng; dữ liệu truy vết được giữ lại."
  }</p></div>${hint(
    "Lịch sử chỉ dùng để xem lại thao tác, không thay đổi trạng thái thẻ."
  )}</div>${footer(secondary("Về lịch sử NFC", "nfc"))}`;
}
function unavailable() {
  return `${header(
    "Lịch sử NFC",
    "history-hub"
  )}<div class="body"><div class="empty-state empty-large"><div class="icon-tile">${icon(
    "history",
    "large"
  )}</div><h3>Chưa có dữ liệu lịch sử</h3><p>Danh sách thao tác hiện chưa khả dụng.<br>Bạn có thể kiểm tra lại sau.</p></div>${hint(
    "Bạn vẫn có thể sử dụng các chức năng quét mã."
  )}</div>${footer(
    primary("Tải lại lịch sử", "retry-unavailable", false, "refresh") +
      secondary("Về lịch sử thao tác", "history-hub")
  )}`;
}
function warrantyView(state) {
  const rows = [
    {
      id: "BH-001",
      model: "Máy in nhiệt XP-420B",
      serial: "HN12345",
      status: "Đang kiểm tra",
      time: "14:35",
    },
    {
      id: "BH-002",
      model: "Máy quét mã vạch ZD421",
      serial: "HN12346",
      status: "Đã trả khách",
      time: "11:20",
    },
  ].filter((r) => state.filter === "Tất cả" || state.filter === r.status);
  return `${header(
    "Lịch sử bảo hành",
    "history-hub"
  )}<div class="body"><p class="small-copy muted">Mở hồ sơ để xem quá trình xử lý và linh kiện đã xuất.</p>${filterButtons(
    ["Tất cả", "Đang kiểm tra", "Đã trả khách"],
    state.filter,
    "bảo hành"
  )}<label class="search-field">${icon(
    "search",
    "small"
  )}<input data-search="warranty" placeholder="Tìm mã hồ sơ hoặc serial" aria-label="Tìm mã hồ sơ hoặc serial"></label><div class="event-list">${rows
    .map(
      (r) =>
        `<button class="card event-card" data-action="warranty-detail" data-case="${
          r.id
        }" data-search-text="${r.id} ${
          r.serial
        }"><div class="row between"><strong>${r.id}</strong>${badge(
          r.status,
          r.status === "Đã trả khách" ? "green" : ""
        )}</div><p>${
          r.model
        }</p><div class="row between tiny muted"><span>SN: ${
          r.serial
        }</span><span>10/09 · ${r.time}</span></div></button>`
    )
    .join(
      ""
    )}</div><p class="search-empty tiny muted" hidden>Không có hồ sơ khớp từ khóa.</p><p class="end-list">Đã hiển thị hết hồ sơ trong khoảng này.</p></div>${footer(
    secondary("Về lịch sử thao tác", "history-hub")
  )}`;
}
function warrantyDetail(state) {
  const closed = state.caseId === "BH-002";
  const entries = closed
    ? [
        ["Đã trả khách", "10/09 · 11:20", "Bàn giao thiết bị sau kiểm tra."],
        [
          "Hoàn tất sửa chữa",
          "10/09 · 10:45",
          "Thiết bị hoạt động bình thường.",
        ],
        ["Đã tiếp nhận", "09/09 · 16:10", "Tiếp nhận thiết bị để kiểm tra."],
      ]
    : [
        ["Đang kiểm tra", "10/09 · 14:30", "Kiểm tra nguồn và bo mạch."],
        ["Đã tiếp nhận", "10/09 · 08:32", "Máy không lên nguồn."],
      ];
  return `${header(
    "Quá trình bảo hành",
    "warranty"
  )}<div class="body"><section class="card"><div class="row between"><strong class="case-id">${
    closed ? "BH-002" : "BH-001"
  }</strong>${badge(
    closed ? "Đã trả khách" : "Đang kiểm tra",
    closed ? "green" : ""
  )}</div><p class="small-copy muted gap-top">${
    closed
      ? "Máy quét mã vạch ZD421 · HN12346"
      : "Máy in nhiệt XP-420B · HN12345"
  }</p></section><h2 class="section-title">Quá trình xử lý</h2><ol class="timeline">${entries
    .map(
      ([name, time, note]) =>
        `<li><span class="timeline-dot">${icon(
          "check",
          "small"
        )}</span><div><h3>${name}</h3><time>${time} · Minh Anh</time><p>${note}</p></div></li>`
    )
    .join("")}</ol>${
    closed
      ? ""
      : `<button class="card history-link" data-action="history"><span class="icon-tile">${icon(
          "box"
        )}</span><span class="grow"><strong>Linh kiện đã xuất</strong><small>Xem phiếu xuất theo hồ sơ</small></span>${icon(
          "arrow",
          "small"
        )}</button>`
  }${hint("Thông tin được xem lại từ hồ sơ bảo hành hiện có.")}</div>${footer(
    secondary("Về lịch sử bảo hành", "warranty")
  )}`;
}
function sessionsView(state) {
  const list = SESSION_EVENTS.filter(
    (e) => state.filter === "Tất cả" || e.type === state.filter
  );
  return `${header(
    "Lịch sử phiên quét",
    "history-hub"
  )}<div class="body">${filterButtons(
    ["Tất cả", "Nhập kho", "Xuất linh kiện", "Tra cứu"],
    state.filter,
    "phiên quét"
  )}<div class="row between"><h2 class="section-title">Hôm nay · 10/09</h2><span class="tiny muted">${
    list.length
  } phiên</span></div><div class="event-list">${list
    .map(
      (e) =>
        `<button class="card event-card" data-action="session-detail" data-session="${
          e.id
        }"><div class="row between"><span class="row">${icon("scan")}<strong>${
          e.type
        }</strong></span><span class="tiny muted">${e.id}</span></div><p>${
          e.time
        }</p><div class="small-copy muted">${
          e.count
        }</div><div class="row between gap-top">${badge(
          e.status,
          e.type === "Nhập kho" ? "amber" : "green"
        )}${icon("arrow", "small")}</div></button>`
    )
    .join(
      ""
    )}</div><p class="end-list">Đã hiển thị hết phiên đã kết thúc.</p></div>${footer(
    secondary("Về lịch sử thao tác", "history-hub")
  )}`;
}
function sessionDetail(state) {
  const e =
    SESSION_EVENTS.find((r) => r.id === state.sessionId) || SESSION_EVENTS[0];
  const component = e.type === "Xuất linh kiện";
  return `${header(
    "Chi tiết phiên quét",
    "sessions"
  )}<div class="body"><section class="card"><div class="row between"><strong class="case-id">${
    e.id
  }</strong>${badge(
    e.status,
    e.type === "Nhập kho" ? "amber" : "green"
  )}</div><p class="small-copy muted gap-top">${
    e.type
  } · 10/09/2026</p></section><section class="card summary-card">${kv(
    "Thời gian",
    e.time
  )}${kv("Người quét", "Minh Anh")}${kv("Kho", "Kho Hoa Nam")}${kv(
    "Phiếu liên quan",
    e.doc
  )}</section><div class="stat-strip"><div><strong>${
    component ? "2" : e.type === "Nhập kho" ? "12" : "5"
  }</strong><span>Mã / lượt hợp lệ</span></div><div><strong>0</strong><span>Mã bị từ chối</span></div><div><strong>${
    component ? "3" : "—"
  }</strong><span>${
    component ? "Linh kiện" : "Không áp dụng"
  }</span></div></div><h2 class="section-title">${
    component ? "Mã đã ghi nhận" : "Kết quả phiên"
  }</h2>${
    component
      ? `<div class="card"><div class="session-code"><strong>LK0001-HN001</strong><span>14:31 · 1 linh kiện</span></div><div class="session-code"><strong>BOX-LK-0002-01</strong><span>14:33 · 2 linh kiện</span></div></div>`
      : hint(
          e.type === "Nhập kho"
            ? "Phiếu đã gửi và chờ xử lý trên Web."
            : "Phiên tra cứu đã kết thúc, không tạo phiếu kho."
        )
  }</div>${footer(secondary("Về lịch sử phiên quét", "sessions"))}`;
}
function scanError(state) {
  return `${header(
    "Kiểm tra mã linh kiện"
  )}<div class="body">${caseContext()}<div class="empty-state"><div class="icon-tile warm">${icon(
    "box",
    "large"
  )}</div><h3>Mã hộp chưa thể xuất</h3><p>Hộp chưa được ghi nhận nhập kho.<br>Kiểm tra lại mã hoặc chọn hộp khác.</p></div><section class="card summary-card">${kv(
    "Mã đã quét",
    "BOX-LK-0002-01"
  )}${kv("Kho", "Kho Hoa Nam")}</section>${hint(
    "Mã này chưa được thêm vào danh sách. Các mã đã quét hợp lệ vẫn được giữ lại.",
    "warning"
  )}</div>${footer(
    primary("Quét mã khác", "scan", false, "scan") +
      secondary("Nhập lại mã", "manual")
  )}`;
}
function documentsView() {
  return `${header('Lịch sử nhập / xuất','history-hub')}<div class="body"><p class="small-copy muted">Xem phiếu đã gửi để theo dõi quá trình xử lý trên Web.</p>${[['PN-0005','Phiếu nhập','12 mã','11:25','inbound'],['PX-0004','Phiếu xuất','10 mã','10:40','outbound']].map(([id,title,count,time,kind])=>`<button class="card event-card" data-action="pending-document" data-kind="${kind}"><div class="row between"><strong>${id}</strong>${badge('Chờ xử lý trên Web','amber')}</div><p>${title} · ${count}</p><div class="row between tiny muted"><span>Kho Hoa Nam</span><span>10/09 · ${time}</span></div></button>`).join('')}${hint('Phiếu đã gửi chưa làm thay đổi tồn kho.')}</div>${footer(secondary('Về lịch sử thao tác','history-hub'))}`;
}
function waitingWeb(state) {
  const outbound=state.pendingKind==='outbound';
  return `${header(
    "Đã gửi phiếu",
    "documents"
  )}<div class="body"><div class="success-intro wait-intro"><div class="icon-tile">${icon(
    "monitor",
    "large"
  )}</div><h2>Đã gửi phiếu ${outbound?'xuất':'nhập'}</h2>${badge(
    "Chờ xử lý trên Web",
    "amber"
  )}<p>Phiếu đã gửi, chưa ghi sổ.<br>Tiếp tục kiểm tra hoặc bổ sung thông tin trên Web WMS.</p></div><section class="card summary-card">${kv(
    "Mã phiếu",
    outbound?'PX-0004':'PN-0005'
  )}${kv("Kho", "Kho Hoa Nam")}${kv("Đã ghi nhận", outbound?'10 mã':'12 mã')}${kv(
    "Thời gian gửi",
    outbound?'10/09/2026 · 10:40':'10/09/2026 · 11:25'
  )}</section>${hint(
    "Tồn kho được cập nhật sau khi phiếu được xác nhận trên Web."
  )}</div>${footer(primary("Xem lịch sử", "documents", false, "history"))}`;
}

function newState(scene) {
  const short = [
    "scan",
    "quantity",
    "quantity-invalid",
    "scan-error",
    "resume",
    "drafts",
  ].includes(scene);
  return {
    scene,
    draft: short ? fullDraft().slice(0, 1) : fullDraft(),
    documentId: ["drafts", "resume", "reconcile", "post-check"].includes(scene)
      ? "XLK-0002"
      : undefined,
    recordedCodes: ["resume", "drafts"].includes(scene) ? ["LK0001-HN001"] : [],
    postPhase:
      scene === "success"
        ? "CONFIRMED"
        : scene === "post-check"
        ? "SENT"
        : "NOT_STARTED",
    scanCheckpoint: scene === "reconcile" ? "UNKNOWN" : "VERIFIED",
    historyDocs: [structuredClone(HISTORY_FIXTURES[0])],
    hasMore: true,
    filter: "Tất cả",
    eventId: "NFC-E003",
    caseId: "BH-001",
    sessionId: "PQ-0003",
  };
}
function persist(state) {
  if (mode === "board") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schema: 1,
        draft: state.draft,
        documentId: state.documentId,
        recordedCodes: state.recordedCodes,
        postPhase: state.postPhase,
        scanCheckpoint: state.scanCheckpoint,
        warehouseId: "KHO-HN",
        version: 3,
      })
    );
  } catch {}
}
function readSaved() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return value?.schema === 1 && Array.isArray(value.draft) ? value : null;
  } catch {
    return null;
  }
}
function renderPhone(node, state) {
  sceneStates.set(node, state);
  node.dataset.scene = state.scene;
  const views = {
    scan: scanView,
    quantity: scanView,
    "quantity-invalid": scanView,
    review: reviewView,
    success: successView,
    history: historyView,
    "history-loading": historyView,
    "history-error": historyView,
    empty: historyView,
    closed: historyView,
    drafts: draftsView,
    resume: resumeView,
    reconcile: reconcileView,
    "post-check": postCheckView,
    "history-hub": historyHub,
    nfc: nfcView,
    "nfc-detail": nfcDetail,
    "events-unavailable": unavailable,
    warranty: warrantyView,
    "warranty-detail": warrantyDetail,
    sessions: sessionsView,
    "session-detail": sessionDetail,
    "scan-error": scanError,
    "waiting-web": waitingWeb,
    documents: documentsView,
  };
  node.innerHTML = (views[state.scene] || scanView)(state);
  if (["quantity", "quantity-invalid"].includes(state.scene)) {
    node
      .querySelectorAll(":scope > header,:scope > .body,:scope > footer")
      .forEach((el) => (el.inert = true));
    node.insertAdjacentHTML(
      "beforeend",
      quantitySheet(state.scene === "quantity-invalid")
    );
  }
}
function go(node, scene) {
  const state = sceneStates.get(node);
  state.scene = scene;
  renderPhone(node, state);
  if (mode !== "board") {
    selected = scene;
    document
      .querySelectorAll(".scene-nav button")
      .forEach((b) => b.classList.toggle("active", b.dataset.scene === scene));
    history.replaceState(
      null,
      "",
      `?${mode === "screen" ? "mode=screen&" : ""}scene=${scene}`
    );
  }
  if (["quantity", "quantity-invalid"].includes(scene))
    node.querySelector(".sheet")?.focus({ preventScroll: true });
}
function notice(node, text) {
  node.querySelector(".status-notice")?.remove();
  const el = document.createElement("p");
  el.className = "status-notice";
  el.setAttribute("role", "status");
  el.textContent = text;
  node.append(el);
  setTimeout(() => el.remove(), 3000);
}
function manualSheet(node) {
  node
    .querySelectorAll(":scope > header,:scope > .body,:scope > footer")
    .forEach((el) => (el.inert = true));
  node.insertAdjacentHTML(
    "beforeend",
    `<button class="sheet-backdrop" data-action="dismiss" aria-label="Đóng nhập mã"></button><section class="sheet" role="dialog" aria-modal="true" aria-label="Nhập mã linh kiện" tabindex="-1"><div class="sheet-grip"></div><div class="sheet-title"><h2>Nhập mã linh kiện</h2><button class="icon-button" data-action="dismiss" aria-label="Đóng">${icon(
      "close"
    )}</button></div><label class="field-label">Mã linh kiện hoặc mã hộp<input class="manual-input" data-field="manual-code" aria-label="Mã linh kiện hoặc mã hộp" autocomplete="off" placeholder="Nhập mã trên tem"></label><p data-error="manual" class="field-error" role="alert"></p>${primary(
      "Kiểm tra mã",
      "check-code"
    )}${gesture}</section>`
  );
  node.querySelector(".sheet").focus({ preventScroll: true });
}
function guideSheet(node, state) {
  node
    .querySelectorAll(":scope > header,:scope > .body,:scope > footer")
    .forEach((el) => (el.inert = true));
  node.insertAdjacentHTML(
    "beforeend",
    `<button class="sheet-backdrop" data-action="close-guide" aria-label="Đóng hướng dẫn"></button><section class="sheet" role="dialog" aria-modal="true" aria-label="Đối chiếu phiếu trên Web" tabindex="-1"><div class="sheet-grip"></div><div class="sheet-title"><h2>Đối chiếu phiếu trên Web</h2><button class="icon-button" data-action="close-guide" aria-label="Đóng">${icon(
      "close"
    )}</button></div><p class="small-copy muted">Mở Web WMS đang sử dụng, tìm phiếu <strong>${esc(
      state.documentId || "XLK-0002"
    )}</strong> của hồ sơ <strong>BH-001</strong>. Kiểm tra mã đã ghi nhận và trạng thái xuất trước khi tiếp tục.</p><div class="gap-top">${hint(
      "Không tạo phiếu mới cho cùng lần xuất khi chưa đối chiếu.",
      "warning"
    )}</div>${primary(
      "Đã hiểu",
      "close-guide",
      false,
      "check"
    )}${gesture}</section>`
  );
  node.querySelector(".sheet").focus({ preventScroll: true });
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || button.disabled) return;
  const node = button.closest(".phone");
  if (!node) return;
  const state = sceneStates.get(node),
    action = button.dataset.action;
  if (
    ["history-hub", "nfc", "warranty", "sessions", "waiting-web", "documents"].includes(
      action
    )
  ) {
    state.filter = "Tất cả";
    go(node, action);
    return;
  }
  switch (action) {
    case "exit":
      location.href = "../../";
      break;
    case "back":
      if (state.scene === "review") {
        go(node, "scan");
      } else if (["quantity", "quantity-invalid"].includes(state.scene)) {
        go(node, "scan");
      } else {
        persist(state);
        go(node, "history");
      }
      break;
    case "scan":
      if (state.scanCheckpoint === "UNKNOWN") {
        go(node, "reconcile");
        break;
      }
      go(node, "scan");
      break;
    case "review":
      go(node, "review");
      break;
    case "history":
      go(node, "history");
      break;
    case "new-issue": {
      const saved = readSaved();
      if (saved && saved.postPhase !== "CONFIRMED" && saved.draft.length) {
        Object.assign(state, saved);
        go(
          node,
          saved.scanCheckpoint === "UNKNOWN"
            ? "reconcile"
            : saved.postPhase === "SENT"
            ? "post-check"
            : "resume"
        );
      } else {
        state.draft = [];
        state.documentId = undefined;
        state.recordedCodes = [];
        state.postPhase = "NOT_STARTED";
        state.scanCheckpoint = "VERIFIED";
        go(node, "scan");
      }
      break;
    }
    case "drafts": {
      if (state.scanCheckpoint === "UNKNOWN" || state.postPhase === "SENT")
        persist(state);
      else {
        const saved = readSaved();
        if (saved && saved.postPhase !== "CONFIRMED")
          Object.assign(state, saved);
      }
      go(node, "drafts");
      break;
    }
    case "resume":
      if (state.scanCheckpoint === "UNKNOWN") {
        go(node, "reconcile");
        break;
      }
      if (state.postPhase === "SENT") {
        go(node, "post-check");
        break;
      }
      if (state.postPhase === "CONFIRMED") {
        go(node, "success");
        break;
      }
      persist(state);
      go(node, "resume");
      break;
    case "continue-scan":
      persist(state);
      go(node, "scan");
      break;
    case "manual":
      if (state.scanCheckpoint === "UNKNOWN") {
        go(node, "reconcile");
        break;
      }
      manualSheet(node);
      break;
    case "dismiss":
      go(node, "scan");
      break;
    case "light": {
      const on = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(on));
      button.innerHTML = icon("flash", "small") + (on ? "Tắt đèn" : "Bật đèn");
      node.querySelector(".camera").style.filter = on ? "brightness(1.15)" : "";
      break;
    }
    case "increase":
    case "decrease": {
      const input = node.querySelector('[data-field="box-quantity"]');
      input.value = String(
        Math.max(
          1,
          Math.min(
            12,
            (Number(input.value) || 0) + (action === "increase" ? 1 : -1)
          )
        )
      );
      node.querySelector('[data-error="quantity"]').textContent = "";
      input.removeAttribute("aria-invalid");
      break;
    }
    case "confirm-quantity": {
      const input = node.querySelector('[data-field="box-quantity"]'),
        value = input.value.trim(),
        error = node.querySelector('[data-error="quantity"]');
      if (!/^\d+$/.test(value) || Number(value) <= 0) {
        error.textContent = "Số lượng phải là số nguyên dương.";
        input.setAttribute("aria-invalid", "true");
        return;
      }
      if (Number(value) > 12) {
        error.textContent = "Số lượng cần xuất vượt tồn khả dụng của hộp (12).";
        input.setAttribute("aria-invalid", "true");
        return;
      }
      if (state.draft.some((r) => r.kind === "BOX")) {
        error.textContent = "Mã hộp này đã có trong danh sách.";
        return;
      }
      state.draft.push({ ...fullDraft()[1], quantity: Number(value) });
      persist(state);
      go(node, "scan");
      break;
    }
    case "check-code": {
      const raw = node
          .querySelector('[data-field="manual-code"]')
          .value.trim()
          .toUpperCase(),
        error = node.querySelector('[data-error="manual"]');
      if (state.draft.some((r) => r.code === raw)) {
        error.textContent = "Mã này đã có trên phiếu. Không cần quét lại.";
        return;
      }
      if (raw === "BOX-LK-0002-01") {
        go(node, "quantity");
        return;
      }
      if (raw === "LK0001-HN001") {
        state.draft.push(fullDraft()[0]);
        persist(state);
        go(node, "scan");
        return;
      }
      error.textContent = raw
        ? "Không tìm thấy mã linh kiện phù hợp. Kiểm tra lại mã trên tem."
        : "Vui lòng nhập mã linh kiện hoặc mã hộp.";
      break;
    }
    case "remove":
      state.draft.splice(Number(button.dataset.index), 1);
      persist(state);
      renderPhone(node, state);
      break;
    case "submit": {
      if (state.postPhase === "SENT") {
        go(node, "post-check");
        break;
      }
      if (state.postPhase === "CONFIRMED") {
        go(node, "success");
        break;
      }
      if (state.scanCheckpoint === "UNKNOWN") {
        go(node, "reconcile");
        break;
      }
      state.documentId = state.documentId || "XLK-0002";
      state.postPhase = "SENT";
      persist(state);
      node.querySelectorAll("button").forEach((b) => (b.disabled = true));
      button.textContent = "Đang xác nhận xuất…";
      setTimeout(() => {
        state.postPhase = "CONFIRMED";
        persist(state);
        const doc = {
          id: state.documentId,
          at: "10/09/2026 · 14:45",
          lines: structuredClone(state.draft),
        };
        state.historyDocs = [
          doc,
          ...state.historyDocs.filter((d) => d.id !== doc.id),
        ];
        go(node, "success");
      }, 450);
      break;
    }
    case "check-post":
      button.disabled = true;
      button.textContent = "Đang kiểm tra…";
      setTimeout(() => {
        state.postPhase = "CONFIRMED";
        persist(state);
        go(node, "success");
      }, 450);
      break;
    case "web-guide":
      guideSheet(node, state);
      break;
    case "close-guide":
      renderPhone(node, state);
      break;
    case "load-more": {
      if (state.loading) return;
      state.loading = true;
      const body = node.querySelector(".body"),
        top = body.scrollTop;
      button.disabled = true;
      button.textContent = "Đang tải thêm…";
      setTimeout(() => {
        const map = new Map(state.historyDocs.map((d) => [d.id, d]));
        for (const doc of HISTORY_FIXTURES)
          map.set(doc.id, structuredClone(doc));
        state.historyDocs = [...map.values()];
        state.hasMore = false;
        state.loading = false;
        state.scene = "history";
        renderPhone(node, state);
        node.querySelector(".body").scrollTop = top;
      }, 400);
      break;
    }
    case "nfc-detail":
      state.eventId = button.dataset.event || "NFC-E003";
      go(node, "nfc-detail");
      break;
    case "pending-document":
      state.pendingKind=button.dataset.kind;
      go(node,'waiting-web');
      break;
    case "warranty-detail":
      state.caseId = button.dataset.case || "BH-001";
      go(node, "warranty-detail");
      break;
    case "session-detail":
      state.sessionId = button.dataset.session || "PQ-0003";
      go(node, "session-detail");
      break;
    case "filter":
      state.filter = button.dataset.value;
      renderPhone(node, state);
      break;
    case "retry-unavailable":
      notice(node, "Lịch sử hiện chưa khả dụng. Vui lòng kiểm tra lại sau.");
      break;
  }
});
document.addEventListener("input", (event) => {
  if (!event.target.matches("[data-search]")) return;
  const node = event.target.closest(".phone"),
    query = event.target.value.trim().toLowerCase();
  let visible = 0;
  node.querySelectorAll("[data-search-text]").forEach((row) => {
    row.hidden = !row.dataset.searchText.toLowerCase().includes(query);
    if (!row.hidden) visible++;
  });
  node.querySelector(".search-empty").hidden = visible > 0;
});
document.addEventListener("keydown", (event) => {
  const modal = event.target.closest(".sheet");
  if (!modal) return;
  const node = modal.closest(".phone");
  if (event.key === "Escape") {
    event.preventDefault();
    if (modal.querySelector('[data-action="close-guide"]'))
      renderPhone(node, sceneStates.get(node));
    else go(node, "scan");
  }
  if (event.key === "Enter" && event.target.matches("input")) {
    event.preventDefault();
    modal
      .querySelector(
        '[data-action="confirm-quantity"],[data-action="check-code"]'
      )
      ?.click();
  }
  if (event.key === "Tab") {
    const focusable = [
        ...modal.querySelectorAll("button:not(:disabled),input"),
      ],
      first = focusable[0],
      last = focusable.at(-1);
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === modal)
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
function renderApp() {
  const root = document.getElementById("root");
  document.body.className = `mode-${mode}`;
  if (mode === "board" && params.get("export") === "2x")
    document.body.classList.add("export-2x");
  if (mode === "board") {
    const b = BOARDS[boardId];
    root.innerHTML = `<section class="board" id="board-${boardId}"><header class="board-heading"><div><h1>${
      b.title
    }</h1><p>${
      b.sub
    }</p></div><div class="board-mark">HOA NAM SCANNER · ${boardId}</div></header><div class="board-grid">${b.scenes
      .map(
        (s, i) =>
          `<figure><div class="phone" data-initial="${s}"></div><figcaption>${
            i + 1
          }. ${SCENES[s]}</figcaption></figure>`
      )
      .join(
        ""
      )}</div><footer class="board-footer"><span>Thiết kế mobile · Public Sans · Chốt nghiệp vụ 10/09/2026</span><span>App quét mã · Web WMS quản lý · Một kho</span></footer></section>`;
    root
      .querySelectorAll(".phone")
      .forEach((n) => renderPhone(n, newState(n.dataset.initial)));
    return;
  }
  if (mode === "screen") {
    root.innerHTML = '<div class="phone"></div>';
    renderPhone(root.querySelector(".phone"), newState(selected));
    return;
  }
  root.innerHTML = `<div class="workbench"><aside class="guide"><a class="back-library" href="../../">${icon(
    "back",
    "small"
  )}Thư viện Scanner</a><p class="eyebrow">Bổ sung nghiệp vụ · 17–22</p><h1>Quét mã &<br>lịch sử thao tác</h1><p class="intro">Xuất linh kiện trực tiếp, tiếp tục phiếu dở và xem lại công việc đã thực hiện.</p><nav class="scene-nav" aria-label="Chọn màn thiết kế">${Object.entries(
    BOARDS
  )
    .map(
      ([id, b]) =>
        `<div class="scene-group"><p>${id} · ${b.title}</p>${b.scenes
          .map(
            (s) =>
              `<button data-scene="${s}" class="${
                s === selected ? "active" : ""
              }">${SCENES[s]}</button>`
          )
          .join("")}</div>`
    )
    .join(
      ""
    )}</nav><p class="guide-note">Trình xem thiết kế cho DEV. Các thao tác dùng dữ liệu thiết kế, không gửi yêu cầu tới WMS hoặc mở camera. NFC/phiên quét theo hợp đồng đề xuất chờ DEV chốt.<br><br>Mã kiểm tra: <strong>LK0001-HN001</strong> và <strong>BOX-LK-0002-01</strong> (tồn 12).</p><div class="guide-tools"><button data-demo="restore">Mở lại phiên đã lưu</button><button data-demo="reset">Đặt lại dữ liệu thiết kế</button><a href="./handoff.html">Bàn giao & đề xuất DEV</a></div></aside><div class="stage"><div class="phone"></div></div></div>`;
  renderPhone(root.querySelector(".phone"), newState(selected));
  root.querySelectorAll(".scene-nav button").forEach((button) =>
    button.addEventListener("click", () => {
      selected = button.dataset.scene;
      history.replaceState(null, "", `?scene=${selected}`);
      renderApp();
    })
  );
  root.querySelector('[data-demo="reset"]').addEventListener("click", () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    selected = "scan";
    renderApp();
  });
  root.querySelector('[data-demo="restore"]').addEventListener("click", () => {
    const saved = readSaved();
    const node = root.querySelector(".phone");
    if (!saved) {
      notice(node, "Chưa có phiên thiết kế đã lưu.");
      return;
    }
    const state = Object.assign(newState("resume"), saved);
    state.scene =
      saved.scanCheckpoint === "UNKNOWN"
        ? "reconcile"
        : saved.postPhase === "CONFIRMED"
        ? "success"
        : saved.postPhase === "SENT"
        ? "post-check"
        : "resume";
    renderPhone(node, state);
  });
}
renderApp();
