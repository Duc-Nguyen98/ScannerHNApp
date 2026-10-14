import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// M15 owns only notice descendants and button opacity. Shell owns routing;
// the existing overlay owns dialogs. No domain, permission or scroll callbacks.
export function mountSystemMotion({root,requested='auto',active=()=>true,media}) {
  let controller=null,disposed=false;
  const seen=new Set();
  const usable=()=>!disposed&&active()&&!root.closest('[hidden],[inert]');
  const mark=(node,name)=>{if(node)node.dataset.motionPrimitive=name;return node;};
  function press(e){
    if(e.type==='keydown'&&(e.repeat||e.isComposing||!['Enter',' '].includes(e.key)))return;
    const button=e.target.closest?.('button');
    if(!controller||!usable()||!button||!root.contains(button)||button.disabled||button.getAttribute('aria-disabled')==='true'||button.closest('dialog,[hidden],[inert]'))return;
    controller.pressFeedback(mark(button,'DeviceFeedback'));
  }
  root.addEventListener('pointerdown',press);root.addEventListener('keydown',press);
  return {
    activate(){if(!disposed&&!controller)controller=createMotionController({element:root,requested,...(media?{media}:{})});},
    notice(node,kind,identity){
      if(!['connection','forbidden'].includes(kind))return;
      const key=JSON.stringify([kind,identity]);if(seen.has(key))return;seen.add(key);
      if(usable())controller?.noticeFeedback(mark(node,kind==='connection'?'SystemNotice':'BlockingGuard'));
    },
    cancel(){controller?.cancel();},
    setMode(value){requested=value;controller?.setMode(value);},
    hide(){controller?.dispose();controller=null;},
    dispose(){disposed=true;controller?.dispose();controller=null;seen.clear();root.removeEventListener('pointerdown',press);root.removeEventListener('keydown',press);},
  };
}
