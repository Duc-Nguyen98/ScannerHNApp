const fs=require('node:fs');const path='docs/flows/warranty-components/resume-view.mjs';let s=fs.readFileSync(path,'utf8');
function edit(a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,80));s=s.replace(a,b);}
edit('checkpointTime,reconciliationSummary,resumeReadiness','checkpointTime,reconciliationSummary,resumeReadiness,resumeCount');
edit("const time=v=>v?new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',dateStyle:'short',timeStyle:'short'}).format(new Date(v)):'Chưa xác minh';", "const time=v=>checkpointTime(v).full;");
edit('const positions=new Map(),lastResumed=new Map();let copyTask=null;',`const positions=new Map(),lastResumed=new Map();let copyTask=null,paintedKey='',paintedPanel=0,deferred=false,focusFrame=0;
 // Keep the reader's originating DOM alive while an async owner update arrives.
 const overlayObserver=new MutationObserver(()=>{if(deferred&&active&&!screen.querySelector('.app-modal-host')){deferred=false;render(true);}});
 overlayObserver.observe(screen,{childList:true,subtree:true});
 function focusRef(){const el=document.activeElement;if(!root.contains(el))return null;
  if(el?.dataset.p21)return {action:el.dataset.p21,doc:el.dataset.doc};
  if(el?.matches('[data-hn-read-trigger]'))return {reader:el.getAttribute('aria-label'),index:[...root.querySelectorAll('[data-hn-read-trigger]')].filter(n=>n.getAttribute('aria-label')===el.getAttribute('aria-label')).indexOf(el)};
  return {selector:el?.matches('h1')?'h1':'.p21-scroll'};
 }
 function restoreFocus(ref){if(!ref)return;let target;
  if(ref.action)target=[...root.querySelectorAll('[data-p21]:not(:disabled)')].find(e=>e.dataset.p21===ref.action&&(!ref.doc||e.dataset.doc===ref.doc));
  else if(ref.reader)target=[...root.querySelectorAll('[data-hn-read-trigger]')].filter(e=>e.getAttribute('aria-label')===ref.reader)[ref.index];
  else target=root.querySelector(ref.selector);
  (target||root.querySelector('h1'))?.focus({preventScroll:true});
 }`);
edit("const remember=()=>{if(active){const el=document.activeElement;positions.set(memoryKey(),{top:root.querySelector('.p21-scroll')?.scrollTop||0,action:el?.dataset.p21,doc:el?.dataset.doc});}};", "const remember=()=>{if(active)positions.set(memoryKey(),{top:root.querySelector('.p21-scroll')?.scrollTop||0,focus:focusRef()});};");
// Count fields are text, never HTML, and missing values must remain unknown.
s=s.replaceAll('${s.counts.codes}','${esc(resumeCount(s.counts?.codes))}').replaceAll('${s.counts.quantity}','${esc(resumeCount(s.counts?.quantity))}').replaceAll('${r.quantity}','${esc(resumeCount(r.quantity))}');
s=s.replace("kv('Số mã/hộp',s.counts.codes)","kv('Số mã/hộp',resumeCount(s.counts?.codes))").replace("s.counts.quantity+' linh kiện'","resumeCount(s.counts?.quantity)+' linh kiện'");
edit("${icon('clock')}Chưa xác nhận xuất kho", "${icon('clock')}Chưa xác nhận xuất kho");
edit('function render(focus=false){if(!active||disposed)return;',`function render(focus=false,restore=false){if(!active||disposed)return;
  if(screen.querySelector('.app-modal-host')){deferred=true;syncTools();return;}
  const same=paintedKey===key&&paintedPanel===panel,currentFocus=focusRef(),priorActive=document.activeElement;
  const position=restore?positions.get(memoryKey()):same?{top:root.querySelector('.p21-scroll')?.scrollTop||0,focus:currentFocus}:null;
  cancelAnimationFrame(focusFrame);`);
edit("const saved=positions.get(memoryKey());root.querySelector('.p21-scroll').scrollTop=saved?.top||0;if(focus&&!screen.querySelector('.app-modal-host')){const target=saved?.action&&root.querySelector(`[data-p21=\"${saved.action}\"]${saved.doc?`[data-doc=\"${CSS.escape(saved.doc)}\"]`:''}:not(:disabled)`);(target||root.querySelector('h1'))?.focus({preventScroll:true});}syncTools();onSize();",`paintedKey=key;paintedPanel=panel;
  const scroller=root.querySelector('.p21-scroll'),top=position?.top||0;scroller.scrollTop=top;
  const ref=restore?(position?.focus||{selector:'h1'}):currentFocus;
  if(ref){restoreFocus(ref);const token=generation;const immediate=document.activeElement;
   // Shared readable triggers are created on the next animation frame.
   focusFrame=requestAnimationFrame(()=>{if(!active||disposed||generation!==token||screen.querySelector('.app-modal-host'))return;
    if(document.activeElement===immediate||document.activeElement===document.body){scroller.scrollTop=top;restoreFocus(ref);}
   });
  }else if(focus&&priorActive===document.body&&restore)root.querySelector('h1')?.focus({preventScroll:true});
  syncTools();onSize();`);
// Not-posted is already verified, so every dismissal proceeds to read verification.
edit("onConfirm:()=>{if(active&&owner===selected){panel=2;void verify();}}", "onClose:()=>{if(active&&owner===selected){panel=2;void verify();}}" );
edit("token!==generation||guard()||result==='cancelled'", "token!==generation||guard()||reconciliationSummary(selected.snapshot())!==payload||result==='cancelled'");
edit("if(a==='reload'){panel=2;void verify();return;}", "if(a==='reload'){remember();panel=2;void verify();return;}");
edit("unsubscribe=owner?.subscribe(()=>{if(active&&!disposed){remember();render(true);}});render(true);", "unsubscribe=owner?.subscribe(()=>{if(active&&!disposed)render(true);});render(true,true);");
edit("hide(){if(!active)return;remember();active=false;", "hide(){if(!active)return;remember();active=false;deferred=false;cancelAnimationFrame(focusFrame);");
edit("dispose(){this.hide();disposed=true;feedback.dispose();", "dispose(){this.hide();disposed=true;overlayObserver.disconnect();feedback.dispose();");
fs.writeFileSync(path,s);
