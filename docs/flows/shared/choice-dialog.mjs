import {openAppModal} from './app-modal.mjs';
import {choiceOptions,escapeChoice} from './choice-options.mjs';
export function openChoiceDialog({screen,tools,title,options,value,onApply,onClose,className='',searchLabel='Tìm lựa chọn',searchPlaceholder='Nhập tên hoặc mã',initialFocus='input:checked',commitOnChange=false,dismissOnBackdrop=false,fixedSearch=false,selectionSummary=false,recentIds=[],prioritizeSelected=false,resultLabel=''}){
 const dialog=document.createElement('dialog');dialog.className='p08-dialog p08-picker'+(className?' '+className:'');
 dialog.setAttribute('aria-labelledby','choice-title');let draft=value;
 const priority=[...(prioritizeSelected?[value]:[]),...recentIds].filter((id,i,ids)=>options.some(o=>o.id===id)&&ids.indexOf(id)===i);
 const ordered=prioritizeSelected||recentIds.length?[...priority.map(id=>options.find(o=>o.id===id)),...options.filter(o=>!priority.includes(o.id))]:options;
 const search=options.length>6?'<label class="p08-choice-search">Tìm kiếm<input type="search" aria-label="'+escapeChoice(searchLabel)+'" placeholder="'+escapeChoice(searchPlaceholder)+'"></label>':'';
 dialog.innerHTML='<form><header><h2 id="choice-title">'+escapeChoice(title)+'</h2><button type="button" data-cancel aria-label="Đóng">×</button></header>'+(fixedSearch&&search?'<div class="hn-choice-search-dock">'+search+'</div>':'')+'<div class="app-modal-body">'+(!fixedSearch?search:'')+choiceOptions('choice',ordered.map(o=>[o.id,o.name]),value)+'<p data-empty role="status" hidden>Không có lựa chọn phù hợp.</p></div><footer><button type="button" data-cancel>Hủy</button><button type="submit">Áp dụng</button></footer></form>';
 let resultCount=null;
 if(resultLabel){resultCount=document.createElement('p');resultCount.className='hn-choice-count';resultCount.setAttribute('role','status');resultCount.textContent=options.length+' '+resultLabel;const dock=dialog.querySelector('.hn-choice-search-dock');if(dock)dock.append(resultCount);else dialog.querySelector('.app-modal-body').prepend(resultCount);}
 for(const label of dialog.querySelectorAll('.p08-options label')){const id=label.querySelector('input').value;if(prioritizeSelected&&id===value||recentIds.includes(id)){const tag=document.createElement('small');tag.className='hn-choice-priority';tag.textContent=id===value?'Hiện tại':'Gần đây';label.append(tag);}}
 const submit=dialog.querySelector('[type=submit]');submit.disabled=!options.some(o=>o.id===draft);
 let selectedSummary=null;
 if(selectionSummary){selectedSummary=document.createElement('p');selectedSummary.className='hn-choice-selection';selectedSummary.setAttribute('aria-live','polite');dialog.querySelector('footer').prepend(selectedSummary);}
 function summarize(){if(!selectedSummary)return;const name=options.find(o=>o.id===draft)?.name;selectedSummary.textContent=name?'Đang chọn: '+name:'Chưa chọn';selectedSummary.title=name||'';}
 summarize();
 if(commitOnChange){submit.remove();dialog.querySelector('footer [data-cancel]').textContent='Đóng';}
 const handle=openAppModal({screen,tools,dialog,initialFocus,onClose,dismissOnBackdrop});
 let committed=false;
 function commitChoice(){if(committed||!options.some(o=>o.id===draft))return;committed=true;handle.close();onApply(draft);}
 dialog.addEventListener('change',e=>{if(e.target.name==='choice'){draft=e.target.value;submit.disabled=!options.some(o=>o.id===draft);summarize();if(commitOnChange&&!submit.disabled)commitChoice();}});
 dialog.addEventListener('click',e=>{if(e.target.closest('[data-cancel]'))handle.close();else if(commitOnChange){const radio=e.target.closest('.p08-options label')?.querySelector('input');if(radio?.checked){draft=radio.value;commitChoice();}}});
 dialog.addEventListener('input',e=>{if(e.target.type!=='search')return;const fold=s=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/đ/gi,'d').toLowerCase();let visible=0;for(const label of dialog.querySelectorAll('.p08-options label')){const option=options.find(o=>o.id===label.querySelector('input').value);label.hidden=!fold((option?.name||'')+' '+(option?.code||'')).includes(fold(e.target.value.trim()));if(!label.hidden)visible++;}dialog.querySelector('[data-empty]').hidden=visible>0;if(resultCount)resultCount.textContent=visible+' '+resultLabel;});
 dialog.addEventListener('submit',e=>{e.preventDefault();commitChoice();});
 // Enter in a search field is not consent to Apply a possibly hidden draft.
 dialog.addEventListener('keydown',e=>{
  if(e.key!=='Enter'||e.isComposing)return;
  if(e.target.type==='search'){e.preventDefault();dialog.querySelector('.p08-options label:not([hidden]) input')?.focus();}
  else if(e.target.name==='choice'){e.preventDefault();e.target.click();}
 });
 return handle;
}
