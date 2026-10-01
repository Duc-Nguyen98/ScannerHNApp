// One reference-counted page lock for existing overlay owners; no scroll engine.
const locks=new WeakMap();
export function acquireOverlayScrollLock(doc=document){
  let state=locks.get(doc);
  if(!state){
    state={count:0,styles:[doc.documentElement,doc.body].filter(Boolean).map(node=>({node,value:node.style.getPropertyValue('overflow'),priority:node.style.getPropertyPriority('overflow')}))};
    locks.set(doc,state);
    for(const {node} of state.styles)node.style.setProperty('overflow','hidden');
  }
  state.count++;let released=false;
  return ()=>{
    if(released)return;released=true;
    if(--state.count)return;
    for(const {node,value,priority}of state.styles){if(value)node.style.setProperty('overflow',value,priority);else node.style.removeProperty('overflow');}
    locks.delete(doc);
  };
}
