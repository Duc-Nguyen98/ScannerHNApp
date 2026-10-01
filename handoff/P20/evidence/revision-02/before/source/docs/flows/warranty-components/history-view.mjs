import {createComponentHistory} from './history-model.mjs';
import {createComponentHistoryFixture} from './history-fixture.mjs';
import {caseDetails,guardWarranty} from '../warranty/warranty-model.mjs';
import {createActionFeedback} from '../shared/action-feedback.mjs';
import {HOME_ICONS} from '../home/icons.mjs';
import {INBOUND_ICONS} from '../inbound/icons.mjs';
import {ISSUE_ICONS} from './issue-icons.mjs';
const esc=v=>String(v??'Chưa xác minh').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Plus copied verbatim from baseline warranty-components/flow.js.
const glyphs={...HOME_ICONS,...INBOUND_ICONS,...ISSUE_ICONS,plus:'<path d="M12 5v14M5 12h14"/>'};
const icon=n=>`<svg class="p19-icon" viewBox="0 0 24 24" aria-hidden="true">${glyphs[n]||glyphs.document}</svg>`;
const tile=(n,op='documents',size='md')=>`<span class="hn-operation-icon" data-hn-operation="${op}" data-size="${size}" aria-hidden="true">${icon(n)}</span>`;
const btn=(a,t,cls='',attrs='')=>`<button type="button" data-p20="${a}" class="${cls}" ${attrs}>${t}</button>`;
const readable=(value,label,lines=3)=>`<span data-hn-readable="${label}" data-hn-lines="${lines}">${esc(value)}</span>`;

export function mountComponentHistory({root,screen,tools,getState,getIssuedDocuments=()=>[],getPendingIssue=()=>null,onNavigate,onCase,onIssue,onSize}){
 let active=false,disposed=false,key='',entry=null,backPending=false;
 const entries=new Map();
 const feedback=createActionFeedback({getScreen:()=>screen,tools,isActive:()=>active&&!disposed,key:'hnP20Feedback'});
 const review=document.createElement('details');review.className='p20-tools';
 review.innerHTML=`<summary>P20 · Lịch sử linh kiện</summary><p>PROTOTYPE · Bộ nhớ trang, không kết nối WMS. Bốn panel B20 dùng dữ liệu riêng, không ghi vào hồ sơ. Reload mất dữ liệu thử.</p>${['history','history-loading','history-error','empty'].map((s,i)=>`<button data-p20-demo="${s}">P20.S0${i+1} · ${s}</button>`).join('')}<button data-p20-open>Mở lịch sử BH-001 trong app</button><label>Nguồn đọc mô phỏng <select data-p20-mode><option value="ready">Thành công</option><option value="error">Lỗi đọc</option><option value="slow">Tải chậm</option></select></label><pre data-p20-snapshot></pre>`;tools.append(review);
 const state=()=>entry.model.snapshot();
 function remember(){if(active&&entry){entry.top=root.querySelector('.p20-scroll')?.scrollTop||0;entry.focus=document.activeElement?.closest('[data-p20]')?.dataset.p20||entry.focus;}}
 function blocked(){return entry?.model.guard()||guardWarranty(getState(),state().caseId);}
 function context(c){return `<section class="p19-card p20-context"><div class="p20-context-top">${tile('tool','warranty')}<div><strong>${readable(c.id,'Mã hồ sơ',2)}</strong><p>${readable(c.model,'Sản phẩm bảo hành')}</p></div><span class="p19-badge">${esc(c.status)}</span></div><p class="p20-serial">SN: ${readable(c.serial,'Serial',2)}</p><div class="p20-customer"><span>Khách hàng</span><strong>${readable(c.customer,'Khách hàng')}</strong></div></section>`;}
 function receipt(d){const groups=new Map();for(const l of d.lines){const k=l.sku??l.code??groups.size;if(!groups.has(k))groups.set(k,{sku:l.sku,name:l.name,quantity:0,known:true,codes:new Set()});const g=groups.get(k);if(Number.isSafeInteger(l.quantity)&&l.quantity>0)g.quantity+=l.quantity;else g.known=false;if(l.code)g.codes.add(l.code);}
  return `<article class="p20-receipt" tabindex="-1" data-p20-document="${esc(d.id)}"><header>${tile('document','documents','sm')}<strong>${readable(d.id,'Mã phiếu',2)}</strong><span class="p19-badge p19-posted">Đã xuất</span></header><p class="p20-time">${esc(d.at)}</p>${[...groups.values()].map(l=>`<div class="p20-line"><div><strong>${readable(l.sku,'SKU linh kiện',2)}</strong><p>${readable(l.name,'Tên linh kiện')}</p></div><div class="p20-quantity"><strong>${l.known?l.quantity+' linh kiện':'Chưa xác minh'}</strong><small>${l.codes.size?l.codes.size+' mã/hộp':'Mã/hộp chưa xác minh'}</small></div></div>`).join('')}${d.note?`<p class="p20-note">${readable(d.note,'Ghi chú',2)}</p>`:''}</article>`;
 }
 function render(){if(!active||disposed||!entry)return;const s=state(),c=caseDetails(s.caseId),denied=entry.model.guard();
  root.innerHTML=`<section class="p19-app p20-app"><header class="p19-header">${btn('back',icon('back'),'p19-icon-button','aria-label="Trở về màn trước"')}<h1 tabindex="-1">Hồ sơ bảo hành</h1></header><main class="p19-scroll p20-scroll" tabindex="-1" aria-label="Lịch sử linh kiện">${c&&!denied?`${context(c)}<section class="p19-card p20-history"><div class="p20-heading"><h2>Linh kiện đã xuất</h2><span class="p19-badge" data-p20-count></span></div><p class="p20-caption">Phiếu đã xác nhận xuất kho cho hồ sơ này.</p><div data-p20-list></div><div data-p20-state></div><div data-p20-paging></div></section>${btn('info','Thông tin & quá trình xử lý '+icon('arrow'),'p19-card p20-info')}`:`<section class="p19-card"><h2>Chưa thể xem lịch sử</h2><p>${esc(denied||'Không tìm thấy hồ sơ bảo hành.')}</p></section>`}</main>${c&&!denied?`<footer class="p19-footer p20-footer"><p data-p20-block></p>${btn('issue','Xuất linh kiện '+icon('plus'),'p19-primary')}</footer>`:''}<span class="p19-live" role="status" aria-live="polite" data-p20-live></span></section>`;
  sync();root.querySelector('.p20-scroll').scrollTop=entry.top||0;const target=entry.focus&&root.querySelector(`[data-p20="${entry.focus}"]:not(:disabled)`);(target||root.querySelector('h1')).focus({preventScroll:true});onSize();
 }
 function sync(){if(!active||disposed||!entry||!root.querySelector('.p20-app'))return;const s=state(),list=root.querySelector('[data-p20-list]');if(!list)return;
  const scroll=root.querySelector('.p20-scroll'),top=scroll.scrollTop,focus=document.activeElement,focusPaging=focus?.dataset.p20==='load';
  // Disabled buttons may lose browser focus; retain the origin without taking
  // focus back if the user moves elsewhere during the asynchronous read.
  if(s.loading&&focusPaging)entry.loadFocus=focus;
  if(s.loading&&s.loaded){const block=root.querySelector('.p20-history');block.style.minHeight=block.offsetHeight+'px';}
  const denied=entry.model.guard();if(denied){render();return;}
  const app=root.querySelector('.p20-app');app.dataset.panel=s.loading&&s.loaded?'P20.S02':s.error&&s.loaded?'P20.S03':s.loaded&&!s.items.length&&!s.hasMore?'P20.S04':'P20.S01';
  app.setAttribute('aria-busy',String(s.loading));
  root.querySelector('[data-p20-count]').textContent=s.loaded?`${s.items.length} phiếu đã tải`:'Chưa xác minh';
  const ids=new Set([...list.children].map(n=>n.dataset.p20Document));for(const d of s.items)if(!ids.has(d.id))list.insertAdjacentHTML('beforeend',receipt(d));
  root.querySelector('[data-p20-state]').innerHTML=s.loading?`<div class="p20-skeleton" aria-hidden="true"></div>`:s.error?`<aside class="p20-error">${icon('info')}<p>${s.loaded?'Chưa tải được các phiếu tiếp theo. Phiếu đã tải vẫn được giữ lại.':'Chưa tải được lịch sử. Chưa xác minh có phiếu đã xuất.'}</p></aside>`:s.loaded&&!s.items.length&&!s.hasMore?`<div class="p20-empty">${tile('box','documents','lg')}<h2>Chưa có linh kiện đã xuất</h2><p>Phiếu xuất sẽ xuất hiện ở đây sau khi được xác nhận.</p></div>`:'';
  const paging=root.querySelector('[data-p20-paging]');let load=paging.querySelector('button');
  if(s.loading||s.error||s.hasMore){if(!load){paging.innerHTML=btn('load','','p20-secondary');load=paging.firstElementChild;}load.disabled=s.loading;load.textContent=s.loading?s.loaded?'Đang tải thêm phiếu…':'Đang tải lịch sử…':s.error?'Thử tải lại':'Tải thêm phiếu';}
  else paging.innerHTML=s.loaded&&s.items.length?'<p class="p20-end" tabindex="-1">Đã tải hết phiếu đã xuất</p>':'';
  const pending=getPendingIssue(s.caseId),reason=blocked();root.querySelector('[data-p20=issue]').disabled=!!reason||!!pending?.busy;
  root.querySelector('[data-p20=issue]').innerHTML=(pending?pending.unknown?'Đối chiếu kết quả xuất':pending.busy?'Đang xác nhận xuất…':'Tiếp tục phiếu linh kiện':'Xuất linh kiện '+icon('plus'));
  const note=root.querySelector('[data-p20-block]');note.textContent=reason|| (pending?'Giữ đúng phiếu đang làm; chưa ghi nhận vào lịch sử đã xuất.':'');note.hidden=!note.textContent;
  root.querySelector('[data-p20-live]').textContent=s.loading?'Đang tải lịch sử':s.error?'Không tải được lịch sử':s.loaded?`${s.items.length} phiếu đã tải${s.hasMore?'':'. Đã tải hết'}`:'';
  review.querySelector('[data-p20-snapshot]').textContent=JSON.stringify({...s,fixture:!!entry.sample,requests:entry.adapter.metrics()},null,2);
  scroll.scrollTop=top;
  if(!s.loading){if((focusPaging||entry.loadFocus&&document.activeElement===document.body)&&!screen.querySelector('.app-modal-host')&&(document.activeElement===focus||document.activeElement===document.body)) (paging.querySelector('button')||paging.querySelector('.p20-end')||root.querySelector('[data-p20=info]')).focus({preventScroll:true});entry.loadFocus=null;}
 }
 async function load(){if(!active||entry.model.guard())return;remember();await entry.model.load();}
 function click(e){const b=e.target.closest('[data-p20]');if(!active||!b||b.disabled||disposed)return;const action=b.dataset.p20;if(action==='back'){if(backPending)return;remember();backPending=true;if(history.state?.p20From)history.back();else onCase(state().caseId,'parts');return;}const denied=entry.model.guard();if(denied){feedback.show({title:'Chưa thể tiếp tục',message:denied});return;}if(action==='load'){load();return;}remember();if(action==='info')onCase(state().caseId,'info');if(action==='issue'){const error=blocked(),pending=getPendingIssue(state().caseId);if(error){feedback.show({title:'Chưa thể xuất linh kiện',message:error});return;}onIssue(state().caseId,pending?.document.documentId);}}
 root.addEventListener('click',click);
 review.addEventListener('change',e=>{if(e.target.matches('[data-p20-mode]'))entry?.adapter.setMode(e.target.value);});
 review.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const sample=b.dataset.p20Demo;if(sample||b.hasAttribute('data-p20-open'))onNavigate({case:'BH-001',...(sample?{sample}:{})});});
 return {show(){if(disposed)return;remember();active=true;backPending=false;const q=new URLSearchParams(location.hash.split('?')[1]),id=q.get('case'),sample=['history','history-loading','history-error','empty'].includes(q.get('sample'))?q.get('sample'):null;const nextKey=JSON.stringify([id,sample]);if(key!==nextKey)entry?.model.cancel();key=nextKey;
   if(!entries.has(key)){const adapter=createComponentHistoryFixture({getIssuedDocuments,sample}),item={adapter,sample,top:0,model:null};item.model=createComponentHistory({getState,adapter,onChange:()=>{if(active&&entry===item)sync();}});item.model.select(id);entries.set(key,item);}entry=entries.get(key);if(!sample)entry.model.addVerified(getIssuedDocuments());render();
   if(!state().loaded&&!state().loading&&!state().error){const owner=entry;void owner.model.load().then(()=>{if(!active||entry!==owner)return;if(sample==='history-loading'&&state().hasMore){owner.adapter.setMode('slow');void owner.model.load();}if(sample==='history-error'&&state().hasMore){owner.adapter.setMode('error');void owner.model.load();}});}
  },hide(){if(!active)return;remember();active=false;entry?.model.cancel();feedback.clear();},dispose(){active=false;disposed=true;for(const e of entries.values())e.model.dispose();entries.clear();feedback.dispose();review.remove();root.removeEventListener('click',click);}};
}
