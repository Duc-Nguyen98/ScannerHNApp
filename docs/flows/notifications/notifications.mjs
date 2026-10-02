import {mountNotificationMotion} from './motion.mjs';
import {clearFilterButton} from '../shared/list-actions.mjs';
import {scopedDocuments,waitingDocuments,canReadPreview,scopeKey,NOTIFICATION_PAGE_SIZE} from './notification-model.mjs';
import {notificationCount,notificationPageSummary} from './notification-count.mjs';
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

export function mountNotifications({root,screen,tools,getState,store,getDocuments,onHome,onSize,onDocument,onUnread,motionMode='auto',onPanelTransition=()=>{}}){
 let active=false,disposed=false,panel=1,eventId=null,docId=null,filter='unread',type='all',scenario='ready',renderedHash='',epoch=0;
 const expandedMetadata=new Map(),returnFocus=new Map();
 let filterMotion=null;
 const motion=mountNotificationMotion({root,requested:motionMode,active:()=>active&&!disposed&&canReadPreview(getState())&&!obscured()});
 const routeKey=()=>panel===1?'notifications:list':panel===3?'notifications:waiting':panel===2?'notifications:event:'+eventId:'notifications:document:'+docId;
 function filterSettled(){if(filterMotion!==filter||panel!==1||!pages.snapshot(filter).loaded||syntheticState())return;filterMotion=null;motion.list(root.querySelector('.p13-records'));}
 let pendingReadSync=false,pendingPageSync=false;
 const positions=new Map(),pages=createNotificationPages({source:store});
 const feedback=createActionFeedback({getScreen:()=>screen,tools,isActive:()=>active&&!disposed,key:'hnNotificationsFeedback'});
 // The AppShell already owns shared/readable-text for this root. Use markers only.
 const review=document.createElement('section');review.className='p13-tools';review.hidden=true;
 review.innerHTML='<details><summary>P13 · Thông báo / Theo dõi Web · r07</summary><p>Nguồn thông báo B13 đã chuyển copy theo HANDOFF, lưu trong bộ nhớ riêng từng phiên preview. Danh sách chờ đọc chung dữ liệu P12. Không kết nối notifications/WMS, không gửi push, không ghi sổ. Reload đặt lại dữ liệu. API/quyền đọc/mark-read và URL Web production chưa được cung cấp.</p><label>Kịch bản kiểm tra <select id="p13-scenario"><option value="ready">Sẵn sàng</option><option value="loading">Đang tải</option><option value="empty">Rỗng</option><option value="error">Lỗi tải</option><option value="read-error">Lỗi đánh dấu đã đọc</option><option value="page-error">Lỗi tải trang tiếp theo</option></select></label><label>Dữ liệu phân trang <select id="p13-dataset"><option value="baseline">5 thông báo ban đầu</option><option value="extended">37 thông báo kiểm thử</option><option value="count-0">0 tin chưa đọc · kiểm tra badge</option><option value="count-1">1 tin chưa đọc · kiểm tra badge</option><option value="count-9">9 tin chưa đọc · kiểm tra badge</option><option value="count-10">10 tin chưa đọc · kiểm tra badge</option><option value="count-99">99 tin chưa đọc · kiểm tra badge</option><option value="count-100">100 tin chưa đọc · kiểm tra badge</option><option value="count-999">999 tin chưa đọc · kiểm tra badge</option><option value="count-1000">1000 tin chưa đọc · kiểm tra badge</option></select></label><output id="p13-page-calls">0 lượt tải trang</output></details>';
 tools.append(review);
 const rows=()=>scopedDocuments(getState(),getDocuments());
 const documentById=id=>rows().find(r=>r.id===id);
 const eventById=id=>store.read(id);
 const key=()=>panel===1?'list:'+filter:panel===3?'waiting:'+type:`${panel}:${eventId||docId}`;
 function remember(){if(active){positions.set(key(),root.querySelector('.p13-scroll')?.scrollTop||0);const metadata=root.querySelector('[data-p13-metadata]');if(metadata)expandedMetadata.set(metadata.dataset.p13Metadata,metadata.open);}}
 function navigate(next,params={},replace=false){if(!active||screen.querySelector('.app-modal-host'))return;remember();history[replace?'replaceState':'pushState'](replace?null:{p13:true},'',`#p02/notifications?${new URLSearchParams({panel:next,...params})}`);show();}
 const obscured=()=>root.hidden||!!screen.querySelector('.app-modal-host,dialog[open],.p03-host:not([hidden])');
 const syntheticState=()=>['loading','empty','error'].includes(scenario);
 function rememberOrigin(button){const attribute=button.dataset.p13Event?'p13Event':button.dataset.p13Doc?'p13Doc':null;if(attribute){const selector=attribute==='p13Event'?'[data-p13-event]':'[data-p13-doc]',buttons=[...root.querySelectorAll(selector)],i=buttons.indexOf(button);returnFocus.set(key(),{attribute,ids:[button.dataset[attribute],buttons[i+1]?.dataset[attribute],buttons[i-1]?.dataset[attribute]].filter(Boolean)});}else if(button.dataset.p13)returnFocus.set(key(),{action:button.dataset.p13});}
 function restoreOrigin(){const origin=returnFocus.get(key());if(!origin||obscured())return;let target;if(origin.attribute){const attribute=origin.attribute==='p13Event'?'data-p13-event':'data-p13-doc';target=origin.ids.map(id=>root.querySelector(`[${attribute}="${CSS.escape(id)}"]`)).find(Boolean);target||=root.querySelector('[data-p13-filter][aria-pressed=true],[data-p13-type][aria-pressed=true]');}else target=root.querySelector(`[data-p13="${origin.action}"]`);target?.focus({preventScroll:true});}
 const detailDocument=()=>{const d=documentById(panel===2?eventById(eventId)?.documentId:docId);return panel===4&&d&&!['inbound','outbound'].includes(d.type)?null:d;};
 function info(title,message){motion.cancel();filterMotion=null;feedback.show({title,message,confirmLabel:'Đóng'});}
 function metadata(r){const category={inbound:'Thông báo nhập kho',outbound:'Thông báo xuất kho',warranty:'Thông báo bảo hành',nfc:'Thông báo thiết bị NFC',documents:'Thông báo kho'};return `<dl class="p13-metadata">${[
 ['document','Loại thông báo',category[r.type]||'Chưa có dữ liệu'],['user','Người tạo',r.actor],['warehouse','Kho',r.warehouse]
 ].map(([i,label,value])=>`<div>${icon(i)}<dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;}

 function filters(){const count=notificationCount(store.unread(),99);return `<div class="p13-filters" aria-label="Lọc thông báo">${[['unread',`Chưa đọc (${count.known?count.text:'—'})`],['all','Tất cả']].map(([k,label])=>`<button type="button" data-p13-filter="${k}" aria-pressed="${filter===k}" ${k==='unread'?`title="${esc(count.exact)}" aria-label="Chưa đọc: ${esc(count.exact)}"`:''}>${label}</button>`).join('')}</div>`;}
 function sourceState(){if(scenario==='loading')return '<div class="p13-empty" role="status"><h2>Đang tải dữ liệu…</h2><p>Vui lòng chờ trong giây lát.</p></div>';if(scenario==='error')return empty('Chưa tải được dữ liệu','Bộ lọc và các thông báo đã có vẫn được giữ. Vui lòng thử lại.')+btn('retry','Thử lại','p13-primary');return '';}
 function notificationRow(r){return `<article class="p13-notification" data-hn-readable-group data-read="${r.read}"><button type="button" class="p13-notification-open" data-p13-event="${esc(r.id)}">${!r.read?'<span class="p13-dot" aria-label="Chưa đọc"></span>':''}${tile(r.type)}<span class="p13-notification-copy"><strong>${esc(r.title)}</strong><time>${date(r.day)} · ${esc(r.time)}</time><span class="p13-excerpt" data-hn-readable="Nội dung thông báo" data-hn-lines="3" data-hn-read-outside="true">${esc(r.description)}</span>${r.documentId&&documentById(r.documentId)?badge(documentById(r.documentId)):''}</span></button></article>`;}
 function pageControls(){
  if(['loading','empty','error'].includes(scenario))return '';
  const p=pages.snapshot(filter);if(!p.loaded)return '';
  const remaining=p.total===null?NOTIFICATION_PAGE_SIZE:Math.max(0,p.total-p.items.length);
  const summary=notificationPageSummary({loaded:p.items.length,total:p.total,hasMore:p.hasMore});if(!summary)return '';
  const nextAmount=Math.min(NOTIFICATION_PAGE_SIZE,remaining)||NOTIFICATION_PAGE_SIZE;
  return `<div class="p13-page-control" aria-label="Tải thêm thông báo"><p role="status" aria-live="polite">${summary}</p>${p.hasMore?btn('more',p.busy?'Đang tải…':p.error?'Thử tải thêm':'Xem thêm','p13-load-more',`aria-label="${p.busy?'Đang tải thông báo':p.error?'Thử tải thêm '+nextAmount+' thông báo':'Tải thêm '+nextAmount+' thông báo'}" aria-controls="p13-records" aria-busy="${p.busy}" aria-disabled="${p.busy}"`):''}</div>`;
 }
 function list(){const p=pages.snapshot(filter),items=scenario==='empty'?[]:p.items;
  const state=sourceState()||(!p.loaded&&p.error?empty('Chưa tải được thông báo','Vui lòng thử lại.')+btn('load-first','Thử lại','p13-primary'):!p.loaded?'<div class="p13-empty" role="status"><h2>Đang tải thông báo…</h2></div>':'');
  return `<div class="p13-records" id="p13-records" data-p13-loaded="${p.loaded}" aria-busy="${scenario==='loading'||(!syntheticState()&&p.busy)}">${state||(items.length?items.map(notificationRow).join(''):p.hasMore?empty('Đã đọc các thông báo đã tải','Bấm Xem thêm để tiếp tục xem thông báo chưa đọc.'):(empty('Không có thông báo'+(filter==='unread'?' chưa đọc':''),'Các thông báo phù hợp sẽ xuất hiện tại đây.')+(filter==='unread'?clearFilterButton('data-p13-filter','all'):'')))}</div>${pageControls()}`;
 }
 function updatePageControls(){
  const scroller=root.querySelector('.p13-scroll');if(!scroller)return;
  const template=document.createElement('template');template.innerHTML=pageControls();const next=template.content.firstElementChild,old=scroller.querySelector('.p13-page-control');
  if(!next){old?.remove();}else if(!old){scroller.append(next);}else{
   const status=old.querySelector('[role=status]'),text=next.querySelector('[role=status]').textContent;if(status.textContent!==text)status.textContent=text;
   const button=old.querySelector('button'),replacement=next.querySelector('button');
   if(button&&replacement){for(const a of [...button.attributes])if(!replacement.hasAttribute(a.name))button.removeAttribute(a.name);for(const a of replacement.attributes)if(button.getAttribute(a.name)!==a.value)button.setAttribute(a.name,a.value);if(button.textContent!==replacement.textContent)button.textContent=replacement.textContent;}
   else if(replacement)old.append(replacement);else button?.remove();
  }
  scroller.querySelector('.p13-records')?.setAttribute('aria-busy',String(pages.snapshot(filter).busy));
 }
 function syncUnreadTab(){const button=root.querySelector('.p13-filter-dock [data-p13-filter=unread]');if(!button)return;const count=notificationCount(store.unread(),99);button.textContent=`Chưa đọc (${count.known?count.text:'—'})`;button.title=count.exact;button.setAttribute('aria-label','Chưa đọc: '+count.exact);}
 function syncList(){
  if(!active||disposed||panel!==1||obscured()||syntheticState())return false;
  const scroller=root.querySelector('.p13-scroll'),recordList=scroller?.querySelector('.p13-records');if(!recordList)return false;
  const top=scroller.scrollTop,snapshot=pages.snapshot(filter);if(!snapshot.loaded)return false;
  const focused=document.activeElement,items=new Map(snapshot.items.map(r=>[r.id,r])),existing=[...recordList.querySelectorAll('[data-p13-event]')];
  let fallback=null;
  for(const [i,button]of existing.entries()){const row=button.closest('.p13-notification'),item=items.get(button.dataset.p13Event);if(!item){if(row.contains(focused))fallback=existing.slice(i+1).find(b=>items.has(b.dataset.p13Event))||existing.slice(0,i).reverse().find(b=>items.has(b.dataset.p13Event));row.remove();}else{row.dataset.read=String(item.read);if(item.read)row.querySelector('.p13-dot')?.remove();}}
  const known=new Set([...recordList.querySelectorAll('[data-p13-event]')].map(b=>b.dataset.p13Event));
  if(!known.size)recordList.replaceChildren();
  recordList.insertAdjacentHTML('beforeend',snapshot.items.filter(r=>!known.has(r.id)).map(notificationRow).join(''));
  if(!snapshot.items.length){const t=document.createElement('template');t.innerHTML=list();recordList.innerHTML=t.content.querySelector('.p13-records').innerHTML;}
  recordList.dataset.p13Loaded='true';syncUnreadTab();updatePageControls();scroller.scrollTop=top;
  if(!focused.isConnected)(fallback||root.querySelector('[data-p13-filter][aria-pressed=true]'))?.focus({preventScroll:true});
  pendingReadSync=false;pendingPageSync=false;filterSettled();return true;
 }
 const lifecycleObserver=new MutationObserver(()=>{if(obscured())motion.cancel();if(pendingReadSync||pendingPageSync)syncList();});
 lifecycleObserver.observe(screen,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','inert']});

 async function loadPage(){
  if(!active||panel!==1||!canReadPreview(getState()))return;
  const selected=filter,before=pages.snapshot(selected);if(before.busy||before.loaded&&!before.hasMore)return;
  const scope=store.scope(),trigger=document.activeElement,focusMore=['more','load-first'].includes(trigger?.dataset.p13);
  const request=pages.load(selected,{fail:scenario==='page-error'&&before.loaded});if(!before.loaded)root.querySelector('.p13-records').innerHTML='<div class="p13-empty" role="status"><h2>Đang tải thông báo…</h2></div>';updatePageControls();
  const result=await request;review.querySelector('#p13-page-calls').textContent=store.metrics().pageCalls+' lượt tải trang';
  if(!active||disposed||panel!==1||filter!==selected||store.scope()!==scope)return;
  if(result.kind==='page'){
   if(syntheticState())return;
   const focusStillRequested=focusMore&&document.activeElement===trigger&&!obscured();
   const prior=new Set(before.items.map(r=>r.id));const added=pages.snapshot(selected).items.filter(r=>!prior.has(r.id));
   pendingPageSync=true;if(!syncList())return;
   if(focusStillRequested){const target=added.length?root.querySelector(`[data-p13-event="${CSS.escape(added[0].id)}"]`):root.querySelector('[data-p13=more]');target?.focus({preventScroll:true});}
  }else if(result.kind!=='stale'&&result.kind!=='end'){
   if(!before.loaded){root.querySelector('.p13-records').innerHTML=empty('Chưa tải được thông báo','Vui lòng thử lại.')+btn('load-first','Thử lại','p13-primary');}
   updatePageControls();if(!obscured()&&(document.activeElement===trigger||!trigger?.isConnected))root.querySelector('[data-p13=more],[data-p13=load-first]')?.focus({preventScroll:true});
   info('Chưa tải được thông báo',before.loaded?'Danh sách đã tải và vị trí đọc vẫn được giữ. Đóng thông báo này rồi chọn Thử tải thêm để tải lại cùng trang.':'Chưa tải được trang đầu. Đóng thông báo này rồi chọn Thử lại.');
  }
 }

 function notification(){
  const r=eventById(eventId);if(!r)return empty('Không tìm thấy thông báo','Thông báo không thuộc nguồn được cấp cho phiên hiện tại.');
  const d=documentById(r.documentId);
  return `<article class="p13-detail-card"><div class="p13-summary">${tile(r.type)}<div><h2>${esc(r.title)}</h2><time>${date(r.day)} · ${esc(r.time)}</time><p class="p13-source" data-hn-readable="Nguồn thông báo" data-hn-lines="2">${esc(r.actor)} · ${esc(r.warehouse)}</p></div></div>
   <section class="p13-narrative"><h3>Nội dung thông báo</h3>${readable(r.description,'Nội dung thông báo')}</section>
   ${d?`<section class="p13-related" aria-labelledby="p13-related-title"><h3 id="p13-related-title">Chứng từ liên quan</h3><div class="p13-related-row"><div><strong>${esc(d.number)}</strong><span>${esc(TYPES[d.type])}</span></div>${badge(d)}</div></section>`:''}
   <details class="p13-more-info" data-p13-metadata="${esc(r.id)}" ${expandedMetadata.get(r.id)?'open':''}><summary><span>Thông tin chi tiết</span>${icon('chevron')}</summary>${metadata(r)}</details>
   ${!r.read?btn('mark-read','Thử đánh dấu đã đọc','p13-link','hidden'):''}</article>`;
 }

 function counts(r){const total=totals(r.lines);return `<div class="p13-counts"><span>${icon('box')}<span><strong>${total.quantity??'—'}</strong><small>sản phẩm · ${total.skuCount??'—'} SKU</small></span></span><span>${icon('user')}<span>${esc(r.actor)}<small>Người tạo</small></span></span><span>${icon('calendar')}<span>${date(r.day)}<small>${esc(r.time||'—')}</small></span></span></div>`;}
 function waiting(){const all=waitingDocuments(getState(),getDocuments()),items=scenario==='empty'?[]:all.filter(r=>type==='all'||r.type===type);return `<aside class="p13-banner">${icon('document')}<div><strong>Xử lý chứng từ trên Web</strong><p>Theo dõi phiếu đã gửi tại Kho Hoa Nam. Việc xử lý và ghi sổ được thực hiện trên Web.</p></div></aside><div class="p13-filters" aria-label="Loại phiếu chờ">${[['all','Tất cả'],['inbound','Phiếu nhập'],['outbound','Phiếu xuất']].map(([k,label])=>`<button type="button" data-p13-type="${k}" aria-pressed="${type===k}">${label} (${all.filter(r=>k==='all'||r.type===k).length})</button>`).join('')}</div><div class="p13-records">${sourceState()||(items.length?items.map(r=>`<button type="button" class="p13-waiting-record" data-p13-doc="${esc(r.id)}"><span class="p13-summary">${tile(r.type)}<span><strong>${esc(r.number)}</strong><small>Phiếu ${r.type==='inbound'?'nhập':'xuất'} kho</small></span>${badge(r)}${icon('chevron')}</span>${counts(r)}</button>`).join(''):(empty('Không có phiếu chờ xử lý','Chưa có phiếu nhập/xuất phù hợp trong nguồn được cấp.')+(scenario==='ready'&&type!=='all'?clearFilterButton('data-p13-type','all'):'')))}</div>`;}
 function waitingDetail(){const r=documentById(docId);if(!r||!['inbound','outbound'].includes(r.type))return empty('Không tìm thấy chứng từ','Chứng từ không thuộc nguồn được cấp cho phiên hiện tại.');const total=totals(r.lines);return `<article class="p13-document-card"><div class="p13-summary">${tile(r.type)}<div><h2>${esc(r.number)}</h2><p>Phiếu ${r.type==='inbound'?'nhập':'xuất'} kho</p></div>${badge(r)}</div>${counts(r)}</article><section class="p13-card"><div class="p13-warehouse">${tile('documents')}<div><small>Kho</small><strong>${esc(r.warehouse)}</strong></div></div><p class="p13-muted">Kho được xác định theo chứng từ và phạm vi truy cập của phiên.</p></section><aside class="p13-banner" data-p13-waiting-state><div><strong>${r.status==='waiting'?WAITING_WEB.status:'Trạng thái chứng từ đã cập nhật'}</strong><p>${r.status==='waiting'?WAITING_WEB.description:'Mở chứng từ để xem trạng thái hiện tại. App không thực hiện duyệt hoặc ghi sổ phiếu nhập/xuất.'}</p></div></aside><section class="p13-card"><div class="p13-section-heading"><h2>Danh sách hàng hóa (${total.skuCount??'—'} SKU)</h2>${btn('products',icon('chevron'),'p13-icon-button','aria-label="Xem đầy đủ sản phẩm"')}</div>${r.lines?.length?`<table class="p13-lines"><thead><tr><th>SKU</th><th>Số lượng</th><th>Đơn vị</th></tr></thead><tbody>${r.lines.map(l=>`<tr><td>${esc(l.sku)}</td><td>${l.quantity??'—'}</td><td>${esc(l.unit)}</td></tr>`).join('')}</tbody></table>`:'<p>Chưa có dữ liệu sản phẩm.</p>'}</section>${r.note?`<section class="p13-card"><h2>Ghi chú</h2>${readable(r.note,'Ghi chú · '+r.number,2)}</section>`:''}`;}
 function render(focus=false){if(!active||disposed)return;motion.cancel();screen.classList.toggle('p13-detail-screen',[2,4].includes(panel));screen.classList.toggle('p13-inbox-screen',[1,2].includes(panel));const allowed=canReadPreview(getState());const r=panel===2?eventById(eventId):null,d=detailDocument();const titles=['','Thông báo','Chi tiết thông báo','Chờ xử lý trên Web','Chi tiết chờ xử lý Web'];
 root.innerHTML=`<section class="p13-app" data-panel="P13.S0${panel}"><header class="p13-header">${btn('back',icon('back'),'p13-back','aria-label="Quay lại"')}<h1 tabindex="-1">${titles[panel]}</h1></header><div class="p13-body">${allowed&&panel===1?`<div class="p13-filter-dock">${filters()}</div>`:''}<div class="p13-scroll" tabindex="0" aria-label="Nội dung ${titles[panel]}">${!allowed?empty('Chưa xác minh quyền xem','Chưa có nguồn dữ liệu được cấp cho tài khoản và kho trong phiên này.'):panel===1?list():panel===2?notification():panel===3?waiting():waitingDetail()}</div>${allowed&&[2,4].includes(panel)&&d?`<footer class="p13-actions">${d?btn('document',icon('document')+' Xem chứng từ','p13-primary'):''}${panel===2&&d?.status==='waiting'&&['inbound','outbound'].includes(d.type)?btn('waiting','Các phiếu chờ Web','p13-context-link'):''}${panel===4?btn('web','Hướng dẫn xử lý trên Web','p13-secondary'):''}</footer>`:''}</div></section>`;
 root.querySelector('.p13-scroll').scrollTop=positions.get(key())||0;renderedHash=location.hash;document.title='P13 · '+titles[panel];if(focus)root.querySelector('h1')?.focus({preventScroll:true});onSize();}
 async function markRead(id){const r=eventById(id);if(!r||r.read||!canReadPreview(getState()))return;const requestEpoch=epoch,scope=scopeKey(getState());const trigger=root.querySelector('[data-p13=mark-read]');if(trigger){trigger.disabled=true;trigger.setAttribute('aria-busy','true');}const result=await store.markRead(id,{fail:scenario==='read-error'});if(disposed||scopeKey(getState())!==scope)return;if(result.kind==='verified'){pages.markRead(id);onUnread();if(active&&panel===1){pendingReadSync=true;syncList();return;}}if(!active||epoch!==requestEpoch||eventId!==id)return;if(trigger?.isConnected){trigger.disabled=false;trigger.removeAttribute('aria-busy');}if(result.kind==='verified'){if(trigger===document.activeElement)root.querySelector('h1')?.focus({preventScroll:true});trigger?.remove();}else if(result.kind!=='stale'){if(trigger?.isConnected)trigger.hidden=false;info('Chưa đánh dấu đã đọc','Thông báo vẫn được giữ là chưa đọc. Bạn có thể đọc nội dung và thử đánh dấu lại.');}}
 function show(){if(disposed)return;if(active&&location.hash===renderedHash&&root.querySelector('.p13-app'))return;filterMotion=null;remember();active=true;motion.activate();review.hidden=false;const q=new URLSearchParams(location.hash.split('?')[1]);panel=[1,2,3,4].includes(Number(q.get('panel')))?Number(q.get('panel')):1;eventId=q.get('event');docId=q.get('doc');epoch++;render(true);restoreOrigin();onPanelTransition(routeKey());if(panel===4){const d=detailDocument();if(d)motion.state(root.querySelector('[data-p13-waiting-state]'),JSON.stringify([d.id,d.version,d.status]));}if(panel===2)void markRead(eventId);if(panel===1&&!pages.snapshot(filter).loaded&&!pages.snapshot(filter).busy&&!pages.snapshot(filter).error)void loadPage();}
 function click(e){if(!active||disposed||!root.contains(e.target)||screen.querySelector('.app-modal-host'))return;const b=e.target.closest('button');if(!b)return;const a=b.dataset.p13;if(a==='back'){remember();if(history.state?.p13)history.back();else if(panel===1)onHome();else navigate(panel===4?3:1,{},true);return;}if(!canReadPreview(getState()))return;
 if(b.dataset.p13Filter){if(filter===b.dataset.p13Filter)return;remember();motion.cancel();filter=b.dataset.p13Filter;filterMotion=filter;render();root.querySelector(`[data-p13-filter="${filter}"]`)?.focus();filterSettled();if(!pages.snapshot(filter).loaded&&!pages.snapshot(filter).busy)void loadPage();}
 if(b.dataset.p13Type){if(type===b.dataset.p13Type)return;remember();type=b.dataset.p13Type;render();root.querySelector(`[data-p13-type="${type}"]`)?.focus();motion.list(root.querySelector('.p13-records'));}
 if(b.dataset.p13Event){rememberOrigin(b);navigate(2,{event:b.dataset.p13Event});}
 if(b.dataset.p13Doc){rememberOrigin(b);navigate(4,{doc:b.dataset.p13Doc});}
 if(a==='waiting')navigate(3);
 if(a==='more'||a==='load-first')void loadPage();
 if(a==='retry'){scenario='ready';review.querySelector('select').value='ready';render();}
 if(a==='mark-read')void markRead(eventId);
 if(a==='web'&&detailDocument())info('Xử lý chứng từ trên Web','Mở hệ thống Web được đơn vị cấp và tìm chứng từ '+(documentById(docId)?.number||'đang xem')+'. Kiểm tra trạng thái, nội dung và quyền xử lý tại đó. Chưa có URL Web được cấu hình để mở từ App.');
 if(a==='document'||a==='products'){const id=panel===2?eventById(eventId)?.documentId:docId;if(!detailDocument())return info('Chưa thể mở chứng từ','Chứng từ không thuộc nguồn được cấp trong phiên hiện tại.');rememberOrigin(b);remember();onDocument(id,a==='products'?'products':'info');}
 }
 function onMetadataToggle(e){const node=e.target;if(active&&node.matches?.('[data-p13-metadata]')&&node.isConnected)expandedMetadata.set(node.dataset.p13Metadata,node.open);}
 root.addEventListener('toggle',onMetadataToggle,true);
 root.addEventListener('click',click);review.querySelector('#p13-scenario').onchange=e=>{scenario=e.target.value;remember();render();};
 review.querySelector('#p13-dataset').onchange=e=>{store.useReviewDataset(e.target.value);pages.reset();positions.clear();expandedMetadata.clear();returnFocus.clear();pendingReadSync=false;pendingPageSync=false;onUnread();if(panel===1){render();void loadPage();}else navigate(1);};
 return {show,routeKey,setMotionMode:value=>motion.setMode(value),cancelMotion(){filterMotion=null;motion.cancel();},hide(){filterMotion=null;motion.hide();if(!active)return;remember();active=false;epoch++;review.hidden=true;feedback.clear();screen.classList.remove('p13-detail-screen','p13-inbox-screen');},dispose(){motion.dispose();disposed=true;active=false;epoch++;pages.dispose();lifecycleObserver.disconnect();feedback.dispose();review.remove();expandedMetadata.clear();returnFocus.clear();root.removeEventListener('toggle',onMetadataToggle,true);root.removeEventListener('click',click);}};
}
