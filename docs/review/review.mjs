import {openScene,visiblePanels} from './scenes.mjs';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search);
const catalog=await fetch('./catalog.json').then(r=>{if(!r.ok)throw Error('Missing catalog');return r.json();});
const panels=catalog.panels,frame=$('app');let current=null,busy=false,controller=null;
const boards=[...new Set(panels.map(p=>p.board))];
for(const b of boards)$('board').add(new Option(b+' · '+panels.find(p=>p.board===b).boardTitle,b));
function options(id){const target=panels.find(p=>p.id===id)||panels[0];$('board').value=target.board;$('panel').replaceChildren(...panels.filter(p=>p.board===target.board).map(p=>new Option(p.id+' · '+p.title,p.id)));$('panel').value=target.id;describe();}
function describe(){const p=panels.find(p=>p.id===$('panel').value);$('disposition').textContent=p.disposition+(p.note?' · '+p.note:'');}
function showTools(show){$('controls').hidden=!show;$('toggle').setAttribute('aria-expanded',String(show));}
options(q.get('panel'));$('motion').value=['auto','reduced','off'].includes(q.get('motion'))?q.get('motion'):'auto';$('scenario').value=q.get('scenario')==='other-user'?'other-user':'default';
const review=q.get('view')==='review';showTools(review);$(review?'review-link':'app-link').setAttribute('aria-current','page');
$('build').textContent=`Build ${catalog.build} · Fixture ${catalog.fixture} · Tokens ${catalog.tokens} · 24 board / 91 panel`;
function url(id=$('panel').value){const u=new URL(location.href);u.search=new URLSearchParams({view:'review',panel:id,scenario:$('scenario').value,motion:$('motion').value});u.hash='';return u;}
async function confirmation(){const dialog=$('confirm');dialog.returnValue='cancel';dialog.showModal();return new Promise(r=>dialog.addEventListener('close',()=>r(dialog.returnValue==='reset'),{once:true}));}
function setMode(){try{for(const sel of ['#motion-mode','#home-motion-mode']){const e=frame.contentDocument.querySelector(sel);if(e){e.value=$('motion').value;e.dispatchEvent(new frame.contentWindow.Event('change',{bubbles:true}));}}}catch{}if(review)history.replaceState(null,'',url(current||$('panel').value));}
async function launch(id,ask=true){
 if(busy)return;if(ask&&current&&!await confirmation())return;
 controller?.abort();controller=new AbortController();busy=true;$('launch').disabled=true;frame.style.visibility='hidden';$('status').textContent='Đang dựng mẫu '+id+'...';
 try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Runtime không phản hồi')),16000);frame.onload=()=>{clearTimeout(timer);resolve();};frame.src='./runtime/flows/auth-session/?build='+encodeURIComponent(catalog.build);});
  await openScene(frame,id,{motion:$('motion').value,scenario:$('scenario').value,signal:controller.signal});
  current=id;options(id);history.replaceState(null,'',url(id));$('status').textContent='Đã mở '+id+' · '+visiblePanels(frame.contentDocument).join(', ');frame.style.visibility='visible';
  if(matchMedia('(max-width:700px)').matches)showTools(false);
 }catch(e){$('status').textContent=e.message;frame.style.visibility='visible';showTools(true);}finally{busy=false;$('launch').disabled=false;}
}
async function copy(text){try{await navigator.clipboard.writeText(text);$('status').textContent='Đã sao chép.';}catch{$('clipboard').hidden=false;$('clipboard').value=text;$('clipboard').focus();$('clipboard').select();$('status').textContent='Có thể sao chép nội dung bên dưới.';}}
$('toggle').onclick=()=>showTools($('controls').hidden);
$('board').onchange=()=>options(panels.find(p=>p.board===$('board').value).id);$('panel').onchange=describe;
$('motion').onchange=setMode;$('launch').onclick=()=>launch($('panel').value);
for(const [button,delta]of [['previous',-1],['next',1]])$(button).onclick=()=>{const i=panels.findIndex(p=>p.id===$('panel').value);void launch(panels[(i+delta+panels.length)%panels.length].id);};
$('reset').onclick=async()=>{if(busy||!await confirmation())return;if(review)void launch(current||$('panel').value,false);else{frame.src='./runtime/flows/auth-session/?build='+encodeURIComponent(catalog.build);frame.onload=setMode;}};
$('copy').onclick=()=>copy(url(current||$('panel').value).href);
$('bug').onclick=()=>copy(`Build: ${catalog.build}\nPanel: ${current||$('panel').value}\nScenario: ${$('scenario').value}\nMotion: ${$('motion').value}\nLink: ${url(current||$('panel').value)}\nViewport: ${innerWidth}x${innerHeight}, DPR ${devicePixelRatio}\nBước tái hiện:\nMong đợi:\nThực tế:\nẢnh: `);
function tool(selector){const e=frame.contentDocument?.querySelector(selector);if(e&&!e.disabled)e.click();else $('status').textContent='Chưa có thao tác mẫu này ở màn hiện tại.';}
$('scan-fixture').onclick=()=>{const d=frame.contentDocument;if(d.querySelector('.p04-app'))tool('[data-p04=batch]');else if(d.querySelector('.p05-app'))tool('[data-p05=batch]');else $('status').textContent='Mở bước quét nhập/xuất để nạp mã mẫu.';};
$('nfc-fixture').onclick=()=>tool('[data-p07-demo-read]');
$('outcome').onchange=()=>{const d=frame.contentDocument;for(const [sel,v]of [['[data-p04-outcome]',$('outcome').value],['[data-p05-outcome]',$('outcome').value],['[data-p19-outcome]',{confirmed:'ready',failed:'error',unknown:'unknown'}[$('outcome').value]]]){const e=d.querySelector(sel);if(e){e.value=v;e.dispatchEvent(new frame.contentWindow.Event('change',{bubbles:true}));}}};
if(review)void launch($('panel').value,false);else{frame.src='./runtime/flows/auth-session/?build='+encodeURIComponent(catalog.build);frame.onload=setMode;$('status').textContent='App Preview · đăng nhập demo thủ công.';}
