import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// Presentation only; scan/Post results and receipt identity come from the owner.
export function mountComponentIssueMotion({root,requested='auto',active=()=>true,media}){
 let controller=null,disposed=false,observer=null;
 const receipts=new Set();
 const receiptKey=r=>JSON.stringify([r.caseId,r.requestId,r.id]);
 const usable=()=>!disposed&&active()&&!root.closest('[inert]')&&!root.ownerDocument.hidden&&!root.closest('.hn-screen')?.querySelector('.app-modal-host,.p03-host:not([hidden])');
 const mark=(node,name)=>{if(node)node.dataset.motionPrimitive=name;return node;};
 function issueVisibility(){if(!usable())controller?.cancel();}
 function press(e){if(e.type==='keydown'&&(e.repeat||e.isComposing||!['Enter',' '].includes(e.key)))return;const node=e.target.closest?.('.p19-app [data-p19=post],.p19-app [data-p19=reconcile]');if(usable()&&node&&!node.disabled)controller?.pressFeedback(mark(node,'PostPress'));}
 function release(){if(!controller)return;root.removeEventListener('pointerdown',press);root.removeEventListener('keydown',press);root.ownerDocument.removeEventListener('visibilitychange',issueVisibility);observer?.disconnect();observer=null;controller.dispose();controller=null;}
 return {
  activate(){if(disposed||controller)return;controller=createMotionController({element:root,requested,...(media?{media}:{})});root.addEventListener('pointerdown',press);root.addEventListener('keydown',press);root.ownerDocument.addEventListener('visibilitychange',issueVisibility);observer=new MutationObserver(issueVisibility);observer.observe(root,{attributes:true,attributeFilter:['inert','hidden']});},
  accepted(node){controller?.cancel();if(usable())controller?.rowFeedback(mark(node,'ComponentScan'));},
  seedReceipt(receipt){if(receipt?.id)receipts.add(receiptKey(receipt));},
  posted(node,receipt){if(!receipt?.id||receipt.status!=='POSTED'||receipts.has(receiptKey(receipt)))return;receipts.add(receiptKey(receipt));if(usable())controller?.rowFeedback(mark(node,'PostFeedback'));},
  beforeRender(){controller?.cancel();},
  setMode(value){requested=value;controller?.setMode(value);},
  cancel(){controller?.cancel();},hide:release,
  dispose(){if(disposed)return;release();disposed=true;receipts.clear();},
 };
}
