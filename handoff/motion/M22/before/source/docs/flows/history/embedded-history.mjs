// P08-approved host edges only. Existing P22/P23 read renderers remain the source.
import {initialFilters} from './history-model.mjs';
export function connectHistoryFrame({frame,getBlocked,onLogout,onHome,onRoute}) {
  const query=new URLSearchParams(location.hash.split('?')[1]);
  const allowed=['history-hub','nfc','nfc-detail','events-unavailable','sessions','session-detail','warranty'];
  const scene=allowed.includes(query.get('scene'))?query.get('scene'):'history-hub';
  const args=new URLSearchParams({mode:'screen',embed:'history',scene});
  for(const k of ['event','session'])if(query.get(k))args.set(k,query.get(k));
  function remember(action=null){
    const doc=frame.contentDocument,body=doc?.querySelector('.body');
    const selected=doc?.querySelector('[data-action="filter"].active')?.dataset.value;
    const focus=doc?.activeElement;
    history.replaceState({...history.state,embeddedView:{top:body?.scrollTop||0,filter:selected,q:doc?.querySelector('[data-search]')?.value||'',session:focus?.dataset.session||null,event:focus?.dataset.event||null,action:action||focus?.closest('.history-link')?.dataset.action||null}},'',location.hash);
  }
  function openBusiness(business){
    if(['nfc','warranty','sessions'].includes(business)){openScene(business);return;}
    remember();history.pushState({p08:{filters:{...initialFilters(),from:'',to:''},limit:6,tab:'info',allCodes:false},p08Resume:true,p08Back:true},'','#p02/history-list?panel=1&business='+business);onRoute('history-list');
  }
  function openScene(next,extra={}){
    remember();const q=new URLSearchParams({scene:next,...extra});
    history.pushState({embeddedBack:true},'',`#p02/history?${q}`);onRoute('history');
  }
  function openList(panel=1,scope='all',session=null){
    remember();const q=new URLSearchParams({panel});if(session)q.set('session',session);
    history.pushState({p08:{filters:initialFilters(scope),limit:6,tab:'info',allCodes:false},p08Resume:panel!==3,p08Back:true},'',`#p02/history-list?${q}`);
    onRoute('history-list');
  }
  function back(fallback){if(history.state?.returnTo||history.state?.embeddedBack)history.back();else if(fallback==='exit')onHome();else openScene(fallback);}
  frame.addEventListener('load',()=>{
    // A superseded iframe must not restore history, redirect or revoke a session.
    if(!frame.isConnected)return;
    if(getBlocked()){frame.remove();onLogout();return;}
    if(['nfc','warranty','sessions'].includes(scene)){
      const old=history.state||{};
      history.replaceState({p08:{filters:{...initialFilters(),from:'',to:'',q:old.embeddedView?.q||''},limit:6,tab:'info',allCodes:false},p08Back:!!(old.returnTo||old.embeddedBack)},'','#p02/history-list?panel=1&business='+scene);
      onRoute('history-list');return;
    }
    const doc=frame.contentDocument,saved=history.state?.embeddedView;
    if(saved?.filter){const btn=[...doc.querySelectorAll('[data-action="filter"]')].find(b=>b.dataset.value===saved.filter);btn?.click();}
    if(saved?.q){const input=doc.querySelector('[data-search]');if(input){input.value=saved.q;input.dispatchEvent(new frame.contentWindow.Event('input',{bubbles:true}));}}
    const body=doc.querySelector('.body');if(body){body.tabIndex=0;body.setAttribute('aria-label','Nội dung lịch sử');body.scrollTop=saved?.top||0;}
    const savedFocus=saved?.session?doc.querySelector(`[data-session="${CSS.escape(saved.session)}"]`):saved?.event?doc.querySelector(`[data-event="${CSS.escape(saved.event)}"]`):saved?.action?doc.querySelector(`.history-link[data-action="${CSS.escape(saved.action)}"]`):null;
    if(savedFocus)savedFocus.focus({preventScroll:true});else{const heading=doc.querySelector('h1');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});}
    doc.addEventListener('click',event=>{
      if(!frame.isConnected)return;
      if(getBlocked()){event.preventDefault();event.stopImmediatePropagation();onLogout();return;}
      const button=event.target.closest('[data-action]');if(!button)return;
      const action=button.dataset.action;
      // Only route actions below are intercepted, never original business writes.
      if(!['history-general','history-daily','documents','session-detail','sessions','nfc','nfc-detail','history-hub','warranty','exit'].includes(action))return;
      event.preventDefault();event.stopImmediatePropagation();
      if(action==='history-general'||action==='documents')return openList(1,action==='documents'?'documents':'all');
      if(action==='history-daily')return openList(4);
      if(['nfc','warranty','sessions'].includes(action)&&button.closest('.history-links'))return openBusiness(action);
      if(action==='session-detail')return openList(3,'all',button.dataset.session);
      if(action==='exit')return back('exit');
      if(button.closest('.phone-header')||button.closest('.phone-footer'))return back(action);
      if(action==='nfc-detail')return openScene(action,{event:button.dataset.event});
      openScene(action);
    },true);
  });
  frame.src='../warranty-components/?'+args;
}
