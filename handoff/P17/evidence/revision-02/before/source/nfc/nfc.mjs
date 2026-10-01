import {renderScanException} from '../scan-exceptions/view.mjs';
import { openAppModal } from '../shared/app-modal.mjs';
import { createActionFeedback } from '../shared/action-feedback.mjs';
import { createDialogRoute } from '../shared/dialog-route.mjs';
import { createNfcFixtureAdapter } from './fixture-adapter.mjs';
import { createNfcFlow } from './nfc-flow.mjs';
import { HOME_ICONS } from '../home/icons.mjs';
import { LOOKUP_ICONS } from '../lookup/icons.mjs';
import { DIALOG_ICONS } from '../scanner-dialogs/icons.mjs';
// Additional geometry verbatim from repo HEAD lucide-react v1.31.0 (ISC).
const icons={...HOME_ICONS,...DIALOG_ICONS,...LOOKUP_ICONS,
 copy:'<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
 close:'<path d="M6 6l12 12M6 18 18 6"/>',
 plus:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8M12 8v8"/>',
 check:'<path d="M20 6 9 17l-5-5"/>',
 nfc:'<path d="M6 8.32a7.43 7.43 0 0 1 0 7.36M9.46 6.21a11.76 11.76 0 0 1 0 11.58M12.91 4.1a15.91 15.91 0 0 1 .01 15.8M16.37 2a20.16 20.16 0 0 1 0 20"/>',
};
const icon=n=>`<svg class="p07-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[n]||''}</svg>`;
const esc=x=>String(x??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const statuses={linked:'Đã liên kết',unlinked:'Chưa liên kết',locked:'Tạm khóa'};
const titles=['','Thẻ NFC','Đọc thẻ NFC','Xác minh liên kết','NFC - Hoàn tất'];
export function mountNfc({root,tools,screen,getState,onHome,onChooseProduct,onSize,onSystem=()=>false}){
 const adapter=createNfcFixtureAdapter({extended:true});
 let active=false,disposed=false,lastPanel=null,listTop=0,detailModal=null,detailTagId=null,detailTrigger=null,composing=false,copying=false,repeatLink=false;
 const copyTimers=new Set();
 const feedback=createActionFeedback({getScreen:()=>screen,tools,isActive:()=>active&&!disposed,key:'hnP07Feedback'});
 const detailRoute=createDialogRoute({history,location,key:'hnP07Detail'});
 const review=document.createElement('section');review.className='p07-tools';review.hidden=true;
 review.innerHTML=`<strong>P07 · Mô phỏng NFC</strong><p>Dữ liệu thử trong bộ nhớ, không đọc thẻ hoặc ghi WMS thật.</p><p class="p07-test-guide" data-p07-guide role="status"></p><label>Mã thẻ dùng để thử<select data-p07-read-tag aria-label="Chọn mã thẻ NFC mô phỏng"></select></label><p data-p07-selected-note></p><button type="button" data-p07-demo-read>Đọc thẻ mô phỏng</button><button type="button" data-p07-demo-begin>Bắt đầu liên kết</button><details><summary>Kịch bản kiểm tra P07</summary><label>Kết quả mô phỏng <select data-p07-scenario>${[['ready','Bình thường — đọc và liên kết'],['unsupported','Thiết bị không hỗ trợ NFC'],['permission','Từ chối quyền đọc NFC'],['read-error','Lỗi đọc thẻ'],['conflict','Thẻ gắn sản phẩm khác'],['locked','Thẻ tạm khóa'],['link-denied','Không có quyền liên kết'],['failed','Lưu thất bại đã xác định'],['unknown','Mất phản hồi sau lưu — cần đối chiếu']].map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label><p>Danh sách có 30 thẻ ban đầu. Bộ chọn bên trên có 5 mã để đọc thử liên tiếp. Mã đã liên kết được đánh dấu; không tự ghi đè.</p><details><summary>Chi tiết kỹ thuật</summary><pre data-p07-snapshot></pre></details></details>`;
 tools.append(review);
 const flow=createNfcFlow({adapter,getState,onChange:(_snapshot,change)=>{if(active)render({notifyMessage:Object.hasOwn(change,'message')&&!!change.message});else updateTools();}});
 const hashFor=panel=>`#p02/nfc${panel===1?'':`?panel=${panel}`}`;
 function saveRoute(previous){const hash=hashFor(flow.snapshot().panel);if(active&&hash!==location.hash)history.pushState({p07From:previous},'',hash);}
 const chip=status=>`<span class="p07-chip ${esc(status)}">${esc(statuses[status]||status)}</span>`;
 const tile=(small=false)=>`<span class="p07-nfc-tile ${small?'small':''}">${icon('nfc')}</span>`;
 function productCard(product,selectable=false){return `<${selectable?'button':'div'} class="p07-product" ${selectable?`data-p07="product" ${flow.snapshot().busy||flow.snapshot().unknown?'disabled':''}`:''}><img src="../lookup/assets/demo/box.png" alt="Hộp sản phẩm — ảnh demo"><span><strong>${esc(product?.code)}</strong><b ${selectable?'':'data-hn-readable="Tên sản phẩm liên kết" data-hn-readable-kind="value"'}>${esc(product?.name)}</b><small>SKU: ${esc(product?.sku)} <span class="p07-divider">|</span> SN: ${esc(product?.serial)}</small></span>${selectable?icon('chevron'):''}</${selectable?'button':'div'}>`;}
 const section=(title,body,cls='')=>`<section class="p07-section ${cls}"><h2>${title}</h2>${body}</section>`;
 const warehouse=()=>section('Thông tin kho',`<div class="p07-warehouse">${icon('pin')}<div><strong>${esc(getState().session?.warehouse.name)}</strong><small>Chỉ xem, không thể thay đổi</small></div>${icon('lock')}</div>`);
 const copy=uid=>`<button class="p07-copy" data-p07="copy" data-uid="${esc(uid)}" aria-label="Sao chép mã thẻ ${esc(uid)}">${icon('copy')}<span class="p07-copy-note" role="status" aria-live="polite"></span></button>`;
 const row=(label,value,glyph='',extra='')=>`<div>${glyph?icon(glyph):''}<dt>${label}</dt><dd>${value}${extra}</dd></div>`;
 function cards(){const data=flow.list();return data.items.length?data.items.map(t=>`<button class="p07-tag" data-p07-tag="${esc(t.id)}">${tile()}<span class="p07-tag-copy"><span class="p07-tag-top"><strong>${esc(t.label)}</strong>${chip(t.status)}</span><b>${esc(t.product?.name||'Chưa gắn sản phẩm')}</b><small>${t.product?`SN: ${esc(t.product.serial)} <span class="p07-divider">|</span> SKU: ${esc(t.product.sku)}`:`UID: ${esc(t.uid)}`}</small><small>${t.status==='unlinked'?'Tạo':'Cập nhật'}: ${esc(t.date)}</small></span>${icon('chevron')}</button>`).join(''):'<div class="p07-empty"><strong>Không tìm thấy thẻ</strong><p role="status">Thử tìm theo UID, mã sản phẩm, SKU hoặc serial.</p><button data-p07="clear-filters" class="p07-inline-action">Xóa tìm kiếm và bộ lọc</button></div>';}
 function list(){const s=flow.snapshot(),counts=flow.list().counts;return `<button class="p07-entry" data-p07="begin">${tile()}<span><strong>Quét hoặc liên kết thẻ NFC</strong><small>Đọc UID, liên kết với sản phẩm</small></span>${icon('chevron')}</button><div class="p07-search-row"><div class="p07-search-field">${icon('search')}<input id="p07-search" value="${esc(s.query)}" placeholder="Tìm UID, mã, SKU, serial..." aria-label="Tìm thẻ theo UID, sản phẩm, serial"><button data-p07="clear-query" class="p07-clear-query" aria-label="Xóa tìm kiếm" ${s.query?'':'hidden'}>${icon('close')}</button></div><button data-p07="filter" aria-label="Bộ lọc thẻ NFC">${icon('filter')}</button></div><div class="p07-tabs" role="tablist" aria-label="Trạng thái thẻ">${[['all','Tất cả'],['linked','Đã liên kết'],['unlinked','Chưa liên kết']].map(([v,l])=>`<button id="p07-tab-${v}" role="tab" aria-controls="p07-list" aria-selected="${s.tab===v}" tabindex="${s.tab===v?0:-1}" data-p07-tab="${v}">${l} (${counts[v]??'—'})</button>`).join('')}</div><div class="p07-list" id="p07-list" role="tabpanel" aria-labelledby="p07-tab-${s.tab}">${cards()}</div>`;}
 function read(){const s=flow.snapshot(),blocked=s.read&&!flow.canContinue();
  const unavailable=getState().session?.warehouse.active!==true?'Kho tạm dừng':adapter.capabilities().link!==true?'Không có quyền liên kết':adapter.capabilities().read!==true?'Không hỗ trợ NFC':s.dependency?.reason==='nfc-permission-denied'?'Chưa có quyền đọc':'';
  const stateLabel=s.busy?'Đang đọc…':unavailable|| (blocked?'Chưa thể liên kết':s.read?'Đã đọc UID':s.dependency?.reason==='nfc-read-error'?'Chưa đọc được':'Sẵn sàng đọc');
  const guide=s.busy?'Đang đọc thẻ mô phỏng · Vui lòng chờ':unavailable?`${unavailable} · Kiểm tra thông báo`:blocked?'Thẻ chưa thể liên kết · Chọn thẻ khác':s.read?'Đã đọc UID · Tiếp tục để kiểm tra sản phẩm':s.dependency?.reason==='nfc-read-error'?'Chưa đọc được thẻ · Có thể thử đọc lại':'Sẵn sàng đọc · Giữ thẻ ổn định';
  return section('Thông tin sản phẩm',`<div class="p07-product-context"><p class="p07-hint p07-product-hint">${repeatLink?'Đang liên kết tiếp cho sản phẩm bên dưới':'Kiểm tra sản phẩm trước khi đọc thẻ'}</p><button class="p07-inline-action" data-p07="change-product" ${s.busy||s.unknown?'disabled':''}>Đổi sản phẩm</button></div>${productCard(flow.product(),true)}`)+warehouse()+`<div class="p07-touch"><div class="p07-art-frame" aria-hidden="true"><i class="p07-wave"></i><i class="p07-wave"></i><i class="p07-wave"></i><div class="p07-phone"></div></div><strong>Chạm thẻ NFC vào mặt lưng điện thoại</strong><p class="p07-read-guide" aria-live="polite">${esc(guide)}</p></div>`+section('Thông tin thẻ',`<dl class="p07-read-details">${row('Mã thẻ (UID)',s.read?esc(s.read.uid):'Chưa đọc được')}${row('Trạng thái',`<span class="p07-read-state ${s.read&&!blocked&&!unavailable?'read':''}"><i></i><span>${esc(stateLabel)}</span></span>`)}</dl>`);}
 function verify(){const s=flow.snapshot();return section('Thông tin thẻ NFC',`<div class="p07-tag-hero">${tile()}<div><strong>${esc(s.read.uid)}</strong><small>Đã đọc từ thẻ NFC</small></div><span class="p07-chip linked">Hợp lệ</span></div><dl>${row('Mã thẻ (UID)',esc(s.read.uid),'',copy(s.read.uid))}${row('Ngày đọc',esc(s.read.readAt))}</dl>`)+section('Thông tin sản phẩm',productCard(flow.product()))+warehouse()+section('Trạng thái liên kết',`<div class="p07-pending"><i></i><span class="p07-chip unlinked">${s.unknown?'Chưa xác định':s.busy?'Đang xác nhận…':'Chờ xác nhận'}</span></div><p class="p07-hint" aria-live="polite">${s.unknown?'Cần đối chiếu kết quả. Giữ nguyên mã thẻ và yêu cầu, không gửi lại liên kết.':s.busy?'Đang kiểm tra kết quả liên kết. Vui lòng chờ.':'Kiểm tra mã thẻ và sản phẩm bên trên trước khi xác nhận liên kết.'}</p>`);}
 function success(){const r=flow.snapshot().receipt;return `<div class="p07-success"><div class="p07-success-symbol">${icon('check')}</div><h2>Đã liên kết thẻ NFC</h2><p>Bạn có thể xem thông tin thẻ hoặc liên kết thẻ khác để tiếp tục.</p></div><dl class="p07-summary">${row('Mã thẻ (UID)',esc(r.uid),'nfc',copy(r.uid))}${row('Sản phẩm',`${esc(r.product.name)}<small>SKU: ${esc(r.product.sku)}</small>`,'box')}${row('Serial',esc(r.product.serial),'scan')}${row('Kho',esc(r.warehouseName),'pin')}${row('Ngày liên kết',esc(r.linkedAt),'clock')}${row('Người liên kết',`${esc(r.actor.name)}<small>${esc(r.actor.role)}</small>`,'user')}${row('Trạng thái',chip('linked'),'check')}</dl>`;}
 function footer(){const s=flow.snapshot();if(s.panel===1)return '';return `<footer class="p07-footer">${s.panel===2?`<button class="p07-primary" data-p07="next" ${flow.canContinue()?'':'disabled'}>Tiếp tục ${icon('arrow')}</button>`:s.panel===3?`<button class="p07-primary" data-p07="${s.unknown?'reconcile':'confirm'}" ${s.busy||!s.unknown&&(getState().session?.warehouse.active!==true||adapter.capabilities().link!==true)?'disabled':''}>${s.busy?'Đang kiểm tra…':s.unknown?'Kiểm tra kết quả liên kết':'Xác nhận liên kết'} ${icon('arrow')}</button>`:`<button class="p07-primary" data-p07="detail">${icon('document')}<span>Xem thông tin thẻ</span>${icon('arrow')}</button><div class="p07-secondary-actions"><button class="p07-secondary" data-p07="new-link">${icon('plus')}<span>Liên kết thẻ khác</span></button><button class="p07-text-action" data-p07="home">${icon('house')}<span>Về Trang chủ</span></button></div>`}</footer>`;}
 function updateTools(){
  const s=flow.snapshot(),tags=flow.readTags(),scenario=adapter.scenario(),override=['conflict','locked'].includes(scenario);
  review.querySelector('[data-p07-snapshot]').textContent=JSON.stringify({...s,namespace:adapter.namespace,scenario,stats:adapter.stats()},null,2);
  const selector=review.querySelector('[data-p07-read-tag]');
  selector.innerHTML=tags.map(t=>`<option value="${esc(t.uid)}" ${s.selectedUid===t.uid?'selected':''}>${esc(t.uid)} · ${t.status==='unlinked'?'Chưa dùng':'Đã liên kết'}</option>`).join('');
  selector.disabled=s.panel!==2||s.busy||s.unknown||override;
  const selected=tags.find(t=>t.uid===s.selectedUid),remaining=tags.filter(t=>t.status==='unlinked').length;
  review.querySelector('[data-p07-selected-note]').textContent=override?`Kịch bản này sẽ đọc ${scenario==='conflict'?'NFC-OLD-003 (đã gắn sản phẩm khác)':'NFC-LOCK-004 (tạm khóa)'}, thay cho mã đang chọn.`:`Còn ${remaining}/5 thẻ chưa dùng.${selected?.productName?' Mã đang chọn đã gắn: '+selected.productName+'.':''}`;
  const readButton=review.querySelector('[data-p07-demo-read]');readButton.hidden=s.panel!==2;readButton.disabled=s.busy||s.unknown;readButton.textContent=s.busy?'Đang đọc…':s.read?'Đọc lại thẻ mô phỏng':'Đọc thẻ mô phỏng';
  const beginButton=review.querySelector('[data-p07-demo-begin]');beginButton.hidden=![1,4].includes(s.panel);beginButton.disabled=s.busy||s.unknown;beginButton.textContent=s.panel===4?'Liên kết thẻ khác':'Bắt đầu liên kết';
  review.querySelector('[data-p07-scenario]').disabled=s.busy||s.unknown;
  review.querySelector('[data-p07-guide]').textContent=s.unknown?'Chưa rõ kết quả: bấm “Kiểm tra kết quả liên kết” trong app. Không đổi mã hoặc gửi lại.':s.panel===1?'1. Bấm “Quét hoặc liên kết thẻ NFC” để bắt đầu.':s.panel===2?s.read&&!flow.canContinue()?'Thẻ này chưa thể tiếp tục. Xem thông báo trong app, chọn mã chưa liên kết hoặc sửa kịch bản rồi đọc lại.':s.read?'Đã đọc UID. Bấm “Tiếp tục” trong app để kiểm tra trước khi lưu.':'1. Kiểm tra sản phẩm trong app. 2. Chọn mã thẻ bên dưới và bấm “Đọc thẻ mô phỏng”.':s.panel===3?'3. Kiểm tra UID và sản phẩm, rồi bấm “Xác nhận liên kết” trong app.':'Đã lưu liên kết demo. Bấm “Liên kết thẻ khác” để thử tiếp; sản phẩm được giữ, thẻ chưa dùng được chọn sẵn.';
 }
 function beginNext(){const previous=location.hash;repeatLink=!!flow.snapshot().receipt;if(flow.snapshot().receipt)adapter.setScenario('ready');review.querySelector('[data-p07-scenario]').value=adapter.scenario();flow.begin();saveRoute(previous);}

 function notify(message){
  const s=flow.snapshot();if(!message||!active||disposed)return;
  if(['nfc-permission-denied','nfc-read-error','nfc-unsupported'].includes(s.dependency?.reason)&&onSystem({kind:'device'}))return;
  const mapping=s.read?adapter.mapping(flow.scope(),s.read.uid):null;
  let action=s.unknown?{cancelLabel:'Để sau',confirmLabel:'Kiểm tra kết quả',onConfirm:reconcile}:{};
  if(!s.unknown&&!s.busy&&s.dependency?.reason==='nfc-read-error')action={cancelLabel:'Để sau',confirmLabel:'Đọc lại',onConfirm:()=>flow.read()};
  else if(!s.unknown&&!s.busy&&['linked','locked'].includes(mapping?.status))action={cancelLabel:'Đóng',confirmLabel:'Chọn thẻ khác',onConfirm:chooseAnotherTag};
  else if(!s.unknown&&!s.busy&&s.settledFailure&&s.panel===3&&adapter.scenario()==='failed')action={cancelLabel:'Để sau',confirmLabel:'Thử liên kết lại',onConfirm:confirmLink};
  feedback.show({title:s.unknown?'Chưa xác định kết quả liên kết':s.dependency?.reason==='nfc-read-error'?'Chưa đọc được thẻ':'Thông báo NFC',message,tone:s.unknown?'warning':'neutral',...action});
 }
 function chooseAnotherTag(){
  const s=flow.snapshot();if(s.busy||s.unknown)return;
  const previous=location.hash;if(!flow.panel(2))return;
  const next=flow.readTags().find(t=>t.status==='unlinked'&&t.uid!==s.read?.uid);
  if(next)flow.selectReadTag(next.uid);saveRoute(previous);
  // Fixture scenario remains explicit: never silently change a failure into success.
  const target=review.querySelector(['conflict','locked'].includes(adapter.scenario())?'[data-p07-scenario]':'[data-p07-read-tag]');
  target.closest('details')?.setAttribute('open','');target.focus();
 }
 async function confirmLink(){const previous=location.hash;await flow.confirm();saveRoute(previous);}
 async function reconcile(){const previous=location.hash;await flow.reconcile();saveRoute(previous);}
 function render({focus=true,notifyMessage=false}={}){
  if(!active||disposed)return;detailModal?.close({restoreFocus:false});const s=flow.snapshot();
  if(s.panel!==1&&s.dependency?.panel==='P17.S03'){screen.classList.add('p07-wizard');renderScanException({root,owner:'p07',state:s,tag:flow.detail(s.dependency.tagId),onSize});lastPanel=s.panel;updateTools();return;}
  const oldScroll=root.querySelector('.p07-scroll')?.scrollTop||0,oldFocus=document.activeElement?.dataset.p07;
  const same=lastPanel===s.panel;
  screen.classList.toggle('p07-wizard',s.panel!==1);
  root.innerHTML=`<section class="p07-app" data-panel="P07.S0${s.panel}" aria-busy="${s.busy}"><header class="p07-header">${s.panel===1?'':`<button data-p07="back" aria-label="Quay lại" ${s.busy?'disabled':''}>${icon('back')}</button>`}<h1 tabindex="-1">${titles[s.panel]}</h1>${s.panel===1?`<button data-p07="begin" aria-label="Thêm liên kết NFC">${icon('plus')}</button>`:s.panel<4?`<span>Bước ${s.panel-1}/3</span>`:''}</header><div class="p07-body"><div class="p07-scroll" tabindex="0" role="region" aria-label="Nội dung màn hình">${s.panel===1?list():s.panel===2?read():s.panel===3?verify():success()}</div>${footer()}</div></section>`;
  lastPanel=s.panel;document.title=`P07 · ${titles[s.panel]} · Prototype`;
  root.querySelector('.p07-scroll').scrollTop=s.panel===1?listTop:same?oldScroll:0;
  if(focus){const target=same&&oldFocus?root.querySelector(`[data-p07="${oldFocus}"]`):null;(target&&!target.disabled?target:root.querySelector('h1')).focus({preventScroll:true});}
  updateTools();onSize();
  if(notifyMessage)queueMicrotask(()=>{if(active&&flow.snapshot().message===s.message)notify(s.message);});
 }
 function showDetail(id){
  const tag=flow.detail(id);if(!tag)return;
  detailModal?.close({restoreFocus:false});
  const dialog=document.createElement('dialog');dialog.className='p07-dialog';dialog.setAttribute('aria-labelledby','p07-detail-title');
  dialog.innerHTML=`<h2 class="app-modal-heading" id="p07-detail-title"><button class="p07-dialog-back" data-p07="close-detail" aria-label="Quay lại danh sách thẻ">${icon('back')}</button><span>Thông tin thẻ ${esc(tag.label)}</span></h2><div class="app-modal-body" tabindex="0" role="region" aria-label="Chi tiết thẻ NFC"><dl>${row('Mã thẻ (UID)',esc(tag.uid),'',copy(tag.uid))}${row('Trạng thái',chip(tag.status))}${row('Sản phẩm',esc(tag.product?.name))}${row('SKU',esc(tag.product?.sku))}${row('Serial',esc(tag.product?.serial))}${row(tag.status==='unlinked'?'Ngày tạo':'Cập nhật',esc(tag.date))}</dl><p class="p07-hint">Thông tin hiện tại của thẻ. Chưa có nguồn dữ liệu lịch sử thao tác.</p></div><footer class="app-modal-footer"><button class="p07-secondary" data-p07="close-detail">Đóng</button></footer>`;
  detailTagId=id;detailTrigger=document.activeElement;detailRoute.begin();
  detailModal=openAppModal({screen,parent:root.querySelector('.p07-app'),dialog,tools,dismissOnBackdrop:false,initialFocus:'[data-p07="close-detail"]',onClose:()=>{detailModal=null;detailTagId=null;detailRoute.closed();}});
 }
 async function onClick(e){
  if(!active)return;const b=e.target.closest('button');if(!b||b.disabled||!root.contains(b))return;
  if(b.dataset.p07Tag){showDetail(b.dataset.p07Tag);return;}
  if(b.dataset.p07Tab){listTop=0;flow.tab(b.dataset.p07Tab);root.querySelector(`[data-p07-tab="${b.dataset.p07Tab}"]`)?.focus({preventScroll:true});return;}
  const a=b.dataset.p07,s=flow.snapshot();
  if(a==='exception-detail'){const id=flow.snapshot().dependency?.tagId;if(id)showDetail(id);return;}
  if(a==='exception-cancel'){if(flow.dismissException()){history.replaceState(history.state,'',hashFor(2));root.querySelector('h1')?.focus({preventScroll:true});}return;}
  if(a==='begin'||a==='new-link')beginNext();
  if(a==='back'){if(s.panel===1){onHome();return;}const parent=s.panel===4?1:s.panel-1;if(history.state?.p07From===hashFor(parent))history.back();else if(flow.panel(parent))history.replaceState(null,'',hashFor(parent));}
  if(['product','change-product'].includes(a)&&!s.busy&&!s.unknown)onChooseProduct({itemId:s.itemId});
  if(a==='next'){const previous=location.hash;if(flow.next())saveRoute(previous);}
  if(a==='confirm')await confirmLink();
  if(a==='reconcile')await reconcile();
  if(a==='home')onHome();
  if(a==='clear-query'||a==='clear-filters'){composing=false;listTop=0;if(a==='clear-filters')flow.resetFilters();else flow.search('');root.querySelector('#p07-search')?.focus({preventScroll:true});}
  if(a==='filter')flow.message('Bộ lọc nâng cao chưa có tiêu chí được duyệt. Có thể tìm UID, sản phẩm, serial hoặc dùng ba tab trạng thái.');
  if(a==='detail')showDetail(s.receipt.tagId);
  if(a==='close-detail')detailModal?.close();
  if(a==='copy'){
   if(copying)return;copying=true;b.disabled=true;
   const detailId=detailTagId,returnFocus=detailTrigger,panel=s.panel;let message,success=false;
   try{await navigator.clipboard.writeText(b.dataset.uid);message='Đã sao chép mã thẻ NFC.';success=true;}
   catch{message=`Không thể sao chép tự động. Mã thẻ NFC: ${b.dataset.uid}`;}
   finally{copying=false;if(b.isConnected)b.disabled=false;}
   if(!active||disposed||!b.isConnected)return;
   if(success){
    b.dataset.copied='true';b.querySelector('svg').innerHTML=icons.check;b.setAttribute('aria-label','Đã sao chép mã thẻ');b.querySelector('.p07-copy-note').textContent='Đã sao chép';
    if(b._copyTimer){clearTimeout(b._copyTimer);copyTimers.delete(b._copyTimer);}
    const timer=setTimeout(()=>{copyTimers.delete(timer);if(b.isConnected){delete b.dataset.copied;b.querySelector('svg').innerHTML=icons.copy;b.setAttribute('aria-label',`Sao chép mã thẻ ${b.dataset.uid}`);b.querySelector('.p07-copy-note').textContent='';}},2200);b._copyTimer=timer;copyTimers.add(timer);return;
   }
   if(detailId){detailModal?.close({restoreFocus:false});await detailRoute.ready();}
   if(!active||disposed||flow.snapshot().panel!==panel)return;
   feedback.show({title:success?'Đã sao chép mã thẻ':'Không thể sao chép',message,tone:success?'success':'error',symbol:success?icon('check'):'',onClose:detailId?()=>{if(flow.snapshot().panel===panel){if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});showDetail(detailId);}}:undefined});
  }
 }
 function onInput(e){if(!active||e.target.id!=='p07-search'||composing||e.isComposing)return;const input=e.target,at=input.selectionStart;listTop=0;flow.search(input.value);const next=root.querySelector('#p07-search');next.focus({preventScroll:true});next.setSelectionRange(at,at);}
 function onKey(e){const tab=e.target.closest('[data-p07-tab]');if(active&&tab&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const all=['all','linked','unlinked'],i=all.indexOf(tab.dataset.p07Tab),next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;root.querySelector(`[data-p07-tab="${all[next]}"]`).click();}}
 const onCompositionStart=e=>{if(e.target.id==='p07-search')composing=true;};
 const onCompositionEnd=e=>{if(e.target.id==='p07-search'){composing=false;onInput(e);}};
 const onScroll=e=>{if(active&&flow.snapshot().panel===1&&e.target.matches?.('.p07-scroll'))listTop=e.target.scrollTop;};
 const onDetailNavigation=e=>{if(disposed||!active&&!detailRoute.isClosing())return;if(detailRoute.navigation(()=>detailModal?.close(),()=>!!detailModal))e.stopImmediatePropagation();};
 window.addEventListener('popstate',onDetailNavigation,true);window.addEventListener('hashchange',onDetailNavigation,true);
 root.addEventListener('click',onClick);root.addEventListener('input',onInput);root.addEventListener('compositionstart',onCompositionStart);root.addEventListener('compositionend',onCompositionEnd);root.addEventListener('keydown',onKey);root.addEventListener('scroll',onScroll,true);
 review.querySelector('[data-p07-demo-read]').addEventListener('click',()=>void flow.read());
 review.querySelector('[data-p07-demo-begin]').addEventListener('click',beginNext);
 review.querySelector('[data-p07-read-tag]').addEventListener('change',e=>{flow.selectReadTag(e.target.value);review.querySelector('[data-p07-read-tag]').focus({preventScroll:true});});
 review.querySelector('[data-p07-scenario]').addEventListener('change',e=>{const s=flow.snapshot();if(s.busy||s.unknown)return;adapter.setScenario(e.target.value);flow.scenarioChanged();review.querySelector('[data-p07-scenario]').focus({preventScroll:true});});
 return {
  show(context={}){detailModal?.close({restoreFocus:false});active=true;review.hidden=false;lastPanel=null;if(context.selectedNfcProduct)flow.select(context.selectedNfcProduct);else if(!context.restoreNfc){const panel=Number(new URLSearchParams(location.hash.split('?')[1]).get('panel')||1);if(!flow.panel(panel))flow.panel(1);}history.replaceState(history.state,'',hashFor(flow.snapshot().panel));render();},
  hide(){for(const timer of copyTimers)clearTimeout(timer);copyTimers.clear();composing=false;if(active&&flow.snapshot().panel===1)listTop=root.querySelector('.p07-scroll')?.scrollTop||0;active=false;feedback.clear();detailModal?.close({restoreFocus:false});review.hidden=true;},
  dispose(){for(const timer of copyTimers)clearTimeout(timer);copyTimers.clear();disposed=true;feedback.dispose();detailRoute.dispose();detailModal?.close({restoreFocus:false});flow.dispose();review.remove();window.removeEventListener('popstate',onDetailNavigation,true);window.removeEventListener('hashchange',onDetailNavigation,true);root.removeEventListener('click',onClick);root.removeEventListener('input',onInput);root.removeEventListener('compositionstart',onCompositionStart);root.removeEventListener('compositionend',onCompositionEnd);root.removeEventListener('keydown',onKey);root.removeEventListener('scroll',onScroll,true);},
 };
}
