import {BUSINESS_CONFIG,businessRows,selectBusiness,businessSession} from './business-history-data.mjs';
import {historyControls,countBadge} from './history-controls.mjs';
import {validateQueryRange} from '../shared/query-date-policy.mjs';
import {DATA,initialFilters,selectRecords,readRecord,readSession as readBaseSession,readRange,scanCounts,dayLabel} from './history-model.mjs';
import {DIALOG_ICONS} from '../scanner-dialogs/icons.mjs';
import {PROFILE_ICONS} from '../profile/icons.mjs';
import {INBOUND_ICONS} from '../inbound/icons.mjs';
import {LOOKUP_ICONS} from '../lookup/icons.mjs';
import {openHistoryPicker,SORTS} from './history-picker.mjs';
import {renderHistoryDetail} from './history-detail.mjs';
import {createActionFeedback} from '../shared/action-feedback.mjs';
import {createDialogRoute} from '../shared/dialog-route.mjs';
import {hasHistoryRefinements,relaxHistoryFilters,historyContextKey} from './history-ux.mjs';
const icons={check:PROFILE_ICONS.check,...DIALOG_ICONS,...INBOUND_ICONS,...LOOKUP_ICONS,copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v12h5"/>'}; // copy: existing warranty-components/flow.js
const icon=n=>`<svg class="p08-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[n]||icons.document}</svg>`;
const esc=s=>String(s??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const glyph={inbound:'down',outbound:'up',warranty:'tool',nfc:'nfc',documents:'document'};
const titles=['','Lịch sử','Chi tiết lịch sử','Phiên quét','Hoạt động theo ngày'];
const chip=(label,tone)=>`<span class="p08-chip ${{received:'processing',handover:'waiting'}[tone]||tone}">${esc(label)}</span>`;
const hint=text=>`<div class="p08-hint">${icon('alert')}<span>${esc(text)}</span></div>`;
const action=(key,label,cls='p08-link')=>`<button class="${cls}" data-p08="${key}">${label}</button>`;
const unavailable=(title,copy)=>`<div class="p08-state">${icon('history')}<strong>${esc(title)}</strong><p>${esc(copy)}</p></div>`;
export function mountHistory({root,tools,screen,getState,onHub,onDependency,onSize}){
  let active=false,disposed=false,modal=null,panel=1,recordId='LS-0001',sessionId='PQ-0001',tab='info',filters=initialFilters(),limit=6,allCodes=false,scenario='ready',message='';
  let business='',dayFilters=initialFilters();
  const feedback=createActionFeedback({getScreen:()=>screen,tools,isActive:()=>active&&!disposed&&getState()?.previewReady,key:'hnP08Action'});
  const pickerRoute=createDialogRoute({history,location,key:'hnP08Picker'});
  function pickerNavigation(event){if(pickerRoute.navigation(()=>modal?.close(),()=>!!modal))event.stopImmediatePropagation();}
  window.addEventListener('popstate',pickerNavigation,true);window.addEventListener('hashchange',pickerNavigation,true);
  const readSession=id=>businessSession(id)||readBaseSession(id);
  const statusLabels=()=>BUSINESS_CONFIG[business]?.statuses||DATA.statuses;
  const allRows=()=>business?businessRows(business):DATA.records;
  const statusOptions=()=>Object.entries(statusLabels()).filter(([s])=>allRows().some(r=>(filters.scope!=='documents'||['inbound','outbound'].includes(r.type))&&(filters.type==='all'||r.type===filters.type)&&r.status===s));
  const selectedRows=()=>business?selectBusiness(business,filters):selectRecords(filters);
  const currentRecord=()=>business?businessRows(business).find(r=>r.id===recordId):readRecord(recordId);
  const screenId=()=>({nfc:{1:'P22.S02',2:'P22.S03'},warranty:{1:'P23.S01',2:'P23.S02'},sessions:{1:'P23.S03',3:'P23.S04'}}[business]?.[panel]||'P08.S0'+panel);
  const title=()=>business&&panel===1?BUSINESS_CONFIG[business].title:titles[panel];
  const views=new Map(),contexts=new Map(),pendingCopies=new WeakSet(); let renderedKey=null,transientView=false;
  const review=document.createElement('section');review.className='p08-tools';review.hidden=true;
  review.innerHTML='<details open><summary>P08 · Lịch sử — fixture chỉ đọc</summary><p>48 hoạt động demo. Mặc định Tất cả ngày; tổng quan dùng cùng phạm vi bộ lọc. Không kết nối WMS.</p><div>'+[1,2,3,4].map(p=>`<button data-p08-preview="${p}">${p}. ${titles[p]}</button>`).join('')+'</div><label>Nguồn mô phỏng <select data-p08-scenario><option value="ready">Fixture sẵn sàng</option><option value="loading">Đang tải</option><option value="empty">Kết quả rỗng</option><option value="error">Lỗi đọc nguồn</option><option value="unavailable">Nguồn chưa khả dụng</option></select></label><p>P12/P18 chưa tích hợp nguồn chứng từ/tệp. Quantity PQ-0001=17: lượt trùng=0, NFC=0. Thống kê theo ID fixture duy nhất; định nghĩa production UNKNOWN, không kết nối WMS.</p><pre data-p08-snapshot hidden></pre></details>';
  tools.append(review);
  const key=()=>`${business}:${panel}:${panel===2?recordId:panel===3?sessionId:panel===4?JSON.stringify(dayFilters):JSON.stringify(filters)}:${panel===2?tab:panel===3?allCodes:''}`;
  function remember(){if(!active||!renderedKey)return;const scroll=root.querySelector('.p08-scroll');if(!scroll)return;const el=document.activeElement;views.set(renderedKey,{top:scroll.scrollTop,focus:el?.dataset.p08Record?`[data-p08-record="${el.dataset.p08Record}"]`:el?.dataset.p08?`[data-p08="${el.dataset.p08}"]`:null});if((panel===1||panel===4)&&!transientView)contexts.set(historyContextKey(panel,business,filters.scope),{filters:{...filters},dayFilters:{...dayFilters},limit});}
  function save(){const state={...history.state,p08:{filters:{...filters},limit,tab,allCodes,dayFilters:{...dayFilters}}};delete state.p08Resume;history.replaceState(state,'',location.hash);}
  function navigate(p,extra={},nextFilters=null,nextBusiness=business){remember();save();const transient=panel===4&&p===1||!!history.state?.p08Transient&&nextBusiness===business;business=nextBusiness;if(nextFilters){filters=nextFilters;limit=6;}const query=new URLSearchParams({panel:p,...(business?{business}:{}),...extra});history.pushState({p08:{filters:{...filters},limit,tab:'info',allCodes:false,dayFilters},p08Transient:transient,p08Back:true},'',`#p02/history-list?${query}`);show({focusHeading:true});}
  function renderList(){
    const rows=scenario==='empty'?[]:selectedRows();
    const typeOptions=BUSINESS_CONFIG[business]?.tabs||Object.entries(DATA.names).filter(([k])=>k!=='documents'&&(filters.scope!=='documents'||['inbound','outbound'].includes(k))).map(([k,n])=>[k,k==='nfc'?'NFC':n]);
    return `${historyControls({filters,tabs:typeOptions,statuses:statusLabels(),count:rows.length,ready:['ready','empty'].includes(scenario),placeholder:BUSINESS_CONFIG[business]?.placeholder,icon})}
    ${sourceState()||`<div class="p08-list">${rows.slice(0,limit).map(r=>`<button class="p08-row" data-history-tone="${business||r.type}" data-p08-record="${r.id}"><span class="p08-tile ${r.type}">${icon(business==='sessions'?'scan':business==='nfc'?'nfc':glyph[r.type])}</span><span class="p08-row-copy"><span class="p08-row-top"><strong>${r.id}</strong><time>${dayLabel(r.day)} ${r.time}</time></span><span class="p08-row-bottom"><b>${esc(business==='warranty'?r.model:r.label)}</b>${chip(statusLabels()[r.status]||'Chưa có dữ liệu',r.status)}</span><small>${esc(business==='warranty'?'SN: '+r.serial+' · '+r.actor:business==='nfc'?r.uid+' · '+r.serial:business==='sessions'?r.documentId+' · '+r.count:r.documentId+' | '+r.warehouse)}</small></span>${icon('chevron')}</button>`).join('')}</div>${!rows.length?emptyState(filters):''}${rows.length?`<p class="p08-list-end" role="status">${rows.length>limit?`Đã hiển thị ${Math.min(limit,rows.length)}/${rows.length} · Cuộn để xem tiếp`:`Đã hiển thị đủ ${rows.length} kết quả`}</p>`:''}`}
    `;
  }
  function emptyState(f){return hasHistoryRefinements(f)?unavailable('Không có kết quả phù hợp','Bạn có thể bỏ từ khóa, ngày và trạng thái. Loại nghiệp vụ đang chọn được giữ nguyên.')+action('relax','Bỏ điều kiện lọc','p08-more'):unavailable('Chưa có hoạt động','Chưa có bản ghi trong nhóm nghiệp vụ này.')+action('retry','Làm mới','p08-more');}
  function sourceState(){
    if(scenario==='loading')return unavailable('Đang tải lịch sử…','Vui lòng chờ dữ liệu lịch sử.');
    if(scenario==='error')return unavailable('Không tải được lịch sử','Bộ lọc và ngữ cảnh vẫn được giữ.')+action('retry','Thử lại','p08-more');
    if(scenario==='unavailable')return unavailable('Chưa có dữ liệu lịch sử','Nguồn sự kiện chưa khả dụng. Vui lòng kiểm tra lại sau.')+action('retry','Thử lại','p08-more');
    return '';
  }
  function detail(){
    const r=currentRecord();
    if(!r)return unavailable('Không tìm thấy lịch sử','Bản ghi không tồn tại trong dữ liệu hiện có.');
    return sourceState()||renderHistoryDetail(r,tab,icon,{statuses:statusLabels(),related:!business,documentLabel:business==='nfc'?'UID thẻ':business==='warranty'?'Mã hồ sơ':'Chứng từ liên quan',showDocumentHint:!business});
  }
  function session(){
    const s=readSession(sessionId);if(!s)return unavailable('Không tìm thấy phiên quét','Không suy phiên từ khoảng thời gian hoặc thay bằng phiên khác.');
    if(sourceState())return sourceState();
    const c=scanCounts(s),events=allCodes?s.events:s.events.slice(0,5);
    return `<section class="p08-card p08-summary"><span class="p08-tile" data-history-tone="sessions">${icon('scan')}</span><div><div class="p08-row-top"><strong>${s.id}</strong>${chip(s.sessionStatus,'accepted')}</div><b>${esc(s.type||'Phiên quét mã')}</b><small>${dayLabel(s.day)} ${s.time}</small></div></section>
    <section class="p08-card p08-person"><div>${icon('user')}<span><strong>${esc(s.actor??'Chưa có dữ liệu')}</strong><small>Người thực hiện</small></span></div><div>${icon('house')}<strong>${esc(s.warehouse??'Chưa có dữ liệu')}</strong></div><div class="p08-times"><div>${icon('clock')}<span>${dayLabel(s.day)} ${s.time.split(' – ')[0]}<small>Bắt đầu</small></span></div><div>${icon('clock')}<span>${dayLabel(s.day)} ${s.time.split(' – ')[1]}<small>Kết thúc</small></span></div></div></section>
    <div class="p08-counters">${[[c.total,'Tổng lượt quét'],[c.accepted,'Mã hợp lệ'],[c.duplicate,'Mã trùng']].map(([n,t],i)=>`<div data-count-kind="${['total','accepted','duplicate'][i]}" data-has-count="${Number(n)>0}"><strong>${n??'—'}</strong>${t}</div>`).join('')}</div>
    <div class="p08-section-head"><h2>Danh sách mã đã quét</h2>${s.events.length>5?`<button class="p08-link" data-p08="codes" aria-expanded="${allCodes}">${allCodes?'Thu gọn':'Xem tất cả'} ${icon('chevron')}</button>`:''}</div>
    <div class="p08-card p08-code-list">${events.map((e,i)=>`<div class="p08-code ${e.result}" data-scan-id="${e.id}"><span class="p08-number">${i+1}</span><div><div class="p08-row-top"><strong>${e.code}</strong><time>${e.time}</time></div><small>${e.sku} | ${e.serial?'SN: '+e.serial:'UID: '+e.uid}</small></div>${chip(e.result==='duplicate'?'Mã trùng':'Hợp lệ',e.result)}</div>`).join('')||'<p class="p08-footnote">Chưa có nguồn chi tiết lượt quét.</p>'}</div>
    ${hint(`${s.doc} · ${s.status}. Kết quả chứng từ tách biệt trạng thái phiên.`)}${action('p23','Danh sách phiên quét '+icon('arrow'))}`;
  }
  function daily(){
    const d=readRange(dayFilters,{available:['ready','empty'].includes(scenario),source:scenario==='empty'?[]:DATA.records});
    if(!sourceState()&&(!d.available||d.total===0)){
      const controls=historyControls({filters:dayFilters,tabs:[],statuses:DATA.statuses,count:d.total,ready:d.available,icon,showSort:false});
      return controls+(!d.available?unavailable('Chưa có thống kê trong phạm vi này','Chưa có nguồn tổng hợp cho khoảng ngày đã chọn.')+action('filter','Đổi bộ lọc','p08-more'):emptyState(dayFilters));
    }
    const rangeTitle=!dayFilters.from&&!dayFilters.to?'Tổng quan hoạt động':dayFilters.from===dayFilters.to?'Tổng quan trong ngày':'Tổng quan theo khoảng ngày';
    const rangeLabel=!dayFilters.from&&!dayFilters.to?'Tất cả ngày':dayFilters.from===dayFilters.to?dayLabel(dayFilters.from):dayLabel(dayFilters.from)+' – '+dayLabel(dayFilters.to);
    return `${historyControls({filters:dayFilters,tabs:[],statuses:DATA.statuses,count:d.total,ready:d.available,placeholder:'Tìm mã phiếu, serial, người thao tác',icon,showSort:false,dateAction:'filter'})}${sourceState()||!d.available?sourceState()||unavailable('Chưa có thống kê trong phạm vi này','Chưa có nguồn tổng hợp cho khoảng ngày đã chọn.'):`<section class="p08-card p08-day-overview" aria-labelledby="p08-overview-title"><h2 id="p08-overview-title">${rangeTitle}</h2><p>${rangeLabel} · Kho Hoa Nam</p><div class="p08-grid">${[...Object.entries(DATA.names),['all','Tổng cộng']].map(([t,n])=>`<div class="p08-stat ${t==='all'?'p08-stat-total':''}" data-history-tone="${t}">${t==='all'?'<span class="p08-day-sum" aria-hidden="true">Σ</span>':icon(t==='inbound'?'box':glyph[t])}<strong>${t==='all'?d.total:d.groups[t]}</strong><span>${t==='nfc'?'NFC':n}</span></div>`).join('')}</div></section><section class="p08-card p08-day-activities" aria-labelledby="p08-activities-title"><div class="p08-section-head"><h2 id="p08-activities-title">Danh sách hoạt động</h2>${countBadge(d.total,'Tổng',true)}</div>${Object.entries(DATA.names).map(([t,n])=>`<button class="p08-group" data-history-tone="${t}" data-p08-group="${t}"><span class="p08-day-tile">${icon(glyph[t])}</span><span>${n}</span><small class="p08-activity-count">${countBadge(d.groups[t],'hoạt động')}</small>${icon('chevron')}</button>`).join('')}</section>`}`;
  }
  function render({restore=true,focusHeading=false}={}){
    if(!active||disposed)return;
    const f=document.activeElement,focusedId=f?.id,selection=f?.selectionStart;const oldTop=root.querySelector('.p08-scroll')?.scrollTop||0;
    root.innerHTML=`<section class="p08-app" data-panel="P08.S0${panel}" data-business="${business}" data-screen-id="${screenId()}"><header class="p08-header"><button data-p08="back" aria-label="Quay lại">${icon('back')}</button><h1 tabindex="-1">${title()}</h1></header><div class="p08-body"><div class="p08-scroll" tabindex="0" aria-label="Nội dung ${titles[panel]}">${panel===1?renderList():panel===2?detail():panel===3?session():daily()}</div></div></section>`;
    const saved=views.get(key()),scroll=root.querySelector('.p08-scroll');scroll.scrollTop=restore?(renderedKey===key()?oldTop:(saved?.top??0)):0;
    if(focusHeading)root.querySelector('h1').focus({preventScroll:true});else if(f?.classList.contains('p08-scroll'))scroll.focus({preventScroll:true});else if(focusedId&&root.querySelector('#'+focusedId)){const input=root.querySelector('#'+focusedId);input.focus({preventScroll:true});if(input.type==='search'&&selection!=null)input.setSelectionRange(selection,selection);}else if(saved?.focus)root.querySelector(saved.focus)?.focus({preventScroll:true});
    renderedKey=key();document.title=title()+' · Hoa Nam Scanner';
    review.querySelector('[data-p08-snapshot]').textContent=JSON.stringify({panel,business,recordId,sessionId,filters,dayFilters,limit,tab,scenario,source:DATA.namespace});onSize();
  }
  function show({focusHeading=false}={}){
    const wasActive=active;modal?.close({restoreFocus:false});active=true;review.hidden=false;
    const q=new URLSearchParams(location.hash.split('?')[1]),saved=history.state?.p08,previousBusiness=business;
    business=Object.hasOwn(BUSINESS_CONFIG,q.get('business'))?q.get('business'):'';
    if(saved){filters={...saved.filters};limit=saved.limit;tab=saved.tab;allCodes=saved.allCodes;dayFilters={...initialFilters(),...saved.dayFilters};}
    if(!saved&&(!wasActive||q.get('scope')||business!==previousBusiness)){filters=initialFilters(q.get('scope'));if(business){filters.from='';filters.to='';}limit=6;dayFilters=initialFilters();}
    const nextPanel=[1,2,3,4].includes(Number(q.get('panel')))?Number(q.get('panel')):1;
    transientView=!!history.state?.p08Transient;
    if(history.state?.p08Resume){const cached=contexts.get(historyContextKey(nextPanel,business,filters.scope));if(cached){filters={...cached.filters};dayFilters={...cached.dayFilters};limit=cached.limit;}save();}
    panel=[1,2,3,4].includes(Number(q.get('panel')))?Number(q.get('panel')):1;recordId=q.get('record')||'LS-0001';sessionId=q.get('session')||'PQ-0001';message='';if(validateQueryRange(filters)){filters={...filters,from:'',to:''};message='Khoảng ngày cũ đã ngoài giới hạn; đã bỏ lọc ngày để xem thủ công.';}if(validateQueryRange(dayFilters)){dayFilters={...dayFilters,from:'',to:''};message='Khoảng ngày cũ đã ngoài giới hạn; đã bỏ lọc ngày để xem thủ công.';}if(message)save();render({focusHeading});if(message)feedback.show({title:'Khoảng ngày đã thay đổi',message,tone:'neutral'});
  }
  function picker(mode){
    if(modal||pickerRoute.isClosing())return;
    pickerRoute.begin();
    const trigger=document.activeElement?.dataset.p08;
    modal=openHistoryPicker({screen,tools,mode,quickRanges:true,filters:panel===4?dayFilters:filters,statusOptions:panel===4?Object.entries(DATA.statuses):statusOptions(),scopeLabel:panel===4?'Hoạt động theo ngày':BUSINESS_CONFIG[business]?.title||DATA.names[filters.type]||'Tất cả',statusTitle:BUSINESS_CONFIG[business]?.statusTitle||'Trạng thái',onClose:()=>{modal=null;pickerRoute.closed();},onApply:async draft=>{
      await pickerRoute.ready();if(!active||disposed)return;
      if(draft.manual){navigate(1,{}, {...initialFilters(),from:'',to:''});return;}
      if(panel===4){dayFilters={...dayFilters,from:draft.from,to:draft.to,status:draft.status};}
      else{filters={...filters,...(mode==='sort'?{sort:draft.sort}:{from:draft.from,to:draft.to,status:draft.status})};limit=6;}
      save();render({restore:false});root.querySelector('[data-p08="'+trigger+'"]')?.focus({preventScroll:true});
    }});
  }
  function onScroll(e){
    if(!active||panel!==1||scenario!=='ready'||modal||!e.target.matches('.p08-scroll'))return;
    const total=selectedRows().length,el=e.target;
    if(limit<total&&el.scrollTop>0&&el.scrollTop+el.clientHeight>=el.scrollHeight-100){remember();limit=Math.min(limit+12,total);save();render();}
  }
  async function onClick(e){
    if(!active||!e.target.closest('.p08-app')||!getState()?.previewReady)return;
    const b=e.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.p08Record){tab='info';if(business==='sessions')navigate(3,{session:b.dataset.p08Record});else navigate(2,{record:b.dataset.p08Record});return;}
    if(b.dataset.p08Type){filters.type=b.dataset.p08Type;if(filters.status!=='all'&&!statusOptions().some(([s])=>s===filters.status))filters.status='all';limit=6;save();render({restore:false});root.querySelector(`[data-p08-type="${filters.type}"]`)?.focus({preventScroll:true});return;}
    if(b.dataset.p08Tab){tab=b.dataset.p08Tab;save();render({restore:false});root.querySelector(`[data-p08-tab="${tab}"]`)?.focus({preventScroll:true});return;}
    if(b.dataset.p08Group){navigate(1,{}, {...dayFilters,type:b.dataset.p08Group,scope:'all'},'');return;}
    switch(b.dataset.p08){
      case 'back':remember();if(history.state?.p08Back)history.back();else if(panel===1)onHub();else navigate(1);break;
      case 'filter':picker('filter');break;
      case 'sort':picker('sort');break;
      case 'choose-day':picker('filter');break;
      case 'relax':if(panel===4)dayFilters=relaxHistoryFilters(dayFilters);else filters=relaxHistoryFilters(filters);limit=6;save();render({restore:false});root.querySelector('h1')?.focus({preventScroll:true});break;
      case 'clear':if(panel===4){dayFilters=initialFilters();save();render({restore:false});root.querySelector('[data-p08="filter"]')?.focus({preventScroll:true});break;}filters={...initialFilters(filters.scope),from:'',to:''};limit=6;save();render({restore:false});root.querySelector('[data-p08="filter"]').focus({preventScroll:true});break;
      case 'timeline':tab='timeline';save();render({restore:false});root.querySelector('[data-p08-tab="timeline"]').focus({preventScroll:true});break;
      case 'day':navigate(4);break;
      case 'session':navigate(3,{session:panel===2?(readRecord(recordId)?.sessionId||'PQ-0001'):'PQ-0001'});break;
      case 'codes':{const top=root.querySelector('.p08-scroll').scrollTop;remember();allCodes=!allCodes;save();render();root.querySelector('.p08-scroll').scrollTop=top;root.querySelector('[data-p08="codes"]').focus({preventScroll:true});break;}
      case 'retry':scenario='ready';review.querySelector('select').value=scenario;render();break;
      case 'copy':{const r=currentRecord(),callerKey=key();if(!r?.documentId||pendingCopies.has(b))return;pendingCopies.add(b);b.disabled=true;b.setAttribute('aria-busy','true');let feedback;try{await navigator.clipboard.writeText(r.documentId);feedback=`Đã sao chép ${r.documentId}`;}catch{feedback='Không truy cập được clipboard. Bạn có thể chọn mã để sao chép.';}finally{pendingCopies.delete(b);if(b.isConnected){b.disabled=false;b.removeAttribute('aria-busy');}}if(active&&!disposed&&b.isConnected&&root.contains(b)&&panel===2&&recordId===r.id&&key()===callerKey){showCopyFeedback(feedback,callerKey);}break;}
      case 'nfc':remember();save();onDependency({target:'P22',scene:readRecord(recordId)?.nfcEventId?'nfc-detail':'events-unavailable',event:readRecord(recordId)?.nfcEventId});break;
      case 'p23':navigate(1,{}, {...initialFilters(),from:'',to:''},'sessions');break;
    }
  }
  function showCopyFeedback(message,callerKey){feedback.show({onClose:()=>{if(active&&!disposed&&key()===callerKey)root.querySelector('[data-p08="copy"]')?.focus({preventScroll:true});},title:message.startsWith('Đã sao chép')?'Đã sao chép mã':'Không thể sao chép',message,tone:message.startsWith('Đã sao chép')?'success':'error',symbol:icon(message.startsWith('Đã sao chép')?'check':'alert')});}
  function onInput(e){
    if(!active||!root.contains(e.target)||e.target.id!=='p08-search')return;
    if(panel===4)dayFilters.q=e.target.value;else filters.q=e.target.value;
    limit=6;save();
    // Keep the actual input connected: replacing it interrupts Vietnamese IME,
    // resets selection and can dismiss the software keyboard on every keystroke.
    const scroll=root.querySelector('.p08-scroll'),search=scroll.querySelector('.p08-search');
    const fragment=document.createElement('template');fragment.innerHTML=panel===4?daily():renderList();
    fragment.content.querySelector('.p08-search').remove();
    for(const child of [...scroll.childNodes])if(child!==search)child.remove();
    scroll.append(fragment.content);scroll.scrollTop=0;renderedKey=key();
    review.querySelector('[data-p08-snapshot]').textContent=JSON.stringify({panel,business,recordId,sessionId,filters,dayFilters,limit,tab,scenario,source:DATA.namespace});
    onSize();
  }
  function onKey(e){const b=e.target.closest('[role=tab]');if(!active||!b||!b.closest('.p08-app')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const list=[...b.parentElement.children],i=list.indexOf(b);list[e.key==='Home'?0:e.key==='End'?list.length-1:(i+(e.key==='ArrowRight'?1:-1)+list.length)%list.length].click();}
  root.addEventListener('scroll',onScroll,true);
  root.addEventListener('click',onClick);root.addEventListener('input',onInput);root.addEventListener('keydown',onKey);
  review.addEventListener('click',e=>{const p=e.target.closest('[data-p08-preview]')?.dataset.p08Preview;if(p){tab='info';navigate(Number(p),{},null,'');}});
  review.querySelector('select').onchange=e=>{scenario=e.target.value;render({restore:false});};
  return {show,hide(){remember();renderedKey=null;active=false;feedback.clear();modal?.close({restoreFocus:false});review.hidden=true;},dispose(){root.removeEventListener('scroll',onScroll,true);disposed=true;feedback.dispose();pickerRoute.dispose();window.removeEventListener('popstate',pickerNavigation,true);window.removeEventListener('hashchange',pickerNavigation,true);modal?.close({restoreFocus:false});review.remove();root.removeEventListener('click',onClick);root.removeEventListener('input',onInput);root.removeEventListener('keydown',onKey);}};
}
