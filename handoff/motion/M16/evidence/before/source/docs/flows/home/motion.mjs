import {createMotionController} from '../shared/motion/motion-primitives.mjs';

// One presentation owner for the live route. No navigation, store, scroll or exit clone.
export function mountShellMotion({screen,requested='auto',media}) {
  const motion=createMotionController({element:screen,requested,...(media?{media}:{})});
  let routeKey=null,selectedTab=null,disposed=false;
  function press(event) {
    if(event.type==='keydown'&&(event.repeat||event.isComposing||!['Enter',' '].includes(event.key)))return;
    const button=event.target.closest?.('#hn-home button');
    if(!button||!screen.contains(button)||button.closest('[hidden], [inert], dialog')||button.disabled||button.getAttribute('aria-disabled')==='true')return;
    motion.pressFeedback(button);
  }
  screen.addEventListener('pointerdown',press);
  screen.addEventListener('keydown',press);
  return {
    get mode(){return motion.mode;},get activeCount(){return motion.activeCount;},
    setMode:value=>motion.setMode(value),
    commit(key,content,selected,{securitySensitive=false}={}) {
      if(disposed)return;
      const changed=routeKey!==key,tabChanged=selectedTab!==selected;
      if(securitySensitive){motion.cancel();routeKey=key;selectedTab=selected;return;}
      // Same-module query/panel/Back repaint is not a new route entrance.
      if(changed){motion.cancel();motion.routeTransition(content);}
      if(tabChanged&&selectedTab)motion.noticeFeedback(selected);
      routeKey=key;selectedTab=selected;
    },
    cancel:()=>motion.cancel(),
    dispose(){if(disposed)return;disposed=true;screen.removeEventListener('pointerdown',press);screen.removeEventListener('keydown',press);motion.dispose();},
  };
}
