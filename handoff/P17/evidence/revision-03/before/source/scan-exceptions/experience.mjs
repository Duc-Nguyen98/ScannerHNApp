import {sessionGuard} from '../home/home-flow.mjs';
import {createStatusAnnouncer} from '../shared/status-announcer.mjs';

export function verificationText(state,canCheck){
 return state.busy?'Đang kiểm tra kết quả gửi…':!canCheck?'Cần đối chiếu trên Web':'Chưa xác định kết quả gửi';
}
export function reconciliationText(state,auth,owner){
 const d=state?.document,r=state?.request;
 if(sessionGuard(auth)||!state?.unknown||!r?.requestId||!d?.documentId||auth.session.actor.id!==d.actorId||auth.session.warehouse.id!==d.warehouseId||r.document?.documentId!==d.documentId||r.document?.actorId!==d.actorId||r.document?.warehouseId!==d.warehouseId||r.document?.scanSessionId!==d.scanSessionId||r.document?.version!==d.version)return null;
 const fields=[['Phiếu',d.number],['Loại',owner==='p05'?'Xuất kho':'Nhập kho'],['Request ID',r.requestId],['ID phiếu',d.documentId],['Phiên quét',d.scanSessionId],['Version',d.version]];
 return fields.map(([k,v])=>`${k}: ${v==null||v===''?'Chưa xác định':v}`).join('\n');
}
export function createExceptionExperience({root,owner,getState,getSnapshot,isActive,feedback}){
 let saved=null,wasException=false,lastUnknown=null,copying=false,epoch=0;
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
 }
 return {
  before(s){
   if(saved&&saved.documentId!==s.document?.documentId)saved=null;
   if(s.exception&&!root.querySelector('.p17-app')){
    const scroll=root.querySelector(`.${owner}-scroll`),focused=root.contains(document.activeElement)?document.activeElement:null;
    if(scroll)saved={documentId:s.document.documentId,scroll:scroll.scrollTop,id:focused?.id,action:focused?.getAttribute(`data-${owner}`),selection:focused&&typeof focused.selectionStart==='number'?[focused.selectionStart,focused.selectionEnd]:null};
   }
  },
  exception(s,canCheck){wasException=!!s.exception;if(s.unknown)lastUnknown={requestId:s.request?.requestId,documentId:s.document?.documentId};announcer.say(s.unknown?verificationText(s,canCheck):s.exception?.panel==='P17.S02'?'Mã không thể xuất. Các mã hợp lệ được giữ nguyên.':'Mã không hợp lệ. Các mã hợp lệ được giữ nguyên.');},
  after(s){
   if(wasException&&!s.exception){wasException=false;restore();announcer.say('Đã trở lại phiếu đang làm. Các mã hợp lệ được giữ nguyên.');}
   if(lastUnknown&&!s.unknown){const same=lastUnknown.requestId===s.request?.requestId&&lastUnknown.documentId===s.document?.documentId;lastUnknown=null;if(same&&s.recorded&&s.outcome==='recorded')announcer.say('Đã xác minh phiếu được ghi nhận. Chờ xử lý trên Web.');else if(same&&s.outcome==='not-recorded')announcer.say('Đã xác minh phiếu chưa được ghi nhận. Kiểm tra thông tin trước khi gửi lại.');}
  },
  restore,
  async copy(){
   if(copying||!isActive())return;
   const state=getSnapshot(),text=reconciliationText(state,getState(),owner);
   if(!text){feedback.show({title:'Chưa thể sao chép',message:'Phiên hoặc quyền xem đã thay đổi. Hãy kiểm tra lại phiên thao tác.'});return;}
   const token=epoch,requestId=state.request.requestId;copying=true;
   const button=root.querySelector(`[data-${owner}=copy-reconciliation]`);if(button)button.disabled=true;
   let success=false;try{await navigator.clipboard.writeText(text);success=true;}catch{}finally{copying=false;if(button?.isConnected)button.disabled=false;}
   if(token!==epoch||!isActive()||getSnapshot().request?.requestId!==requestId||!reconciliationText(getSnapshot(),getState(),owner))return;
   // Disabling a pending clipboard button can blur it in Chromium.
   // Establish the verified return target before opening the shared dialog.
   root.querySelector(`[data-${owner}=copy-reconciliation]`)?.focus({preventScroll:true});
   feedback.show(success?{title:'Đã sao chép thông tin yêu cầu',message:'Bạn có thể dán thông tin để chuyển cho người phụ trách đối chiếu.',tone:'success',confirmLabel:'Đã hiểu'}:{title:'Không thể sao chép tự động',message:'Bạn có thể chọn và sao chép thông tin bên dưới:\n\n'+text,confirmLabel:'Đóng',className:'hn-readable-dialog'});
  },
  hide(){epoch++;announcer.clear();},dispose(){epoch++;saved=null;announcer.dispose();},
 };
}
