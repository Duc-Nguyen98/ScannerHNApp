import {openAppModal} from '../shared/app-modal.mjs';
import {createDialogRoute} from '../shared/dialog-route.mjs';
const esc=v=>String(v??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Domain rows inside the existing app modal; no new screen or backend request.
export function createRecordDialog({screen,tools,isActive,onChoose,motionMode=null}){
 let modal=null,disposed=false,epoch=0;
 const route=createDialogRoute({history,location,key:'hnP14RecordDialog'});
 const navigation=e=>{if(disposed)return;if(route.navigation(()=>modal?.close(),()=>!!modal))e.stopImmediatePropagation();};
 window.addEventListener('popstate',navigation,true);window.addEventListener('hashchange',navigation,true);
 return {show(records,{summary=false,readOnly=false}={}){
  if(disposed||!isActive()||modal||route.isClosing()||screen.querySelector('.app-modal-host'))return;
  const rows=structuredClone(records),dialog=document.createElement('dialog'),token=++epoch;let selected=null;
  dialog.className='p07-dialog hn-action-dialog p14-record-dialog';dialog.setAttribute('aria-labelledby','p14-record-title');
  dialog.innerHTML=`<h2 id="p14-record-title" class="app-modal-heading">${summary?'Phiếu nháp khi kết thúc ca':'Phiếu đang thực hiện'} (${rows.length})</h2><div class="app-modal-body"><p class="p14-record-intro">${summary?'Thông tin tại thời điểm kết thúc ca. Phiếu phát sinh sau đó không thuộc tổng kết này.':readOnly?'Thông tin phiếu hiện tại. Đối chiếu kết quả trước khi tiếp tục xử lý.':'Chọn đúng phiếu cần tiếp tục xử lý.'}</p>${rows.map((r,i)=>`<article class="p14-dialog-record"><h3>${esc(r.document.number||r.document.documentId)}</h3><p>${esc(r.operation==='outbound'?'Xuất kho':r.operation==='inbound'?'Nhập kho':'Phiếu đang làm')} · ${esc(summary?'Đã lưu nháp':r.displayStatus)}</p>${!summary&&!readOnly?`<button type="button" class="p14-secondary" data-record-choose="${i}">Tiếp tục phiếu</button>`:''}<details><summary>Thông tin đối chiếu</summary><dl>${[['ID phiếu',r.document.documentId],['Phiên quét',r.document.scanSessionId],['Phiên bản',r.document.version]].map(([l,v])=>`<div><dt>${l}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></details></article>`).join('')||'<p>Không có phiếu nháp trong nguồn này.</p>'}</div><footer class="app-modal-footer"><button type="button" class="hn-action-primary" data-record-close>Đóng</button></footer>`;
  // Native summary elements must be included in the shared modal's tab cycle.
  dialog.querySelectorAll('details>summary').forEach(node=>node.tabIndex=0);
  route.begin();modal=openAppModal({screen,tools,dialog,motionMode,initialFocus:'[data-record-close]',dismissOnBackdrop:false,onClose(){modal=null;route.closed();void route.ready().then(()=>{if(!disposed&&isActive()&&epoch===token&&selected)onChoose(selected);});}});
  dialog.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-record-close'))modal?.close();else if(b.hasAttribute('data-record-choose')){selected=rows[Number(b.dataset.recordChoose)];modal?.close();}});
 },setMotionMode(value){motionMode=value;modal?.setMotionMode(value);},cancelMotion(){modal?.cancelMotion();},clear(){epoch++;modal?.close();},dispose(){disposed=true;epoch++;route.dispose();modal?.close();window.removeEventListener('popstate',navigation,true);window.removeEventListener('hashchange',navigation,true);}};
}
