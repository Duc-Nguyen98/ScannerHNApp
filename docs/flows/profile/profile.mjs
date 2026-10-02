import {logoutButton} from './logout-button.mjs';
import {readProfile,editableDraft,isProfileDirty,prepareProfilePatch,PROFILE_OPERATIONS,PROFILE_BUILD,permissionState,profileIntent,createProfilePreviewAdapter} from './profile-model.mjs';
import {PROFILE_ICONS} from './icons.mjs';
import {openActionDialog} from '../shared/action-dialog.mjs';
import {createDialogRoute} from '../shared/dialog-route.mjs';
import {sessionGuard} from '../home/home-flow.mjs';
import {mountScaledControls} from '../shared/scaled-controls.mjs';
import {mountFormNavigation} from '../shared/form-navigation.mjs';
import {mountProfileMotion} from './motion.mjs';

const esc=v=>String(v??'Chưa có dữ liệu').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<svg class="p10-icon" viewBox="0 0 24 24" aria-hidden="true">${PROFILE_ICONS[n]}</svg>`;
const tile=(n,op='documents',size='lg')=>`<span class="hn-operation-icon" data-hn-operation="${op}" data-size="${size}">${icon(n)}</span>`;
const button=(a,label,cls='')=>`<button type="button" class="${cls}" data-p10="${a}">${label}</button>`;
const row=(a,n,title,copy='',size='lg')=>button(a,`${tile(n,'documents',size)}<span><strong>${title}</strong>${copy?`<small>${copy}</small>`:''}</span>${icon('chevron')}`,'p10-menu');
const notice=(title,copy)=>`<aside class="p10-notice">${icon('info')}<div><strong>${title}</strong><p>${copy}</p></div></aside>`;

export function mountProfile({root,screen,tools,getState,onHome,onSize,onRoute,onSecurity,onShift,logout,logoutWarning=()=>'',logoutBlocked=()=>'',motionMode='auto',onPanelTransition=()=>{}}) {
  let active=false,disposed=false,panel=1,profile=null,draft=null,modal=null,busy=false,renderedHash='',pendingAction=null;
  let renderedState=null,backPending=false,viewVersion=0;
  const journey=crypto.randomUUID();
  const ownedModalTokens=new Set();
  const scrolls={},focusByPanel={};
  const adapter=createProfilePreviewAdapter();
  const profileMotion=mountProfileMotion({root,requested:motionMode,active:()=>active&&!disposed});
  const routeKey=()=>`p10:${panel}`;
  const modalRoute=createDialogRoute({history,location,key:'hnProfileDialog'});
  const touch=mountScaledControls({screen,isActive:()=>active&&!disposed,selector:'.p10-app button,.p10-dialog button'});
  const keyboard=mountFormNavigation({root,isActive:()=>active&&panel===2&&!modal&&!disposed,
    getFields:()=>['name','nickname','phone'].map(n=>root.querySelector(`#p10-${n}`)).filter(Boolean),
    getScroller:()=>root.querySelector('.p10-scroll'),onDone:()=>root.querySelector('[data-p10-save]:not(:disabled)')?.focus({preventScroll:true})});
  const review=document.createElement('section');review.className='p10-tools';review.hidden=true;
  review.innerHTML=`<details><summary>P10 · Phạm vi kiểm chứng</summary><p>${esc(PROFILE_BUILD.label)} · ${esc(PROFILE_BUILD.revision)}</p><p>Hồ sơ liên hệ lấy từ B10, chỉ gắn fixture Minh Anh. Lưu/upload: BLOCKED, không gọi API. Sáu quyền riêng: UNKNOWN. P11: đã nối prototype. P14: đã nối prototype, chưa có contract backend. Dấu * theo thiết kế, chưa có policy validation.</p></details>`;
  tools.append(review);
  function remember(){if(active){scrolls[panel]=root.querySelector('.p10-scroll')?.scrollTop||0;const focus=document.activeElement;if(root.contains(focus)){if(focus.dataset.p10)focusByPanel[panel]=`[data-p10="${focus.dataset.p10}"]`;else if(focus.id?.startsWith('p10-'))focusByPanel[panel]=`#${focus.id}`;}}}
  function syncSave(animate=true){
    const dirty=isProfileDirty(profile,draft),save=root.querySelector('[data-p10-save]'),status=root.querySelector('#p10-unsaved-status');
    if(save){save.disabled=busy||!dirty;save.setAttribute('aria-busy',String(busy));if(dirty)save.setAttribute('aria-describedby','p10-unsaved-status');else save.removeAttribute('aria-describedby');}
    // Keep one live-region slot so typing never moves the form or action bar.
    const text=busy?'Đang lưu thay đổi…':dirty?'Có thay đổi chưa lưu':'';
    if(status&&status.textContent!==text){status.textContent=text;if(animate&&text)profileMotion.feedback(status);}
  }
  function avatar(){return `<span class="p10-avatar" aria-label="Ảnh đại diện ${esc(profile.name)}">${esc(profile.initials)}</span>`;}
  function field(name,label,glyph,{locked=false,required=false,type='text'}={}) {
    const v=locked?profile[name]:draft[name];
    return `<div class="p10-field"><label for="p10-${name}">${label}${required?' <span class="p10-required" aria-label="Bắt buộc theo thiết kế">*</span>':''}</label><div class="p10-input${locked?' p10-locked':''}">${icon(glyph)}<input id="p10-${name}" name="${name}" type="${type}" value="${esc(v??'')}" placeholder="${locked?'Chưa có dữ liệu':'Chưa nhập'}" ${locked?'readonly aria-readonly="true" aria-describedby="p10-admin-note"':`autocomplete="${name==='name'?'name':name==='phone'?'tel':'nickname'}" enterkeyhint="${name==='phone'?'done':'next'}" ${name==='phone'?'inputmode="tel"':''}`}>${locked?icon('lock'):name==='phone'?button('clear-phone',icon('x'),'p10-clear'):''}</div></div>`;
  }
  function mainContent(){return `<div class="p10-account-group" role="group" aria-label="Thông tin và cài đặt tài khoản">${row('edit','user','Chỉnh sửa hồ sơ','','md')}${row('rights','briefcase','Công việc & quyền','','md')}${row('security','shield-check','Tài khoản & bảo mật','','md')}</div><div class="p10-shift-section">${row('shift','power','Kết thúc ca','Kết thúc phiên làm việc hiện tại','md')}</div>${logoutButton('data-p10="logout"')}`;}
  function editor(){return `<section class="p10-avatar-card"><h2>Ảnh đại diện</h2>${button('avatar',`${avatar()}<span class="p10-camera">${icon('camera')}</span>`,'p10-avatar-button')}<small id="p10-avatar-availability">${adapter.capabilities.avatar?'Chạm để thay đổi ảnh đại diện':'Chưa hỗ trợ thay ảnh đại diện'}</small></section><form id="p10-form" novalidate>${field('name','Họ và tên','user',{required:true})}${field('nickname','Biệt danh','user')}${field('phone','Số điện thoại','phone',{required:true,type:'tel'})}${field('email','Email tài khoản','mail',{locked:true})}<p id="p10-admin-note" class="p10-admin-note">Email, vai trò và kho do quản trị viên quản lý</p>${field('role','Vai trò','user',{locked:true})}${field('warehouse','Kho làm việc','house',{locked:true})}</form>`;}
  function rights(){return `<section class="p10-work-card"><h2>Vai trò hiện tại</h2><div>${tile('user')}<span><strong>${esc(profile.role)}</strong><small>Thực hiện các nghiệp vụ kho theo phân quyền của quản trị viên.</small></span>${icon('lock')}</div></section><section class="p10-work-card"><h2>Kho làm việc</h2><div>${tile('house')}<span><strong>${esc(profile.warehouse)}</strong><small>Được quản lý và thao tác trên dữ liệu của ${esc(profile.warehouse)}.</small></span>${icon('lock')}</div></section><h2 class="p10-permission-title">Quyền truy cập chức năng</h2><p class="p10-permission-caption">Các chức năng được phép sử dụng</p><ul class="p10-permissions" aria-label="Quyền truy cập chỉ đọc">${PROFILE_OPERATIONS.map(([key,label,glyph])=>{const status=permissionState(profile.permissions[key]);return `<li data-permission="${key}" data-status="${status}" aria-label="${label}: ${status==='granted'?'Được cấp quyền':status==='denied'?'Không được cấp quyền':'Chưa xác minh'}">${tile(glyph,key)}<strong>${label}</strong><span class="p10-permission-state" aria-hidden="true">${status==='granted'?icon('check'):status==='denied'?'−':'?'}</span></li>`;}).join('')}</ul><p class="p10-permission-unknown">? Chưa xác minh quyền của từng chức năng.</p>${notice('Quyền do quản trị viên cấp','Vui lòng liên hệ quản trị viên nếu cần thay đổi quyền truy cập.')}`;}
  function security(){return `<div class="p10-account-group" role="group" aria-label="Tài khoản và bảo mật">${row('password','lock','Đổi mật khẩu','','md')}${row('sessions','smartphone','Phiên đăng nhập','','md')}${row('security-info','shield-check','Thông tin bảo mật','','md')}</div>${notice('Bảo vệ tài khoản của bạn','Hãy sử dụng mật khẩu mạnh và giữ an toàn thiết bị đăng nhập để bảo vệ tài khoản.')}`;}
  function render(focus=false,{identityChanged=false}={}){
    if(!active||disposed)return;
    profileMotion.cancel();
    viewVersion++;
    screen.classList.toggle('p10-editor',panel===2);
    const title=['','Tài khoản của tôi','Chỉnh sửa hồ sơ','Công việc & quyền','Tài khoản & bảo mật'][panel];
    root.innerHTML=`<section class="p10-app" data-panel="P10.S0${panel}"><header class="p10-header${panel===1?' p10-hero':''}"><div class="p10-heading">${panel===1?'':button('back',icon('back'),'p10-back')}<h1 tabindex="-1">${title}</h1></div>${panel===1?`<div class="p10-person">${button('edit-avatar',avatar(),'p10-profile-shortcut')}<div><div data-hn-readable-group>${button('edit-name',`<strong data-hn-readable="Họ tên" data-hn-readable-kind="value" data-hn-read-outside="true">${esc(profile.name)}</strong>`,'p10-name-shortcut')}</div><p data-hn-readable="Vai trò" data-hn-readable-kind="value">${esc(profile.role)}</p><p class="p10-warehouse">${icon('pin')}${esc(profile.warehouse)}</p></div></div>`:''}</header><div class="p10-body"><div class="p10-scroll" data-hn-touch-scroll tabindex="0" aria-label="Nội dung ${title}">${panel===1?mainContent():panel===2?editor():panel===3?rights():security()}</div>${panel===2?'<footer class="p10-footer">'+(!adapter.capabilities.save?'<p class="p10-availability">Chức năng lưu hồ sơ chưa sẵn sàng.</p>':'')+'<p id="p10-unsaved-status" class="p10-unsaved-status" role="status" aria-live="polite" aria-atomic="true"></p><button type="submit" form="p10-form" class="p10-primary" data-p10-save>Lưu thay đổi '+icon('arrow')+'</button></footer>':''}</div></section>`;
    root.querySelector('[data-p10=back]')?.setAttribute('aria-label','Quay lại Tài khoản của tôi');
    root.querySelector('[data-p10=avatar]')?.setAttribute('aria-label','Thay đổi ảnh đại diện');
    root.querySelector('[data-p10=avatar]')?.setAttribute('aria-describedby','p10-avatar-availability');
    for(const key of ['edit-avatar','edit-name']){const node=root.querySelector(`[data-p10=${key}]`);node?.setAttribute('aria-label',`Chỉnh sửa hồ sơ của ${profile.name}`);node?.setAttribute('title','Chỉnh sửa hồ sơ');}
    root.querySelector('[data-p10=clear-phone]')?.setAttribute('aria-label','Xóa số điện thoại');
    root.querySelector('.p10-scroll').scrollTop=scrolls[panel]||0;
    renderedHash=location.hash;renderedState=structuredClone(history.state);document.title=`P10 · ${title} · Prototype`;
    syncSave(false);
    if(focus)(root.querySelector(focusByPanel[panel]||'h1')||root.querySelector('h1')).focus({preventScroll:true});onSize();touch.refresh();keyboard.refresh();
    onPanelTransition(routeKey());
    if(panel===3)profileMotion.identity(root.querySelector('.p10-scroll'),identityChanged);
  }
  function closeDialog(){modal?.close();}
  function dialog(title,body,{confirm=null,confirmLabel='',cancelLabel=null,target=null,tone=null}={}) {
    if(modal||disposed||!active)return;
    profileMotion.cancel();
    pendingAction=null;modalRoute.begin();
    if(history.state?.hnProfileDialog)ownedModalTokens.add(history.state.hnProfileDialog);
    modal=openActionDialog({screen,tools,title,message:body,className:'p10-dialog',actionAttribute:'data-p10',
      cancelLabel:confirm?(cancelLabel||'Hủy'):null,confirmLabel:confirm?confirmLabel:(cancelLabel||'Đã hiểu'),
      cancelAction:'dialog-close',confirmAction:confirm?'dialog-confirm':'dialog-close',tone:tone==='logout'?'danger':'neutral',attributes:target?{'data-target':target}:{},
      onConfirm(){pendingAction=confirm;},
      onClose(){modal=null;modalRoute.closed();const action=pendingAction;pendingAction=null;if(action)void modalRoute.ready().then(()=>{if(!disposed&&active)action();});}});
  }
  function beforeLeave(action){
    if(!active){action();return;}
    if(modal||backPending)return;
    if(panel===2&&isProfileDirty(profile,draft))dialog('Bỏ thay đổi chưa lưu?','Các thông tin bạn vừa chỉnh sửa chưa được lưu.',{confirmLabel:'Bỏ thay đổi',cancelLabel:'Tiếp tục chỉnh sửa',confirm:()=>{draft=editableDraft(profile);action();}});
    else action();
  }
  function navigate(next){if(next===panel)return;beforeLeave(()=>{remember();history.pushState({p10:true,p10Navigation:{owner:journey,from:location.hash}},'',`#p02/profile?panel=${next}`);panel=next;render(true);});}
  function goBack(){beforeLeave(()=>{remember();if(history.state?.p10Navigation?.owner===journey){backPending=true;history.back();}else{history.replaceState({p10:true},'','#p02/profile?panel=1');panel=1;render(true);}});}
  async function save(){
    if(busy||!isProfileDirty(profile,draft)||sessionGuard(getState()))return;
    const version=viewVersion,route=location.hash;
    busy=true;syncSave();
    const patch=prepareProfilePatch(profile,draft);
    let result;
    try{result=await adapter.save(patch);}
    catch{result={kind:'error',message:'Không thể lưu hồ sơ. Thông tin bạn nhập vẫn được giữ để thử lại.'};}
    finally{busy=false;}
    if(disposed||!active)return;syncSave();
    if(version!==viewVersion||route!==location.hash)return;
    dialog('Chưa thể lưu hồ sơ',result.message);
  }
  async function onClick(e){
    if(!active)return;
    const b=e.target.closest('[data-p10]');if(!b||!root.contains(b))return;
    const a=b.dataset.p10;
    if(['edit','edit-avatar','edit-name'].includes(a))navigate(2);if(a==='rights')navigate(3);if(a==='security')navigate(4);if(a==='back')goBack();
    if(a==='clear-phone'){draft.phone='';const i=root.querySelector('#p10-phone');i.value='';i.focus();syncSave();}
    if(a==='avatar'){const version=viewVersion,route=location.hash,result=await adapter.uploadAvatar();if(active&&!disposed&&version===viewVersion&&route===location.hash)dialog('Ảnh đại diện',result.message);}
    if(a==='logout'&&logoutBlocked()){dialog('Cần kiểm tra kết quả xuất',logoutBlocked());return;}
    if(a==='logout')beforeLeave(()=>dialog('Đăng xuất tài khoản?','Bạn sẽ trở về màn hình đăng nhập. Đăng xuất không xác nhận kết thúc ca.'+(logoutWarning()?'\n\n'+logoutWarning():''),{confirmLabel:'Đăng xuất',confirm:logout,tone:'logout'}));
    if(a==='security-info')dialog('Thông tin bảo mật','Hãy sử dụng mật khẩu mạnh và giữ an toàn thiết bị đăng nhập để bảo vệ tài khoản.');
    const intent=profileIntent(a,getState().session,location.hash);
    if(intent){if(intent.target==='P14'&&onShift){onShift(intent);return;}if(intent.target==='P11'&&onSecurity){onSecurity(intent);return;}root.dispatchEvent(new CustomEvent('hn-scanner-preview:dependency',{bubbles:true,detail:intent}));dialog(a==='shift'?'Kết thúc ca':a==='password'?'Đổi mật khẩu':'Phiên đăng nhập',a==='shift'?'Luồng kết thúc ca chưa được kết nối. Cần kiểm tra phiếu dở trước khi kết thúc; ca làm việc và tài khoản vẫn được giữ nguyên.':a==='password'?'Màn đổi mật khẩu chưa được kết nối. Mật khẩu hiện tại chưa thay đổi.':'Màn quản lý phiên đăng nhập chưa được kết nối. Chưa có danh sách thiết bị được xác minh.',{target:intent.target});}
  }
  const onInput=e=>{if(active&&panel===2&&Object.hasOwn(draft,e.target.name)&&!e.target.readOnly){draft[e.target.name]=e.target.value;syncSave();}};
  const onSubmit=e=>{if(active&&e.target.id==='p10-form'){e.preventDefault();void save();}};
  root.addEventListener('click',onClick);root.addEventListener('input',onInput);root.addEventListener('change',onInput);root.addEventListener('submit',onSubmit);
  return {
    show(){
      if(sessionGuard(getState())){profileMotion.cancel();return;}
      const next=readProfile(getState().session);
      const nextPanel=Number(new URLSearchParams(location.hash.split('?')[1]).get('panel'));
      const identityChanged=active&&panel===3&&nextPanel===3&&JSON.stringify(profile)!==JSON.stringify(next);
      backPending=false;
      // popstate and hashchange can describe one entry; preserve live input/focus.
      if(active&&renderedHash===location.hash&&root.querySelector('.p10-app')&&JSON.stringify(profile)===JSON.stringify(next))return;
      remember();
      if(!profile||profile.id!==next.id||!isProfileDirty(profile,draft))draft=editableDraft(next);
      profile=next;
      active=true;profileMotion.activate();review.hidden=false;
      const p=Number(new URLSearchParams(location.hash.split('?')[1]).get('panel'));
      panel=[1,2,3,4].includes(p)?p:1;render(true,{identityChanged});
    },
    beforeLeave,
    handleNavigation(){
      // Forward can revisit a closed dialog marker. Consume that entry rather
      // than turning it into a second copy of the form in browser history.
      if(!modal&&!modalRoute.isClosing()&&ownedModalTokens.has(history.state?.hnProfileDialog)){history.back();return true;}
      if(modalRoute.navigation(closeDialog,()=>!!modal)&&location.hash===renderedHash)return true;
      if(!active||location.hash===renderedHash)return false;
      if(panel===2&&isProfileDirty(profile,draft)){
        const attempted={hash:location.hash,state:history.state};
        history.pushState(renderedState,'',renderedHash);
        beforeLeave(()=>{history.replaceState(attempted.state,'',attempted.hash);onRoute();});return true;
      }
      return false;
    },
    routeKey,
    setMotionMode(value){profileMotion.setMode(value);},
    cancelMotion(){profileMotion.cancel();},
    hide(){remember();active=false;viewVersion++;backPending=false;profileMotion.hide();touch.clear();keyboard.clear();review.hidden=true;screen.classList.remove('p10-editor');closeDialog();},
    dispose(){disposed=true;active=false;profileMotion.dispose();touch.dispose();keyboard.dispose();modalRoute.dispose();closeDialog();draft=null;profile=null;review.remove();root.removeEventListener('click',onClick);root.removeEventListener('input',onInput);root.removeEventListener('change',onInput);root.removeEventListener('submit',onSubmit);},
  };
}
