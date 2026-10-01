import {acquireOverlayScrollLock} from './overlay-scroll-lock.mjs';
import {createMotionController} from './motion/motion-primitives.mjs';
const visualExits=new WeakMap();
// Native dialog semantics with a local app overlay. show(), intentionally NOT
// showModal(), keeps the dialog inside the preview transform/clip boundaries.
export function openAppModal({screen,parent=screen,dialog,tools,initialFocus,dismissOnBackdrop=true,motionMode=null,motionExit=false,onClose=()=>{}}) {
  visualExits.get(screen)?.();
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
  let closed=false,exiting=false,suppressExit=false;
  function removeVisual(){exiting=false;motion?.dispose();host.remove();if(visualExits.get(screen)===removeVisual)visualExits.delete(screen);}
  const focusables=()=>[...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(n=>!n.hidden&&n.getClientRects().length);
  function close({restoreFocus=true}={}){
    if(closed)return;closed=true;
    const showExit=motionExit&&!suppressExit&&motion?.mode==='auto'&&!screen.ownerDocument.hidden&&screen.isConnected&&!screen.closest('[inert]');
    motion?.cancel();
    document.removeEventListener('keydown',onKey,true);
    document.removeEventListener('focusin',onFocus,true);
    dialog.removeEventListener('close',onNativeClose);
    // Semantic close is immediate. Only inert presentation survives for160ms.
    const display=showExit?getComputedStyle(dialog).display:null;
    dialog.close();
    if(showExit){
      exiting=true;host.className='app-modal-visual-exit';host.inert=true;host.setAttribute('aria-hidden','true');host.style.pointerEvents='none';dialog.style.display=display;
      for(const node of [dialog,...dialog.querySelectorAll('*')])for(const attr of [...node.attributes])if(attr.name==='id'||attr.name==='role'||attr.name==='name'||attr.name.startsWith('aria-')||attr.name.startsWith('data-')&&attr.name!=='data-motion-primitive')node.removeAttribute(attr.name);
      visualExits.set(screen,removeVisual);
      const handles=[motion.backdropMotion(host,{exit:true}),motion.modalSheetMotion(dialog,{exit:true})];
      void Promise.all(handles.map(h=>h.finished)).then(removeVisual);
    }else removeVisual();
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
  return {close,setMotionMode(value){if(exiting)removeVisual();else motion?.setMode(value);},cancelMotion(){suppressExit=true;if(exiting)removeVisual();else motion?.cancel();}};
}
