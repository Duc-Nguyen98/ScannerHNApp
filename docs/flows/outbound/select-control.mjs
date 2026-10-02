import {openChoiceDialog} from '../shared/choice-dialog.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fold = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
export function selectMarkup({name,label,glyph,options,value,validation='',hint='',placeholder='Chọn thông tin',disabled=false}) {
 const id=`p05-select-${name}`,selected=options.find(o=>o.id===value);
 return `<div class="p05-field p05-select-field"><span id="${id}-label">${label} <em>*</em></span><button type="button" class="p05-input p05-select-trigger" data-p05-select="${name}" data-value="${esc(value)}" ${disabled?'disabled data-p05-disabled="true"':''} ${validation?`data-p05-validate="${validation}"`:''} aria-haspopup="${['source','recipient','group'].includes(name)?'dialog':'listbox'}" aria-expanded="false" aria-controls="${id}-list" aria-labelledby="${id}-label ${id}-value">${glyph}<strong id="${id}-value">${esc(selected?.name||placeholder)}</strong><svg class="p05-icon p05-select-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="p05-select-popup" hidden>${options.length>10?`<input class="p05-select-search" type="search" placeholder="Tìm nhanh…" aria-label="Tìm ${label}" autocomplete="off">`:''}<div class="p05-select-options" id="${id}-list" role="listbox" aria-labelledby="${id}-label">${options.map(o=>`<button type="button" role="option" tabindex="-1" data-p05-option="${esc(o.id)}" aria-selected="${o.id===value}"><span>${esc(o.name)}</span><span class="p05-option-check" aria-hidden="true">${o.id===value?'✓':''}</span></button>`).join('')}</div><p class="p05-select-empty" role="status" hidden>Không tìm thấy kết quả.</p></div>${hint?`<small class="p05-field-hint">${hint}</small>`:''}</div>`;
}
// Popup stays inside the scaled app, outside the form layout flow.
export function mountSelectControls(root,onSelect,onIdle=()=>{}) {
 let opened=null,popup=null,search='',lastKey=0,observer=null,choice=null,placement=null;
 function openShared(field){const t=trigger(field);if(t.disabled)return;close();const opts=[...field.querySelectorAll('[data-p05-option]')].map(o=>({id:o.dataset.p05Option,name:o.querySelector('span').textContent}));t.setAttribute('aria-expanded','true');choice=openChoiceDialog({screen:root.closest('.hn-screen'),tools:root.closest('#home-app').querySelector('.hn-tools'),title:field.querySelector('[id$="-label"]').textContent.replace('*','').trim(),options:opts,value:t.dataset.value,onClose:()=>{choice=null;t.setAttribute('aria-expanded','false');t.setAttribute('aria-controls',`p05-select-${t.dataset.p05Select}-list`);onIdle();},onApply:value=>onSelect(t.dataset.p05Select,value)});const dialog=root.closest('.hn-screen').querySelector('.app-modal-host dialog');if(dialog){dialog.id=`p05-choice-${t.dataset.p05Select}`;t.setAttribute('aria-controls',dialog.id);}}
 const trigger=f=>f?.querySelector('[data-p05-select]');
 const options=()=>[...(popup?.querySelectorAll('[role="option"]')||[])].filter(o=>!o.hidden);
 function close(restore=false){choice?.close();choice=null;if(!opened)return;const field=opened,panel=popup;opened=null;popup=null;search='';placement=null;observer?.disconnect();observer=null;panel.hidden=true;field.append(panel);trigger(field).setAttribute('aria-expanded','false');if(restore&&trigger(field).isConnected)trigger(field).focus({preventScroll:true});onIdle();}
 function position(){
  if(!opened)return;const app=root.querySelector('.p05-app'),scroll=root.querySelector('.p05-scroll');if(!app||!trigger(opened).isConnected){close();return;}
  const a=app.getBoundingClientRect(),t=trigger(opened).getBoundingClientRect(),b=scroll.getBoundingClientRect(),sx=a.width/app.offsetWidth,sy=a.height/app.offsetHeight;
  if(t.bottom<=b.top||t.top>=b.bottom){close(true);return;}
  const below=(b.bottom-t.bottom)/sy-8,above=(t.top-b.top)/sy-8;
  popup.style.width=`${t.width/sx}px`;
  if(!placement){
    const list=popup.querySelector('[role="listbox"]'),input=popup.querySelector('input');
    const desired=Math.min(300,list.scrollHeight+(input?input.offsetHeight+5:0)+12);
    placement={up:below<desired&&above>below,height:desired};
  }
  // Filtering must not move the search box under the pointer/caret. Only move
  // to the other side if the current anchor/viewport no longer has useful room.
  if((placement.up?above:below)<80&&(placement.up?below:above)>80)placement.up=!placement.up;
  const height=Math.max(40,Math.min(placement.height,placement.up?above:below));
  Object.assign(popup.style,{left:`${(t.left-a.left)/sx}px`,height:`${height}px`,maxHeight:`${height}px`,top:`${placement.up?(t.top-a.top)/sy-height-6:(t.bottom-a.top)/sy+6}px`});
  popup.dataset.side=placement.up?'above':'below';
 }
 function reveal(option){if(!option)return;const list=popup.querySelector('[role="listbox"]'),r=option.getBoundingClientRect(),b=list.getBoundingClientRect(),scale=b.height/list.offsetHeight;if(r.bottom>b.bottom)list.scrollTop+=(r.bottom-b.bottom)/scale;if(r.top<b.top)list.scrollTop-=(b.top-r.top)/scale;}
 function open(field,end=false){if(['source','recipient','group'].includes(trigger(field).dataset.p05Select)){openShared(field);return;}if(trigger(field).disabled)return;close();opened=field;popup=field.querySelector('.p05-select-popup');popup.querySelectorAll('[role="option"]').forEach(o=>o.hidden=false);const input=popup.querySelector('input');if(input)input.value='';popup.querySelector('.p05-select-empty').hidden=true;root.querySelector('.p05-app').append(popup);popup.hidden=false;trigger(field).setAttribute('aria-expanded','true');position();if(!popup)return;const list=options(),selected=list.find(o=>o.getAttribute('aria-selected')==='true'),target=end?list.at(-1):input||selected||list[0];target?.focus({preventScroll:true});if(target?.matches('[role="option"]'))reveal(target);observer=new ResizeObserver(position);observer.observe(root.querySelector('.p05-app'));}
 function click(e){const t=e.target.closest('[data-p05-select]');if(t&&root.contains(t)){const f=t.closest('.p05-select-field');opened===f?close(true):open(f);return;}const option=e.target.closest('[data-p05-option]');if(!option||!popup?.contains(option))return;const t2=trigger(opened),name=t2.dataset.p05Select,value=option.dataset.p05Option;if(t2.disabled){close();return;}close(true);onSelect(name,value);}
 function key(e){const field=e.target.closest('.p05-select-field')||(popup?.contains(e.target)?opened:null);if(!field||e.isComposing)return;if(e.key==='Escape'&&opened){e.preventDefault();e.stopPropagation();close(true);return;}if(e.key==='Tab'){close(true);return;}
  if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)&&!(e.target.matches('.p05-select-search')&&['Home','End'].includes(e.key))){e.preventDefault();if(opened!==field){open(field,e.key==='End'||e.key==='ArrowUp');if(opened===field&&e.key==='Home'){const first=options()[0];first?.focus({preventScroll:true});reveal(first);}return;}const list=options(),index=list.indexOf(document.activeElement);if(!list.length)return;const next=e.key==='Home'?0:e.key==='End'?list.length-1:index<0?(e.key==='ArrowUp'?list.length-1:0):(index+(e.key==='ArrowDown'?1:-1)+list.length)%list.length;list[next]?.focus({preventScroll:true});reveal(list[next]);return;}
  if(e.target.matches('.p05-select-search'))return;
  if(e.key.length===1&&e.key!==' '&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!trigger(field).disabled){e.preventDefault();if(opened!==field)open(field);const now=Date.now();search=now-lastKey>700?e.key:search+e.key;lastKey=now;const match=options().find(o=>fold(o.textContent.trim()).startsWith(fold(search)));match?.focus({preventScroll:true});reveal(match);}
 }
 function input(e){if(!popup?.contains(e.target)||!e.target.matches('.p05-select-search'))return;const q=fold(e.target.value.trim());popup.querySelectorAll('[role="option"]').forEach(o=>o.hidden=!fold(o.textContent).includes(q));popup.querySelector('.p05-select-empty').hidden=options().length>0;position();}
 function outside(e){if(e.type==='focusin'&&e.target.closest('[data-p05-select]'))return;if(opened&&!opened.contains(e.target)&&!popup.contains(e.target))close();}
 function scroll(e){if(opened&&!popup.contains(e.target))position();}
 root.addEventListener('click',click);root.addEventListener('keydown',key);root.addEventListener('input',input);root.addEventListener('scroll',scroll,true);document.addEventListener('click',outside);document.addEventListener('focusin',outside);window.addEventListener('resize',position);
 return {close,isOpen:()=>!!(choice||opened),dispose(){close();root.removeEventListener('click',click);root.removeEventListener('keydown',key);root.removeEventListener('input',input);root.removeEventListener('scroll',scroll,true);document.removeEventListener('click',outside);document.removeEventListener('focusin',outside);window.removeEventListener('resize',position);}};
}
