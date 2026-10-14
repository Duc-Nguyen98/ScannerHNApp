import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// M21 presentation only; the retained P19 owner alone reads/checks/mutates data.
export function mountComponentResumeMotion({root,screen,requested='auto',active=()=>true,media}){
 let controller=null,observer=null,disposed=false,suspended=false;
 const notices=new Set();
 const usable=()=>!disposed&&!suspended&&active()&&!root.ownerDocument.hidden&&!root.closest('[inert]')&&!screen.querySelector('.app-modal-host,.p03-host:not([hidden])');
 function visibility(){root.dataset.p21MotionPaused=String(!usable());if(!usable())controller?.cancel();}
 function press(e){if(e.type==='keydown'&&(e.repeat||e.isComposing||!['Enter',' '].includes(e.key)))return;if(e.type==='pointerdown'&&e.button!==0)return;
  const node=e.target.closest?.('.p21-app [data-p21="open"]');if(!usable()||!node||node.disabled||node.getAttribute('aria-disabled')==='true')return;
  node.dataset.motionPrimitive='DraftList';controller?.pressFeedback(node);
 }
 function release(){if(!controller)return;root.removeEventListener('pointerdown',press);root.removeEventListener('keydown',press);root.ownerDocument.removeEventListener('visibilitychange',visibility);observer?.disconnect();observer=null;controller.dispose();controller=null;delete root.dataset.p21MotionPaused;}
 return {
  activate(){if(disposed||controller)return;suspended=false;controller=createMotionController({element:root,requested,...(media?{media}:{})});root.addEventListener('pointerdown',press);root.addEventListener('keydown',press);root.ownerDocument.addEventListener('visibilitychange',visibility);observer=new MutationObserver(visibility);observer.observe(screen,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','inert']});visibility();},
  reconcile(identity,node){if(!identity||notices.has(identity))return;notices.add(identity);if(usable()&&node){node.dataset.motionPrimitive='ReconcileNotice';controller?.noticeFeedback(node);}},
  beforeRender(){controller?.cancel();},
  setMode(value){requested=value;controller?.setMode(value);},
  cancel(){suspended=true;controller?.cancel();visibility();},hide:release,
  dispose(){if(disposed)return;release();disposed=true;notices.clear();},
 };
}
