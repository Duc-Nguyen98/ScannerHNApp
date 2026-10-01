import {openScene,visiblePanels} from './scenes.mjs';
import {mountFlowViewer} from './flow-viewer.mjs';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search);
const catalog=await fetch('./catalog.json').then(r=>{if(!r.ok)throw Error('Missing catalog');return r.json();});
const panels=catalog.panels,frame=$('app'),mobile=matchMedia('(max-width:700px)');
let current=null,active=null,busy=false,controller=null,flowViewer=null,confirming=null;
let review=q.get('view')==='review',appliedScenario=q.get('scenario')==='other-user'?'other-user':'default';
const boards=[...new Set(panels.map(p=>p.board))];
for(const b of boards)$('board').add(new Option(b+' · '+panels.find(p=>p.board===b).boardTitle,b));
function options(id){const target=panels.find(p=>p.id===id)||panels[0];$('board').value=target.board;$('panel').replaceChildren(...panels.filter(p=>p.board===target.board).map(p=>new Option(p.id+' · '+p.title,p.id)));$('panel').value=target.id;describe();}
function describe(){const p=panels.find(p=>p.id===$('panel').value);$('disposition').textContent=p.disposition+(p.note?' · '+p.note:'');}
function showTools(show,{focus=false}={}){
 const drawer=show&&mobile.matches,controls=$('controls');
 controls.hidden=!show;$('toggle').setAttribute('aria-expanded',String(show));
 document.querySelector('main').inert=drawer;
 document.querySelector('.bar nav').inert=drawer;$('flow-toggle').inert=drawer;
 if(drawer){controls.setAttribute('role','dialog');controls.setAttribute('aria-modal','true');}else{controls.removeAttribute('role');controls.removeAttribute('aria-modal');}
 if(drawer&&focus)$('tools-close').focus();
 if(!show&&controls.contains(document.activeElement))$('toggle').focus();
}
options(q.get('panel'));$('motion').value=['auto','reduced','off'].includes(q.get('motion'))?q.get('motion'):'auto';$('scenario').value=appliedScenario;
showTools(review);$(review?'review-link':'app-link').setAttribute('aria-current','page');
$('build').textContent=`Build ${catalog.build} · Fixture ${catalog.fixture} · Tokens ${catalog.tokens} · 24 board / 91 panel`;
function livePanel(){try{return visiblePanels(frame.contentDocument).filter(id=>panels.some(p=>p.id===id)).at(-1)||active||current||$('panel').value;}catch{return active||current||$('panel').value;}}
// Draft selectors are not the applied runtime context until launch succeeds.
function url(id=livePanel(),view=review?'review':'app'){
 const u=new URL(location.href);u.search=new URLSearchParams({view,panel:id,scenario:appliedScenario,motion:$('motion').value,...flowViewer?.params()});u.hash='';return u;
}
function updateUrl(){history.replaceState(null,'',url());}
function observePanel(id){
 if(busy||!panels.some(p=>p.id===id))return;
 const label='Đang xem: '+id+' · '+(appliedScenario==='other-user'?'Lan Nguyễn':'Mẫu mặc định');
 if(active===id&&$('current-panel').textContent===label)return;active=id;
 $('current-panel').textContent=label;
 updateUrl();
}
function confirmation(){
 if(confirming)return confirming;
 const dialog=$('confirm');dialog.returnValue='cancel';
 confirming=new Promise(resolve=>dialog.addEventListener('close',()=>{confirming=null;resolve(dialog.returnValue==='reset');},{once:true}));
 dialog.showModal();return confirming;
}
function lock(value){
 busy=value;flowViewer?.setBusy(value);frame.setAttribute('aria-busy',String(value));
 for(const id of ['board','panel','scenario','motion','launch','previous','next','reset','copy','bug','scan-fixture','nfc-fixture','outcome'])$(id).disabled=value;
 for(const id of ['app-link','review-link'])$(id).setAttribute('aria-disabled',String(value));
}
function setMode(){
 try{for(const sel of ['#motion-mode','#home-motion-mode']){const e=frame.contentDocument.querySelector(sel);if(e){e.value=$('motion').value;e.dispatchEvent(new frame.contentWindow.Event('change',{bubbles:true}));}}}catch{}
 updateUrl();
}
function loadRuntime(signal){
 return new Promise((resolve,reject)=>{
  const finish=error=>{clearTimeout(timer);frame.removeEventListener('load',loaded);signal.removeEventListener('abort',aborted);error?reject(error):resolve();};
  const loaded=()=>finish(),aborted=()=>finish(new DOMException('Cancelled','AbortError'));
  const timer=setTimeout(()=>finish(Error('Runtime không phản hồi. Vui lòng mở lại mẫu.')),16000);
  frame.addEventListener('load',loaded,{once:true});signal.addEventListener('abort',aborted,{once:true});
  frame.src='./runtime/flows/auth-session/?build='+encodeURIComponent(catalog.build);
 });
}
async function launch(id,ask=true,{scenario=$('scenario').value,manual=false}={}){
 if(busy)return;const motion=$('motion').value;lock(true);
 try{
  if(ask&&(current||active)&&!await confirmation())return;
  controller?.abort();controller=new AbortController();frame.style.visibility='hidden';
  $('status').textContent='Đang dựng mẫu '+id+'...';
  await loadRuntime(controller.signal);
  if(manual){setMode();current=null;appliedScenario='default';$('scenario').value='default';$('status').textContent='App Preview · đăng nhập demo thủ công.';}
  else{await openScene(frame,id,{motion,scenario,signal:controller.signal});current=id;appliedScenario=scenario;options(id);$('status').textContent='Đã mở '+id+' · '+visiblePanels(frame.contentDocument).join(', ');}
  if(mobile.matches)showTools(false);
 }catch(e){if(e.name!=='AbortError'){$('status').textContent=e.message;showTools(true,{focus:true});}}
 finally{frame.style.visibility='visible';lock(false);observePanel(livePanel());}
}
async function copy(text){try{await navigator.clipboard.writeText(text);$('clipboard').hidden=true;$('status').textContent='Đã sao chép.';}catch{$('clipboard').hidden=false;$('clipboard').value=text;$('clipboard').focus();$('clipboard').select();$('status').textContent='Có thể sao chép nội dung bên dưới.';}}
$('toggle').onclick=()=>showTools($('controls').hidden,{focus:true});
$('tools-close').onclick=()=>{showTools(false);$('toggle').focus();};
mobile.addEventListener('change',event=>showTools(event.matches?false:!$('controls').hidden));
document.addEventListener('keydown',event=>{
 if(!mobile.matches||$('controls').hidden||$('confirm').open)return;
 if(event.key==='Escape'){event.preventDefault();showTools(false);$('toggle').focus();}
 if(event.key==='Tab'){
  const items=[...$('controls').querySelectorAll('button,select,a[href],input,textarea,summary')].filter(e=>!e.disabled&&e.getClientRects().length);
  const first=items[0],last=items.at(-1);
  if(event.shiftKey&&(document.activeElement===first||!$('controls').contains(document.activeElement))){event.preventDefault();last?.focus();}
  else if(!event.shiftKey&&(document.activeElement===last||!$('controls').contains(document.activeElement))){event.preventDefault();first?.focus();}
 }
});
for(const [id,value]of [['app-link',false],['review-link',true]])$(id).onclick=event=>{
 if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
 event.preventDefault();if(busy)return;review=value;
 for(const key of ['app-link','review-link'])$(key).removeAttribute('aria-current');$(id).setAttribute('aria-current','page');
 showTools(review,{focus:true});updateUrl();
};
$('board').onchange=()=>options(panels.find(p=>p.board===$('board').value).id);$('panel').onchange=describe;
$('motion').onchange=setMode;$('launch').onclick=()=>launch($('panel').value);
for(const [button,delta]of [['previous',-1],['next',1]])$(button).onclick=()=>{const i=panels.findIndex(p=>p.id===$('panel').value);void launch(panels[(i+delta+panels.length)%panels.length].id);};
$('reset').onclick=()=>launch(current||livePanel(),true,{scenario:appliedScenario,manual:!review});
$('copy').onclick=()=>copy(url(livePanel(),'review').href);
$('bug').onclick=()=>copy(`Build: ${catalog.build}\nPanel: ${livePanel()}\nSeed: ${current||'manual'}\nScenario: ${appliedScenario}\nMotion: ${$('motion').value}\nLink: ${url(livePanel(),'review')}\nViewport: ${innerWidth}x${innerHeight}, app ${frame.clientWidth}x${frame.clientHeight}, DPR ${devicePixelRatio}\nLink mở mẫu của panel, không khôi phục nháp hiện tại.\nBước tái hiện:\nMong đợi:\nThực tế:\nẢnh: `);
function tool(selector){const e=frame.contentDocument?.querySelector(selector);if(e&&!e.disabled)e.click();else $('status').textContent='Chưa có thao tác mẫu này ở màn hiện tại.';}
$('scan-fixture').onclick=()=>{const d=frame.contentDocument;if(d.querySelector('.p04-app'))tool('[data-p04=batch]');else if(d.querySelector('.p05-app'))tool('[data-p05=batch]');else $('status').textContent='Mở bước quét nhập/xuất để nạp mã mẫu.';};
$('nfc-fixture').onclick=()=>tool('[data-p07-demo-read]');
$('outcome').onchange=()=>{const d=frame.contentDocument;for(const [sel,v]of [['[data-p04-outcome]',$('outcome').value],['[data-p05-outcome]',$('outcome').value],['[data-p19-outcome]',{confirmed:'ready',failed:'error',unknown:'unknown'}[$('outcome').value]]]){const e=d.querySelector(sel);if(e){e.value=v;e.dispatchEvent(new frame.contentWindow.Event('change',{bubbles:true}));}}};
flowViewer=mountFlowViewer({frame,catalog,getCurrentPanel:livePanel,onPanelChange:observePanel,onOpen:()=>{if(mobile.matches)showTools(false);},onChange:updateUrl});
window.addEventListener('pagehide',event=>{if(!event.persisted){controller?.abort();flowViewer.dispose();}});
void launch($('panel').value,false,{manual:!review});
