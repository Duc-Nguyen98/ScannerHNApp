// P09-only browser-history boundary. UI Back dismisses a dialog before a page.
export function createWarrantyModalHistory({history,location}){
 let open=null,closing=null,resolveClose=null,settlement=Promise.resolve();
 function begin(){
  const token=crypto.randomUUID();
  open={token,hash:location.hash,state:structuredClone(history.state||{})};
  history.pushState({...open.state,p09Modal:token},'',open.hash);
 }
 function closed(){
  const entry=open;open=null;
  if(entry&&history.state?.p09Modal===entry.token){
   closing=entry;settlement=new Promise(resolve=>resolveClose=resolve);history.back();
  }
 }
 function onNavigation(close){
  if(open&&history.state?.p09Modal!==open.token){const same=location.hash===open.hash;close();return same;}
  if(closing){const same=location.hash===closing.hash;closing=null;resolveClose?.();resolveClose=null;return same;}
  return false;
 }
 return {begin,closed,onNavigation,ready:()=>settlement,
  stripStale(){if(!open&&history.state?.p09Modal){const state={...history.state};delete state.p09Modal;history.replaceState(state,'',location.hash);return true;}return false;},
  dispose(){open=null;closing=null;resolveClose?.();resolveClose=null;settlement=Promise.resolve();},
 };
}
