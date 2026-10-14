import {createSecurityFlow,validatePasswords} from './security-model.mjs';
import {createSecurityAdapter,REVIEW_SCENARIOS} from './preview-adapter.mjs';
import {SECURITY_ICONS} from './icons.mjs';
import {sessionGuard} from '../home/home-flow.mjs';
import {openActionDialog} from '../shared/action-dialog.mjs';
import {createDialogRoute} from '../shared/dialog-route.mjs';
import {mountSecurityMotion} from './motion.mjs';
const esc=v=>String(v??'Chưa có dữ liệu').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<svg class="p11-icon" viewBox="0 0 24 24" aria-hidden="true">${SECURITY_ICONS[n]}</svg>`;
const tile=n=>`<span class="hn-operation-icon" data-hn-operation="documents" data-size="lg">${icon(n)}</span>`;
const btn=(action,label,cls='p11-primary')=>`<button type="button" data-p11="${action}" class="${cls}">${label}</button>`;
const hint=text=>`<aside class="p11-hint">${icon('info')}<p>${text}</p></aside>`;
const formatTime=value=>{if(!value||!Number.isFinite(Date.parse(value)))return 'Chưa có dữ liệu';const parts=Object.fromEntries(new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value)).map(p=>[p.type,p.value]));return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;};
export function mountSecurity({root,screen,tools,getState,onSize,onRoute,onBack,logout,accountStore,motionMode='auto'}){
  let active=false,disposed=false,panel=1,flow=null,scenario='preview',renderedHash='',modal=null,afterDialog=null;
  let fields={current:'',next:'',confirm:''},errors={},listStatus='',scroll=0;
  const revealed={current:false,next:false,confirm:false};
  const eyeSelections=new WeakMap();
  const eyeFrames=new Set();
  const securityMotion=mountSecurityMotion({root,requested:motionMode,active:()=>active&&!disposed});
  const labels={current:'Mật khẩu hiện tại',next:'Mật khẩu mới',confirm:'Xác nhận mật khẩu mới'};
  const modalRoute=createDialogRoute({history,location,key:'hnSecurityDialog'});
  const review=document.createElement('section');review.className='p11-tools';review.hidden=true;
  review.innerHTML=`<details><summary>P11 · Kịch bản kiểm chứng</summary><p>PROTOTYPE · P11-r03. Luồng mặc định đã nối dữ liệu thử P01–P11; không kết nối tài khoản thật.</p><label>Kịch bản <select id="p11-scenario">${REVIEW_SCENARIOS.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label><p>Đổi mật khẩu mặc định có hiệu lực khi đăng nhập lại trong trang này. Đăng xuất không đặt lại mật khẩu hay khôi phục phiên đã thu hồi. Tải lại trang hoặc Đặt lại fixture sẽ khôi phục dữ liệu ban đầu. Chỉ nhập mật khẩu thử; không lưu vào storage. Thiết bị và vị trí là mẫu B11, không suy từ máy đang dùng. Policy preview chỉ kiểm bắt buộc, giữ phiên hiện tại; policy backend còn chờ contract. Các kịch bản lỗi/B11 riêng không thay tài khoản preview mặc định.</p></details>`;
  tools.append(review);
  function init(){flow=createSecurityFlow({adapter:createSecurityAdapter({session:getState().session,scenario,accountStore}),getState});}
  function clearSecrets(){for(const id of eyeFrames)cancelAnimationFrame(id);eyeFrames.clear();securityMotion.reset();fields={current:'',next:'',confirm:''};errors={};for(const k of Object.keys(revealed))revealed[k]=false;for(const i of root.querySelectorAll('.p11-input input')){i.value='';i.type='password';}}
  function field(name){return `<div class="p11-field"><label for="p11-${name}">${labels[name]} <span class="p11-required">*</span></label><div class="p11-input">${icon('lock')}<input id="p11-${name}" name="${name}" type="password" required autocomplete="${name==='current'?'current-password':'new-password'}" autocapitalize="none" spellcheck="false" aria-describedby="p11-${name}-error"><button type="button" class="p11-eye" data-p11-eye="${name}" aria-label="Hiện ${labels[name].toLowerCase()}" aria-pressed="false">${icon('eye-off')}</button></div><p id="p11-${name}-error" class="p11-error" hidden></p></div>`;}
  function form(){return `<section class="p11-form-copy"><h2>Đổi mật khẩu</h2><p>Sử dụng mật khẩu theo chính sách bảo mật<br class="p11-wide"> do hệ thống quy định.</p></section><form id="p11-form" novalidate>${Object.keys(labels).map(field).join('')}</form>${hint('Mật khẩu cần tuân thủ chính sách bảo mật do hệ thống quy định.')}`;}
  function success(){const s=getState().session,r=flow.snapshot().receipt;return `<div class="p11-success-content"><div class="p11-success-mark" aria-hidden="true"><span>${icon('check')}</span></div><h2 class="p11-success-title">Mật khẩu đăng nhập đã<br>được cập nhật</h2><p class="p11-success-copy">Bạn có thể sử dụng mật khẩu mới<br>để đăng nhập từ bây giờ.</p><section class="p11-summary">${[['user','Tài khoản',s.actor.name],['house','Kho',s.warehouse.name],['calendar','Thời gian cập nhật',formatTime(r.updatedAt)]].map(([n,l,v])=>`<div>${tile(n)}<span><small>${l}</small><strong data-hn-readable="${esc(l)}" data-hn-readable-kind="value">${esc(v)}</strong></span></div>`).join('')}</section>${hint('Nếu bạn nghi ngờ có hoạt động bất thường, hãy đăng xuất khỏi các thiết bị khác.')}</div>`;}
  function device(row,current){return `<article class="p11-device" data-session-row="${esc(row.id)}"><div class="p11-device-heading"><h2>${current?'Thiết bị hiện tại':'Thiết bị khác'}</h2>${current?'<span class="p11-active">Đang hoạt động</span>':''}</div><div class="p11-device-name">${tile(row.deviceType==='computer'?'laptop':row.deviceType==='phone'?'smartphone':'shield-check')}<div><strong data-hn-readable="Thiết bị đăng nhập" data-hn-readable-kind="value">${esc(row.device)}</strong><p data-hn-readable="Hệ điều hành" data-hn-readable-kind="value">${esc(row.os)}</p></div></div><ul class="p11-device-meta"><li>${icon('pin')}<span data-hn-readable="Vị trí đăng nhập" data-hn-readable-kind="value">${esc(row.location)}</span></li><li>${icon('clock')}<span>Đăng nhập lúc ${esc(formatTime(row.loggedInAt))}</span></li><li>${icon('globe')}<span data-hn-readable="Ứng dụng đăng nhập" data-hn-readable-kind="value">Ứng dụng: ${esc(row.app)}</span></li></ul>${current?'':`<button type="button" class="p11-revoke" data-p11-revoke="${esc(row.id)}">${icon('log-out')}Đăng xuất từ xa</button>`}</article>`;}
  function sessions(){const s=flow.snapshot();if(!s.sessions)return `<div class="p11-empty">${tile('shield-check')}<h2>Phiên đăng nhập</h2><p>${s.listBusy?'Đang tải danh sách thiết bị…':listStatus||'Đang tải danh sách thiết bị…'}</p>${s.listBusy?'':btn('reload','Tải lại','p11-secondary')}</div>`;const current=s.sessions.find(x=>x.id===s.currentSessionId),others=s.sessions.filter(x=>x.id!==s.currentSessionId);return `${device(current,true)}${others.length?others.map(x=>device(x,false)).join(''):'<section class="p11-device"><h2>Thiết bị khác</h2><p class="p11-no-others">Không có phiên đăng nhập khác.</p></section>'}${hint('Nếu phát hiện thiết bị lạ, hãy đăng xuất khỏi thiết bị đó và đổi mật khẩu để tăng cường bảo mật.')}`;}
  function render(focus=false){
    if(!active||disposed)return;securityMotion.cancel();screen.classList.toggle('p11-form-screen',panel!==4);
    const title=panel===4?'Phiên đăng nhập':panel===3?'Đã đổi mật khẩu':'Đổi mật khẩu';
    root.innerHTML=`<section class="p11-app" data-panel="P11.S0${panel}"><header class="p11-header">${btn('back',icon('back'),'p11-back')}<h1 tabindex="-1">${title}</h1></header><div class="p11-body"><div class="p11-scroll" tabindex="0" aria-label="Nội dung ${title}">${panel===4?sessions():panel===3?success():form()}<div class="p11-reconcile" hidden>${btn('reconcile','Đối chiếu kết quả','p11-secondary')}</div></div>${panel!==4?`<footer class="p11-footer">${panel===3?btn('back','Tài khoản &amp; bảo mật'):'<button type="submit" class="p11-primary" form="p11-form" data-p11-save>Lưu mật khẩu '+icon('arrow')+'</button>'}</footer>`:''}</div></section>`;
    root.querySelector('[data-p11=back]').setAttribute('aria-label','Quay lại Tài khoản & bảo mật');
    for(const k of Object.keys(fields)){const i=root.querySelector('#p11-'+k);if(i){i.value=fields[k];i.type=revealed[k]?'text':'password';updateEye(k);}}
    sync();root.querySelector('.p11-scroll').scrollTop=scroll;
    renderedHash=location.hash;document.title=`P11 · ${title} · Prototype`;if(focus)root.querySelector('h1').focus({preventScroll:true});onSize();
  }
  function updateEye(k){const b=root.querySelector(`[data-p11-eye="${k}"]`);if(!b)return;b.setAttribute('aria-pressed',String(revealed[k]));b.setAttribute('aria-label',`${revealed[k]?'Ẩn':'Hiện'} ${labels[k].toLowerCase()}`);b.innerHTML=icon(revealed[k]?'eye':'eye-off');}
  function toggleEye(button,key,pointer){
    const input=root.querySelector('#p11-'+key);
    const selection=(pointer&&eyeSelections.get(button))||[input.selectionStart,input.selectionEnd,input.selectionDirection];
    eyeSelections.delete(button);revealed[key]=!revealed[key];
    input.type=revealed[key]?'text':'password';input.setSelectionRange(...selection);updateEye(key);
    // Chromium can reset the caret after the password input changes type.
    // Restore only while the same untouched field still owns focus.
    if(document.activeElement===input){const expectedType=input.type,value=input.value;const frame=requestAnimationFrame(()=>{eyeFrames.delete(frame);
      if(active&&!disposed&&input.isConnected&&document.activeElement===input&&input.type===expectedType&&input.value===value)input.setSelectionRange(...selection);
    });eyeFrames.add(frame);}
  }
  function sync(){
    if(!active||disposed)return;const s=flow.snapshot();
    for(const k of Object.keys(labels)){const i=root.querySelector('#p11-'+k),e=root.querySelector('#p11-'+k+'-error');if(i){i.setAttribute('aria-invalid',String(!!errors[k]));i.disabled=s.busy||!!s.pending;i.closest('.p11-input').classList.toggle('p11-invalid',!!errors[k]);e.hidden=!errors[k];e.textContent=errors[k]||'';securityMotion.validation(e,k,errors[k]||'');}}
    if(panel<3){panel=errors.confirm==='Mật khẩu xác nhận chưa khớp.'?2:1;root.querySelector('.p11-app').dataset.panel=`P11.S0${panel}`;}
    const save=root.querySelector('[data-p11-save]');if(save){save.disabled=s.busy||!!s.pending;save.textContent=s.busy?'Đang xử lý…':'Lưu mật khẩu →';}
    root.querySelector('.p11-app')?.setAttribute('aria-busy',String(s.busy||s.listBusy));
    root.querySelector('.p11-reconcile').hidden=!s.pending||s.busy;
    for(const b of root.querySelectorAll('[data-p11-revoke],[data-p11-eye],[data-p11=reconcile],[data-p11=reload]'))b.disabled=s.busy||s.listBusy||!!s.pending&&b.dataset.p11!=='reconcile';
  }
  function expire(){clearSecrets();root.dispatchEvent(new CustomEvent('hn-scanner-preview:dependency',{bubbles:true,detail:{target:'P15',reason:'security-session-expired',fallback:'P01'}}));logout();}
  function consume(result){
    if(disposed)return;
    if(result.kind==='expired'){expire();return;}
    if(result.kind==='changed'){
      clearSecrets();if(result.receipt.sessionEffect==='reauthenticate'){expire();return;}
      if(!active||disposed)return;panel=3;scroll=0;history.replaceState({p11:true},'','#p02/security?panel=3');render(true);securityMotion.success(root.querySelector('.p11-success-mark .p11-icon'),result);return;
    }
    if(!active||disposed)return;
    if(result.kind==='invalid')errors=result.errors;
    else if(result.kind==='rejected'){if(result.field)errors[result.field]=result.field==='current'?'Mật khẩu hiện tại không đúng.':'Mật khẩu mới bị hệ thống từ chối.';else dialog('Thao tác chưa hoàn tất',panel===4?'Không thể đăng xuất thiết bị. Phiên được giữ trong danh sách.':'Hệ thống từ chối thay đổi mật khẩu. Vui lòng kiểm tra lại.',{tone:'error',symbol:icon('alert')});}
    else if(result.kind==='blocked')dialog('Chưa thể thực hiện',panel===4?'Chưa kết nối quản lý phiên đăng nhập.':'Chưa kết nối chức năng đổi mật khẩu. Mật khẩu chưa thay đổi.',{symbol:icon('info')});
    else if(result.kind==='unknown')pendingDialog();
    else if(result.kind==='revoked'){render();dialog('Đã đăng xuất thiết bị','Phiên đăng nhập trên thiết bị đã chọn đã kết thúc. Thiết bị hiện tại của bạn vẫn hoạt động.',{tone:'success',symbol:icon('check')});}
    sync();const key=Object.keys(errors)[0];if(key)root.querySelector('#p11-'+key)?.focus();
  }
  async function submit(){
    if(sessionGuard(getState())){expire();return;}
    errors=validatePasswords(fields);if(Object.keys(errors).length){consume({kind:'invalid',errors});return;}
    const promise=flow.submit(fields);sync();const result=await promise;consume(result);
  }
  async function load(){const model=flow;const promise=model.loadSessions();if(active&&panel===4)render();const result=await promise;if(disposed||model!==flow||!active)return;if(result.kind==='expired'){expire();return;}listStatus=result.kind==='blocked'?'Chưa kết nối danh sách phiên đăng nhập. Chưa có thiết bị được xác minh.':result.kind==='unavailable'?'Không tải được danh sách phiên. Vui lòng thử lại.':'';if(panel===4)render();}
  function closeDialog(){modal?.close();}
  function dialog(title,copy,{action=null,label='Đã hiểu',cancel=null,tone='neutral',symbol=''}={}){
    if(modal||!active||disposed)return;securityMotion.cancel();modalRoute.begin();afterDialog=null;
    modal=openActionDialog({screen,tools,title,message:copy,confirmLabel:label,cancelLabel:cancel,tone,symbol,className:'p11-dialog',actionAttribute:'data-p11',
      onConfirm(){afterDialog=action;},
      onClose(){modal=null;modalRoute.closed();const task=afterDialog;afterDialog=null;void modalRoute.ready().then(()=>{if(!active||disposed)return;if(task)task();else if(!root.contains(document.activeElement))root.querySelector('h1')?.focus({preventScroll:true});});}});
  }
  const confirm=(title,copy,action,label)=>dialog(title,copy,{action,label,cancel:'Hủy',tone:'danger'});
  function reconcile(){const promise=flow.reconcile();sync();void promise.then(consume);}
  function pendingDialog(){dialog('Chưa xác định kết quả','Hãy đối chiếu yêu cầu trước khi thực hiện lại. Yêu cầu hiện tại vẫn được giữ.',{action:reconcile,label:'Đối chiếu',cancel:'Để sau',symbol:icon('info')});}
  function beforeLeave(action){if(!active){action();return;}if(modal)return;if(flow.snapshot().busy)return;if(Object.values(fields).some(Boolean))confirm('Rời màn đổi mật khẩu?','Nội dung mật khẩu đang nhập sẽ được xóa khi rời màn này.',()=>{clearSecrets();action();},'Rời màn');else action();}
  const onInput=e=>{if(!active||!Object.hasOwn(fields,e.target.name)||flow.snapshot().busy||flow.snapshot().pending)return;fields[e.target.name]=e.target.value;delete errors[e.target.name];if(fields.confirm) {if(fields.confirm!==fields.next)errors.confirm='Mật khẩu xác nhận chưa khớp.';else delete errors.confirm;}sync();};
  const onSubmit=e=>{if(active&&e.target.id==='p11-form'){e.preventDefault();void submit();}};
  const onClick=e=>{
    if(!active)return;const b=e.target.closest('button');if(!b||!root.contains(b))return;
    const k=b.dataset.p11Eye;if(k){toggleEye(b,k,e.detail>0);return;}
    if(b.dataset.p11==='back')beforeLeave(onBack);
    if(b.dataset.p11==='reload')void load();
    if(b.dataset.p11==='reconcile')reconcile();
    if(b.dataset.p11Revoke){const id=b.dataset.p11Revoke,row=flow.snapshot().sessions?.find(x=>x.id===id);if(!row)return;confirm('Đăng xuất thiết bị này?',`Phiên trên ${row.device||'thiết bị được chọn'} sẽ được đăng xuất. Thiết bị hiện tại vẫn được giữ.`,async()=>{const promise=flow.revoke(id);sync();consume(await promise);},'Đăng xuất');}
  };
  review.querySelector('select').addEventListener('change',e=>{const selected=e.target.value;if(flow?.snapshot().busy||flow?.snapshot().pending){e.target.value=scenario;if(flow.snapshot().pending)pendingDialog();return;}scenario=selected;clearSecrets();flow?.dispose();init();listStatus='';scroll=0;if(panel===3)panel=1;history.replaceState({p11:true},'',`#p02/security?panel=${panel===4?4:1}`);render();if(panel===4)void load();});
  const onPointerDown=e=>{const b=e.target.closest('[data-p11-eye]');if(!active||!b||!root.contains(b)||b.disabled)return;const input=root.querySelector('#p11-'+b.dataset.p11Eye);eyeSelections.set(b,[input.selectionStart,input.selectionEnd,input.selectionDirection]);if(document.activeElement===input)e.preventDefault();};
  root.addEventListener('pointerdown',onPointerDown);root.addEventListener('input',onInput);root.addEventListener('submit',onSubmit);root.addEventListener('click',onClick);
  return {
    show(){if(sessionGuard(getState())){expire();return;}if(!flow)init();const entering=!active;active=true;securityMotion.activate();review.hidden=false;const next=Number(new URLSearchParams(location.hash.split('?')[1]).get('panel'));const oldPanel=panel;panel=next===4?4:next===3&&flow.snapshot().receipt?3:errors.confirm?2:1;if(entering||(oldPanel===4)!==(panel===4)){listStatus='';scroll=0;}if(next===3&&panel!==3)history.replaceState({p11:true},'','#p02/security?panel=1');render(true);if(panel===4&&(entering||oldPanel!==4||!flow.snapshot().sessions)&&!flow.snapshot().listBusy)void load();},
    beforeLeave,
    handleNavigation(){if(modalRoute.navigation(closeDialog,()=>!!modal))return true;if(!active||location.hash===renderedHash)return false;if(flow.snapshot().busy){history.replaceState({p11:true},'',renderedHash);sync();return true;}if(Object.values(fields).some(Boolean)){const attempted={hash:location.hash,state:history.state};history.pushState({p11:true},'',renderedHash);beforeLeave(()=>{history.replaceState(attempted.state,'',attempted.hash);onRoute();});return true;}return false;},
    setMotionMode(value){securityMotion.setMode(value);},
    cancelMotion(){securityMotion.cancel();if(active&&sessionGuard(getState())){clearSecrets();securityMotion.hide();}},
    hide(){if(active){clearSecrets();scroll=0;}active=false;securityMotion.hide();review.hidden=true;screen.classList.remove('p11-form-screen');closeDialog();},
    dispose(){disposed=true;active=false;clearSecrets();securityMotion.dispose();flow?.dispose();modalRoute.dispose();closeDialog();review.remove();root.removeEventListener('pointerdown',onPointerDown);root.removeEventListener('input',onInput);root.removeEventListener('submit',onSubmit);root.removeEventListener('click',onClick);}
  };
}
