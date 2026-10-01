import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// FormFeedback / SubmitFeedback only. No route/overlay/scroll or domain callbacks.
export function mountAuthMotion({screen,requested='auto'}) {
  const motion=createMotionController({element:screen,requested});
  function press(event) {
    if(event.type==='keydown'&&(event.repeat||!['Enter',' '].includes(event.key)))return;
    const button=event.target.closest?.('button');
    if(!button||button.id==='toggle-password'||button.closest('dialog')||!screen.contains(button)||button.disabled)return;
    motion.pressFeedback(button);
  }
  screen.addEventListener('pointerdown',press);
  screen.addEventListener('keydown',press);
  let wasBusy=false;
  return {
    get mode(){return motion.mode;},get activeCount(){return motion.activeCount;},
    setMode:value=>motion.setMode(value),
    busy(value){if(value!==wasBusy){motion.cancel();wasBusy=value;}},
    label(node,text){
      if(!node||node.textContent===text)return;
      node.textContent=text;
      motion.noticeFeedback(node);
    },
    cancel:()=>motion.cancel(),
    dispose(){screen.removeEventListener('pointerdown',press);screen.removeEventListener('keydown',press);motion.dispose();},
  };
}
