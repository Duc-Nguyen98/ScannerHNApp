import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// A consumer of M00, not a route/scroll/data provider. No business callbacks.
export function mountNfcAuditMotion({root,requested='auto',active=()=>true,media,hub=false}){
 let controller=null,disposed=false,filterKey=null;
 const available=()=>!disposed&&active()&&!root.closest('[inert],[hidden]');
 function press(e){
  if(!hub||!available()||e.type==='keydown'&&(e.repeat||e.isComposing||!['Enter',' '].includes(e.key)))return;
  const node=e.target.closest?.('.history-link,.phone-header button,.phone-footer button');
  if(!node||!root.contains(node)||node.disabled||node.getAttribute('aria-disabled')==='true')return;
  node.dataset.motionPrimitive='HistoryHub';controller?.pressFeedback(node);
 }
 function release(){controller?.dispose();controller=null;root.removeEventListener('pointerdown',press);root.removeEventListener('keydown',press);filterKey=null;}
 return {
  activate(){if(disposed||controller)return;controller=createMotionController({element:root,requested,...(media?{media}:{})});if(hub){root.addEventListener('pointerdown',press);root.addEventListener('keydown',press);}},
  setMode(value){requested=value;controller?.setMode(value);},
  seed(key){filterKey=key;},
  filter(key,node,tab){const changed=filterKey!==null&&filterKey!==key;filterKey=key;if(!changed||!available())return;controller?.cancel();if(node){node.dataset.motionPrimitive='NfcAuditFilter';controller?.dataState(node);}if(tab){tab.dataset.motionPrimitive='NfcAuditIndicator';controller?.noticeFeedback(tab);}},
  cancel(){controller?.cancel();},
  hide:release,
  dispose(){disposed=true;release();},
 };
}
