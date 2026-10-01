import { createDialogFixtureAdapter } from './fixture-adapter.mjs';
import { createDialogFlow } from './dialog-flow.mjs?v=p03-backdrop-r07';
import { dialogIcon as icon } from './icons.mjs';
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function mountScannerDialogs({ screen, tools, getState, adapter = createDialogFixtureAdapter(), onShow, onDismiss, onNavigate, onFeedback=()=>{} }) {
  const host = document.createElement('div');
  host.className = 'p03-host'; host.hidden = true; screen.append(host);
  const review = document.createElement('details');
  review.className = 'p03-tools';
  review.innerHTML = `<summary>Kịch bản kiểm tra P03 · 4 panel</summary>
    <p>Fixture riêng, chỉ lưu trong bộ nhớ tab. Không kết nối WMS.</p>
    <label>Kho trong phiên <select data-p03-fixture="warehouse"><option value="active">Đang hoạt động</option><option value="stopped">Kho tạm dừng</option><option value="unknown">Trạng thái UNKNOWN</option></select></label>
    <label>Kết quả lưu nháp <select data-p03-fixture="save"><option value="confirmed">Fixture xác nhận lưu</option><option value="failed">Lưu thất bại</option><option value="unknown">Kết quả UNKNOWN</option></select></label>
    <button data-p03-open="picker">S01 · Chọn tác vụ quét</button>
    <button data-p03-open="local">S02 · Phiếu chưa lưu (fixture)</button>
    <button data-p03-open="stopped">S03 · Kho tạm dừng</button>
    <button data-p03-open="discard">S04 · Xác nhận bỏ phiếu (fixture)</button>
    <button data-p03-open="server">Phiếu có mã server ghi nhận</button>
    <button data-p03-open="posted">Phiếu đã Post</button>
    <button data-p03-open="unknown">Phiếu cần đối chiếu</button>
    <button data-p03-open="resume">Mở lại phiếu hiện tại</button>
    <button data-p03-open="saved">Mở nháp đã lưu fixture</button>
    <p data-p03-status role="status"></p><pre data-p03-snapshot></pre>`;
  tools.append(review);
  const menu = screen.querySelector('.hn-nav');
  const header = screen.querySelector('.p03-header');
  const back = header.querySelector('[data-p03-back]');
  let backDisabled = false;
  const menuButtons = [...menu.querySelectorAll('button')];
  let menuDisabled = null;
  let previousPanel = null;
  let returnFocus = null;
  let inertNodes = [];
  let pageOverflow = null;
  let disposed = false,lastOutcome='';
  const action = (key, label, kind = 'neutral') => `<button class="p03-button p03-${kind}" data-p03-action="${key}">${label}</button>`;
  const common = (glyph, title, description, buttons, warning = false) => `<div class="p03-emblem ${warning ? 'warning' : ''}">${icon(glyph)}</div><h2 id="p03-title">${title}</h2><p id="p03-description">${description}</p><div class="p03-actions">${buttons}</div>`;
  function markup(panel) {
    if (panel === 'P03.S01') return `<span class="p03-grip" aria-hidden="true"></span><button class="p03-close" data-p03-action="cancel" aria-label="Đóng chọn tác vụ quét">${icon('x')}</button><h2 id="p03-title">Chọn tác vụ quét</h2><p id="p03-description">Mã sẽ được kiểm tra theo nghiệp vụ bạn chọn.</p><div class="p03-operations">${[
      ['inbound', 'box', 'Nhập kho', 'Nhận hàng và kiểm đếm vào kho'],
      ['outbound', 'up', 'Xuất kho', 'Soạn hàng theo yêu cầu xuất'],
      ['warranty', 'tool', 'Bảo hành', 'Quét máy để tra cứu hoặc tiếp nhận bảo hành'],
      ['lookup', 'search', 'Tra cứu sản phẩm', 'Xem tồn kho, lịch sử và bảo hành'],
    ].map(([op, glyph, title, sub]) => `<button class="p03-operation" data-p03-operation="${op}"><span class="p03-tile ${op} hn-operation-icon" data-hn-operation="${op}">${icon(glyph)}</span><span><strong>${title}</strong><small>${sub}</small></span>${icon('chevron')}</button>`).join('')}</div>`;
    if (panel === 'P03.S02') return common('alert', 'Bạn đang có phiếu chưa hoàn tất', 'Các dữ liệu đã quét sẽ được giữ nếu bạn tiếp tục phiếu hiện tại. Bạn có thể tiếp tục, lưu nháp hoặc bỏ phiếu.',
      action('resume', 'Tiếp tục phiếu', 'primary') + action('save', 'Lưu nháp và thoát') + action('discard', 'Bỏ phiếu', 'danger-outline') + action('cancel', 'Hủy', 'text'), true);
    if (panel === 'P03.S03') return common('hand', 'Kho tạm dừng', 'Các thao tác trong kho đang tạm dừng.<br>Liên hệ quản trị viên.', action('home', 'Về Trang chủ', 'primary') + action('contact', 'Liên hệ quản trị'));
    return common('trash', 'Xác nhận bỏ phiếu', 'Dữ liệu chưa lưu sẽ bị xóa.<br>Bạn có chắc chắn muốn bỏ phiếu này?', action('cancel', 'Quay lại') + action('confirmDiscard', 'Bỏ phiếu', 'danger'));
  }
  function unlock() {
    menu.inert=false;header.inert=false;
    back.disabled = backDisabled;
    if (menuDisabled) { menuButtons.forEach((button, i) => { button.disabled = menuDisabled[i]; }); menuDisabled = null; }
    for (const [node, prior] of inertNodes) node.inert = prior;
    inertNodes = [];
    if (pageOverflow !== null) {
      document.documentElement.style.overflow = pageOverflow;
      pageOverflow = null;
    }
  }
  function render(state) {
    if (disposed) return;
    review.querySelector('[data-p03-status]').textContent = state.message;
    review.querySelector('[data-p03-snapshot]').textContent = JSON.stringify({ panel: state.panel, document: state.document, navigation: state.navigation }, null, 2);
    if (!state.panel) {
      const outcome=state.message&&!state.busy&&state.message!==lastOutcome?{title:state.message.startsWith('Đã')?'Đã hoàn tất':'Thông báo thao tác',message:state.message,tone:state.message.startsWith('Đã')?'success':'neutral'}:null;
      if(outcome)lastOutcome=state.message;
      if(!state.message)lastOutcome='';
      host.hidden = true; host.replaceChildren(); unlock();
      if (previousPanel) {
        previousPanel = null; onDismiss();
        if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
      }
      if(outcome)onFeedback(outcome);
      return;
    }
    if (!previousPanel) {
      backDisabled = back.disabled;
      menuDisabled = menuButtons.map(button => button.disabled);
      returnFocus = document.activeElement;
      pageOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      onShow();
      inertNodes = [...screen.children].filter(node => node !== host && node !== menu && node !== header).concat(tools).map(node => [node, node.inert]);
      for (const [node] of inertNodes) node.inert = true;
    }
    host.hidden = false;
    // S04 is a destructive confirmation: the visible shell is a locked background.
    menu.inert=state.panel==='P03.S04';header.inert=state.panel==='P03.S04';
    if (previousPanel !== state.panel) {
      const sheet = state.panel === 'P03.S01';
      host.innerHTML = `<div class="p03-backdrop"></div><section class="p03-dialog ${sheet ? 'sheet' : 'modal'} ${state.panel === 'P03.S02' ? 'unfinished' : ''}" role="${sheet ? 'dialog' : 'alertdialog'}" aria-modal="true" aria-labelledby="p03-title" aria-describedby="p03-description" tabindex="-1" data-panel="${state.panel}">${markup(state.panel)}<button class="p03-button neutral" data-p03-action="checkSave" hidden>Kiểm tra kết quả lưu</button><a class="p03-contact-link" hidden></a></section>`;
      // The footer remains operable outside the dialog; do not hide it from AT
      // by declaring the dialog to be the only interactive region.
      host.querySelector('.p03-dialog').setAttribute('aria-modal', String(state.panel==='P03.S04'));
      host.querySelector('[data-p03-action="checkSave"]').textContent = 'Kiểm tra kết quả lưu';
      previousPanel = state.panel;
      (host.querySelector(state.panel==='P03.S04'?'[data-p03-action="cancel"]':'.p03-dialog')).focus({ preventScroll: true });
    }
    // P03 is already an app dialog. Replace its description instead of appending a toast.
    const description=host.querySelector('#p03-description');
    if(!description.dataset.default)description.dataset.default=description.innerHTML;
    if(state.message&&!state.busy)description.textContent=state.message;else description.innerHTML=description.dataset.default;
    description.setAttribute('aria-live','polite');
    for (const button of host.querySelectorAll('button')) button.disabled = state.busy;
    menuButtons.forEach((button, i) => { button.disabled = state.busy || menuDisabled[i]; });
    back.disabled = state.busy || state.panel === 'P03.S03' || backDisabled;
    const save = host.querySelector('[data-p03-action="save"]');
    if (save) { save.disabled = state.busy || state.saveUnknown; save.textContent = state.busy ? 'Đang xử lý…' : 'Lưu nháp và thoát'; }
    const check = host.querySelector('[data-p03-action="checkSave"]');
    check.hidden = !(state.saveUnknown && state.panel === 'P03.S02');
    host.querySelector('.p03-dialog').setAttribute('aria-busy', String(state.busy));
    if (state.message && !state.busy) host.querySelector('.p03-dialog').focus({preventScroll:true});
  }
  const flow = createDialogFlow({ adapter, getState, onChange: render, onNavigate });
  const onClick = event => {
    event.stopPropagation();
    if (event.target.closest('.p03-backdrop') || event.target === host) {
      event.preventDefault(); return;
    }
    const operation = event.target.closest('[data-p03-operation]');
    if (operation) { flow.choose(operation.dataset.p03Operation); return; }
    const button = event.target.closest('[data-p03-action]');
    if (!button || button.disabled) return;
    const key = button.dataset.p03Action;
    if (key === 'contact') {
      const channel = flow.contact();
      if (channel) {
        const link = host.querySelector('.p03-contact-link');
        link.href = channel.href; link.textContent = channel.label || 'Mở kênh liên hệ đã cấu hình'; link.hidden = false; link.focus();
      }
    } else if (key === 'discard') flow.requestDiscard();
    else if (key === 'cancel') flow.cancel();
    else if (['resume', 'save', 'confirmDiscard', 'checkSave', 'home'].includes(key)) void flow[key]();
  };
  const focusables = () => [...header.querySelectorAll('button:not(:disabled)'), ...host.querySelectorAll('button:not(:disabled), a[href]'), ...menu.querySelectorAll('button:not(:disabled)')].filter(node => !node.hidden && !node.closest('[inert]') && node.getClientRects().length);
  const onKey = event => {
    if (!flow.snapshot().panel) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); flow.cancel('escape'); }
    if (event.key === 'Tab') {
      event.preventDefault();
      const list = focusables();
      const index = list.indexOf(document.activeElement);
      if (!list.length) host.querySelector('.p03-dialog').focus();
      else {
        // Footer precedes host in DOM; use the visible dialog → footer order.
        const next = index < 0 ? (event.shiftKey ? list.length - 1 : 0)
          : (index + (event.shiftKey ? -1 : 1) + list.length) % list.length;
        list[next].focus({ preventScroll: menu.contains(list[next]) });
      }
    }
  };
  const onFocus = event => { if (!host.hidden && !host.contains(event.target) && (flow.snapshot().panel==='P03.S04'||!menu.contains(event.target)&&!header.contains(event.target))) host.querySelector('.p03-dialog').focus({ preventScroll: true }); };
  const onReview = event => {
    const button = event.target.closest('[data-p03-open]');
    if (!button) return;
    const key = button.dataset.p03Open;
    if (key === 'picker') flow.openPicker();
    else if (key === 'resume') flow.openUnfinished();
    else if (key === 'stopped') {
      adapter.setWarehouse(false); review.querySelector('[data-p03-fixture="warehouse"]').value = 'stopped'; flow.showStopped();
    } else if (key === 'saved') {
      const saved = adapter.savedDocument(); if (saved) { flow.loadFixtureDocument(saved); flow.openUnfinished(); }
      else review.querySelector('[data-p03-status]').textContent = 'Chưa có nháp fixture được xác nhận lưu.';
    } else {
      if (!flow.loadFixtureDocument(adapter.makeDocument(getState(), key === 'discard' ? 'local' : key))) {
        flow.openUnfinished(); return;
      }
      flow.openUnfinished(); if (key === 'discard') flow.requestDiscard();
    }
  };
  review.addEventListener('click', onReview);
  review.addEventListener('change', event => {
    if (event.target.dataset.p03Fixture === 'warehouse') adapter.setWarehouse(({ active: true, stopped: false, unknown: null })[event.target.value]);
    if (event.target.dataset.p03Fixture === 'save') adapter.setSaveOutcome(event.target.value);
  });
  host.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey, true);
  document.addEventListener('focusin', onFocus, true);
  return {
    flow, adapter,
    dispose() { disposed = true; flow.dispose(); unlock(); document.removeEventListener('keydown', onKey, true); document.removeEventListener('focusin', onFocus, true); host.remove(); review.remove(); },
  };
}
