import {scopedDocuments,waitingDocuments,canReadPreview,scopeKey,NOTIFICATION_PAGE_SIZE} from './notification-model.mjs';
import {createNotificationPages} from './notification-pages.mjs';
import {TYPES,STATUSES,totals} from '../documents/document-model.mjs';
import {DIALOG_ICONS} from '../scanner-dialogs/icons.mjs';
import {INBOUND_ICONS} from '../inbound/icons.mjs';
import {createActionFeedback} from '../shared/action-feedback.mjs';
import {WAITING_WEB} from '../shared/waiting-web.mjs';
const esc=v=>String(v??'Chưa có dữ liệu').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const glyphs={...DIALOG_ICONS,...INBOUND_ICONS};
const icon=n=>`<svg class="p13-icon" viewBox="0 0 24 24" aria-hidden="true">${glyphs[n]||glyphs.document}</svg>`;
const tile=t=>`<span class="hn-operation-icon" data-hn-operation="${esc(t)}" data-size="md" aria-hidden="true">${icon({inbound:'down',outbound:'up',warranty:'tool',nfc:'nfc'}[t]||'document')}</span>`;
const date=d=>d?d.split('-').reverse().join('/'):'Chưa có dữ liệu';
const btn=(action,label,cls='p13-link',attrs='')=>`<button type="button" class="${cls}" data-p13="${action}" ${attrs}>${label}</button>`;
const badge=r=>`<span class="p13-status" data-status="${esc(r.status)}">${esc(STATUSES[r.status]||r.status)}</span>`;
const readable=(text,label,lines=3)=>`<p data-hn-readable="${esc(label)}" data-hn-lines="${lines}">${esc(text)}</p>`;
const empty=(title,copy)=>`<div class="p13-empty">${tile('documents')}<h2>${esc(title)}</h2><p>${esc(copy)}</p></div>`;

export function mountNotifications({root,screen,tools,getState,store,getDocuments,onHome,onSize,onDocument,onUnread}){
 let active=false,disposed=false,panel=1,eventId=null,docId=null,filter='unread',type='all',scenario='ready',renderedHash='',epoch=0;
 const positions=new Map(),pages=createNotificationPages({source:store});
 const feedback=createActionFeedback({getScreen:()=>screen,tools,isActive:()=>active&&!disposed,key:'hnNotificationsFeedback'});
 // The AppShell already owns shared/readable-text for this root. Use markers only.
 const review=document.createElement('section');review.className='p13-tools';review.hidden=true;
 review.innerHTML='<details><summary>P13 · Thông báo / Theo dõi Web · r03</summary><p>Nguồn thông báo B13 đã chuyển copy theo HANDOFF, lưu trong bộ nhớ riêng từng phiên preview. Danh sách chờ đọc chung dữ liệu P12. Không kết nối notifications/WMS, không gửi push, không ghi sổ. Reload đặt lại dữ liệu. API/quyền đọc/mark-read và URL Web production chưa được cung cấp.</p><label>Kịch bản kiểm tra <select id="p13-scenario"><option value="ready">Sẵn sàng</option><option value="loading">Đang tải</option><option value="empty">Rỗng</option><option value="error">Lỗi tải</option><option value="read-error">Lỗi đánh dấu đã đọc</option><option value="page-error">Lỗi tải trang tiếp theo</option></select></label><label>Dữ liệu phân trang <select id="p13-dataset"><option value="baseline">5 thông báo ban đầu</option><option value="extended">37 thông báo kiểm thử</option></select></label><output id="p13-page-calls">0 lượt tải trang</output></details>';
 tools.append(review);
 const rows=()=>scopedDocuments(getState(),getDocuments());
 const documentById=id=>rows().find(r=>r.id===id);
 const eventById=id=>store.read(id);
 const key=()=>panel===1?'list:'+filter:panel===3?'waiting:'+type:`${panel}:${eventId||docId}`;
 function remember(){if(active)positions.set(key(),root.querySelector('.p13-scroll')?.scrollTop||0);}
 function navigate(next,params={}){if(!active||screen.querySelector('.app-modal-host'))return;remember();history.pushState({p13:true},'',`#p02/notifications?${new URLSearchParams({panel:next,...params})}`);show();}
 function info(title,message){feedback.show({title,message,confirmLabel:'Đóng'});}
 function metadata(r,notification=false){return `<dl class="p13-metadata">${[
 ['user','Người tạo',r.actor],['document','Loại chứng từ',notification?(documentById(r.documentId)?TYPES[documentById(r.documentId).type]:'Thông báo '+(r.type==='nfc'?'thiết bị':'kho')):TYPES[r.type]],
 ...(notification&&r.documentId?[['document','Số chứng từ',documentById(r.documentId)?.number]]:[]),['warehouse','Kho',r.warehouse],['calendar',notification?'Thời gian thông báo':'Ngày tạo',date(r.day)+' · '+(r.time||'—')]
 ].map(([i,label,value])=>`<div>${icon(i)}<dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;}
 function filters(){return `<div class="p13-filters" aria-label="Lọc thông báo">${[['unread',`Chưa đọc (${store.unread()??'—'})`],['all','Tất cả']].map(([k,label])=>`<button type="button" data-p13-filter="${k}" aria-pressed="${filter===k}">${label}</button>`).join('')}</div>`;}
 function sourceState(){if(scenario==='loading')return '<div class="p13-empty" role="status"><h2>Đang tải dữ liệu…</h2><p>Vui lòng chờ trong giây lát.</p></div>';if(scenario==='error')return empty('Chưa tải được dữ liệu','Bộ lọc và các thông báo đã có vẫn được giữ. Vui lòng thử lại.')+btn('retry','Thử lại','p13-primary');return '';}
 function notificationRow(r){return `<article class="p13-notification" data-hn-readable-group data-read="${r.read}"><button type="button" class="p13-notification-open" data-p13-event="${esc(r.id)}">${!r.read?'<span class="p13-dot" aria-label="Chưa đọc"></span>':''}${tile(r.type)}<span class="p13-notification-copy"><strong>${esc(r.title)}</strong><time>${date(r.day)} · ${esc(r.time)}</time><span class="p13-excerpt" data-hn-readable="Nội dung thông báo" data-hn-lines="3" data-hn-read-outside="true">${esc(r.description)}</span>${r.documentId&&documentById(r.documentId)?badge(documentById(r.documentId)):''}</span></button></article>`;}
 function pageControls(){
  if(['loading','empty','error'].includes(scenario))return '';
  const p=pages.snapshot(filter);if(!p.loaded)return '';
  const remaining=p.total===null?NOTIFICATION_PAGE_SIZE:Math.max(0,p.total-p.items.length);
  return `<div class="p13-page-control" aria-label="Tải thêm thông báo"><p role="status" aria-live="polite">Đang hiển thị ${p.items.length}${p.total===null?'':' / '+p.total} thông báo</p>${p.hasMore?btn('more',p.busy?'Đang tải…':p.error?'Thử tải thêm':`Xem thêm ${Math.min(NOTIFICATION_PAGE_SIZE,remaining)||NOTIFICATION_PAGE_SIZE} thông báo`,'p13-load-more',`aria-controls="p13-records" aria-busy="${p.busy}" ${p.busy?'disabled':''}`):p.items.length?'<span class="p13-list-end">Đã xem hết thông báo'+(filter==='unread'?' chưa đọc':'')+'</span>':''}</div>`;
 }
 function list(){const p=pages.snapshot(filter),items=scenario==='empty'?[]:p.items;
  const state=sourceState()||(!p.loaded&&p.error?empty('Chưa tải được thông báo','Vui lòng thử lại.')+btn('load-first','Thử lại','p13-primary'):!p.loaded?'<div class="p13-empty" role="status"><h2>Đang tải thông báo…</h2></div>':'');
  return `<div class="p13-records" id="p13-records" data-p13-loaded="${p.loaded}" aria-busy="${p.busy}">${state||(items.length?items.map(notificationRow).join(''):p.hasMore?empty('Đã đọc các thông báo đã tải','Bấm Xem thêm để tiếp tục xem thông báo chưa đọc.'):empty('Không có thông báo'+(filter==='unread'?' chưa đọc':''),'Các thông báo phù hợp sẽ xuất hiện tại đây.'))}</div>${pageControls()}`;
 }
 function updatePageControls(){const scroller=root.querySelector('.p13-scroll');if(!scroller)return;scroller.querySelector('.p13-page-control')?.remove();scroller.insertAdjacentHTML('beforeend',pageControls());scroller.querySelector('.p13-records')?.setAttribute('aria-busy',String(pages.snapshot(filter).busy));}
 async function loadPage(){
  if(!active||panel!==1||!canReadPreview(getState()))return;
  const selected=filter,before=pages.snapshot(selected);if(before.busy||before.loaded&&!before.hasMore)return;
  const scope=store.scope(),focusMore=['more','load-first'].includes(document.activeElement?.dataset.p13);
  const request=pages.load(selected,{fail:scenario==='page-error'&&before.loaded});if(!before.loaded)root.querySelector('.p13-records').innerHTML='<div class="p13-empty" role="status"><h2>Đang tải thông báo…</h2></div>';updatePageControls();
  const result=await request;review.querySelector('#p13-page-calls').textContent=store.metrics().pageCalls+' lượt tải trang';
  if(!active||disposed||panel!==1||filter!==selected||store.scope()!==scope)return;
  if(result.kind==='page'){
   const scroller=root.querySelector('.p13-scroll'),top=scroller.scrollTop,recordList=scroller.querySelector('.p13-records'),known=new Set([...recordList.querySelectorAll('[data-p13-event]')].map(e=>e.dataset.p13Event));
   const added=pages.snapshot(selected).items.filter(r=>!known.has(r.id));
   if(!before.loaded){scroller.innerHTML=list();}else{if(!known.size)recordList.replaceChildren();recordList.insertAdjacentHTML('beforeend',added.map(notificationRow).join(''));recordList.dataset.p13Loaded='true';updatePageControls();}
   scroller.scrollTop=top;
   if(focusMore){const target=added.length?root.querySelector(`[data-p13-event="${CSS.escape(added[0].id)}"]`):root.querySelector('[data-p13=more]');target?.focus({preventScroll:true});}
  }else if(result.kind!=='stale'&&result.kind!=='end'){
   if(!before.loaded){root.querySelector('.p13-records').innerHTML=empty('Chưa tải được thông báo','Vui lòng thử lại.')+btn('load-first','Thử lại','p13-primary');}
   updatePageControls();root.querySelector('[data-p13=more],[data-p13=load-first]')?.focus({preventScroll:true});
   info('Chưa tải được thông báo',before.loaded?'Danh sách đã tải và vị trí đọc vẫn được giữ. Đóng thông báo này rồi chọn Thử tải thêm để tải lại cùng trang.':'Chưa tải được trang đầu. Đóng thông báo này rồi chọn Thử lại.');
  }
 }

 function notification(){const r=eventById(eventId);if(!r)return empty('Không tìm thấy thông báo','Thông báo không thuộc nguồn được cấp cho phiên hiện tại.');const d=documentById(r.documentId);return `<article class="p13-detail-card"><div class="p13-summary">${tile(r.type)}<div><h2>${esc(r.title)}</h2>${d?badge(d):''}<time>${date(r.day)} · ${esc(r.time)}</time></div></div>${metadata(r,true)}<section class="p13-narrative"><h2>Nội dung thông báo</h2>${readable(r.description,'Nội dung thông báo')}</section>${!r.read?btn('mark-read','Đánh dấu đã đọc','p13-link'):''}</article>`;}
 function counts(r){const total=totals(r.lines);return `<div class="p13-counts"><span>${icon('box')}<span><strong>${total.quantity??'—'}</strong><small>sản phẩm · ${total.skuCount??'—'} SKU</small></span></span><span>${icon('user')}<span>${esc(r.actor)}<small>Người tạo</small></span></span><span>${icon('calendar')}<span>${date(r.day)}<small>${esc(r.time||'—')}</small></span></span></div>`;}
 function waiting(){const all=waitingDocuments(getState(),getDocuments()),items=scenario==='empty'?[]:all.filter(r=>type==='all'||r.type===type);return `<aside class="p13-banner">${icon('document')}<div><strong>Xử lý chứng từ trên Web</strong><p>Theo dõi phiếu đã gửi tại Kho Hoa Nam. Việc xử lý và ghi sổ được thực hiện trên Web.</p></div></aside><div class="p13-filters" aria-label="Loại phiếu chờ">${[['all','Tất cả'],['inbound','Phiếu nhập'],['outbound','Phiếu xuất']].map(([k,label])=>`<button type="button" data-p13-type="${k}" aria-pressed="${type===k}">${label} (${all.filter(r=>k==='all'||r.type===k).length})</button>`).join('')}</div><div class="p13-records">${sourceState()||(items.length?items.map(r=>`<button type="button" class="p13-waiting-record" data-p13-doc="${esc(r.id)}"><span class="p13-summary">${tile(r.type)}<span><strong>${esc(r.number)}</strong><small>Phiếu ${r.type==='inbound'?'nhập':'xuất'} kho</small></span>${badge(r)}${icon('chevron')}</span>${counts(r)}</button>`).join(''):empty('Không có phiếu chờ xử lý','Chưa có phiếu nhập/xuất phù hợp trong nguồn được cấp.'))}</div>`;}
 function waitingDetail(){const r=documentById(docId);if(!r||!['inbound','outbound'].includes(r.type))return empty('Không tìm thấy chứng từ','Chứng từ không thuộc nguồn được cấp cho phiên hiện tại.');const total=totals(r.lines);return `<article class="p13-document-card"><div class="p13-summary">${tile(r.type)}<div><h2>${esc(r.number)}</h2><p>Phiếu ${r.type==='inbound'?'nhập':'xuất'} kho</p></div>${badge(r)}</div>${counts(r)}</article><section class="p13-card"><div class="p13-warehouse">${tile('documents')}<div><small>Kho</small><strong>${esc(r.warehouse)}</strong></div></div><p class="p13-muted">Kho được xác định theo chứng từ và phạm vi truy cập của phiên.</p></section><aside class="p13-banner"><div><strong>${r.status==='waiting'?WAITING_WEB.status:'Trạng thái chứng từ đã cập nhật'}</strong><p>${r.status==='waiting'?WAITING_WEB.description:'Mở chứng từ để xem trạng thái hiện tại. App không thực hiện duyệt hoặc ghi sổ phiếu nhập/xuất.'}</p></div></aside><section class="p13-card"><div class="p13-section-heading"><h2>Danh sách hàng hóa (${total.skuCount??'—'} SKU)</h2>${btn('products',icon('chevron'),'p13-icon-button','aria-label="Xem đầy đủ sản phẩm"')}</div>${r.lines?.length?`<table class="p13-lines"><thead><tr><th>SKU</th><th>Số lượng</th><th>Đơn vị</th></tr></thead><tbody>${r.lines.map(l=>`<tr><td>${esc(l.sku)}</td><td>${l.quantity??'—'}</td><td>${esc(l.unit)}</td></tr>`).join('')}</tbody></table>`:'<p>Chưa có dữ liệu sản phẩm.</p>'}</section>${r.note?`<section class="p13-card"><h2>Ghi chú</h2>${readable(r.note,'Ghi chú · '+r.number,2)}</section>`:''}`;}
 function render(focus=false){if(!active||disposed)return;screen.classList.toggle('p13-detail-screen',[2,4].includes(panel));screen.classList.toggle('p13-inbox-screen',[1,2].includes(panel));const allowed=canReadPreview(getState());const r=panel===2?eventById(eventId):null,d=documentById(panel===2?r?.documentId:docId);const titles=['','Thông báo','Chi tiết thông báo','Chờ xử lý trên Web','Chi tiết chờ xử lý Web'];
 root.innerHTML=`<section class="p13-app" data-panel="P13.S0${panel}"><header class="p13-header">${btn('back',icon('back'),'p13-back','aria-label="Quay lại"')}<h1 tabindex="-1">${titles[panel]}</h1></header><div class="p13-body">${allowed&&panel===1?`<div class="p13-filter-dock">${filters()}</div>`:''}<div class="p13-scroll" tabindex="0" aria-label="Nội dung ${titles[panel]}">${!allowed?empty('Chưa xác minh quyền xem','Chưa có nguồn dữ liệu được cấp cho tài khoản và kho trong phiên này.'):panel===1?list():panel===2?notification():panel===3?waiting():waitingDetail()}</div>${allowed&&[2,4].includes(panel)&&d?`<footer class="p13-actions">${d?btn('document',icon('document')+' Xem chứng từ','p13-primary'):''}${panel===2&&d?.status==='waiting'&&['inbound','outbound'].includes(d.type)?btn('waiting','Các phiếu chờ Web','p13-context-link'):''}${panel===4?btn('web','Hướng dẫn xử lý trên Web','p13-secondary'):''}</footer>`:''}</div></section>`;
 root.querySelector('.p13-scroll').scrollTop=positions.get(key())||0;renderedHash=location.hash;document.title='P13 · '+titles[panel];if(focus)root.querySelector('h1')?.focus({preventScroll:true});onSize();}
 async function markRead(id){const r=eventById(id);if(!r||r.read||!canReadPreview(getState()))return;const requestEpoch=epoch,scope=scopeKey(getState());const trigger=root.querySelector('[data-p13=mark-read]');if(trigger){trigger.disabled=true;trigger.setAttribute('aria-busy','true');}const result=await store.markRead(id,{fail:scenario==='read-error'});if(disposed||scopeKey(getState())!==scope)return;if(result.kind==='verified'){pages.markRead(id);onUnread();if(active&&panel===1){remember();const focused=document.activeElement,filterKey=focused?.dataset.p13Filter,eventKey=focused?.dataset.p13Event;render();if(filterKey)root.querySelector(`[data-p13-filter="${CSS.escape(filterKey)}"]`)?.focus({preventScroll:true});else if(eventKey)(root.querySelector(`[data-p13-event="${CSS.escape(eventKey)}"]`)||root.querySelector('h1'))?.focus({preventScroll:true});return;}}if(!active||epoch!==requestEpoch||eventId!==id)return;if(trigger?.isConnected){trigger.disabled=false;trigger.removeAttribute('aria-busy');}if(result.kind==='verified'){if(trigger===document.activeElement)root.querySelector('h1')?.focus({preventScroll:true});trigger?.remove();}else if(result.kind!=='stale')info('Chưa đánh dấu đã đọc','Thông báo vẫn được giữ là chưa đọc. Bạn có thể đọc nội dung và thử đánh dấu lại.');}
 function show(){if(disposed)return;if(active&&location.hash===renderedHash&&root.querySelector('.p13-app'))return;remember();active=true;review.hidden=false;const q=new URLSearchParams(location.hash.split('?')[1]);panel=[1,2,3,4].includes(Number(q.get('panel')))?Number(q.get('panel')):1;eventId=q.get('event');docId=q.get('doc');epoch++;render(true);if(panel===2)void markRead(eventId);if(panel===1&&!pages.snapshot(filter).loaded&&!pages.snapshot(filter).busy&&!pages.snapshot(filter).error)void loadPage();}
 function click(e){if(!active||disposed||!root.contains(e.target)||screen.querySelector('.app-modal-host'))return;const b=e.target.closest('button');if(!b)return;const a=b.dataset.p13;if(a==='back'){remember();if(history.state?.p13)history.back();else if(panel===1)onHome();else navigate(panel===4?3:1);return;}if(!canReadPreview(getState()))return;
 if(b.dataset.p13Filter){remember();filter=b.dataset.p13Filter;render();root.querySelector(`[data-p13-filter="${filter}"]`)?.focus();if(!pages.snapshot(filter).loaded&&!pages.snapshot(filter).busy)void loadPage();}
 if(b.dataset.p13Type){remember();type=b.dataset.p13Type;render();root.querySelector(`[data-p13-type="${type}"]`)?.focus();}
 if(b.dataset.p13Event)navigate(2,{event:b.dataset.p13Event});
 if(b.dataset.p13Doc)navigate(4,{doc:b.dataset.p13Doc});
 if(a==='waiting')navigate(3);
 if(a==='more'||a==='load-first')void loadPage();
 if(a==='retry'){scenario='ready';review.querySelector('select').value='ready';render();}
 if(a==='mark-read')void markRead(eventId);
 if(a==='web')info('Xử lý chứng từ trên Web','Mở hệ thống Web được đơn vị cấp và tìm chứng từ '+(documentById(docId)?.number||'đang xem')+'. Kiểm tra trạng thái, nội dung và quyền xử lý tại đó. Chưa có URL Web được cấu hình để mở từ App.');
 if(a==='document'||a==='products'){const id=panel===2?eventById(eventId)?.documentId:docId;if(!documentById(id))return info('Chưa thể mở chứng từ','Chứng từ không thuộc nguồn được cấp trong phiên hiện tại.');remember();onDocument(id,a==='products'?'products':'info');}
 }
 root.addEventListener('click',click);review.querySelector('#p13-scenario').onchange=e=>{scenario=e.target.value;remember();render();};
 review.querySelector('#p13-dataset').onchange=e=>{store.useReviewDataset(e.target.value);pages.reset();positions.clear();onUnread();if(panel===1){render();void loadPage();}else navigate(1);};
 return {show,hide(){if(!active)return;remember();active=false;epoch++;review.hidden=true;feedback.clear();screen.classList.remove('p13-detail-screen','p13-inbox-screen');},dispose(){disposed=true;active=false;epoch++;pages.dispose();feedback.dispose();review.remove();root.removeEventListener('click',click);}};
}
