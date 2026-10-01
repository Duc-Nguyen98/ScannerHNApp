import {AUDIT_TYPES,auditScope,scopeKey,normalizeAudit,auditFilters,selectAudit,findAudit,auditDay} from './nfc-audit-model.mjs';
import {readAuditFixture} from './nfc-audit-fixture.mjs';
import {historyControls} from './history-controls.mjs';
import {openHistoryPicker} from './history-picker.mjs';
import {createDialogRoute} from '../shared/dialog-route.mjs';
import {createActionFeedback} from '../shared/action-feedback.mjs';
import {removeAuditFilter,auditCopyText,auditReadState} from './nfc-audit-experience.mjs';
import {DIALOG_ICONS} from '../scanner-dialogs/icons.mjs';
import {LOOKUP_ICONS} from '../lookup/icons.mjs';
import {INBOUND_ICONS} from '../inbound/icons.mjs';
import {recentTimeLabel} from '../shared/recent-time.mjs';
import {validateQueryRange} from '../shared/query-date-policy.mjs';
const icons={...DIALOG_ICONS,...LOOKUP_ICONS,...INBOUND_ICONS};
const icon=n=>`<svg class="p08-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[n]||icons.nfc}</svg>`;
const esc=s=>String(s??'Chưa xác minh').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const badge=e=>`<span class="p08-chip ${e.status==='Đã thu hồi'?'revoked':'success'}">${esc(e.status)}</span>`;
const tile=(name='nfc',size='md')=>`<span class="hn-operation-icon" data-hn-operation="${name==='nfc'?'nfc':'documents'}" data-size="${size}">${icon(name)}</span>`;
const blank=(title,copy)=>`<section class="p22-empty">${tile('history','lg')}<h2>${title}</h2><p>${copy}</p></section>`;
const notice=text=>`<div class="p22-notice">${icon('alert')}<span>${text}</span></div>`;
const value=(label,v,lines=2)=>`<div class="p22-kv"><span>${label}</span><div><strong data-hn-readable="${label}" data-hn-readable-kind="value" data-hn-lines="${lines}">${esc(v||null)}</strong></div></div>`;
export function mountNfcAudit({root,screen,tools,getState,onNavigate,onHome,onSize,readSource=null}){
  let active=false,disposed=false,mode='unavailable',scene='nfc',eventId='',filters=auditFilters(),source={kind:'unavailable',items:[]},identity='',generation=0,timer=null,readTimer=null,composing=false,modal=null,backPending=false;
  let renderedHash='',view={top:0,focus:null},abort=null,viewedId='',readOutcome='ready',copyEpoch=0,copyBusy=false,deferredPaint=false;
  const expanded=new Set();
  const journey=crypto.randomUUID();
  const route=createDialogRoute({history,location,key:'hnP22Picker'});
  const review=document.createElement('details');review.className='p22-tools';review.hidden=true;review.open=true;
  review.innerHTML='<summary>P22 · Lịch sử NFC — mô phỏng tách biệt</summary><p>Không kết nối WMS. Mặc định không có nguồn event; P07 đọc/ghi thẻ không tạo lịch sử ở đây.</p><label>Nguồn xem thử <select data-p22-source><option value="unavailable">Chưa có nguồn</option><option value="fixture">Mẫu B22</option><option value="empty">Nguồn xác nhận rỗng</option><option value="error">Lỗi đọc</option><option value="long">Nội dung dài</option><option value="slow">Đọc chậm</option><option value="timeout">Đọc treo (15 giây)</option></select></label><pre data-p22-snapshot hidden></pre>';
  tools.append(review);
  const allowed=()=>active&&!disposed&&!!auditScope(getState())&&scopeKey(auditScope(getState()))===identity;
  const feedback=createActionFeedback({getScreen:()=>screen,tools,isActive:allowed,key:'hnP22Copy'});
  const occupied=()=>!!screen.querySelector('.app-modal-host,dialog[open]');
  const observer=new MutationObserver(()=>{if(deferredPaint&&allowed()&&!occupied()){deferredPaint=false;paintRead();}});
  observer.observe(screen,{childList:true,subtree:true});
  const outcome=document.createElement('label');outcome.innerHTML='Lần tải lại <select data-p22-read-outcome><option value="ready">Bình thường</option><option value="error">Lỗi đọc</option><option value="slow">Đọc chậm</option><option value="timeout">Treo15giây</option></select>';review.append(outcome);
  outcome.querySelector('select').onchange=e=>{readOutcome=e.target.value;};
  function remember(){if(!active)return;const sc=root.querySelector('.p22-scroll');if(sc&&scene!=='nfc-detail'){const e=document.activeElement;view={top:sc.scrollTop,focus:e?.dataset.p22Event?`[data-p22-event="${CSS.escape(e.dataset.p22Event)}"]`:null};}}
  function save(){if(allowed())history.replaceState({...history.state,p22:{journey,filters:{...filters},view}},'',location.hash);}
  function navigate(next,extra={},replace=false){if(!allowed())return;remember();save();const hash='#p02/history?'+new URLSearchParams({scene:next,...extra});onNavigate(hash,{p22From:{journey,hash:location.hash},p22:{journey,filters:{...filters},view}},replace);}
  function back(){
    if(!allowed()||backPending)return;
    if(history.state?.p22From?.journey===journey||history.state?.embeddedBack||history.state?.returnTo){backPending=true;history.back();return;}
    navigate(scene==='nfc-detail'?'nfc':'history-hub',{},true);
  }
  const selected=()=>selectAudit(source.items,filters);
  function chips(){const date=filters.from&&filters.from===filters.to?filters.from.split('-').reverse().join('/'):filters.from||filters.to?`${filters.from?filters.from.split('-').reverse().join('/'):'…'} – ${filters.to?filters.to.split('-').reverse().join('/'):'…'}`:'';return [['type',filters.type!=='all'?filters.type:''],['date',date],['status',filters.status!=='all'?filters.status:'']].filter(([,v])=>v).map(([k,v])=>`<button data-p22-remove="${k}" aria-label="Bỏ ${k==='date'?'khoảng ngày':k==='type'?'loại thao tác':'trạng thái'} ${esc(v)}">${esc(v)} <span aria-hidden="true">×</span></button>`).join('');}
  function controls(){
    const template=document.createElement('template');template.innerHTML=historyControls({filters,tabs:AUDIT_TYPES.map(x=>[x,x]),statuses:{'Thành công':'Thành công','Đã thu hồi':'Đã thu hồi'},count:selected().length,ready:source.kind==='ready',placeholder:'Tìm UID hoặc serial',icon,namespace:'p22',inputId:'p22-search',showSort:false,scopeName:'NFC',canClear:false});
    const search=template.content.querySelector('.p08-search');search.insertAdjacentHTML('beforeend',`<button class="p22-query-clear" data-p22="clear-query" aria-label="Xóa từ khóa" ${filters.q?'':'hidden'}>×</button>`);
    const filter=search.querySelector('[data-p22=filter]');filter.setAttribute('aria-label','Bộ lọc NFC'+(filters.from||filters.to||filters.status!=='all'?', đang áp dụng':''));
    return `<div class="p22-controls">${search.outerHTML}${template.content.querySelector('.p08-tabs').outerHTML}<div class="p22-compact-row">${template.content.querySelector('.p08-filter-summary').outerHTML}<span class="p22-count" role="status">${selected().length} kết quả</span><button data-p22="reload" class="p22-reload" ${source.refreshing?'disabled':''}>${source.refreshing?'Đang tải…':'Tải lại'}</button></div><div class="p22-filter-chips">${chips()}</div></div>`;
  }
  function readStatus(){return source.readIssue==='loading'?'Đang tải lại · vẫn hiển thị kết quả lần đọc trước.':source.readIssue==='error'?'Không tải lại được · đang hiển thị kết quả lần đọc trước.':source.readIssue==='unavailable'?'Nguồn chưa khả dụng · đang hiển thị kết quả lần đọc trước.':'';}
  function syncSnapshot(){review.querySelector('[data-p22-snapshot]').textContent=JSON.stringify({scene,eventId,mode,filters,source:source.kind,count:source.kind==='ready'?selected().length:null,refreshing:!!source.refreshing,readIssue:source.readIssue||null,viewedId});}
  function results(){
    const rows=selected();
    if(!rows.length)return blank(filters.q||filters.type!=='all'||filters.from||filters.to||filters.status!=='all'?'Không có kết quả phù hợp':'Chưa có thao tác',source.readIssue?'Kết quả của lần đọc trước. Chưa xác minh lại nguồn hiện tại.':'Nguồn đã xác nhận kết quả đọc. Bạn có thể thay đổi bộ lọc hoặc tải lại.')+`<div class="p22-empty-actions">${filters.q?'<button data-p22="clear-query">Xóa từ khóa</button>':''}<button data-p22="filter">Điều chỉnh bộ lọc</button></div>`;
    let day;
    return rows.map(e=>{
      const key=auditDay(e),group=key!==day?`<h3 class="p22-group">${key?esc(recentTimeLabel(key,'').replace(/ · $/,'')):'Thời điểm chưa xác minh'}<span>${rows.filter(r=>auditDay(r)===key).length} thao tác</span></h3>`:'';day=key;
      return group+`<button class="p22-card p22-event ${viewedId===e.id?'p22-viewed':''}" data-p22-event="${esc(e.id)}"><span class="p22-row"><span class="p22-event-name">${tile()}<strong>${esc(e.type)}</strong></span>${badge(e)}</span><p><span class="p22-field-label">UID</span> ${esc(e.uid||null)}<br><span class="p22-field-label">Serial</span> ${esc(e.serial||null)}</p><span class="p22-row"><time>${key?esc(e.time):'Chưa xác minh giờ'}${viewedId===e.id?' · Vừa xem':''}</time><span class="p22-actor">${esc(e.actor||null)} →</span></span></button>`;
    }).join('')+`<p class="p22-end">${source.complete?'Đã hiển thị hết thao tác trong nguồn đã đọc.':'Đã hiển thị các thao tác đã tải; chưa xác minh hết dữ liệu.'}</p>`;
  }
  const copyButton=(kind,label)=>`<button class="p22-copy" data-p22-copy="${kind}" aria-label="${label}">Sao chép</button>`;
  function detail(){
    const e=findAudit(source.items,eventId);
    if(!e)return blank('Không tìm thấy thao tác NFC','Không có event ID này trong nguồn đã đọc. Không thay bằng sự kiện khác.');
    const reason=e.reason?`<div class="p22-reason"><h3>Lý do</h3><p class="p22-description" data-hn-readable="Lý do" data-hn-lines="2">${esc(e.reason)}</p></div>`:'';
    const uid=(label,key)=>`<div class="p22-uid"><div class="p22-row"><span>${label}</span>${e[key]?copyButton(key,'Sao chép '+label.toLowerCase()):''}</div><strong data-hn-readable="${label}" data-hn-readable-kind="value">${esc(e[key]||null)}</strong></div>`;
    const tag=e.type==='Thay thẻ'?`<section class="p22-card p22-replacement"><h2>Thay đổi thẻ NFC</h2>${uid('Thẻ trước','previousUid')}<span class="p22-transition" aria-hidden="true">↓</span>${uid('Thẻ thay thế','uid')}${reason}</section>`:`<section class="p22-card">${uid('UID thẻ','uid')}${reason}</section>`;
    return `<section class="p22-card p22-hero">${tile()}<h2>${esc(e.type)}</h2>${badge(e)}</section>${tag}<section class="p22-card">${value('Serial sản phẩm',e.serial)}${e.serial?copyButton('serial','Sao chép serial sản phẩm'):''}${value('Sản phẩm',e.product,3)}${value('Người thực hiện',e.actor)}${value('Thời điểm',auditDay(e)?`${e.day.split('-').reverse().join('/')} · ${e.time}`:null)}</section><section class="p22-card"><h2>Nội dung thao tác</h2><p class="p22-description" data-hn-readable="Nội dung thao tác" data-hn-lines="3">${esc(e.description||null)}</p></section><details class="p22-card p22-audit-info" ${expanded.has(e.id)?'open':''}><summary>Thông tin đối chiếu</summary>${value('Mã sự kiện',e.id)}${value('Kho',e.warehouse)}<button data-p22-copy="bundle" class="p22-copy-bundle">Sao chép thông tin đối chiếu</button></details>${notice('Lịch sử chỉ dùng để xem lại thao tác, không thay đổi trạng thái thẻ.')}`;
  }
  async function copy(kind,button){
    if(!allowed()||copyBusy||occupied()||scene!=='nfc-detail')return;
    const event=findAudit(source.items,eventId),text=auditCopyText(event,kind);if(!text)return;
    const stamp=JSON.stringify(event),hash=location.hash,scope=identity,epoch=++copyEpoch;
    copyBusy=true;button.disabled=true;button.setAttribute('aria-busy','true');let success=false;
    try{await navigator.clipboard.writeText(text);success=true;}catch{}finally{if(epoch===copyEpoch)copyBusy=false;if(button.isConnected){button.disabled=false;button.removeAttribute('aria-busy');}}
    if(!allowed()||epoch!==copyEpoch||scope!==identity||hash!==location.hash||stamp!==JSON.stringify(findAudit(source.items,eventId))||occupied())return;
    feedback.show({title:success?'Đã sao chép':'Không thể sao chép',message:success?'Đã sao chép nguyên vẹn '+(kind==='bundle'?'thông tin đối chiếu.':kind==='serial'?'serial sản phẩm.':'UID thẻ.'):'Không truy cập được clipboard. Bạn có thể chọn nội dung gốc dưới đây để sao chép:\n\n'+text,tone:success?'success':'error',confirmLabel:'Đóng',className:'p22-copy-dialog',onClose:()=>{if(allowed()&&location.hash===hash)root.querySelector(`[data-p22-copy="${kind}"]`)?.focus({preventScroll:true});}});
  }
  function uiPosition(){
    const e=document.activeElement,sc=root.querySelector('.p22-scroll');
    const selector=root.contains(e)?e.id?'#'+CSS.escape(e.id):e.dataset.p22Event?`[data-p22-event="${CSS.escape(e.dataset.p22Event)}"]`:e.dataset.p22Type?`[data-p22-type="${CSS.escape(e.dataset.p22Type)}"]`:e.dataset.p22?`[data-p22="${e.dataset.p22}"]`:null:null;
    const rect=sc?.getBoundingClientRect(),scale=screen.getBoundingClientRect().width/screen.offsetWidth;
    const row=rect?[...sc.querySelectorAll('[data-p22-event]')].find(x=>x.getBoundingClientRect().bottom>rect.top):null;
    return {top:sc?.scrollTop||0,selector,element:e,anchor:row?{id:row.dataset.p22Event,offset:(row.getBoundingClientRect().top-rect.top)/scale}:null};
  }
  function restorePosition(p){
    const sc=root.querySelector('.p22-scroll');if(sc)sc.scrollTop=p.top;
    const row=p.anchor&&sc?.querySelector(`[data-p22-event="${CSS.escape(p.anchor.id)}"]`);
    if(row){const scale=screen.getBoundingClientRect().width/screen.offsetWidth;sc.scrollTop+=(row.getBoundingClientRect().top-sc.getBoundingClientRect().top)/scale-p.anchor.offset;}
    if(p.selector&&!p.element?.isConnected)(root.querySelector(p.selector)||root.querySelector('h1'))?.focus({preventScroll:true});
  }
  function paintRead(){
    if(!allowed())return;if(occupied()){deferredPaint=true;return;}
    const p=uiPosition();
    if(source.kind==='ready'&&scene!=='nfc-detail'&&root.querySelector('.p22-results')){
      // Keep search/IME and filter DOM connected during read responses.
      if(!composing)root.querySelector('.p22-results').innerHTML=results();
      const count=root.querySelector('.p22-count');if(count&&!composing)count.textContent=selected().length+' kết quả';
      const status=root.querySelector('.p22-read-status');if(status)status.textContent=readStatus();
      const reload=root.querySelector('[data-p22=reload]');if(reload){reload.disabled=!!source.refreshing;reload.textContent=source.refreshing?'Đang tải…':'Tải lại';}
      syncSnapshot();
    }else render();
    restorePosition(p);onSize();
  }
  function render({focus=false,restore=false}={}){
    if(!allowed())return;
    const detailPage=scene==='nfc-detail',unavailable=source.kind==='unavailable',panel=unavailable?'P22.S04':detailPage?'P22.S03':'P22.S02';
    const content=source.kind==='loading'?blank('Đang tải lịch sử…','Đang đọc nguồn sự kiện. Không thực hiện thao tác ghi.'):unavailable?blank('Chưa có dữ liệu lịch sử','Danh sách thao tác hiện chưa khả dụng. Bạn có thể kiểm tra lại sau.')+notice('Bạn vẫn có thể sử dụng các chức năng quét mã.'):source.kind==='error'?blank('Không tải được lịch sử','Nguồn đọc bị lỗi hoặc hết thời gian chờ. Bộ lọc vẫn được giữ; tải lại chỉ đọc lịch sử.'):detailPage?detail():`<div class="p22-results">${results()}</div>`;
    root.innerHTML=`<section class="p22-app" data-panel="${panel}"><header class="p08-header"><button data-p22="back" aria-label="${detailPage?'Về lịch sử NFC':'Về lịch sử thao tác'}">${icon('back')}</button><h1 tabindex="-1">${detailPage?'Chi tiết thao tác NFC':'Lịch sử NFC'}</h1></header>${source.kind==='ready'&&!detailPage?`<div class="p22-dock">${controls()}<p class="p22-read-status" role="status">${readStatus()}</p></div>`:''}<div class="p22-scroll ${source.kind==='ready'&&!detailPage?'p22-list-scroll':''}">${content}</div><footer class="p22-footer">${source.kind!=='ready'?`<button class="p22-primary" data-p22="reload" ${source.kind==='loading'?'disabled':''}>${source.kind==='loading'?'Đang tải…':'Tải lại lịch sử'}</button>`:''}<button data-p22="back">${detailPage?'Về lịch sử NFC':'Về lịch sử thao tác'}</button></footer></section>`;
    renderedHash=location.hash;syncSnapshot();
    if(restore&&!detailPage){root.querySelector('.p22-scroll').scrollTop=view.top;root.querySelector(view.focus||'h1')?.focus({preventScroll:true});}
    else if(focus)root.querySelector('h1')?.focus({preventScroll:true});
    onSize();
  }
  function refreshResults(){
    if(!allowed()||source.kind!=='ready'||scene==='nfc-detail')return;
    save();root.querySelector('.p22-results').innerHTML=results();
    root.querySelector('.p22-count').textContent=selected().length+' kết quả';
    root.querySelector('.p22-query-clear').hidden=!filters.q;
    syncSnapshot();
  }
  async function load({preserve=true}={}){
    if(!allowed()||occupied()||source.refreshing||source.kind==='loading')return;
    copyEpoch++;copyBusy=false;
    abort?.abort();clearTimeout(readTimer);const controller=new AbortController();abort=controller;const token=++generation,scope=auditScope(getState()),startIdentity=identity;
    const previous=source,requestedMode=mode,outcome=preserve?readOutcome:'ready';
    source=auditReadState(previous,{kind:'loading',items:[]},{preserve});paintRead();
    const work=readSource?()=>readSource({scope,signal:controller.signal}):async()=>{
      if(requestedMode==='timeout'||outcome==='timeout')await new Promise(()=>{});
      if(requestedMode==='slow'||outcome==='slow')await new Promise(r=>setTimeout(r,800));
      if(outcome==='error')throw Error('READ_ERROR');
      return readAuditFixture(scope,requestedMode==='slow'?'fixture':requestedMode);
    };
    let next;
    try{const result=await Promise.race([Promise.resolve().then(work),new Promise((_,reject)=>{readTimer=setTimeout(()=>{controller.abort();reject(Error('READ_TIMEOUT'));},15000);controller.signal.addEventListener('abort',()=>reject(Error('ABORTED')),{once:true});})]);if(token!==generation||!allowed()||identity!==startIdentity)return;next=normalizeAudit(result,scope);}
    catch{if(token!==generation||!allowed())return;next={kind:'error',items:[]};}
    finally{if(token===generation)clearTimeout(readTimer);}
    if(token!==generation||!allowed())return;
    source=auditReadState(previous,next,{preserve});paintRead();
  }
  function picker(){
    if(modal||route.isClosing()||!allowed())return;route.begin();
    modal=openHistoryPicker({screen,tools,mode:'filter',filters,scopeLabel:'Lịch sử NFC',statusOptions:[['Thành công','Thành công'],['Đã thu hồi','Đã thu hồi']],onClose:()=>{modal=null;route.closed();},onApply:async draft=>{await route.ready();if(!allowed())return;filters={...filters,from:draft.from,to:draft.to,status:draft.status};save();render();root.querySelector('[data-p22="filter"]')?.focus({preventScroll:true});}});
  }
  function click(e){if(!allowed()||!e.target.closest('.p22-app'))return;const b=e.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.p22Copy){void copy(b.dataset.p22Copy,b);return;}
    if(b.dataset.p22Remove){filters=removeAuditFilter(filters,b.dataset.p22Remove);clearTimeout(timer);save();render();root.querySelector('[data-p22="filter"]')?.focus({preventScroll:true});return;}
    if(b.dataset.p22==='clear-query'){filters=removeAuditFilter(filters,'q');clearTimeout(timer);const input=root.querySelector('#p22-search');if(input)input.value='';refreshResults();input?.focus({preventScroll:true});return;}
    if(b.dataset.p22Event){viewedId=b.dataset.p22Event;navigate('nfc-detail',{event:b.dataset.p22Event});return;}
    if(b.dataset.p22Type){filters.type=b.dataset.p22Type;clearTimeout(timer);save();render();root.querySelector(`[data-p22-type="${CSS.escape(filters.type)}"]`)?.focus({preventScroll:true});return;}
    if(b.dataset.p22==='back')back();if(b.dataset.p22==='reload')void load();if(b.dataset.p22==='filter')picker();if(b.dataset.p22==='clear'){filters=auditFilters();save();render();root.querySelector('#p22-search')?.focus();}
  }
  function input(e){if(!allowed()||e.target.id!=='p22-search')return;filters.q=e.target.value;clearTimeout(timer);if(!composing)timer=setTimeout(refreshResults,250);}
  function composition(e){if(e.target.id!=='p22-search')return;composing=e.type==='compositionstart';if(composing)clearTimeout(timer);else input(e);}
  function key(e){if(!allowed())return;if(e.target.id==='p22-search'&&e.key==='Enter'&&!e.isComposing&&!composing){e.preventDefault();clearTimeout(timer);refreshResults();}const b=e.target.closest('[data-p22-type]');if(b&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=[...root.querySelectorAll('[data-p22-type]')],i=tabs.indexOf(b);tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length].click();}}
  function pickerNav(e){if(route.navigation(()=>modal?.close(),()=>!!modal))e.stopImmediatePropagation();}
  function toggle(e){if(allowed()&&e.target.matches('.p22-audit-info')){if(e.target.open)expanded.add(eventId);else expanded.delete(eventId);}}
  root.addEventListener('toggle',toggle,true);
  root.addEventListener('click',click);root.addEventListener('input',input);root.addEventListener('keydown',key);root.addEventListener('compositionstart',composition);root.addEventListener('compositionend',composition);window.addEventListener('popstate',pickerNav,true);window.addEventListener('hashchange',pickerNav,true);
  function cancelRead(){generation++;abort?.abort();clearTimeout(readTimer);copyEpoch++;copyBusy=false;deferredPaint=false;if(source.refreshing)source={...source,refreshing:false,readIssue:'error'};if(source.kind==='loading')source={kind:'unavailable',items:[]};}
  review.querySelector('[data-p22-source]').onchange=e=>{if(!allowed()||occupied())return;cancelRead();mode=e.target.value;viewedId='';expanded.clear();void load({preserve:false});};
  function hide(){remember();active=false;cancelRead();feedback.clear();clearTimeout(timer);composing=false;modal?.close({restoreFocus:false});review.hidden=true;renderedHash='';}
  return {show(){
    const scope=auditScope(getState());if(!scope)return;const nextIdentity=scopeKey(scope);
    if(identity&&identity!==nextIdentity){cancelRead();filters=auditFilters();view={top:0,focus:null};source={kind:'unavailable',items:[]};mode='unavailable';viewedId='';expanded.clear();review.querySelector('select').value=mode;}
    identity=nextIdentity;active=true;backPending=false;review.hidden=false;
    if(renderedHash===location.hash&&root.querySelector('.p22-app'))return;
    cancelRead();feedback.clear();
    remember();const q=new URLSearchParams(location.hash.split('?')[1]);scene=q.get('scene')||'nfc';eventId=q.get('event')||'';
    const saved=history.state?.p22;if(saved?.journey===journey){filters={...saved.filters};view=saved.view||view;}
    if(validateQueryRange(filters)){filters.from='';filters.to='';}
    composing=false;clearTimeout(timer);render({focus:true,restore:scene==='nfc'});
    if(source.kind==='loading')void load();
  },hide,dispose(){hide();disposed=true;feedback.dispose();observer.disconnect();root.removeEventListener('toggle',toggle,true);route.dispose();review.remove();root.removeEventListener('click',click);root.removeEventListener('input',input);root.removeEventListener('keydown',key);root.removeEventListener('compositionstart',composition);root.removeEventListener('compositionend',composition);window.removeEventListener('popstate',pickerNav,true);window.removeEventListener('hashchange',pickerNav,true);}};
}
