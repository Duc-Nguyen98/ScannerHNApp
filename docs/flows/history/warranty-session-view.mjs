import {mountWarrantySessionMotion} from './warranty-session-motion.mjs';
import {historyScope,newFilters,warrantyRows,caseEvents,selectRows,findExact,normalizeSessions,textValue} from './warranty-session-model.mjs';
import {sessionFixture} from './warranty-session-fixture.mjs';
import {historyControls} from './history-controls.mjs';
import {hasHistoryFilters,clearHistoryConditions,acceptedLabel,latestWarrantyEvent,sessionLinks,sessionNotice} from './warranty-session-experience.mjs';
import {openHistoryPicker} from './history-picker.mjs';
import {createDialogRoute} from '../shared/dialog-route.mjs';
import {validateQueryRange,validQueryDate} from '../shared/query-date-policy.mjs';
import {DIALOG_ICONS} from '../scanner-dialogs/icons.mjs';
import {LOOKUP_ICONS} from '../lookup/icons.mjs';
import {INBOUND_ICONS} from '../inbound/icons.mjs';
const icons={...DIALOG_ICONS,...LOOKUP_ICONS,...INBOUND_ICONS};
const icon=n=>`<svg class="p08-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[n]||icons.scan}</svg>`;
const esc=v=>String(v??'Chưa xác minh').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tile=(kind='sessions')=>`<span class="hn-operation-icon" data-hn-operation="${kind}" data-size="md">${icon(kind==='warranty'?'tool':kind==='inbound'?'down':'scan')}</span>`;
const badge=s=>`<span class="p08-chip ${['Đã xuất','Đã trả khách','Đã kết thúc'].includes(s)?'success':s==='Chờ xử lý trên Web'||s==='Chờ bàn giao'?'waiting':''}">${esc(s)}</span>`;
const day=s=>validQueryDate(s)?s.split('-').reverse().join('/'):'Chưa xác minh ngày';
const readable=(label,value,lines=2)=>`<strong data-hn-readable="${label}" data-hn-readable-kind="value" data-hn-lines="${lines}">${esc(textValue(value))}</strong>`;
const kv=(label,value)=>`<div class="p23-kv"><span>${label}</span><div>${readable(label,value)}</div></div>`;
const blank=(title,copy)=>`<section class="p23-empty">${tile()}<h2>${title}</h2><p>${copy}</p></section>`;
const names={warranty:'Lịch sử bảo hành','warranty-detail':'Quá trình bảo hành',sessions:'Lịch sử phiên quét','session-detail':'Chi tiết phiên quét'};
export function mountWarrantySession({root,screen,tools,getState,onNavigate,onSize,onComponents,getReceipts=()=>[],readSessions=null,motionMode='auto'}){
 let active=false,disposed=false,identity='',scene='warranty',entity='',renderedHash='',backPending=false,mode='unavailable';
 let source={kind:'unavailable',items:[]},generation=0,abort=null,readTimer=null,timer=null,composing=false,modal=null,deferred=null;
 let filters={warranty:newFilters(),sessions:newFilters()},views={};
 let viewed={warranty:null,sessions:null};
 const restoreFrames=new Set();
 const deferRestore=fn=>{const id=requestAnimationFrame(()=>{restoreFrames.delete(id);fn();});restoreFrames.add(id);};
 const cancelRestore=()=>{for(const id of restoreFrames)cancelAnimationFrame(id);restoreFrames.clear();};
 const componentCallers=new Map();
 const componentCaller=()=>{const c=componentCallers.get(history.state?.p24CaseCaller);return c&&c.scope===historyScope(getState())&&c.target===location.hash&&c.caseId===entity?c:null;};
 const journey=crypto.randomUUID(),route=createDialogRoute({history,location,key:'hnP23Picker'});
 const review=document.createElement('details');review.className='p23-tools';review.hidden=true;review.open=true;
 review.innerHTML='<summary>P23 · Bảo hành & phiên quét — mô phỏng</summary><p>Bảo hành dùng cùng nguồn P09. Phiên quét B23 tách biệt P08 cũ; không kết nối WMS, không ghi tồn. Reload/đăng xuất mất dữ liệu preview.</p><label>Nguồn phiên quét <select data-p23-source><option value="unavailable">Chưa có nguồn</option><option value="fixture">Mẫu B23</option><option value="empty">Nguồn xác nhận rỗng</option><option value="error">Lỗi đọc</option><option value="slow">Đọc chậm</option><option value="long">Nội dung dài</option><option value="missing">Thiếu số liệu/kết quả</option></select></label><label>Lần tải lại <select data-p23-outcome><option value="ready">Bình thường</option><option value="error">Lỗi đọc</option><option value="slow">Đọc chậm</option><option value="timeout">Treo 15 giây</option></select></label><pre data-p23-snapshot hidden></pre>';
 tools.append(review);
 const allowed=()=>active&&!disposed&&identity&&historyScope(getState())===identity;
 const family=()=>scene.startsWith('warranty')?'warranty':'sessions';
 const detail=()=>scene.endsWith('-detail');
 const viewKey=()=>scene+':'+(detail()?entity:'');
 const occupied=()=>!!screen.querySelector('.app-modal-host,dialog[open]');
 const motion=mountWarrantySessionMotion({root,requested:motionMode,active:()=>allowed()&&!occupied()});
 const filterKey=()=>JSON.stringify([family(),filters[family()]]);
 const animateFilter=()=>{if(!detail())motion.filter(filterKey(),root.querySelector('[data-p23-type][aria-pressed="true"]'),family());};
 // Stable descriptors also cover duplicate Back/filter buttons and deferred readers.
 function focusKey(e=document.activeElement){
  if(!e||!root.contains(e))return null;
  let selector;
  if(e.matches('[data-hn-read-trigger]')){const row=e.closest('[data-p23-event-id]');selector=(row?'[data-p23-event-id="'+CSS.escape(row.dataset.p23EventId)+'"] ':'')+'[data-hn-read-trigger][aria-label="'+CSS.escape(e.getAttribute('aria-label'))+'"]';}
  else if(e.dataset.p23Entity)selector='[data-p23-entity="'+CSS.escape(e.dataset.p23Entity)+'"]';
  else if(e.dataset.p23)selector='[data-p23="'+CSS.escape(e.dataset.p23)+'"]';
  else if(e.dataset.p23Type)selector='[data-p23-type="'+CSS.escape(e.dataset.p23Type)+'"]';
  else if(e.id)selector='#'+CSS.escape(e.id);
  else if(e.matches('h1'))selector='h1';
  if(!selector)return null;
  return {selector,index:[...root.querySelectorAll(selector)].indexOf(e)};
 }
 function restoreFocus(key,{fallback=false}={}){
  const app=root.querySelector('.p23-app'),initial=document.activeElement;
  const apply=last=>{if(!allowed()||occupied()||root.querySelector('.p23-app')!==app||![initial,document.body].includes(document.activeElement))return;
   const target=key?root.querySelectorAll(key.selector)[key.index||0]:null;
   if(target&&!target.hidden&&!target.disabled)target.focus({preventScroll:true});
   else if(last&&fallback)root.querySelector('h1')?.focus({preventScroll:true});
   else if(!last)deferRestore(()=>apply(true));
  };
  if(key?.selector.includes('data-hn-read-trigger'))deferRestore(()=>apply(false));else apply(true);
 }
 function position(){
  const sc=root.querySelector('.p23-scroll'),rect=sc?.getBoundingClientRect(),scale=screen.getBoundingClientRect().width/screen.offsetWidth;
  const row=rect&&!detail()?[...sc.querySelectorAll('[data-p23-entity]')].find(n=>n.getBoundingClientRect().bottom>rect.top):null;
  return {top:sc?.scrollTop||0,anchor:row?{attr:row.hasAttribute('data-p23-entity')?'data-p23-entity':'data-p23-event-id',id:row.dataset.p23Entity||row.dataset.p23EventId,offset:(row.getBoundingClientRect().top-rect.top)/scale}:null};
 }
 function restorePosition(p){
  const sc=root.querySelector('.p23-scroll');if(!sc)return;sc.scrollTop=p.top;
  const row=p.anchor&&sc.querySelector('['+p.anchor.attr+'="'+CSS.escape(p.anchor.id)+'"]');
  if(row){const scale=screen.getBoundingClientRect().width/screen.offsetWidth;sc.scrollTop+=(row.getBoundingClientRect().top-sc.getBoundingClientRect().top)/scale-p.anchor.offset;}
 }
 function remember(){if(!active||!root.querySelector('.p23-app'))return;views[viewKey()]={...position(),focus:focusKey()};}
 function save(){if(allowed())history.replaceState({...history.state,p23:{journey,filters:structuredClone(filters),views:structuredClone(views)}},'',location.hash);}
 function navigate(next,id){if(!allowed()||occupied())return;remember();save();onNavigate('#p02/history?'+new URLSearchParams({scene:next,...(id?{[next==='warranty-detail'?'case':'session']:id}:{})}),{p23From:{journey,hash:location.hash},p23:{journey,filters:structuredClone(filters),views:structuredClone(views)}});}
 function back(){if(!allowed()||occupied()||backPending)return;remember();save();backPending=true;if(componentCaller()||history.state?.p23From?.journey===journey||history.state?.embeddedBack)history.back();else onNavigate(detail()?'#p02/history?scene='+family():'#p02/history',null,true);}
 const currentRows=()=>family()==='warranty'?warrantyRows():source.items;
 const selection=()=>selectRows(currentRows(),filters[family()],family());
 const reloadButton=()=>`<button class="p23-reload" data-p23="reload" aria-label="Tải lại lịch sử phiên quét" ${source.kind==='loading'||source.issue==='loading'?'aria-disabled="true"':''}>${source.kind==='loading'||source.issue==='loading'?'Đang tải…':'Tải lại'}</button>`;
 const countText=()=>family()==='warranty'||source.kind==='ready'?'Đã tải '+selection().length:'Chưa xác minh';
 function updateControls(){const f=filters[family()],clear=root.querySelector('[data-p23=clear]'),query=root.querySelector('[data-p23=clear-query]'),count=root.querySelector('.p23-result-count');if(clear)clear.hidden=!hasHistoryFilters(f);if(query)query.hidden=!f.q;if(count)count.textContent=countText();const filter=root.querySelector('.p08-search [data-p23=filter]');if(filter){const active=!!(f.from||f.to||f.status!=='all');filter.toggleAttribute('data-filter-active',active);if(active)filter.setAttribute('data-filter-active','true');filter.setAttribute('aria-label','Bộ lọc '+names[scene]+(active?', đang áp dụng':''));if(active&&!filter.querySelector('.p08-filter-dot'))filter.insertAdjacentHTML('beforeend','<span class="p08-filter-dot" aria-hidden="true"></span>');if(!active)filter.querySelector('.p08-filter-dot')?.remove();}}
 function decorateControls(){if(detail())return;const search=root.querySelector('.p08-search'),clear=root.querySelector('[data-p23=clear]');if(search)search.insertAdjacentHTML('beforeend',`<button class="p23-clear-query" data-p23="clear-query" aria-label="Xóa từ khóa" ${filters[family()].q?'':'hidden'}>×</button>`);if(clear){clear.textContent='Xóa bộ lọc';root.querySelector('.p23-dock').append(clear);}if(family()==='sessions')root.querySelector('.p08-toolbar-actions')?.insertAdjacentHTML('beforeend',reloadButton());updateControls();}
 function controls(){const f=filters[family()],w=family()==='warranty';return `<div class="p23-dock"><p class="p23-intro">${w?'Mở hồ sơ để xem quá trình xử lý và linh kiện đã xuất.':'Phiên quét và kết quả chứng từ là hai thông tin riêng biệt.'}</p>${historyControls({filters:f,tabs:w?[['Đang kiểm tra','Đang kiểm tra'],['Đã trả khách','Đã trả khách']]:[['Nhập kho','Nhập kho'],['Xuất linh kiện','Xuất linh kiện'],['Tra cứu','Tra cứu']],statuses:{},count:selection().length,ready:w||source.kind==='ready',icon,namespace:'p23',inputId:'p23-search',placeholder:w?'Tìm mã hồ sơ hoặc serial':'Tìm mã phiên hoặc mã phiếu',scopeName:names[scene],showSort:false,canClear:true})}</div>`;}
 function list(){
  const rows=selection(),w=family()==='warranty';if(!rows.length)return blank(filters[family()].q||filters[family()].type!=='all'||filters[family()].from?'Không có kết quả phù hợp':w?'Chưa có hồ sơ trong nguồn đã đọc':source.complete?'Chưa có phiên trong nguồn đã đọc':'Chưa tìm thấy phiên trong dữ liệu đã tải','Bạn có thể kiểm tra bộ lọc hoặc tải lại nguồn.');
  let group='';return rows.map(r=>{let heading='';if(!w&&group!==r.day){group=r.day;heading=`<h3 class="p23-group" data-p23-day="${esc(r.day)}">${day(r.day)}<span>${rows.filter(x=>x.day===r.day).length} phiên đã tải</span></h3>`;}return heading+`<button class="p23-card p23-link ${viewed[family()]===r.id?'p23-viewed':''}" data-p23-entity="${esc(r.id)}">${w?`<span class="p23-row"><strong class="p23-id">${esc(r.id)}</strong>${badge(r.status)}</span><p class="p23-clamp">${esc(r.model)}</p><p class="p23-meta p23-clamp">Serial: ${esc(r.serial)}</p><span class="p23-meta">${day(r.day)} · ${esc(r.time)}${viewed[family()]===r.id?' · Vừa xem':''}</span>`:`<span class="p23-row"><span class="p23-title">${tile(r.type==='Nhập kho'?'inbound':r.type==='Xuất linh kiện'?'warranty':'documents')}<strong>${esc(r.type)}</strong></span>${badge(r.status)}</span><p class="p23-session-id">${esc(r.id)}</p><p class="p23-meta">${esc(r.time)}</p><p class="p23-meta">${r.accepted??'Chưa xác minh'} ${r.type==='Tra cứu'?'lượt hợp lệ':'mã hợp lệ'}${r.type==='Xuất linh kiện'?' · '+(r.quantity??'Chưa xác minh')+' linh kiện':''}</p><span class="p23-row p23-card-end"><span>${viewed[family()]===r.id?'Vừa xem':'Xem chi tiết'}</span><span aria-hidden="true">→</span></span>`}</button>`;}).join('')+`<p class="p23-end">${w||source.complete?'Đã hiển thị hết dữ liệu trong nguồn đã đọc.':'Đang hiển thị dữ liệu đã tải; chưa xác minh toàn bộ.'}</p>`;
 }
 function warrantyDetail(){
  const r=findExact(warrantyRows(),entity);if(!r)return blank('Không tìm thấy hồ sơ','Không có case ID này trong nguồn P09. Không mở hồ sơ khác thay thế.');
  const events=caseEvents(r),latest=latestWarrantyEvent(events);
  return `<section class="p23-card"><div class="p23-row"><strong class="p23-id">${esc(r.id)}</strong>${badge(r.status)}</div><p>${readable('Sản phẩm',r.model,3)}</p><p class="p23-meta">Serial: ${readable('Serial',r.serial)}</p></section><h2>Quá trình xử lý</h2>${events.length?`<ol class="p23-timeline">${events.map(e=>`<li data-p23-event-id="${esc(e.id)}"><span class="p23-event-dot" aria-hidden="true">✓</span><h3 data-hn-readable="Sự kiện" data-hn-lines="3">${esc(textValue(e.label))}</h3>${e.id===latest?'<span class="p23-latest">Sự kiện mới nhất</span>':''}<div class="p23-event-meta"><div class="p23-event-time"><time data-hn-readable="Thời gian sự kiện" data-hn-lines="2">${day(e.day)} · ${esc(textValue(e.time))}</time></div><div><p data-hn-readable="Người thao tác" data-hn-lines="2">${esc(textValue(e.actor))}</p></div></div>${textValue(e.description)?`<p data-hn-readable="Ghi chú sự kiện" data-hn-lines="2">${esc(e.description)}</p>`:''}</li>`).join('')}</ol>`:blank('Chưa có sự kiện đã xác minh','Không suy timeline từ trạng thái cuối của hồ sơ.')}<button class="p23-card p23-link" data-p23="components"><span class="p23-row"><span class="p23-title">${tile('warranty')}<span><strong>Linh kiện đã xuất</strong><br><span class="p23-meta">Xem phiếu đã xuất theo hồ sơ</span></span></span><span aria-hidden="true">→</span></span></button><div class="p23-notice">Thông tin được xem lại từ hồ sơ bảo hành hiện có.${r.status==='Đã trả khách'?' Hồ sơ đã trả khách chỉ đọc, không được xuất thêm linh kiện.':''}</div>`;
 }
 function sessionDetail(){
  const r=findExact(source.items,entity);if(!r)return blank('Không tìm thấy phiên quét','Không có session ID này trong nguồn đã đọc. Không thay bằng phiên đầu tiên.');
  const links=sessionLinks(r,warrantyRows(),getReceipts(),getState().session.warehouse.id);
  const related=links.caseId?`<section class="p23-related"><h2>Liên quan</h2><button class="p23-related-link" data-p23="related-case">${tile('warranty')}<span><strong>Hồ sơ bảo hành</strong><small>${esc(links.caseId)}</small></span><span aria-hidden="true">→</span></button>${links.receiptId?`<button class="p23-related-link" data-p23="related-receipt">${tile('documents')}<span><strong>Phiếu xuất đã xác minh</strong><small>${esc(links.receiptId)}</small></span><span aria-hidden="true">→</span></button>`:''}</section>`:'';
  const stat=(v,label)=>`<div><strong class="${typeof v==='string'?'p23-na':''}">${esc(v??'Chưa xác minh')}</strong><span>${label}</span></div>`;
  return `<section class="p23-card"><div class="p23-row"><strong class="p23-id">${esc(r.id)}</strong>${badge(r.status)}</div><p class="p23-meta">${esc(r.type)} · ${day(r.day)}</p></section><section class="p23-card">${kv('Thời gian',r.time)}${kv('Người quét',r.actor)}${kv('Kho',r.warehouse)}${kv('Trạng thái phiên',r.sessionStatus)}${kv('Kết quả chứng từ',r.type==='Tra cứu'?'Không áp dụng':r.status)}${kv('Phiếu liên quan',r.type==='Tra cứu'?'Không áp dụng':r.doc)}</section><section class="p23-card p23-stats">${stat(r.accepted??'Chưa xác minh',acceptedLabel(r))}${stat(r.rejected??'Chưa xác minh','Mã bị từ chối')}${stat(r.type==='Xuất linh kiện'?(r.quantity??'Chưa xác minh'):'Không áp dụng','Linh kiện đã xuất')}</section><p class="p23-meta">Lượt đọc trùng: ${r.duplicate??'Chưa xác minh'} · Không cộng vào mã hợp lệ.</p><h2>${r.type==='Tra cứu'?'Kết quả phiên':'Mã đã ghi nhận'}</h2>${r.events.length?`<section class="p23-card">${r.events.map(e=>`<div class="p23-code" data-p23-event-id="${esc(e.id)}">${readable('Mã gốc',e.code)}<p class="p23-meta">${esc(e.time)} · ${e.result==='accepted'?'Hợp lệ':e.result==='rejected'?'Từ chối':'Đọc trùng'}${r.type==='Xuất linh kiện'&&r.status==='Đã xuất'&&e.result==='accepted'?' · '+(e.quantity??'Chưa xác minh')+' linh kiện':''}</p></div>`).join('')}</section>`:`<div class="p23-notice">${r.eventsKnown?'Nguồn không có dòng sự kiện quét.':'Nguồn chưa cung cấp chi tiết từng lần quét. Không tự tạo mã hoặc event ID.'}</div>`}${related}<p class="p23-notice">${esc(sessionNotice(r))}</p>`;
 }
 function content(){if(family()==='warranty')return detail()?warrantyDetail():list();if(source.kind==='unavailable')return blank('Chưa có dữ liệu phiên quét','Nguồn phiên và sự kiện quét chưa khả dụng. Không dựng lịch sử từ phiên đăng nhập hoặc các lần quét gần nhau.');if(source.kind==='loading')return blank('Đang tải lịch sử…','Đang đọc nguồn phiên quét.');if(source.kind==='error')return blank('Không tải được lịch sử','Nguồn đọc lỗi hoặc hết thời gian chờ. Tải lại chỉ đọc, không gửi lại lệnh Post.');return (source.issue?`<p class="p23-read-status" role="status">${source.issue==='loading'?'Đang tải lại.':source.issue==='interrupted'?'Lần đọc bị ngắt.':'Không tải lại được.'} Đang xem dữ liệu từ lần đọc trước.</p>`:'')+(detail()?sessionDetail():list());}
 function sync(){review.querySelector('[data-p23-snapshot]').textContent=JSON.stringify({scene,entity,filters,source:source.kind,ids:source.items.map(r=>r.id),scope:identity});}
 // Reconcile native list children by immutable identity; never remount an unchanged row.
 function updateList(sc){
  const template=document.createElement('template');template.innerHTML=content();
  const key=n=>n.nodeType!==1?null:n.dataset.p23Entity?'row:'+n.dataset.p23Entity:n.hasAttribute('data-p23-day')?'day:'+n.dataset.p23Day:n.matches('.p23-end')?'end':n.matches('.p23-read-status')?'read':null;
  const old=new Map([...sc.children].map(n=>[key(n),n]).filter(([k])=>k));
  const desired=[...template.content.childNodes].map(fresh=>{
   const prior=old.get(key(fresh));
   if(prior&&['day:','read'].some(k=>key(fresh)?.startsWith(k))&&prior.innerHTML!==fresh.innerHTML)prior.innerHTML=fresh.innerHTML;
   // Motion metadata is not business content and must not force a row remount.
   const comparable=prior?.cloneNode(true);comparable?.removeAttribute('data-motion-primitive');
   return comparable&&comparable.outerHTML===fresh.outerHTML?prior:fresh;
  });
  const keep=new Set(desired);for(const node of [...sc.childNodes])if(!keep.has(node))node.remove();
  let cursor=sc.firstChild;
  for(const node of desired){if(node!==cursor)sc.insertBefore(node,cursor);else cursor=cursor.nextSibling;}
 }
 function paintSource({resetScroll=false}={}){
  if(!allowed())return;if(occupied()||composing){deferred=()=>paintSource({resetScroll});return;}
  const sc=root.querySelector('.p23-scroll');if(!sc)return;
  const pos=resetScroll?{top:0}:position(),e=document.activeElement,key=focusKey(e),wasInside=sc.contains(e);
  // Keep the dock, detail toolbar and footer mounted throughout source reads.
  if(!detail())updateList(sc);else sc.innerHTML=content();restorePosition(pos);updateControls();
  const reload=root.querySelector('[data-p23=reload]');if(reload){const busy=source.kind==='loading'||source.issue==='loading';reload.setAttribute('aria-disabled',String(busy));reload.disabled=false;reload.textContent=busy?'Đang tải…':'Tải lại';}
  sync();onSize();animateFilter();
  if(wasInside&&!e.isConnected)restoreFocus(key,{fallback:true});
 }
 function render({restore=false,focus=false}={}){
  if(!allowed())return;if(occupied()){deferred=()=>render({restore,focus});return;}clearTimeout(timer);cancelRestore();motion.cancel();composing=false;
  const caller=history.state?.p23From?.journey===journey?new URLSearchParams(history.state.p23From.hash?.split('?')[1]).get('scene'):null;
  const footer=componentCaller()?'Về lịch sử linh kiện':detail()&&caller==='session-detail'?'Về phiên quét':detail()?'Về '+(family()==='warranty'?'lịch sử bảo hành':'lịch sử phiên quét'):'Về lịch sử thao tác';
  root.innerHTML=`<section class="p23-app" data-panel="P23.${scene==='warranty'?'S01':scene==='warranty-detail'?'S02':scene==='sessions'?'S03':'S04'}"><header class="p08-header"><button data-p23="back" aria-label="${footer}">${icon('back')}</button><h1 tabindex="-1">${names[scene]}</h1></header>${detail()?(family()==='sessions'?`<div class="p23-detail-toolbar"><span>Thông tin phiên quét</span>${reloadButton()}</div>`:''):controls()}<div class="p23-scroll">${content()}</div><footer class="p23-footer"><button data-p23="back">${footer}</button></footer></section>`;
  decorateControls();animateFilter();renderedHash=location.hash;sync();const v=views[viewKey()];if(restore&&v){restorePosition(v);restoreFocus(v.focus,{fallback:true});}else if(focus)root.querySelector('h1')?.focus({preventScroll:true});onSize();
 }
 function refresh(){timer=null;if(!allowed()||detail())return;if(occupied()||composing){deferred=refresh;return;}paintSource({resetScroll:true});save();}
 function cancel(){generation++;abort?.abort();clearTimeout(readTimer);if(source.issue==='loading')source={...source,issue:'interrupted'};if(source.kind==='loading')source={kind:'unavailable',items:[]};}
 async function load(preserve=true){
  if(!allowed()||occupied()||source.kind==='loading'||source.issue==='loading')return;
  const token=++generation,scope=identity,warehouseId=getState().session.warehouse.id,previous=source,requestedMode=mode,outcome=preserve?review.querySelector('[data-p23-outcome]').value:'ready';
  const c=new AbortController();abort=c;remember();source=preserve&&previous.kind==='ready'?{...previous,issue:'loading'}:{kind:'loading',items:[]};paintSource({resetScroll:!preserve});
  let next;try{const work=async()=>{if(outcome==='timeout')return new Promise(()=>{});if(mode==='slow'||outcome==='slow')await new Promise(r=>setTimeout(r,700));if(outcome==='error')throw Error('READ_ERROR');return readSessions?readSessions({warehouseId,signal:c.signal}):sessionFixture(warehouseId,requestedMode==='slow'?'fixture':requestedMode);};const response=await Promise.race([work(),new Promise((_,reject)=>{readTimer=setTimeout(()=>{c.abort();reject(Error('TIMEOUT'));},15000);c.signal.addEventListener('abort',()=>reject(Error('ABORT')),{once:true});})]);next=normalizeSessions(response,warehouseId);}catch{next={kind:'error',items:[]};}finally{if(token===generation)clearTimeout(readTimer);}
  if(!allowed()||token!==generation||scope!==identity)return;
  source=preserve&&previous.kind==='ready'&&next.kind!=='ready'?{...previous,issue:next.kind}:next;
  // Capture position/focus when repaint actually runs, after any reader closes.
  paintSource();

 }
 function picker(){if(!allowed()||modal||route.isClosing())return;clearTimeout(timer);if(timer&&!composing)refresh();const trigger=focusKey(),entry=viewKey(),scope=identity;const f=filters[family()];route.begin();modal=openHistoryPicker({screen,tools,mode:'filter',filters:f,scopeLabel:names[scene],statusOptions:[],onClose:()=>{modal=null;route.closed();},onApply:async draft=>{await route.ready();if(!allowed()||entry!==viewKey()||scope!==identity)return;filters[family()]={...f,from:draft.from,to:draft.to,status:'all'};save();render();restoreFocus(trigger,{fallback:true});}});}
 function click(e){if(!allowed()||occupied())return;const b=e.target.closest('.p23-app button');if(!b||b.disabled||b.getAttribute('aria-disabled')==='true')return;if(b.dataset.p23Entity){viewed[family()]=b.dataset.p23Entity;navigate(family()==='warranty'?'warranty-detail':'session-detail',b.dataset.p23Entity);return;}if(b.dataset.p23Type){filters[family()].type=b.dataset.p23Type;save();render();root.querySelector(`[data-p23-type="${CSS.escape(b.dataset.p23Type)}"]`)?.focus({preventScroll:true});return;}if(b.dataset.p23==='back')back();if(b.dataset.p23==='filter')picker();if(b.dataset.p23==='clear-query'){clearTimeout(timer);filters[family()].q='';root.querySelector('#p23-search').value='';refresh();root.querySelector('#p23-search').focus({preventScroll:true});return;}if(b.dataset.p23==='clear'){filters[family()]=clearHistoryConditions(filters[family()]);save();render();root.querySelector('#p23-search')?.focus();}if(b.dataset.p23==='reload')void load();if(['related-case','related-receipt'].includes(b.dataset.p23)){const r=findExact(source.items,entity),links=source.kind==='ready'?sessionLinks(r,warrantyRows(),getReceipts(),getState().session.warehouse.id):{};if(b.dataset.p23==='related-case'&&links.caseId)navigate('warranty-detail',links.caseId);if(b.dataset.p23==='related-receipt'&&links.receiptId){remember();save();onComponents(links.caseId,links.receiptId);}}if(b.dataset.p23==='components'&&findExact(warrantyRows(),entity)){if(componentCaller()){back();return;}remember();save();onComponents(entity);}}
 function input(e){if(!allowed()||e.target.id!=='p23-search')return;filters[family()].q=e.target.value;clearTimeout(timer);if(!composing)timer=setTimeout(refresh,250);}
 function composition(e){if(!allowed()||e.target.id!=='p23-search'||!e.target.isConnected)return;composing=e.type==='compositionstart';if(composing)clearTimeout(timer);else{if(deferred&&!occupied()){const fn=deferred;deferred=null;fn();}input(e);}}
 function key(e){if(!allowed())return;if(e.target.id==='p23-search'&&e.key==='Enter'&&!e.isComposing&&!composing){e.preventDefault();clearTimeout(timer);refresh();}const b=e.target.closest('[data-p23-type]');if(b&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=[...root.querySelectorAll('[data-p23-type]')],i=tabs.indexOf(b);tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length].click();}}
 function pickerNav(e){if(route.navigation(()=>modal?.close(),()=>!!modal)){e.stopImmediatePropagation();if(deferred&&allowed()&&!composing&&!occupied()){const fn=deferred;deferred=null;fn();}}}
 const observer=new MutationObserver(()=>{if(occupied())motion.cancel();if(deferred&&allowed()&&!composing&&!occupied()){const fn=deferred;deferred=null;fn();}});observer.observe(screen,{childList:true,subtree:true});
 for(const [name,fn]of [['click',click],['input',input],['keydown',key],['compositionstart',composition],['compositionend',composition]])root.addEventListener(name,fn);
 window.addEventListener('popstate',pickerNav,true);window.addEventListener('hashchange',pickerNav,true);
 review.querySelector('[data-p23-source]').onchange=e=>{if(!allowed()||occupied())return;cancel();mode=e.target.value;viewed.sessions=null;void load(false);};
 function hide(){motion.hide();cancelRestore();remember();active=false;cancel();clearTimeout(timer);composing=false;deferred=null;modal?.close({restoreFocus:false});review.hidden=true;renderedHash='';}
 return {routeKey:()=>`warranty-session:${scene}:${detail()?entity:''}`,setMotionMode:value=>motion.setMode(value),cancelMotion:()=>motion.cancel(),openFromComponents(caseId){const scope=historyScope(getState()),from=location.hash,q=new URLSearchParams(from.split('?')[1]);if(disposed||!scope||occupied()||!from.startsWith('#p02/component-history?')||q.get('case')!==caseId||!findExact(warrantyRows(),caseId))return false;const token=crypto.randomUUID(),target='#p02/history?'+new URLSearchParams({scene:'warranty-detail',case:caseId});componentCallers.set(token,{scope,from,target,caseId});onNavigate(target,{p24CaseCaller:token});return true;},show(){const next=historyScope(getState());if(!next)return;if(identity&&next!==identity){cancel();filters={warranty:newFilters(),sessions:newFilters()};views={};viewed={warranty:null,sessions:null};source={kind:'unavailable',items:[]};mode='unavailable';review.querySelector('[data-p23-source]').value=mode;}identity=next;active=true;motion.activate();backPending=false;review.hidden=false;if(renderedHash===location.hash&&root.querySelector('.p23-app'))return;remember();cancel();const q=new URLSearchParams(location.hash.split('?')[1]);scene=Object.hasOwn(names,q.get('scene'))?q.get('scene'):'warranty';entity=q.get(scene==='warranty-detail'?'case':'session')||'';const saved=history.state?.p23;if(saved?.journey===journey){filters=structuredClone(saved.filters);views={...views,...saved.views};}for(const f of Object.values(filters))if(validateQueryRange(f)){f.from='';f.to='';}motion.seed(filterKey());render({restore:true,focus:true});},hide,dispose(){hide();motion.dispose();disposed=true;componentCallers.clear();observer.disconnect();route.dispose();review.remove();for(const [name,fn]of [['click',click],['input',input],['keydown',key],['compositionstart',composition],['compositionend',composition]])root.removeEventListener(name,fn);window.removeEventListener('popstate',pickerNav,true);window.removeEventListener('hashchange',pickerNav,true);}};
}
