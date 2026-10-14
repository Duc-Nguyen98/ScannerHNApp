import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// P03 owns this one live host. Presentation completion only removes outgoing DOM.
// Domain state, focus/inert, routing and lock release are committed by dialogs.mjs.
export function mountDialogMotion({host,requested='auto',media}){
  const motion=createMotionController({element:host,requested,...(media?{media}:{})});
  let epoch=0,exiting=false,disposed=false;
  function cancel(){
    epoch++;motion.cancel();
    if(exiting){host.replaceChildren();host.hidden=true;}
    exiting=false;host.inert=false;host.removeAttribute('aria-hidden');host.style.removeProperty('pointer-events');host.removeAttribute('data-motion-phase');
  }
  function enter(panel){
    if(disposed)return;
    cancel();const generation=epoch;
    host.dataset.motionPhase='enter';
    const handles=[motion.backdropMotion(host.querySelector('.p03-backdrop')),motion.modalSheetMotion(host.querySelector('.p03-dialog'),{fadeOnly:panel==='P03.S03'})];
    void Promise.all(handles.map(h=>h.finished)).then(()=>{if(generation===epoch)host.removeAttribute('data-motion-phase');});
  }
  function exit(panel){
    cancel();if(disposed)return;
    const generation=epoch;
    if(motion.mode!=='auto'||host.ownerDocument.hidden){host.replaceChildren();host.hidden=true;return;}
    exiting=true;host.dataset.motionPhase='exit';host.inert=true;host.setAttribute('aria-hidden','true');host.style.pointerEvents='none';
    // The outgoing subtree has no active semantics, identifiers or focus targets.
    for(const node of host.querySelectorAll('[id],[data-panel],[role],[aria-labelledby],[aria-describedby]')){
      for(const attr of ['id','data-panel','role','aria-labelledby','aria-describedby'])node.removeAttribute(attr);
    }
    const handles=[motion.backdropMotion(host.querySelector('.p03-backdrop'),{exit:true}),motion.modalSheetMotion(host.querySelector('.p03-dialog'),{exit:true,fadeOnly:panel==='P03.S03'})];
    void Promise.all(handles.map(h=>h.finished)).then(()=>{if(generation===epoch)cancel();});
  }
  return {enter,exit,cancel,setMode(value){cancel();motion.setMode(value);},get activeCount(){return motion.activeCount;},dispose(){if(disposed)return;cancel();disposed=true;motion.dispose();}};
}
