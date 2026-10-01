import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// M12 owns feedback on existing descendants. M02 alone owns route opacity;
// native scrolling, overlays, data reads and mutations retain their owners.
export function mountDocumentsMotion({root,requested='auto',active=()=>true,media}){
 let controller=null,disposed=false;const errors=new Map();
 const usable=()=>!disposed&&active()&&!root.closest('[inert]');
 const mark=(node,name)=>{if(node)node.dataset.motionPrimitive=name;return node;};
 function visibility(){root.dataset.documentMotionHidden=String(root.ownerDocument.hidden);}
 function release(){if(!controller)return;controller.dispose();controller=null;errors.clear();root.ownerDocument.removeEventListener('visibilitychange',visibility);delete root.dataset.documentMotionHidden;}
 return {
  activate(initialErrors={}){if(!disposed&&!controller){for(const [key,value]of Object.entries(initialErrors))errors.set(key,value);controller=createMotionController({element:root,requested,...(media?{media}:{})});root.ownerDocument.addEventListener('visibilitychange',visibility);visibility();}},
  setMode(value){requested=value;controller?.setMode(value);},
  filter(node){if(usable())controller?.dataState(mark(node,'DocumentFilter'));},
  select(row){if(!usable()||!row)return;root.querySelectorAll('[data-p12-selected]').forEach(n=>n.removeAttribute('data-p12-selected'));row.dataset.p12Selected='true';controller?.rowFeedback(mark(row.querySelector('.p12-product-copy'),'DocumentSelection'));},
  validation(node,key,message){const previous=errors.get(key)||'';errors.set(key,message);if(message&&previous!==message&&usable())controller?.noticeFeedback(mark(node,'DocumentFormError'));},
  cancel(){controller?.cancel();},
  hide:release,
  dispose(){disposed=true;release();},
 };
}
