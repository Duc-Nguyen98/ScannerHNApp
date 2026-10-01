// Persistent, visually hidden live region. Does not move keyboard focus.
export function createStatusAnnouncer({getScreen,isActive=()=>true,key}) {
 let node=null,frame=0,last='',disposed=false;
 function clear(){cancelAnimationFrame(frame);frame=0;last='';if(node)node.textContent='';}
 return {
  say(message){
   if(disposed||!isActive()||!message||message===last)return;
   const screen=getScreen();if(!screen)return;
   if(!node?.isConnected){node=document.createElement('div');node.dataset.hnAnnouncement=key;node.setAttribute('role','status');node.setAttribute('aria-live','polite');node.setAttribute('aria-atomic','true');node.style.cssText='position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;pointer-events:none';screen.append(node);}
   last=message;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=0;if(!disposed&&isActive())node.textContent=message;});
  },clear,dispose(){clear();disposed=true;node?.remove();node=null;},
 };
}
