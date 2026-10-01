import {createMotionController} from './motion-primitives.mjs';

// Scan/Form/SubmitFeedback only; no commands, camera, router or scroll ownership.
export function mountScanFlowFeedback({root,isActive,prefix,reviewNotice=null,requested='auto'}) {
  let controller=null,disposed=false,lastState=null;
  const doc=root.ownerDocument;
  const seenEvents=new Set(),seenReceipts=new Set(),errors=new Map(),seenNotices=new Set();
  const active=()=>!disposed&&isActive()&&!root.hidden&&!root.closest('[inert]')&&!root.closest('.hn-screen')?.querySelector('.p03-host:not([hidden]),.app-modal-host');
  function label(node,consumer){if(node)node.dataset.hnMotionConsumer=consumer;return node;}
  function statusVisibility(){
    const node=root.querySelector(`.p17-app.${prefix}-app .p17-status-spinner`);
    if(node)node.dataset.running=String(!!controller&&controller.mode==='auto'&&!doc.hidden&&active()&&lastState?.unknown===true&&lastState?.busy===true);
  }
  function focus(event){
    if(!controller||!active()||!event.target.matches(`input:not([readonly]):not([disabled]),textarea:not([readonly]):not([disabled]),[data-${prefix}-select]:not([disabled])`))return;
    const node=event.target.closest(`.${prefix}-input`);if(node)controller.noticeFeedback(label(node,'FormFeedback'));
  }
  root.addEventListener('focusin',focus);
  return {
    activate(state){
      lastState=state;
      // A mounted/restored draft is existing data, not a new scan event.
      if(state){for(const event of state.attempts||[])if(event.eventId)seenEvents.add(event.eventId);
        if(state.recorded&&state.request?.requestId)seenReceipts.add(state.request.requestId);
        const notice=reviewNotice?.(state);if(notice)seenNotices.add(notice.key);}
      if(!disposed&&!controller){controller=createMotionController({element:root,requested});doc.addEventListener('visibilitychange',statusVisibility);}
    },
    setMode(value){requested=value;controller?.setMode(value);statusVisibility();},
    beforeRender(){controller?.cancel();},
    validation(node,key,message){const old=errors.get(key)||'';errors.set(key,message);if(old&&!message)controller?.cancel();if(message&&old!==message&&active())controller?.noticeFeedback(label(node,'FormFeedback'));},
    commit(state){
      lastState=state;statusVisibility();
      for(const event of state.attempts){
        if(!event.eventId||seenEvents.has(event.eventId))continue;
        seenEvents.add(event.eventId); // Includes hidden/filtered/off events: never replay later.
        if(!active())continue;
        if(state.exception&&['invalid','blocked'].includes(event.kind)){
          const conflict=state.exception.panel==='P17.S02';
          const node=root.querySelector(conflict?'.p17-warning':'.p17-warning>div');
          controller?.noticeFeedback(label(node,conflict?'ConflictNotice':'ScanFeedback'));
          continue;
        }
        if(event.kind!=='valid')continue;
        const row=[...root.querySelectorAll('[data-scan-event]')].find(n=>n.dataset.scanEvent===event.eventId);
        if(row)controller?.rowFeedback(label(row.querySelector(`.${prefix}-attempt-code`),'ScanFeedback'));
      }
      const notice=reviewNotice?.(state);
      if(notice && !seenNotices.has(notice.key)){
        seenNotices.add(notice.key);
        if(active())controller?.noticeFeedback(label(root.querySelector(notice.selector),'FormFeedback'));
      }
      const receipt=state.request?.requestId;
      if(state.recorded&&state.outcome==='recorded'&&!state.busy&&!state.unknown&&receipt&&!seenReceipts.has(receipt)){
        seenReceipts.add(receipt);
        if(active())controller?.rowFeedback(label(root.querySelector('.hn-waiting-hero'),'SubmitFeedback'));
      }
    },
    cancel(){controller?.cancel();const node=root.querySelector(`.p17-app.${prefix}-app .p17-status-spinner`);if(node)node.dataset.running='false';},
    hide(){if(controller){controller.dispose();controller=null;doc.removeEventListener('visibilitychange',statusVisibility);}statusVisibility();},
    dispose(){disposed=true;this.hide();lastState=null;seenEvents.clear();seenReceipts.clear();errors.clear();seenNotices.clear();root.removeEventListener('focusin',focus);},
  };
}
