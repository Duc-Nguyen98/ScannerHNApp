import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// M20 presentation only. Native rows/scroll and the read owner remain static.
export function mountPostedHistoryMotion({root,screen,requested='auto',active=()=>true,media}){
 let controller=null,observer=null,disposed=false,suspended=false;
 const states=new Map();
 const available=()=>!disposed&&!suspended&&active()&&!root.ownerDocument.hidden&&!root.closest('[inert]')&&!screen.querySelector('.app-modal-host,.p03-host:not([hidden])');
 function visibility(){root.dataset.p20MotionPaused=String(!available());if(!available())controller?.cancel();}
 function release(){if(!controller)return;controller.dispose();controller=null;observer?.disconnect();observer=null;root.ownerDocument.removeEventListener('visibilitychange',visibility);delete root.dataset.p20MotionPaused;}
 return {
  activate(){if(disposed||controller)return;suspended=false;controller=createMotionController({element:root,requested,...(media?{media}:{})});root.ownerDocument.addEventListener('visibilitychange',visibility);observer=new MutationObserver(visibility);observer.observe(screen,{subtree:true,childList:true,attributes:true,attributeFilter:['inert','hidden']});visibility();},
  state(identity,kind,node){const prior=states.get(identity);states.set(identity,kind);if(prior===kind||!['error','empty'].includes(kind)||!node)return;if(available()){node.dataset.motionPrimitive=kind==='error'?'PostedHistoryError':'PostedHistoryEmpty';controller?.dataState(node);}},
  beforeRender(){controller?.cancel();},
  setMode(value){requested=value;controller?.setMode(value);},
  cancel(){suspended=true;controller?.cancel();visibility();},
  hide:release,
  dispose(){if(disposed)return;release();disposed=true;states.clear();},
 };
}
