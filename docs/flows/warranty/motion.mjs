import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// M09 descendant feedback only; shell/overlay/domain/native scroll keep ownership.
export function mountWarrantyMotion({root,requested='auto',active=()=>true,media}){
 let controller=null,disposed=false;const errors=new Map(),receipts=new Set();
 const mark=(n,name)=>{if(n)n.dataset.motionPrimitive=name;return n;};
 const usable=()=>!disposed&&active()&&!root.closest('[inert]');
 function press(e){
  if(e.type==='keydown'&&(e.repeat||e.isComposing||!['Enter',' '].includes(e.key)))return;
  const n=e.target.closest?.('.p09-case,[data-p09-status],#p09-fault-select');
  if(!controller||!usable()||!n||!root.contains(n)||n.disabled||n.closest('[inert],dialog'))return;
  controller.pressFeedback(mark(n,'WarrantyPress'));
 }
 root.addEventListener('pointerdown',press);root.addEventListener('keydown',press);
 return {
  activate(){if(!disposed&&!controller)controller=createMotionController({element:root,requested,...(media?{media}:{})});},
  setMode(v){requested=v;controller?.setMode(v);},
  filter(n){controller?.cancel();if(usable())controller?.dataState(mark(n,'WarrantyFilter'));},
  tab(n){if(usable())controller?.noticeFeedback(mark(n,'CaseTabs'));},
  validation(n,key,message){const prior=errors.get(key)||'';errors.set(key,message);if(prior===message)return;if(!message){controller?.cancel();return;}if(usable())controller?.noticeFeedback(mark(n,'WarrantyFormFeedback'));},
  success(n,id){if(!id||receipts.has(id))return;receipts.add(id);if(usable())controller?.rowFeedback(mark(n,'WarrantySuccess'));},
  cancel(){controller?.cancel();},
  hide(){controller?.dispose();controller=null;},
  dispose(){disposed=true;controller?.dispose();controller=null;errors.clear();receipts.clear();root.removeEventListener('pointerdown',press);root.removeEventListener('keydown',press);},
 };
}
