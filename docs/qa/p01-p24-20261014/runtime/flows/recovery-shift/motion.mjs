import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// FormFeedback and a verified recovery receipt only. M02 owns shift routes;
// app-modal owns modal motion. No domain/scroll callbacks or input animation.
export function mountRecoveryMotion({root,requested='auto',active=()=>true,media}){
 let controller=null,disposed=false,error='';const seen=new Set();
 const usable=()=>!disposed&&active()&&!root.closest('[inert]');
 const mark=(node,name)=>{if(node)node.dataset.motionPrimitive=name;return node;};
 function press(e){if(e.type==='keydown'&&(e.repeat||e.isComposing||!['Enter',' '].includes(e.key)))return;const node=e.target.closest?.('button');if(!controller||!usable()||!node||!root.contains(node)||node.disabled||node.closest('dialog,[inert],[hidden]'))return;controller.pressFeedback(mark(node,'RecoveryShiftPress'));}
 root.addEventListener('pointerdown',press);root.addEventListener('keydown',press);
 return {
  activate(){if(!disposed&&!controller)controller=createMotionController({element:root,requested,...(media?{media}:{})});},
  validation(node,message){const prior=error;error=message;if(!message){controller?.cancel();return;}if(prior!==message&&usable())controller?.noticeFeedback(mark(node,'RecoveryFormError'));},
  receipt(node,id){if(!id||seen.has(id))return;seen.add(id);if(usable())controller?.rowFeedback(mark(node,'RecoveryReceipt'));},
  setMode(value){requested=value;controller?.setMode(value);},cancel(){controller?.cancel();},
  hide(){controller?.dispose();controller=null;},
  dispose(){disposed=true;controller?.dispose();controller=null;seen.clear();root.removeEventListener('pointerdown',press);root.removeEventListener('keydown',press);},
 };
}
