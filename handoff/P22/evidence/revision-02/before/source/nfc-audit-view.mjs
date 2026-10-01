import {AUDIT_TYPES,auditScope,scopeKey,normalizeAudit,auditFilters,selectAudit,findAudit,auditDay} from './nfc-audit-model.mjs';
import {readAuditFixture} from './nfc-audit-fixture.mjs';
import {historyControls} from './history-controls.mjs';
import {openHistoryPicker} from './history-picker.mjs';
import {createDialogRoute} from '../shared/dialog-route.mjs';
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
  let renderedHash='',view={top:0,focus:null},abort=null;
  const journey=crypto.randomUUID();
  const route=createDialogRoute({history,location,key:'hnP22Picker'});
  const review=document.createElement('details');review.className='p22-tools';review.hidden=true;review.open=true;
  review.innerHTML='<summary>P22 · Lịch sử NFC — mô phỏng tách biệt</summary><p>Không kết nối WMS. Mặc định không có nguồn event; P07 đọc/ghi thẻ không tạo lịch sử ở đây.</p><label>Nguồn xem thử <select data-p22-source><option value="unavailable">Chưa có nguồn</option><option value="fixture">Mẫu B22</option><option value="empty">Nguồn xác nhận rỗng</option><option value="error">Lỗi đọc</option><option value="long">Nội dung dài</option><option value="slow">Đọc chậm</option><option value="timeout">Đọc treo (15 giây)</option></select></label><pre data-p22-snapshot hidden></pre>';
  tools.append(review);
  const allowed=()=>active&&!disposed&&!!auditScope(getState())&&scopeKey(auditScope(getState()))===identity;
  function remember(){if(!active)return;const sc=root.querySelector('.p22-scroll');if(sc&&scene!=='nfc-detail'){const e=document.activeElement;view={top:sc.scrollTop,focus:e?.dataset.p22Event?`[data-p22-event="${CSS.escape(e.dataset.p22Event)}"]`:null};}}
  function save(){if(allowed())history.replaceState({...history.state,p22:{journey,filters:{...filters},view}},'',location.hash);}
  function navigate(next,extra={},replace=false){if(!allowed())return;remember();save();const hash='#p02/history?'+new URLSearchParams({scene:next,...extra});onNavigate(hash,{p22From:{journey,hash:location.hash},p22:{journey,filters:{...filters},view}},replace);}
  function back(){
    if(!allowed()||backPending)return;
    if(history.state?.p22From?.journey===journey||history.state?.embeddedBack||history.state?.returnTo){backPending=true;history.back();return;}
    navigate(scene==='nfc-detail'?'nfc':'history-hub',{},true);
  }
  const selected=()=>selectAudit(source.items,filters);
  function controls(){return `<p class="p22-intro">Các thao tác đã được nguồn sự kiện xác nhận.</p><div class="p22-controls">${historyControls({filters,tabs:AUDIT_TYPES.map(x=>[x,x]),statuses:{'Thành công':'Thành công','Đã thu hồi':'Đã thu hồi'},count:selected().length,ready:source.kind==='ready',placeholder:'Tìm UID hoặc serial',icon,namespace:'p22',inputId:'p22-search',showSort:false,scopeName:'NFC'})}</div>`;}
  function results(){
    const rows=selected();
    if(!rows.length)return blank(filters.q||filters.type!=='all'||filters.from||filters.to||filters.status!=='all'?'Không có kết quả phù hợp':'Chưa có thao tác','Nguồn đã xác nhận kết quả đọc. Bạn có thể thay đổi bộ lọc hoặc tải lại.');
    let day;
    return rows.map(e=>{
      const key=auditDay(e),group=key!==day?`<h3 class="p22-group">${key?esc(recentTimeLabel(key,'').replace(/ · $/,'')):'Thời điểm chưa xác minh'}<span>${rows.filter(r=>auditDay(r)===key).length} thao tác</span></h3>`:'';day=key;
      return group+`<button class="p22-card p22-event" data-p22-event="${esc(e.id)}"><span class="p22-row"><span class="p22-event-name">${tile()}<strong>${esc(e.type)}</strong></span><time>${key?esc(e.time):'—'}</time></span><p>${esc(e.uid||null)} · ${esc(e.serial||null)}</p><span class="p22-row">${badge(e)}<span class="p22-actor">${esc(e.actor||null)} →</span></span></button>`;
    }).join('')+`<p class="p22-end">${source.complete?'Đã hiển thị hết thao tác trong nguồn đã đọc.':'Đã hiển thị các thao tác đã tải; chưa xác minh hết dữ liệu.'}</p>`;
  }
  function detail(){
    const e=findAudit(source.items,eventId);
    if(!e)return blank('Không tìm thấy thao tác NFC','Không có event ID này trong nguồn đã đọc. Không thay bằng sự kiện khác.');
    return `<section class="p22-card p22-hero">${tile()}<h2>${esc(e.type)}</h2>${badge(e)}</section><section class="p22-card">${value('UID thẻ',e.uid)}${e.previousUid?value('UID trước đó',e.previousUid):''}${value('Serial sản phẩm',e.serial)}${value('Sản phẩm',e.product,3)}${value('Người thực hiện',e.actor)}${value('Thời điểm',auditDay(e)?`${e.day.split('-').reverse().join('/')} · ${e.time}`:null)}${value('Kho',e.warehouse)}${value('Mã sự kiện',e.id)}</section><section class="p22-card"><h2>Nội dung thao tác</h2><p class="p22-description" data-hn-readable="Nội dung thao tác" data-hn-lines="3">${esc(e.description||null)}</p>${e.reason?`<h3>Lý do</h3><p class="p22-description" data-hn-readable="Lý do" data-hn-lines="2">${esc(e.reason)}</p>`:''}</section>${notice('Lịch sử chỉ dùng để xem lại thao tác, không thay đổi trạng thái thẻ.')}`;
  }
  function render({focus=false,restore=false}={}){
    if(!allowed())return;
    const detailPage=scene==='nfc-detail',unavailable=source.kind==='unavailable',panel=unavailable?'P22.S04':detailPage?'P22.S03':'P22.S02';
    const content=source.kind==='loading'?blank('Đang tải lịch sử…','Đang đọc nguồn sự kiện. Không thực hiện thao tác ghi.'):unavailable?blank('Chưa có dữ liệu lịch sử','Danh sách thao tác hiện chưa khả dụng. Bạn có thể kiểm tra lại sau.')+notice('Bạn vẫn có thể sử dụng các chức năng quét mã.'):source.kind==='error'?blank('Không tải được lịch sử','Nguồn đọc bị lỗi hoặc hết thời gian chờ. Bộ lọc vẫn được giữ; tải lại chỉ đọc lịch sử.'):detailPage?detail():`<div class="p22-results">${results()}</div>`;
    root.innerHTML=`<section class="p22-app" data-panel="${panel}"><header class="p08-header"><button data-p22="back" aria-label="${detailPage?'Về lịch sử NFC':'Về lịch sử thao tác'}">${icon('back')}</button><h1 tabindex="-1">${detailPage?'Chi tiết thao tác NFC':'Lịch sử NFC'}</h1></header>${source.kind==='ready'&&!detailPage?`<div class="p22-dock">${controls()}</div>`:''}<div class="p22-scroll ${source.kind==='ready'&&!detailPage?'p22-list-scroll':''}">${content}</div><footer class="p22-footer">${source.kind!=='ready'?`<button class="p22-primary" data-p22="reload" ${source.kind==='loading'?'disabled':''}>${source.kind==='loading'?'Đang tải…':'Tải lại lịch sử'}</button>`:''}<button data-p22="back">${detailPage?'Về lịch sử NFC':'Về lịch sử thao tác'}</button></footer></section>`;
    renderedHash=location.hash;review.querySelector('[data-p22-snapshot]').textContent=JSON.stringify({scene,eventId,mode,filters,source:source.kind,count:source.kind==='ready'?selected().length:null});
    if(restore&&!detailPage){root.querySelector('.p22-scroll').scrollTop=view.top;root.querySelector(view.focus||'h1')?.focus({preventScroll:true});}
    else if(focus)root.querySelector('h1')?.focus({preventScroll:true});
    onSize();
  }
  function refreshResults(){if(!allowed()||source.kind!=='ready'||scene==='nfc-detail')return;save();root.querySelector('.p22-results').innerHTML=results();const summary=root.querySelector('.p22-controls .p08-result-count');if(summary)summary.textContent=selected().length+' kết quả';const template=document.createElement('template');template.innerHTML=controls();root.querySelector('.p08-toolbar-actions').innerHTML=template.content.querySelector('.p08-toolbar-actions').innerHTML;review.querySelector('[data-p22-snapshot]').textContent=JSON.stringify({scene,eventId,mode,filters,source:source.kind,count:selected().length});}
  async function load(){
    if(!allowed())return;
    abort?.abort();clearTimeout(readTimer);const controller=new AbortController();abort=controller;const token=++generation,scope=auditScope(getState()),startIdentity=identity;
    source={kind:'loading',items:[]};render();
    const work=readSource?()=>readSource({scope,signal:controller.signal}):async()=>{if(mode==='timeout')await new Promise(()=>{});if(mode==='slow')await new Promise(r=>setTimeout(r,800));return readAuditFixture(scope,mode==='slow'?'fixture':mode);};
    try{const result=await Promise.race([Promise.resolve().then(work),new Promise((_,reject)=>{readTimer=setTimeout(()=>{controller.abort();reject(Error('READ_TIMEOUT'));},15000);controller.signal.addEventListener('abort',()=>reject(Error('ABORTED')),{once:true});})]);if(token!==generation||!allowed()||identity!==startIdentity)return;source=normalizeAudit(result,scope);}
    catch{if(token!==generation||!allowed())return;source={kind:'error',items:[]};}
    finally{if(token===generation)clearTimeout(readTimer);}
    if(token!==generation||!allowed())return;
    const current=document.activeElement,inside=root.contains(current),key=current?.dataset.p22;
    const top=root.querySelector('.p22-scroll')?.scrollTop||0;render();root.querySelector('.p22-scroll').scrollTop=top;
    if(inside)root.querySelector(key?`[data-p22="${key}"]`:'h1')?.focus({preventScroll:true});
  }
  function picker(){
    if(modal||route.isClosing()||!allowed())return;route.begin();
    modal=openHistoryPicker({screen,tools,mode:'filter',filters,scopeLabel:'Lịch sử NFC',statusOptions:[['Thành công','Thành công'],['Đã thu hồi','Đã thu hồi']],onClose:()=>{modal=null;route.closed();},onApply:async draft=>{await route.ready();if(!allowed())return;filters={...filters,from:draft.from,to:draft.to,status:draft.status};save();render();root.querySelector('[data-p22="filter"]')?.focus({preventScroll:true});}});
  }
  function click(e){if(!allowed()||!e.target.closest('.p22-app'))return;const b=e.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.p22Event){navigate('nfc-detail',{event:b.dataset.p22Event});return;}
    if(b.dataset.p22Type){filters.type=b.dataset.p22Type;clearTimeout(timer);save();render();root.querySelector(`[data-p22-type="${CSS.escape(filters.type)}"]`)?.focus({preventScroll:true});return;}
    if(b.dataset.p22==='back')back();if(b.dataset.p22==='reload')void load();if(b.dataset.p22==='filter')picker();if(b.dataset.p22==='clear'){filters=auditFilters();save();render();root.querySelector('#p22-search')?.focus();}
  }
  function input(e){if(!allowed()||e.target.id!=='p22-search')return;filters.q=e.target.value;clearTimeout(timer);if(!composing)timer=setTimeout(refreshResults,250);}
  function composition(e){if(e.target.id!=='p22-search')return;composing=e.type==='compositionstart';if(composing)clearTimeout(timer);else input(e);}
  function key(e){if(!allowed())return;if(e.target.id==='p22-search'&&e.key==='Enter'&&!e.isComposing&&!composing){e.preventDefault();clearTimeout(timer);refreshResults();}const b=e.target.closest('[data-p22-type]');if(b&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=[...root.querySelectorAll('[data-p22-type]')],i=tabs.indexOf(b);tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length].click();}}
  function pickerNav(e){if(route.navigation(()=>modal?.close(),()=>!!modal))e.stopImmediatePropagation();}
  root.addEventListener('click',click);root.addEventListener('input',input);root.addEventListener('keydown',key);root.addEventListener('compositionstart',composition);root.addEventListener('compositionend',composition);window.addEventListener('popstate',pickerNav,true);window.addEventListener('hashchange',pickerNav,true);
  review.querySelector('select').onchange=e=>{if(!allowed()||screen.querySelector('.app-modal-host'))return;mode=e.target.value;void load();};
  function hide(){remember();active=false;generation++;abort?.abort();clearTimeout(readTimer);clearTimeout(timer);composing=false;modal?.close({restoreFocus:false});review.hidden=true;renderedHash='';}
  return {show(){
    const scope=auditScope(getState());if(!scope)return;const nextIdentity=scopeKey(scope);
    if(identity&&identity!==nextIdentity){filters=auditFilters();view={top:0,focus:null};source={kind:'unavailable',items:[]};mode='unavailable';review.querySelector('select').value=mode;}
    identity=nextIdentity;active=true;backPending=false;review.hidden=false;
    if(renderedHash===location.hash&&root.querySelector('.p22-app'))return;
    remember();const q=new URLSearchParams(location.hash.split('?')[1]);scene=q.get('scene')||'nfc';eventId=q.get('event')||'';
    const saved=history.state?.p22;if(saved?.journey===journey){filters={...saved.filters};view=saved.view||view;}
    if(validateQueryRange(filters)){filters.from='';filters.to='';}
    composing=false;clearTimeout(timer);render({focus:true,restore:scene==='nfc'});
    if(source.kind==='loading')void load();
  },hide,dispose(){hide();disposed=true;route.dispose();review.remove();root.removeEventListener('click',click);root.removeEventListener('input',input);root.removeEventListener('keydown',key);root.removeEventListener('compositionstart',composition);root.removeEventListener('compositionend',composition);window.removeEventListener('popstate',pickerNav,true);window.removeEventListener('hashchange',pickerNav,true);}};
}
