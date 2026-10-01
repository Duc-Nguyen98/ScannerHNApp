// Opt-in hit geometry for a uniformly scaled preview. Presentation only:
// no route, permission, input value, or locked navigation styling is changed.
export function mountScaledControls({screen,selector,isActive=()=>true,minPixels=44,layout=false}) {
  let frame=0,disposed=false;
  const nodes=new Set();
  const props=['--hn-hit-left','--hn-hit-top','--hn-hit-width','--hn-hit-height'];
  function clearHit(node){node.removeAttribute('data-hn-hit-ready');for(const key of props)node.style.removeProperty(key);}
  function release(node){clearHit(node);node.style.removeProperty('--hn-control-hit-min');if(layout){node.removeAttribute('data-hn-touch-layout');node.style.removeProperty('--hn-control-layout-min-height');node.style.removeProperty('--hn-control-layout-min-width');}resize.unobserve(node);nodes.delete(node);}
  function refresh(){
    frame=0;if(disposed)return;
    for(const node of nodes)if(!node.isConnected||!isActive()||!node.matches(selector))release(node);
    if(!isActive())return;
    const shell=screen.getBoundingClientRect(),scale=shell.width/screen.offsetWidth;
    if(!Number.isFinite(scale)||scale<=0)return;
    if(layout)screen.style.setProperty('--hn-priority-hit-min',`${minPixels/scale}px`);
    for(const node of screen.querySelectorAll(selector)){
      if(!nodes.has(node)){if(layout){const css=getComputedStyle(node);node.style.setProperty('--hn-control-layout-min-height',css.minHeight==='auto'?'0px':css.minHeight);node.style.setProperty('--hn-control-layout-min-width',css.minWidth==='auto'?'0px':css.minWidth);node.setAttribute('data-hn-touch-layout','');}nodes.add(node);resize.observe(node);}
      const minSize=`${minPixels/scale}px`;
      if(node.style.getPropertyValue('--hn-control-hit-min')!==minSize)node.style.setProperty('--hn-control-hit-min',minSize);
      const r=node.getBoundingClientRect();if(!r.width||!r.height){clearHit(node);continue;}
      const boundary=node.closest('dialog')||node.closest('[data-hn-touch-scroll]')||screen,b=boundary.getBoundingClientRect();
      const left=Math.max(shell.left,b.left),right=Math.min(shell.right,b.right),top=Math.max(shell.top,b.top),bottom=Math.min(shell.bottom,b.bottom);
      // Off-screen controls retain their layout size. Removing it here would
      // shrink rows into view, grow them out again, and make scrolling jitter.
      if(right<=left||bottom<=top||r.bottom<=top||r.top>=bottom){clearHit(node);continue;}
      const width=Math.min(right-left,Math.max(r.width,minPixels)),height=Math.min(bottom-top,Math.max(r.height,minPixels));
      const x=Math.max(left,Math.min(right-width,r.left+(r.width-width)/2)),y=Math.max(top,Math.min(bottom-height,r.top+(r.height-height)/2));
      const values=[(x-r.left)/scale,(y-r.top)/scale,width/scale,height/scale];
      props.forEach((key,i)=>node.style.setProperty(key,`${values[i]}px`));node.setAttribute('data-hn-hit-ready','');
    }
  }
  function schedule(){if(!disposed&&!frame)frame=requestAnimationFrame(refresh);}
  const resize=new ResizeObserver(schedule);resize.observe(screen);
  // A transform changes the displayed target size without resizing its CSS box.
  // Ignore our own custom-property writes to avoid a MutationObserver loop.
  let transform=screen.style.transform;
  const transformObserver=new MutationObserver(()=>{const next=screen.style.transform;if(next!==transform){transform=next;schedule();}});
  transformObserver.observe(screen,{attributes:true,attributeFilter:['style']});
  const mutation=new MutationObserver(schedule);mutation.observe(screen,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','hidden']});
  screen.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);
  schedule();
  return {refresh:schedule,clear(){cancelAnimationFrame(frame);frame=0;for(const node of nodes)release(node);if(layout)screen.style.removeProperty('--hn-priority-hit-min');},dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();transformObserver.disconnect();mutation.disconnect();screen.removeEventListener('scroll',schedule,true);window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule);for(const node of nodes)release(node);if(layout)screen.style.removeProperty('--hn-priority-hit-min');}};
}
