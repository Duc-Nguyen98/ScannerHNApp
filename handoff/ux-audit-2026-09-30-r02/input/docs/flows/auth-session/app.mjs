import {mountRecoveryShift} from '../recovery-shift/view.mjs';
import {mountReadableText} from '../shared/readable-text.mjs';
import {mountPriorityTouch} from '../shared/priority-touch.mjs';
import {createActionFeedback} from '../shared/action-feedback.mjs';
import { createFixtureAdapter } from './fixture-adapter.mjs?v=shift-r07';
import { createAuthFlow } from './auth-flow.mjs?v=shift-r07';
import { SOURCED_ICONS } from './sourced-icons.mjs';
import { createLazyHome } from './lazy-home.mjs';
import { bindLoginExperience, confirmationGuidance } from './experience.mjs';

// Existing paths reused verbatim from ../warranty-components/flow.js.
const ICONS = {
  scan: '<path d="M8 3H4a1 1 0 0 0-1 1v4m13-5h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4m8 0h4a1 1 0 0 0 1-1v-4M3 12h18M8 7v3m3-3v3m3-3v3m3-3v3m-9 5v2m3-2v2m3-2v2m3-2v2"/>',
  arrow: '<path d="M3 12h17m-6-6 6 6-6 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  ...SOURCED_ICONS,
};
const icon = (name, cls = '') => `<svg class="icon icon-${name} ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
const esc = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const root = document.querySelector('#app');
const scenario = document.querySelector('#scenario');
let renderedScreen = null;
let renderedCredentialEpoch = null;
let flow;
let authAdapter;
let lastAuthMessage='';
let recoveryView=null;
let recoveryCaller=null;
function closeRecovery(){
  if(!recoveryView)return;
  const caller=recoveryCaller;recoveryCaller=null;recoveryView.dispose();recoveryView=null;renderedScreen=null;
  history.replaceState(null,'','#login');render(flow.snapshot());
  if(caller?.epoch===flow.snapshot().credentialEpoch){root.querySelector('#username').value=caller.username;root.querySelector('#login-form').scrollTop=caller.scroll;}
  root.querySelector('#forgot')?.focus({preventScroll:true});
}
function openRecovery(){
  recoveryCaller={epoch:flow.snapshot().credentialEpoch,username:root.querySelector('#username').value,scroll:root.querySelector('#login-form').scrollTop};
  authFeedback.clear();root.innerHTML='<div class="auth-stage"><section class="screen p14-auth"><div class="p14-auth-content" style="display:flex;flex:1;min-height:0"></div></section></div>';recoveryView=mountRecoveryShift({root:root.querySelector('.p14-auth-content'),screen:root.querySelector('.screen'),tools:document.querySelector('.preview-tools'),mode:'recovery',onBack:closeRecovery,onSize:fitAuth});history.pushState({p14Recovery:true},'','#recovery');recoveryView.show();fitAuth();
}
const authFeedback=createActionFeedback({getScreen:()=>root.querySelector('.screen'),tools:document.querySelector('.preview-tools'),isActive:()=>!root.hidden,key:'hnAuthFeedback'});
let inputViewport = null;
function keepInputVisible(){
  const input=document.activeElement;
  if(root.hidden||!input?.matches('#login-form input')||root.querySelector('dialog[open]'))return;
  const box=input.getBoundingClientRect(),viewport=window.visualViewport;
  const top=viewport?.offsetTop||0,bottom=top+(viewport?.height||window.innerHeight);
  if(box.top<top+12||box.bottom>bottom-12)input.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
}
function fitAuth(){
  const screen=root.querySelector('.screen'),stage=root.querySelector('.auth-stage');if(!screen||!stage)return;
  const width=document.documentElement.clientWidth,height=document.documentElement.clientHeight;
  const editing=root.contains(document.activeElement)&&document.activeElement.matches('#login-form input,#toggle-password');
  if(!editing||inputViewport?.width!==width)inputViewport=null;
  const scale=Math.min(1,width/494,(inputViewport?.height||height)/950);
  screen.style.transform=`scale(${scale})`;
  stage.style.width=`${494*scale}px`;stage.style.height=`${950*scale}px`;
  keepInputVisible();
}
root.addEventListener('focusin',event=>{if(event.target.matches('#login-form input')){inputViewport??={width:document.documentElement.clientWidth,height:document.documentElement.clientHeight};keepInputVisible();}});
root.addEventListener('focusout',()=>queueMicrotask(fitAuth));
window.visualViewport?.addEventListener('resize',fitAuth);
window.addEventListener('resize',fitAuth);
const homeLoader=createLazyHome(attempt=>import(`../home/home.mjs?v=p05-micro-r11&p04=ui-r09&p02=audit-r16&authLoad=${attempt}`),()=>{if(flow?.snapshot().previewReady)flow.enforceSession();});
let homeView = null;
let homeWaitForUser = false;
let heldHome=false,homeIdentity=null;
const identity=s=>JSON.stringify([s.session?.namespace,s.session?.actor.id,s.session?.warehouse.id]);
const homeRoot = document.createElement('main');
homeRoot.id = 'home-app';
homeRoot.hidden = true;
root.after(homeRoot);
// One read-only text controller per application root, never observing input values.
mountReadableText({root,getScreen:()=>root.querySelector('.screen'),getTools:()=>document.querySelector('.preview-tools'),key:'hnAuthReadable'});
mountReadableText({root:homeRoot,getScreen:()=>homeRoot.querySelector('.hn-screen'),getTools:()=>homeRoot.querySelector('.hn-tools'),key:'hnAppReadable'});
mountPriorityTouch({root,getScreen:()=>root.querySelector('.screen')});
mountPriorityTouch({root:homeRoot,getScreen:()=>homeRoot.querySelector('.hn-screen')});
const brand = `<div class="brand"><span class="brand-symbol">${icon('scan')}</span><div><strong>HOA NAM SCANNER</strong><p>WMS - Vận hành chuyên nghiệp</p></div></div>`;
function frame(state) {
  const confirm = state.screen === 'confirmation';
  const actor = state.session?.actor;
  return `<div class="auth-stage"><section class="screen ${confirm ? 'confirmation' : 'login'}" data-panel="${confirm ? 'P01.S02' : 'P01.S01'}">
    <div class="hero-image" aria-hidden="true"></div>
    <header class="hero">${brand}<div class="intro"><h1 id="heading" tabindex="-1">${confirm
      ? `<span class="greeting">Chào bạn,</span><span class="auth-greeting-name">${esc(actor.name)}</span>` : 'Quản lý kho<br>Hoa Nam'}</h1>
      <p>${confirm ? 'Sẵn sàng bắt đầu<br>ca làm việc?' : 'Đăng nhập để bắt đầu phiên làm việc'}</p></div>
      <p class="motto" aria-hidden="true">${confirm ? 'MỖI<br>THAO TÁC<br>TẠO NÊN<br>GIÁ TRỊ' : 'CHÍNH XÁC<br>HIỆU QUẢ<br>VẬN HÀNH<br>BỀN VỮNG'}</p>
    </header>
    ${confirm ? confirmation(state.session) : login()}
    <footer class="footer"><strong>HOA NAM SCANNER</strong><p><span>${confirm ? 'AN TOÀN - CHÍNH XÁC - HIỆU QUẢ' : 'KẾT NỐI CON NGƯỜI - VẬN HÀNH HIỆU QUẢ'}</span></p></footer>
  </section></div>`;
}
const message = '<p id="message" hidden></p>';
function login() {
  return `<form class="card" id="login-form" aria-label="Đăng nhập" novalidate>
    <div class="field"><label for="username">Tên đăng nhập</label><div class="input-wrap">
      ${icon('user')}<input id="username" name="username" placeholder="Nhập tên đăng nhập" autocomplete="username" autocapitalize="none" spellcheck="false" enterkeyhint="next" aria-describedby="username-error"></div><p id="username-error" class="auth-field-error" hidden></p></div>
    <div class="field"><label for="password">Mật khẩu</label><div class="input-wrap">
      ${icon('lock')}<input id="password" name="password" type="password" placeholder="Nhập mật khẩu" autocomplete="current-password" enterkeyhint="go" autocapitalize="none" spellcheck="false" aria-describedby="password-error password-caps">
      <button class="eye" id="toggle-password" type="button" aria-label="Hiện mật khẩu" aria-pressed="false">${icon('eye')}</button></div><p id="password-error" class="auth-field-error" hidden></p><p id="password-caps" class="auth-key-hint" role="status" hidden>Caps Lock đang bật. Kiểm tra chữ hoa khi nhập mật khẩu.</p></div>
    <button class="forgot" type="button" id="forgot">Quên mật khẩu?</button>
    <button class="primary" type="submit" id="submit"><span>Đăng nhập</span>${icon('arrow', 'trailing')}</button>
    ${message}
    <div class="notice">${icon('shield-check')}<div>Quyền truy cập theo tài khoản được cấp.<small>Chỉ dành cho nhân viên được ủy quyền.</small></div></div>
  </form>`;
}
function confirmation(session) {
  const { actor, warehouse } = session;
  return `<div class="card" aria-label="Xác nhận phiên làm việc">
    <div class="identity"><span class="avatar" aria-hidden="true">${esc(actor.initials)}</span><div><strong data-hn-readable="Họ tên" data-hn-readable-kind="value">${esc(actor.name)}</strong><p data-hn-readable="Vai trò" data-hn-readable-kind="value">${esc(actor.role)}</p></div>${icon('chevron-right', 'trailing')}</div>
    <div class="warehouse"><span class="warehouse-tile">${icon('warehouse')}</span><div class="warehouse-copy"><strong>${esc(warehouse.name)}</strong><small>WMS - Vận hành chuyên nghiệp</small></div><span class="badge ${warehouse.active === true ? '' : 'stopped'}"><span class="status-dot" aria-hidden="true"></span>${warehouse.active === true ? 'Đang hoạt động' : warehouse.active === false ? 'Ngừng hoạt động' : 'Chưa xác minh'}</span></div>
    <div class="notice">${icon('info')}<p id="session-guidance" role="status">Thao tác theo quyền được cấp cho tài khoản của bạn.</p></div>
    <button class="primary" id="start" type="button" aria-describedby="session-guidance"><span class="action-icon leading" aria-hidden="true">${icon('circle-play')}</span><span class="button-label">Bắt đầu ca làm việc</span>${icon('chevron-right', 'trailing')}</button>
    ${message}<p class="divider">hoặc</p>
    <button class="secondary" id="logout" type="button">${icon('log-out')}Đăng xuất</button>
  </div>`;
}
function render(state) {
  if(!state.previewReady){homeLoader.reset();homeWaitForUser=false;}
  if(state.screen==='expired'&&!homeView){flow.logout('Phiên đã hết hạn. Vui lòng đăng nhập lại.');return;}
  if(state.screen==='expired'&&homeView){heldHome=true;authFeedback.clear();homeView.showExpired();return;}
  if(heldHome&&homeView&&!state.previewReady)homeView.suspend();
  if(recoveryView){if(state.screen==='login'&&location.hash==='#recovery'&&recoveryCaller?.epoch===state.credentialEpoch)return;recoveryCaller=null;recoveryView.dispose();recoveryView=null;renderedScreen=null;}
  // Load P02 separately, retaining the existing controller and verified receipt.
  const needsHome=state.previewReady && state.session && state.navigation?.target === 'P02';
  if(needsHome&&root.querySelector('dialog[open]'))homeWaitForUser=true;
  if (needsHome && homeLoader.snapshot().status==='ready'&&!homeWaitForUser) {
    authFeedback.clear();
    document.title = 'P02 · Hoa Nam Scanner · Prototype';
    root.hidden = true;
    document.querySelector('.preview-tools').hidden = true;
    homeRoot.hidden = false;
    if(heldHome&&homeView){if(homeIdentity===identity(state)){homeView.resume();}else{homeView.dispose();homeView=null;}heldHome=false;}
    if (!homeView) {
      window.scrollTo(0, 0);
      homeIdentity=identity(state);
      homeView = homeLoader.snapshot().module.mountHome({ root: homeRoot, getState: () => flow.snapshot(), expire: () => flow.expire(), logout: () => flow.logout(), securityStore: authAdapter.securityStore, draftRetention:authAdapter.draftRetention });
    }
    return;
  }
  if (homeView&&!heldHome) { homeView.dispose(); homeView = null; }
  document.title = 'P01 · Hoa Nam Scanner · Prototype';
  homeRoot.hidden = true;
  root.hidden = false;
  document.querySelector('.preview-tools').hidden = false;
  const replaced = renderedScreen !== state.screen || renderedCredentialEpoch !== state.credentialEpoch;
  if (replaced) {
    authFeedback.clear();lastAuthMessage='';
    root.innerHTML = frame(state);
    renderedScreen = state.screen;
    renderedCredentialEpoch = state.credentialEpoch;
    if (state.screen === 'login') {
      const experience=bindLoginExperience(root.querySelector('#login-form'),{onLayout:fitAuth});
      root.querySelector('#login-form').addEventListener('submit', event => {
        event.preventDefault();
        if(experience.isComposing()||flow.snapshot().busy)return;
        let invalid=false;for(const key of ['username','password']){const input=root.querySelector('#'+key),error=root.querySelector('#'+key+'-error');const missing=!input.value;input.setAttribute('aria-invalid',String(missing));error.hidden=!missing;error.textContent=missing?'Vui lòng nhập '+(key==='username'?'tên đăng nhập.':'mật khẩu.'):'';if(missing&&!invalid){input.focus();invalid=true;}}if(invalid)return;
        void flow.login({ username: root.querySelector('#username').value, password: root.querySelector('#password').value });
      });
      root.querySelector('#login-form').addEventListener('input',event=>{const key=event.target.id;if(!['username','password'].includes(key))return;if(event.target.value){event.target.setAttribute('aria-invalid','false');root.querySelector('#'+key+'-error').hidden=true;}});
      root.querySelector('#forgot').addEventListener('click', () => openRecovery());
    } else {
      root.querySelector('#start').addEventListener('click', () => {
        if(flow.snapshot().previewReady){homeWaitForUser=false;if(flow.enforceSession()&&flow.snapshot().previewReady)void homeLoader.load();}
        else void flow.start();
      });
      root.querySelector('#logout').addEventListener('click', () => authFeedback.show({title:'Đăng xuất tài khoản?',message:'Bạn sẽ trở về màn hình đăng nhập. Đăng xuất không xác nhận kết thúc ca.',cancelLabel:'Hủy',confirmLabel:'Đăng xuất',tone:'danger',onConfirm:()=>flow.logout()}));
    }
  }
  // Replace, never push protected routes. No session or secrets are stored in history.
  const hash = state.screen === 'confirmation' ? '#confirmation' : '#login';
  if (location.hash !== hash) history.replaceState(null, '', hash);
  if(!state.message||state.busy)lastAuthMessage='';
  if(!needsHome&&state.message&&!state.busy&&state.message!==lastAuthMessage){lastAuthMessage=state.message;authFeedback.show({title:state.startUnknown?'Chưa xác định kết quả':state.navigation?.target==='P14'?'Khôi phục tài khoản':'Thông báo đăng nhập',message:state.message,tone:state.startUnknown?'neutral':'error',...(state.startUnknown?{cancelLabel:'Để sau',confirmLabel:'Đối chiếu',onConfirm:()=>authFeedback.show({title:'Đối chiếu phiên',message:'Chưa kết nối nguồn đối chiếu phiên. Phiên hiện tại vẫn được giữ và chưa thể gửi lại yêu cầu bắt đầu ca.'})}:{})});}
  const form = root.querySelector('#login-form');
  if (form) {
    form.setAttribute('aria-busy', String(state.busy));
    for (const id of ['username', 'password', 'submit', 'forgot', 'toggle-password']) root.querySelector(`#${id}`).disabled = state.busy;
    root.querySelector('#submit span').textContent = state.busy ? 'Đang đăng nhập…' : 'Đăng nhập';
  } else {
    const button = root.querySelector('#start');
    const homeStatus=homeLoader.snapshot().status;
    button.disabled = needsHome ? !['error','ready'].includes(homeStatus) : state.busy || state.startUnknown || state.session.warehouse.active !== true || state.session.permissions.warehouseOperations !== true;
    button.setAttribute('aria-busy', String(state.busy||needsHome&&homeStatus==='loading'));
    button.querySelector('.button-label').textContent = needsHome ? homeStatus==='error'?'Thử tải lại Trang chủ':homeStatus==='ready'?'Mở Trang chủ':'Đang tải Trang chủ…' : state.busy ? 'Đang kiểm tra…' : 'Bắt đầu ca làm việc';
    const guidance=root.querySelector('#session-guidance'),copy=confirmationGuidance(state,homeStatus);
    if(guidance.textContent!==copy)guidance.textContent=copy;
  }
  fitAuth();
  if (state.focus&&state.focus!=='message'&&!root.querySelector('dialog[open]')) root.querySelector(`#${state.focus}`)?.focus({ preventScroll: state.focus !== 'message' && !replaced });
  if (replaced) window.scrollTo(0, 0);
  if (state.navigation) root.dispatchEvent(new CustomEvent('hn-scanner-preview:navigation', { bubbles: true, detail: state.navigation }));
  if(needsHome&&homeLoader.snapshot().status==='idle')void homeLoader.load();
}
function reset() {
  heldHome=false;
  authFeedback.clear();lastAuthMessage='';
  flow?.logout();
  renderedScreen = null;
  authAdapter = createFixtureAdapter({ scenario: scenario.value });
  flow = createAuthFlow(authAdapter, render);
  render(flow.snapshot());
}
scenario.addEventListener('change', reset);
document.querySelector('#reset').addEventListener('click', reset);
const enforceRoute = () => {
  if(recoveryView){if(location.hash==='#recovery')return;closeRecovery();return;}
  if (!flow.enforceSession()) return;
  if(!heldHome)homeView?.enforce();
};
window.addEventListener('popstate', enforceRoute);
window.addEventListener('hashchange', enforceRoute);
// Drop in-memory preview session when leaving; a bfcache restoration must not revive it.
window.addEventListener('pagehide', () => {heldHome=false;flow.logout();});
window.addEventListener('pageshow', () => flow.enforceSession());
reset();
