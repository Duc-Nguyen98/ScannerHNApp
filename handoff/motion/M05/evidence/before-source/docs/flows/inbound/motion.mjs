import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// Scan/Form/SubmitFeedback only; no commands, camera, router or scroll ownership.
export function mountInboundMotion({root,isActive,requested='auto'}) {
  let controller=null,disposed=false;
  const seenEvents=new Set(),seenReceipts=new Set(),errors=new Map();
  const active=()=>!disposed&&isActive()&&!root.hidden&&!root.closest('[inert]')&&!root.closest('.hn-screen')?.querySelector('.p03-host:not([hidden]),.app-modal-host');
  function label(node,consumer){if(node)node.dataset.hnMotionConsumer=consumer;return node;}
  function focus(event){
    if(!controller||!active()||!event.target.matches('input:not([readonly]):not([disabled]),textarea:not([readonly]):not([disabled]),[data-p04-select]:not([disabled])'))return;
    const node=event.target.closest('.p04-input');if(node)controller.noticeFeedback(label(node,'FormFeedback'));
  }
  root.addEventListener('focusin',focus);
  return {
    activate(){if(!disposed&&!controller)controller=createMotionController({element:root,requested});},
    setMode(value){requested=value;controller?.setMode(value);},
    beforeRender(){controller?.cancel();},
    validation(node,key,message){const old=errors.get(key)||'';errors.set(key,message);if(old&&!message)controller?.cancel();if(message&&old!==message&&active())controller?.noticeFeedback(label(node,'FormFeedback'));},
    commit(state){
      for(const event of state.attempts){
        if(!event.eventId||seenEvents.has(event.eventId))continue;
        seenEvents.add(event.eventId); // Includes hidden/filtered/off events: never replay later.
        if(event.kind!=='valid'||!active())continue;
        const row=[...root.querySelectorAll('[data-scan-event]')].find(n=>n.dataset.scanEvent===event.eventId);
        if(row)controller?.rowFeedback(label(row.querySelector('.p04-attempt-code'),'ScanFeedback'));
      }
      const receipt=state.request?.requestId;
      if(state.recorded&&state.outcome==='recorded'&&!state.busy&&!state.unknown&&receipt&&!seenReceipts.has(receipt)){
        seenReceipts.add(receipt);
        if(active())controller?.rowFeedback(label(root.querySelector('.hn-waiting-hero'),'SubmitFeedback'));
      }
    },
    cancel(){controller?.cancel();},
    hide(){controller?.dispose();controller=null;},
    dispose(){disposed=true;controller?.dispose();controller=null;seenEvents.clear();seenReceipts.clear();errors.clear();root.removeEventListener('focusin',focus);},
  };
}
