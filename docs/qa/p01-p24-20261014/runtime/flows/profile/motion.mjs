import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// M10 owns descendant SettingsRows/FormFeedback only. No mutation, navigation,
// timers, scroller, outgoing clone, or overlay owner is created here.
export function mountProfileMotion({root,requested='auto',active=()=>true,media}) {
  let controller=null,disposed=false;
  const mark=(node,name)=>{if(node)node.dataset.motionPrimitive=name;return node;};
  const usable=()=>!disposed&&active()&&!root.closest('[inert]');
  function press(event){
    if(event.type==='keydown'&&(event.repeat||event.isComposing||!['Enter',' '].includes(event.key)))return;
    const node=event.target.closest?.('.p10-menu,.p10-logout-button,[data-p10=back],[data-p10=clear-phone],[data-p10-save]');
    if(!controller||!usable()||!node||!root.contains(node)||node.disabled||node.closest('dialog,[inert],[hidden]'))return;
    controller.pressFeedback(mark(node,'ProfileSettingsPress'));
  }
  root.addEventListener('pointerdown',press);root.addEventListener('keydown',press);
  return {
    activate(){if(!disposed&&!controller)controller=createMotionController({element:root,requested,...(media?{media}:{})});},
    setMode(value){requested=value;controller?.setMode(value);},
    feedback(node){if(usable())controller?.noticeFeedback(mark(node,'ProfileFormFeedback'));},
    identity(node,changed){if(changed&&usable())controller?.dataState(mark(node,'ProfileIdentity'));},
    cancel(){controller?.cancel();},
    hide(){controller?.dispose();controller=null;},
    dispose(){disposed=true;controller?.dispose();controller=null;root.removeEventListener('pointerdown',press);root.removeEventListener('keydown',press);},
  };
}
