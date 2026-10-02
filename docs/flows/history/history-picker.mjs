import {choiceOptions} from '../shared/choice-options.mjs';
import {queryDateBounds,dateAllowed,clampQueryDate,queryDateLabel,validateQueryRange,resolveQueryRange} from '../shared/query-date-policy.mjs';
import {INBOUND_ICONS} from '../inbound/icons.mjs';
import {openAppModal} from '../shared/app-modal.mjs';
import {DATA,dayLabel} from './history-model.mjs';
import {QUICK_RANGES,quickHistoryRange} from './history-ux.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const SORTS=[['source','Thứ tự ban đầu'],['desc','Mới nhất'],['asc','Cũ nhất']];
export function parseDate(text){
 if(!text.trim())return '';
 const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());if(!m)return null;
 const iso=m[3]+'-'+m[2]+'-'+m[1],d=new Date(iso+'T00:00:00Z');
 return Number(m[3])>=1&&!isNaN(d)&&d.toISOString().slice(0,10)===iso?iso:null;
}
export function monthDays(year,month){
 const first=new Date(Date.UTC(year,month,1));if(year<100)first.setUTCFullYear(year);
 const last=new Date(first);last.setUTCMonth(month+1,0);
 return {offset:(first.getUTCDay()+6)%7,count:last.getUTCDate()};
}
export function moveCalendarDate(value,key,bounds=queryDateBounds()){
 const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[key];
 if(delta===undefined)return value;
 const date=new Date(value+'T00:00:00Z');date.setUTCDate(date.getUTCDate()+delta);
 return clampQueryDate(date.toISOString().slice(0,10),bounds);
}
export function initialPickerDates(filters,day,now=new Date()){
 const today=!filters.from&&!filters.to?queryDateBounds(now).max:'';
 const from=filters.from||today,to=filters.to||today;
 return {from:from?dayLabel(from):'',to:to?dayLabel(to):'',day:dayLabel(day)};
}
export function todayRangeDraft(now=new Date()){
 const today=dayLabel(queryDateBounds(now).max);
 return {from:today,to:today};
}
export function validatePickerDates(dates,mode='filter',bounds=queryDateBounds()){
 const names=mode==='filter'?['from','to']:mode==='day'?['day']:[],values={},errors={};
 for(const name of names){
  values[name]=parseDate(dates[name]||'');
  if(values[name]===null||(name==='day'&&!values[name]))errors[name]='Nhập ngày hợp lệ theo dd/mm/yyyy.';
  else if(values[name]&&!dateAllowed(values[name],bounds))errors[name]='Chọn ngày từ '+queryDateLabel(bounds.min)+' đến '+queryDateLabel(bounds.max)+'.';
 }
 if(mode==='filter'&&!errors.from&&!errors.to&&values.from&&values.to&&values.from>values.to){
  errors.from='Từ ngày không được sau Đến ngày.';
  errors.to='Đến ngày không được trước Từ ngày.';
 }
 return {values,errors};
}
export function selectableDateBounds(field,dates,bounds=queryDateBounds()){
 const from=parseDate(dates.from||''),to=parseDate(dates.to||'');
 return {
  min:field==='to'&&dateAllowed(from,bounds)?from:bounds.min,
  max:field==='from'&&dateAllowed(to,bounds)?to:bounds.max
 };
}
export function openHistoryPicker({screen,tools,mode,filters,day,onApply,onClose,statusOptions=Object.entries(DATA.statuses),scopeLabel=DATA.names[filters.type]||'Tất cả',statusTitle='Trạng thái',allStatusLabel='Tất cả trạng thái',includeDayStatus=false,filterTitle='Bộ lọc lịch sử',sortTitle='Sắp xếp lịch sử',quickRanges=false}){
 const dialog=document.createElement('dialog');dialog.className='p08-dialog p08-picker';
 dialog.setAttribute('aria-labelledby','p08-picker-title');
 if(quickRanges)dialog.classList.add('p08-quick-picker');
 const draft={...filters,day},dates=initialPickerDates(filters,day);
 let view=mode,field='day',cursor=clampQueryDate(day||filters.to),handle,error='',calendarNotice='';
 const touched=new Set();
 const choices=choiceOptions;
 function dateField(name,label){return '<div class="p08-date-entry"><label for="pick-'+name+'">'+label+'</label><div><input id="pick-'+name+'" name="'+name+'" placeholder="dd/mm/yyyy" inputmode="numeric" maxlength="10" aria-describedby="pick-'+name+'-error" value="'+esc(dates[name])+'"><button type="button" data-calendar="'+name+'" aria-label="Chọn '+label.toLowerCase()+' trên lịch">'+'<svg class="p08-icon" viewBox="0 0 24 24" aria-hidden="true">'+INBOUND_ICONS.calendar+'</svg>'+'</button></div><small id="pick-'+name+'-error" class="p08-date-error" role="alert" hidden></small></div>';}
 function syncValidation(force=false){
  const result=validatePickerDates(dates,mode);
  for(const button of dialog.querySelectorAll('[data-quick-range]')){
   const range=quickHistoryRange(Number(button.dataset.quickRange));
   button.setAttribute('aria-pressed',String(parseDate(dates.from)===range.from&&parseDate(dates.to)===range.to));
  }
  for(const name of Object.keys(result.values)){
   const input=dialog.querySelector('#pick-'+name),label=dialog.querySelector('#pick-'+name+'-error');if(!input||!label)continue;
   const visible=!!result.errors[name]&&(force||touched.has(name)||(dates[name]||'').trim().length>=10);
   input.setAttribute('aria-invalid',String(visible));label.textContent=visible?result.errors[name]:'';label.hidden=!visible;
  }
  const submit=dialog.querySelector('[type=submit]');if(submit)submit.disabled=Object.keys(result.errors).length>0;
  return result;
 }
 function paint(focus){
  let title,body,footer;const navigationBounds=queryDateBounds(),bounds=view==='calendar'?selectableDateBounds(field,dates,navigationBounds):navigationBounds;dialog.dataset.view=view;
  if(view==='calendar'){
   title='Chọn '+({from:'ngày bắt đầu',to:'ngày kết thúc',day:'ngày hoạt động'})[field];
   const [y,m]=cursor.split('-').map(Number),info=monthDays(y,m-1),selected=parseDate(dates[field]);
   body='<div class="p08-calendar-head"><button type="button" data-month="-1" '+(cursor.slice(0,7)<=navigationBounds.min.slice(0,7)?'disabled':'')+' aria-label="Tháng trước">‹</button><strong aria-live="polite">Tháng '+m+' / '+y+'</strong><button type="button" data-month="1" '+(cursor.slice(0,7)>=navigationBounds.max.slice(0,7)?'disabled':'')+' aria-label="Tháng sau">›</button></div><div class="p08-calendar-week" aria-hidden="true">'+['T2','T3','T4','T5','T6','T7','CN'].map(t=>'<span>'+t+'</span>').join('')+'</div><div class="p08-calendar-days" role="group" aria-label="Các ngày trong tháng">'+Array.from({length:info.offset},()=>'<span></span>').join('')+Array.from({length:info.count},(_,i)=>{const iso=y.toString().padStart(4,'0')+'-'+String(m).padStart(2,'0')+'-'+String(i+1).padStart(2,'0');return '<button type="button" data-date="'+iso+'" '+(!dateAllowed(iso,bounds)?'disabled':'')+' aria-label="'+dayLabel(iso)+'" aria-pressed="'+(iso===selected)+'" '+(iso===navigationBounds.max?'aria-current="date"':'')+'>'+(i+1)+'</button>';}).join('')+'</div>';
   footer='<button type="button" data-today aria-label="Hôm nay">Hôm nay</button><button type="button" data-calendar-back>Quay lại</button>';
  }else if(mode==='sort'){
   title=sortTitle;body=choices('sort',SORTS,draft.sort);footer='<button type="button" data-cancel>Hủy</button><button type="submit">Áp dụng</button>';
  }else if(mode==='day'){
   title='Ngày hoạt động';body=dateField('day','Ngày hoạt động')+(includeDayStatus?'<fieldset><legend>'+esc(statusTitle)+'</legend>'+choices('status',[['all',allStatusLabel],...statusOptions],draft.status)+'</fieldset>':'');footer='<button type="button" data-manual>Xem lịch sử không lọc ngày</button><button type="button" data-cancel>Hủy</button><button type="submit">Áp dụng</button>';
  }else{
   const shortcuts=quickRanges?'<div class="p08-quick-ranges" role="group" aria-label="Chọn nhanh khoảng ngày">'+QUICK_RANGES.map(([n,label])=>'<button type="button" data-quick-range="'+n+'" aria-pressed="false">'+label+'</button>').join('')+'</div>':'';
   title=filterTitle;body='<fieldset><legend>Khoảng thời gian</legend>'+shortcuts+'<div class="p08-date-pair">'+dateField('from','Từ ngày')+dateField('to','Đến ngày')+'</div></fieldset><fieldset><legend>'+esc(statusTitle)+'</legend>'+choices('status',[['all',allStatusLabel],...statusOptions],draft.status)+'</fieldset>';
   footer='<button type="button" data-reset>Đặt lại</button><button type="button" data-cancel>Hủy</button><button type="submit">Áp dụng</button>';
  }
  const heading=view==='filter'?'<div><h2 id="p08-picker-title">'+title+'</h2><p class="p08-picker-context app-modal-scroll" tabindex="0" style="max-height:88px;overflow:auto;overflow-wrap:anywhere;white-space:pre-wrap">'+esc(scopeLabel)+'</p></div>':'<h2 id="p08-picker-title">'+title+'</h2>';
  dialog.innerHTML='<form novalidate><header>'+heading+'<button type="button" data-cancel aria-label="Đóng">×</button></header><div class="app-modal-body">'+body+(view==='calendar'&&calendarNotice?'<p class="p08-calendar-notice" role="status">'+esc(calendarNotice)+'</p>':'')+'<p data-error role="alert">'+esc(error)+'</p></div><footer>'+footer+'</footer></form>';
  dialog.querySelector('h2').tabIndex=-1;
  if(view!=='calendar')syncValidation();
  if(handle){const target=dialog.querySelector(focus||'button,input');(target&&!target.disabled?target:dialog.querySelector('button:not(:disabled),input:not(:disabled)'))?.focus({preventScroll:true});}
 }
 paint();handle=openAppModal({screen,tools,dialog,dismissOnBackdrop:false,initialFocus:quickRanges?'h2':mode==='sort'?'input:checked':'input',onClose});
 dialog.addEventListener('input',e=>{if(e.target.name in dates){dates[e.target.name]=e.target.value;error='';dialog.querySelector('[data-error]').textContent='';syncValidation();}});
 dialog.addEventListener('focusout',e=>{if(e.target.name in dates){touched.add(e.target.name);syncValidation();}});
 dialog.addEventListener('focusin',()=>{if(view!=='calendar')syncValidation();});
 dialog.addEventListener('change',e=>{if(['status','sort'].includes(e.target.name))draft[e.target.name]=e.target.value;});
 dialog.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.hasAttribute('data-quick-range')){
   if(!quickRanges||view!=='filter')return;
   const range=quickHistoryRange(Number(b.dataset.quickRange));
   dates.from=dayLabel(range.from);dates.to=dayLabel(range.to);error='';calendarNotice='';touched.clear();
   paint('[data-quick-range="'+b.dataset.quickRange+'"]');return;
  }
  if(b.hasAttribute('data-today')){if(view!=='calendar')return;const today=queryDateBounds().max;cursor=today;error='';calendarNotice=dateAllowed(today,selectableDateBounds(field,dates))?'':'Hôm nay nằm sau Đến ngày. Hãy đổi Đến ngày trước.';paint(dateAllowed(today,selectableDateBounds(field,dates))?'[data-date="'+today+'"]':'[data-today]');}
  else if(b.hasAttribute('data-manual')){handle.close();onApply({...draft,manual:true});}
  else if(b.hasAttribute('data-cancel'))handle.close();
  else if(b.dataset.calendar){field=b.dataset.calendar;cursor=clampQueryDate(parseDate(dates[field])||day,selectableDateBounds(field,dates));view='calendar';error='';calendarNotice='';paint('[data-date="'+cursor+'"]');}
  else if(b.dataset.month){const [y,m]=cursor.split('-').map(Number),d=new Date(cursor+'T00:00:00Z');d.setUTCDate(1);d.setUTCMonth(m-1+Number(b.dataset.month));const next=d.toISOString().slice(0,10),bounds=queryDateBounds();if(next.slice(0,7)<bounds.min.slice(0,7)||next.slice(0,7)>bounds.max.slice(0,7))return;cursor=next;calendarNotice='';paint('[data-month="'+b.dataset.month+'"]');}
  else if(b.dataset.date){if(!dateAllowed(b.dataset.date,selectableDateBounds(field,dates))){error='Ngày không phù hợp với khoảng thời gian đã chọn.';paint();return;}dates[field]=dayLabel(b.dataset.date);touched.add(field);view=mode;paint('[data-calendar="'+field+'"]');}
  else if(b.hasAttribute('data-calendar-back')){view=mode;paint('[data-calendar="'+field+'"]');}
  else if(b.hasAttribute('data-reset')){Object.assign(dates,todayRangeDraft());draft.status='all';cursor=parseDate(dates.from);error='';calendarNotice='';touched.clear();paint('[data-reset]');}
 });
 dialog.addEventListener('keydown',e=>{
  if(!e.target.dataset.date||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;
  if(e.key.startsWith('Arrow')){e.preventDefault();const next=moveCalendarDate(e.target.dataset.date,e.key,selectableDateBounds(field,dates));if(next.slice(0,7)!==cursor.slice(0,7)){cursor=next;paint('[data-date="'+next+'"]');}else dialog.querySelector('[data-date="'+next+'"]')?.focus();return;}
  e.preventDefault();const buttons=[...dialog.querySelectorAll('[data-date]:not(:disabled)')],i=buttons.indexOf(e.target),n=e.key==='Home'?0:e.key==='End'?buttons.length-1:i+({ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7})[e.key];buttons[Math.max(0,Math.min(buttons.length-1,n))]?.focus();
 });
 dialog.addEventListener('submit',e=>{
  e.preventDefault();if(view==='calendar')return;
  const validation=syncValidation(true);
  if(Object.keys(validation.errors).length){dialog.querySelector('#pick-'+Object.keys(validation.errors)[0])?.focus({preventScroll:true});return;}
  const names=mode==='filter'?['from','to']:mode==='day'?['day']:[];
  for(const n of names){draft[n]=parseDate(dates[n]);if(draft[n]===null||(n==='day'&&!draft[n])){error='Nhập ngày hợp lệ theo dd/mm/yyyy.';paint('#pick-'+n);return;}}
  if(mode==='filter'&&draft.from&&draft.to&&draft.from>draft.to){error='Ngày bắt đầu không được sau ngày kết thúc.';paint('#pick-from');return;}
  const bounds=queryDateBounds();
  if(mode==='day'&&!dateAllowed(draft.day,bounds)){error='Chọn ngày từ '+queryDateLabel(bounds.min)+' đến '+queryDateLabel(bounds.max)+'.';paint('#pick-day');return;}
  if(mode==='filter'){error=validateQueryRange(draft,bounds);if(error){if((draft.from&&!dateAllowed(draft.from,bounds))||(draft.to&&!dateAllowed(draft.to,bounds)))error='Chọn ngày từ '+queryDateLabel(bounds.min)+' đến '+queryDateLabel(bounds.max)+'.';paint('#pick-from');return;}Object.assign(draft,resolveQueryRange(draft,bounds));}
  handle.close();onApply(draft);
 });
 return handle;
}
