import {createStatusAnnouncer} from '../shared/status-announcer.mjs';
import {createDataRead,listDataState} from '../data-states/model.mjs';
import {dataStateView} from '../data-states/view.mjs';
import {flowProgress} from '../shared/flow-guidance.mjs';
import {isTextTruncated} from '../shared/readable-text.mjs';
import {TYPES,STATUSES,initialFilters,selectDocuments,mergeDocuments,totals,selectLines,documentEvents,creationErrors} from './document-model.mjs';
import {INBOUND_SUPPLIERS} from '../inbound/catalogue.mjs';
import {HOME_ICONS} from '../home/icons.mjs';
import {LOOKUP_ICONS} from '../lookup/icons.mjs';
import {INBOUND_ICONS} from '../inbound/icons.mjs';
import {DIALOG_ICONS} from '../scanner-dialogs/icons.mjs';
import {openHistoryPicker} from '../history/history-picker.mjs';
import {openChoiceDialog} from '../shared/choice-dialog.mjs';
import {openActionDialog} from '../shared/action-dialog.mjs';
import {createDialogRoute} from '../shared/dialog-route.mjs';
import {openAppModal} from '../shared/app-modal.mjs';
import {historyControls,historySearch,countBadge} from '../history/history-controls.mjs';
import {documentProgress} from './document-progress.mjs';
import {PROFILE_ICONS} from '../profile/icons.mjs';
import {sessionGuard} from '../home/home-flow.mjs';
const esc=v=>String(v??'Chưa có dữ liệu').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const glyphs={check:PROFILE_ICONS.check,...HOME_ICONS,...DIALOG_ICONS,...INBOUND_ICONS,...LOOKUP_ICONS,copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v12h5"/>'};
const icon=n=>`<svg class="p12-icon" viewBox="0 0 24 24" aria-hidden="true">${glyphs[n]||glyphs.document}</svg>`;
const controlIcon=n=>icon(n).replace('p12-icon','p08-icon');
const glyph={inbound:'down',outbound:'up',warranty:'tool'};
const tile=(t,size='lg')=>`<span class="hn-operation-icon" data-hn-operation="${t}" data-size="${size}" aria-hidden="true">${icon(glyph[t]||'document')}</span>`;
const date=d=>d?d.split('-').reverse().join('/'):'Chưa có dữ liệu';
const badge=r=>`<span class="p12-badge" data-status="${r.status}">${STATUSES[r.status]}</span>`;
const button=(a,label,cls='p12-link',attrs='')=>`<button type="button" class="${cls}" data-p12="${a}" ${attrs}>${label}</button>`;
const empty=(title,copy)=>`<div class="p12-empty">${tile('documents')}<h2>${title}</h2><p>${copy}</p></div>`;

export function mountDocuments({root,screen,tools,getState,onHome,onSize,onCreate,getPending,onCase,getRecorded=()=>[],getDrafts=()=>[],supplierHistory,readList=null,onSystemError=()=>false,onAttachments}){
 let active=false,disposed=false,panel=1,docId=null,tab='info',query='',filters=initialFilters(),scenario='ready',modal=null,afterDialog=null,renderedHash='',renderedEntry='',busy=false,attachmentRequest=null,attachmentFileId=null;
 let dialogFocus=null;
 let readOnlyPreview=false,rendering=false,searchTimer=null,searchPending=false,composing=false,hasRead=false;
 const announcement=createStatusAnnouncer({getScreen:()=>screen,isActive:()=>active&&!disposed&&panel===1,key:'p16-data'});
 function announceData(){const {kind,rows}=listState();announcement.say(({loading:'Đang tải chứng từ.',searching:'Đang tìm chứng từ.',refreshing:'Đang cập nhật. Giữ danh sách đã tải.',empty:'Chưa có chứng từ trong phạm vi được xem.','no-results':'Không tìm thấy chứng từ phù hợp.',error:'Không tải được dữ liệu. Có thể thử lại.',stale:'Chưa cập nhật được dữ liệu. Đang hiển thị danh sách đã tải trước đó.',ready:`Đã tải ${rows.length} kết quả chứng từ.`})[kind]);}
 let kpiMode=false,recentMode=false,normalFilters=initialFilters(),backPending=false;
 function saveListFilters(){if(panel!==1)return;if(recentMode)history.replaceState({...history.state,p12RecentFilters:{...filters}},'',location.hash);else if(kpiMode)history.replaceState({...history.state,p12KpiFilters:{...filters}},'',location.hash);else normalFilters={...filters};}
 let form={type:'inbound',supplierId:INBOUND_SUPPLIERS[0].id,note:''},errors={};
 const documentRows=()=>mergeDocuments(getRecorded());
 const readDocument=id=>documentRows().find(r=>r.id===id)||null;
 const queries=new Map();
 const previewObserver=new ResizeObserver(()=>syncTextPreviews());
 const positions=new Map(),dialogRoute=createDialogRoute({history,location,key:'hnDocumentsDialog'});
 const review=document.createElement('section');review.className='p12-tools';review.hidden=true;
 review.innerHTML='<details><summary>P12 · Chứng từ · r10</summary><p>Dữ liệu kiểm thử sát vận hành được user cho phép, không phải dữ liệu WMS. 24 chứng từ có sản phẩm, serial, lịch sử; hồ sơ bảo hành đọc nguồn P09 dùng chung. Phiếu đã gửi từ P04/P05 được hợp nhất theo ID. Tệp PDF được tạo từ cùng dữ liệu; nguồn gốc chỉ ghi ở công cụ kiểm thử và tài liệu bàn giao, không gắn badge trong app. PN-0010 có ghi chú dài để kiểm tra Xem đầy đủ. Reload khôi phục nguồn ban đầu.</p><label>Nguồn danh sách <select id="p12-scenario"><option value="ready">Sẵn sàng</option><option value="loading">Đang tải</option><option value="empty">Rỗng</option><option value="error">Lỗi tải</option></select></label></details>';
 tools.append(review);
 const key=()=>panel===1?'list':`${panel}:${docId}:${tab}`;
 function remember(){if(active){positions.set(key(),root.querySelector('.p12-scroll')?.scrollTop||0);if(docId)queries.set(docId,query);}}
 function navigate(p,id=null,t='info'){
  if(modal||backPending||(p===panel&&id===docId&&(p===3||t===tab)))return;
  cancelAttachment();if(busy)return;
  remember();cancelSearch();dataRead.cancel();
  const sameDocument=[2,3].includes(panel)&&[2,3].includes(p)&&id===docId;
  const hash=`#p02/documents?panel=${p}${id?'&doc='+encodeURIComponent(id):''}${t!=='info'?'&tab='+t:''}`;
  if(sameDocument)history.replaceState({...history.state},'',hash);
  else history.pushState({p12:true,p12Page:{version:1,from:location.hash}},'',hash);
  show();
  if([2,3].includes(p))root.querySelector('[data-p12-tab][aria-selected=true]')?.focus({preventScroll:true});
 }
 function back(){
  if(backPending||modal)return;
  cancelAttachment();if(busy)return;
  if(panel===1){onHome();return;}
  remember();
  if(history.state?.p12Page?.version===1){backPending=true;history.back();return;}
  // Legacy tab entries / a direct deep link have no verified caller. Return to
  // the list in place; never walk an unknown chain of old tab history entries.
  history.replaceState({p12:true},'','#p02/documents');show();
 }

 function close(){modal?.close();}
 function rememberDialogFocus(){
  const node=document.activeElement;if(!root.contains(node)){dialogFocus=null;return;}
  const attr=node.id?'id':['data-p12','data-p12-file','data-p12-download','data-p12-event-more','data-p12-line'].find(a=>node.hasAttribute(a));
  const scope=node.closest('.p16-actions')?'.p16-actions ':node.closest('.p12-list-controls')?'.p12-list-controls ':'';
  dialogFocus={node,selector:attr?scope+`[${attr}="${CSS.escape(node.getAttribute(attr))}"]`:null};
 }
 function restoreDialogFocus(saved){
  if(screen.querySelector('.app-modal-host')||!saved)return;
  const target=saved.node?.isConnected?saved.node:saved.selector?root.querySelector(saved.selector):null;
  if(target&&!target.hidden)target.focus({preventScroll:true});
  else root.querySelector('#p12-query,h1')?.focus({preventScroll:true});
 }

 function modalClosed(){modal=null;dialogRoute.closed();const task=afterDialog,saved=dialogFocus;afterDialog=null;dialogFocus=null;void dialogRoute.ready().then(()=>{if(!active||disposed)return;if(task)task();else restoreDialogFocus(saved);});}
 function inform(title,message,action=null,label='Đã hiểu',cancel=null){if(modal||!active)return;rememberDialogFocus();dialogRoute.begin();modal=openActionDialog({screen,tools,title,message,confirmLabel:label,cancelLabel:cancel,className:'p12-dialog',onConfirm:()=>afterDialog=action,onClose:modalClosed});}
 function picker(mode){if(modal)return;rememberDialogFocus();dialogRoute.begin();modal=openHistoryPicker({screen,tools,mode,filters,filterTitle:'Bộ lọc chứng từ',sortTitle:'Sắp xếp chứng từ',day:'',scopeLabel:'Chứng từ · '+(TYPES[filters.type]||'Tất cả'),statusOptions:Object.entries(STATUSES).filter(([s])=>documentRows().some(r=>r.status===s&&(filters.type==='all'||r.type===filters.type))),onClose:modalClosed,onApply:value=>{filters={...value,q:filters.q};positions.set('list',0);render();}});}
 const canCreate=()=>!readOnlyPreview&&!sessionGuard(getState())&&getState().session?.warehouse?.active===true;
 const readScope=()=>({actor:getState().session?.actor?.id,warehouse:getState().session?.warehouse?.id});
 function readPreview({signal}){
  if(scenario==='loading')return new Promise((resolve,reject)=>{const timer=setTimeout(()=>resolve(documentRows()),8000);signal.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'));},{once:true});});
  if(scenario==='error')throw new Error('Preview read failed');
  if(scenario==='empty')return [];
  if(scenario==='null')return null;
  return documentRows();
 }
 const dataRead=createDataRead({read:readList||readPreview,onChange:()=>{if(!rendering)refreshData();},onError:error=>{if(active&&!disposed)onSystemError(error,{read:async()=>{if(await loadList())return {kind:'verified'};throw dataRead.snapshot().error||new Error('Read unavailable');},intent:'read'});}});
 function cancelSearch(){clearTimeout(searchTimer);searchTimer=null;searchPending=false;}
 function loadList(options){if(!active||disposed||panel!==1)return;cancelSearch();return dataRead.load({scope:readScope(),filters:{...filters}},options);}
 function listState(){
  const snapshot=searchPending?{status:'loading',rows:null,error:null}:dataRead.snapshot();
  const rows=snapshot.rows?selectDocuments(filters,snapshot.rows):[];
  if(snapshot.status==='ready')hasRead=true;
  const kind=listDataState(snapshot,rows);
  return {snapshot,rows,kind:searchPending||(hasRead&&kind==='loading'&&scenario!=='loading')?'searching':kind};
 }
 function scanAvailable(){const s=listState().snapshot;return !searchPending&&Array.isArray(s.rows);}
 function syncScan(){
  const scan=root.querySelector('.p12-list-controls [data-p12=scan]');if(!scan)return;
  const available=scanAvailable();scan.setAttribute('aria-disabled',String(!available));
  scan.title=available?'Tìm chứng từ bằng mã':'Danh sách chưa sẵn sàng để tìm bằng mã';
  scan.setAttribute('aria-describedby','p16-scan-help');
  root.querySelector('#p16-scan-help')?.remove();
  {const hint=document.createElement('p');hint.id='p16-scan-help';hint.className='p16-scan-help';hint.textContent=available?'':'Chờ danh sách tải xong để tìm bằng mã.';scan.closest('.p12-list-controls').append(hint);}
  if(available)scan.removeAttribute('aria-describedby');
 }
 function scheduleSearch(){
  cancelSearch();dataRead.cancel();searchPending=true;refreshData();
  if(!composing)searchTimer=setTimeout(()=>void loadList(),250);
 }
 function composition(e){if(e.target.id!=='p12-query')return;composing=e.type==='compositionstart';if(composing){cancelSearch();dataRead.cancel();searchPending=true;}else scheduleSearch();}

 function refreshData(){
  if(!active||disposed||panel!==1)return;
  const target=root.querySelector('.p12-records');if(!target)return;
  const scroll=root.querySelector('.p12-scroll'),y=scroll.scrollTop,rect=scroll.getBoundingClientRect(),scale=rect.height/scroll.clientHeight;
  const anchor=[...target.querySelectorAll('[data-p12-doc]')].find(e=>e.getBoundingClientRect().bottom>rect.top);
  const anchorId=anchor?.dataset.p12Doc,offset=anchor?anchor.getBoundingClientRect().top-rect.top:0,focusedId=document.activeElement?.dataset?.p12Doc;
  const focusedAction=document.activeElement?.dataset?.p12;
  target.innerHTML=listRows();target.setAttribute('aria-busy',String(listState().snapshot.status==='loading'));refreshResultCount();scroll.scrollTop=y;
  const same=anchorId&&target.querySelector(`[data-p12-doc="${CSS.escape(anchorId)}"]`);if(same&&scale>0)scroll.scrollTop+=(same.getBoundingClientRect().top-scroll.getBoundingClientRect().top-offset)/scale;
  if(focusedId&&!modal){const row=target.querySelector(`[data-p12-doc="${CSS.escape(focusedId)}"]`);(row||target).focus({preventScroll:true});}
  if(!modal&&focusedAction==='retry'&&!root.contains(document.activeElement))target.focus({preventScroll:true});
  observeTextPreviews();announceData();
 }
 function listRows(){
  const {snapshot,rows,kind}=listState();
  const state=dataStateView({kind,query:filters.q,canCreate:canCreate(),errorCode:snapshot.error?.code,filters,types:TYPES,statuses:STATUSES});
  return state+(['ready','refreshing','stale'].includes(kind)?rows.map(r=>`<button type="button" class="p12-record" data-p12-doc="${esc(r.id)}">${tile(r.type)}<span class="p12-record-copy"><strong>${esc(r.number)}</strong><span>${TYPES[r.type]}</span><small>${esc(r.partner)}</small></span><span class="p12-record-meta"><time>${date(r.day)} ${esc(r.time)}</time>${badge(r)}</span>${icon('chevron')}</button>`).join(''):'');
 }
 function search(value,id,placeholder){return `<div class="p12-controls">${historySearch({value,id,placeholder,icon:controlIcon,namespace:'p12',action:'scan',actionLabel:'Tìm sản phẩm bằng mã'})}</div>`;}

 function listControls(){const {snapshot,rows}=listState();return historyControls({filters,tabs:Object.entries(TYPES),statuses:STATUSES,count:rows.length,ready:snapshot.status==='ready',placeholder:'Tìm mã chứng từ, loại, đối tác…',icon:controlIcon,namespace:'p12',inputId:'p12-query',scopeName:'chứng từ',extraAction:{action:'scan',label:'Tìm chứng từ bằng mã',icon:'scan'}});}
 function list(){return `<div class="p12-records" role="region" tabindex="-1" aria-label="Danh sách chứng từ" aria-busy="${dataRead.snapshot().status==='loading'}">${listRows()}</div>`;}
 function refreshResultCount(){
  // Update content in place: pending reads must not detach focused toolbar buttons
  // or the original trigger while its dialog is open.
  const template=document.createElement('template');template.innerHTML=listControls();
  const next=template.content.querySelector('.p08-results-toolbar'),current=root.querySelector('.p08-results-toolbar');
  if(!current||!next)return;
  const oldCount=current.querySelector('.p08-result-count'),newCount=next.querySelector('.p08-result-count');
  if(oldCount.innerHTML!==newCount.innerHTML)oldCount.innerHTML=newCount.innerHTML;
  const actions=current.querySelector('.p08-toolbar-actions'),desired=next.querySelector('.p08-toolbar-actions');
  for(const button of [...actions.children])if(![...desired.children].some(e=>e.dataset.p12===button.dataset.p12)){
   const focused=button===document.activeElement;button.remove();if(focused&&!modal)root.querySelector('#p12-query')?.focus({preventScroll:true});
  }
  for(const button of [...desired.children]){
   const existing=[...actions.children].find(e=>e.dataset.p12===button.dataset.p12);
   if(existing){if(existing.innerHTML!==button.innerHTML)existing.innerHTML=button.innerHTML;}
   else actions.insertBefore(button,actions.querySelector('[data-p12=sort]'));
  }
  syncScan();
 }

 const context=r=>`<section class="p12-context">${tile(r.type)}<div><h2>${esc(r.number)}</h2><p>${TYPES[r.type]}</p><time>${date(r.day)} ${esc(r.time)}</time></div>${badge(r)}</section>`;
 const row=(label,value,extra='')=>`<div class="p12-kv"><dt>${label}</dt><dd>${esc(value)}${extra}</dd></div>`;
 function fileRows(r){return `<div class="p12-files">${r.attachments.map(f=>`<div class="p12-file"><span class="p12-pdf">${icon('document')}<small>PDF</small></span><button type="button" class="p12-file-name" data-p12-file="${esc(f.id)}"><strong title="${esc(f.name)}">${esc(f.name)}</strong><small class="p12-file-meta">PDF · ${esc(f.size)} · ${f.pages||1} trang</small></button><button type="button" class="p12-download" data-p12-download="${esc(f.id)}" aria-label="Tải ${esc(f.name)}" title="Tải về máy">${icon('down')}</button></div>`).join('')}</div>`;}
 function detailEmpty(title,copy){return `<div class="p12-detail-empty">${tile('documents')}<strong>${title}</strong><p>${copy}</p></div>`;}
 function files(r){return r.attachments?.length?`${onAttachments?button('attachments','Tệp và tác vụ tải lên →','p12-link'):''}<div class="p12-section-heading"><h2>Tài liệu đính kèm</h2>${countBadge(r.attachments.length,'tệp')}</div><p class="p12-file-help">Chọn tên tệp để xem. Nút mũi tên tải PDF về máy.</p>${fileRows(r)}`:r.attachments?detailEmpty('Chưa có tài liệu đính kèm',`Chứng từ ${esc(r.number)} chưa có tệp để xem hoặc tải.`):detailEmpty('Chưa tải được tài liệu','Nguồn tài liệu chưa khả dụng. Thông tin chứng từ vẫn được giữ.');}
 function detailTabs(r){const activeTab=panel===3?'products':tab;return `<div class="p12-tabs hn-counted-tabs" role="tablist" aria-label="Chi tiết chứng từ">${[['info','Thông tin',null],['products','Sản phẩm',r.lines?.length??'—'],['files','Tài liệu',r.attachments?.length??'—'],['events','Lịch sử',null]].map(([k,label,n])=>`<button type="button" role="tab" id="p12-tab-${k}" aria-controls="p12-tab-content" aria-selected="${activeTab===k}" tabindex="${activeTab===k?0:-1}" data-p12-tab="${k}"><span>${label}</span>${n!==null?`<span class="hn-tab-count" aria-label="${n==='—'?'Chưa có dữ liệu':n+(k==='products'?' dòng sản phẩm':' tệp')}">${n}</span>`:''}</button>`).join('')}</div>`;}
 function noteCard(r){const text=typeof r.note==='string'&&r.note.trim()?r.note.trim():'Chưa có ghi chú.';return `<section class="p12-note-card" aria-labelledby="p12-note-title"><div class="p12-note-heading"><h3 id="p12-note-title">Ghi chú</h3>${button('read-note','Xem đầy đủ','p12-text-more','data-preview-for="note" aria-haspopup="dialog" aria-label="Xem đầy đủ ghi chú" hidden')}</div><p class="p12-text-excerpt p12-note-preview" data-preview-key="note">${esc(text)}</p></section>`;}
 function eventDescription(e){return `<div class="p12-event-copy"><p class="p12-event-description p12-text-excerpt" data-preview-key="${esc(e.id)}">${esc(e.description)}</p><button type="button" class="p12-text-more" data-p12-event-more="${esc(e.id)}" data-preview-for="${esc(e.id)}" aria-haspopup="dialog" aria-label="Xem đầy đủ mô tả ${esc(e.label)}" hidden>Xem đầy đủ</button></div>`;}
 function syncTextPreviews(){if(!active||disposed)return;const buttons=[...root.querySelectorAll('[data-preview-for]')];for(const text of root.querySelectorAll('[data-preview-key]')){const truncated=isTextTruncated(text),button=buttons.find(b=>b.dataset.previewFor===text.dataset.previewKey);text.dataset.truncated=String(truncated);if(button)button.hidden=!truncated;}}
 function observeTextPreviews(){previewObserver.disconnect();for(const text of root.querySelectorAll('[data-preview-key]'))previewObserver.observe(text);syncTextPreviews();}
 function historyContent(r){
  const events=documentEvents(r),progress=documentProgress(r,events);
  const summary=`<section class="p12-progress" data-tone="${progress.tone}" aria-label="Tiến trình chứng từ">${icon(progress.complete?'check':progress.tone==='warning'?'clock':'document')}<div><h3>${esc(progress.title)}</h3><p>${esc(progress.description)}</p></div></section>`;
  return `<div class="p12-section-heading"><h2>Lịch sử chứng từ</h2>${countBadge(events?.length??'—','sự kiện')}</div>${summary}`+(events?.length?`<ol class="p12-timeline">${events.map((e,i)=>{const step=progress.events[i];return `<li data-event-id="${esc(e.id)}" data-tone="${step.tone}" ${step.id===progress.currentEventId&&!progress.complete?'aria-current="step"':''}><span class="p12-event-marker" aria-hidden="true">${step.tone==='success'?icon('check'):step.tone==='warning'?icon('clock'):''}</span><div><div class="p12-event-heading"><strong>${esc(e.label)}</strong>${step.label?`<span class="p12-event-state">${step.label}</span>`:''}</div><time>${date(e.day||r.day)}${e.time?' · '+esc(e.time):''}</time><small>${esc(e.actor)}</small>${e.description?eventDescription(e):''}</div></li>`;}).join('')}</ol>`:detailEmpty(events?'Chưa có sự kiện':'Chưa có dữ liệu lịch sử',events?'Chứng từ chưa có hoạt động được ghi nhận.':'Nguồn sự kiện của chứng từ này chưa khả dụng.'));
 }

 function detail(r){return tab==='files'?files(r):tab==='events'?historyContent(r):`<h2 class="p12-section-title">Thông tin chung</h2><dl class="p12-info">${row('Mã chứng từ',r.number,button('copy',icon('copy'),'p12-copy','aria-label="Sao chép mã chứng từ"'))}${row('Loại chứng từ',TYPES[r.type])}${row('Kho',r.warehouse,icon('lock'))}${row(r.type==='inbound'?'Nhà cung cấp':'Đối tác',r.partner)}${row('Ngày tạo',date(r.day)+' '+r.time)}${row('Người tạo',r.actor)}<div class="p12-kv"><dt>Trạng thái</dt><dd>${badge(r)}</dd></div></dl>${noteCard(r)}<section class="p12-attachments-section"><div class="p12-section-row"><h2>Tài liệu đính kèm${r.attachments?' ('+r.attachments.length+')':''}</h2>${r.attachments?.length?button('files','Xem tất cả '+icon('arrow')):''}</div>${r.attachments?.length?fileRows(r):r.attachments?'<p class="p12-no-files">Chứng từ chưa có tài liệu đính kèm.</p>':detailEmpty('Chưa tải được tài liệu','Nguồn tài liệu chưa khả dụng.')}</section>`;}
 function productCount(r){return countBadge(r.lines?selectLines(r.lines,query).length:'—',query.trim()?'dòng phù hợp':'dòng');}
 function products(r){const total=totals(r.lines);return `<div class="p12-section-heading"><h2>Sản phẩm</h2><span class="p12-product-count" role="status">${productCount(r)}</span></div>`+search(query,'p12-product-query','Tìm SKU, serial, tên sản phẩm…')+`<div class="p12-totals"><div><span>Tổng số sản phẩm</span><strong>${total.quantity??'—'}</strong></div><div><span>Số SKU</span><strong>${total.skuCount??'—'}</strong></div></div><div class="p12-products">${productRows(r)}</div>`;}
 function productRows(r){const rows=selectLines(r.lines,query);return !r.lines?empty('Chưa có dữ liệu sản phẩm','Chưa tải được các dòng của chứng từ này.'):!rows.length?empty('Không có sản phẩm phù hợp','Thử tìm theo mã SKU hoặc tên sản phẩm.'):rows.map(l=>`<button type="button" class="p12-product" data-p12-line="${esc(l.id)}">${l.image?`<img src="${esc(l.image)}" alt="Ảnh đóng gói minh họa">`:`<span class="p12-product-placeholder">${icon(l.sku==='DS2208'?'scan':'box')}</span>`}<span class="p12-product-copy"><strong title="${esc(l.name)}">${esc(l.name)}</strong><span>${esc(l.sku)}</span><small>${l.serialCount??'Chưa rõ số'} serial</small></span><span class="p12-qty"><small>${r.type==='warranty'?'Số lượng':'SL '+(r.type==='outbound'?'xuất':'nhập')}</small><strong>${l.quantity??'—'}</strong><small>${esc(l.unit)}</small></span>${icon('chevron')}</button>`).join('');}
 function draftCards(){const drafts=getDrafts();return drafts.length?`<section class="p12-drafts" aria-label="Phiếu đang làm"><h2>Tiếp tục công việc</h2>${drafts.map(s=>`<div class="p12-draft" data-draft-id="${esc(s.document.documentId)}"><div><strong>${esc(s.document.number)} · ${TYPES[s.type]}</strong><p>${s.unknown?'Chưa xác định kết quả gửi · Cần đối chiếu':s.busy?'Đang xử lý yêu cầu':s.outcome==='not-recorded'?'Đã xác minh chưa ghi nhận · Giữ lần gửi cũ':`Bước ${s.step}/3 · ${s.quantity} sản phẩm đã thêm`}</p></div><button type="button" data-p12-resume="${s.type}" data-resume-id="${esc(s.document.documentId)}">${s.unknown?'Đối chiếu phiếu':'Tiếp tục phiếu'} ${icon('arrow')}</button></div>`).join('')}</section>`:'';}
 function resumeDraft(type,id){
  if(!canCreate())return inform('Không có quyền thao tác','Tài khoản hiện tại chỉ được xem chứng từ.');
  const denied=sessionGuard(getState());if(denied)return inform('Chưa thể tiếp tục',denied);
  const s=getDrafts().find(d=>d.type===type&&d.document.documentId===id);
  if(!s){render();return inform('Phiếu đã thay đổi','Không còn phiếu đang làm tương ứng. Kiểm tra lại danh sách chứng từ.');}
  onCreate({...form,type,resumeId:id},true);
 }
 function create(){
  const supplier=INBOUND_SUPPLIERS.find(s=>s.id===form.supplierId);
  return `${draftCards()}<section class="p12-type-section" aria-labelledby="p12-type-title"><h2 id="p12-type-title">Loại chứng từ</h2><div class="p12-create-types" aria-label="Chọn nghiệp vụ">${Object.entries(TYPES).map(([t,l])=>`<button type="button" data-p12-create-type="${t}" aria-pressed="${t==='inbound'}" ${t!=='inbound'?`aria-label="Mở ${t==='outbound'?'tạo phiếu xuất kho':'tiếp nhận bảo hành'}"`:''}>${tile(t,'md')}${t==='inbound'?`<span class="p12-type-check" aria-hidden="true">${icon('check')}</span>`:''}<span class="p12-type-name">${l}${t!=='inbound'?icon('chevron'):''}</span></button>`).join('')}</div></section>
  <section class="p12-create-details" aria-labelledby="p12-create-title"><h2 id="p12-create-title">Thông tin phiếu</h2>
  <div class="p12-create-meta"><div class="p12-warehouse-summary"><span class="p12-meta-icon" aria-hidden="true">${icon('house')}</span><div><span id="p12-warehouse-label">Kho thực hiện</span><output id="p12-warehouse" aria-labelledby="p12-warehouse-label">${esc(getState().session.warehouse.name)}</output></div>${icon('lock')}</div><div class="p12-date-summary">${icon('calendar')}<span id="p12-date-label">Ngày chứng từ</span><output id="p12-date" aria-labelledby="p12-date-label">Cấp khi tạo phiếu</output></div></div>
  <div class="p12-field"><label id="p12-supplier-label">Nhà cung cấp <em>*</em></label>${button('supplier',icon('warehouse')+`<span id="p12-supplier-value">${esc(supplier?.name||'Chọn nhà cung cấp')}</span>`+icon('chevron'),'p12-input','id="p12-supplier" aria-haspopup="dialog" aria-labelledby="p12-supplier-label p12-supplier-value" aria-describedby="p12-supplier-error" aria-invalid="'+!!errors.supplier+'"')}<small class="p12-error" id="p12-supplier-error">${errors.supplier||''}</small></div>
  <div class="p12-field p12-note-field"><div class="p12-field-label-row"><label for="p12-note">Ghi chú</label><small>Không bắt buộc</small></div><textarea id="p12-note" maxlength="200" placeholder="Thông tin cần lưu ý khi nhận hàng…" aria-describedby="p12-note-counter p12-note-error" aria-invalid="${!!errors.note}">${esc(form.note)}</textarea><small class="p12-counter" id="p12-note-counter">${form.note.length}/200 ký tự</small><small class="p12-error" id="p12-note-error">${errors.note||''}</small></div></section>`;
 }

 function render(focus=false){
  if(active&&!disposed)saveListFilters();
  if(active&&panel===1){rendering=true;loadList();rendering=false;}
  if(!active||disposed)return;const r=readDocument(docId),isDetail=[2,3].includes(panel);screen.classList.toggle('p12-create-screen',panel===4);
  const title=['','Chứng từ','Chi tiết chứng từ','Chi tiết chứng từ','Tạo chứng từ'][panel],activeTab=panel===3?'products':tab;
  const dock=isDetail&&r?`<div class="p12-detail-dock">${context(r)}${detailTabs(r)}</div>`:'';
  const content=panel===1?list():panel===4?create():r?`${r.caseId?button('case','Mở hồ sơ bảo hành '+icon('arrow'),'p12-case-link'):''}${panel===3?products(r):detail(r)}`:empty('Không tìm thấy chứng từ','Mã định danh không có trong nguồn được cấp.');
  root.innerHTML=`<section class="p12-app" data-panel="P12.S0${panel}" data-detail="${isDetail}"><header class="p12-header">${button('back',icon('back'),'p12-back','aria-label="Quay lại"')}<h1 tabindex="-1">${title}</h1>${panel===1&&canCreate()?button('create',icon('x'),'p12-add','aria-label="Tạo chứng từ mới"'):''}</header><div class="p12-body">${panel===4?flowProgress(1):''}${dock}${panel===1?`<div class="p12-controls p12-list-controls">${listControls()}</div>`:''}<div class="p12-scroll" ${isDetail&&r?`id="p12-tab-content" role="tabpanel" tabindex="0" aria-labelledby="p12-tab-${activeTab}"`:''}>${content}</div>${panel===4?`<footer class="p12-footer">${button('continue',(form.type==='inbound'?'Tiếp tục thêm sản phẩm':form.type==='outbound'?'Tiếp tục thông tin xuất':'Tiếp nhận bảo hành')+' '+icon('arrow'),'p12-primary')}</footer>`:''}</div></section>`;
  root.querySelector('.p12-scroll').scrollTop=positions.get(key())||0;renderedHash=location.hash;renderedEntry=JSON.stringify(history.state);document.title=`P12 · ${title} · Prototype`;if(focus)root.querySelector('h1').focus({preventScroll:true});onSize();observeTextPreviews();syncAttachmentBusy();if(panel===1){syncScan();announceData();}
 }

 function customDialog(title,content,footer,onReady){
  if(modal||!active)return;rememberDialogFocus();dialogRoute.begin();const d=document.createElement('dialog');d.className='p12-detail-dialog';d.setAttribute('aria-labelledby','p12-detail-title');
  d.innerHTML=`<h2 id="p12-detail-title" title="${esc(title)}">${esc(title)}</h2><div class="app-modal-body">${content}</div><footer>${footer}</footer>`;
  modal=openAppModal({screen,tools,dialog:d,dismissOnBackdrop:false,initialFocus:'input,button',onClose:modalClosed});d.querySelector('[data-close]')?.addEventListener('click',()=>modal?.close());onReady?.(d);
 }
 function lineDetail(l){if(!l)return;const codes=l.serials||l.codes;customDialog('Chi tiết sản phẩm',`<p class="p12-full-text p12-product-fullname">${esc(l.name)}</p><p>${esc(readDocument(docId).number)} · ${esc(l.sku)}</p><p>Số lượng: <strong>${l.quantity} ${esc(l.unit)}</strong></p><h3>${l.serials?'Serial sản phẩm':'Mã đã ghi nhận'}</h3>${codes?.length?'<ol class="p12-serials">'+codes.map(c=>'<li>'+esc(c)+'</li>').join(''):'<p>Chưa có danh sách serial trong nguồn chứng từ.</p>'}`, '<button type="button" data-close>Đóng</button>');}
 function scanDialog(){
  if(panel===1&&!scanAvailable()){root.querySelector('[data-p12=scan]')?.focus({preventScroll:true});return;}
  const inProducts=panel===3;customDialog(inProducts?'Tìm sản phẩm bằng mã':'Tìm chứng từ bằng mã',`<p>${inProducts?'Nhập SKU, serial hoặc mã sản phẩm thuộc chứng từ này.':'Nhập mã chứng từ hoặc dùng máy quét bàn phím.'}</p><form id="p12-scan-form"><label for="p12-scan-code">${inProducts?'SKU / Serial / Mã sản phẩm':'Mã chứng từ'}</label><input id="p12-scan-code" autocomplete="off" autocapitalize="none" spellcheck="false" aria-describedby="p12-scan-error"><p id="p12-scan-error" class="p12-error" role="alert"></p></form>`, '<button type="button" data-close>Hủy</button><button type="submit" form="p12-scan-form">Tìm mã</button>',d=>{
   d.querySelector('form').onsubmit=e=>{e.preventDefault();const value=d.querySelector('input').value.trim(),error=d.querySelector('#p12-scan-error');let matches=[];
    if(value)matches=inProducts?(readDocument(docId)?.lines||[]).filter(l=>[l.sku,...(l.serials||[]),...(l.codes||[])].some(c=>c.toLocaleLowerCase()===value.toLocaleLowerCase())):(dataRead.snapshot().rows||[]).filter(r=>[r.id,r.number].some(c=>c.toLocaleLowerCase()===value.toLocaleLowerCase()));
    if(!matches.length){error.textContent=value?'Không tìm thấy mã trong phạm vi này. Kiểm tra mã và thử lại.':'Vui lòng nhập mã.';d.querySelector('input').setAttribute('aria-invalid','true');d.querySelector('input').focus();return;}
    afterDialog=()=>{if(inProducts){query=matches[0].sku;render();lineDetail(matches[0]);}else if(matches.length===1)navigate(2,matches[0].id);else{filters.q=matches[0].number;positions.set('list',0);render();}};modal.close();
   };
  });
 }
 function syncAttachmentBusy(){
  for(const button of root.querySelectorAll('[data-p12-download]')){
   if(!button.dataset.idleLabel)button.dataset.idleLabel=button.getAttribute('aria-label');
   const loading=!!attachmentRequest&&button.dataset.p12Download===attachmentFileId;
   button.disabled=!!attachmentRequest;button.setAttribute('aria-busy',String(loading));
   button.setAttribute('aria-label',loading?'Đang tải tài liệu. Có thể quay lại để dừng.':button.dataset.idleLabel);
   button.title=loading?'Đang tải tài liệu…':'Tải về máy';
   button.innerHTML=loading?'<span class="p12-file-spinner" aria-hidden="true"></span>':icon('down');
  }
 }
 function cancelAttachment(){if(!attachmentRequest)return;attachmentRequest.abort();attachmentRequest=null;attachmentFileId=null;busy=false;syncAttachmentBusy();}
 async function openFile(r,f,download=false){
  if(!download&&onAttachments){remember();onAttachments(r.id,f.id);return;}
  if(busy||modal)return;if(!f.url)return inform('Tài liệu chưa khả dụng','Chưa có nguồn nội dung cho tài liệu này.');
  const focusBefore=document.activeElement;const controller=new AbortController();attachmentRequest=controller;attachmentFileId=f.id;busy=true;syncAttachmentBusy();
  let timedOut=false;const timeout=setTimeout(()=>{timedOut=true;controller.abort();},15000);
  try{const response=await fetch(f.url,{signal:controller.signal});if(!response.ok)throw Error('HTTP '+response.status);const bytes=await response.arrayBuffer();if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('Not a PDF');
   if(controller.signal.aborted||!active||disposed||docId!==r.id)return;const blob=new Blob([bytes],{type:'application/pdf'});
   const save=()=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=f.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),15000);};
   if(download){save();return;}
   customDialog(f.name,`<div class="p12-document-preview">${f.name.length>45?`<p class="p12-full-text">${esc(f.name)}</p>`:''}<h3>${esc(f.title||(f.id==='b12-attachment-1'?'Biên bản kiểm đếm':'Phiếu nhập kho'))}</h3><p>${esc(r.number)} · ${esc(r.warehouse)}</p><p>${esc(r.partner)}<br>${date(r.day)} ${esc(r.time)}</p><p>${STATUSES[r.status]}</p><table><thead><tr><th>Sản phẩm / SKU</th><th>SL</th></tr></thead><tbody>${r.lines.map(l=>`<tr><td>${esc(l.name)}<br><small>${esc(l.sku)}</small></td><td>${l.quantity}</td></tr>`).join('')}</tbody></table><p>${esc(r.note)}</p>${(f.kind==='handover'||f.id==='b12-attachment-1')?r.lines.map(l=>'<p><strong>'+esc(l.sku)+'</strong><br>'+l.serials.map(esc).join('<br>')+'</p>').join(''):''}<p>Người lập: ${esc(r.actor)}</p></div>`, `<button type="button" data-close>Đóng</button><a href="${esc(f.url)}" target="_blank" rel="noopener" data-open-pdf>Mở PDF</a><button type="button" data-file-save>Tải về</button>`,d=>d.querySelector('[data-file-save]').onclick=save);
  }catch(error){if((!controller.signal.aborted||timedOut)&&active&&!disposed&&docId===r.id)inform(timedOut?'Tải tài liệu quá lâu':'Không tải được tài liệu',timedOut?'Chưa nhận được tài liệu. Bạn có thể thử lại; chứng từ vẫn được giữ nguyên.':'Vui lòng thử lại. Chứng từ và bộ lọc của bạn vẫn được giữ.');}
  finally{clearTimeout(timeout);if(attachmentRequest===controller){attachmentRequest=null;attachmentFileId=null;busy=false;syncAttachmentBusy();if(download&&!modal&&focusBefore?.isConnected&&document.activeElement===document.body)focusBefore.focus({preventScroll:true});}}
 }
 async function continueCreate({type=form.type}={}){if(busy)return;if(!canCreate())return inform('Không có quyền tạo chứng từ','Tài khoản hiện tại chưa được phép tạo chứng từ trong kho này.');const entry={...form,type};const denied=sessionGuard(getState())||(getState().session.warehouse.active!==true?'Kho tạm dừng hoặc chưa xác minh. Chưa thể tạo chứng từ.':'');if(denied)return inform('Chưa thể tiếp tục',denied);errors=creationErrors(entry);if(Object.keys(errors).length){render();root.querySelector('#p12-'+Object.keys(errors)[0])?.focus();return;}const pending=getPending(type);const launch=()=>{if(busy)return;busy=true;if(!pending&&entry.type==='inbound')supplierHistory?.use(entry.supplierId);onCreate({...entry,resumeId:pending?.documentId},!!pending);busy=false;};if(pending)return inform('Tiếp tục phiếu đang làm',`Đã có phiếu ${pending.number}. Tiếp tục giữ nguyên dữ liệu, mã phiên, phiên bản và yêu cầu hiện có; thông tin vừa nhập tại đây vẫn được giữ để xem lại.`,launch,'Tiếp tục phiếu','Hủy');launch();}
 async function onClick(e){if(!active)return;const b=e.target.closest('button');if(!b||!root.contains(b))return;
  if(b.dataset.p16Remove){
   const k=b.dataset.p16Remove;if(k==='q')filters.q='';if(k==='type')filters.type='all';if(k==='status')filters.status='all';if(k==='date'){filters.from='';filters.to='';}
   positions.set('list',0);render();(root.querySelector('[data-p16-remove]')||root.querySelector('#p12-query'))?.focus({preventScroll:true});return;
  }
  if(b.dataset.p12Resume){if(!busy&&!modal)resumeDraft(b.dataset.p12Resume,b.dataset.resumeId);return;}
  if(b.dataset.p12Doc){navigate(2,b.dataset.p12Doc);return;}
  if(b.dataset.p12Type){filters.type=b.dataset.p12Type;positions.set('list',0);render();root.querySelector(`[data-p12-type="${filters.type}"]`)?.focus();return;}
  if(b.dataset.p12CreateType){const type=b.dataset.p12CreateType;if(type!=='inbound'){void continueCreate({type});return;}form.type='inbound';errors={};render();root.querySelector('[data-p12-create-type=inbound]')?.focus();return;}
  if(b.dataset.p12Tab){navigate(b.dataset.p12Tab==='products'?3:2,docId,b.dataset.p12Tab==='products'?'info':b.dataset.p12Tab);return;}
  if(b.dataset.p12File||b.dataset.p12Download){const r=readDocument(docId),f=r?.attachments?.find(x=>x.id===(b.dataset.p12File||b.dataset.p12Download));if(f)void openFile(r,f,!!b.dataset.p12Download);return;}
  if(b.dataset.p12EventMore){const r=readDocument(docId),event=documentEvents(r)?.find(x=>x.id===b.dataset.p12EventMore);if(event)customDialog('Chi tiết hoạt động',`<p><strong>${esc(event.label)}</strong></p><p>${date(event.day||r.day)} · ${esc(event.time)} · ${esc(event.actor)}</p><div class="p12-full-text">${esc(event.description)}</div>`,'<button type="button" data-close>Đóng</button>');return;}
  if(b.dataset.p12Line){lineDetail(readDocument(docId)?.lines?.find(x=>x.id===b.dataset.p12Line));return;}
  const a=b.dataset.p12;
  if(a==='read-query')customDialog('Từ khóa tìm kiếm',`<div class="p12-full-text">${esc(filters.q)}</div>`,'<button type="button" data-close>Đóng</button>');
  if(a==='read-note'){const r=readDocument(docId);if(r)customDialog('Ghi chú · '+r.number,`<div class="p12-full-text" tabindex="0" aria-label="Nội dung ghi chú đầy đủ">${esc(r.note||'Chưa có ghi chú.')}</div>`,'<button type="button" data-close>Đóng</button>');}
  if(a==='back')back();
  if(a==='create'){if(canCreate())navigate(4);else inform('Không có quyền tạo chứng từ','Tài khoản hiện tại chưa được phép tạo chứng từ trong kho này.');}
  if(a==='files')navigate(2,docId,'files');
  if(a==='attachments'&&onAttachments&&readDocument(docId)){remember();onAttachments(docId);}
  if(a==='filter'||a==='sort')picker(a==='sort'?'sort':'filter');
  if(a==='clear'){filters=initialFilters();positions.set('list',0);render();root.querySelector('#p12-query')?.focus();}
  if(a==='retry')void loadList();
  if(a==='edit-query'){const input=root.querySelector('#p12-query');input?.focus();input?.select();}
  if(a==='scan')scanDialog();
  if(a==='case'&&onCase&&readDocument(docId)?.caseId)onCase(readDocument(docId).caseId);
  if(a==='copy'&&!busy){busy=true;const id=docId,r=readDocument(id);try{await navigator.clipboard.writeText(r.number);if(active&&docId===id)inform('Đã sao chép',`Mã ${r.number} đã được sao chép.`);}catch{if(active&&docId===id)inform('Chưa sao chép được',`Bạn có thể sao chép mã ${r.number} từ thông tin chứng từ.`);}finally{busy=false;}}
  if(a==='supplier'&&!modal){rememberDialogFocus();dialogRoute.begin();modal=openChoiceDialog({screen,tools,dismissOnBackdrop:false,title:'Nhà cung cấp',className:'p12-supplier-picker',fixedSearch:true,selectionSummary:true,prioritizeSelected:true,recentIds:supplierHistory?.read()||[],resultLabel:'nhà cung cấp',searchLabel:'Tìm nhà cung cấp',searchPlaceholder:'Nhập tên nhà cung cấp',initialFocus:'input[type=search]',options:INBOUND_SUPPLIERS,value:form.supplierId,onClose:modalClosed,onApply:id=>{form.supplierId=id;supplierHistory?.use(id);errors={};render();}});}
  if(a==='continue')void continueCreate();
 }
 function onInput(e){if(!active)return;if(e.target.id==='p12-query'){filters.q=e.target.value;saveListFilters();positions.set('list',0);root.querySelector('.p12-scroll').scrollTop=0;scheduleSearch();}if(e.target.id==='p12-product-query'){query=e.target.value;queries.set(docId,query);root.querySelector('.p12-products').innerHTML=productRows(readDocument(docId));root.querySelector('.p12-product-count').innerHTML=productCount(readDocument(docId));}if(e.target.id==='p12-note'){form.note=e.target.value;root.querySelector('.p12-counter').textContent=form.note.length+'/200 ký tự';}}
 function onKey(e){if(e.target.id==='p12-query'&&e.key==='Enter'){if(e.isComposing||composing)return;e.preventDefault();void loadList();return;}const b=e.target.closest('[data-p12-tab],[data-p12-type]');if(!b||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...b.parentElement.children],i=tabs.indexOf(b),target=tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];target.click();}

 function show(){
  if(active&&renderedHash!==location.hash)cancelAttachment();
  if(active&&renderedHash===location.hash&&renderedEntry===JSON.stringify(history.state)&&root.querySelector('.p12-app'))return;
  backPending=false;
  if(history.state?.p12From&&!history.state.p12Page)history.replaceState({...history.state,p12Page:{version:1,from:history.state.p12From}},'',location.hash);
  const previousDoc=docId,wasDetail=active&&[2,3].includes(panel);if(active&&location.hash!==renderedHash)remember();active=true;review.hidden=false;dataTools.hidden=false;
  const q=new URLSearchParams(location.hash.split('?')[1]);panel=[1,2,3,4].includes(Number(q.get('panel')))?Number(q.get('panel')):1;docId=q.get('doc');
  if(panel===1){
   const nextKpi=q.get('kpi')==='waiting';
   const nextRecent=q.get('entry')==='home-recent';
   if(nextRecent){filters={...initialFilters(),sort:'desc',...history.state?.p12RecentFilters};if(!history.state?.p12RecentFilters)positions.set('list',0);}
   else if(nextKpi){filters={...initialFilters(),status:'waiting',...history.state?.p12KpiFilters};if(!history.state?.p12KpiFilters)positions.set('list',0);}
   else if(kpiMode||recentMode){filters={...normalFilters};positions.set('list',0);}
   kpiMode=nextKpi;recentMode=nextRecent;
  }
  if(panel!==1){cancelSearch();dataRead.cancel();}
  if(panel===4&&!canCreate()){panel=1;history.replaceState({...history.state},'','#p02/documents');}
  tab=['info','products','files','events'].includes(q.get('tab'))?q.get('tab'):'info';if(panel===2&&tab==='products')panel=3;if(panel===3)tab='products';
  if(docId!==previousDoc)query=queries.get(docId)||'';
  const keepTabFocus=wasDetail&&previousDoc===docId&&[2,3].includes(panel);render(!keepTabFocus);if(wasDetail&&panel===1&&previousDoc)root.querySelector(`[data-p12-doc="${CSS.escape(previousDoc)}"]`)?.focus({preventScroll:true});if(keepTabFocus)root.querySelector('[data-p12-tab][aria-selected=true]')?.focus({preventScroll:true});
 }

 root.addEventListener('click',onClick);root.addEventListener('input',onInput);root.addEventListener('keydown',onKey);root.addEventListener('compositionstart',composition);root.addEventListener('compositionend',composition);review.querySelector('select').onchange=e=>setScenario(e.target.value);
 const dataTools=document.createElement('details');dataTools.className='p16-tools';dataTools.hidden=true;
 dataTools.innerHTML='<summary>P16 · Trạng thái dữ liệu · r03</summary><p>Fixture chỉ đọc trên nguồn P12. Loading chờ 8 giây; lỗi không tự thành công khi retry. Không kết nối WMS. Reload đặt lại fixture.</p><button type="button" data-p16-demo="loading">P16.S01 · Đang tải</button><button type="button" data-p16-demo="empty">P16.S02 · Chưa có chứng từ</button><button type="button" data-p16-demo="no-results">P16.S03 · Không tìm thấy</button><button type="button" data-p16-demo="error">P16.S04 · Lỗi tải</button><button type="button" data-p16-demo="ready">Nguồn sẵn sàng</button><button type="button" data-p16-demo="stale">Lỗi cập nhật / giữ cache</button><button type="button" data-p16-demo="null">Response null</button><button type="button" data-p16-demo="refresh">Cập nhật chậm / giữ danh sách</button><button type="button" data-p16-demo="recover">Nguồn phục hồi / giữ vị trí</button><label><input type="checkbox" id="p16-readonly"> Chỉ xem (fixture thu hẹp quyền tạo)</label>';
 tools.append(dataTools);
 function setScenario(value){
  if(!active||disposed||modal||busy)return;
    // Read-only preview updates use the same cache/context and preserve scroll.
  if(value==='refresh'||value==='recover'){scenario=value==='refresh'?'loading':'ready';review.querySelector('select').value=scenario;void loadList({force:true});return;}
  // Snapshot reset uses the controller's lifecycle; business data is never modified.
  scenario=value==='no-results'?'ready':value==='stale'?'error':value;
  if(value==='no-results')filters={...initialFilters(),q:'PN-9999'};
  if(value==='empty')filters=initialFilters();
  if(value!=='stale')dataRead.reset();
  else dataRead.cancel();
  review.querySelector('select').value=['ready','loading','empty','error'].includes(scenario)?scenario:'error';
  positions.set('list',0);panel=1;history.replaceState({...history.state},'','#p02/documents');render();
 }
 dataTools.addEventListener('click',e=>{const value=e.target.closest('[data-p16-demo]')?.dataset.p16Demo;if(value)setScenario(value);});
 dataTools.querySelector('input').onchange=e=>{readOnlyPreview=e.target.checked;if(panel===4&&!canCreate()){panel=1;history.replaceState({...history.state},'','#p02/documents');}render();};
 return {show,handleNavigation:()=>dialogRoute.navigation(close,()=>!!modal),hide(){announcement.clear();remember();cancelSearch();composing=false;dataRead.cancel();dataTools.hidden=true;previewObserver.disconnect();attachmentRequest?.abort();attachmentRequest=null;busy=false;active=false;review.hidden=true;close();screen.classList.remove('p12-create-screen');},dispose(){announcement.dispose();disposed=true;cancelSearch();dataRead.dispose();dataTools.remove();previewObserver.disconnect();attachmentRequest?.abort();attachmentRequest=null;active=false;dialogRoute.dispose();close();review.remove();root.removeEventListener('click',onClick);root.removeEventListener('input',onInput);root.removeEventListener('keydown',onKey);root.removeEventListener('compositionstart',composition);root.removeEventListener('compositionend',composition);}};
}
