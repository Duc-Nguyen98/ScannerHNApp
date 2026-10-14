import {openAppModal} from '../shared/app-modal.mjs';
import {createDialogRoute} from '../shared/dialog-route.mjs';
// Reuses AppShell overlay; no replacement provider, no GET based on DOM IDs.
export function createSourcePicker({root,tools,flow,onSelect}){
  let handle=null,dialog=null,disposed=false,ticket=0;
  const route=createDialogRoute({history,location,key:'hnP05SourcePicker'});
  const onNavigation=e=>{if(route.navigation(()=>handle?.close(),()=>!!handle))e.stopImmediatePropagation();};
  window.addEventListener('popstate',onNavigation,true);window.addEventListener('hashchange',onNavigation,true);
  function close(){handle?.close();}
  function refresh(){if(!dialog?.isConnected)return;const s=flow.snapshot().sources,list=dialog.querySelector('[data-source-list]'),status=dialog.querySelector('[data-source-status]');
    const focused=document.activeElement?.dataset.sourceId,top=list.scrollTop;list.replaceChildren();status.textContent=s.loading?'Đang tải phiếu nguồn…':s.error?s.error.message:s.meta?`${s.meta.total} phiếu · Trang ${s.meta.page}/${s.meta.last_page}`:'Chưa tải nguồn';
    if(!s.loading&&!s.error&&!s.items.length)status.textContent='Không có phiếu nguồn phù hợp.';
    for(const item of s.items){const b=document.createElement('button');b.type='button';b.dataset.sourceId=item.source_document_id;b.className='p05-source-option';b.textContent=`${item.doc_no} · ${item.recipient.name||'Chưa có người nhận'} · ${item.planned_total_qty} sản phẩm`;list.append(b);}
    for(const [action,disabled]of [['prev',s.loading||!s.meta||s.meta.page<=1],['next',s.loading||!s.meta||s.meta.page>=s.meta.last_page]])dialog.querySelector(`[data-source-page="${action}"]`).disabled=disabled;
    dialog.querySelector('[data-source-retry]').hidden=!s.error;list.scrollTop=top;if(focused)list.querySelector(`[data-source-id="${CSS.escape(focused)}"]`)?.focus({preventScroll:true});
  }
  return {open(){if(disposed||handle||root.closest('.hn-screen').querySelector('.app-modal-host'))return;route.begin();dialog=document.createElement('dialog');dialog.className='p07-dialog p05-source-picker';dialog.setAttribute('aria-labelledby','p05-source-title');dialog.innerHTML='<div class="app-modal-heading"><h2 id="p05-source-title">Chọn phiếu nguồn</h2><label>Tìm mã phiếu/người nhận<input data-source-search type="search" maxlength="200" autocomplete="off"></label><button type="button" data-source-search-button>Tìm kiếm</button><p data-source-status role="status"></p></div><div class="app-modal-body" data-source-list></div><footer class="app-modal-footer"><button type="button" data-source-page="prev">Trước</button><button type="button" data-source-page="next">Sau</button><button type="button" data-source-retry hidden>Thử lại</button><button type="button" data-source-close>Đóng</button></footer>';
      const current=flow.snapshot().sources;dialog.querySelector('input').value=current.q||'';handle=openAppModal({screen:root.closest('.hn-screen'),tools,dialog,dismissOnBackdrop:false,initialFocus:'input',onClose(){handle=null;dialog=null;ticket++;route.closed();}});
      const load=(page=1)=>{if(!dialog)return;const q=dialog.querySelector('input').value;void flow.searchSources(q,page);};
      dialog.addEventListener('click',async e=>{if(e.target.closest('[data-source-close]'))close();else if(e.target.closest('[data-source-search-button],[data-source-retry]'))load();else if(e.target.dataset.sourcePage)load((flow.snapshot().sources.meta?.page||1)+(e.target.dataset.sourcePage==='next'?1:-1));else if(e.target.dataset.sourceId){const id=e.target.dataset.sourceId,token=++ticket;close();await route.ready();if(!disposed&&token+1===ticket)onSelect(id);}});
      dialog.addEventListener('keydown',e=>{if(e.target.matches('input')&&e.key==='Enter'&&!e.isComposing){e.preventDefault();load();}});refresh();load(current.meta?.page||1);
    },refresh,close,isOpen:()=>!!handle,dispose(){disposed=true;ticket++;route.dispose();close();window.removeEventListener('popstate',onNavigation,true);window.removeEventListener('hashchange',onNavigation,true);}};
}
