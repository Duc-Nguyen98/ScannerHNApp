import {shiftPresentation,summaryRecords,pendingMessage,sourceUncertain} from './presentation.mjs';
import {createRecordDialog} from './record-dialog.mjs';
import {INBOUND_ICONS} from '../inbound/icons.mjs';
import {PROFILE_ICONS} from '../profile/icons.mjs';
import {createActionFeedback} from '../shared/action-feedback.mjs';
import {createPreviewAdapter,createWorkflow,allowed} from './model.mjs';
const esc=v=>String(v??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Existing copy geometry from nfc/nfc.mjs; same Lucide source/license.
const RECEIPT_ICONS={copy:'<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'};
const icon=n=>`<svg class="p14-icon" viewBox="0 0 24 24" aria-hidden="true">${RECEIPT_ICONS[n]||INBOUND_ICONS[n]||PROFILE_ICONS[n]||PROFILE_ICONS.document}</svg>`;
const tile=(n,op='documents')=>`<span class="hn-operation-icon" data-hn-operation="${op}" data-size="md">${icon(n)}</span>`;
const btn=(a,text,cls='p14-primary',extra='')=>`<button type="button" class="${cls}" data-p14="${a}" ${extra}>${text}</button>`;
const clock=t=>new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit'}).format(new Date(t));
const day=t=>new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(t));
const receiptTime=t=>{const parts=new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric',hourCycle:'h23'}).formatToParts(new Date(t));const values=Object.fromEntries(parts.map(p=>[p.type,p.value]));return `${values.hour}:${values.minute} · ${values.day}/${values.month}/${values.year}`;};
const notice=(title,copy,tone='info')=>`<aside class="p14-notice ${tone}">${icon(tone==='success'?'check':'info')}<div><strong>${title}</strong><p>${copy}</p></div></aside>`;
const read=(v,label,lines=2)=>`<span data-hn-readable="${label}" data-hn-lines="${lines}">${esc(v)}</span>`;

export function mountRecoveryShift({root,screen,tools,mode,getState=()=>null,getRecords=()=>[],onBack,onHome=onBack,onContinue=()=>{},onSize=()=>{},onSummary=()=>{},seed=()=>{}}){
 let active=false,disposed=false,username='',panel=mode==='recovery'?1:3,renderedHash='';
 const contexts=new Map();
 const adapter=createPreviewAdapter(),flow=createWorkflow({adapter,getState,getRecords});
 const review=document.createElement('section');review.className='p14-tools';review.hidden=true;
 review.innerHTML=`<details><summary>P14 · Kịch bản kiểm chứng</summary><p>PROTOTYPE r04 · B14. Chỉ mô phỏng trong bộ nhớ trang; không gửi yêu cầu thật. Kênh khôi phục, policy lưu nháp/kết thúc ca và aggregate backend còn chờ chốt. Không bàn giao quyền sở hữu nháp. Reload đặt lại fixture.</p><p>KPI B14: 12 nhập + 6 xuất + 4 bảo hành + 3 NFC + 5 lượt xem chứng từ = 30 sự kiện tách biệt. Không tính từ danh sách client. Phiếu dở dùng cùng nguồn P04/P05/P03; số phiếu giữ đúng nguồn, không đổi thành PN-0001 chỉ để khớp ảnh.</p><label>Kết quả adapter <select data-p14-scenario><option value="ready">Xác nhận fixture</option><option value="error">Thất bại</option><option value="unknown">UNKNOWN chưa đối chiếu</option><option value="timeout-recorded">Timeout, nguồn đã ghi nhận</option><option value="blocked">Chưa có kết nối production</option></select></label></details>`;
 tools.append(review);
 const feedback=createActionFeedback({getScreen:()=>screen,tools,isActive:()=>active&&!disposed,key:'hnP14'+mode});
 const recordsDialog=createRecordDialog({screen,tools,isActive:()=>active&&!disposed,onChoose:resumeRecord});
 function remember(){const app=root.querySelector('.p14-app');if(!active||!app)return;const focus=document.activeElement;contexts.set(panel,{top:app.querySelector('.p14-scroll').scrollTop,action:root.contains(focus)?focus.dataset.p14:null,id:root.contains(focus)?focus.dataset.document:null});}
 function restore(focus){const c=contexts.get(panel),app=root.querySelector('.p14-app'),scroll=app.querySelector('.p14-scroll');
  const apply=()=>{if(!active||disposed||!app.isConnected)return;if(c)scroll.scrollTop=c.top;const target=c?.id?app.querySelector(`[data-document="${CSS.escape(c.id)}"]`):c?.action?app.querySelector(`[data-p14="${CSS.escape(c.action)}"]`):null;if(focus&&!screen.querySelector('.app-modal-host'))(target&&!target.disabled?target:app.querySelector('h1')).focus({preventScroll:true});};apply();
  // The shared reader clamps after render. Restore after its measurement too,
  // only while this render is still connected to the active session.
  if(c)requestAnimationFrame(()=>requestAnimationFrame(apply));
 }
 const info=(title,message)=>feedback.show({title,message,confirmLabel:'Đóng'});
 function status(r,s=flow.snapshot()){return sourceUncertain(r)?'Cần đối chiếu':s.unsaved.some(x=>x.document.documentId===r.document.documentId)?'Đang mở':'Đã lưu nháp';}
 function row(r){return `<article class="p14-record-group" data-hn-readable-group>${btn('continue',`${tile(r.operation==='outbound'?'up':'document',r.operation)}<span><strong data-hn-readable="Mã phiếu" data-hn-lines="2" data-hn-read-outside="true">${esc(r.document.number||r.document.documentId)}</strong><small>${r.operation==='outbound'?'Xuất kho':r.operation==='inbound'?'Nhập kho':'Phiếu đang làm'} · ${status(r)}</small></span><span class="p14-row-action">Tiếp tục ${icon('chevron')}</span>`,'p14-record',`data-document="${esc(r.document.documentId)}" ${flow.snapshot().busy||flow.snapshot().pending?'disabled':''}`)}</article>`;}
 function form(s){return `<section class="p14-recovery-card"><div class="p14-hero"><span class="p14-avatar">${icon('user')}</span><h2>Khôi phục tài khoản</h2><p>Nhập tên đăng nhập để gửi yêu cầu hỗ trợ khôi phục quyền truy cập hệ thống.</p></div><form id="p14-recovery-form" data-p14-form novalidate><label for="p14-username">Tên đăng nhập</label><div class="p14-input">${icon('user')}<input id="p14-username" value="${esc(username)}" placeholder="Nhập tên đăng nhập của bạn" autocomplete="username" autocapitalize="none" spellcheck="false" aria-describedby="p14-error" ${s.busy||s.pending?'disabled':''}></div><p class="p14-error" id="p14-error" hidden>Vui lòng nhập tên đăng nhập.</p>${notice('Hỗ trợ truy cập','Liên hệ quản trị viên để xác minh và cấp lại quyền truy cập.')}</form></section>`;}
 function receipt(s){const r=s.recovery;return `<section class="p14-recovery-card"><div class="p14-hero"><span class="p14-avatar success">${icon('check')}</span><h2>Yêu cầu đã tiếp nhận</h2><p>Yêu cầu hỗ trợ khôi phục quyền truy cập đã được ghi nhận.</p></div>${notice('Chờ quản trị viên xác minh','Quyền truy cập chỉ được cấp lại sau khi thông tin được xác minh.','warning')}<dl class="p14-metadata p14-receipt-metadata"><div>${tile('user')}<dt>Tên đăng nhập</dt><dd class="p14-meta-value">${read(r.request.username,'Tên đăng nhập')}</dd></div><div>${tile('calendar')}<dt>Thời gian gửi yêu cầu</dt><dd class="p14-meta-value"><time datetime="${esc(r.time)}" title="Giờ Việt Nam (UTC+7)">${receiptTime(r.time)}</time></dd></div><div>${tile('document')}<dt>Mã yêu cầu</dt><dd class="p14-meta-value">${read(r.id,'Mã yêu cầu')}</dd><dd class="p14-meta-action">${btn('copy',icon('copy'),'p14-copy','aria-label="Sao chép mã yêu cầu" title="Sao chép mã yêu cầu"')}</dd></div></dl></section>`;}
 function end(s){const p=shiftPresentation(s,getState());return `${notice(p.title,p.message,p.tone).replace('<aside ','<aside id="p14-shift-status" ')}<section class="p14-card"><div class="p14-section-title"><h2>Phiếu đang thực hiện (${s.records.length})</h2>${btn('all','Xem tất cả','p14-link',s.busy?'disabled':'')}</div>${s.records.length?s.records.map(row).join(''):'<p>Không có phiếu đang mở trong nguồn hiện tại.</p>'}</section>`;}
 function dock(s){if(panel===1)return s.pending?btn('check',s.busy?'Đang đối chiếu…':'Đối chiếu kết quả','p14-primary',s.busy?'disabled':''):`<button class="p14-primary" type="submit" form="p14-recovery-form" ${s.busy?'disabled':''}>${s.busy?'Đang gửi yêu cầu…':'Gửi yêu cầu hỗ trợ'}</button>`;
 if(panel===2)return btn('login','Về Đăng nhập');if(panel===4)return btn('home','Về Trang chủ');
 const p=shiftPresentation(s,getState());let first='';
 if(p.key==='busy'&&s.processing!=='end')first=btn('busy',p.title+'…','p14-primary','disabled');
 else if(p.action==='save')first=btn('save','Lưu nháp trước khi kết thúc');
 else if(p.action==='check')first=btn('check','Đối chiếu kết quả');
 const ready=p.key==='ready',label=s.busy&&s.processing==='end'?'Đang kết thúc ca…':icon('power')+' Kết thúc ca';
 return `<div class="p14-shift-actions" role="group" aria-label="Thao tác kết thúc ca">${first}${btn('end',label,ready?'p14-primary':'p14-secondary',`aria-describedby="p14-shift-status" ${ready?'':'disabled'}`)}</div>`;
 }
 function shiftMetadata(r){const identity=r.request.shift,start=identity.startedAt,overnight=!!start&&day(start)!==day(r.time),wide=overnight||!start;
 const range=overnight?`${receiptTime(start)} – ${receiptTime(r.time)}`:`${start?clock(start):'Chưa xác minh'} – ${clock(r.time)}`;
 return `<dl class="p14-shift-meta"><div class="p14-shift-warehouse">${tile('lock')}<dt>Kho làm việc</dt><dd>${read(identity.warehouse.name,'Kho làm việc')}</dd></div><div class="p14-shift-date ${wide?'p14-meta-wide':''}">${tile('calendar')}<dt>Ngày làm việc</dt><dd>${overnight?`${esc(day(start))} – `:''}${esc(day(r.time))}</dd></div><div class="p14-shift-time ${wide?'p14-meta-wide':''}">${tile('clock')}<dt>Thời gian ca</dt><dd>${esc(range)}</dd></div></dl>`;
 }
 function summary(s){const r=s.summary,identity=r.request.shift,a=r.aggregate;return `<div class="p14-identity">${tile('user')}<div><strong>${read(identity.actor.name,'Họ tên')}</strong><p>${read(identity.actor.role,'Vai trò')}</p></div></div>${shiftMetadata(r)}<h2 class="p14-label">Kết quả công việc</h2><div class="p14-kpis">${[['inbound','Nhập kho','box'],['outbound','Xuất kho','up'],['warranty','Bảo hành','tool'],['nfc','Thẻ NFC','nfc'],['total','Tổng lượt hoạt động','document']].map(([key,label,i])=>`<div class="p14-kpi ${key==='total'?'wide':''}">${tile(i,key==='total'?'documents':key)}<div><strong>${a[key]}</strong><p>${label}</p>${key==='total'?`<small>Chứng từ: ${a.documents} lượt</small>`:''}</div></div>`).join('')}</div><div class="p14-section-title"><h2>Phiếu nháp</h2>${btn('drafts','Xem chi tiết','p14-link')}</div>${btn('drafts',`${tile('document')}<span><strong>${r.request.records.length}</strong><span class="p14-draft-caption">Phiếu nháp khi kết thúc ca</span></span>${icon('chevron')}`,'p14-card p14-drafts','aria-label="Xem phiếu nháp khi kết thúc ca"')}`;}
 function render(focus=false){if(!active||disposed)return;remember();const s=flow.snapshot();panel=mode==='recovery'?(s.recovery?2:1):(s.summary?4:3);screen.classList.toggle('p14-summary',panel===4);
 const title=['','Khôi phục tài khoản','Yêu cầu đã tiếp nhận','Kết thúc ca','Tổng kết ca'][panel];
 root.innerHTML=`<section class="p14-app" data-panel="P14.S0${panel}" aria-busy="${s.busy}" data-shift-state="${mode==='shift'?shiftPresentation(s,getState()).key:''}"><header class="p14-header">${btn('back',icon('back'),'p14-back','aria-label="Quay lại"')}<div><h1 tabindex="-1">${title}</h1><p>Kho Hoa Nam</p></div></header><div class="p14-body"><div class="p14-scroll" tabindex="0" aria-label="Nội dung ${title}">${panel===1?form(s):panel===2?receipt(s):panel===3?end(s):summary(s)}${panel===1&&s.pending?`<section class="p14-pending">${notice('Cần đối chiếu kết quả',pendingMessage('recovery'))}</section>`:''}</div>${dock(s)?`<footer class="p14-actions">${dock(s)}</footer>`:''}</div></section>`;
 document.title='P14 · '+title;renderedHash=location.hash;restore(focus);onSize();}
 async function run(action){const promise=action==='check'?flow.check():flow.run(action,username);render();const result=await promise;if(!active||disposed)return;render(true);
 if(result.kind==='verified'){
  if(result.request.action==='save')feedback.show({title:'Đã lưu nháp',message:'Phiếu được giữ nguyên định danh, phiên quét, phiên bản và nội dung để tiếp tục xử lý.',confirmLabel:'Đã hiểu',tone:'success'});
  if(result.request.action==='end')onSummary(result);
 }else if(result.kind==='unknown')feedback.show({title:'Chưa xác định kết quả',message:pendingMessage(flow.snapshot().pending?.action),cancelLabel:'Để sau',confirmLabel:'Đối chiếu',onConfirm:()=>run('check')});
 else if(result.kind==='blocked')info('Chưa có kết nối','Chưa có cơ chế được xác nhận để thực hiện thao tác này. Chưa gửi yêu cầu đến hệ thống.');
 else if(result.kind==='failed')info('Chưa hoàn tất thao tác','Yêu cầu chưa được ghi nhận. Dữ liệu đang nhập và phiếu dở vẫn được giữ.');
 else if(result.kind==='source-unknown')info('Phiếu cần đối chiếu','Kết quả thao tác trên phiếu chưa rõ. Tiếp tục đúng phiếu để đối chiếu tại màn nghiệp vụ trước khi lưu nháp hoặc kết thúc ca.');
 }
 function confirm(action){feedback.show({title:action==='save'?'Lưu nháp các phiếu đang mở?':'Kết thúc ca làm việc?',message:action==='save'?'Giữ nguyên nội dung và định danh phiếu để tiếp tục xử lý. Thao tác này không gửi phiếu lên Web hoặc thay đổi tồn kho.':'Các phiếu nháp vẫn được giữ. Kết thúc ca không đăng xuất và không tự bàn giao phiếu cho người khác.',cancelLabel:'Hủy',confirmLabel:action==='save'?'Lưu nháp':'Kết thúc ca',onConfirm:()=>run(action)});}
 function showRecords(){const s=flow.snapshot();recordsDialog.show(summaryRecords(s).map(r=>({...r,displayStatus:status(r,s)})),{summary:!!s.summary,readOnly:!!s.pending||s.busy});}
 function resumeRecord(selected){const s=flow.snapshot();if(s.busy||s.pending)return;const r=s.records.find(r=>r.document.documentId===selected.document.documentId);const keys=['actorId','warehouseId','documentId','scanSessionId','version'];if(!r||!keys.every(k=>r.document[k]===selected.document[k])){info('Chưa thể tiếp tục phiếu','Phiếu hoặc phiên bản đã thay đổi. Giữ nguyên dữ liệu và kiểm tra lại nguồn hiện tại.');return;}remember();onContinue(r);}
 function click(e){if(!active||disposed||!root.contains(e.target)||screen.querySelector('.app-modal-host'))return;const b=e.target.closest('[data-p14]');if(!b||b.disabled)return;const a=b.dataset.p14,s=flow.snapshot();
  if(a==='back'||a==='login')onBack();else if(a==='home')onHome();
  else if(a==='save'||a==='end')confirm(a);else if(a==='check')void run('check');
  else if(a==='continue'||a==='continue-first'){if(a==='continue-first'&&s.records.length>1){showRecords();return;}const r=s.records.find(x=>x.document.documentId===b.dataset.document)||s.records[0];if(r)resumeRecord(r);}
  else if(a==='all'||a==='drafts')showRecords();
  else if(a==='copy'){const id=s.recovery?.id;if(id)Promise.resolve().then(()=>navigator.clipboard.writeText(id)).then(()=>{if(active)feedback.show({title:'Đã sao chép',message:'Mã yêu cầu đã được sao chép.',confirmLabel:'Đã hiểu',tone:'success'});}).catch(()=>{if(active)info('Chưa sao chép được','Mã yêu cầu: '+id);});}
 }
 function submit(e){if(!active||!e.target.matches('[data-p14-form]'))return;e.preventDefault();username=root.querySelector('input').value;if(!username.trim()){root.querySelector('#p14-error').hidden=false;root.querySelector('input').setAttribute('aria-invalid','true');root.querySelector('input').focus();return;}void run('recovery');}
 const input=e=>{if(e.target.id==='p14-username'){username=e.target.value;e.target.removeAttribute('aria-invalid');root.querySelector('#p14-error').hidden=true;}};
 root.addEventListener('click',click);root.addEventListener('submit',submit);root.addEventListener('input',input);
 review.querySelector('select').onchange=e=>adapter.setScenario(e.target.value);
 return {flow,show(){if(active&&renderedHash===location.hash&&root.querySelector('.p14-app'))return;active=true;review.hidden=false;if(mode==='shift')seed();render(true);},hide(){remember();active=false;review.hidden=true;feedback.clear();recordsDialog.clear();screen.classList.remove('p14-summary');},dispose(){disposed=true;active=false;flow.dispose();feedback.dispose();recordsDialog.dispose();contexts.clear();review.remove();root.removeEventListener('click',click);root.removeEventListener('submit',submit);root.removeEventListener('input',input);}};
}
