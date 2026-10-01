import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// M23 consumes M00. Native scroll, route, overlay and business data remain with their owners.
export function mountWarrantySessionMotion({root,requested='auto',active=()=>true,media}){
 let controller=null,disposed=false,filterKey=null;
 const available=()=>!disposed&&active()&&!root.closest('[inert],[hidden]');
 function press(e){
  if(!available()||e.type==='keydown'&&(e.repeat||e.isComposing||!['Enter',' '].includes(e.key)))return;
  const node=e.target.closest?.('.p23-app button:not([data-p23-type])');
  if(!node||!root.contains(node)||node.disabled||node.getAttribute('aria-disabled')==='true'||node.matches('[data-hn-read-trigger]'))return;
  node.dataset.motionPrimitive=root.querySelector('.p23-app')?.dataset.panel?.match(/S0[12]$/)?'WarrantyHistorySelection':'ScanSessionSelection';
  controller?.pressFeedback(node);
 }
 function release(){controller?.dispose();controller=null;root.removeEventListener('pointerdown',press);root.removeEventListener('keydown',press);filterKey=null;}
 return {
  activate(){if(disposed||controller)return;controller=createMotionController({element:root,requested,...(media?{media}:{})});root.addEventListener('pointerdown',press);root.addEventListener('keydown',press);},
  setMode(value){requested=value;controller?.setMode(value);},
  seed(key){filterKey=key;},
  filter(key,node,family){
   const changed=filterKey!==null&&filterKey!==key;filterKey=key;
   if(!changed||!available())return;controller?.cancel();
   if(node){node.dataset.motionPrimitive=family==='warranty'?'WarrantyHistoryFilter':'ScanSessionFilter';controller?.noticeFeedback(node);}
  },
  cancel(){controller?.cancel();},
  hide:release,
  dispose(){disposed=true;release();},
 };
}
