import {acquireOverlayScrollLock} from './overlay-scroll-lock.mjs';
import {createMotionController} from './motion/motion-primitives.mjs';
// Native dialog semantics with a local app overlay. show(), intentionally NOT
// showModal(), keeps the dialog inside the preview transform/clip boundaries.
export function openAppModal({screen,parent=screen,dialog,tools,initialFocus,dismissOnBackdrop=true,motionMode=null,onClose=()=>{}}) {
  const previousFocus=document.activeElement;
  const releaseScroll=acquireOverlayScrollLock(screen.ownerDocument);
  const host=document.createElement('div');host.className='app-modal-host';
  parent.append(host);host.append(dialog);
  // Opt-in only. The existing overlay owns both presentation and cleanup;
  // closing remains immediate, including expiry/permission changes.
  const motion=motionMode===null?null:createMotionController({element:host,requested:motionMode});
  dialog.setAttribute('aria-modal','true');
  const inert=[];
  // Inert siblings along the path up to the app shell, including its nav.
  let branch=host;
  while(branch!==screen&&branch.parentElement){
    for(const node of branch.parentElement.children)if(node!==branch){inert.push([node,node.inert]);node.inert=true;}
    branch=branch.parentElement;
  }
  if(tools){inert.push([tools,tools.inert]);tools.inert=true;}
  let closed=false;
  const focusables=()=>[...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(n=>!n.hidden&&n.getClientRects().length);
  function close({restoreFocus=true}={}){
    if(closed)return;closed=true;
    motion?.dispose();
    document.removeEventListener('keydown',onKey,true);
    document.removeEventListener('focusin',onFocus,true);
    dialog.removeEventListener('close',onNativeClose);
    dialog.close();host.remove();
    releaseScroll();
    for(const [node,prior]of inert)node.inert=prior;
    if(restoreFocus&&previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
    onClose();
  }
  const onNativeClose=()=>close();
  const focusFirst=()=> (dialog.querySelector(initialFocus)||focusables()[0]||dialog).focus({preventScroll:true});
  function onKey(e){
    if(dialog.closest('[inert]'))return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}
    if(e.key==='Tab'){
      const list=focusables(),i=list.indexOf(document.activeElement);
      if(!list.length){e.preventDefault();dialog.focus({preventScroll:true});}
      else if(i<0||e.shiftKey&&i===0||!e.shiftKey&&i===list.length-1){e.preventDefault();list[e.shiftKey?list.length-1:0].focus({preventScroll:true});}
    }
  }
  function onFocus(e){if(!closed&&!dialog.closest('[inert]')&&!dialog.contains(e.target))focusFirst();}
  // An ignored backdrop click must not move focus off the dialog's active button.
  host.addEventListener('pointerdown',e=>{if(e.target===host&&!dismissOnBackdrop)e.preventDefault();});
  host.addEventListener('click',e=>{if(e.target===host&&dismissOnBackdrop)close();});
  host.addEventListener('wheel',e=>{if(!e.target.closest('.app-modal-body,.app-modal-scroll'))e.preventDefault();},{passive:false});
  host.addEventListener('touchmove',e=>{if(!e.target.closest('.app-modal-body,.app-modal-scroll'))e.preventDefault();},{passive:false});
  dialog.addEventListener('close',onNativeClose);
  document.addEventListener('keydown',onKey,true);document.addEventListener('focusin',onFocus,true);
  dialog.show();focusFirst();
  if(motion){host.dataset.motionPrimitive='SharedModalBackdrop';dialog.dataset.motionPrimitive='SharedModalPanel';motion.backdropMotion(host);motion.modalSheetMotion(dialog);}
  return {close,setMotionMode:value=>motion?.setMode(value),cancelMotion:()=>motion?.cancel()};
}
