// Promoted from M00 unchanged; board consumers opt in within their existing owner.
export const MOTION_MODES = Object.freeze(['auto', 'reduced', 'off']);

export function resolveMotionMode({requested='auto',reduced=false}={}) {
  if(!MOTION_MODES.includes(requested))return 'off';
  return requested==='off'?'off':requested==='reduced'||reduced?'reduced':'auto';
}

export function createMotionController({element,requested='auto',media=window.matchMedia('(prefers-reduced-motion: reduce)')}={}) {
  if(!element)throw new TypeError('motion controller requires an owner root');
  const doc=element.ownerDocument,win=doc.defaultView,active=new Map();
  let disposed=false,mode;
  const prior=element.getAttribute('data-hn-motion-mode');
  const inertHandle=()=>({finished:Promise.resolve(),cancel(){}});
  function cancel(node) {const a=active.get(node);if(a){active.delete(node);a.cancel();}}
  function cancelAll(){for(const node of [...active.keys()])cancel(node);}
  function sync(){cancelAll();mode=resolveMotionMode({requested,reduced:media.matches});element.dataset.hnMotionMode=mode;}
  function visibility(){if(doc.hidden)cancelAll();}
  function play(node,token,frames,{securitySensitive=false}={}) {
    cancel(node);
    if(securitySensitive){cancelAll();return inertHandle();}
    if(disposed||mode==='off'||doc.hidden||!node?.isConnected||!element.contains(node)||node.matches('.hn-screen, .screen, video, canvas, input, textarea, [disabled], [aria-disabled="true"]'))return inertHandle();
    const style=win.getComputedStyle(element);
    const durationText=style.getPropertyValue('--hn-motion-'+token).trim();
    const duration=parseFloat(durationText)*(durationText.endsWith('ms')?1:1000);
    if(!Number.isFinite(duration)||duration<=0||typeof node.animate!=='function')return inertHandle();
    // Reduced mode cannot retain transform frames, even for opacity transitions.
    const keyframes=mode==='reduced'?frames.map(({opacity=1})=>({opacity})):frames;
    let animation;
    try{animation=node.animate(keyframes,{duration:mode==='reduced'?Math.min(duration,80):duration,easing:style.getPropertyValue('--hn-motion-ease-standard').trim()||'linear',fill:'none'});}
    catch{return inertHandle();}
    active.set(node,animation);
    const finish=()=>{if(active.get(node)===animation)active.delete(node);};
    const finished=animation.finished.then(finish,finish);
    return {finished,cancel:()=>{if(active.get(node)===animation)cancel(node);}};
  }
  media.addEventListener('change',sync);doc.addEventListener('visibilitychange',visibility);sync();
  return {
    get mode(){return mode;},get activeCount(){return active.size;},
    setMode(value){if(disposed)return;requested=value;sync();},
    pressFeedback:node=>play(node,'press',[{opacity:.7},{opacity:1}]),
    noticeFeedback:node=>play(node,'feedback',[{opacity:.65},{opacity:1}]),
    routeTransition:(node,options)=>play(node,'route',[{opacity:.7},{opacity:1}],options),
    backdropMotion:(node,{exit=false,...options}={})=>play(node,exit?'panel-exit':'feedback',exit?[{opacity:1},{opacity:0}]:[{opacity:0},{opacity:1}],options),
    modalSheetMotion:(node,{exit=false,fadeOnly=false,...options}={})=>play(node,exit?'panel-exit':'panel-enter',fadeOnly?(exit?[{opacity:1},{opacity:0}]:[{opacity:0},{opacity:1}]):exit?[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(8px)'}]:[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],options),
    dataState:node=>play(node,'feedback',[{opacity:.65},{opacity:1}]),
    rowFeedback:node=>play(node,'row-feedback',[{opacity:.6},{opacity:1}]),
    cancel:cancelAll,
    dispose(){if(disposed)return;disposed=true;cancelAll();media.removeEventListener('change',sync);doc.removeEventListener('visibilitychange',visibility);if(prior===null)element.removeAttribute('data-hn-motion-mode');else element.setAttribute('data-hn-motion-mode',prior);},
  };
}
