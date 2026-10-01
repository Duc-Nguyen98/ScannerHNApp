import {mountLookupMotion} from './motion.mjs';
import {createLookupReadOwner} from './read-owner.mjs';
import {sessionGuard} from '../home/home-flow.mjs';
import {queryDateBounds} from '../shared/query-date-policy.mjs';
import {openHistoryPicker} from '../history/history-picker.mjs';
import {openAppModal} from '../shared/app-modal.mjs';
import {createDialogRoute} from '../shared/dialog-route.mjs';
import { createLookupFixtureAdapter } from './fixture-adapter.mjs';
import { createLookupFlow } from './lookup-flow.mjs';
import { DIALOG_ICONS } from '../scanner-dialogs/icons.mjs';
import { INBOUND_ICONS } from '../inbound/icons.mjs';
import { LOOKUP_ICONS } from './icons.mjs';
import { createActionFeedback } from '../shared/action-feedback.mjs';
const icons={...DIALOG_ICONS,...INBOUND_ICONS,...LOOKUP_ICONS};
const icon=n=>`<svg class="p06-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[n]||''}</svg>`;
const esc=x=>String(x??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const qty=x=>x==null?'—':esc(x);
const names={inbound:'Nhập kho',outbound:'Xuất kho',warranty:'Bảo hành'};
const titles=['','Tra cứu sản phẩm','Thông tin sản phẩm','Tồn kho sản phẩm','Lịch sử giao dịch'];
const stockFields=[['total','Tổng tồn'],['available','Khả dụng'],['held','Đang giữ'],['unavailable','Không khả dụng']];
export function mountLookup({root,tools,getState,onHome,onScan,onSize,onSelectProduct,onWarranty,onLocation,motionMode='auto',onPanelTransition=()=>{},adapter=createLookupFixtureAdapter()}) {
  const flow=createLookupFlow({adapter,getState});
  let active=false,disposed=false,backPending=false,composing=false;
  const feedback=createActionFeedback({getScreen:()=>root.closest('.hn-screen'),tools,isActive:()=>active&&!disposed,key:'hnP06Feedback'});
  let selectForNfc=false;
  const views=new Map();
  const selectedImages=new Map();
  let modal=null,modalEpoch=0,lastViewed=null;
  const modalRoute=createDialogRoute({history,location,key:'hnP06Picker'});
  const motion=mountLookupMotion({root,requested:motionMode,active:()=>active&&!disposed&&!sessionGuard(getState())});
  const reads=createLookupReadOwner({onCommit:kind=>{
    if(!active||disposed||sessionGuard(getState()))return;
    if(kind==='list'&&flow.snapshot().panel===1)updateResults({feedback:true});
    if(kind==='history'&&flow.snapshot().panel===4)syncHistory();
  }});
  function read(kind){
    const s=flow.snapshot(),session=getState().session;
    if(sessionGuard(getState()))return {items:[],totals:{},error:'Phiên chưa được xác nhận.'};
    const scope={actorId:session.actor.id,warehouseId:session.warehouse.id};
    const key=JSON.stringify([scope,kind,kind==='list'?[s.category,s.query]:[s.itemId,s.filters]]);
    return reads.read(kind,key,signal=>kind==='list'?adapter.search(scope,{category:s.category,query:s.query,signal}):adapter.history(scope,s.itemId,{...s.filters,signal}));
  }
  const readError=(data,kind)=>`<div class="p06-read-error" role="status"><strong>Chưa tải được ${kind==='list'?'danh sách':'lịch sử'}</strong><p>${esc(data.error)}${data.stale?' Dữ liệu đã tải được giữ bên dưới.':''}</p><button data-p06="retry-read">Thử lại</button></div>`;
  function occupied(){return !!root.closest('.hn-screen')?.querySelector('.app-modal-host,dialog[open],.p03-host:not([hidden])');}
  function closeModal(){modal?.close();}
  function modalClosed(){modal=null;modalRoute.closed();}
  function onModalNavigation(event){if(!active&&!modal&&!modalRoute.isClosing())return;if(modalRoute.navigation(closeModal,()=>!!modal))event.stopImmediatePropagation();}
  window.addEventListener('popstate',onModalNavigation,true);window.addEventListener('hashchange',onModalNavigation,true);
  let renderedKey=null;
  const viewKey=s=>`${s.panel}:${s.panel===1?'list':s.itemId}`;
  const hashFor=(panel,itemId)=>`#p02/lookup${panel===1?'':`?panel=${panel}&item=${encodeURIComponent(itemId)}`}`;
  const dateLabel=f=>!f.from&&!f.to?'Tất cả ngày':`${f.from?f.from.split('-').reverse().join('/'):'Từ đầu'} - ${f.to?f.to.split('-').reverse().join('/'):'Đến nay'}`;
  function rememberView(){
    const scroll=root.querySelector('.p06-scroll');
    if(!active||!scroll||!renderedKey)return;
    const focus=document.activeElement;
    const selector=focus?.dataset.p06Focus?`[data-p06-focus="${CSS.escape(focus.dataset.p06Focus)}"]`:focus?.hasAttribute('data-p06-recent')?`[data-p06-recent][data-p06-item="${CSS.escape(focus.dataset.p06Item)}"]`:focus?.dataset.p06?`[data-p06="${CSS.escape(focus.dataset.p06)}"]`:focus?.dataset.p06Item?`.p06-list [data-p06-item="${CSS.escape(focus.dataset.p06Item)}"]`:null;
    views.set(renderedKey,{top:scroll.scrollTop,selector:selector||views.get(renderedKey)?.selector});
    if(renderedKey==='1:list')flow.rememberScroll(scroll.scrollTop);
  }
  const review=document.createElement('details');review.className='p06-tools';review.hidden=true;
  review.innerHTML='<summary>Kịch bản kiểm tra P06 · 4 panel</summary><p><strong>DEMO — ảnh minh họa AI và dữ liệu mẫu, không phải dữ liệu WMS.</strong> Có 5 sản phẩm, 1 linh kiện, 36 giao dịch mẫu từ 01–09/09/2026. 128/36 là tổng mẫu của board, không phải số dòng đã nạp.</p><label>Dữ liệu tra cứu <select data-p06-scenario><option value="demo">Đầy đủ thông tin và lịch sử demo</option><option value="missing">Kiểm tra trường tồn bị thiếu</option><option value="read-error">Lỗi đọc dữ liệu tạm thời</option></select></label><p>HN12345–HN12349 · serial máy đen SN-XP420B-BK-0008 · serial linh kiện SN-LK-0001. HN12349 hết hàng nhưng vẫn có lịch sử. Các giao dịch là một phần lịch sử mẫu, không dùng cộng trừ để suy tồn hiện tại. Chưa kết nối camera, in tem hoặc backend.</p><pre data-p06-snapshot></pre>';
  tools.append(review);
  const image=(item,cls='',index=0)=>item.images?.[index]?`<img class="p06-image ${cls}" src="${esc(item.images[index])}" alt="${esc(item.imageLabels?.[index]||item.name+'')}">`:`<span class="p06-image p06-no-image ${cls}" role="img" aria-label="Chưa có ảnh ${esc(item.name)}">Chưa có ảnh</span>`;
  const chip=item=>`<span class="p06-chip ${item.stock.total===0?'empty':item.stock.total==null?'unknown':''}">${item.stock.total==null?'Chưa có dữ liệu':item.stock.total===0?'Hết hàng':'Còn hàng'}</span>`;
  const meta=item=>`SKU: ${esc(item.sku)} <span class="p06-divider">|</span> SN: ${esc(item.serial)}`;
  function hero(item,detail=false) {const history=flow.snapshot().panel===4;return `<div class="p06-hero ${detail?'detail':''} ${history?'history':''}">${image(item,'',detail?selectedImages.get(item.id)||0:0)}<div>${detail||history?chip(item):''}<strong>${esc(item.code)}</strong><b>${esc(item.name)}</b><p>${meta(item)}</p></div></div>`;}
  function gallery(item){return `<section class="p06-gallery"><h2>Hình ảnh sản phẩm</h2><div>${item.images?.length?item.images.map((src,index)=>`<button data-p06="image" data-p06-image="${index}" aria-label="Xem ${esc(item.imageLabels?.[index]||'Ảnh '+(index+1))}" aria-pressed="${(selectedImages.get(item.id)||0)===index}">${image(item,'',index)}</button>`).join(''):'<p>Chưa có ảnh sản phẩm.</p>'}</div></section>`;}
  function cards(){const data=read('list'),{items}=data;return (data.error?readError(data,'list'):'')+(items.length?items.map(i=>`<button class="p06-card ${lastViewed===i.id?'p06-recently-viewed':''}" data-p06-item="${esc(i.id)}">${image(i)}<span class="p06-card-copy"><span class="p06-card-top"><strong>${esc(i.code)}</strong>${chip(i)}</span><b>${esc(i.name)}</b><small>${meta(i)}</small><small>${esc(getState().session.warehouse.name)} <span class="p06-divider">|</span> Vị trí: ${esc(i.location)}</small><small>Tồn: <span class="${i.stock.total===0?'p06-red':''}">${qty(i.stock.total)}</span> <span class="p06-divider">|</span> Khả dụng: ${qty(i.stock.available)}</small></span>${icon('chevron')}</button>`).join(''):data.error||data.loading?'':'<p class="p06-empty" role="status">Không có kết quả phù hợp. Hãy kiểm tra từ khóa hoặc chọn danh mục khác.</p><button class="p06-clear-empty" data-p06="clear">Xóa từ khóa</button>');}
  function recentMarkup(){const s=flow.snapshot(),items=flow.recentItems(read('list'));if(s.query.trim()||!items.length)return '';return `<section class="p06-recents" aria-labelledby="p06-recents-title"><h2 id="p06-recents-title">Vừa xem</h2><div>${items.map(item=>`<button data-p06-recent data-p06-item="${esc(item.id)}">${image(item)}<span class="p06-recent-copy"><strong>${esc(item.code)}</strong><small>${esc(item.name)}</small></span>${icon('chevron')}</button>`).join('')}</div></section>`;}
  function list(){const s=flow.snapshot(),data=read('list');return `<div class="p06-search-row"><label class="p06-search">${icon('search')}<input id="p06-search" aria-label="Tìm mã, tên sản phẩm, SKU, Serial" placeholder="Nhập mã, tên sản phẩm, SKU, Serial..." value="${esc(s.query)}" enterkeyhint="search" autocomplete="off"><button data-p06="clear" aria-label="Xóa từ khóa tìm kiếm">${icon('x')}</button></label><button class="p06-filter" data-p06="filter" aria-label="Bộ lọc sản phẩm">${icon('filter')}</button></div><div class="p06-tabs" role="tablist" aria-label="Loại danh mục">${[['products','Sản phẩm'],['components','Linh kiện']].map(([key,title])=>`<button role="tab" id="p06-tab-${key}" aria-controls="p06-results" aria-selected="${s.category===key}" tabindex="${s.category===key?0:-1}" data-p06-category="${key}">${title} (${qty(data.totals[key])})</button>`).join('')}</div><div class="p06-recents-slot">${recentMarkup()}</div><div class="p06-search-context">${searchContext()}</div><div id="p06-results" tabindex="-1" role="tabpanel" aria-labelledby="p06-tab-${s.category}" class="p06-list">${cards()}</div>`;}
  function detail(item){return `${hero(item,true)}<div class="p06-shortcuts" aria-label="Tra cứu nhanh"><button data-p06="stock" data-p06-focus="stock-shortcut">${icon('warehouse')}<span>Xem tồn kho</span>${icon('chevron')}</button><button data-p06="history">${icon('history')}<span>Lịch sử giao dịch</span>${icon('chevron')}</button></div><div class="p06-actions"><button data-p06="scan">${icon('scan')}<span>Quét mã</span></button><button data-p06="print" disabled title="Không có quyền in tem">${icon('printer')}<span>In tem</span><small>Không có quyền</small></button><button data-p06="warranty">${icon('tool')}<span>Bảo hành</span></button></div><section class="p06-section"><h2>Thông tin cơ bản</h2><dl>${[['SKU',item.sku],['Tên sản phẩm',item.name],['Nhóm sản phẩm',item.group],['Thương hiệu',item.brand],['Đơn vị tính',item.unit],['Kho lưu trữ',getState().session.warehouse.name],['Mô tả',item.description]].map(([label,value])=>`<div><dt>${label}</dt><dd>${['Mô tả','Tên sản phẩm'].includes(label)?`<span data-hn-readable="${label}" data-hn-lines="${label==='Mô tả'?3:2}">${esc(value)}</span>`:esc(value)}${label==='Kho lưu trữ'?icon('lock'):''}</dd></div>`).join('')}</dl></section><section class="p06-section p06-stock-link"><button class="p06-section-link" data-p06="stock" data-p06-focus="stock-section"><h2>Số lượng tồn kho</h2>${icon('chevron')}</button><dl>${stockFields.map(([key,label])=>`<div><dt>${label}</dt><dd><strong>${qty(item.stock[key])}</strong></dd></div>`).join('')}</dl></section>${gallery(item)}`;}
  function stock(item){return `${hero(item)}${item.category==='components'&&onLocation?`<button class="p06-open-filter p06-location-link" data-p06="location">${icon('pin')}<span>Xem vị trí linh kiện</span>${icon('chevron')}</button>`:''}<section class="p06-warehouse"><header>${icon('house')}<div><strong>${esc(getState().session.warehouse.name)} ${icon('lock')}</strong><p>(Kho tổng)</p></div></header><div class="p06-stock-strip">${stockFields.map(([key,label])=>`<div><small>${label}</small><strong class="${key==='unavailable'?'p06-red':''} ${String(item.stock[key]??'').length>4?'p06-long-number':''}">${qty(item.stock[key])}</strong></div>`).join('')}</div></section><h2 class="p06-location-title">Tồn kho theo vị trí</h2><div class="p06-locations">${item.locations?item.locations.map(l=>`<div class="p06-location"><div>${icon('pin')}<strong>${esc(l.id)}</strong><span><b>${l.total}</b> ${esc(item.unit)}</span></div><ul>${[['available','Khả dụng'],['held','Đang giữ'],['unavailable','Không khả dụng']].map(([key,label])=>`<li class="${key}">${label} ${qty(l[key])}</li>`).join('')}</ul></div>`).join(''):'<p class="p06-empty">Chưa có nguồn tồn kho theo vị trí.</p>'}</div><p class="p06-info">${icon('alert')}<span>Tổng số liệu tồn kho hiển thị trong ${esc(getState().session.warehouse.name)} (kho tổng).</span></p>`;}
  function events(){const result=read('history');return (result.items.length?result.items.map(e=>`<div class="p06-event-wrap" data-event-id="${esc(e.id)}" data-event-signature="${esc(JSON.stringify(e))}" role="listitem" data-hn-readable-group><button class="p06-event" data-p06-event="${esc(e.id)}"><span class="p06-event-icon hn-operation-icon" data-hn-operation="${Object.hasOwn(names,e.type)?e.type:'documents'}">${icon(e.type==='warranty'?'tool':e.type==='inbound'?'down':'up')}</span><span class="p06-event-body"><span><strong>${esc(names[e.type]??e.type)}</strong><time>${e.date.split('-').reverse().join('/')} ${esc(e.time)}</time></span><small data-hn-readable="Mô tả giao dịch" data-hn-lines="3" data-hn-read-outside="true">${esc(e.description)}</small></span><span class="p06-event-result"><b class="${e.quantity<0?'p06-red':'p06-green'}">${e.quantity==null?'—':e.quantity>0?'+ '+e.quantity:e.quantity<0?'- '+Math.abs(e.quantity):'0'}</b><small>${esc(e.status)}</small></span>${icon('chevron')}</button></div>`).join(''):result.error||result.loading?'':'<p class="p06-empty" role="status">Không có giao dịch khớp bộ lọc trong dữ liệu đã tải.</p><button class="p06-clear-empty" data-p06="clear-filters">Xóa bộ lọc</button>');}
  function searchContext(){const s=flow.snapshot(),data=read('list');return `<p role="status" aria-live="polite">${data.loading?'Đang tìm kiếm…':data.error?'Chưa cập nhật kết quả':`${data.items.length} kết quả trong dữ liệu đã tải`}</p>${s.query?`<div class="p06-filter-chips"><span class="p06-query-chip"><span>Từ khóa</span><b data-hn-readable="Từ khóa tìm kiếm" data-hn-lines="2">${esc(s.query)}</b></span>${data.items.length?'<button data-p06="clear">Xóa từ khóa</button>':''}</div>`:''}<small>${data.loading?'Đang chờ kết quả.':data.error?'Thử tải lại để cập nhật kết quả.':!data.items.length?'Sửa từ khóa hoặc chuyển danh mục.':`Enter để ${data.items.length===1&&s.query.trim()?'mở kết quả duy nhất':'tới danh sách kết quả'}.`}</small>`;}
  function historyMarkup(item){const f=flow.snapshot().filters,result=read('history'),filtered=f.type!=='all'||f.from||f.to;return `${hero(item)}<button class="p06-open-filter" data-p06="dates" aria-haspopup="dialog">${icon('filter')}<span>Bộ lọc lịch sử</span>${icon('calendar')}</button><div class="p06-filter-chips" aria-label="Bộ lọc đang áp dụng"><span>${esc(names[f.type]||'Tất cả loại giao dịch')}</span><span>${dateLabel(f)}</span>${filtered?'<button data-p06="clear-filters">Xóa bộ lọc</button>':''}</div><p class="p06-result-count" role="status">${result.error?(result.stale?`${result.items.length} giao dịch đã tải trước lỗi`:'Chưa xác minh được số giao dịch'):`${result.items.length} giao dịch trong dữ liệu đã tải`}</p><div class="p06-events" role="list">${events()}</div><div class="p06-history-feedback" role="status">${historyFeedback()}</div>`;}
  function historyFeedback(){const data=read('history');return data.error?readError(data,'history'):data.loading?'Đang tải lịch sử…':'';}
  function syncHistory(){
    const container=root.querySelector('.p06-events'),scroll=root.querySelector('.p06-scroll');if(!container||!scroll)return;
    const data=read('history');root.querySelector('.p06-history-feedback').innerHTML=historyFeedback();
    // Read failures/loading never replace old records or their focus/scroll.
    if(data.error||data.loading)return;
    const top=scroll.scrollTop,rect=scroll.getBoundingClientRect();
    const anchor=[...container.querySelectorAll('[data-event-id]')].find(n=>n.getBoundingClientRect().bottom>rect.top);
    const offset=anchor?.getBoundingClientRect().top-rect.top;
    const template=document.createElement('template');template.innerHTML=events();
    const existing=new Map([...container.querySelectorAll('[data-event-id]')].map(n=>[n.dataset.eventId,n]));
    let cursor=container.firstElementChild;
    for(const fresh of [...template.content.children]){const old=existing.get(fresh.dataset.eventId),node=old||fresh;if(old&&old.dataset.eventSignature!==fresh.dataset.eventSignature){const focused=old.contains(document.activeElement);old.innerHTML=fresh.innerHTML;old.dataset.eventSignature=fresh.dataset.eventSignature;if(focused)old.querySelector('button')?.focus({preventScroll:true});}existing.delete(fresh.dataset.eventId);if(node!==cursor)container.insertBefore(node,cursor);cursor=node.nextElementSibling;}
    while(cursor){const next=cursor.nextElementSibling;cursor.remove();cursor=next;}
    for(const node of existing.values())node.remove();
    root.querySelector('.p06-result-count').textContent=`${data.items.length} giao dịch trong dữ liệu đã tải`;
    if(anchor?.isConnected)scroll.scrollTop=top+(anchor.getBoundingClientRect().top-scroll.getBoundingClientRect().top-offset)/(root.closest('.hn-screen').getBoundingClientRect().width/494);else scroll.scrollTop=top;
    updateSnapshot();
  }
  function openDates(){
    if(modal||modalRoute.isClosing()||occupied())return;
    rememberView();const epoch=modalEpoch,s=flow.snapshot();modalRoute.begin();
    modal=openHistoryPicker({screen:root.closest('.hn-screen'),tools,mode:'filter',quickRanges:true,filters:{...s.filters,status:s.filters.type},day:queryDateBounds().max,statusOptions:Object.entries(names),statusTitle:'Loại giao dịch',allStatusLabel:'Tất cả loại giao dịch',scopeLabel:flow.item()?.code||'Sản phẩm',filterTitle:'Bộ lọc lịch sử giao dịch',onClose:modalClosed,onApply:async draft=>{
      await modalRoute.ready();if(!active||disposed||epoch!==modalEpoch)return;
      if(flow.filters({from:draft.from,to:draft.to,type:draft.status})){render({focus:false});motion.search(root.querySelector('.p06-events'));root.querySelector('[data-p06="dates"]')?.focus({preventScroll:true});}
    }});
  }
  function openImage(index){
    const item=flow.item();if(!item?.images?.[index]||modal||modalRoute.isClosing()||occupied())return;
    rememberView();const dialog=document.createElement('dialog');dialog.className='p08-dialog p06-image-dialog';dialog.setAttribute('aria-labelledby','p06-image-title');
    dialog.innerHTML=`<header><div><h2 id="p06-image-title">Ảnh sản phẩm</h2><p>${esc(item.code)} · ${esc(item.name)}</p></div></header><div class="app-modal-body"><img class="p06-large-image" alt="${esc(item.imageLabels?.[index]||item.name)}" src="${esc(item.images[index])}"><p class="p06-image-caption" aria-live="polite"></p><div class="p06-image-error" hidden role="status"><strong>Chưa tải được ảnh</strong><p>Thông tin sản phẩm vẫn được giữ. Bạn có thể tải lại ảnh hoặc xem ảnh khác.</p><button type="button" data-image-retry>Thử tải ảnh lại</button></div></div><footer><button data-image-prev aria-label="Ảnh trước">←</button><button data-image-close>Đóng</button><button data-image-next aria-label="Ảnh tiếp theo">→</button></footer>`;
    const viewer=dialog.querySelector('.p06-large-image'),imageError=dialog.querySelector('.p06-image-error');
    viewer.addEventListener('error',()=>{if(!dialog.isConnected)return;viewer.hidden=true;imageError.hidden=false;});
    viewer.addEventListener('load',()=>{
      if(!dialog.isConnected)return;viewer.hidden=false;imageError.hidden=true;
      for(const placeholder of root.querySelectorAll('[data-p06-image-source]'))if(placeholder.dataset.p06ImageSource===item.images[index])placeholder.outerHTML=image(item,'',index);
    });
    function paint(){
      const focused=document.activeElement;viewer.hidden=false;imageError.hidden=true;viewer.src=item.images[index];viewer.alt=item.imageLabels?.[index]||item.name;
      dialog.querySelector('.p06-image-caption').textContent=`${index+1} / ${item.images.length} · ${viewer.alt}`;
      dialog.querySelector('[data-image-prev]').disabled=index===0;dialog.querySelector('[data-image-next]').disabled=index===item.images.length-1;
      selectedImages.set(item.id,index);const heroImage=root.querySelector('.p06-hero>.p06-image');if(heroImage)heroImage.outerHTML=image(item,'',index);
      root.querySelectorAll('[data-p06-image]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.p06Image)===index)));
      if(focused?.disabled&&dialog.contains(focused))(dialog.querySelector('[data-image-prev]:not(:disabled),[data-image-next]:not(:disabled)')||dialog.querySelector('[data-image-close]')).focus({preventScroll:true});
    }
    modalRoute.begin();modal=openAppModal({screen:root.closest('.hn-screen'),tools,dialog,dismissOnBackdrop:false,initialFocus:'[data-image-close]',onClose:modalClosed});paint();
    dialog.addEventListener('click',e=>{if(e.target.closest('[data-image-close]'))closeModal();else if(e.target.closest('[data-image-retry]')){paint();dialog.querySelector('[data-image-close]').focus({preventScroll:true});}else if(e.target.closest('[data-image-prev]')&&index>0){index--;paint();}else if(e.target.closest('[data-image-next]')&&index<item.images.length-1){index++;paint();}});
  }
  function notify(message){if(message)feedback.show({title:'Thông báo tra cứu',message,tone:'neutral'});}
  function updateSnapshot(){review.querySelector('pre').textContent=JSON.stringify({...flow.snapshot(),source:adapter.namespace,scenario:adapter.scenario()},null,2);}
  function render({focus=true,restoreFocus=false}={}) {
    if(!active||disposed)return;
    motion.cancel();
    // Replacing the search field ends its composition lifetime. A pending IME
    // from a detached field must not suppress typing in the new category/view.
    composing=false;
    const s=flow.snapshot(),item=flow.item();
    const sub=s.panel===1?'Tìm kiếm theo mã, tên, SKU, Serial...':s.panel===3?`Theo vị trí trong ${getState().session.warehouse.name}`:s.panel===4?'Nhập, xuất, bảo hành, kiểm kê, điều chỉnh...':'';
    root.innerHTML=`<section class="p06-app" data-panel="P06.S0${s.panel}"><header class="p06-header"><button data-p06="back" aria-label="Quay lại">${icon('back')}</button><div><h1 tabindex="-1">${titles[s.panel]}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div>${s.panel===1?`<button data-p06="scan" aria-label="Chọn tác vụ quét">${icon('scan')}</button>`:''}</header><div class="p06-body"><div class="p06-scroll" tabindex="0" role="region" aria-label="Nội dung màn hình">${selectForNfc&&s.panel===1?'<p class="p06-selection-hint">Chọn một sản phẩm để quay lại liên kết thẻ NFC.</p>':''}${s.panel===1?list():s.panel===2?detail(item):s.panel===3?stock(item):historyMarkup(item)}</div></div></section>`;
    renderedKey=viewKey(s);
    document.title=`P06 · ${titles[s.panel]} · Prototype`;updateSnapshot();onSize();
    const saved=views.get(renderedKey);
    root.querySelector('.p06-scroll').scrollTop=s.panel===1?s.listScroll:saved?.top||0;
    if(focus){const target=restoreFocus&&saved?.selector?root.querySelector(saved.selector):null;(target||root.querySelector('h1')).focus({preventScroll:true});}
  }
  function navigate(panel,itemId,{replace=false,restoreFocus=false}={}){
    rememberView();
    if(itemId&&!flow.open(itemId))return;if(itemId)lastViewed=itemId;
    if(!flow.panel(panel))return;
    const s=flow.snapshot();
    const caller=history.state?.p09Return;
    if(replace)history.replaceState(caller?{...history.state,p09Return:caller}:null,'',hashFor(panel,s.itemId));
    else history.pushState({p06From:location.hash,...(caller?{p09Return:{...caller,depth:caller.depth+1}}:{})},'',hashFor(panel,s.itemId));
    render({restoreFocus});onPanelTransition(routeKey());
    if(panel===1&&s.itemId&&!restoreFocus)root.querySelector(`[data-p06-item="${CSS.escape(s.itemId)}"]`)?.focus({preventScroll:true});
  }
  function goBack(){
    if(backPending||modal||modalRoute.isClosing())return;
    const s=flow.snapshot();
    if(s.panel===1){onHome();return;}
    const parent=s.panel===2?1:2;
    rememberView();
    if(history.state?.p06From===hashFor(parent,s.itemId)){backPending=true;history.back();}
    else navigate(parent,undefined,{replace:true,restoreFocus:true});
  }
  function selectProduct(id){
    const result=flow.select(id);
    if(result.kind!=='item'){notify(result.message);return;}
    if(selectForNfc&&onSelectProduct){onSelectProduct(result.item.id);return;}
    navigate(2,result.item.id);
  }
  function onClick(event){
    if(!active||disposed)return;
    const b=event.target.closest('button');if(!b||!root.contains(b))return;
    if(b.dataset.p06Item){selectProduct(b.dataset.p06Item);return;}
    if(b.dataset.p06Category){if(flow.snapshot().category===b.dataset.p06Category)return;composing=false;motion.cancel();flow.category(b.dataset.p06Category);updateResults({feedback:true});for(const tab of root.querySelectorAll('[data-p06-category]')){const selected=tab.dataset.p06Category===b.dataset.p06Category;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;}b.focus({preventScroll:true});motion.tab(b);return;}
    if(b.dataset.p06Event){const result=flow.action('document',b.dataset.p06Event);notify(result.message);return;}
    const a=b.dataset.p06,s=flow.snapshot();
    if(a==='clear-filters'){flow.filters({type:'all',from:'',to:''});rememberView();render({focus:false});motion.search(root.querySelector('.p06-events'));root.querySelector('[data-p06="dates"]')?.focus({preventScroll:true});return;}
    if(a==='retry-read'){adapter.retryRead?.();reads.invalidate();review.querySelector('[data-p06-scenario]').value=adapter.scenario();rememberView();if(s.panel===4)syncHistory();else if(s.panel===1)updateResults({feedback:true});else render();return;}
    if(a==='back')goBack();
    if(a==='stock')navigate(3);
    if(a==='location'&&onLocation&&!sessionGuard(getState())){const item=flow.item();if(item?.category==='components'){rememberView();onLocation(item);}}
    if(a==='history')navigate(4);
    if(a==='clear'){composing=false;motion.cancel();flow.search('');root.querySelector('#p06-search').value='';updateResults({feedback:true});root.querySelector('#p06-search').focus();}
    if(a==='filter')notify('Bộ lọc nâng cao chưa có tiêu chí được duyệt. Bạn có thể tìm theo mã, tên, SKU, Serial và chọn loại danh mục.');
    if(a==='image')openImage(Number(b.dataset.p06Image));
    if(a==='warranty'&&onWarranty){const item=flow.item();if(item?.serial)onWarranty(item);else notify('Sản phẩm chưa có serial được xác minh. Không dùng mã sản phẩm hoặc SKU thay serial tiếp nhận bảo hành.');}
    else if(a==='print'||a==='warranty')notify(flow.action(a).message);
    if(a==='scan'){const result=flow.action('scan');if(result.kind==='scanner')onScan(result.context);else notify(result.message);}
    if(a==='dates')openDates();
  }
  function updateResults({feedback=false}={}){motion.cancel();root.querySelector('.p06-list').innerHTML=cards();root.querySelector('.p06-recents-slot').innerHTML=recentMarkup();root.querySelector('.p06-search-context').innerHTML=searchContext();root.querySelector('.p06-list').setAttribute('aria-busy',String(!!read('list').loading));updateSnapshot();if(feedback&&!read('list').loading&&!read('list').error)motion.search(root.querySelector('.p06-list'));}
  function onInput(e){if(!active||e.target.id!=='p06-search'||composing||e.isComposing)return;flow.search(e.target.value);updateResults({feedback:true});root.querySelector('.p06-scroll').scrollTop=0;}
  function onKey(e){
    if(!active||composing||e.isComposing||e.keyCode===229)return;
    if(e.target.id==='p06-search'&&e.key==='Enter'){
      e.preventDefault();flow.search(e.target.value);updateResults({feedback:true});const data=read('list');
      if(data.error||data.loading)return;
      if(data.items.length===1&&e.target.value.trim())selectProduct(data.items[0].id);
      else (root.querySelector('.p06-list [data-p06-item]')||root.querySelector('#p06-results'))?.focus({preventScroll:false});
    }
    const tab=e.target.closest('[data-p06-category]');if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const category=e.key==='Home'?'products':e.key==='End'?'components':tab.dataset.p06Category==='products'?'components':'products';root.querySelector(`[data-p06-category="${category}"]`).click();}
  }
  const onCompositionStart=e=>{if(e.target.id==='p06-search')composing=true;};
  const onCompositionEnd=e=>{if(e.target.id!=='p06-search')return;composing=false;onInput(e);};
  const onImageError=e=>{
    const img=e.target;if(!active||!img.matches?.('img.p06-image'))return;
    const placeholder=document.createElement('span');placeholder.className=img.className+' p06-no-image';placeholder.dataset.p06ImageSource=img.src;
    placeholder.setAttribute('role','img');placeholder.setAttribute('aria-label','Ảnh chưa tải được: '+img.alt);placeholder.textContent='Ảnh chưa tải được';img.replaceWith(placeholder);
  };
  root.addEventListener('error',onImageError,true);
  root.addEventListener('compositionstart',onCompositionStart);root.addEventListener('compositionend',onCompositionEnd);
  const onScroll=e=>{if(e.target.matches?.('.p06-scroll'))rememberView();};
  root.addEventListener('click',onClick);root.addEventListener('input',onInput);root.addEventListener('keydown',onKey);root.addEventListener('scroll',onScroll,true);
  review.querySelector('[data-p06-scenario]').addEventListener('change',event=>{adapter.setScenario(event.target.value);reads.invalidate();rememberView();if(active&&flow.snapshot().panel===4)syncHistory();else render();});
  const routeKey=()=>{const s=flow.snapshot();return `lookup:${s.panel}:${s.panel===1?'list':s.itemId}`;};
  return {
    routeKey,setMotionMode:value=>motion.setMode(value),cancelMotion:()=>motion.cancel(),
    show(context={}) {backPending=false;composing=false;rememberView();active=true;motion.activate();review.hidden=false;selectForNfc=!!context.selectForNfc;const previous=flow.snapshot().panel;const params=new URLSearchParams(location.hash.split('?')[1]);const panel=Number(params.get('panel')||1),id=params.get('item');if(!context.restoreLookup){if(id&&!flow.open(id)||panel>1&&!id){flow.panel(1);}else flow.panel([1,2,3,4].includes(panel)?panel:1);}else{const s=flow.snapshot();history.replaceState(history.state,'',hashFor(s.panel,s.itemId));}render({restoreFocus:context.restoreLookup||flow.snapshot().panel<=previous});},
    hide(){motion.hide();reads.cancel();backPending=false;composing=false;rememberView();modalEpoch++;closeModal();active=false;feedback.clear();review.hidden=true;},
    back(){if(flow.snapshot().panel>1){goBack();return true;}return false;},
    dispose(){disposed=true;motion.dispose();reads.dispose();flow.clearRecent();root.removeEventListener('error',onImageError,true);root.removeEventListener('compositionstart',onCompositionStart);root.removeEventListener('compositionend',onCompositionEnd);modalEpoch++;modalRoute.dispose();closeModal();window.removeEventListener('popstate',onModalNavigation,true);window.removeEventListener('hashchange',onModalNavigation,true);feedback.dispose();views.clear();review.remove();root.removeEventListener('click',onClick);root.removeEventListener('input',onInput);root.removeEventListener('keydown',onKey);root.removeEventListener('scroll',onScroll,true);},
  };
}
