import {connectionAction,cameraActions} from './presentation.mjs';
import {createActionFeedback} from '../shared/action-feedback.mjs';
import {HOME_ICONS} from '../home/icons.mjs';
import {PROFILE_ICONS} from '../profile/icons.mjs';
import {LOOKUP_ICONS} from '../lookup/icons.mjs';
import {DIALOG_ICONS} from '../scanner-dialogs/icons.mjs';
import {createDeviceAccess, createReadRetry, DEVICE_COPY} from './model.mjs';

const icons = {...HOME_ICONS,...PROFILE_ICONS,...LOOKUP_ICONS,...DIALOG_ICONS,
  // Verbatim existing warranty-components/flow.js geometry.
  wifi:'<path d="M3 8a14 14 0 0 1 18 0M6 11a9 9 0 0 1 12 0M9 14a5 5 0 0 1 6 0M12 17h.01"/>',
};
const icon = name => `<svg class="p15-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.document}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button = (action,label,glyph,secondary=false,disabled=false) => `<button type="button" data-p15="${action}" class="p15-button ${secondary?'p15-secondary':''}" ${disabled?'disabled':''}>${glyph?icon(glyph):''}<span>${label}</span></button>`;
const PANELS = {
  connection:['P15.S01','Kết nối','Chưa thể đồng bộ','Không gửi lại phiếu khi chưa kiểm tra kết quả.','wifi'],
  expired:['P15.S02','Phiên hết hạn','Phiên đăng nhập hết hạn','Vui lòng đăng nhập lại để tiếp tục sử dụng ứng dụng.','document'],
  forbidden:['P15.S03','Quyền truy cập','Không có quyền thực hiện','Tài khoản không được phép thực hiện thao tác này.','lock'],
  device:['P15.S04','Quyền thiết bị'],
};

// Layer within the caller shell: keep caller DOM, scroll, form and owner flow alive.
export function mountSystem({screen,tools,onHome,onLogin,onExpire,onNfc=onHome,getContext=()=>null,isExpired=()=>false,contact=null,deviceAccess=createDeviceAccess()}) {
  const root=document.createElement('section'); root.className='p15-app';root.hidden=true;screen.append(root);
  let active=false,disposed=false,kind=null,returnFocus=null,callerTitle='',saved=[],readRetry=null,entryHash='',entryState=null,sequence=0,pendingExpired=false,details={};
  const observer=new MutationObserver(()=>{if(pendingExpired&&!screen.querySelector('.app-modal-host,.p03-host:not([hidden])')){pendingExpired=false;show('expired',{history:false});}});
  observer.observe(screen,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  const feedback=createActionFeedback({getScreen:()=>screen,tools,isActive:()=>active&&!disposed,key:'hnP15Feedback'});
  const info=(title,message)=>feedback.show({title,message,confirmLabel:'Đóng'});
  function render(focus=true) {
    const [panel,title,heading,defaultMessage,glyph]=PANELS[kind];
    root.dataset.panel=panel;
    const context=details.context,hasContact=!!(contact?.label&&contact?.value);
    const connection=connectionAction({intent:details.intent,hasRead:typeof details.read==='function',busy:readRetry?.busy,unknown:context?.unknown});
    const message=kind==='connection'?(details.intent||context?.unknown?connection.message:'Chưa thể kiểm tra kết quả lúc này. Xem hướng dẫn để tiếp tục xử lý.'):kind==='expired'?(context?'Đăng nhập lại để tiếp tục phiếu đang làm.':'Đăng nhập lại và xác nhận phiên để tiếp tục công việc.'):kind==='forbidden'&&details.actionLabel?`Bạn chưa có quyền ${details.actionLabel}.`:defaultMessage;
    const contextMarkup=context?`<aside class="p15-context" aria-label="Công việc đang xử lý"><span>${esc(context.label)}</span><strong data-hn-readable="Số phiếu" data-hn-readable-kind="value">${esc(context.number)}</strong><p>${esc(context.status)}</p></aside>`:'';
    const device=deviceAccess.snapshot();
    const card=(type,name,glyph)=>{
      const state=device[type],unsupported=state==='unsupported';
      const explanation=type==='camera'?(state==='denied'?'Cho phép Camera trong cài đặt quyền, sau đó quay lại kiểm tra.':state==='hardware-error'?'Camera có thể đang bận hoặc chưa truy cập được. Kiểm tra thiết bị rồi thử lại.':unsupported?'Môi trường hiện tại chưa hỗ trợ truy cập camera. Xem hướng dẫn để tiếp tục.':'Cấp quyền để quét mã vạch, QR code và chụp hình sản phẩm.'):unsupported?'Môi trường hiện tại không hỗ trợ đọc NFC. Xem yêu cầu về thiết bị để tiếp tục.':'Khả năng đọc thẻ cần được kiểm tra tại màn NFC. Chưa xác nhận phần cứng đã sẵn sàng.';
      const actions=type==='camera'?cameraActions(state,device.pending):unsupported?[{action:'nfc-guide',label:'Hướng dẫn thiết bị hỗ trợ',icon:'smartphone'}]:state==='denied'?[{action:'nfc-guide',label:'Hướng dẫn cấp quyền NFC',icon:'document'},{action:'nfc',label:'Về màn NFC để kiểm tra',icon:'nfc',secondary:true}]:[{action:'nfc',label:'Về màn NFC để kiểm tra',icon:'nfc'},{action:'nfc-guide',label:'Mở hướng dẫn',icon:'document',secondary:true}];
      return `<section class="p15-device-card"><div class="p15-device-heading"><span class="p15-device-icon">${icon(glyph)}</span><div><h3>${name}</h3><strong class="p15-device-state ${state==='granted'?'is-granted':''}">${esc(DEVICE_COPY[state])}</strong><p>${explanation}</p></div></div><div class="p15-device-actions">${actions.map(a=>button(a.action,a.label,a.icon,a.secondary,a.disabled)).join('')}</div></section>`;
    };
    const backLabel=context?'Quay lại phiếu':'Quay lại';
    const actions=kind==='connection'?button('retry',connection.label,'history',false,readRetry?.busy)+button(context?'back':'home',context?backLabel:'Về Trang chủ',context?'back':'house',true):kind==='expired'?button('login','Đăng nhập lại','log-out'):button('back',backLabel,'back')+(hasContact?button('contact','Liên hệ quản trị','user',true):'<button type="button" class="p15-help" data-p15="contact">Hướng dẫn liên hệ quản trị</button>');
    root.innerHTML=`<header class="p15-header"><button type="button" data-p15="back" class="p15-back" aria-label="Quay lại">${icon('back')}</button><h1 tabindex="-1">${title}</h1></header>${kind==='device'?`<div class="p15-body" tabindex="0" aria-label="Nội dung ${title}"><div class="p15-device-intro"><h2>Quyền thiết bị</h2><p>Cấp quyền cần thiết để tiếp tục quét mã.</p></div>${card('camera','Camera','camera')}${card('nfc','NFC','nfc')}</div>`:`<div class="p15-body p15-state-body"><section class="p15-state-card"><div class="p15-state-scroll" tabindex="0" aria-label="Nội dung ${title}"><div class="p15-state-copy"><div class="p15-hero-icon">${icon(glyph)}<span class="p15-state-mark ${kind==='expired'?'is-clock':''}">${icon(kind==='expired'?'clock':'alert')}</span></div><h2>${heading}</h2><p>${esc(message)}</p></div>${contextMarkup}${kind==='expired'&&context?'<p class="p15-retention">Phiếu được giữ trong trang này. Dùng đúng tài khoản và kho để tiếp tục; dữ liệu cần đối chiếu vẫn phải kiểm tra sau đăng nhập.</p>':''}${kind==='forbidden'&&!hasContact?'<p class="p15-retention">Chưa có kênh quản trị được cấu hình trong ứng dụng.</p>':''}</div><footer class="p15-state-actions">${actions}</footer></section></div>`}`;
    document.title='P15 · '+title;if(focus){root.querySelector('h1').focus({preventScroll:true});window.scrollTo(0,0);}
  }
  function show(next,options={}) {
    if(disposed||!PANELS[next])return false;
    if(next==='device'&&options.device&&options.error)deviceAccess.reportFailure(options.device,options.error,{fixture:options.fixture});
    // Owner feedback has priority; route on a later explicit action if occupied.
    if(screen.querySelector('.app-modal-host,.p03-host:not([hidden])')){
      if(next==='expired'){pendingExpired=true;screen.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());}
      return false;
    }
    details={...options,context:getContext()};
    sequence++;
    if(!active){
      returnFocus=document.activeElement;callerTitle=document.title;entryHash=location.hash;entryState=history.state;
      saved=[...screen.children].filter(e=>e!==root&&!e.matches('.hn-nav')).map(e=>[e,e.inert,e.style.visibility]);
      saved.forEach(([e])=>{e.inert=true;e.style.visibility='hidden';});
      if(options.history!==false)history.pushState({...history.state,hnP15:true},'',location.hash);
    }
    active=true;kind=next;root.hidden=false;screen.classList.add('p15-screen');
    root.style.bottom=`${screen.querySelector('.hn-nav')?.offsetHeight||0}px`;
    readRetry?.cancel();readRetry=createReadRetry({read:options.read,isActive:()=>active&&!disposed&&!isExpired()});
    render();return true;
  }
  function hide({restore=true}={}) {
    if(!active)return;sequence++;feedback.clear();readRetry?.cancel();active=false;root.hidden=true;screen.classList.remove('p15-screen');
    saved.forEach(([e,inert,visibility])=>{e.inert=inert;e.style.visibility=visibility;});saved=[];document.title=callerTitle;
    if(history.state?.hnP15)history.replaceState(entryState,'',entryHash);
    if(restore){
      const target=returnFocus?.isConnected&&!returnFocus.closest('[hidden]')?returnFocus:[...screen.querySelectorAll('#hn-destination h1,#hn-home h1')].find(e=>!e.closest('[hidden]')&&e.getClientRects().length);
      target?.focus({preventScroll:true});
    }
  }
  function back(){if(isExpired()){onLogin();return;}if(history.state?.hnP15)history.back();else hide();}
  async function retry(){
    const stamp=sequence,promise=readRetry.run();render(false);const result=await promise;
    if(!active||disposed||stamp!==sequence||result?.kind==='ignored')return;
    if(result?.panel==='expired'){onExpire();return;}
    if(result?.panel==='forbidden'){show('forbidden',{history:false});return;}
    render(false);
    if(result?.kind==='verified') {hide();return;}
    info('Chưa thể đồng bộ',result?.kind==='unavailable'?'Chưa có nguồn kiểm tra kết quả được kết nối. Phiếu và yêu cầu vẫn được giữ. Không gửi lại phiếu.':'Chưa xác minh được kết quả. Phiếu và yêu cầu vẫn được giữ để đối chiếu; không tự gửi lại.');
  }
  async function click(event){
    const b=event.target.closest('[data-p15]');if(!b||b.disabled||screen.querySelector('.app-modal-host'))return;
    const action=b.dataset.p15;
    if(action==='back')back();
    if(action==='login')onLogin();
    if(action==='home'){hide({restore:false});onHome();}
    if(action==='retry')void retry();
    if(action==='contact')info('Liên hệ quản trị',contact?.label&&contact?.value?`${contact.label}: ${contact.value}`:'Chưa có kênh liên hệ quản trị được cấu hình. Vui lòng dùng kênh hỗ trợ nội bộ do đơn vị cung cấp.');
    if(action==='camera'){
      const stamp=sequence,promise=deviceAccess.requestCamera();render(false);const result=await promise;
      if(!active||disposed||stamp!==sequence)return;render(false);root.querySelector('[data-p15="camera"]')?.focus({preventScroll:true});
      feedback.show({title:result==='granted'?'Đã cho phép camera':'Chưa sử dụng được camera',message:result==='granted'?'Quyền truy cập camera đã được kiểm tra. Về màn quét để tiếp tục.':result==='denied'?'Quyền camera chưa được cho phép. Mở phần quyền của trang hoặc ứng dụng, cho phép Camera rồi thử lại.':'Kiểm tra camera, ứng dụng khác đang sử dụng camera và phần quyền thiết bị trước khi thử lại.',confirmLabel:result==='granted'?'Đã hiểu':'Đóng',tone:result==='granted'?'success':'neutral'});
    }
    if(action==='camera-guide')info('Hướng dẫn quyền camera',deviceAccess.snapshot().camera==='unsupported'?'Môi trường hiện tại chưa cung cấp camera cho ứng dụng. Sử dụng thiết bị có camera và môi trường được đơn vị hỗ trợ. Nếu có, bạn vẫn có thể quay lại màn quét để nhập mã bằng tay.':'Mở phần quyền của trang hoặc ứng dụng trên thiết bị. Cho phép Camera, rồi quay lại và chọn Kiểm tra lại camera. Nếu bị chặn, kiểm tra cài đặt hệ thống hoặc liên hệ quản trị thiết bị. Ứng dụng không tự thay đổi cài đặt của bạn.');
    if(action==='nfc-guide'||action==='support')info('Sử dụng thiết bị hỗ trợ NFC','Cần thiết bị có NFC và môi trường chạy ứng dụng hỗ trợ đọc thẻ. Kiểm tra cài đặt NFC hoặc hỏi quản trị thiết bị. Có NFC trên máy không bảo đảm trình duyệt hiện tại hỗ trợ. Phiếu đang làm vẫn được giữ trên trang này.');
    if(action==='nfc'){hide({restore:false});onNfc();}
  }
  const keydown=e=>{if(active&&e.key==='Escape'&&!screen.querySelector('.app-modal-host')){e.preventDefault();e.stopImmediatePropagation();back();}};
  root.addEventListener('click',click);window.addEventListener('keydown',keydown,true);
  return {show,hide,get active(){return active;},get kind(){return kind;},
    navigation(){if(!active)return false;if(isExpired())return true;if(history.state?.hnP15)return true;hide();return true;},
    dispose(){pendingExpired=false;observer.disconnect();hide({restore:false});disposed=true;feedback.dispose();root.remove();window.removeEventListener('keydown',keydown,true);},
  };
}
