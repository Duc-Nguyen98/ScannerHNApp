import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// M18 consumes M00. No commands, router, timers, scroll interception or renderer.
export function mountAttachmentMotion({root,requested='auto',active=()=>true,media}){
 let controller=null,disposed=false,observer=null,pendingPage=null;
 const errors=new Map(),checks=new Map();
 const usable=()=>!disposed&&active()&&!root.closest('[inert]')&&!root.ownerDocument.hidden&&!root.closest('.hn-screen')?.querySelector('.app-modal-host,.p03-host:not([hidden])');
 const mark=(node,name)=>{if(node)node.dataset.motionPrimitive=name;return node;};
 function stop(){controller?.cancel();pendingPage=null;for(const n of root.querySelectorAll('.p18-progress-fill,.p18-slot'))for(const a of n.getAnimations?.()||[])a.finish();}
 function attachmentVisibility(){root.dataset.attachmentMotionHidden=String(root.ownerDocument.hidden);if(!usable())stop();}
 function release(){if(!controller)return;stop();observer?.disconnect();observer=null;root.ownerDocument.removeEventListener('visibilitychange',attachmentVisibility);controller.dispose();controller=null;delete root.dataset.attachmentMotionHidden;}
 return {
  activate(){if(disposed||controller)return;controller=createMotionController({element:root,requested,...(media?{media}:{})});root.ownerDocument.addEventListener('visibilitychange',attachmentVisibility);observer=new MutationObserver(()=>{if(!usable())stop();});observer.observe(root,{attributes:true,attributeFilter:['inert','hidden']});attachmentVisibility();},
  setMode(value){requested=value;stop();controller?.setMode(value);},
  beforeRender:stop,
  row(node){if(usable())controller?.rowFeedback(mark(node,'AttachmentRow'));},
  pageRequested(key){controller?.cancel();pendingPage=key;},
  pageReady(node,key){if(pendingPage!==key)return;pendingPage=null;if(usable())controller?.noticeFeedback(mark(node,'ViewerShell'));},
  validation(node,key,message,{seed=false}={}){const previous=errors.get(key)||'';errors.set(key,message);if(!seed&&message&&previous!==message&&usable())controller?.noticeFeedback(mark(node,'HandoffFormFeedback'));},
  check(node,key,value,{seed=false}={}){const previous=checks.get(key);checks.set(key,value);if(!seed&&previous!==value&&usable())controller?.noticeFeedback(mark(node,'HandoffCheck'));},
  cancel:stop,
  hide:release,
  dispose(){if(disposed)return;release();disposed=true;errors.clear();checks.clear();},
 };
}
