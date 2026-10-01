import {createDialogRoute} from '../shared/dialog-route.mjs';
// Temporary UI history only. Closing never replays a scan or changes a request.
export function createExceptionNavigation({root,key,isActive,onBack}) {
 const route=createDialogRoute({history,location,key});let opened=false;
 function navigation(event){
  if(!isActive()&&!route.isClosing())return;
  if(route.navigation(onBack,()=>opened))event.stopImmediatePropagation();
 }
 function keydown(event){
  if(event.key!=='Escape'||!isActive()||!opened||root.closest('.hn-screen')?.querySelector('.app-modal-host,dialog[open]'))return;
  event.preventDefault();event.stopImmediatePropagation();onBack();
 }
 window.addEventListener('popstate',navigation,true);window.addEventListener('hashchange',navigation,true);window.addEventListener('keydown',keydown);
 return {
  sync(value){opened=!!value;if(opened)route.begin({adoptCurrent:true});else route.closed();},
  hide(){opened=false;route.closed();},
  dispose(){opened=false;route.dispose();window.removeEventListener('popstate',navigation,true);window.removeEventListener('hashchange',navigation,true);window.removeEventListener('keydown',keydown);},
 };
}
