// A temporary history entry for P03. Preserve the caller's exact state so
// closing a dialog never replaces a P06/P07/P09 journey entry with another URL.
export function createDialogRoute({history,location,key='hnScannerDialog'}){
 let open=null,closing=null,resolveClose=null,settled=Promise.resolve(),disposed=false,reopen=false;
 const copy=()=>structuredClone(history.state||{});
 function begin({adoptCurrent=false}={}){
  if(disposed||open)return;
  if(closing){reopen=true;return;}
  // Exception panels can be revisited through a saved browser entry. Adopt
  // their marker instead of pushing a second identical entry on every return.
  if(adoptCurrent&&typeof history.state?.[key]==='string'){
   const state=copy(),token=state[key];delete state[key];open={token,hash:location.hash,state};return;
  }
  open={token:crypto.randomUUID(),hash:location.hash,state:copy()};
  history.pushState({...open.state,[key]:open.token},'',open.hash);
 }
 function closed(){
  reopen=false;
  const entry=open;open=null;
  if(entry&&history.state?.[key]===entry.token){closing=entry;settled=new Promise(r=>resolveClose=r);history.back();}
 }
 function navigation(cancel,isOpen){
  if(open&&history.state?.[key]!==open.token){
   const entry=open;cancel();
   // Busy/stopped and the first Back from discard keep the dialog active.
   if(isOpen()){open=null;history.replaceState(entry.state,'',entry.hash);begin();}
   return true;
  }
  if(closing){closing=null;const again=reopen;reopen=false;if(again)begin();resolveClose?.();resolveClose=null;return true;}
  if(!open&&history.state?.[key]){const state=copy();delete state[key];history.replaceState(state,'',location.hash);}
  return false;
 }
 return {begin,closed,navigation,ready:()=>settled,isClosing:()=>!!closing,
  dispose(){disposed=true;open=null;closing=null;reopen=false;resolveClose?.();resolveClose=null;}};
}
