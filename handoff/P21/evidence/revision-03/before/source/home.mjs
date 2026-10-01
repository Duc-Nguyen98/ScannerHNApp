import {systemDocumentContext} from '../system/presentation.mjs';
import {mountSystem} from '../system/view.mjs';
import {classifySystemError} from '../system/model.mjs';
import {mountRecoveryShift} from '../recovery-shift/view.mjs';
import {createRecentChoices,pendingStockRun} from '../shared/flow-guidance.mjs';
import {openAppModal} from '../shared/app-modal.mjs';
import {createActionFeedback} from '../shared/action-feedback.mjs';
import { resolveNavigation, parseRoute, routeHash, sessionGuard } from './home-flow.mjs';
import { readHomeFixture } from './fixture-adapter.mjs?v=recent-r14';
import { TEMPORARY_ASSETS_APPROVED } from './assets.mjs?v=p02-r02';
import { HOME_ICONS } from './icons.mjs';
import { vietnamTime } from './vietnam-clock.mjs';
import {pendingWork} from './pending-work.mjs';
import { mountScannerDialogs } from '../scanner-dialogs/dialogs.mjs?v=system-audit-20260928';
import { dialogIcon } from '../scanner-dialogs/icons.mjs';
import { mountOutbound } from '../outbound/outbound.mjs?v=p05-micro-r11';
import { mountInbound } from '../inbound/inbound.mjs?v=p04-ui-r09&home=ux-r15';
import { mountLookup } from '../lookup/lookup.mjs';
import { mountNfc } from '../nfc/nfc.mjs';
import { mountHistory } from '../history/history.mjs';
import { mountWarranty } from '../warranty/warranty.mjs?v=home-ux-r15';
import { connectHistoryFrame } from '../history/embedded-history.mjs';
import { createDialogRoute } from '../shared/dialog-route.mjs';
import { mountProfile } from '../profile/profile.mjs';
import { mountSecurity } from '../security/security.mjs';
import { mountDocuments } from '../documents/documents.mjs?v=home-ux-r15';
import { recordedDocuments, mergeDocuments } from '../documents/document-model.mjs';
import { notificationCount } from '../notifications/notification-count.mjs';
import { createNotificationPreview } from '../notifications/notification-model.mjs';
import { mountNotifications } from '../notifications/notifications.mjs';
import {mountAttachments} from '../attachments/view.mjs';
import {mountComponentIssue} from '../warranty-components/issue-view.mjs';
import {mountComponentResume} from '../warranty-components/resume-view.mjs';
import {mountComponentHistory} from '../warranty-components/history-view.mjs';

const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name, cls = '') => TEMPORARY_ASSETS_APPROVED
  ? `<svg class="hn-icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${HOME_ICONS[name]}</svg>`
  : `<span class="hn-icon ${cls}" aria-hidden="true"></span>`;
const value = input => input == null ? 'Chưa xác minh' : esc(input);
const warehouseState = active => active === true ? 'active' : active === false ? 'stopped' : 'unknown';
// Greeting only: last two whitespace-separated words; never rewrite the session identity.
const greetingName = fullName => String(fullName ?? '').trim().split(/\s+/u).slice(-2).join(' ');

export function mountHome({ root, getState, logout, expire = logout, securityStore, draftRetention }) {
  const supplierHistory=createRecentChoices();
  let disposed = false;
  let suspended=false;
  let scenario = 'baseline';
  let homeScroll = 0;
  let homeContentScroll = 0;
  let dateRefreshTimer=null;
  const resumeJourney=crypto.randomUUID();
  let returnFocus = null;
  let previousKey = 'home';
  let lastNavigation = null;
  let dialogs;
  let inbound;
  let outbound;
  let lookup;
  let nfc;
  let historyView;
  let warranty;
  let profile;
  let security;
  let documents;
  let attachments;
  let componentIssue;
  let componentHistory;
  let componentResume;
  const attachmentCallers=new Map();let attachmentReturnStamp=null;
  let notifications;
  let shift;
  let system;
  let systemDenied=false;
  let shiftSeeded=false;
  let securityCaller=null,securityBackPending=false;
  let shiftCaller=null,shiftBackPending=false;
  const warrantyJourney=crypto.randomUUID();
  let pendingWarrantySelection=null,warrantyReturnPending=false;
  const warrantyReturn=()=>history.state?.p09Return?.journey===warrantyJourney?history.state.p09Return:null;
  let nfcProductPicker = false;
  const nfcPickerJourney=crypto.randomUUID();
  let pendingNfcReturn=null,nfcReturnPending=false;
  let lookupScanContext = null;
  let currentHash = location.hash;
  let embeddedRouteStamp = null;
  const routeStamp = () => JSON.stringify([location.hash, history.state]);
  let dialogCallerScroll = 0;
  let dialogCallerContentScroll = 0;
  let dialogCallerTitle = '';
  const dialogRoute=createDialogRoute({history,location});
  const state = () => {
    const current = getState();
    if(systemDenied&&current.session)current.session.permissions.warehouseOperations=false;
    if (current.session && dialogs) current.session.warehouse.active = dialogs.adapter.warehouseActive(current);
    // Stress fixtures are explicit review tools, never persisted or mixed with auth.
    if (scenario === 'short' && current.session) current.session.actor.name = 'An';
    if (scenario === 'normal' && current.session) current.session.actor.name = 'Nguyễn Minh Anh';
    if (scenario === 'long' && current.session) current.session.actor.name = 'Nguyễn Thị Hoàng Ngọc Minh Anh';
    if (scenario === 'unbroken' && current.session) current.session.actor.name = 'Nguyễn'.repeat(40);
    return current;
  };
  const notificationStore=createNotificationPreview({getState:state});
  function syncUnread(){const amount=scenario==='unknown'?null:notificationStore.unread(),button=home.querySelector('.hn-bell');if(!button)return;const count=notificationCount(amount,9);button.setAttribute('aria-label','Thông báo: '+count.exact);button.title=count.exact;const badge=button.querySelector('.hn-count');badge.textContent=count.text;badge.hidden=count.empty;}
  const getRecorded = () => inbound && outbound ? recordedDocuments([{type:'inbound',runs:[...inbound.flow.finishedRuns(),inbound.flow.snapshot()]},{type:'outbound',runs:[...outbound.flow.finishedRuns(),outbound.flow.snapshot()]}],state().session) : [];
  const homeData = () => readHomeFixture(state(), {unknown:scenario==='unknown',badge:scenario==='long'?12345:3,recorded:getRecorded()});
  const pendingRows=()=>[...pendingWork(state(),[{operation:'inbound',snapshot:inbound?.flow.snapshot()},{operation:'outbound',snapshot:outbound?.flow.snapshot()}]),...(componentIssue?.resumePending()||[]).map(s=>({operation:'warranty',id:s.document.documentId,number:s.document.documentId,label:s.unknown?'Cần kiểm tra kết quả xuất':'Phiếu linh kiện đang làm',acceptedCount:s.counts.codes}))];
  let pendingSignature='';
  // A live update must preserve both current keyboard focus and the saved Back target.
  function updateHomeList(container, attribute, html, fallback) {
    const selected = document.activeElement?.closest(`[${attribute}]`);
    const activeId = container.contains(selected) ? selected.getAttribute(attribute) : null;
    const savedId = returnFocus?.getAttribute(attribute);
    const scroller = home.querySelector('.hn-main'), top = scroller.scrollTop;
    container.innerHTML = html;
    const target = id => container.querySelector(`[${attribute}="${CSS.escape(id)}"]`) || home.querySelector(fallback);
    if (savedId) returnFocus = target(savedId);
    if (activeId) target(activeId)?.focus({preventScroll:true});
    scroller.scrollTop = top;
  }
  function refreshResume(){
    const rows=pendingRows(),signature=JSON.stringify(rows),section=home.querySelector('.hn-resume');if(!section||signature===pendingSignature)return;
    pendingSignature=signature;
    updateHomeList(section,'data-resume-document',rows.length?`<h2 id="hn-resume-title">Phiếu đang làm</h2>${rows.map(r=>`<button type="button" class="hn-resume-row" data-resume-operation="${r.operation}" data-resume-document="${esc(r.id)}"><span class="hn-tile hn-operation-icon" data-hn-operation="${r.operation}">${icon(r.operation==='warranty'?'tool':r.operation==='inbound'?'down':'up')}</span><span><strong>${esc(r.number)} · ${r.operation==='warranty'?'Linh kiện bảo hành':r.operation==='inbound'?'Nhập kho':'Xuất kho'}</strong><small>${r.label} · ${r.acceptedCount} mã</small></span>${icon('chevron')}</button>`).join('')}`:'','h1');
    section.hidden=!rows.length;
  }
  function refreshHomeWork(){if(!disposed&&lastNavigation?.kind==='home'){refreshKpis();refreshRecent();refreshResume();}}
  function openPending(operation,id){
    if(!pendingRows().some(r=>r.operation===operation&&r.id===id)){refreshHomeWork();return;}
    if(operation==='warranty'){openResume({panel:2,doc:id});return;}
    history.pushState({homeDraftResume:{operation,id,journey:resumeJourney}},'',`#p02/${operation}`);
    showRoute({key:operation});
  }
  let recentSignature='';
  function recentMarkup(rows) {
    if(rows==null)return '<p class="hn-recent-empty" role="status">Chưa xác minh được nguồn chứng từ gần đây.</p>';
    if(!rows.length)return '<p class="hn-recent-empty" role="status">Chưa có chứng từ gần đây có thời gian được xác minh.</p>';
    return rows.map(row=>`<button type="button" class="hn-record" data-recent-document="${esc(row.id)}" data-id="${esc(row.number)}"><span class="hn-tile hn-operation-icon" data-hn-operation="${row.type}">${icon(row.icon)}</span><span class="hn-record-copy"><strong>${esc(row.number)}</strong><small>${esc(row.description)}</small></span><span class="hn-record-meta"><time datetime="${esc(row.datetime)}" title="${esc(row.fullTime)}" aria-label="${esc(row.fullTime)}">${esc(row.time)}</time><br><span class="hn-label ${row.tone}">${esc(row.label)}</span></span>${icon('chevron')}</button>`).join('');
  }
  function refreshRecent() {
    const rows=homeData()?.recent,signature=JSON.stringify(rows);if(signature===recentSignature)return;
    updateHomeList(home.querySelector('.hn-recent-list'),'data-recent-document',recentMarkup(rows),'#hn-recent-title');recentSignature=signature;
  }
  function openHomeDocuments(id=null) {
    if(resolveNavigation('documents',null,state()).kind==='blocked'){showRoute({key:'documents'});return;}
    if(id&&!mergeDocuments(getRecorded()).some(r=>r.id===id&&r.warehouseId===state().session.warehouse.id)){
      homeFeedback.show({title:'Chưa thể mở chứng từ',message:'Chứng từ không còn trong nguồn dữ liệu được xác minh.'});return;
    }
    const from=location.hash;
    history.pushState({p12:true,p12Page:{version:1,from}},'',id?`#p02/documents?panel=2&doc=${encodeURIComponent(id)}`:'#p02/documents?panel=1&entry=home-recent');
    showRoute({key:'documents'});
  }
  function refreshKpis() {
    const data=homeData();
    for(const [key,field] of [['waiting','pendingDocuments'],['open','openWarranties']]){
      const button=root.querySelector(`[data-home-kpi="${key}"]`);if(!button)continue;
      const count=data?.[field];button.disabled=count==null;
      const label=key==='waiting'?'phiếu chờ xử lý trên Web':'hồ sơ bảo hành đang mở';
      button.setAttribute('aria-label',count==null?`Chưa xác minh số ${label}`:`${count} ${label}. Xem danh sách`);
      button.title=count==null?`Chưa xác minh số ${label}`:`Xem ${label}`;
      button.querySelector('strong').textContent=value(count);button.querySelector('strong').classList.toggle('hn-unknown',count==null);
    }
  }
  function openKpi(key) {
    const data=homeData(),field=key==='waiting'?'pendingDocuments':key==='open'?'openWarranties':null;
    if(!field||data?.[field]==null)return;
    const route=key==='waiting'?'documents':'warranty';
    if(resolveNavigation(route,null,state()).kind==='blocked'){showRoute({key:route});return;}
    history.pushState({homeKpi:key},'',`#p02/${route}?panel=1&kpi=${key}`);
    showRoute({key:route});
  }
  function homeMarkup() {
    pendingSignature='';
    const snapshot = state();
    const data = homeData();
    if (!data) return '';
    recentSignature=JSON.stringify(data.recent);
    data.notifications=scenario==='unknown'?null:notificationStore.unread();
    const unreadCount=notificationCount(data.notifications,9);
    const { actor, warehouse } = snapshot.session;
    const tasks = [
      ['inbound', 'box', 'Nhập kho', 'Nhận hàng và kiểm đếm'],
      ['outbound', 'up', 'Xuất kho', 'Soạn hàng theo phiếu'],
      ['warranty', 'tool', 'Bảo hành', 'Tiếp nhận và sửa chữa'],
      ['nfc', 'nfc', 'Thẻ NFC', 'Liên kết và tra cứu thẻ'],
    ];
    return `<header class="hn-hero ${TEMPORARY_ASSETS_APPROVED ? 'hn-temporary-assets' : ''}">
      <div class="hn-brand-row"><span class="hn-logo">${icon('scan')}</span><div class="hn-brand-copy"><strong>HOA NAM SCANNER</strong><p>WMS - Vận hành chuyên nghiệp</p></div>
      <button class="hn-bell" data-route="notifications" aria-label="Thông báo: ${esc(unreadCount.exact)}" title="${esc(unreadCount.exact)}">${icon('bell')}<span class="hn-count" aria-hidden="true" ${unreadCount.empty?'hidden':''}>${unreadCount.text}</span></button>
      <button class="hn-avatar" data-route="profile" aria-label="Cá nhân — ${esc(actor.name)}">${esc(actor.initials)}</button></div>
      <div class="hn-intro"><div class="hn-kho-line"><p>${esc(warehouse.name)}</p><span class="hn-active">${warehouse.active === true ? 'Đang hoạt động' : warehouse.active === false ? 'Kho tạm dừng' : 'Chưa xác minh'}</span></div><h1 tabindex="-1"><span class="hn-greeting">Chào bạn,</span> <button type="button" class="hn-name" aria-haspopup="dialog" aria-controls="hn-name-dialog" aria-label="Xem đầy đủ tên: ${esc(actor.name)}" title="${esc(actor.name)}">${esc(greetingName(actor.name))}</button></h1><p>Cùng vận hành kho hiệu quả hôm nay!</p></div>
      </header><div class="hn-main">
      <section class="hn-kpis" aria-label="Tổng quan công việc và giờ Việt Nam">${[
        [data.pendingDocuments, 'Phiếu chờ duyệt', 'document','waiting','Xem phiếu chờ xử lý trên Web'], [data.openWarranties, 'Bảo hành đang mở', 'tool','open','Xem hồ sơ bảo hành đang mở'],
      ].map(([amount, label, glyph,key,name]) => `<button type="button" class="hn-kpi hn-kpi-link" data-home-kpi="${key}" aria-label="${name}" title="${name}" ${amount==null?'disabled':''}><span class="hn-kpi-top"><strong class="${amount == null ? 'hn-unknown' : ''}">${value(amount)}</strong>${icon(glyph)}</span><span class="hn-kpi-label">${label}</span></button>`).join('')}<div class="hn-kpi hn-kpi-clock"><div class="hn-kpi-top"><time data-shift-start datetime="${esc(data.shiftStartedAt || '')}" aria-label="Ca bắt đầu, giờ Việt Nam UTC+7" title="Thời điểm xác nhận ca thành công · UTC+7">${data.shiftStartedAt ? vietnamTime(data.shiftStartedAt) : '—'}</time>${icon('clock')}</div><p>Ca bắt đầu</p></div></section>
      <section class="hn-resume" aria-labelledby="hn-resume-title" hidden></section>
      <section aria-labelledby="hn-task-title"><div class="hn-section-head"><h2 id="hn-task-title">Tác vụ kho</h2></div>
      <div class="hn-tasks">${tasks.map(([key, glyph, label, description]) => `<button class="hn-task" data-route="${key}"><span class="hn-tile hn-operation-icon" data-hn-operation="${key}">${icon(glyph)}</span><span class="hn-task-copy"><strong>${label}</strong><small>${description}</small></span>${icon('chevron', 'hn-chevron')}</button>`).join('')}</div>
      <button class="hn-scanner" data-route="lookup"><span class="hn-tile hn-operation-icon" data-hn-operation="lookup">${icon('scan')}</span><span><strong>Quét hoặc nhập mã sản phẩm</strong><small>QR · Serial · SKU</small></span>${icon('chevron')}</button></section>
      <section class="hn-recent" aria-labelledby="hn-recent-title"><div class="hn-section-head"><h2 id="hn-recent-title" tabindex="-1">Chứng từ gần đây</h2><button type="button" class="hn-view-all" data-home-documents aria-label="Xem tất cả — mở quản lý Chứng từ" title="Mở quản lý Chứng từ, mới nhất trước">Xem tất cả</button></div>
      <div class="hn-recent-list">${recentMarkup(data.recent)}</div></section></div>`;
  }
  root.innerHTML = `<div class="hn-stage" aria-label="Màn hình thiết kế P02"><section class="hn-screen" data-panel="P02.S01"><div id="hn-home">${homeMarkup()}</div><div id="hn-destination" hidden></div>
    <nav class="hn-nav" aria-label="Điều hướng chính">${[['home', 'house', 'Trang chủ'], ['documents', 'document', 'Chứng từ'], ['lookup', 'scan', 'Quét mã'], ['history', 'history', 'Lịch sử'], ['profile', 'user', 'Cá nhân']].map(([key, glyph, label]) => `<button data-route="${key}" data-tab="${key}" class="${key === 'lookup' ? 'hn-scan-tab' : ''}">${key === 'lookup' ? `<span class="hn-scan-circle">${icon(glyph)}</span>` : icon(glyph)}<span>${label}</span></button>`).join('')}</nav></section></div>
    <aside class="hn-tools" aria-label="Công cụ prototype P02"><strong>P02 · PROTOTYPE — dữ liệu fixture, không kết nối WMS</strong><p>Quyền thao tác kho: được xác nhận trong phiên fixture. Mapping quyền từng module/backend: UNKNOWN.</p><details><summary>Kịch bản kiểm tra P02</summary><label>Hiển thị fixture <select id="hn-scenario"><option value="baseline">B02 · Minh Anh · KPI minh họa</option><option value="long">Tên dài</option><option value="unknown">Nguồn dữ liệu UNKNOWN</option></select></label><button id="hn-logout">Đăng xuất fixture</button><p>${TEMPORARY_ASSETS_APPROVED ? 'Đang dùng ảnh nền và icon có sẵn trong repo để khắc phục phần bị thiếu; chưa xác minh khớp tuyệt đối B02.' : 'Hero/logo/icon chính xác chưa có; phần tài nguyên đang chờ xác nhận, chưa dùng thay thế.'}</p><p id="hn-route-status" role="status"></p></details></aside>`;
  const home = root.querySelector('#hn-home');
  // Keep the full identity intact. Only CSS shortens the visible name in the header.
  const nameDialog = document.createElement('dialog');
  nameDialog.id = 'hn-name-dialog';
  nameDialog.className = 'p07-dialog hn-action-dialog hn-name-dialog';
  let nameModal=null;
  const nameRoute=createDialogRoute({history,location,key:'hnNameDialog'});
  const closeName=()=>nameModal?.close();
  nameDialog.setAttribute('aria-labelledby', 'hn-name-dialog-title');
  nameDialog.setAttribute('aria-describedby', 'hn-full-name');
  nameDialog.innerHTML = '<h2 id="hn-name-dialog-title" class="app-modal-heading">Tên đầy đủ</h2><div class="app-modal-body"><p id="hn-full-name"></p></div><footer class="app-modal-footer"><button type="button" class="hn-action-primary">Đã hiểu</button></footer>';
  nameDialog.querySelector('button').onclick=closeName;
  root.append(nameDialog);
  const fixtureSelect = root.querySelector('#hn-scenario');
  for (const [key, label] of [['short', 'Tên ngắn · An'], ['normal', 'Tên bình thường · Nguyễn Minh Anh'], ['unbroken', 'Tên rất dài không có khoảng trắng']]) fixtureSelect.add(new Option(label, key));
  const destination = root.querySelector('#hn-destination');
  const screen = root.querySelector('.hn-screen');
  const stage = root.querySelector('.hn-stage');
  function syncDateRefresh(){
    clearTimeout(dateRefreshTimer);dateRefreshTimer=null;
    if(disposed||home.hidden||document.hidden)return;
    refreshRecent();
    dateRefreshTimer=setTimeout(syncDateRefresh,86400000-((Date.now()+7*3600000)%86400000)+50);
  }
  document.addEventListener('visibilitychange',syncDateRefresh);
  const homeFeedback=createActionFeedback({getScreen:()=>screen,tools:root.querySelector('.hn-tools'),isActive:()=>!disposed,key:'hnHomeFeedback'});
  const scannerHeader = document.createElement('header');
  scannerHeader.className = 'p03-header'; scannerHeader.hidden = true;
  scannerHeader.innerHTML = `<button data-p03-back aria-label="Quay lại màn gọi">${dialogIcon('back')}</button><strong>Quét mã</strong>`;
  screen.prepend(scannerHeader);
  // Scale the whole interactive preview, not the baseline or individual UI elements.
  const fitPreview = () => {
    if (disposed) return;
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const designWidth = screen.offsetWidth;
    // P03 shares P02's reference shell and fit; only measure its footer inset.
    if (screen.classList.contains('p03-screen')) {
      screen.style.setProperty('--p03-footer-height', `${screen.querySelector('.hn-nav').offsetHeight}px`);
    }
    // P04 uses the same locked 494×950 shell as Home. Its fixed shell and
    // internal scroller keep this uniform fit independent of content length.
    const scale = Math.min(1, width / designWidth, height / screen.offsetHeight);
    screen.style.transform = `scale(${scale})`;
    stage.style.width = `${designWidth * scale}px`;
    stage.style.height = `${screen.offsetHeight * scale}px`;
    root.style.setProperty('--hn-stage-width', `${designWidth * scale}px`);
  };
  const sizeObserver = new ResizeObserver(fitPreview);
  sizeObserver.observe(screen);
  window.addEventListener('resize', fitPreview);
  function showRoute({ key, id }, { push = false, restore = false, scannerContext = null } = {}) {
    if (disposed || suspended) return;
    if(getState().sessionExpired){system?.show('expired',{history:false});return;}
    if(systemDenied){system?.show('forbidden');return;}
    if(system?.active){system.leave(()=>showRoute({key,id},{push,restore,scannerContext}));return;}
    const documentResume=history.state?.p12Resume;
    if(!push&&documentResume?.type===key){
      const owner=key==='inbound'?inbound:key==='outbound'?outbound:null;
      if(owner?.flow.snapshot().document?.documentId!==documentResume.id){history.replaceState(null,'','#home');showRoute({key:'home'});homeFeedback.show({title:'Phiếu không còn trong phiên',message:'Mở lại chứng từ hoặc phiếu đang làm hiện tại để tiếp tục.'});return;}
      scannerContext={...scannerContext,documentId:documentResume.id,resumeExisting:true};
    }
    const resume=history.state?.homeDraftResume;
    if(!push&&resume?.journey===resumeJourney&&resume.operation===key){
      const owner=key==='inbound'?inbound:key==='outbound'?outbound:null;
      if(owner?.flow.snapshot().document?.documentId!==resume.id){history.replaceState(null,'','#home');showRoute({key:'home'});homeFeedback.show({title:'Phiếu không còn trong phiên đang làm',message:'Hãy xem chứng từ đã gửi hoặc chọn phiếu đang làm hiện tại.'});return;}
      scannerContext={...scannerContext,documentId:resume.id,resumeExisting:true};
    }
    documentBackPending=false;
    if(dialogRoute.isClosing()){void dialogRoute.ready().then(()=>showRoute({key,id},{push,restore,scannerContext}));return;}
    if (nameDialog.open) closeName();
    if (['inbound', 'outbound'].includes(key) && dialogs && !sessionGuard(state()) && !dialogs.flow.writeGuard()) {
      history.replaceState(null, '', currentHash); return;
    }
    const result = resolveNavigation(key, id, state());
    if (scannerContext && result.context) result.context = { ...result.context, ...scannerContext };
    if (['inbound','outbound'].includes(key) && result.kind === 'pending' && !id && (!scannerContext?.documentId||scannerContext?.resumeExisting)) result.kind = key;
    if (key === 'lookup' && result.kind === 'pending') result.kind = 'lookup';
    if (key === 'nfc' && result.kind === 'pending') result.kind = 'nfc';
    if (key === 'history-list' && result.kind === 'pending') result.kind = 'history-list';
    if (key === 'warranty' && result.kind === 'pending') result.kind = 'warranty';
    if (key === 'profile' && result.kind === 'pending') result.kind = 'profile';
    if (key === 'security' && result.kind === 'pending') result.kind = 'security';
    if (key === 'documents' && result.kind === 'pending') result.kind = 'documents';
    if (key === 'attachments' && result.kind === 'pending') result.kind = 'attachments';
    if (key === 'component-issue' && result.kind === 'pending') result.kind = 'component-issue';
    if (key === 'component-resume' && result.kind === 'pending') result.kind = 'component-resume';
    if (key === 'component-history' && result.kind === 'pending') result.kind = 'component-history';
    if(result.kind==='attachments'&&new URLSearchParams(location.hash.split('?')[1]).get('panel')==='4')result.tab='lookup';
    if (key === 'notifications' && result.kind === 'pending') result.kind = 'notifications';
    if (key === 'shift' && result.kind === 'pending') result.kind = 'shift';
    if (key !== 'lookup') nfcProductPicker = false;
    if (key === 'lookup' && push && !scannerContext?.selectForNfc) nfcProductPicker = false;
    if (key === 'lookup' && result.context && nfcProductPicker) result.context.selectForNfc = true;
    if (result.kind === 'blocked' && sessionGuard(state())) {
      if(state().session&&state().previewReady){system?.show('forbidden');return;}
      logout(); return;
    }
    if(result.kind==='pending'||result.kind==='blocked'){if(location.hash!==currentHash)history.replaceState(null,'',currentHash);homeFeedback.show({title:result.label||'Chưa thể mở',message:result.kind==='pending'?`${result.target} chưa được kết nối. Chưa thực hiện thao tác nghiệp vụ.`:result.message});return;}
    if (previousKey === 'home' && key !== 'home') {
      homeScroll = window.scrollY;
      homeContentScroll=home.querySelector('.hn-main').scrollTop;
      returnFocus = home.contains(document.activeElement) ? document.activeElement : root.querySelector('[data-tab="home"]');
    }
    if (push && result.kind==='shift' && location.hash!==routeHash(key,id)) {shiftCaller=location.hash;shiftBackPending=false;}
    if (push && location.hash !== routeHash(key, id)) history.pushState(key==='warranty'?{p09:true,p09From:location.hash}:key==='documents'?{p12:true,p12From:location.hash}:null, '', routeHash(key, id));
    currentHash = location.hash;
    lastNavigation = result;
    screen.classList.toggle('p02-home-screen',result.kind==='home');
    inbound?.hide({ leave: result.kind !== 'inbound' });
    outbound?.hide({ leave: result.kind !== 'outbound' });
    if (result.kind !== 'lookup') lookup?.hide();
    if (result.kind !== 'nfc') nfc?.hide();
    if (result.kind !== 'history-list') historyView?.hide();
    if (result.kind !== 'warranty') warranty?.hide();
    if (result.kind !== 'profile') profile?.hide();
    if (result.kind !== 'security') security?.hide();
    if (result.kind !== 'documents') documents?.hide();
    if (result.kind !== 'attachments') attachments?.hide();
    if (result.kind !== 'component-issue') componentIssue?.hide();
    if (result.kind !== 'component-resume') componentResume?.hide();
    screen.classList.toggle('p21-screen',result.kind==='component-resume');
    if (result.kind !== 'component-history') componentHistory?.hide();
    screen.classList.toggle('p20-screen',result.kind==='component-history');
    screen.classList.toggle('p19-screen',result.kind==='component-issue');
    screen.classList.toggle('p18-screen',result.kind==='attachments');
    if (result.kind !== 'notifications') notifications?.hide();
    if (result.kind !== 'shift') shift?.hide();
    if (result.kind !== 'shift') {shiftCaller=null;shiftBackPending=false;}
    screen.classList.toggle('p14-screen', result.kind === 'shift');
    screen.classList.toggle('p13-screen', result.kind === 'notifications');
    screen.classList.toggle('p12-screen', result.kind === 'documents');
    if (result.kind !== 'security') { securityCaller=null;securityBackPending=false; }
    screen.classList.toggle('p11-screen', result.kind === 'security');
    screen.classList.toggle('p10-screen', result.kind === 'profile');
    screen.classList.toggle('p09-screen', result.kind === 'warranty');
    if (result.kind !== 'warranty') screen.classList.remove('p09-wizard');
    screen.classList.toggle('p08-screen', result.kind === 'history-list');
    screen.classList.toggle('p08-embedded-screen', result.kind === 'available');
    screen.classList.toggle('p07-screen', result.kind === 'nfc');
    if (result.kind !== 'nfc') screen.classList.remove('p07-wizard');
    screen.classList.toggle('p06-screen', result.kind === 'lookup');
    screen.classList.toggle('p05-screen', result.kind === 'outbound');
    if (result.kind !== 'outbound') screen.classList.remove('p05-result');
    screen.classList.toggle('p04-screen', result.kind === 'inbound');
    root.querySelector('#hn-route-status').textContent = JSON.stringify(result);
    for (const button of root.querySelectorAll('[data-tab]')) {
      if (button.dataset.tab === (result.tab || 'home')) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
    home.hidden = result.kind !== 'home'; destination.hidden = result.kind === 'home';
    syncDateRefresh();
    screen.classList.toggle('hn-home-active', result.kind === 'home');
    if (result.kind === 'home') {
      syncUnread();
      document.title = 'P02 · Hoa Nam Scanner · Prototype';
      destination.className = '';
      destination.replaceChildren();
      refreshKpis();
      refreshRecent();
      refreshResume();
      const badge = home.querySelector('.hn-active');
      const active = state().session?.warehouse.active;
      if (badge) { badge.textContent = active === true ? 'Đang hoạt động' : active === false ? 'Kho tạm dừng' : 'Chưa xác minh'; badge.dataset.state=warehouseState(active); }
      if (restore || previousKey !== 'home') {
        window.scrollTo(0, homeScroll);
        home.querySelector('.hn-main').scrollTop=homeContentScroll;
        returnFocus?.focus({ preventScroll: true });
      }
    } else if (result.kind === 'inbound') {
      destination.className = 'hn-inbound';
      inbound.show(!push&&history.state?.p12DocumentReturn?.operation==='inbound'?{...result.context,documentId:history.state.p12DocumentReturn.id}:result.context, { newAttempt: push && !id && !scannerContext?.documentId });
      document.title = 'P04 · Nhập kho · Prototype';
      window.scrollTo(0, 0);
    } else if (result.kind === 'outbound') {
      destination.className = 'hn-outbound';
      // Both the Home action and P03 picker are explicit entry actions (push).
      // Route repaint/history restore must not masquerade as another attempt.
      outbound.show(!push&&history.state?.p12DocumentReturn?.operation==='outbound'?{...result.context,documentId:history.state.p12DocumentReturn.id}:result.context, { newAttempt: push && !id && !scannerContext?.documentId });
      document.title = 'P05 · Xuất kho · Prototype';
      window.scrollTo(0, 0);
    } else if (result.kind === 'nfc') {
      destination.className = 'hn-nfc';
      const returning=pendingNfcReturn?.hash===location.hash?pendingNfcReturn:null;pendingNfcReturn=null;
      nfc.show(returning?{...result.context,restoreNfc:true,...(returning.itemId?{selectedNfcProduct:returning.itemId}:{})}:result.context);
      window.scrollTo(0, 0);
    } else if (result.kind === 'lookup') {
      destination.className = 'hn-lookup';
      lookup.show(result.context);
      window.scrollTo(0, 0);
    } else if (result.kind === 'warranty') {
      destination.className = 'hn-warranty';
      if(pendingWarrantySelection){const selected=pendingWarrantySelection;pendingWarrantySelection=null;warranty.acceptProduct(selected);}
      warranty.show(result.context);
      document.title = 'P09 · Bảo hành · Prototype';
      window.scrollTo(0, 0);
    } else if (result.kind === 'profile') {
      destination.className = 'hn-profile';
      profile.show();
      window.scrollTo(0, 0);
    } else if (result.kind === 'security') {
      destination.className = 'hn-security';
      security.show();
      window.scrollTo(0, 0);
    } else if (result.kind === 'shift') {
      destination.className='hn-recovery-shift';shift.show();
    } else if (result.kind === 'notifications') {
      destination.className = 'hn-notifications';
      notifications.show();
      window.scrollTo(0, 0);
    } else if (result.kind === 'component-issue') {
      destination.className='hn-component-issue';componentIssue.show();document.title='P19 · Xuất linh kiện bảo hành · Prototype';window.scrollTo(0,0);
    } else if (result.kind === 'component-resume') {
      destination.className='hn-component-resume';componentResume.show();document.title='P21 · Tiếp tục phiếu linh kiện · Prototype';window.scrollTo(0,0);
    } else if (result.kind === 'component-history') {
      destination.className='hn-component-history';componentHistory.show();document.title='P20 · Lịch sử linh kiện · Prototype';window.scrollTo(0,0);
    } else if (result.kind === 'attachments') {
      destination.className='hn-attachments';attachments.show();document.title='P18 · Tệp và bàn giao · Prototype';window.scrollTo(0,0);
    } else if (result.kind === 'documents') {
      destination.className = 'hn-documents';
      documents.show();
      window.scrollTo(0, 0);
    } else if (result.kind === 'history-list') {
      destination.className = 'hn-history';
      historyView.show();
      window.scrollTo(0, 0);
    } else if (result.kind === 'available') {
      document.title = 'P22 · Lịch sử thao tác · Prototype';
      destination.className = 'hn-hub';
      destination.innerHTML = '<iframe title="Lịch sử thao tác"></iframe>';
      connectHistoryFrame({frame:destination.querySelector('iframe'),getBlocked:()=>disposed||sessionGuard(state()),onLogout:logout,onHome:goHome,onRoute:key=>showRoute({key})});
      embeddedRouteStamp = routeStamp();
      window.scrollTo(0, 0);
    } else {
      document.title = `${result.target || 'Điều hướng'} · ${result.label || 'Không mở được đường dẫn'} · Prototype`;
      destination.className = 'hn-dependency';
      destination.innerHTML = `<button class="hn-back" data-return>← Về Trang chủ</button><h1 tabindex="-1">${esc(result.label || 'Không mở được đường dẫn')}</h1><p role="status">${result.kind === 'pending' ? `${esc(result.target)} chưa có màn đích được tích hợp. Chưa thực hiện thao tác nghiệp vụ.` : esc(result.message)}</p>${id ? `<p>Mã ${key === 'warranty' ? 'hồ sơ' : 'chứng từ'}: <strong>${esc(id)}</strong></p>` : ''}`;
      if (scannerContext?.documentId) {
        const note = document.createElement('p');
        note.textContent = `Tiếp tục đúng phiếu ${scannerContext.documentId} · phiên quét ${scannerContext.scanSessionId} · version ${scannerContext.version} · mã: ${scannerContext.codes.join(', ')}. Điểm nối resume P21 chưa tích hợp với module này.`;
        destination.append(note);
      }
      window.scrollTo(0, 0); destination.querySelector('h1').focus({ preventScroll: true });
    }
    if(key!=='attachments'&&(previousKey==='attachments'||attachmentReturnStamp===routeStamp())){const saved=attachmentCallers.get(location.hash);if(saved){const scroll=destination.querySelector(saved.scroll);if(scroll)scroll.scrollTop=saved.top;destination.querySelector(saved.focus)?.focus({preventScroll:true});attachmentReturnStamp=routeStamp();}}
    previousKey = result.kind === 'home' ? 'home' : key;
    currentHash = location.hash;
    fitPreview();
    if (result.kind !== 'blocked') root.dispatchEvent(new CustomEvent('hn-scanner-preview:navigation', { bubbles: true, detail: result }));
  }
  function goHome() {
    if(dialogRoute.isClosing()){void dialogRoute.ready().then(()=>{if(!disposed)goHome();});return;}
    // Replace pending route to avoid growing history on return; native Back remains valid.
    history.replaceState(null, '', '#home');
    showRoute({ key: 'home' }, { restore: true });
  }
  const onClick = event => {
    const button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    if(button.dataset.p15)return;
    if(getState().sessionExpired){system?.show('expired',{history:false});return;}
    if(system?.active&&button.dataset.tab){system.leave(()=>{if(button.isConnected)button.click();});return;}
    if (button.dataset.tab && dialogs.flow.snapshot().panel) {
      if (!dialogs.flow.dismissForMenu(button.dataset.tab)) return;
      if (button.dataset.tab === 'lookup') return;
    }
    if (['profile','security'].includes(lastNavigation?.kind) && (button.dataset.route || button.id === 'hn-logout')) {
      (lastNavigation.kind==='security'?security:profile).beforeLeave(() => {
        if (button.id === 'hn-logout') requestLogout();
        else if (button.dataset.tab === 'lookup') { lookupScanContext = null; currentHash = location.hash; dialogs.flow.openPicker(); }
        else showRoute({key:button.dataset.route,id:button.dataset.id},{push:true});
      });
      return;
    }
    if (button.id === 'hn-logout') requestLogout();
    else if(button.dataset.resumeOperation)openPending(button.dataset.resumeOperation,button.dataset.resumeDocument);
    else if (button.hasAttribute('data-home-documents')) openHomeDocuments();
    else if (button.dataset.recentDocument) openHomeDocuments(button.dataset.recentDocument);
    else if (button.dataset.homeKpi) openKpi(button.dataset.homeKpi);
    else if (button.classList.contains('hn-name')) {
      nameDialog.querySelector('#hn-full-name').textContent = state().session?.actor.name ?? '';
      nameRoute.begin();nameModal=openAppModal({screen,tools:root.querySelector('.hn-tools'),dialog:nameDialog,initialFocus:'button',dismissOnBackdrop:false,onClose(){nameModal=null;root.append(nameDialog);nameRoute.closed();}});
    }
    else if (button.hasAttribute('data-p03-back')) dialogs.flow.cancel();
    else if (button.hasAttribute('data-return')) goHome();
    else if (button.dataset.tab === 'lookup') { lookupScanContext = null; currentHash = location.hash; dialogs.flow.openPicker(); }
    else if (button.dataset.route) showRoute({ key: button.dataset.route, id: button.dataset.id }, { push: true });
  };
  const onRoute = () => {
    if(suspended)return;
    if(system?.navigation())return;
    if(documents?.handleNavigation())return;
    if(nameRoute.navigation(closeName,()=>!!nameModal)&&location.hash===currentHash)return;
    if(security?.handleNavigation())return;
    if(profile?.handleNavigation())return;
    if(dialogRoute.navigation(()=>dialogs.flow.cancel('back'),()=>!!dialogs.flow.snapshot().panel))return;
    if(warranty?.handleNavigation())return;
    warrantyReturnPending=false;nfcReturnPending=false;
    if(pendingNfcReturn&&pendingNfcReturn.hash!==location.hash)pendingNfcReturn=null;
    if (dialogs.flow.snapshot().panel) {
      history.replaceState(null, '', currentHash);
      dialogs.flow.cancel('back');
      return;
    }
    // One browser Back may emit both popstate and hashchange. Preserve the
    // already-mounted hub for the same history entry instead of loading twice.
    if (lastNavigation?.kind === 'available' && destination.querySelector('iframe')?.isConnected && embeddedRouteStamp === routeStamp()) return;
    showRoute(parseRoute(location.hash), { restore: location.hash === '#home' });
  };
  dialogs = mountScannerDialogs({
    screen, tools: root.querySelector('.hn-tools'), getState: state,
    onFeedback:config=>{void dialogRoute.ready().then(()=>queueMicrotask(()=>{if(!disposed)homeFeedback.show(config);}));},
    onShow() {
      dialogRoute.begin();
      currentHash = location.hash;
      dialogCallerTitle = document.title;
      dialogCallerScroll = window.scrollY;
      if(!home.hidden)dialogCallerContentScroll=home.querySelector('.hn-main').scrollTop;
      home.hidden = true; destination.hidden = true; scannerHeader.hidden = false;
      syncDateRefresh();
      screen.classList.remove('hn-home-active');
      screen.classList.add('p03-screen');
      screen.classList.remove('p04-screen', 'p05-screen');
      screen.classList.remove('p06-screen');
      screen.classList.remove('p07-screen', 'p07-wizard');
      screen.classList.remove('p08-screen', 'p08-embedded-screen', 'p09-screen', 'p09-wizard', 'p10-screen', 'p10-editor');
      screen.classList.remove('p11-screen','p11-form-screen');
      screen.classList.remove('p12-screen','p12-create-screen');
      screen.classList.remove('p13-screen','p13-detail-screen');
      document.title = 'P03 · Dialog cố định · Prototype';
      fitPreview();
      window.scrollTo(0, 0);
    },
    onDismiss() {
      dialogRoute.closed();
      screen.classList.remove('p03-screen'); scannerHeader.hidden = true;
      screen.classList.toggle('p04-screen', lastNavigation?.kind === 'inbound');
      screen.classList.toggle('p05-screen', lastNavigation?.kind === 'outbound');
      screen.classList.toggle('p06-screen', lastNavigation?.kind === 'lookup');
      screen.classList.toggle('p07-screen', lastNavigation?.kind === 'nfc');
      screen.classList.toggle('p09-screen', lastNavigation?.kind === 'warranty');
      screen.classList.toggle('p09-wizard', lastNavigation?.kind === 'warranty' && destination.querySelector('.p09-app')?.dataset.panel !== 'P09.S01');
      screen.classList.toggle('p08-screen', lastNavigation?.kind === 'history-list');
      screen.classList.toggle('p08-embedded-screen', lastNavigation?.kind === 'available');
      screen.classList.toggle('p10-screen', lastNavigation?.kind === 'profile');
      screen.classList.toggle('p11-screen', lastNavigation?.kind === 'security');
      screen.classList.toggle('p12-screen', lastNavigation?.kind === 'documents');
      screen.classList.toggle('p13-screen', lastNavigation?.kind === 'notifications');
      screen.classList.toggle('p14-screen',lastNavigation?.kind==='shift');
      screen.classList.toggle('p13-detail-screen', lastNavigation?.kind === 'notifications' && ['P13.S02','P13.S04'].includes(destination.querySelector('.p13-app')?.dataset.panel));
      screen.classList.toggle('p12-create-screen', lastNavigation?.kind === 'documents' && destination.querySelector('.p12-app')?.dataset.panel === 'P12.S04');
      screen.classList.toggle('p11-form-screen', lastNavigation?.kind === 'security' && destination.querySelector('.p11-app')?.dataset.panel !== 'P11.S04');
      screen.classList.toggle('p10-editor', lastNavigation?.kind === 'profile' && destination.querySelector('.p10-app')?.dataset.panel === 'P10.S02');
      screen.classList.toggle('p07-wizard', lastNavigation?.kind === 'nfc' && destination.querySelector('.p07-app')?.dataset.panel !== 'P07.S01');
      home.hidden = lastNavigation?.kind !== 'home'; destination.hidden = !home.hidden;
      syncDateRefresh();
      screen.classList.toggle('hn-home-active', !home.hidden);
      document.title = dialogCallerTitle || 'P02 · Hoa Nam Scanner · Prototype';
      // Navigation is delivered synchronously after dismiss. Expire the caller
      // context afterwards, including Escape/Back cancellation paths.
      queueMicrotask(() => { lookupScanContext = null; });
      fitPreview();
      window.scrollTo(0, dialogCallerScroll);
      if(!home.hidden)home.querySelector('.hn-main').scrollTop=dialogCallerContentScroll;
    },
    onNavigate(result) {
      if (result.kind === 'home') goHome();
      else {
        const context = result.operation === 'lookup' && lookupScanContext
          ? { ...result.context, ...lookupScanContext, restoreLookup: true } : result.context;
        lookupScanContext = null;
        if(result.operation==='warranty'&&context.documentId){
          const owner=componentIssue?.resumeOwner(context.documentId),s=owner?.snapshot();
          if(s&&!owner.resumeGuard()&&s.scanSessionId===context.scanSessionId&&s.document.version===context.version){openResume({doc:context.documentId,panel:2});return;}
          homeFeedback.show({title:'Chưa xác minh được phiếu linh kiện',message:'Phiếu trong dialog chưa khớp với nguồn phiếu đang làm. Giữ nguyên định danh để đối chiếu; không tạo phiếu thay thế.'});return;
        }
        showRoute({ key: result.operation }, { push: !context.restoreLookup, scannerContext: context });
      }
    },
  });
  let documentBackPending=false;
  const returnDocumentCaller=()=>{if(history.state?.p12CreateFrom){if(!documentBackPending){documentBackPending=true;history.back();}}else goHome();};
  const openRecordedDocument=id=>{
    history.replaceState({...history.state,p12DocumentReturn:{id,operation:lastNavigation.kind}},'',location.hash);
    history.pushState({p12:true,p12From:location.hash},'',`#p02/documents?panel=2&doc=${encodeURIComponent(id)}`);showRoute({key:'documents'});
  };
  inbound = mountInbound({ supplierHistory, root: destination, tools: root.querySelector('.hn-tools'), getState: state,onSystem:showSystem,onDocument:openRecordedDocument,onBack:returnDocumentCaller,
    onHome: goHome, onStopped: () => dialogs.flow.showStopped(), onSize: fitPreview, onStateChange:refreshHomeWork });
  outbound = mountOutbound({ root: destination, tools: root.querySelector('.hn-tools'), getState: state,onSystem:showSystem,onDocument:openRecordedDocument,onBack:returnDocumentCaller,
    onHome: goHome, onStopped: () => dialogs.flow.showStopped(), onSize: fitPreview, onStateChange:refreshHomeWork });
  lookup = mountLookup({ root: destination, tools: root.querySelector('.hn-tools'), getState: state,onLocation:item=>openAttachments({panel:4,item:item.id}),
    onHome: () => nfcProductPicker ? returnToNfc() : warrantyReturn() ? returnToWarranty() : goHome(), onSize: fitPreview,
    onSelectProduct: id => returnToNfc(id),
    onWarranty: item => {
      if(warrantyReturn()){returnToWarranty(item.serial);return;}
      history.pushState({p09:true,p09From:location.hash},'',`#p02/warranty?panel=2&serial=${encodeURIComponent(item.serial)}`);
      showRoute({key:'warranty'});
    },
    onScan: context => { lookupScanContext = context; currentHash = location.hash; dialogs.flow.openPicker(); } });
  function returnToWarranty(serial){
    const caller=warrantyReturn();if(!caller||warrantyReturnPending)return;warrantyReturnPending=true;
    pendingWarrantySelection=serial||null;
    history.go(-caller.depth);
  }
  function returnToNfc(itemId) {
    if(nfcReturnPending)return;
    const caller=history.state?.p07PickerReturn;
    if(caller?.journey===nfcPickerJourney){nfcReturnPending=true;pendingNfcReturn={hash:caller.hash,itemId};history.back();return;}
    history.replaceState(null, '', '#p02/nfc?panel=2');
    showRoute({key:'nfc'}, {scannerContext:{restoreNfc:true,...(itemId?{selectedNfcProduct:itemId}:{})}});
  }
  nfc = mountNfc({root:destination,tools:root.querySelector('.hn-tools'),screen,getState:state,onSystem:showSystem,
    onHome:goHome,onSize:fitPreview,onChooseProduct:()=>{
      const callerHash=location.hash;nfcProductPicker=true;
      showRoute({key:'lookup'},{push:true,scannerContext:{selectForNfc:true}});
      history.replaceState({...history.state,p07PickerReturn:{journey:nfcPickerJourney,hash:callerHash}},'',location.hash);
    }});
  historyView = mountHistory({root:destination,tools:root.querySelector('.hn-tools'),screen,getState:state,onSize:fitPreview,
    onHub:()=>showRoute({key:'history'},{push:true}),
    onDependency:context=>{
      const q=new URLSearchParams({scene:context.scene,return:'p08'});
      for(const k of ['event','session'])if(context[k])q.set(k,context[k]);
      history.pushState({returnTo:location.hash},'',`#p02/history?${q}`);
      showRoute({key:'history'});
    }});
  function openResume(context,force=false){if(disposed||sessionGuard(state()))return;const hash='#p02/component-resume?'+new URLSearchParams(context);if(location.hash===hash){if(force)componentResume.show(true);return;}history.pushState({p21From:location.hash},'',hash);showRoute({key:'component-resume'});}
  componentResume=mountComponentResume({onPosted:s=>{const r=s.receipt;if(!componentIssue.posted().some(x=>x.id===r?.id&&x.caseId===s.caseId&&x.requestId===s.request?.id))return;history.replaceState({...history.state,p20ReceiptFocus:{caseId:s.caseId,receiptId:r.id}},'',location.hash);openComponentHistory({case:s.caseId});},root:destination,screen,tools:root.querySelector('.hn-tools'),getState:state,getOwner:(id,sample)=>componentIssue?.resumeOwner(id,sample),getPending:sample=>componentIssue?.resumePending(sample)||[],seedDemo:scene=>componentIssue.seedResume(scene),onNavigate:openResume,onHome:goHome,onHistory:()=>showRoute({key:'history'},{push:true}),onIssue:(s,panel,sample)=>openIssue({case:s.caseId,doc:s.document.documentId,panel,...(sample?{sample:'b21'}:{})}),onSize:fitPreview});
  function openIssue(context){if(disposed||sessionGuard(state()))return;history.pushState({p19From:location.hash},'','#p02/component-issue?'+new URLSearchParams(context));showRoute({key:'component-issue'});}
  function openComponentHistory(context){if(disposed||sessionGuard(state()))return;const nextHash='#p02/component-history?'+new URLSearchParams(context);if(location.hash===nextHash)return;const focus=history.state?.p20ReceiptFocus,verified=focus?.caseId===context.case&&componentIssue.posted().some(r=>r.caseId===focus.caseId&&r.id===focus.receiptId&&r.status==='POSTED');if(focus){const prior={...history.state};delete prior.p20ReceiptFocus;history.replaceState(prior,'',location.hash);}history.pushState({p20From:location.hash,...(verified?{p20ReceiptFocus:focus}:{})},'','#p02/component-history?'+new URLSearchParams(context));showRoute({key:'component-history'});}
  componentHistory=mountComponentHistory({onFallback:id=>{history.replaceState({p09:true},'',id?'#p02/warranty?'+new URLSearchParams({case:id,panel:3,tab:'parts'}):'#p02/warranty?panel=1');showRoute({key:'warranty'});},root:destination,screen,tools:root.querySelector('.hn-tools'),getState:state,getIssuedDocuments:()=>componentIssue?.posted()||[],getPendingIssue:id=>componentIssue?.pendingForCase(id),onSize:fitPreview,onNavigate:openComponentHistory,onIssue:(id,doc)=>doc?openResume({doc,panel:2}):openIssue({case:id,panel:1}),onCase:(id,tab)=>{history.pushState({p09:true,p09From:location.hash},'','#p02/warranty?'+new URLSearchParams({case:id,panel:3,tab}));showRoute({key:'warranty'});}});
  componentIssue=mountComponentIssue({onResume:(s,sample)=>openResume({panel:s.unknown?4:2,doc:s.document.documentId,...(sample?{sample:'b21'}:{})}),root:destination,screen,tools:root.querySelector('.hn-tools'),getState:state,onHome:goHome,onSize:fitPreview,onNavigate:openIssue,onCase:(caseId,receiptId)=>{const confirmed=componentIssue.posted().some(r=>r.caseId===caseId&&r.id===receiptId&&r.status==='POSTED');history.pushState({p09:true,...(confirmed?{p19ReceiptFocus:{caseId,receiptId},p20ReceiptFocus:{caseId,receiptId}}:{})},'','#p02/warranty?panel=3&tab=parts&case='+encodeURIComponent(caseId));showRoute({key:'warranty'});}});
  warranty = mountWarranty({onComponentHistory:caseId=>openComponentHistory({case:caseId}),getPendingIssue:caseId=>componentIssue.pendingForCase(caseId),getIssuedDocuments:()=>componentIssue.posted(),onIssue:(caseId,documentId)=>{if(documentId){const pending=componentIssue.pendingForCase(caseId);if(!pending||pending.document.documentId!==documentId)return;openResume({doc:documentId,panel:pending.unknown||pending.busy?4:2});}else openIssue({case:caseId,panel:1});},root:destination,tools:root.querySelector('.hn-tools'),screen,getState:state,onHome:goHome,onSize:fitPreview,onHandoff:caseId=>openAttachments({panel:3,case:caseId}),
    onLookup:caller=>{history.pushState({p09Return:{journey:warrantyJourney,hash:caller.hash,depth:1}},'','#p02/lookup');showRoute({key:'lookup'});}});
  profile = mountProfile({root:destination,tools:root.querySelector('.hn-tools'),screen,getState:state,onHome:goHome,onSize:fitPreview,logout,logoutWarning:handoffLogoutWarning,logoutBlocked:issueLogoutBlock,
    onShift:()=>showRoute({key:'shift'},{push:true}),
    onSecurity:intent=>{securityCaller=intent.returnTo;securityBackPending=false;history.pushState({p11:true,p11From:intent.returnTo},'',`#p02/security?panel=${intent.action==='sessions'?4:1}`);showRoute({key:'security'});},
    onRoute:()=>showRoute(parseRoute(location.hash),{restore:location.hash==='#home'})});
  security = mountSecurity({root:destination,tools:root.querySelector('.hn-tools'),screen,getState:state,onSize:fitPreview,logout,accountStore:securityStore,
    onBack:()=>{if(securityBackPending)return;if(securityCaller){securityBackPending=true;history.back();}else{history.replaceState({p10:true},'','#p02/profile?panel=4');showRoute({key:'profile'});}},
    onRoute:()=>showRoute(parseRoute(location.hash),{restore:location.hash==='#home'})});
  const pendingRun=type=>pendingStockRun(type,(type==='inbound'?inbound:type==='outbound'?outbound:null)?.flow.snapshot(),state().session);
  function issueLogoutBlock(){return componentIssue?.pending().some(s=>s.busy||s.unknown)?'Phiếu xuất linh kiện đang chờ xác nhận hoặc cần đối chiếu. Hoàn tất đối chiếu trước khi đăng xuất để giữ đúng yêu cầu hiện tại.':'';}
  function handoffLogoutWarning(){return [attachments?.hasUnsavedHandoff()?'Thông tin bàn giao đang nhập chưa được gửi và sẽ bị xóa khi đăng xuất. Hồ sơ bảo hành không thay đổi.':'',componentIssue?.pending().length?'Danh sách linh kiện chưa xuất chỉ được giữ trong phiên này và sẽ mất khi đăng xuất.':''].filter(Boolean).join('\n\n');}
  function requestLogout(){if(issueLogoutBlock()){homeFeedback.show({title:'Cần kiểm tra kết quả xuất',message:issueLogoutBlock()});return false;}if((attachments?.hasUnsavedHandoff()||componentIssue?.pending().length)&&!getState().sessionExpired&&!sessionGuard(state())){homeFeedback.show({title:componentIssue?.pending().length?'Đăng xuất và bỏ thông tin đang nhập?':'Đăng xuất và bỏ thông tin bàn giao?',message:handoffLogoutWarning(),cancelLabel:'Hủy',confirmLabel:'Đăng xuất',onConfirm:logout});return false;}logout();return true;}
  function openAttachments(context){if(disposed||sessionGuard(state()))return;
    if(!location.hash.startsWith('#p02/attachments')){const el=document.activeElement,attr=['data-p12-file','data-p12','data-p09','data-p06'].find(a=>el?.hasAttribute(a)),scroll=['.p12-scroll','.p09-scroll','.p06-scroll'].find(q=>destination.querySelector(q));if(attr&&scroll&&destination.contains(el))attachmentCallers.set(location.hash,{focus:`[${attr}="${CSS.escape(el.getAttribute(attr))}"]`,scroll,top:destination.querySelector(scroll).scrollTop});}
    history.pushState({p18From:location.hash},'','#p02/attachments?'+new URLSearchParams(context));showRoute({key:'attachments'});
  }
  attachments=mountAttachments({getIssuedDocuments:()=>componentIssue.posted(),root:destination,screen,tools:root.querySelector('.hn-tools'),getState:state,getDocuments:()=>mergeDocuments(getRecorded()),onHome:goHome,onNavigate:openAttachments,onSize:fitPreview,onCase:id=>{history.pushState({p09:true,p09From:location.hash},'','#p02/warranty?panel=3&case='+encodeURIComponent(id));showRoute({key:'warranty'});},onLookup:id=>{history.pushState({p06From:location.hash},'','#p02/lookup?panel=3&item='+encodeURIComponent(id));showRoute({key:'lookup'});}});
  documents = mountDocuments({onAttachments:(doc,file)=>openAttachments({panel:file?2:1,doc,...(file?{file}:{})}),onSystemError:showSystem,supplierHistory,getDrafts:()=>[pendingRun('inbound'),pendingRun('outbound')].filter(Boolean),root:destination,tools:root.querySelector('.hn-tools'),screen,getState:state,onHome:goHome,onSize:fitPreview,
    onCase:caseId=>{history.pushState({p09:true,p09From:location.hash},'',`#p02/warranty?panel=3&case=${encodeURIComponent(caseId)}`);showRoute({key:'warranty'});},
    getRecorded,
    getPending:type=>pendingRun(type)?.document||null,
    onCreate:(form,resume)=>{
      const createFrom=location.hash;
      const resumeId=resume?(form.resumeId||pendingRun(form.type)?.document.documentId):null;
      if(resume&&(!resumeId||(form.type==='inbound'?inbound:outbound).flow.snapshot().document?.documentId!==resumeId)){homeFeedback.show({title:'Phiếu đã thay đổi',message:'Không tìm thấy đúng phiếu đang làm. Hãy kiểm tra lại danh sách chứng từ.'});return;}

      if(form.type==='warranty'){history.pushState({p09:true,p09From:location.hash},'','#p02/warranty?panel=2');showRoute({key:'warranty'});return;}
      showRoute({key:form.type},{push:true,scannerContext:resume?{documentId:resumeId,resumeExisting:true}:form.type==='inbound'?{documentEntry:{supplierId:form.supplierId,note:form.note}}:null});
      if(lastNavigation?.kind===form.type)history.replaceState({...history.state,p12CreateFrom:createFrom,...(resumeId?{p12Resume:{type:form.type,id:resumeId}}:{})},'',location.hash);
      if(form.type==='inbound'&&!resume&&lastNavigation?.kind==='inbound')inbound.flow.next();
    }});
  notifications=mountNotifications({root:destination,tools:root.querySelector('.hn-tools'),screen,getState:state,store:notificationStore,onHome:goHome,onSize:fitPreview,onUnread:syncUnread,
    getDocuments:()=>mergeDocuments(recordedDocuments([{type:'inbound',runs:[...inbound.flow.finishedRuns(),inbound.flow.snapshot()]},{type:'outbound',runs:[...outbound.flow.finishedRuns(),outbound.flow.snapshot()]}],state().session)),
    onDocument:(id,tab)=>{history.pushState({p12:true,p12From:location.hash},'',`#p02/documents?panel=${tab==='products'?3:2}&doc=${encodeURIComponent(id)}`);showRoute({key:'documents'});}});
  let draftRestoreFailed=false;
  const shiftRecords=()=>[
    ...componentIssue.records(),
    ...[['inbound',inbound],['outbound',outbound]].map(([operation,view])=>({operation,...view.flow.snapshot()})),
    ...(dialogs.flow.snapshot().document?[{operation:dialogs.flow.snapshot().document.operation,...dialogs.flow.snapshot(),source:'P03'}]:[])
  ].filter(r=>r.document&&!r.recorded&&r.outcome!=='recorded');
  shift=mountRecoveryShift({root:destination,tools:root.querySelector('.hn-tools'),screen,mode:'shift',getState:state,getRecords:shiftRecords,onSize:fitPreview,onHome:goHome,
    onHistory:()=>{history.pushState({p08Back:true,p14HistoryReturn:true},'','#p02/history-list?panel=1');showRoute({key:'history-list'});},
    logoutWarning:handoffLogoutWarning,onLogout:()=>{if(draftRestoreFailed)return {kind:'blocked'};const retained=draftRetention?.retain(state(),shiftRecords());if(retained?.kind!=='retained')return {kind:'blocked'};logout();return retained;},
    seed:()=>{if(shiftSeeded||draftRestoreFailed)return;shiftSeeded=true;if(!shiftRecords().length){inbound.flow.start();inbound.flow.leave();}},
    onBack:()=>{if(shiftBackPending)return;if(shiftCaller){shiftBackPending=true;history.back();}else{history.replaceState(null,'','#p02/profile');showRoute({key:'profile'});}},
    onContinue:r=>{if(r.source==='P19'){openIssue({case:r.caseId,doc:r.document.documentId,panel:r.unknown?3:1});return;}if(r.source==='P03'){dialogs.flow.openUnfinished();return;}const current=(r.operation==='inbound'?inbound:outbound).flow.snapshot();if(current.document?.documentId!==r.document.documentId){homeFeedback.show({title:'Chưa thể tiếp tục',message:'Không tìm thấy đúng phiếu trong phiên. Dữ liệu được giữ nguyên để đối chiếu.'});return;}openPending(r.operation,r.document.documentId);}
  });
  const retainedDrafts=draftRetention?.read(state())||[];
  const restoredDrafts=retainedDrafts.map(r=>r.source==='P03'?dialogs.flow.loadFixtureDocument(r.document):(r.operation==='inbound'?inbound:outbound).flow.restorePreview(r));
  draftRestoreFailed=restoredDrafts.some(ok=>!ok);
  if(retainedDrafts.length&&restoredDrafts.every(Boolean))draftRetention.acknowledge(state());
  const systemScope={actorId:getState().session?.actor.id,warehouseId:getState().session?.warehouse.id};
  function systemContext(){
    const operation=lastNavigation?.kind;
    const owner=operation==='inbound'?inbound:operation==='outbound'?outbound:null;
    return owner?systemDocumentContext(operation,owner.flow.snapshot(),systemScope):null;
  }
  function showSystem(error,options={}){
    const panel=classifySystemError(error);if(!panel)return false;
    if(panel==='expired'){expire();return true;}
    if(suspended||!getState().session)return true;
    if(panel==='forbidden')systemDenied=true;
    if(system?.active&&system.kind===panel)return true;
    return system?.show(panel,{...options,intent:options.intent||(error.kind==='unknown'?'reconcile':'read'),actionLabel:options.actionLabel})===true;
  }
  system=mountSystem({screen,onForbidden:()=>{systemDenied=true;},getContext:systemContext,tools:root.querySelector('.hn-tools'),onHome:goHome,onLogin:logout,onExpire:expire,onNfc:()=>showRoute({key:'nfc'},{push:true}),isExpired:()=>!!getState().sessionExpired});
  // Explicit prototype controls stay outside product navigation.
  const systemTools=document.createElement('details');systemTools.className='p15-tools';
  systemTools.innerHTML='<summary>P15 · Hệ thống</summary><p>Chỉ mô phỏng lỗi hệ thống. Camera kiểm tra API môi trường thực khi bấm; không kết nối WMS.</p><button data-system-demo="connection">P15.S01 · Kết nối</button><button data-system-demo="expired">P15.S02 · Phiên hết hạn</button><button data-system-demo="forbidden">P15.S03 · Không có quyền</button><button data-system-demo="device">P15.S04 · Quyền thiết bị</button><button data-system-demo="deny">Mô phỏng thu hồi quyền</button><button data-system-demo="allow">Khôi phục quyền fixture</button>';
  systemTools.addEventListener('click',e=>{const action=e.target.dataset.systemDemo;if(!action)return;if(action==='expired')expire();else if(action==='deny'){systemDenied=true;system.show('forbidden');}else if(action==='allow'){systemDenied=false;system.hide();}else system.show(action);});
  root.querySelector('.hn-tools').append(systemTools);
  root.addEventListener('click', onClick);
  root.querySelector('#hn-scenario').addEventListener('change', event => {
    scenario = event.target.value;
    home.innerHTML = homeMarkup();
    goHome();
  });
  window.addEventListener('popstate', onRoute);
  window.addEventListener('hashchange', onRoute);
  if (!location.hash.startsWith('#p02/')) history.replaceState(null, '', '#home');
  showRoute(parseRoute(location.hash));
  if(draftRestoreFailed)homeFeedback.show({title:'Chưa phục hồi đủ phiếu nháp',message:'Bản giữ lại vẫn còn trong dữ liệu của tài khoản này. Chưa thể mở đầy đủ phiếu; cần đối chiếu trước khi tạo phiếu thay thế hoặc đăng xuất từ Tổng kết ca.'});
  return {
    dispose() { disposed = true; system.dispose(); shift.dispose();clearTimeout(dateRefreshTimer); document.removeEventListener('visibilitychange',syncDateRefresh); notifications.dispose();notificationStore.dispose();homeFeedback.dispose();nameRoute.dispose();closeName();dialogRoute.dispose(); if (nameDialog.open) closeName(); inbound.dispose(); outbound.dispose(); lookup.dispose(); nfc.dispose(); historyView.dispose(); warranty.dispose(); profile.dispose(); security.dispose(); documents.dispose(); attachments.dispose(); componentIssue.dispose(); componentHistory.dispose(); componentResume.dispose(); dialogs.dispose(); sizeObserver.disconnect(); window.removeEventListener('resize', fitPreview); window.removeEventListener('popstate', onRoute); window.removeEventListener('hashchange', onRoute); root.removeEventListener('click', onClick); root.replaceChildren(); },
    enforce() { if(suspended||getState().sessionExpired)return;if(sessionGuard(state())){if(state().session)system.show('forbidden');else logout();} },
    showExpired(){if(system.active&&system.kind==='expired')return;shift.hide();if(dialogs.flow.snapshot().panel)dialogs.flow.cancel('back');homeFeedback.clear();system.hide({restore:false});system.show('expired',{history:false});},
    suspend(){suspended=true;shift.hide();},
    resume(){suspended=false;shift.resumeSession();system.hide({restore:false});history.replaceState(null,'',currentHash);showRoute(parseRoute(currentHash));},
    snapshot() { return { scenario, homeScroll, navigation: structuredClone(lastNavigation) }; },
  };
}
