import {renderManualEntry,revealManualInput} from '../inbound/manual-entry.mjs';
import {sourceChangeReview,canApplySourceChange} from './source-review.mjs';
import {createExceptionExperience} from '../scan-exceptions/experience.mjs';
import {filterAttempts, deliveryIsValid, createDraftExitGuard} from './experience.mjs';
import {renderScanException} from '../scan-exceptions/view.mjs';
import {flowProgress,reviewTotals} from '../shared/flow-guidance.mjs';
import { createActionFeedback } from '../shared/action-feedback.mjs';
import { selectMarkup, mountSelectControls } from './select-control.mjs?v=p05-r11';
import { OUTBOUND_ICONS } from './icons.mjs';
import { createOutboundFixtureAdapter, OUTBOUND_SOURCES, OUTBOUND_RECIPIENTS, OUTBOUND_GROUPS } from './fixture-adapter.mjs';
import { createOutboundFlow } from './outbound-flow.mjs?v=p05-r10';
import { manualCodeError } from './validation.mjs';
import { DIALOG_ICONS } from '../scanner-dialogs/icons.mjs';
import { INBOUND_ICONS } from '../inbound/icons.mjs';
import { waitingWebResult } from '../shared/waiting-web.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const glyphs = { ...DIALOG_ICONS, ...OUTBOUND_ICONS, lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>' }; // lock/info from auth-session/app.mjs
const icon = name => `<svg class="p05-icon" viewBox="0 0 24 24" aria-hidden="true">${INBOUND_ICONS[name] || glyphs[name] || glyphs.document}</svg>`;
const button = (action, label, cls = '') => `<button type="button" class="p05-button ${cls}" data-p05="${action}">${label}</button>`;
const info = (title, text) => `<aside class="p05-info">${icon('info')}<div><strong>${title}</strong>${text}</div></aside>`;
const scanReason = reason => ({
  'Không tìm thấy mã hợp lệ trong nguồn sản phẩm fixture.': 'Không tìm thấy sản phẩm. Kiểm tra lại mã và thử lại.',
  'Mã không thuộc kho đang thao tác (fixture).': 'Mã không thuộc kho đang thao tác. Vui lòng kiểm tra lại.',
}[reason] || reason);

export function mountOutbound({ root, tools, getState, onHome, onStopped, onSize, onDocument, onHistory, onBack = onHome , onStateChange = () => {}, onSystem = () => false }) {
  const adapter = createOutboundFixtureAdapter();
  const events = new AbortController();
  const listen = (target, type, handler) => target.addEventListener(type, handler, {signal:events.signal});
  let deferredGeography = false;
  const exitGuard=createDraftExitGuard(window);
  let shippingOpen=true, scanFilter='all', scrollFrame=0;
  function protectDraft(){exitGuard.update(flow.hasUnfinishedWork() || (!flow.snapshot().recorded && codeValue.length>0));}
  function scanFocus(){revealManualInput(root,'p05');}
  function setShipping(open,focus=false){shippingOpen=open;render(flow.snapshot());if(focus)root.querySelector(open?'[data-p05-select="recipient"]':'[data-p05="edit-shipping"]')?.focus({preventScroll:true});}

  let visible = false, manual = false, all = false, previousStep = 0, previousMessage = '', displayedDocumentId = null;
  const touched = new Set();
  let codeValue = '', codeError = '';
  let codeTone = 'idle';
  let feedbackTrigger = null;
  function syncErrors() {
    const state = flow.snapshot(), errors = flow.fieldErrors();
    const collapse=root.querySelector('[data-p05="complete-shipping"]');
    if(collapse){collapse.disabled=state.busy || !deliveryIsValid(errors);collapse.dataset.p05Disabled=String(!deliveryIsValid(errors));}
    for (const control of root.querySelectorAll('[data-p05-validate]')) {
      const name = control.dataset.p05Validate, message = touched.has(name) ? errors[name] || '' : '';
      const id = `p05-error-${name}`;
      let hint = root.querySelector(`#${id}`);
      if (!hint) { hint = document.createElement('small'); hint.id = id; hint.className = 'p05-field-error'; hint.setAttribute('aria-live', 'polite'); control.closest('.p05-field').append(hint); }
      hint.textContent = message; hint.hidden = !message;
      control.setAttribute('aria-invalid', String(!!message)); control.setAttribute('aria-describedby', name === 'planned' ? `p05-quantity-hint ${id}` : id);
      control.closest('.p05-field').classList.toggle('p05-invalid', !!message);
    }
    const code = root.querySelector('#p05-code');
    if (code) {
      code.setAttribute('aria-invalid', String(!!codeError && codeTone !== 'duplicate'));
      const hint = root.querySelector('#p05-error-code');
      hint.textContent = codeError || 'Nhập từng mã, rồi nhấn Enter hoặc Kiểm tra mã.';
      hint.dataset.tone = codeTone; hint.hidden = false;
    }
  }
  const review = document.createElement('details'); review.className = 'p05-tools'; review.hidden = true;
  review.innerHTML = `<summary>Kịch bản kiểm tra P05 · 4 panel</summary><p>Fixture riêng, trong bộ nhớ tab; không kết nối WMS. Đóng/reload tab sẽ mất nháp. Mã PX-0005 và thời gian là mẫu B05, không phải giá trị server.</p><p>Danh mục địa giới: provinces.open-api.vn v1, trước 07/2025, có cấp Quận/Huyện. Chọn tỉnh → quận/huyện → địa chỉ chi tiết. Đổi tỉnh/quận sẽ xóa thông tin địa chỉ phụ thuộc.</p><label>Kết quả gửi <select data-p05-outcome><option value="confirmed">Xác nhận record</option><option value="failed">Từ chối</option><option value="unknown">UNKNOWN</option><option value="timeout-recorded">Timeout nhưng đã record</option><option value="not-recorded">Kiểm tra: chưa record</option><option value="status-unavailable">Thiếu nguồn tra trạng thái</option></select></label>${button('batch', 'Nạp 7/10 + 1 trùng (fixture)')}<p>Phiếu mới mặc định 1; bộ mẫu 7/10 yêu cầu chọn PX-0005 mẫu 10 SP hoặc nhập số lượng 10 và nhóm Máy in nhiệt. Camera và đèn thật chưa tích hợp. Nạp lượt quét dùng chung pipeline với Nhập tay. Các mã fixture: HN12345–HN12354; bổ sung HN12352, HN12353, HN12354 bằng Nhập tay để đủ 10. HN99999: không thể xuất; HN-WRONG-WAREHOUSE: sai kho.</p><pre data-p05-snapshot></pre>`;
  tools.append(review);if(new URLSearchParams(location.search).get('sample')==='b24'){const label=document.createElement('p');label.textContent='MẪU B24 RIÊNG — PN-0005/12 mã hoặc PX-0004/10 mã. Qua owner record mô phỏng; không phải WMS.';review.prepend(label);}
  const title = (head, sub) => `<div class="p05-section-title"><h2>${head}</h2><p>${sub}</p></div>`;
  const row = (name, label, value, extra = '') => `<div class="p05-summary-row"><span class="p05-tile hn-operation-icon" data-hn-operation="${['document','up'].includes(name)?'outbound':'documents'}">${icon(name)}</span><div><small>${label}</small><strong ${['user','house','pin','tag'].includes(name)?`data-hn-readable="${esc(label)}" data-hn-readable-kind="value"`:''}>${esc(value)}</strong>${extra}</div></div>`;
  const warning = (heading, text) => `<aside class="p05-warning">${icon('alert')}<div><strong>${heading}</strong><p>${text}</p></div></aside>`;
  function render(s, {geographyOnly=false} = {}) {
    if (!visible) {protectDraft();return;}
    exceptionExperience.before(s);
    review.querySelector('[data-p05-snapshot]').textContent = JSON.stringify({ ...s, metrics: adapter.metrics() }, null, 2);
    if(geographyOnly && selects.isOpen()){deferredGeography=true;return;}
    deferredGeography=false;
    selects?.close();
    if (s.document?.documentId !== displayedDocumentId) {
      manual = false; all = false; previousStep = 0; previousMessage = '';
      touched.clear(); codeValue = ''; codeError = '';
      codeTone = 'idle';shippingOpen=true;scanFilter='all';
      displayedDocumentId = s.document?.documentId;
    }
    protectDraft();
    const focused = root.contains(document.activeElement) ? document.activeElement : null;
    const focusField = focused?.dataset.p05Field;
    const focusSelect = focused?.dataset.p05Select;
    const focusNote = focused?.matches('[data-p05-note]');
    const selection = focused && (focusNote || ['text','tel'].includes(focused.type)) ? [focused.selectionStart,focused.selectionEnd] : null;
    const focusAction = root.contains(document.activeElement) ? document.activeElement?.dataset.p05 : null;
    const priorScroll = root.querySelector('.p05-scroll')?.scrollTop || 0;
    const stepChanged = previousStep !== s.step;
    if(stepChanged) all=false;
    const d = s.document; if (!d) return;
    const geo = s.geography;
    review.querySelector('[data-p05-snapshot]').textContent = JSON.stringify({ ...s, metrics: adapter.metrics() }, null, 2);
    root.closest('.hn-screen').classList.toggle('p05-result', s.step === 4);
    const count = s.accepted.reduce((n, row) => n + row.quantity, 0);
    const frozen = !!s.request;
    const shippingValid=deliveryIsValid(flow.fieldErrors());
    if(!shippingValid)shippingOpen=true;
    if (s.unknown || s.exception) {
      previousMessage=s.message;
      renderScanException({root,owner:'p05',state:s,canCheck:flow.canCheck(),onSize});
      exceptionExperience.exception(s,flow.canCheck());
      return;
    }
    let body, footer;
    if (s.step === 1) {
      body = `${title('Thông tin phiếu xuất', 'Kiểm tra và nhập thông tin giao hàng')}
        ${frozen ? info('Thông tin phiếu đã khóa', '<p>Yêu cầu gửi đã được tạo. Giữ nguyên thông tin để đối chiếu hoặc thử lại cùng yêu cầu.</p>') : ''}
        <label class="p05-field">Kho xuất<span class="p05-input locked">${icon('house')}<input aria-label="Kho xuất" value="${esc(d.warehouseName)}" readonly>${icon('lock')}</span></label>
        ${selectMarkup({name:'source',label:'Mã phiếu',glyph:icon('document'),options:OUTBOUND_SOURCES.filter(s=>s.id!=='b24-0004'||new URLSearchParams(location.search).get('sample')==='b24'),value:d.sourceId,validation:'number',hint:s.attempts.length?'Đã quét mã: phiếu và nhóm hàng được khóa.':'Chọn phiếu để điền thông tin; đổi phiếu cần xác nhận.'})}
        <section class="p05-shipping" aria-label="Thông tin giao hàng">
        <div class="p05-shipping-card" ${shippingOpen?'hidden':''}><div><strong data-hn-readable="Người nhận" data-hn-readable-kind="value">${esc(d.recipient)}</strong><span>${esc(d.phone)}</span><p data-hn-readable="Địa chỉ giao hàng" data-hn-lines="2">${esc([d.address,d.districtName,d.provinceName].filter(Boolean).join(', '))}</p></div>${button('edit-shipping',frozen?'Xem':'Sửa','p05-link')}</div>
        <div id="p05-shipping-fields" ${!shippingOpen?'hidden':''}>
        ${selectMarkup({name:'recipient',label:'Người nhận',glyph:icon('user'),options:[...OUTBOUND_RECIPIENTS,{id:'walk-in',name:'Khách vãng lai / khách mới'}],value:d.recipientType==='walk-in'?'walk-in':d.recipientId,validation:d.recipientType!=='walk-in'?'recipient':''})}
        ${d.recipientType==='walk-in' ? `<label class="p05-field">Tên người nhận <em>*</em><span class="p05-input">${icon('user')}<input aria-label="Tên người nhận" data-p05-field="recipient" data-p05-validate="recipient" required value="${esc(d.recipient)}" ${s.request?'readonly':''}></span><small class="p05-field-hint">Thông tin chỉ dùng cho phiếu này, chưa tạo hồ sơ khách hàng.</small></label>` : ''}
        <label class="p05-field">Số điện thoại <em>*</em><span class="p05-input">${icon('phone')}<input aria-label="Số điện thoại" data-p05-field="phone" type="tel" required value="${esc(d.phone)}" ${s.request ? 'readonly' : ''}></span></label>
        <section class="p05-address-section" aria-label="Địa chỉ giao hàng">
        <h2>Địa chỉ giao hàng</h2>
        ${selectMarkup({name:'province',label:'Tỉnh / Thành phố',glyph:icon('pin'),options:geo.provinces,value:d.provinceId,validation:'province',placeholder:geo.provinceStatus==='loading'?'Đang tải tỉnh/thành…':'Chọn Tỉnh / Thành phố',disabled:geo.provinceStatus!=='ready'})}
        ${geo.provinceStatus==='error'?`<div class="p05-geo-error" role="status">Không tải được danh sách tỉnh/thành.${button('retry-provinces','Thử lại')}</div>`:''}
        ${selectMarkup({name:'district',label:'Quận / Huyện',glyph:icon('pin'),options:geo.districts,value:d.districtId,validation:'district',placeholder:!d.provinceId?'Chọn tỉnh/thành trước':geo.districtStatus==='loading'?'Đang tải quận/huyện…':'Chọn Quận / Huyện',disabled:!d.provinceId||geo.districtStatus!=='ready'})}
        ${geo.districtStatus==='error'?`<div class="p05-geo-error" role="status">Không tải được quận/huyện. Tỉnh đã chọn được giữ nguyên.${button('retry-districts','Thử lại')}</div>`:''}
        <label class="p05-field">Địa chỉ chi tiết <em>*</em><span class="p05-input">${icon('pin')}<input aria-label="Địa chỉ giao" data-p05-field="address" required placeholder="${d.districtId?'Số nhà, tên đường, phường/xã…':'Chọn Tỉnh/Thành phố và Quận/Huyện trước'}" value="${esc(d.address)}" ${!d.districtId?'disabled data-p05-disabled="true"':''} ${s.request?'readonly':''}></span></label>
        <p class="p05-address-preview" data-p05-address-preview ${!d.address.trim()?'hidden':''}>${esc([d.address,d.districtName,d.provinceName].filter(Boolean).join(', '))}</p>
        </section>
        ${button('complete-shipping','Thu gọn thông tin giao hàng','p05-link')}
        </div></section>
        <label class="p05-field">Số lượng cần soạn <em>*</em><span class="p05-input">${icon('box')}<input aria-label="Số lượng cần soạn" data-p05-field="planned" data-p05-validate="planned" type="text" inputmode="numeric" pattern="[1-9][0-9]?" required aria-describedby="p05-quantity-hint" value="${esc(d.plannedInput ?? d.planned)}" ${s.request ? 'readonly' : ''}><span class="p05-unit">Sản phẩm</span></span><small id="p05-quantity-hint" class="p05-field-hint">Số nguyên từ 1–99. Không nhỏ hơn số đã soạn.</small></label>
        ${selectMarkup({name:'group',label:'Nhóm hàng',glyph:icon('tag'),options:OUTBOUND_GROUPS,value:d.groupId,validation:'group'})}
        <label class="p05-field">Ghi chú<textarea maxlength="200" data-p05-note ${s.request ? 'readonly' : ''}>${esc(d.note)}</textarea><small class="p05-note-count">${d.note.length}/200</small></label>`;
      footer = button('next', `${s.returnToReview?'Quay lại kiểm tra phiếu':'Bắt đầu soạn hàng'} ${icon('arrow')}`, 'p05-primary');
    } else if (s.step === 2) {
      const attempts = filterAttempts(s.attempts,scanFilter), duplicates = s.attempts.filter(a => a.kind === 'duplicate').length, errorCount=s.attempts.filter(a=>['invalid','blocked'].includes(a.kind)).length;
      body = `<div class="p05-scan-intro"><span class="hn-operation-icon" data-hn-operation="outbound">${icon('scan')}</span><div><h2>Quét hàng xuất kho</h2><p>${manual ? 'Nhập mã để thêm sản phẩm vào phiếu' : 'Quét hoặc nhập mã QR/Serial/SKU'}</p></div></div>
        ${frozen ? `<aside class="p05-info" data-p05-frozen role="status">${icon('lock')}<div><strong>Phiếu đã khóa sau khi gửi</strong><p>Giữ nguyên thông tin và mã đã quét. Quay lại kiểm tra phiếu để thử lại cùng yêu cầu.</p></div></aside>` : ''}
        <div class="p05-camera" role="img" aria-label="Ảnh kho minh họa; camera chưa bật"><div class="p05-reticle"></div><span>Camera chưa kết nối</span></div>
        <div class="p05-scan-actions">${button('torch', `${icon('torch')} Đèn chưa sẵn sàng`)}${button('manual', `${icon('keyboard')} Nhập tay`)}</div>
        ${manual ? `<form id="p05-manual-form" class="p05-manual" novalidate aria-label="Nhập mã xuất kho"><div class="p05-manual-heading"><strong>${icon('keyboard')} Nhập mã sản phẩm</strong>${button('close-manual', 'Thu gọn', 'p05-collapse')}</div><label for="p05-code">Mã QR/Serial/SKU <em>*</em></label><div class="p05-code-row"><div class="p05-code-entry"><input id="p05-code" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="Ví dụ: HN12345" required aria-describedby="p05-error-code" value="${esc(codeValue)}">${button('clear-code',icon('x'),'p05-clear-code')}</div><button class="p05-button p05-check-code" type="submit">Kiểm tra mã</button></div><p id="p05-error-code" class="p05-code-feedback" role="status" aria-live="polite" aria-atomic="true"></p></form>` : ''}
        <section class="p05-counter"><div>Đã soạn<strong>${count} / ${d.planned}</strong><small>sản phẩm</small></div><div><p><span class="p05-green">●</span> Mã hợp lệ <b class="p05-green">${s.accepted.length}</b></p><p><span class="p05-red">●</span> Mã trùng <b class="p05-red">${duplicates}</b></p><p><span>●</span> Mã không hợp lệ <b>${s.attempts.filter(a => ['invalid','blocked'].includes(a.kind)).length}</b></p></div></section>
        <div class="p05-scan-progress"><progress max="${d.planned}" value="${count}" aria-label="Tiến độ soạn hàng"></progress><p>${count === d.planned ? 'Đã đủ số lượng · Sẵn sàng kiểm tra phiếu' : `Còn thiếu <strong>${d.planned-count} sản phẩm</strong>`}${duplicates ? `<span> · ${duplicates} mã trùng không tính</span>` : ''}</p></div>
        <div class="p05-list-heading"><h2>Mã đã quét <small>(${attempts.length}/${s.attempts.length} lượt)</small></h2>${attempts.length > 4 ? button('all', all ? 'Thu gọn' : 'Xem tất cả →', 'p05-link') : ''}</div>
        <div class="p05-scan-filters" role="group" aria-label="Lọc mã đã quét">${[['all','Tất cả',s.attempts.length],['duplicate','Trùng',duplicates],['error','Lỗi',errorCount]].map(([value,label,total])=>`<button type="button" data-p05="filter-${value}" aria-pressed="${scanFilter===value}">${label} <span>${total}</span></button>`).join('')}</div>
        <div class="p05-attempts">${(all ? attempts : attempts.slice(0, 4)).map(a => `<div class="p05-attempt"><span class="p05-dot ${a.kind === 'valid' ? 'valid' : 'error'}" aria-hidden="true">${a.kind === 'valid' ? '✓' : '×'}</span><div class="p05-attempt-code"><strong data-hn-readable="Mã đã quét" data-hn-readable-kind="value">${esc(a.raw)}</strong>${a.reason ? `<small data-hn-readable="Lý do mã ${esc(a.raw)}" data-hn-lines="2">${esc(scanReason(a.reason))}</small>${button(`attempt-${a.index}`,'Chi tiết','p05-link')}` : ''}</div><time>${esc(a.time)}</time><span class="p05-badge ${a.kind}">${a.kind === 'valid' ? 'Hợp lệ' : a.kind === 'duplicate' ? 'Trùng mã' : 'Mã lỗi'}</span></div>`).join('') || `<div class="p05-empty">${icon('scan')}<strong>${scanFilter==='all'?'Chưa có mã được quét':scanFilter==='duplicate'?'Chưa có mã trùng':'Chưa có mã lỗi'}</strong><p>${scanFilter==='all'?'Chọn Nhập tay để thêm sản phẩm đầu tiên.':'Chọn Tất cả để xem các lượt quét khác.'}</p></div>`}</div>`;
      footer = `<p id="p05-review-hint" class="p05-footer-hint">${!count ? 'Thêm ít nhất 1 mã hợp lệ để kiểm tra phiếu.' : count === d.planned ? 'Đã đủ số lượng. Kiểm tra phiếu trước khi gửi.' : `Có thể kiểm tra phiếu; cần thêm ${d.planned-count} sản phẩm để gửi.`}</p>` + button('next', `Kiểm tra phiếu${count === d.planned ? ` ${icon('arrow')}` : ''}`, count === d.planned ? 'p05-primary' : 'p05-secondary') + button('continue', frozen || count === d.planned ? 'Xem mã đã quét' : `Tiếp tục soạn ${icon('arrow')}`, count === d.planned ? 'p05-secondary' : 'p05-primary');
    } else if (s.step === 3) {
      const groups = new Map(); for (const item of s.accepted) { const group = groups.get(item.sku) || {quantity:0,raw:item.raw}; group.quantity += item.quantity; groups.set(item.sku,group); }
      body = `${title('Kiểm tra phiếu xuất', 'Xem lại thông tin, số lượng và danh sách sản phẩm trước khi gửi lên Web')}
        ${reviewTotals('Xuất kho',s.accepted)}<div class="p05-review-summary">${row('document','Mã phiếu',d.number)}${row('house','Kho xuất',d.warehouseName)}${row('user','Người nhận',d.recipient)}${row('phone','Số điện thoại',d.phone)}${row('pin','Địa chỉ giao',[d.address,d.districtName,d.provinceName].filter(Boolean).join(', '))}${row('tag','Nhóm hàng',d.group)}</div>${!frozen ? button('edit-review','Sửa thông tin giao hàng','p05-edit-review') : ''}
        <section class="p05-quantities"><div>Số lượng yêu cầu<strong>${d.planned} <small>sản phẩm</small></strong></div><div>Số lượng đã soạn<strong class="p05-green">${count} <small>sản phẩm</small></strong></div></section>
        ${count < d.planned ? warning(`Còn thiếu ${d.planned-count} sản phẩm`, 'Cần soạn đủ số lượng trước khi gửi lên Web.') : info('Đã soạn đủ số lượng', '<p>Gửi phiếu chưa ghi sổ, chưa thay đổi tồn kho.</p>')}
        <div class="p05-list-heading"><h2>Danh sách sản phẩm đã soạn</h2>${button('products', all ? 'Thu gọn' : 'Xem tất cả →', 'p05-link')}</div>
        <section class="p05-products">${[...groups].map(([sku, group]) => `<div class="p05-product"><span class="p05-product-image">${icon('box')}</span><div><strong>${esc(sku)}</strong><small>${esc(group.raw)}</small></div><div><small>Số lượng</small><strong>${group.quantity}</strong></div></div>`).join('')}${all ? `<div class="p05-serials">${s.accepted.map(a=>`<p>${esc(a.raw)} · ${esc(a.sku)} · ${a.quantity}</p>`).join('')}</div>` : ''}</section>
        ${d.note ? `<section class="p05-saved-note hn-note-section"><h3>Ghi chú</h3><p data-hn-readable="Ghi chú · ${esc(d.number)}">${esc(d.note)}</p></section>` : ''}`;
      footer = button('back', 'Quay lại soạn hàng', 'p05-secondary') + button('send', 'Gửi phiếu lên Web', 'p05-primary')
        + (s.outcome === 'not-recorded' ? button('home', `${icon('house')} Về Trang chủ`, 'p05-secondary') : '');
    } else {
      body = waitingWebResult({kind:'outbound',state:s});
      footer = button('history', 'Xem lịch sử '+icon('clock'), 'p05-primary') + `<div class="hn-waiting-actions">${button('document', 'Xem chứng từ', 'p05-secondary')}${button('home', 'Về Trang chủ', 'p05-secondary')}</div>`;
    }
    renderManualEntry(root, `<section data-state-panel="${s.recorded&&s.outcome==='recorded'?'P24.S03':''}" class="p05-app" data-panel="${s.exception ? 'P17.S02' : `P05.S0${s.step}`}" aria-busy="${s.busy}"><header class="p05-header">${button('back', icon('back'))}<h1 tabindex="-1">${s.recorded?'Đã gửi phiếu':s.exception ? 'Kiểm tra mã xuất kho' : 'Xuất kho'}</h1>${s.step < 4 && !s.exception ? `<span>Bước ${s.step}/3</span>` : ''}</header>${s.step===2&&!s.exception?`<div class="p05-live-progress" aria-label="Tiến độ soạn hàng"><strong>Đã soạn ${count}/${d.planned}</strong><span>${count===d.planned?'Đã đủ số lượng':`Còn ${d.planned-count}`}</span></div>`:''}<div class="p05-sheet">${s.exception?'':flowProgress(s.step)}<div class="p05-scroll" role="region" aria-label="Nội dung phiếu xuất" tabindex="0"><div class="p05-content">${body}</div>${s.unknown ? `<div class="p05-unknown" data-dependency="P17.S04"><strong>Cần kiểm tra trạng thái</strong><p>Phiếu ${esc(d.number)} · ${esc(s.request.requestId)}</p>${button('check', s.busy ? 'Đang đối chiếu…' : 'Kiểm tra kết quả gửi')}${button('status-dependency', 'Hướng dẫn đối chiếu Web')}</div>` : ''}</div><footer class="p05-footer">${!s.recorded?`<span class="p05-draft-state">${s.busy?(s.unknown?'Đang đối chiếu':'Đang gửi phiếu'):s.unknown?'Chờ đối chiếu':s.request?'Phiếu đã khóa':'Đang soạn'}</span>`:''}${footer}</footer></div></section>`, 'p05');
    const keptCode=root.querySelector('#p05-code');if(keptCode&&keptCode.value!==codeValue)keptCode.value=codeValue;
    root.querySelector('[data-p05="back"]').setAttribute('aria-label', s.exception ? 'Quay lại quét mã' : s.returnToReview ? 'Quay lại kiểm tra phiếu' : s.step > 1 && s.step < 4 ? 'Quay lại bước trước' : 'Về Trang chủ');
    root.querySelector('.p05-app').classList.toggle('p05-manual-open', s.step === 2 && manual && !s.exception);
    if (s.step === 1 && !s.exception) {
      for (const [name, selector] of Object.entries({phone:'[data-p05-field="phone"]', address:'[data-p05-field="address"]', planned:'input[aria-label="Số lượng cần soạn"]', note:'[data-p05-note]'})) root.querySelector(selector).dataset.p05Validate = name;
      root.querySelector('[data-p05-field="phone"]').setAttribute('autocomplete', 'tel');
      root.querySelector('[data-p05-field="address"]').setAttribute('autocomplete', 'street-address');
    }
    root.querySelector('[data-p05="clear-code"]')?.setAttribute('aria-label','Xóa ô nhập mã');
    root.querySelector('[data-p05="edit-shipping"]')?.setAttribute('aria-expanded',String(shippingOpen));
    syncErrors();
    for (const control of root.querySelectorAll('button, input, select, textarea')) control.disabled = s.busy || control.dataset.p05Disabled === 'true' || !!(s.request && control.matches('[data-p05-select]')) || !!(s.attempts.length && control.matches('[data-p05-select="source"], [data-p05-select="group"]'));
    if (s.step === 2 && !s.exception) {
      const toggle = root.querySelector('[data-p05="manual"]');
      toggle.disabled = s.busy || frozen;
      if(frozen) root.querySelectorAll('#p05-code,.p05-check-code,[data-p05="clear-code"]').forEach(el=>el.disabled=true);
      toggle.setAttribute('aria-expanded', String(manual));
      if (manual) toggle.setAttribute('aria-controls', 'p05-manual-form');
      root.querySelector('[data-p05="torch"]').disabled = true;
      root.querySelector('[data-p05="torch"]').title = 'Đèn chỉ dùng khi camera được kết nối.';
      const next = root.querySelector('[data-p05="next"]');
      next.disabled = s.busy || !count; next.setAttribute('aria-describedby', 'p05-review-hint');
    }
    if (s.step === 1 && !s.exception) {
      root.querySelector('[data-p05="edit-shipping"]')?.setAttribute('aria-controls','p05-shipping-fields');
      const next=root.querySelector('[data-p05="next"]');
      next.disabled=s.busy || geo.provinceStatus==='loading' || geo.districtStatus==='loading';
      if(geo.provinceStatus==='loading' || geo.districtStatus==='loading')next.textContent='Đang tải địa giới…';
    }
    const send = root.querySelector('[data-p05="send"]'); if (send) { send.disabled = s.busy || s.unknown || count !== d.planned || Object.keys(flow.fieldErrors()).length > 0; if (s.busy) send.textContent = s.unknown?'Đang đối chiếu…':'Đang gửi…'; }
    if (s.unknown) root.querySelectorAll('[data-p05="back"]').forEach(b => b.disabled = true);
    if (s.exception || previousStep !== s.step) { root.querySelector('h1').focus({ preventScroll: true }); previousStep = s.step; }
    else if (focusSelect) {
      const control=root.querySelector(`[data-p05-select="${focusSelect}"]`);if(control&&!control.disabled)control.focus({preventScroll:true});
    }
    else if (focusField || focusNote) {
      const control = root.querySelector(focusNote ? '[data-p05-note]' : `[data-p05-field="${focusField}"]`);
      if(control && !control.disabled){control.focus({preventScroll:true});if(selection)control.setSelectionRange(...selection);}
    }
    else if (focusAction) {
      const control = [...root.querySelectorAll('[data-p05]')].find(el => el.dataset.p05 === focusAction && !el.disabled);
      control?.focus({ preventScroll: true });
    }
    root.querySelector('.p05-scroll').scrollTop = stepChanged ? 0 : priorScroll;
    exceptionExperience.after(s);
    announce(s);
    onSize();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
  const feedback = createActionFeedback({
    getScreen: () => root.closest('.hn-screen'), tools,
    isActive: () => visible, key: 'hnP05Feedback',
  });
  const exceptionExperience=createExceptionExperience({root,owner:'p05',getState,getSnapshot:()=>flow.snapshot(),isActive:()=>visible,feedback,onBack:()=>{if(flow.dismissException())exceptionExperience.restore();}});
  function announce(s) {
    const message = s.message;
    const fieldMessage = s.step === 1 && Object.values(flow.fieldErrors()).includes(message);
    const scanMessage = s.step === 2 && s.attempts.at(-1)?.reason === message;
    const changed = message && message !== previousMessage;
    previousMessage = message;
    if (!changed || s.busy || fieldMessage || scanMessage || s.exception) return;
    // Let input/render handlers finish restoring their control before modal focus starts.
    queueMicrotask(() => {
      if (!visible || flow.snapshot().message !== message) return;
      const trigger = [...root.querySelectorAll('[data-p05]')].find(el => el.dataset.p05 === feedbackTrigger && !el.disabled);
      (trigger || root.querySelector('h1'))?.focus({preventScroll:true});
      if(s.unknown&&onSystem({kind:'unknown'},{read:async()=>{await flow.check();const latest=flow.snapshot();return {kind:!latest.unknown&&!latest.busy?'verified':'unknown'};}}))return;
      feedback.show(s.unknown ? {
        title: 'Chưa xác định kết quả gửi', message: scanReason(message), tone: 'warning',
        cancelLabel: 'Để sau', confirmLabel: 'Đối chiếu', onConfirm: () => void flow.check(),
      } : {
        title: s.outcome === 'not-recorded' ? 'Phiếu chưa được ghi nhận' : 'Thông báo',
        message: scanReason(message), tone: s.outcome === 'not-recorded' ? 'warning' : 'neutral',
      });
    });
  }
  const flow = createOutboundFlow({ adapter, getState, onChange: (...args) => { render(...args); onStateChange(args[0]); }, onStopped });
  function onClick(event) {
    const action = event.target.closest('[data-p05]')?.dataset.p05; if (!action) return;
    const fromApp = root.contains(event.target);
    if (fromApp) feedbackTrigger = action;
    if (action === 'torch') previousMessage = '';
    const s = flow.snapshot();
    if (action === 'next') {
      if (s.step === 1) { if(!deliveryIsValid(flow.fieldErrors()))shippingOpen=true;Object.keys(flow.fieldErrors()).forEach(name => touched.add(name)); }
      if (!flow.next()) {
        syncErrors();
        const invalid=root.querySelector('[data-p05-validate][aria-invalid="true"]:not(:disabled)');
        (invalid || root.querySelector('[data-p05="retry-provinces"], [data-p05="retry-districts"]') || root.querySelector('h1'))?.focus();
      }
    }
    else if (['exception-back','exception-return','exception-manual'].includes(action)) { if(action==='exception-manual')manual=true; if(!flow.dismissException())return; exceptionExperience.restore({manual:action==='exception-manual'}); }
    else if (action === 'copy-reconciliation') void exceptionExperience.copy();
    else if (action === 'review-reconciliation') exceptionExperience.openReconciliation();
    else if (action === 'edit-review') {shippingOpen=true;if(flow.editDelivery())root.querySelector('[data-p05-select="recipient"]')?.focus();}
    else if (action === 'edit-shipping') setShipping(true,true);
    else if (action === 'complete-shipping') {if(deliveryIsValid(flow.fieldErrors()))setShipping(false,true);}
    else if (action === 'clear-code') {codeValue='';codeError='';codeTone='idle';const input=root.querySelector('#p05-code');if(input)input.value='';syncErrors();protectDraft();scanFocus();}
    else if (action.startsWith('filter-')) {const filter=action.slice(7);if(['all','duplicate','error'].includes(filter)){scanFilter=filter;all=false;render(s);}}
    else if (action.startsWith('attempt-')) {const attempt=s.attempts[Number(action.slice(8))];if(attempt)feedback.show({title:'Chi tiết mã đã quét',message:`Mã: ${attempt.raw}\nThời gian: ${attempt.time}\n${scanReason(attempt.reason || 'Mã đã được quét trước đó.')}\nMã này không cộng thêm số lượng.`,confirmLabel:'Đóng'});}
    else if (action === 'back' && s.returnToReview) {root.querySelector('[data-p05="next"]')?.click();}
    else if (action === 'back') { if (s.step === 1 || s.step === 4) onBack(); else flow.back(); }
    else if (action === 'home') onHome();
    else if (action === 'retry-provinces') void flow.loadProvinces();
    else if (action === 'retry-districts') void flow.loadDistricts();
    else if (action === 'send' || action === 'check') void flow[action]();
    else if (action === 'batch') {
      flow.fixtureBatch();
      root.querySelector('h1')?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    else if (action === 'manual' || action === 'close-manual') { manual = action === 'manual'; render(s); if(manual)scanFocus();else root.querySelector('[data-p05="manual"]').focus(); }
    else if (action === 'continue') {
      if (s.request || s.accepted.reduce((n, row) => n + row.quantity, 0) === s.document.planned) { scanFilter='all'; all = true; render(s); root.querySelector('.p05-attempts').setAttribute('tabindex', '-1'); root.querySelector('.p05-attempts').focus(); }
      else { manual = true; render(s); scanFocus(); }
    }
    else if (action === 'all' || action === 'products') { all = !all; render(s); }
    else if (action === 'torch') flow.message('Đèn/camera chưa kết nối thiết bị. Chưa bật đèn.');
    else if (action === 'history') {if(s.recorded&&s.outcome==='recorded')onHistory?.();}
    else if (action === 'document') {if(onDocument&&s.recorded&&s.outcome==='recorded')onDocument(s.document.documentId);else feedback.show({title:'Chưa thể xem chứng từ', message:`Phiếu ${s.document.number} đã gửi, chưa ghi sổ. Chức năng xem chứng từ chưa được kết nối; thông tin phiếu được giữ nguyên.`});}
    else if (action === 'status-dependency') feedback.show({title:'Đối chiếu kết quả gửi', message:'Chưa có địa chỉ Web được cấu hình. Giữ nguyên phiếu, phiên quét và yêu cầu; chọn Kiểm tra kết quả gửi để đối chiếu trước khi gửi lại.'});
    if (fromApp && action !== 'home' && !(action === 'back' && (s.step === 1 || s.step === 4))) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }
  listen(root, 'click', onClick); listen(review, 'click', onClick);
  const selects = mountSelectControls(root, (name, selected) => {
    if (name === 'source') {
      const expectedDocument=flow.snapshot().document,review=sourceChangeReview(expectedDocument,selected);
      if(!review)return;
      feedback.show({
        ...review,className:'p05-source-review',
        cancelLabel:'Hủy',confirmLabel:'Đổi phiếu',tone:'danger',
        onConfirm:()=>{
          if(!canApplySourceChange(flow.snapshot(),expectedDocument)){
            feedback.show({title:'Thông tin phiếu đã thay đổi',message:'Chưa đổi phiếu. Kiểm tra thông tin hiện tại và chọn lại phiếu cần đổi.'});return;
          }
          flow.select('source',selected);root.querySelector('[data-p05-select="source"]')?.focus({preventScroll:true});
        },
      });
    } else {
      if(['recipient','province','district'].includes(name))shippingOpen=true;flow.select(name, selected);
      const target = selected === 'walk-in' ? '[data-p05-field="recipient"]' : name === 'district' ? '[data-p05-field="address"]' : `[data-p05-select="${name}"]`;
      root.querySelector(target)?.focus({preventScroll:true});
    }
  }, () => queueMicrotask(() => {
    if(visible && deferredGeography && !selects.isOpen())render(flow.snapshot());
  }));
  listen(root, 'input', event => {
    if (event.target.matches('[data-p05-field]')) { flow.field(event.target.dataset.p05Field, event.target.value); if (event.target.dataset.p05Field === 'planned') touched.add('planned'); }
    if (event.target.matches('[data-p05-note]')) { flow.note(event.target.value); root.querySelector('.p05-note-count').textContent = `${event.target.value.length}/200`; }
    if (event.target.id === 'p05-code') { codeValue = event.target.value; codeError = ''; codeTone = 'idle'; }
    syncErrors();protectDraft();
    const addressPreview=root.querySelector('[data-p05-address-preview]');
    if(addressPreview){const d=flow.snapshot().document;addressPreview.hidden=!d.address.trim();addressPreview.textContent=[d.address,d.districtName,d.provinceName].filter(Boolean).join(', ');}
  });
  listen(root, 'focusout', event => {
    if(event.target.dataset.p05Validate){touched.add(event.target.dataset.p05Validate);syncErrors();}
    if(event.target.closest('#p05-shipping-fields'))queueMicrotask(()=>{
      if(!visible || flow.snapshot().step!==1 || !shippingOpen || selects.isOpen() || root.closest('.hn-screen').querySelector('dialog[open]'))return;
      const active=document.activeElement;
      if(active?.matches('[data-p05-field="planned"],[data-p05-note],[data-p05-select="group"]')&&deliveryIsValid(flow.fieldErrors()))setShipping(false);
    });
  });
  if(window.visualViewport)listen(window.visualViewport,'resize',()=>{
    cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(()=>{if(visible && document.activeElement?.id==='p05-code')scanFocus();});
  });
  const composingInputs=new WeakSet();
  listen(root, 'compositionstart',event=>{if(event.target.id==='p05-code')composingInputs.add(event.target);});
  listen(root, 'compositionend',event=>{composingInputs.delete(event.target);});
  listen(root, 'keydown', event => {
    if (event.target.id !== 'p05-code') return;
    if (event.isComposing || event.keyCode===229 || composingInputs.has(event.target)) { if (event.key === 'Enter') event.preventDefault(); return; }
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); manual = false; render(flow.snapshot()); root.querySelector('[data-p05="manual"]')?.focus(); }
  });
  listen(root, 'submit', event => {
    if (!event.target.matches('.p05-manual')) return;
    event.preventDefault(); if(composingInputs.has(root.querySelector('#p05-code')))return; codeValue = root.querySelector('#p05-code').value; codeError = manualCodeError(codeValue); codeTone = codeError ? 'invalid' : 'idle';
    if (!codeError) {
      const result = flow.scan(codeValue), after = flow.snapshot();
      if (result === false) return; // A session/warehouse guard may have opened P03; retain its focus.
      codeTone = result;
      if (result === 'valid') { codeValue = ''; codeTone = 'idle'; }
      else if (result === 'duplicate') codeError = 'Mã đã được quét. Không cộng thêm số lượng.';
      else if (result === 'invalid') codeError = scanReason(after.message);
      render(after);
    }
    syncErrors();
    if (flow.snapshot().exception) root.querySelector('h1')?.focus(); else scanFocus();
    if (codeError) root.querySelector('#p05-code')?.select();
  });
  listen(review.querySelector('select'), 'change', event => {adapter.setOutcome(event.target.value);render(flow.snapshot());});
  return {
    flow,
    show(context, options) { visible = true; review.hidden = false; if (!flow.start(context, options)) { visible = false; review.hidden = true; return false; } render(flow.snapshot()); void flow.loadProvinces(); return true; },
    hide({ leave = false } = {}) { visible = false; exceptionExperience.hide(); feedback.clear(); deferredGeography=false; selects.close(); review.hidden = true; if (leave) flow.leave(); },
    dispose() { exceptionExperience.dispose(); exitGuard.dispose();cancelAnimationFrame(scrollFrame); visible = false; feedback.dispose(); deferredGeography=false; events.abort(); selects.dispose(); flow.dispose(); root.removeEventListener('click', onClick); review.remove(); },
  };
}
