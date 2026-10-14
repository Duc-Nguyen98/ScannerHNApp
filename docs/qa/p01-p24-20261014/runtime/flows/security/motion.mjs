import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// M11 owns descendant feedback, never passwords, routes, session mutations or
// overlay lifecycle. Inputs/list geometry and security teardown remain static.
export function mountSecurityMotion({root,requested='auto',active=()=>true,media}){
  let controller=null,disposed=false;const errors=new Map(),seenResults=new WeakSet();
  const usable=()=>!disposed&&active()&&!root.closest('[inert]');
  const mark=(node,name)=>{if(node)node.dataset.motionPrimitive=name;return node;};
  function press(e){
    if(e.type==='keydown'&&(e.repeat||e.isComposing||!['Enter',' '].includes(e.key)))return;
    const node=e.target.closest?.('[data-p11=back],[data-p11=reload],[data-p11=reconcile],[data-p11-revoke],[data-p11-save]');
    if(!controller||!usable()||!node||!root.contains(node)||node.disabled||node.closest('[inert],dialog,[hidden]'))return;
    controller.pressFeedback(mark(node,'SecuritySettingsPress'));
  }
  function focus(e){
    if(!controller||!usable()||!e.target.matches?.('.p11-input input')||e.target.disabled||e.target.closest('[inert]'))return;
    controller.noticeFeedback(mark(e.target.closest('.p11-field')?.querySelector('label'),'SecureFormFocus'));
  }
  root.addEventListener('pointerdown',press);root.addEventListener('keydown',press);root.addEventListener('focusin',focus);
  return {
    activate(){if(!disposed&&!controller)controller=createMotionController({element:root,requested,...(media?{media}:{})});},
    setMode(value){requested=value;controller?.setMode(value);},
    validation(node,key,message){const prior=errors.get(key)||'';errors.set(key,message);if(prior===message)return;if(message&&usable())controller?.noticeFeedback(mark(node,'SecureFormError'));},
    reset(){errors.clear();controller?.cancel();},
    success(node,result){if(!result||seenResults.has(result))return;seenResults.add(result);if(usable())controller?.rowFeedback(mark(node,'SecureSuccess'));},
    cancel(){controller?.cancel();},
    hide(){controller?.dispose();controller=null;errors.clear();},
    dispose(){disposed=true;controller?.dispose();controller=null;errors.clear();root.removeEventListener('pointerdown',press);root.removeEventListener('keydown',press);root.removeEventListener('focusin',focus);},
  };
}
