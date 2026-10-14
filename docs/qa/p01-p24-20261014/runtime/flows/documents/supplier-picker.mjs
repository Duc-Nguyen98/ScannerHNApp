import {openAppModal} from '../shared/app-modal.mjs';
import {choiceOptions,escapeChoice as esc} from '../shared/choice-options.mjs';
// Opt-in server-query picker. Same modal/focus owner and r10 keyboard semantics.
export function openPreparedSupplierPicker({client,screen,tools,value,onApply,onClose}){
 const d=document.createElement('dialog');d.className='p08-dialog p08-picker p12-supplier-picker';d.setAttribute('aria-labelledby','p12-live-supplier-title');
 d.innerHTML='<form><header><h2 id="p12-live-supplier-title">Nhà cung cấp</h2><button type="button" data-cancel aria-label="Đóng">×</button></header><div class="hn-choice-search-dock"><label class="p08-choice-search">Tìm kiếm<input type="search" aria-label="Tìm nhà cung cấp" placeholder="Nhập tên nhà cung cấp"></label><p class="hn-choice-count" role="status"></p></div><div class="app-modal-body"><div data-options></div><button type="button" data-more hidden>Tải thêm</button><p data-error role="alert"></p></div><footer><p class="hn-choice-selection"></p><button type="button" data-cancel>Hủy</button><button type="submit">Áp dụng</button></footer></form>';
 let draft=value,rows=[],page=1,total=null,lastPage=1,epoch=0,controller=null,timer=null,closed=false,composing=false;
 const input=d.querySelector('input'),submit=d.querySelector('[type=submit]'),more=d.querySelector('[data-more]');
 const selection=()=>{submit.disabled=!draft;d.querySelector('.hn-choice-selection').textContent=draft?'Đang chọn: '+draft.name:'Chưa chọn';};selection();
 function paint(){d.querySelector('[data-options]').innerHTML=choiceOptions('choice',rows.map(r=>[r.id,r.name]),draft?.id);d.querySelector('.hn-choice-count').textContent=total===null?'Chưa xác định số kết quả':`${rows.length} đã tải / ${total} nhà cung cấp`;more.hidden=page>=lastPage;selection();}
 async function load(append=false){clearTimeout(timer);controller?.abort();controller=new AbortController();const id=++epoch,search=input.value,next=append?page+1:1;submit.disabled=true;more.disabled=true;d.querySelector('[data-error]').textContent='';d.querySelector('.hn-choice-count').textContent='Đang đọc danh mục…';
  try{const result=await client.suppliers({q:search,status:'ACTIVE',page:next,per_page:20},{signal:controller.signal});if(closed||id!==epoch)return;const map=new Map((append?rows:[]).map(r=>[r.id,r]));for(const row of result.items)map.set(row.id,row);rows=[...map.values()];page=next;total=result.paging.total;lastPage=result.paging.lastPage;paint();}
  catch(error){if(closed||id!==epoch)return;rows=[];total=null;d.querySelector('[data-options]').replaceChildren();d.querySelector('[data-error]').textContent=error.status===403?'Không có quyền đọc nhà cung cấp.':'Chưa đọc được danh mục. Giữ lựa chọn cũ; thử tìm lại.';d.querySelector('.hn-choice-count').textContent='Chưa xác định số kết quả';more.hidden=true;submit.disabled=true;}
  finally{if(!closed&&id===epoch)more.disabled=false;}
 }
 const handle=openAppModal({screen,tools,dialog:d,initialFocus:'input[type=search]',dismissOnBackdrop:false,onClose(){closed=true;epoch++;controller?.abort();clearTimeout(timer);onClose();}});
 d.addEventListener('click',e=>{if(e.target.closest('[data-cancel]'))handle.close();if(e.target.closest('[data-more]')&&!more.disabled)void load(true);});
 d.addEventListener('change',e=>{if(e.target.name==='choice'){draft=rows.find(r=>r.id===e.target.value)||draft;selection();}});
 const search=()=>{controller?.abort();epoch++;clearTimeout(timer);submit.disabled=true;timer=setTimeout(()=>void load(),250);};
 input.addEventListener('compositionstart',()=>{composing=true;controller?.abort();clearTimeout(timer);epoch++;});input.addEventListener('compositionend',()=>{composing=false;search();});input.addEventListener('input',()=>{if(!composing)search();});
 d.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.isComposing||composing)return;if(e.target===input){e.preventDefault();void load().then(()=>{if(!closed)d.querySelector('[data-options] input')?.focus();});}else if(e.target.name==='choice'){e.preventDefault();e.target.click();}});
 d.addEventListener('submit',e=>{e.preventDefault();if(submit.disabled||!draft||closed)return;submit.disabled=true;handle.close();onApply(draft);});
 void load();return handle;
}
