export function visiblePanels(doc) {
  const result=new Set();
  for(const el of doc.querySelectorAll('[data-panel],[data-state-panel]'))if(el.getClientRects().length&&doc.defaultView.getComputedStyle(el).visibility!=='hidden')for(const id of [el.dataset.panel,el.dataset.statePanel])if(id)result.add(id);
  if(doc.querySelector('iframe')?.contentDocument?.querySelector('[data-history-hub=true]'))result.add('P22.S01');
  return [...result];
}

// Only drive existing UI commands and opt-in fixture tools; never write model state.
export async function openScene(frame,id,{motion='auto',scenario='default',signal}={}) {
  const w=frame.contentWindow,d=frame.contentDocument;
  async function wait(fn,label,timeout=16000){const start=performance.now();while(!signal?.aborted){const value=fn();if(value)return value;if(performance.now()-start>timeout)throw Error('Chưa mở được '+label);await new Promise(r=>setTimeout(r,30));}throw new DOMException('Cancelled','AbortError');}
  const el=q=>d.querySelector(q);
  const click=async q=>(await wait(()=>{const b=el(q);return b&&!b.disabled?b:null;},q)).click();
  const input=async(q,value)=>{const n=await wait(()=>el(q),q);n.value=value;n.dispatchEvent(new w.Event('input',{bubbles:true}));};
  const select=async(q,value)=>{const n=await wait(()=>el(q),q);n.value=value;n.dispatchEvent(new w.Event('change',{bubbles:true}));};
  const route=async hash=>{w.location.hash=hash;await new Promise(r=>setTimeout(r,60));};
  const panel=target=>wait(()=>visiblePanels(d).includes(target),target);
  const a=(b,n)=>`[data-${b}="${n}"]`;
  await wait(()=>el('#login-form'),'Login');await select('#motion-mode',motion);
  if(scenario==='other-user')await select('#scenario','other-user');
  const recovery=id.startsWith('P14.S0')&&Number(id.at(-1))<3;
  if(recovery){await click('#forgot');if(id==='P14.S02'){await input('#p14-username','minhanh');el('#p14-recovery-form').requestSubmit();}await panel(id);return;}
  if(id==='P01.S01')return;
  await input('#username','minhanh');await input('#password','preview');await click('#submit');await wait(()=>el('#start'),'confirmation');
  if(id==='P01.S02')return;
  await click('#start');let uiRetry=false;await wait(()=>{const home=el('#hn-home:not([hidden])');if(home)return home;const start=el('#start');if(!uiRetry&&start&&!start.disabled&&start.textContent.includes('Thử tải lại')){uiRetry=true;start.click();}return null;},'Home',45000);await select('#home-motion-mode',motion);
  const board=id.slice(0,3),n=Number(id.at(-1));
  async function stock(kind,step,{unknown=false,invalid=false}={}){
    const b=kind==='inbound'?'p04':'p05';await click(`.hn-task[data-route=${kind}]`);await wait(()=>el('.'+b+'-app'),b);
    if(step<2)return;
    if(kind==='outbound'){
      await click('[data-p05-select=province]');await click('[data-p05-option="79"]');await click('[data-p05-select=district]');await click('[data-p05-option="760"]');await input('[data-p05-field=address]','123 Lê Lợi');await input('[data-p05-field=planned]','10');
    }
    await click(a(b,'next'));
    if(invalid){await click(a(b,'manual'));await input('#'+b+'-code',kind==='inbound'?'INVALID-REVIEW':'HN99999');el('.'+b+'-manual').requestSubmit();return;}
    await click(a(b,'batch'));
    if(step<3)return;
    if(kind==='outbound'){await click(a(b,'manual'));for(const code of ['HN12352','HN12353','HN12354']){await input('#p05-code',code);el('.p05-manual').requestSubmit();}await click(a(b,'close-manual'));}
    await click(a(b,'next'));if(step<4)return;
    if(unknown)await select('[data-'+b+'-outcome]','timeout-recorded');await click(a(b,'send'));
    await panel(unknown?'P17.S04':kind==='inbound'?'P04.S04':'P05.S04');
  }
  async function nfc(step,conflict=false){await route('#p02/nfc');await click(a('p07','begin'));if(conflict)await select('[data-p07-scenario]','conflict');if(step>=3||conflict){await click('[data-p07-demo-read]');await wait(()=>{const s=el('[data-p07-snapshot]');return s&&!JSON.parse(s.textContent).busy;},'NFC read');}if(!conflict&&step>=3)await click(a('p07','next'));if(!conflict&&step===4)await click(a('p07','confirm'));}
  if(board==='P02')return;
  if(board==='P03'){
    if(n===1||n===3)await click(`[data-p03-open=${n===1?'picker':'stopped'}]`);
    else{await stock('inbound',2);await route('#home');await click('[data-tab=lookup]');if(n===4)await click('[data-p03-action=discard]');}
  }
  if(board==='P04'||board==='P05')await stock(board==='P04'?'inbound':'outbound',n);
  if(board==='P06'){await route('#p02/lookup');if(n>1){await click('[data-p06-item="fixture-item-HN12345"]');if(n>2)await click(a('p06',n===3?'stock':'history'));}}
  if(board==='P07'){if(n===1)await route('#p02/nfc');else await nfc(n);}
  if(board==='P08')await route('#p02/history-list?panel='+n+(n===2?'&record=LS-0001':n===3?'&session=PQ-0001':''));
  if(board==='P09'){
    await route('#p02/warranty');if(n===2)await click(a('p09','begin'));
    if(n>=3){await route('#p02/warranty?panel=3&case=BH-001');await panel('P09.S03');}
    if(n===4){await click(a('p09','update'));await input('.p09-update-dialog [name=result]','Đã kiểm tra xong trong fixture');el('.p09-update-dialog form').requestSubmit();}
  }
  if(board==='P10'){await route('#p02/profile');if(n>1)await click(a('p10',{2:'edit',3:'rights',4:'security'}[n]));}
  if(board==='P11'){
    await route('#p02/profile?panel=4');await click(a('p10',n===4?'sessions':'password'));
    if(n===2||n===3){await input('#p11-current','preview');await input('#p11-next','preview2');await input('#p11-confirm',n===2?'different-demo':'preview2');await click('[data-p11-save]');}
  }
  if(board==='P12'){await route('#p02/documents');if(n===4)await click(a('p12','create'));else if(n>1){await route('#p02/documents?panel='+n+'&doc=fixture-inbound-0005');}}
  if(board==='P13'){await route('#p02/notifications?panel='+(n===4?3:1));if(n===2)await click('[data-p13-event]');if(n===3)await route('#p02/notifications?panel=3');if(n===4)await click('[data-p13-doc]');}
  if(board==='P14'){await route('#p02/shift');await panel('P14.S03');if(n===4){if(el('[data-p14=save]')){await click(a('p14','save'));await click('[data-action-dialog=confirm]');await wait(()=>el('.app-modal-heading')?.textContent==='Đã lưu nháp','saved draft');await click('[data-action-dialog=confirm]');await wait(()=>!el('.app-modal-host'),'save dialog closed');}await click(a('p14','end'));await click('[data-action-dialog=confirm]');}}
  if(board==='P15')await click(`[data-system-demo=${{1:'connection',2:'expired',3:'forbidden',4:'device'}[n]}]`);
  if(board==='P16'){await route('#p02/documents');await panel('P12.S01');await click(`[data-p16-demo=${{1:'loading',2:'empty',3:'no-results',4:'error'}[n]}]`);}
  if(board==='P17'){if(n<3)await stock(n===1?'inbound':'outbound',2,{invalid:true});if(n===3)await nfc(2,true);if(n===4)await stock('inbound',4,{unknown:true});}
  if(board==='P18'){await click(`[data-p18-demo=${{1:'files',2:'files',3:'ready',4:'location'}[n]}]`);if(n===2)await click('[data-p18=view]');}
  if(board==='P19')await click(`[data-p19-demo=${{1:'scan',2:'quantity',3:'review',4:'success'}[n]}]`);
  if(board==='P20')await click(`[data-p20-demo=${{1:'history',2:'history-loading',3:'history-error',4:'empty'}[n]}]`);
  if(board==='P21')await click(`[data-p21-demo=${{1:'drafts',2:'resume',3:'reconcile',4:'post-check'}[n]}]`);
  if(board==='P22'){
    await route(n===1?'#p02/history':'#p02/history?scene=nfc');
    if(n===2||n===3){await wait(()=>el('[data-p22-source]'),'NFC audit');await select('[data-p22-source]','fixture');await wait(()=>el('[data-p22-event]'),'NFC event');if(n===3)await click('[data-p22-event]');}
    if(n===4)await route('#p02/history?scene=events-unavailable');
  }
  if(board==='P23'){
    await route('#p02/history?scene='+(n<3?'warranty':'sessions'));if(n===2)await click('[data-p23-entity="BH-001"]');
    if(n>=3){await wait(()=>el('[data-p23-source]'),'session source');await select('[data-p23-source]','fixture');await wait(()=>el('[data-p23-entity]'),'session row');if(n===4)await click('[data-p23-entity="PQ-0003"]');}
  }
  if(board==='P24'){if(n===3)await stock('inbound',4);else await click(`[data-p24-demo=${{1:'quantity-invalid',2:'scan-error',4:'closed'}[n]}]`);}
  await panel(id);
}
