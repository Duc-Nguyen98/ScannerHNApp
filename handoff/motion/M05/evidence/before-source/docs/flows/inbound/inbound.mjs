import {mountInboundMotion} from './motion.mjs?v=M04-r01';
import {renderManualEntry,revealManualInput} from './manual-entry.mjs?v=M04-r01';
import {createExceptionExperience} from '../scan-exceptions/experience.mjs';
import {renderScanException} from '../scan-exceptions/view.mjs';
import {flowProgress,reviewTotals} from '../shared/flow-guidance.mjs';
import { createActionFeedback } from '../shared/action-feedback.mjs';
import { selectMarkup, mountSelectControls } from './select-control.mjs?v=p04-r09';
import { manualCodeError } from './validation.mjs';
import { INBOUND_TYPES, INBOUND_SUPPLIERS } from './catalogue.mjs';
import { createInboundFixtureAdapter } from './fixture-adapter.mjs?v=p04-r08';
import { createInboundFlow } from './inbound-flow.mjs?v=motion-M04-r01';
import { DIALOG_ICONS } from '../scanner-dialogs/icons.mjs';
import { INBOUND_ICONS } from './icons.mjs';
import { waitingWebResult, waitingWebDocumentLabel, createWaitingResultReturn } from '../shared/waiting-web.mjs';
import { SCAN_FILTERS, scanListView, skuGroups } from './scan-view.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const glyphs = { ...DIALOG_ICONS, lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>' }; // lock/info from auth-session/app.mjs
const icon = name => `<svg class="p04-icon" viewBox="0 0 24 24" aria-hidden="true">${INBOUND_ICONS[name] || glyphs[name] || glyphs.document}</svg>`;
const button = (action, label, cls = '') => `<button type="button" class="p04-button ${cls}" data-p04="${action}">${label}</button>`;
const scanReason = reason => reason?.includes('nguồn sản phẩm fixture') ? 'Không tìm thấy sản phẩm. Kiểm tra lại mã và thử lại.' : reason;
const info = (title, text) => `<aside class="p04-info">${icon('info')}<div><strong>${title}</strong>${text}</div></aside>`;

export function mountInbound({ root, tools, getState, onHome, onStopped, onSize, onDocument, onHistory, onNewRun, onBack = onHome, supplierHistory , onStateChange = () => {}, onSystem = () => false, motionMode='auto' }) {
  const adapter = createInboundFixtureAdapter({sample:new URLSearchParams(location.search).get('sample')==='b24'?'b24':null});
  const resultReturn=createWaitingResultReturn({root,namespace:'p04',getSnapshot:()=>flow.snapshot(),isActive:()=>visible});

  let visible = false, manual = false, all = false, previousStep = 0, previousMessage = '', displayedDocumentId = null;
  const touched = new Set();
  let codeValue = '', codeError = '';
  let codeTone = 'idle';
  let feedbackTrigger = null;
  let attemptFilter='all', resuming=false, leftWithDraft=false;
  const expandedSkus=new Set();
  let scanInput=null;
  const stepScroll=new Map();
  function rememberScroll(){
    const app=root.querySelector('.p04-app'),scroll=app?.querySelector('.p04-scroll');
    const step=Number(app?.dataset.panel?.split('S')[1]);
    if(scroll&&step>=1&&step<=4)stepScroll.set(step,scroll.scrollTop);
    return {step,scroll};
  }
  const motion=mountInboundMotion({root,isActive:()=>visible,requested:motionMode});
  function syncErrors() {
    const state = flow.snapshot(), errors = flow.fieldErrors();
    review.querySelector('[data-p04-snapshot]').textContent = JSON.stringify({ ...state, metrics: adapter.metrics() }, null, 2);
    for (const control of root.querySelectorAll('[data-p04-validate]')) {
      const name = control.dataset.p04Validate, message = touched.has(name) ? errors[name] || '' : '';
      const id = `p04-error-${name}`;
      let hint = root.querySelector(`#${id}`);
      if (!hint) { hint = document.createElement('small'); hint.id = id; hint.className = 'p04-field-error'; hint.setAttribute('aria-live', 'polite'); control.closest('.p04-field').append(hint); }
      hint.textContent = message; hint.hidden = !message;
      motion.validation(hint, `${state.document?.documentId}:${name}`, message);
      control.setAttribute('aria-invalid', String(!!message)); control.setAttribute('aria-describedby', id);
      control.closest('.p04-field').classList.toggle('p04-invalid', !!message);
    }
    const code = root.querySelector('#p04-code');
    if (code) {
      code.setAttribute('aria-invalid', String(!!codeError && codeTone !== 'duplicate'));
      const hint = root.querySelector('#p04-error-code');
      hint.textContent = codeError || 'Nhập từng mã, rồi nhấn Enter hoặc Kiểm tra mã.';
      hint.dataset.tone = codeTone; hint.hidden = false;
    }
  }
  const review = document.createElement('details'); review.className = 'p04-tools'; review.hidden = true;
  review.innerHTML = `<summary>Kịch bản kiểm tra P04 · 4 panel</summary><p>Fixture riêng, trong bộ nhớ tab; không kết nối WMS. Đóng/reload tab sẽ mất nháp. Mã PN-0005 và thời gian là mẫu B04, không phải giá trị server.</p><label>Kết quả gửi <select data-p04-outcome><option value="confirmed">Xác nhận record</option><option value="failed">Từ chối</option><option value="unknown">UNKNOWN</option><option value="timeout-recorded">Timeout nhưng đã record</option><option value="not-recorded">Kiểm tra: chưa record</option><option value="status-unavailable">Thiếu nguồn tra trạng thái</option></select></label>${button('batch', 'Nạp 12 lượt quét B04 (fixture)')}<p>Camera và đèn thật chưa tích hợp. Nạp lượt quét dùng chung pipeline với Nhập tay. Các mã fixture: HN12345–HN12355.</p><pre data-p04-snapshot></pre>`;
  tools.append(review);if(new URLSearchParams(location.search).get('sample')==='b24'){const label=document.createElement('p');label.textContent='MẪU B24 RIÊNG — PN-0005/12 mã hoặc PX-0004/10 mã. Qua owner record mô phỏng; không phải WMS.';review.prepend(label);}
  const title = (head, sub) => `<div class="p04-section-title"><h2>${head}</h2><p>${sub}</p></div>`;
  const row = (name, label, value, extra = '') => `<div class="p04-summary-row"><span class="p04-tile hn-operation-icon" data-hn-operation="${['document','box'].includes(name)?'inbound':'documents'}">${icon(name)}</span><div><small class="p04-summary-label">${label}</small><strong class="p04-summary-value" ${['Trạng thái','Số lượng'].includes(label)?'':`data-hn-readable="${esc(label)}" data-hn-readable-kind="value"`}>${esc(value)}</strong>${extra}</div></div>`;
  function render(s) {
    if (!visible) return;
    motion.beforeRender();
    rememberScroll();
    exceptionExperience.before(s);
    selects?.close();
    if (s.document?.documentId !== displayedDocumentId) {
      manual = false; all = false; previousStep = 0; previousMessage = ''; touched.clear(); codeValue=''; codeError=''; codeTone='idle';
      attemptFilter='all';resuming=false;expandedSkus.clear();stepScroll.clear();
      displayedDocumentId = s.document?.documentId;
    }
    const focusAction = root.contains(document.activeElement) ? document.activeElement?.dataset.p04 : null;
    const priorScroll = stepScroll.get(s.step) || 0;
    const d = s.document; if (!d) return;if(s.recorded&&s.outcome==='recorded')supplierHistory?.use(d.supplierId);
    if(s.step===2&&!s.exception&&!s.unknown)scanInput=flow.bindScan('manual');else scanInput=null;
    review.querySelector('[data-p04-snapshot]').textContent = JSON.stringify({ ...s, metrics: adapter.metrics() }, null, 2);
    const count = s.accepted.reduce((n, row) => n + row.quantity, 0);
    const contextCard = `<section class="p04-scan-context" aria-label="Phiếu đang nhập"><span class="hn-operation-icon" data-hn-operation="inbound" data-size="sm" aria-hidden="true">${icon('document')}</span><div><strong>${resuming?'Tiếp tục phiếu dở · ':''}${esc(d.number)}</strong><p>${esc(d.type)}</p><span class="p04-context-supplier" data-hn-readable="Nhà cung cấp của phiếu ${esc(d.number)}" data-hn-readable-kind="value">${esc(d.supplier)}</span>${resuming?`<small>Đã giữ ${s.accepted.length} mã hợp lệ</small>`:''}</div>${button('context','Chi tiết','p04-context-more')}</section>`;
    if (s.unknown || s.exception) {
      previousMessage=s.message;
      renderScanException({root,owner:'p04',state:s,canCheck:flow.canCheck(),onSize});
      exceptionExperience.exception(s,flow.canCheck());
      return;
    }
    let body, footer;
    if (s.step === 1) {
      body = `${resuming?contextCard:''}${title('Thông tin phiếu nhập', 'Vui lòng nhập đầy đủ thông tin trước khi quét mã')}
        <label class="p04-field">Kho nhập <em>*</em><span class="p04-input locked">${icon('house')}<input aria-label="Kho nhập" value="${esc(d.warehouseName)}" readonly>${icon('lock')}</span></label>
        ${selectMarkup({name:'type',label:'Loại nhập',glyph:icon('box'),options:INBOUND_TYPES,value:d.typeId,validation:'type',hint:s.attempts.length?'Đã có lượt quét: loại nhập được khóa.':''})}
        <label class="p04-field">Mã phiếu nhập <em>*</em><span class="p04-input">${icon('document')}<input data-p04-validate="number" aria-label="Mã phiếu nhập" value="${esc(d.number)}" readonly>${icon('lock')}</span></label>
        ${selectMarkup({name:'supplier',label:'Nhà cung cấp',glyph:icon('warehouse'),options:INBOUND_SUPPLIERS,value:d.supplierId,validation:'supplier',searchable:true})}
        <label class="p04-field">Ghi chú<textarea maxlength="200" data-p04-note data-p04-validate="note" placeholder="Nhập ghi chú (nếu có)" ${s.request ? 'readonly' : ''}>${esc(d.note)}</textarea><small class="p04-note-count">${d.note.length}/200</small></label>
        ${info('Lưu ý', '<ul><li>Kiểm tra thông tin trước khi quét mã</li><li>Scan không làm thay đổi tồn kho</li><li>Phiếu sẽ được gửi lên Web sau khi kiểm tra</li></ul>')}`;
      footer = button('next', `Tiếp tục quét mã ${icon('arrow')}`, 'p04-primary');
    } else if (s.step === 2) {
      const list=scanListView(s.attempts,attemptFilter), duplicates=list.counts.duplicate;
      const selectedLabel=SCAN_FILTERS.find(f=>f.id===list.selected).label;
      body = `<div class="p04-scan-intro"><span>${icon('scan')}</span><div><h2>Quét hàng nhập vào</h2><p>${manual ? 'Nhập mã để thêm sản phẩm vào phiếu' : 'Quét hoặc nhập mã QR/Serial/SKU'}</p></div></div>
        ${contextCard}
        <div class="p04-camera" role="img" aria-label="Ảnh kho minh họa; camera chưa bật"><div class="p04-reticle"></div><span>Camera chưa kết nối</span></div>
        <div class="p04-scan-actions">${button('torch', `${icon('torch')} Đèn chưa sẵn sàng`)}${button('manual', `${icon('keyboard')} Nhập tay`)}</div>
        ${manual ? `<form id="p04-manual-form" class="p04-manual" novalidate aria-label="Nhập mã nhập kho"><div class="p04-manual-heading"><strong>${icon('keyboard')} Nhập mã sản phẩm</strong>${button('close-manual', 'Thu gọn', 'p04-collapse')}</div><label for="p04-code">Mã QR/Serial/SKU <em>*</em></label><div class="p04-code-row"><input id="p04-code" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="Ví dụ: HN12345" required aria-describedby="p04-error-code" value="${esc(codeValue)}"><button class="p04-button p04-check-code" type="submit">Kiểm tra mã</button></div><p id="p04-error-code" class="p04-code-feedback" role="status" aria-live="polite" aria-atomic="true"></p></form>` : ''}
        <section class="p04-counter p04-filter-counter" role="group" aria-label="Lọc mã đã quét theo kết quả"><button type="button" data-p04-filter="all" aria-pressed="${list.selected==='all'}" aria-controls="p04-scan-list" aria-label="Tất cả ${list.counts.all} lượt quét">Tổng đã quét<strong>${list.counts.all}</strong><small>lượt quét · Tất cả</small></button><div>${SCAN_FILTERS.slice(1).map(f=>`<button type="button" data-p04-filter="${f.id}" aria-pressed="${list.selected===f.id}" aria-controls="p04-scan-list" aria-label="${f.label} ${list.counts[f.id]} lượt quét"><span>${f.label}</span><b>${list.counts[f.id]}</b></button>`).join('')}</div></section>
        <p class="p04-scan-progress" role="status">${count ? `${count} sản phẩm hợp lệ · Sẵn sàng kiểm tra phiếu` : 'Chưa có sản phẩm hợp lệ'}${duplicates ? ` · ${duplicates} mã trùng không tính` : ''}</p>
        <div class="p04-list-heading"><h2>Mã đã quét <small>(${list.rows.length}/${s.attempts.length} lượt · ${selectedLabel})</small></h2>${list.rows.length > 4 ? button('all', all ? 'Thu gọn' : 'Xem tất cả →', 'p04-link') : ''}</div>
        <div class="p04-attempts" id="p04-scan-list">${(all ? list.rows : list.rows.slice(0, 4)).map(({attempt:a,index}) => `<div class="p04-attempt" data-scan-index="${index}" data-scan-event="${esc(a.eventId||'')}"><span class="p04-dot ${a.kind === 'valid' ? 'valid' : 'error'}" aria-hidden="true">${a.kind === 'valid' ? '✓' : '×'}</span><div class="p04-attempt-code"><strong data-hn-readable="Mã đã quét" data-hn-readable-kind="value">${esc(a.raw)}</strong>${index===s.attempts.length-1?'<small class="p04-latest-label">Gần nhất</small>':''}${a.reason ? `<small data-hn-readable="Lý do kiểm tra mã" data-hn-lines="3">${esc(scanReason(a.reason))}</small>` : ''}</div><time>${esc(a.time)}</time><span class="p04-badge ${a.kind}">${a.kind === 'valid' ? 'Hợp lệ' : a.kind === 'duplicate' ? 'Trùng mã' : 'Mã lỗi'}</span></div>`).join('') || `<div class="p04-empty">${icon('scan')}<strong>${s.attempts.length?'Không có lượt quét thuộc nhóm này':'Chưa có mã được quét'}</strong>${s.attempts.length?button('clear-filter','Xem tất cả lượt quét','p04-link'):'<p>Chọn Nhập tay để thêm sản phẩm đầu tiên.</p>'}</div>`}</div>`;
      footer = `<p id="p04-review-hint" class="p04-footer-hint">${!count ? 'Thêm ít nhất 1 mã hợp lệ để kiểm tra phiếu.' : 'Kiểm tra thông tin và mã đã quét trước khi gửi.'}</p>` + button('next', `Kiểm tra phiếu ${icon('arrow')}`, 'p04-primary') + button('continue', 'Tiếp tục quét', 'p04-secondary');
    } else if (s.step === 3) {
      const groups=skuGroups(s.accepted);
      body = `${title('Thông tin phiếu nhập', 'Kiểm tra thông tin trước khi gửi lên Web')}
        ${reviewTotals('Nhập kho',s.accepted)}<div class="p04-review-summary">${row('house', 'Kho nhập', d.warehouseName)}${row('document', 'Mã phiếu', d.number)}${row('box', 'Loại nhập', d.type)}${row('warehouse', 'Nhà cung cấp', d.supplier, `<small>${esc(d.supplierCode)}</small>`)}${row('calendar', 'Ngày tạo', d.createdAt)}${row('user', 'Người tạo', d.actorName, `<small>${esc(d.actorRole)}</small>`)}</div>
        <section class="p04-products"><div class="p04-products-title"><h2>Danh sách sản phẩm hợp lệ</h2><span>Tổng: ${count}</span></div>${groups.map((g,i)=>`<section class="p04-sku-group"><button type="button" class="p04-product p04-sku-toggle" data-p04-sku="${esc(g.sku)}" aria-expanded="${expandedSkus.has(g.sku)}" aria-controls="p04-serials-${i}" aria-label="${esc(g.sku)} · ${g.serialCount} serial · số lượng ${g.quantity}"><span class="p04-product-image">${icon('box')}</span><span class="p04-sku-copy"><strong>${esc(g.sku)}</strong><small>${g.serialCount} serial · ${expandedSkus.has(g.sku)?'Thu gọn':'Xem serial'}</small></span><span class="p04-sku-quantity"><small>Số lượng</small><strong>${g.quantity}</strong></span>${icon('chevron')}</button><div id="p04-serials-${i}" class="p04-serials" ${expandedSkus.has(g.sku)?'':'hidden'}><ul>${g.serials.map(line=>`<li><span data-hn-readable="Serial · ${esc(g.sku)}" data-hn-readable-kind="value">${esc(line.serial||line.raw)}</span><small>${line.serial?"":"Chưa có serial · "}SL ${line.quantity}</small></li>`).join('')}</ul></div></section>`).join('')}</section>
        ${d.note ? `<section class="p04-saved-note hn-note-section"><h3>Ghi chú</h3><p data-hn-readable="Ghi chú · ${esc(d.number)}">${esc(d.note)}</p></section>` : ''}${info('Tồn kho chưa thay đổi', '<p>Gửi phiếu không làm thay đổi tồn kho.<br>Chỉ cập nhật sau khi ghi sổ thành công.</p>')}
        ${s.request && s.outcome === 'not-recorded' ? '<p class="p04-request-lock">Thông tin của lần gửi được giữ nguyên để thử lại. Chọn Gửi lại phiếu để gửi cùng yêu cầu, hoặc về Trang chủ để bắt đầu lượt mới.</p>' : ''}`;
      footer = button('back', 'Quay lại quét mã', 'p04-secondary') + button('send', `${s.outcome === 'not-recorded' ? 'Gửi lại phiếu' : 'Gửi phiếu lên Web'} ${icon('arrow')}`, 'p04-primary')
        + (s.outcome === 'not-recorded' ? button('new-run','Nhập lượt mới','p04-secondary') + button('home', `${icon('house')} Về Trang chủ`, 'p04-secondary') : '');
    } else {
      body = waitingWebResult({kind:'inbound',state:s});
      footer = button('document', waitingWebDocumentLabel(d.number), 'p04-primary') + `<div class="hn-waiting-actions">${button('new-run','Nhập lượt mới','p04-secondary')}${button('history','Xem lịch sử','p04-secondary')}${button('home','Trang chủ','p04-secondary')}</div>`;
    }
    renderManualEntry(root, `<section data-state-panel="${s.recorded&&s.outcome==='recorded'?'P24.S03':''}" class="p04-app ${manual ? 'p04-manual-open' : ''}" data-panel="P04.S0${s.step}" aria-busy="${s.busy}"><header class="p04-header">${button('back', icon('back'))}<h1 tabindex="-1">${s.recorded?'Đã gửi phiếu':'Nhập kho'}</h1>${s.step < 4 ? `<span>Bước ${s.step}/3</span>` : ''}</header><div class="p04-sheet">${s.exception?'':flowProgress(s.step)}<div class="p04-scroll" role="region" aria-label="Nội dung phiếu nhập" tabindex="0"><div class="p04-content">${body}</div>${s.unknown ? `<div class="p04-unknown" data-dependency="P17.S04"><strong>Cần kiểm tra trạng thái</strong><p>Phiếu ${esc(d.number)} · ${esc(s.request.requestId)}</p>${button('check', s.busy ? 'Đang đối chiếu…' : 'Kiểm tra kết quả gửi')}${button('status-dependency', 'Hướng dẫn đối chiếu Web')}</div>` : ''}</div><footer class="p04-footer">${footer}</footer></div></section>`, 'p04', {preserveCamera:true});
    const keptCode=root.querySelector('#p04-code');if(keptCode&&keptCode.value!==codeValue)keptCode.value=codeValue;
    root.querySelector('[data-p04="back"]').setAttribute('aria-label', s.step > 1 && s.step < 4 ? 'Quay lại bước trước' : 'Về Trang chủ');
    for (const control of root.querySelectorAll('button, input, select, textarea')) control.disabled = s.busy || !!(s.request && control.matches('[data-p04-select]')) || !!(s.attempts.length && control.matches('[data-p04-select="type"]'));
    syncErrors();
    if(s.step===2){
      const toggle=root.querySelector('[data-p04="manual"]');toggle.setAttribute('aria-expanded',String(manual));
      if(manual)toggle.setAttribute('aria-controls','p04-manual-form');
      root.querySelector('[data-p04="torch"]').disabled=true;
      const next=root.querySelector('[data-p04="next"]');next.disabled=s.busy||!count;next.setAttribute('aria-describedby','p04-review-hint');
    }
    const send = root.querySelector('[data-p04="send"]'); if (send) { send.disabled = s.busy || s.unknown || Object.keys(flow.fieldErrors()).length>0; if (s.busy) send.textContent = s.unknown?'Đang đối chiếu…':'Đang gửi…'; }
    if (s.request && s.step < 4) root.querySelectorAll('[data-p04="back"]').forEach(b=>b.disabled=true);
    if (previousStep !== s.step) { root.querySelector('h1').focus({ preventScroll: true }); previousStep = s.step; }
    else if (focusAction) {
      const control = [...root.querySelectorAll('[data-p04]')].find(el => el.dataset.p04 === focusAction && !el.disabled);
      control?.focus({ preventScroll: true });
    }
    root.querySelector('.p04-scroll').scrollTop = priorScroll;
    exceptionExperience.after(s);
    announce(s);
    motion.commit(s);
    onSize();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
  const feedback = createActionFeedback({
    getScreen: () => root.closest('.hn-screen'), tools,
    isActive: () => visible, key: 'hnP04Feedback',
  });
  const exceptionExperience=createExceptionExperience({root,owner:'p04',getState,getSnapshot:()=>flow.snapshot(),isActive:()=>visible,feedback,onBack:()=>{if(flow.dismissException())exceptionExperience.restore();}});
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
      const trigger = [...root.querySelectorAll('[data-p04]')].find(el => el.dataset.p04 === feedbackTrigger && !el.disabled);
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
  const flow = createInboundFlow({ adapter, getState, onChange: (...args) => { render(...args); onStateChange(args[0]); }, onStopped });
  function onClick(event) {
    const filter=event.target.closest('[data-p04-filter]');
    if(filter&&root.contains(filter)&&SCAN_FILTERS.some(f=>f.id===filter.dataset.p04Filter)){
      attemptFilter=filter.dataset.p04Filter;all=false;render(flow.snapshot());root.querySelector(`[data-p04-filter="${attemptFilter}"]`)?.focus({preventScroll:true});return;
    }
    const group=event.target.closest('[data-p04-sku]');
    if(group&&root.contains(group)){
      const sku=group.dataset.p04Sku;if(!flow.snapshot().accepted.some(a=>a.sku===sku))return;
      expandedSkus.has(sku)?expandedSkus.delete(sku):expandedSkus.add(sku);render(flow.snapshot());
      [...root.querySelectorAll('[data-p04-sku]')].find(el=>el.dataset.p04Sku===sku)?.focus({preventScroll:true});return;
    }
    const action = event.target.closest('[data-p04]')?.dataset.p04; if (!action) return;
    const fromApp = root.contains(event.target);
    if (fromApp) feedbackTrigger = action;
    if (action === 'torch') previousMessage = '';
    const s = flow.snapshot();
    if (action === 'next') { if(s.step===1)Object.keys(flow.fieldErrors()).forEach(n=>touched.add(n)); if(!flow.next()){syncErrors();root.querySelector('[aria-invalid="true"]')?.focus();} }
    else if (action === 'back') { if (s.step === 1 || s.step === 4) onBack(); else flow.back(); }
    else if (['exception-back','exception-return','exception-manual'].includes(action)) { if(action==='exception-manual')manual=true; if(!flow.dismissException())return; exceptionExperience.restore({manual:action==='exception-manual'}); }
    else if (action === 'copy-reconciliation') void exceptionExperience.copy();
    else if (action === 'review-reconciliation') exceptionExperience.openReconciliation();
    else if (action === 'home') onHome();
    else if (action === 'new-run') { feedback.clear(); if(flow.newRun())onNewRun?.(flow.snapshot().document.documentId); }
    else if (action === 'context') feedback.show({title:'Phiếu đang nhập',message:`Mã phiếu: ${s.document.number}\nLoại nhập: ${s.document.type}\nNhà cung cấp: ${s.document.supplier}\nMã NCC: ${s.document.supplierCode}\nKho: ${s.document.warehouseName}\n${s.accepted.length} mã hợp lệ · ${s.accepted.reduce((n,a)=>n+a.quantity,0)} sản phẩm`,confirmLabel:'Đóng',className:'hn-readable-dialog'});
    else if (action === 'clear-filter') {attemptFilter='all';all=false;render(s);root.querySelector('[data-p04-filter="all"]')?.focus({preventScroll:true});}
    else if (action === 'send' || action === 'check') void flow[action]();
    else if (action === 'batch') {
      flow.fixtureBatch();
      root.querySelector('h1')?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    else if (action === 'manual' || action === 'close-manual') { manual = action === 'manual'; render(s); if(manual)revealManualInput(root,'p04');else root.querySelector('[data-p04="manual"]').focus(); }
    else if (action === 'continue') { manual=true;render(s);revealManualInput(root,'p04'); }
    else if (action === 'all') { all = !all; render(s); }
    else if (action === 'torch') flow.message('Đèn/camera chưa kết nối thiết bị. Chưa bật đèn.');
    else if (action === 'history') {resultReturn.remember('history');if(s.recorded&&s.outcome==='recorded')onHistory?.();}
    else if (action === 'document') {resultReturn.remember('document');if(onDocument&&s.recorded&&s.outcome==='recorded')onDocument(s.document.documentId);else feedback.show({title:'Chưa thể xem chứng từ', message:`Phiếu ${s.document.number} đã gửi, chưa ghi sổ. Chức năng xem chứng từ chưa được kết nối; thông tin phiếu được giữ nguyên.`});}
    else if (action === 'status-dependency') feedback.show({title:'Đối chiếu kết quả gửi', message:'Chưa có địa chỉ Web được cấu hình. Giữ nguyên phiếu, phiên quét và yêu cầu; chọn Kiểm tra kết quả gửi để đối chiếu trước khi gửi lại.'});
    if (fromApp && action !== 'home' && !(action === 'back' && (s.step === 1 || s.step === 4))) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }
  root.addEventListener('click', onClick); review.addEventListener('click', onClick);
  const selects=mountSelectControls(root,(name,id)=>{
    if(flow.select(name,id)&&name==='supplier')supplierHistory?.use(id);
    root.querySelector(`[data-p04-select="${name}"]`)?.focus({preventScroll:true});
  });
  root.addEventListener('input',event=>{
    if(event.target.matches('[data-p04-note]')){
      if(!flow.note(event.target.value))event.target.value=flow.snapshot().document?.note||'';
      root.querySelector('.p04-note-count').textContent=`${event.target.value.length}/200`;
    }
    if(event.target.id==='p04-code'){codeValue=event.target.value;codeError='';codeTone='idle';}
    syncErrors();
  });
  root.addEventListener('focusout', event => { if (event.target.dataset.p04Validate) { touched.add(event.target.dataset.p04Validate); syncErrors(); } });
  const composingInputs=new WeakSet();
  root.addEventListener('compositionstart',event=>{if(event.target.id==='p04-code')composingInputs.add(event.target);});
  root.addEventListener('compositionend',event=>{composingInputs.delete(event.target);});
  root.addEventListener('keydown', event => {
    if (event.target.id !== 'p04-code') return;
    if (event.isComposing || event.keyCode===229 || composingInputs.has(event.target)) { if (event.key === 'Enter') event.preventDefault(); return; }
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); manual = false; render(flow.snapshot()); root.querySelector('[data-p04="manual"]')?.focus(); }
  });
  root.addEventListener('submit', event => {
    if (!event.target.matches('.p04-manual')) return;
    event.preventDefault(); if(composingInputs.has(root.querySelector('#p04-code')))return; codeValue = root.querySelector('#p04-code').value; codeError = manualCodeError(codeValue); codeTone = codeError ? 'invalid' : 'idle';
    if (!codeError) {
      const result = scanInput ? scanInput(codeValue) : false, after = flow.snapshot();
      if (result === false) return; // A session/warehouse guard may have opened P03; retain its focus.
      codeTone = result;
      if (result === 'valid') { codeValue = ''; codeTone = 'idle'; }
      else if (result === 'duplicate') codeError = 'Mã đã được quét. Không cộng thêm số lượng.';
      else if (result === 'invalid') codeError = scanReason(after.message);
      const input=root.querySelector('#p04-code');if(input)input.value=codeValue;
    }
    syncErrors();
    revealManualInput(root,'p04');
    if (codeError) root.querySelector('#p04-code')?.select();
  });
  review.querySelector('select').addEventListener('change', event => {adapter.setOutcome(event.target.value);render(flow.snapshot());});
  const viewportResize=()=>{if(visible&&document.activeElement?.id==='p04-code')revealManualInput(root,'p04',{focus:false});};
  window.visualViewport?.addEventListener('resize',viewportResize);
  return {
    flow,
    show(context, options) { visible = true;motion.activate();resuming=leftWithDraft||resuming;leftWithDraft=false; review.hidden = false; if (!flow.start(context, options)) { visible = false;motion.hide(); review.hidden = true; return false; } render(flow.snapshot()); resultReturn.restore(context); return true; },
    hide({ leave = false } = {}) { rememberScroll();const s=flow.snapshot();if(leave)leftWithDraft=!!s.document&&!s.outcome&&(!!s.document.note||!!s.attempts.length||!!codeValue);visible = false;motion.hide(); exceptionExperience.hide(); feedback.clear(); selects.close(); review.hidden = true; if (leave) flow.leave(); },
    setMotionMode:value=>motion.setMode(value),
    cancelMotion:()=>motion.cancel(),
    dispose() {motion.dispose();resultReturn.dispose(); window.visualViewport?.removeEventListener('resize',viewportResize); exceptionExperience.dispose(); visible = false;motion.hide(); feedback.dispose(); selects.dispose(); flow.dispose(); root.removeEventListener('click', onClick); review.remove(); },
  };
}
