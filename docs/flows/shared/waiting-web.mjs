// P04 owns first implementation; P24.S03 may reuse this copy/component later.
// Source: confirmed HANDOFF, Quy tắc UI. UI label is not a server enum.
export const WAITING_WEB = Object.freeze({ title: 'Đã gửi phiếu nhập', status: 'Chờ xử lý trên Web', description: 'Phiếu đã gửi, chưa ghi sổ. Tồn kho chỉ cập nhật sau khi ghi sổ thành công trên Web.' });
export function waitingWebMarkup({kind = 'inbound', prefix = 'p04'} = {}) {
  return `<span class="hn-operation-icon" data-hn-operation="${kind}" data-size="lg" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v4M8 21h8"/></svg></span><h2>${kind === 'outbound' ? 'Đã gửi phiếu xuất' : WAITING_WEB.title}</h2><ol class="hn-waiting-steps" aria-label="Trạng thái phiếu"><li><span aria-hidden="true">✓</span><strong>Đã gửi phiếu</strong></li><li aria-current="step"><span aria-hidden="true">2</span><strong>${WAITING_WEB.status}</strong></li></ol><p>Chưa ghi sổ · Chưa đổi tồn.</p>`;
}
const esc=v=>String(v??'Chưa xác minh').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function waitingWebResult({kind='inbound',state}){
 if(!state?.recorded||state.outcome!=='recorded'||state.unknown)return '';
 const d=state.document;
 const rows=[['Mã phiếu',d.number],['Kho',d.warehouseName],['Đã ghi nhận',Array.isArray(state.accepted)?state.accepted.length+' mã':'Chưa xác minh'],['Thời gian gửi',state.sentAt]];
 return `<section class="hn-waiting-web" data-state-panel="P24.S03" data-operation="${kind}"><div class="hn-waiting-hero">${waitingWebMarkup({kind})}</div><dl class="hn-waiting-summary">${rows.map(([label,value])=>`<div><dt>${label}</dt><dd data-hn-readable="${label}" data-hn-lines="2">${esc(value)}</dd></div>`).join('')}</dl><aside class="hn-waiting-note">Tồn kho chỉ cập nhật sau khi phiếu được ghi sổ thành công trên Web.</aside></section>`;
}

// Text-only button label; full document number remains readable in the summary.
export function waitingWebDocumentLabel(number){return `<span class="hn-waiting-document-label">Xem phiếu ${esc(number)}</span>`;}

// Local result navigation memory, shared by P04/P05. No storage or owner writes.
export function canRestoreWaitingResult(saved,state,context){return !!saved&&context?.documentId===saved.id&&state?.document?.documentId===saved.id&&state.recorded===true&&state.outcome==='recorded'&&!state.unknown;}
export function createWaitingResultReturn({root,namespace,getSnapshot,isActive}){
 let saved=null,frame=0,disposed=false;
 return {
  remember(action){const state=getSnapshot();if(disposed||!isActive()||!['document','history'].includes(action)||!state.recorded||state.outcome!=='recorded'||state.unknown)return;saved={id:state.document.documentId,action,top:root.querySelector('.'+namespace+'-scroll')?.scrollTop||0};},
  restore(context){const entry=saved;if(disposed||!canRestoreWaitingResult(entry,getSnapshot(),context))return;const origin=document.activeElement;
   const apply=()=>{if(disposed||!isActive()||!canRestoreWaitingResult(entry,getSnapshot(),context)||root.closest('.hn-screen')?.querySelector('.app-modal-host')||![origin,document.body].includes(document.activeElement))return;root.querySelector('[data-'+namespace+'="'+entry.action+'"]')?.focus({preventScroll:true});const scroll=root.querySelector('.'+namespace+'-scroll');if(scroll)scroll.scrollTop=entry.top;};
   cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(apply);});
  },
  dispose(){disposed=true;cancelAnimationFrame(frame);saved=null;}
 };
}
