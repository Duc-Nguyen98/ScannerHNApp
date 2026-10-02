import {verificationText} from './experience.mjs';
import {DIALOG_ICONS} from '../scanner-dialogs/icons.mjs';
import {INBOUND_ICONS} from '../inbound/icons.mjs';
import {HOME_ICONS} from '../home/icons.mjs';
const esc=v=>String(v??'Chưa xác định').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Info geometry is the existing P04/auth-session icon.
const icons={...HOME_ICONS,...DIALOG_ICONS,...INBOUND_ICONS,info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>'};
const icon=n=>`<svg class="p17-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[n]||icons.document}</svg>`;
const value=(label,v)=>`<div class="p17-row"><dt>${label}</dt><dd><span data-hn-readable="${label}" data-hn-readable-kind="value">${esc(v)}</span></dd></div>`;
const card=(label,glyph,operation,rows)=>`<section class="p17-card"><h2><span class="hn-operation-icon" data-hn-operation="${operation}" data-size="sm">${icon(glyph)}</span>${label}</h2><dl>${rows}</dl></section>`;
const notice=(title,message)=>`<section class="p17-warning"><span class="p17-warning-symbol" aria-hidden="true">!</span><div><h2>${title}</h2><p>${message}</p></div></section>`;
const info=message=>`<aside class="p17-info">${icon('info')}<p>${message}</p></aside>`;

// Presentation only. Actions belong to the mounted P04/P05/P07 owner.
export function renderScanException({root,owner,state,exception=state.exception,tag=null,canCheck=true,cameraReady=false,onSize=()=>{}}){
 const panel=state.unknown?'P17.S04':exception?.panel||'P17.S03',d=state.document||{};
 const previous=root.querySelector('.p17-app')?.dataset.panel,scroll=root.querySelector('.p17-scroll')?.scrollTop||0;
 const hadFocus=root.contains(document.activeElement),focus=document.activeElement?.getAttribute(`data-${owner}`),identityOpen=root.querySelector('.p17-identity')?.open;
 const button=(action,label,secondary=false,disabled=false)=>`<button type="button" class="p17-button ${secondary?'p17-secondary':'p17-primary'}" data-${owner}="${action}" ${disabled?'disabled':''}>${label}</button>`;
 const context=state.document?`<aside class="p17-context" aria-label="Phiếu đang làm"><span class="hn-operation-icon" data-hn-operation="${owner==='p05'?'outbound':'inbound'}" data-size="sm">${icon('document')}</span><div><strong data-hn-readable="Phiếu đang làm" data-hn-readable-kind="value">${esc(d.number)}</strong><span>${Array.isArray(state.accepted)?`Đã giữ ${state.accepted.length} mã hợp lệ`:'Số mã hợp lệ chưa xác định'}</span></div></aside>`:'';
 let title,body,footer;
 if(panel==='P17.S01'){
  title='Quét mã sản phẩm';
  body=`<div class="p17-camera" role="img" aria-label="Ảnh kho minh họa, camera chưa kết nối"><div class="p17-reticle"></div><span>Camera chưa kết nối</span></div>${notice('Mã không hợp lệ','Không thể xử lý mã này. Vui lòng kiểm tra và thử lại.')}<section class="p17-card p17-reason"><h2>Thông tin kiểm tra</h2><dl>${value('Mã đã đọc',exception.raw)}</dl><p data-hn-readable="Lý do kiểm tra mã" data-hn-lines="3">${esc(exception.reason)}</p></section>${info('Mã lỗi không được cộng vào số lượng của phiếu.')}`;
  footer=cameraReady?button('exception-back',`${icon('scan')} Quét lại`)+button('exception-manual',`${icon('keyboard')} Nhập mã`,true):button('exception-manual',`${icon('keyboard')} Nhập mã`)+button('exception-back','Về danh sách mã',true);
 }else if(panel==='P17.S02'){
  title='Kiểm tra mã xuất kho';
  const e=exception,p=e.product,r=e.relatedDocument;
  // An unrestricted reason may itself contain a related document number.
  // Retain source evidence in the owner, but do not expose it outside read scope.
  const reason=r&&r.readable!==true?'Chi tiết nguyên nhân liên quan đến phiếu chưa được cấp quyền xem.':e.reason;
  body=notice('Mã không thể xuất','Sản phẩm này không thể xuất kho. Vui lòng kiểm tra thông tin bên dưới.')+`<section class="p17-reason"><h2>Nguyên nhân</h2><p data-hn-readable="Nguyên nhân không thể xuất" data-hn-lines="3">${esc(reason)}</p></section>`+card('Thông tin sản phẩm','box','outbound',value('Mã đã đọc',e.raw)+value('Mã sản phẩm',p?.code)+value('Tên sản phẩm',p?.name)+value('SKU',p?.sku)+value('Đơn vị tính',p?.unit))+(r?.readable===true?card('Phiếu liên quan','document','documents',value('Số phiếu',r.number)+value('Loại phiếu',r.type)+value('Trạng thái',r.status)+value('Ngày tạo',r.createdAt)):info('Thông tin phiếu liên quan chưa được cấp quyền xem.'))+info('Vui lòng quét mã khác để tiếp tục xuất kho. Các mã hợp lệ và phiếu đang soạn được giữ nguyên.');
  footer=button('exception-back',`${icon('scan')} Quét mã khác`);
 }else if(panel==='P17.S03'){
  title='Đọc thẻ NFC';
  body=notice('Thẻ đã liên kết','Thẻ NFC này đã được liên kết với sản phẩm khác trong hệ thống.')+card('Thông tin thẻ NFC','nfc','nfc',value('UID thẻ',tag?.uid||state.read?.uid)+value('Trạng thái',tag?.status==='linked'?'Đã liên kết':'Chưa xác minh'))+card('Sản phẩm đã liên kết','box','documents',value('Mã sản phẩm',tag?.product?.code)+value('Tên sản phẩm',tag?.product?.name)+value('SKU',tag?.product?.sku)+value('Serial',tag?.product?.serial))+`<aside class="p17-warning p17-small"><span class="p17-warning-symbol" aria-hidden="true">!</span><p>Không thể tự động ghi đè liên kết. Vui lòng kiểm tra và xử lý theo quyền quản trị liên kết.</p></aside>`;
  footer=button('exception-detail',`${icon('document')} Xem liên kết`,false,!tag)+button('exception-cancel','Hủy',true);
 }else{
  title=owner==='p05'?'Gửi phiếu xuất kho':'Gửi phiếu nhập kho';
  body=`<section class="p17-verifying"><span class="p17-clock">${icon('clock')}</span><h2>${verificationText(state,canCheck)}</h2><p>${state.busy?'Hệ thống đang kiểm tra trạng thái tạo phiếu. Vui lòng chờ.':!canCheck?'Mở thông tin yêu cầu để đối chiếu với người phụ trách Web.':'Chưa xác định phiếu đã được ghi nhận. Kiểm tra trạng thái trước khi gửi lại.'}</p></section>`+card('Thông tin phiếu','document',owner==='p05'?'outbound':'inbound',value('Số phiếu',d.number)+value('Loại phiếu',owner==='p05'?'Xuất kho':'Nhập kho')+value('Ngày gửi',state.sentAt)+value('Người gửi',d.actorName))+info('Không gửi lại để tránh tạo trùng phiếu. Mã hợp lệ và định danh của lần gửi được giữ nguyên.')+(!canCheck?`<section class="p17-warning p17-small"><p>Chưa có nguồn tra trạng thái khả dụng. Cần đối chiếu với người phụ trách Web bằng thông tin yêu cầu bên dưới; chưa thể gửi lại.</p></section>`:'')+`<details id="${owner}-reconciliation" class="p17-identity" ${identityOpen?'open':''}><summary data-${owner}="identity">Thông tin đối chiếu</summary><dl>${value('Request ID',state.request?.requestId)}${value('ID phiếu',d.documentId)}${value('Phiên quét',d.scanSessionId)}${value('Version',d.version)}</dl>${button('copy-reconciliation','Sao chép thông tin yêu cầu',true)}</details>`;
  footer=(canCheck?button('check',`${state.busy?'<span class="p17-status-spinner" data-hn-motion-consumer="UnknownState" data-running="false" aria-hidden="true"></span>':icon('clock')} ${state.busy?'Đang kiểm tra…':'Kiểm tra trạng thái'}`):button('review-reconciliation',`${icon('info')} Thông tin đối chiếu`))+button('send','Gửi lại',true,true)+`<p class="p17-footer-hint">Chỉ gửi lại khi nguồn xác nhận chưa tạo phiếu và cho phép dùng cùng yêu cầu.</p>`;
 }
 root.innerHTML=`<section class="${owner}-app p17-app" data-panel="${panel}" aria-busy="${!!state.busy}"><header class="p17-header">${button(panel==='P17.S03'?'exception-cancel':panel==='P17.S04'?'home':'exception-return',icon('back'),true)}<h1 tabindex="-1">${title}</h1></header><div class="p17-sheet">${context}<div class="p17-scroll" role="region" aria-label="Nội dung ngoại lệ quét" tabindex="0">${body}</div><footer class="p17-footer">${footer}</footer></div></section>`;
 root.querySelector('.p17-header button').setAttribute('aria-label',panel==='P17.S04'?'Về Trang chủ, giữ phiếu để đối chiếu':'Quay lại');
 root.querySelector('.p17-scroll').scrollTop=previous===panel?scroll:0;
 const target=previous===panel&&focus?[...root.querySelectorAll(`[data-${owner}]`)].find(b=>b.getAttribute(`data-${owner}`)===focus&&!b.disabled):null;
 if(target)target.focus({preventScroll:true});else if(previous!==panel||hadFocus)root.querySelector('h1').focus({preventScroll:true});
 const check=root.querySelector(`[data-${owner}=check]`);if(check){check.setAttribute('aria-disabled',String(state.busy||!canCheck));check.setAttribute('aria-busy',String(!!state.busy));}
 const review=root.querySelector(`[data-${owner}=review-reconciliation]`);if(review)review.setAttribute('aria-controls',`${owner}-reconciliation`);
 onSize();
}
