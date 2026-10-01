import {sessionGuard} from '../home/home-flow.mjs';
import {createStatusAnnouncer} from '../shared/status-announcer.mjs';
import {createExceptionNavigation} from './navigation.mjs';

// Clipboard completion is independent of record/reconciliation. A timeout
// offers manual copying and never implies a successful write to the clipboard.
export function beginClipboardCopy(text,{write=value=>navigator.clipboard.writeText(value),timeoutMs=8000}={}){
 let done=false,timer,resolve;
 const promise=new Promise(r=>resolve=r);
 const finish=result=>{if(done)return;done=true;clearTimeout(timer);resolve(result);};
 timer=setTimeout(()=>finish('timeout'),timeoutMs);
 try{const operation=write(text);if(!operation||typeof operation.then!=='function')finish('failed');else operation.then(()=>finish('success'),()=>finish('failed'));}catch{finish('failed');}
 return {promise,cancel:()=>finish('cancelled')};
}

export function verificationText(state,canCheck){
 return state.busy?'Đang kiểm tra kết quả gửi…':!canCheck?'Cần đối chiếu trên Web':'Chưa xác định kết quả gửi';
}
export function reconciliationText(state,auth,owner){
 const d=state?.document,r=state?.request;
 if(sessionGuard(auth)||!state?.unknown||!r?.requestId||!d?.documentId||auth.session.actor.id!==d.actorId||auth.session.warehouse.id!==d.warehouseId||r.document?.documentId!==d.documentId||r.document?.actorId!==d.actorId||r.document?.warehouseId!==d.warehouseId||r.document?.scanSessionId!==d.scanSessionId||r.document?.version!==d.version)return null;
 const fields=[['Phiếu',d.number],['Loại',owner==='p05'?'Xuất kho':'Nhập kho'],['Request ID',r.requestId],['ID phiếu',d.documentId],['Phiên quét',d.scanSessionId],['Version',d.version]];
 return fields.map(([k,v])=>`${k}: ${v==null||v===''?'Chưa xác định':v}`).join('\n');
}
export function createExceptionExperience({root,owner,getState,getSnapshot,isActive,feedback,onBack=()=>{},clipboardTimeoutMs=8000}){
 let saved=null,wasException=false,lastUnknown=null,copyTask=null,epoch=0;
 const navigation=createExceptionNavigation({root,key:owner+'Exception',isActive,onBack});
 const announcer=createStatusAnnouncer({getScreen:()=>root.closest('.hn-screen'),isActive,key:owner+'-exception'});
 const input=()=>root.querySelector(`#${owner}-code`);
 function restore({manual=false}={}){
  const s=getSnapshot(),scroll=root.querySelector(`.${owner}-scroll`);
  if(!saved||saved.documentId!==s.document?.documentId||!scroll)return;
  let target=manual?input():saved.id?root.querySelector('#'+CSS.escape(saved.id)):saved.action?root.querySelector(`[data-${owner}="${CSS.escape(saved.action)}"]`):null;
  (target||root.querySelector(`[data-${owner}=manual]`)||root.querySelector('h1'))?.focus({preventScroll:true});
  if(manual&&target)target.select();
  else if(target?.setSelectionRange&&saved.selection)target.setSelectionRange(...saved.selection);
  scroll.scrollTop=saved.scroll;
  // Explicit correction must expose the caret, even when a camera event
  // interrupted the user at the bottom of a long list.
  if(manual&&target){const v=scroll.getBoundingClientRect(),scale=v.height/scroll.clientHeight,form=target.closest('form'),f=form?.getBoundingClientRect(),r=f&&f.height<=v.height-16*scale?f:target.getBoundingClientRect();if(scale>0){if(r.top<v.top+8*scale)scroll.scrollTop+=(r.top-v.top)/scale-8;else if(r.bottom>v.bottom-8*scale)scroll.scrollTop+=(r.bottom-v.bottom)/scale+8;}}
  else if(target){const r=target.getBoundingClientRect(),v=scroll.getBoundingClientRect();if(r.top<v.top||r.bottom>v.bottom)scroll.focus({preventScroll:true});}
 }
 return {
  before(s){
   if(saved&&saved.documentId!==s.document?.documentId)saved=null;
   if(s.exception&&!root.querySelector('.p17-app')){
    const scroll=root.querySelector(`.${owner}-scroll`),focused=root.contains(document.activeElement)?document.activeElement:null;
    if(scroll)saved={documentId:s.document.documentId,scroll:scroll.scrollTop,id:focused?.id,action:focused?.getAttribute(`data-${owner}`),selection:focused&&typeof focused.selectionStart==='number'?[focused.selectionStart,focused.selectionEnd]:null};
   }
  },
  exception(s,canCheck){wasException=!!s.exception;navigation.sync(!!s.exception&&!s.unknown);if(s.unknown)lastUnknown={requestId:s.request?.requestId,documentId:s.document?.documentId};announcer.say(s.unknown?verificationText(s,canCheck):s.exception?.panel==='P17.S02'?'Mã không thể xuất. Các mã hợp lệ được giữ nguyên.':'Mã không hợp lệ. Các mã hợp lệ được giữ nguyên.');},
  after(s){
   navigation.sync(false);
   if(wasException&&!s.exception){wasException=false;restore();announcer.say('Đã trở lại phiếu đang làm. Các mã hợp lệ được giữ nguyên.');}
   if(lastUnknown&&!s.unknown){const same=lastUnknown.requestId===s.request?.requestId&&lastUnknown.documentId===s.document?.documentId;lastUnknown=null;if(same&&s.recorded&&s.outcome==='recorded')announcer.say('Đã xác minh phiếu được ghi nhận. Chờ xử lý trên Web.');else if(same&&s.outcome==='not-recorded')announcer.say('Đã xác minh phiếu chưa được ghi nhận. Kiểm tra thông tin trước khi gửi lại.');}
  },
  restore,
  openReconciliation(){
   if(!isActive()||!reconciliationText(getSnapshot(),getState(),owner))return;
   const details=root.querySelector('.p17-identity'),scroll=root.querySelector('.p17-scroll');if(!details||!scroll)return;
   details.open=true;const summary=details.querySelector('summary');summary.focus({preventScroll:true});scroll.scrollTop=details.offsetTop-scroll.offsetTop;
  },
  async copy(){
   if(copyTask||!isActive())return;
   const state=getSnapshot(),text=reconciliationText(state,getState(),owner);
   if(!text){feedback.show({title:'Chưa thể sao chép',message:'Phiên hoặc quyền xem đã thay đổi. Hãy kiểm tra lại phiên thao tác.'});return;}
   const token=epoch,requestId=state.request.requestId;
   const button=root.querySelector(`[data-${owner}=copy-reconciliation]`),label=button?.textContent;
   if(button){button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='Đang sao chép…';}
   const task=beginClipboardCopy(text,{timeoutMs:clipboardTimeoutMs});copyTask=task;
   const result=await task.promise;if(copyTask===task)copyTask=null;
   if(button?.isConnected){button.disabled=false;button.removeAttribute('aria-busy');button.textContent=label;}
   if(result==='cancelled')return;
   const success=result==='success';
   if(token!==epoch||!isActive()||getSnapshot().request?.requestId!==requestId||!reconciliationText(getSnapshot(),getState(),owner))return;
   // Disabling a pending clipboard button can blur it in Chromium.
   // Establish the verified return target before opening the shared dialog.
   root.querySelector(`[data-${owner}=copy-reconciliation]`)?.focus({preventScroll:true});
   feedback.show(success?{title:'Đã sao chép thông tin yêu cầu',message:'Bạn có thể dán thông tin để chuyển cho người phụ trách đối chiếu.',tone:'success',confirmLabel:'Đã hiểu'}:{title:'Không thể sao chép tự động',message:'Bạn có thể chọn và sao chép thông tin bên dưới:\n\n'+text,confirmLabel:'Đóng',className:'hn-readable-dialog'});
  },
  hide(){epoch++;copyTask?.cancel();copyTask=null;navigation.hide();announcer.clear();},dispose(){epoch++;copyTask?.cancel();copyTask=null;navigation.dispose();saved=null;announcer.dispose();},
 };
}
