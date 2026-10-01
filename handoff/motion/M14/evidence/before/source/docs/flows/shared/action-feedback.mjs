import {openActionDialog} from './action-dialog.mjs';
import {createDialogRoute} from './dialog-route.mjs';
// Scoped feedback controller. Native Back consumes the temporary dialog entry
// before module routing; async outcomes never stack over existing app dialogs.
export function createActionFeedback({getScreen,tools,isActive=()=>true,key='hnActionFeedback'}) {
  const route=createDialogRoute({history,location,key});
  let modal=null,queued=null,current=null,accepted=false,disposed=false,observer=null,observed=null,epoch=0;
  const active=()=>!disposed&&isActive();
  function occupied(screen){return !!screen.querySelector('.app-modal-host,dialog[open],.p03-host:not([hidden])');}
  function observe(screen){if(observed===screen)return;observer?.disconnect();observed=screen;observer=new MutationObserver(()=>{if(queued&&!modal)drain();});observer.observe(screen,{childList:true,subtree:true,attributes:true,attributeFilter:['open','hidden']});}
  function drain(){
    if(!active()){queued=null;return false;}
    const screen=getScreen();if(!queued||modal||route.isClosing()||!screen?.isConnected)return false;
    observe(screen);if(occupied(screen))return false;
    const config=queued;queued=null;current=config;accepted=false;route.begin();
    modal=openActionDialog({screen,tools:typeof tools==='function'?tools():tools,...config,onConfirm(){accepted=true;},onClose(){
      const closing=current,confirmed=accepted,action=accepted?current?.onConfirm:null,closedEpoch=epoch;modal=null;current=null;accepted=false;
      if(disposed)return;route.closed();
      void route.ready().then(()=>{if(!active()){queued=null;return;}if(closedEpoch!==epoch){drain();return;}if(action)action();else if(!screen.contains(document.activeElement))screen.querySelector('h1,[tabindex="-1"]')?.focus({preventScroll:true});closing?.onClose?.({confirmed});drain();});
    }});
    return true;
  }
  function navigation(event){
    if(disposed)return;
    if(!active()&&!modal&&!route.isClosing()&&!history.state?.[key])return;
    if(route.navigation(()=>modal?.close(),()=>!!modal)){event.stopImmediatePropagation();}
  }
  window.addEventListener('popstate',navigation,true);window.addEventListener('hashchange',navigation,true);
  return {
    show(config){if(!active())return false;const screen=getScreen();if(screen)observe(screen);if(current&&current.title===config.title&&current.message===config.message)return false;queued={...config};return drain();},
    clear(){epoch++;queued=null;accepted=false;if(current){current.onConfirm=null;current.onClose=null;}modal?.close();},
    dispose(){epoch++;disposed=true;queued=null;accepted=false;route.dispose();modal?.close();modal=null;current=null;observer?.disconnect();window.removeEventListener('popstate',navigation,true);window.removeEventListener('hashchange',navigation,true);},
  };
}
