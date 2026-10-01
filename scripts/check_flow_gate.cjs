const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {mockGeography,address}=require('./outbound_geography_helpers.cjs');
const out=path.resolve(process.env.FLOW_JOURNEY_DIR||'handoff/flow/evidence/journeys-final-02');
fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_BASE_URL||'http://127.0.0.1:8766';
const checks=[];
(async()=>{
 const browser=await chromium.launch();
 async function test(id,boards,name,fn){
  if(process.env.FLOW_JOURNEY_FILTER&&!process.env.FLOW_JOURNEY_FILTER.split(',').includes(id))return;
  const context=await browser.newContext({viewport:{width:494,height:950},timezoneId:'Asia/Ho_Chi_Minh'}),p=await context.newPage();
  p.setDefaultTimeout(9000);
  const errors=[],external=[],routes=[];
  p.on('pageerror',e=>errors.push(e.message));
  p.on('framenavigated',f=>{if(f===p.mainFrame())routes.push(f.url());});
  await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===base||['data:','blob:'].includes(u.protocol))return r.continue();external.push(u.origin+u.pathname);return r.abort();});
  await mockGeography(p);
  const a=(board,action)=>p.locator(`[data-${board}="${action}"]`).first();
  const snap=async board=>JSON.parse(await p.locator(`[data-${board}-snapshot]`).textContent());
  const home=async()=>{await p.click('[data-tab=home]');await p.locator('#hn-home:not([hidden])').waitFor();};
  const login=async()=>{await p.goto(base+'/flows/auth-session/');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.locator('#hn-home:not([hidden])').waitFor();};
  const hub=async action=>{await p.click('[data-tab=history]');await p.frameLocator('iframe').locator(`[data-action="${action}"]`).click();};
  const shot=async suffix=>{await p.evaluate(()=>scrollTo(0,0));await p.locator('.hn-screen').screenshot({path:path.join(out,id+'-'+suffix+'.png')});};
  let details;
  try{await login();details=await fn({p,a,snap,home,hub,shot,login});assert.deepEqual(errors,[]);assert.deepEqual(external,[]);checks.push({id,boards,name,status:'PASS',details,errors,external,routes});}
  catch(e){await p.screenshot({path:path.join(out,id+'-failure.png'),fullPage:true}).catch(()=>{});checks.push({id,boards,name,status:'FAIL',error:e.stack,errors,external,routes});}
  finally{await context.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({scope:'UI_FIXTURE',checks},null,2));console.log(checks.at(-1).status+' '+id+' '+name);}
 }
 try{
 await test('J01',['P01','P02','P03','P04','P05','P06','P09'],'Entry and P03 actions remain clickable at three viewports',async({p,a,home,shot})=>{
  const metrics=[];
  for(const [width,height]of [[494,950],[360,800],[1440,900]]){
   await p.setViewportSize({width,height});
   for(const [operation,target]of [['inbound','p04'],['outbound','p05'],['lookup','p06'],['warranty','p09']]){
    await p.click('[data-tab=lookup]');
    const button=p.locator(`[data-p03-operation=${operation}]`);
    metrics.push(await button.evaluate(e=>{const r=e.getBoundingClientRect();return {action:e.dataset.p03Operation,viewport:[innerWidth,innerHeight],centerClickable:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),closePosition:getComputedStyle(document.querySelector('.p03-close')).position};}));
    assert.equal(metrics.at(-1).centerClickable,true);
    if(operation==='inbound')await shot(width+'-picker');
    await button.click();await p.locator('.'+target+'-app').waitFor();await a(target,'back').click();await p.locator('#hn-home:not([hidden])').waitFor();
   }
  }
  return metrics;
 });
 await test('J02',['P04','P08','P12','P24'],'Verified stock receipt shares history and document identity; Back/Forward retain result',async({p,a,snap,shot})=>{
  await p.click('.hn-task[data-route=inbound]');await a('p04','next').click();await a('p04','manual').click();
  await p.fill('#p04-code','HN12345');await p.locator('#p04-code').press('Enter');await a('p04','close-manual').click();await a('p04','next').click();
  await a('p04','send').dblclick();await p.locator('[data-panel="P04.S04"]').waitFor();
  const done=await snap('p04'),id=done.document.documentId;
  assert.equal(done.metrics.recordCalls,1);assert.equal(done.metrics.inventoryDelta,0);
  await a('p04','history').click();await p.fill('#p08-search',done.document.number);
  await p.locator(`[data-p08-record="receipt:${id}"]`).click();
  assert.match(await p.locator('.p08-detail-document').innerText(),new RegExp(done.document.number));
  await shot('receipt-history');
  for(const [width,height]of [[360,800],[1440,900],[494,950]]){
   await p.setViewportSize({width,height});assert.equal(await p.locator('.p08-scroll').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);await shot(width+'-detail');
  }
  await a('p08','document').click();await p.locator('.p12-app').waitFor();assert.equal(new URL(p.url()).hash.includes('doc='+encodeURIComponent(id)),true);
  await a('p12','back').click();await p.locator('.p08-app').waitFor();assert.equal(await a('p08','document').evaluate(e=>e===document.activeElement),true);
  await a('p08','back').click();assert.equal(await p.inputValue('#p08-search'),done.document.number);
  await a('p08','back').click();await p.locator('[data-panel="P04.S04"]').waitFor();assert.equal((await snap('p04')).document.documentId,id);
  await p.goForward();await p.locator('#p08-search').waitFor();await p.goBack();await p.locator('[data-panel="P04.S04"]').waitFor();
  assert.equal((await snap('p04')).metrics.recordCalls,1);
  return {documentId:id,historyId:'receipt:'+id,recordCalls:1,inventoryDelta:0};
 });
 await test('J03',['P02','P08','P12','P18'],'History explicit B08 mapping opens document and real PDF; caller tab/filter/focus restored',async({p,a,hub,shot})=>{
  await hub('history-general');await p.fill('#p08-search','LS-0001');await p.click('[data-p08-record="LS-0001"]');
  await a('p08','document').click();await p.locator('.p12-app').waitFor();assert.match(p.url(),/doc=fixture-inbound-0005/);
  await a('p12','back').click();await p.click('[data-p08-tab=attachments]');await a('p08','attachments').click();
  await p.locator('.p18-app').waitFor();assert.match(p.url(),/doc=fixture-inbound-0005/);await a('p18','view').click();
  await p.locator('.p18-app canvas').first().waitFor();
  await p.waitForFunction(()=>{const c=document.querySelector('.p18-app canvas');if(!c?.width||!c.height)return false;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let ink=0;for(let i=0;i<d.length;i+=4)if(d[i+3]&&(d[i]<240||d[i+1]<240||d[i+2]<240))ink++;return ink>100;});
  const nonblank=await p.locator('.p18-app canvas').first().evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let ink=0;for(let i=0;i<d.length;i+=4)if(d[i+3]&&(d[i]<240||d[i+1]<240||d[i+2]<240))ink++;return ink>100;});
  assert.equal(nonblank,true);await shot('pdf');
  await a('p18','back').click();await a('p18','back').click();await p.locator('.p08-app').waitFor();
  assert.equal(await p.locator('[data-p08-tab=attachments]').getAttribute('aria-selected'),'true');assert.equal(await a('p08','attachments').evaluate(e=>e===document.activeElement),true);
  await a('p08','back').click();assert.equal(await p.inputValue('#p08-search'),'LS-0001');
  return {documentId:'fixture-inbound-0005',recordId:'LS-0001',pdfNonblank:nonblank};
 });
 await test('J04',['P08','P22','P23'],'History missing/invalid IDs never choose first record; legacy session stays B08',async({p,a,hub,shot})=>{
  await hub('history-general');await p.fill('#p08-search','LS-0001');await p.click('[data-p08-record="LS-0001"]');await a('p08','session').click();
  const counts=await p.locator('.p08-counters strong').allTextContents();assert.equal(counts[0],'19');await shot('legacy-session');
  for(const hash of ['#p02/history-list?panel=2','#p02/history-list?panel=2&record=bad','#p02/history-list?panel=3','#p02/history-list?panel=3&session=bad']){
   await p.evaluate(hash=>location.hash=hash,hash);await p.waitForFunction(hash=>location.hash===hash,hash);await p.locator('.p08-state strong').filter({hasText:'Không tìm thấy'}).waitFor();
   assert.equal(await p.locator('.p08-detail-hero,.p08-summary').count(),0);
  }
  await hub('nfc');await p.locator('.p22-app').waitFor();assert.match(await p.locator('.p22-app').innerText(),/Chưa có|chưa khả dụng/);
  await a('p22','back').click();await hub('sessions');await p.locator('.p23-app').waitFor();assert.match(await p.locator('.p23-app').innerText(),/Chưa có|chưa khả dụng/);
  return {legacyScanCount:counts[0],missingAndInvalidCases:4,defaultEventSources:'unavailable, not fabricated'};
 });
 await test('J05',['P01','P02','P12'],'Refresh reauth gate and logout Back do not reveal old documents',async({p,a,login,shot})=>{
  await p.click('[data-home-documents]');await p.locator('.p12-app').waitFor();await p.locator('[data-p12-doc]').first().click();const hash=new URL(p.url()).hash;
  await p.reload();await p.locator('#login-form').waitFor();assert.equal(await p.locator('.p12-app').count(),0);
  await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.locator('#hn-home:not([hidden])').waitFor();
  await p.click('[data-tab=documents]');await p.locator('.p12-app').waitFor();
  await p.locator('.hn-tools > details > summary').first().click();await p.click('#hn-logout');await p.locator('#login-form').waitFor();await p.goBack();
  assert.equal(await p.locator('.p12-app,.p08-app,.p19-app').count(),0);assert.equal(await p.locator('#login-form').isVisible(),true);
  return {preRefreshHash:hash,refresh:'reauth required; page-memory receipt not durable',logout:'no authenticated DOM'};
 });
 await test('J06',['P04','P15','P17','P24'],'UNKNOWN stock write only checks same request, no duplicate record',async({p,a,snap,shot})=>{
  await p.click('.hn-task[data-route=inbound]');await a('p04','next').click();await a('p04','manual').click();await p.fill('#p04-code','HN12345');await p.locator('#p04-code').press('Enter');await a('p04','close-manual').click();await a('p04','next').click();
  await p.locator('.p04-tools').evaluate(e=>e.open=true);await p.selectOption('[data-p04-outcome]','timeout-recorded');await a('p04','send').dblclick();await p.locator('[data-panel="P17.S04"]').waitFor();
  const unknown=await snap('p04');assert.equal(await a('p04','send').isDisabled(),true);assert.equal(unknown.metrics.recordCalls,1);await shot('unknown');
  await a('p04','check').click();await p.locator('[data-panel="P04.S04"]').waitFor();const done=await snap('p04');assert.deepEqual(done.request,unknown.request);assert.equal(done.metrics.recordCalls,1);assert.equal(done.metrics.inventoryDelta,0);
  return {requestId:done.request.id,recordCalls:done.metrics.recordCalls,inventoryDelta:0};
 });
 await test('J07',['P09','P19','P20'],'Entry warranty to component Post and shared case/history',async({p,a,snap,shot})=>{
  await p.click('.hn-task[data-route=warranty]');await p.locator('[data-p09-case="BH-001"]').click();await p.click('[data-p09-tab=parts]');await a('p09','issue').click();await p.locator('.p19-app').waitFor();
  await p.click('[data-scan-action=manual]');await p.fill('#p19-code','LK0001-HN001');await p.locator('#p19-manual-form button[type=submit]').click();await a('p19','review').click();await a('p19','post').dblclick();await p.locator('[data-panel="P19.S04"]').waitFor();
  const s=await snap('p19');assert.equal(s.metrics.commits,1);assert.equal(s.receipt.caseId,'BH-001');await shot('posted');
  await a('p19','case').click();await p.locator('.p09-app').waitFor();assert.ok((await p.locator('.p09-app').innerText()).includes(s.receipt.id));
  await a('p09','component-history').click();await p.locator('.p20-app').waitFor();assert.ok((await p.locator('.p20-app').innerText()).includes(s.receipt.id));
  await a('p20','back').click();await p.locator('.p09-app').waitFor();assert.match(p.url(),/case=BH-001/);
  return {caseId:'BH-001',receiptId:s.receipt.id,commits:s.metrics.commits};
 });
 await test('J08',['P03','P04','P14'],'Legacy P03 draft cannot masquerade as a verified live owner',async({p,a,snap,shot})=>{
  await p.locator('.p03-tools summary').click();await p.click('[data-p03-open=local]');const before=await snap('p03');await p.click('[data-p03-action=resume]');await p.locator('.hn-action-dialog[open]').waitFor();
  assert.match(await p.locator('.hn-action-dialog[open]').innerText(),/chưa được kết nối/);assert.equal(await p.locator('.p04-app').count(),0);assert.deepEqual((await snap('p03')).document,before.document);await shot('unmapped-legacy-draft');
  return {documentId:before.document.documentId,dependency:'P03 legacy draft has no matching P04 owner; retained and blocked'};
 });
 await test('J09',['P09','P20','P23','P24'],'Closed case read-only history and timeline use the same case identity',async({p,a,shot})=>{
  await p.click('.hn-task[data-route=warranty]');await p.click('[data-p09-case="BH-002"]');await p.click('[data-p09-tab=parts]');await a('p09','component-history').click();await p.locator('.p24-closed-note').waitFor();
  assert.equal(await a('p20','issue').isDisabled(),true);await a('p20','timeline').click();await p.locator('.p23-app').waitFor();assert.match(p.url(),/case=BH-002/);await shot('closed-timeline');await p.goBack();await p.locator('.p24-closed-note').waitFor();
  return {caseId:'BH-002',readOnly:true};
 });
 await test('J10',['P05','P08','P12','P17','P24'],'Outbound record and UNKNOWN reconciliation share receipt identity without Post',async({p,a,snap,shot})=>{
  async function prepare(){await p.click('.hn-task[data-route=outbound]');await address(p);await p.fill('[data-p05-field=planned]','10');await a('p05','next').click();await p.locator('.p05-tools').evaluate(e=>e.open=true);await a('p05','batch').click();await a('p05','manual').click();for(const code of ['HN12352','HN12353','HN12354']){await p.fill('#p05-code',code);await p.locator('#p05-code').press('Enter');}await a('p05','close-manual').click();await a('p05','next').click();}
  await prepare();await a('p05','send').dblclick();await p.locator('[data-panel="P05.S04"]').waitFor();const done=await snap('p05');
  assert.equal(done.metrics.recordCalls,1);assert.equal(done.metrics.inventoryDelta,0);await a('p05','history').click();await p.click(`[data-p08-record="receipt:${done.document.documentId}"]`);await a('p08','document').click();await p.locator('.p12-app').waitFor();assert.ok(p.url().includes(encodeURIComponent(done.document.documentId)));await a('p12','back').click();await a('p08','back').click();await a('p08','back').click();await a('p05','home').click();
  await prepare();await p.selectOption('[data-p05-outcome]','timeout-recorded');await a('p05','send').dblclick();await p.locator('[data-panel="P17.S04"]').waitFor();const unknown=await snap('p05');assert.equal(await a('p05','send').isDisabled(),true);await shot('outbound-unknown');await a('p05','check').click();await p.locator('[data-panel="P05.S04"]').waitFor();const checked=await snap('p05');assert.deepEqual(checked.request,unknown.request);assert.equal(checked.metrics.recordCalls,unknown.metrics.recordCalls);assert.equal(checked.metrics.inventoryDelta,0);
  return {firstDocumentId:done.document.documentId,secondDocumentId:checked.document.documentId,inventoryDelta:0};
 });
 await test('J11',['P09','P19','P21'],'Live component draft resumes exact document/session/version through P21',async({p,a,snap,shot})=>{
  await p.click('.hn-task[data-route=warranty]');await p.click('[data-p09-case="BH-001"]');await p.click('[data-p09-tab=parts]');await a('p09','issue').click();await p.click('[data-scan-action=manual]');await p.fill('#p19-code','LK0001-HN001');await p.locator('#p19-manual-form button[type=submit]').click();const before=await snap('p19');
  await a('p19','back').click();await p.locator('.p21-app').waitFor();await p.waitForFunction(()=>{const button=document.querySelector('[data-p21=scan]');return button&&!button.disabled;});await a('p21','scan').click();await p.locator('.p19-app:not(.p21-app)').waitFor();const after=await snap('p19');assert.equal(after.document.documentId,before.document.documentId);assert.equal(after.scanSessionId,before.scanSessionId);assert.equal(after.document.version,before.document.version);assert.deepEqual(after.lines,before.lines);assert.equal(after.metrics.commits,0);await shot('resumed');
  return {documentId:after.document.documentId,scanSessionId:after.scanSessionId,version:after.document.version,commits:0};
 });
 await test('J12',['P03','P04','P05','P14'],'P03 and P14 share live stock owners; resume/save/cancel/discard retain exact identity',async({p,a,snap,shot,login})=>{
  const results=[];
  for(const [operation,board] of [['inbound','p04'],['outbound','p05']]){
   if(operation==='outbound')await login();
   await p.click(`.hn-task[data-route=${operation}]`);
   if(operation==='outbound'){await address(p);await p.fill('[data-p05-field=planned]','2');}
   await a(board,'next').click();await a(board,'manual').click();await p.fill(`#${board}-code`,'HN12345');await p.locator(`#${board}-code`).press('Enter');await a(board,'close-manual').click();
   const before=await snap(board);assert.equal(before.accepted.length,1);
   await p.goBack();await p.locator('#hn-home:not([hidden])').waitFor();await p.click('[data-tab=lookup]');await p.locator('[data-panel="P03.S02"]').waitFor();
   const projected=(await snap('p03')).document;assert.equal(projected.documentId,before.document.documentId);assert.equal(projected.ownerBacked,true);
   await p.click('[data-p03-action=discard]');await p.click('[data-p03-action=cancel]');assert.deepEqual((await snap('p03')).document,projected);
   await p.click('[data-p03-action=resume]');await p.locator(`.${board}-app`).waitFor();const resumed=await snap(board);
   for(const key of ['document','accepted','attempts','request','recorded'])assert.deepEqual(resumed[key],before[key]);
   assert.equal(resumed.metrics.recordCalls,0);await shot(operation+'-resumed');
   await p.evaluate(()=>location.hash='#p02/shift');await p.locator('[data-panel="P14.S03"]').waitFor();
   assert.equal(await p.locator(`[data-p14=continue][data-document="${before.document.documentId}"]`).count(),1);
   await p.locator(`[data-p14=continue][data-document="${before.document.documentId}"]`).click();await p.locator(`.${board}-app`).waitFor();assert.deepEqual((await snap(board)).accepted,before.accepted);
   await p.evaluate(()=>location.hash='#home');await p.locator('#hn-home:not([hidden])').waitFor();await p.click('[data-tab=lookup]');await p.click('[data-p03-action=save]');
   await p.locator('.hn-action-dialog[open]').waitFor();assert.match(await p.locator('.hn-action-dialog[open]').innerText(),/bộ nhớ fixture/);await p.keyboard.press('Escape');await p.locator('.app-modal-host').waitFor({state:'detached'});
   await p.locator(`[data-resume-document="${before.document.documentId}"]`).click();await p.locator(`.${board}-app`).waitFor();assert.deepEqual((await snap(board)).accepted,before.accepted);
   await a(board,'manual').click();await p.fill(`#${board}-code`,'HN12352');await p.locator(`#${board}-code`).press('Enter');await a(board,'close-manual').click();assert.equal((await snap(board)).accepted.length,2);
   await p.evaluate(()=>location.hash='#home');await p.locator('#hn-home:not([hidden])').waitFor();await p.click('[data-tab=lookup]');await p.click('[data-p03-action=discard]');await p.click('[data-p03-action=confirmDiscard]');
   await p.locator('.hn-action-dialog[open]').waitFor();await p.keyboard.press('Escape');await p.locator('.app-modal-host').waitFor({state:'detached'});
   assert.equal(await p.locator(`[data-resume-document="${before.document.documentId}"]`).count(),0);
   await p.click(`.hn-task[data-route=${operation}]`);await p.locator(`.${board}-app`).waitFor();const fresh=await snap(board);assert.notEqual(fresh.document.documentId,before.document.documentId);assert.deepEqual(fresh.accepted,[]);assert.equal(fresh.metrics.recordCalls,0);
   results.push({operation,documentId:before.document.documentId,scanSessionId:before.document.scanSessionId,recordCalls:0,inventoryDelta:fresh.metrics.inventoryDelta});
  }
  return results;
 });
 }finally{await browser.close();}
 process.exitCode=checks.some(c=>c.status!=='PASS')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
