// Ordered text-field navigation without implicit mutation/submission.
// Callers supply fields; passwords and unrelated modules are never inspected.
export function mountFormNavigation({root,isActive,getFields,getScroller,onDone}) {
  let disposed=false,frame=0;
  function reveal(){
    frame=0;if(disposed||!isActive())return;
    const scroll=getScroller();if(!scroll)return;
    const field=document.activeElement;
    if(!getFields().includes(field)){scroll.style.removeProperty('--hn-form-keyboard-inset');return;}
    const box=scroll.getBoundingClientRect(),scale=box.width/scroll.offsetWidth,viewport=window.visualViewport;
    if(!scale)return;
    const top=Math.max(box.top,viewport?.offsetTop||0)+8,bottom=Math.min(box.bottom,viewport?viewport.offsetTop+viewport.height:innerHeight)-8;
    if(bottom<=top)return;
    // Extra scroll room is needed only when the visual viewport covers content.
    scroll.style.setProperty('--hn-form-keyboard-inset',`${Math.max(0,(box.bottom-bottom-8)/scale)}px`);
    const r=field.getBoundingClientRect();
    if(r.bottom>bottom)scroll.scrollTop+=(r.bottom-bottom)/scale;
    else if(r.top<top)scroll.scrollTop-=(top-r.top)/scale;
  }
  function schedule(){if(!disposed&&!frame)frame=requestAnimationFrame(reveal);}
  function onKey(event){
    if(!isActive()||event.key!=='Enter'||event.isComposing||event.keyCode===229)return;
    const fields=getFields(),index=fields.indexOf(event.target);if(index<0)return;
    event.preventDefault();
    if(fields[index+1]){fields[index+1].focus({preventScroll:true});schedule();}
    else{event.target.blur();onDone?.();schedule();}
  }
  function onFocus(){if(isActive())schedule();}
  root.addEventListener('keydown',onKey);root.addEventListener('focusin',onFocus);root.addEventListener('focusout',onFocus);
  window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
  return {refresh:schedule,clear(){cancelAnimationFrame(frame);frame=0;getScroller()?.style.removeProperty('--hn-form-keyboard-inset');},dispose(){disposed=true;cancelAnimationFrame(frame);root.removeEventListener('keydown',onKey);root.removeEventListener('focusin',onFocus);root.removeEventListener('focusout',onFocus);window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule);getScroller()?.style.removeProperty('--hn-form-keyboard-inset');}};
}
