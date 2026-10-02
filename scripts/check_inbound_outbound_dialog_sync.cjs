const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {mockGeography,choose,address}=require('./outbound_geography_helpers.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.DIALOG_SYNC_EVIDENCE_DIR||'handoff/dialog-sync-2026-09-28/p04-p05');fs.mkdirSync(out,{recursive:true});
const sizes=[[340,420],[390,844],[494,1000],[768,1024],[1440,1000],[1869,940]];
(async()=>{
 const browser=await chromium.launch({headless:true}),checks=[],layouts=[],errors=[];let page;
 const check=async(name,run)=>{await run();checks.push({name,status:'PASS'});console.log('PASS '+name);};
 try{
 for(const [p,route] of [['p04','inbound'],['p05','outbound']].filter(([id])=>!process.env.DIALOG_SYNC_MODULE||id===process.env.DIALOG_SYNC_MODULE)){
  page=await browser.newPage({viewport:{width:494,height:1000}});page.on('pageerror',e=>errors.push(e.message));await mockGeography(page);
  const act=n=>page.locator(`[data-${p}="${n}"]`).first(),snap=async()=>JSON.parse(await page.locator(`[data-${p}-snapshot]`).textContent()),dialog=()=>page.locator('.hn-action-dialog[open]');
  const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  async function close(label='Đã hiểu'){await dialog().getByRole('button',{name:label,exact:true}).click();await dialog().waitFor({state:'detached'});await page.waitForFunction(()=>!Object.keys(history.state||{}).some(k=>k.includes('Feedback')));}
  async function shot(name){await page.locator('.hn-screen').screenshot({path:path.join(out,`${p}-${name}.png`)});}
  async function dimensions(label,{short=false,modal=false}={}){
   for(const [width,height]of sizes){
    await page.setViewportSize({width,height});await settle();await page.evaluate(()=>scrollTo(0,0));
    const before=await page.evaluate(p=>{const s=document.querySelector('.hn-screen'),r=s.getBoundingClientRect(),v=document.querySelector(`.${p}-scroll`),f=document.querySelector(`.${p}-footer`).getBoundingClientRect(),h=document.querySelector(`.${p}-header`).getBoundingClientRect(),d=document.querySelector('.hn-action-dialog[open]')?.getBoundingClientRect();return{size:[s.offsetWidth,s.offsetHeight],height:v.clientHeight,scrollHeight:v.scrollHeight,scrollTop:v.scrollTop,overflow:document.documentElement.scrollWidth>innerWidth,footer:[f.top,f.bottom],header:[h.top,h.bottom],bounds:[r.left,r.top,r.right,r.bottom],dialog:d&&[d.left,d.top,d.right,d.bottom],focusInDialog:d?document.querySelector('.hn-action-dialog').contains(document.activeElement):null};},p);
    assert.deepEqual(before.size,[494,950]);assert.equal(before.overflow,false);assert.ok(before.footer[1]<=before.bounds[3]+1);
    if(short)assert.ok(before.scrollHeight<=before.height+1,`${p} ${label} ${width}x${height}: redundant scroll ${before.scrollHeight}/${before.height}`);
    if(modal){assert.equal(before.focusInDialog,true);assert.ok(before.dialog[0]>=before.bounds[0]&&before.dialog[1]>=before.bounds[1]&&before.dialog[2]<=before.bounds[2]+1&&before.dialog[3]<=before.bounds[3]+1);}
    await page.locator(modal?'.hn-action-dialog[open] .app-modal-heading':`.${p}-scroll`).hover();await page.mouse.wheel(0,640);await page.waitForTimeout(100);
    const after=await page.evaluate(p=>{const v=document.querySelector(`.${p}-scroll`),f=document.querySelector(`.${p}-footer`).getBoundingClientRect(),h=document.querySelector(`.${p}-header`).getBoundingClientRect();return{scrollTop:v.scrollTop,footer:[f.top,f.bottom],header:[h.top,h.bottom]};},p);
    assert.deepEqual(after.footer,before.footer);assert.deepEqual(after.header,before.header);if(short||modal)assert.equal(after.scrollTop,before.scrollTop);
    layouts.push({p,label,viewport:[width,height],...before,after});await shot(`${label}-${width}x${height}`);
    if(!modal)await page.locator(`.${p}-scroll`).evaluate(e=>e.scrollTop=0);
   }
   await page.setViewportSize({width:494,height:1000});await settle();
  }
  await page.goto((process.env.DIALOG_SYNC_BASE||'http://127.0.0.1:8766')+'/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator(`.hn-task[data-route="${route}"]`).click();
  await check(`${p}: S01 shell/scroll across six viewports`,async()=>dimensions('S01'));
  if(p==='p05'){
   await check('p05: source confirmation cancel, backdrop, Escape and native Back keep metadata unchanged',async()=>{
    const original=(await snap()).document;await choose(page,'source','board-0005');await dialog().waitFor();assert.equal(await page.locator('.app-modal-host').count(),1);assert.equal((await snap()).document.sourceId,original.sourceId);assert.equal(await dialog().getByRole('button',{name:'Hủy',exact:true}).evaluate(e=>e===document.activeElement),true);
    await page.locator('.app-modal-host').click({position:{x:3,y:3}});assert.equal(await dialog().count(),1);await page.keyboard.press('Tab');await page.keyboard.press('Tab');assert.equal(await dialog().getByRole('button',{name:'Hủy',exact:true}).evaluate(e=>e===document.activeElement),true);
    await dimensions('source-confirm',{modal:true});await close('Hủy');assert.deepEqual((await snap()).document,original);
    await choose(page,'source','board-0005');await dialog().waitFor();await page.keyboard.press('Escape');await page.waitForFunction(()=>!Object.keys(history.state||{}).some(k=>k.includes('Feedback')));assert.deepEqual((await snap()).document,original);
    await choose(page,'source','board-0005');await dialog().waitFor();const url=page.url();await page.goBack();await dialog().waitFor({state:'detached'});assert.equal(page.url(),url);assert.deepEqual((await snap()).document,original);assert.equal(await page.locator('[data-panel="P05.S01"]').count(),1);
   });
   await check('p05: source confirmation applies once with Enter and preserves changed source',async()=>{await choose(page,'source','board-0005');await dialog().waitFor();await dialog().getByRole('button',{name:'Đổi phiếu',exact:true}).focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>JSON.parse(document.querySelector('[data-p05-snapshot]').textContent).document.sourceId==='board-0005');assert.equal((await snap()).document.planned,10);await choose(page,'source','new');await close('Đổi phiếu');await page.waitForFunction(()=>JSON.parse(document.querySelector('[data-p05-snapshot]').textContent).document.sourceId==='new');assert.equal((await snap()).document.planned,1);});
   await check('p05: required metadata remains inline with focus; no action dialog',async()=>{await act('next').click();assert.equal(await dialog().count(),0);assert.equal(await page.locator('[data-p05-select="province"]').getAttribute('aria-invalid'),'true');await address(page);});
  }
  await page.locator(`[data-${p}-note]`).fill('Ghi chú được giữ nguyên trong lượt gửi.');await act('next').click();await act('manual').click();
  await check(`${p}: blank/invalid/duplicate validation stays at field; accepted scan uses persistent counters`,async()=>{
   const code=page.locator(`#${p}-code`);await code.fill(' ');await code.press('Enter');assert.equal((await snap()).attempts.length,0);assert.equal(await code.getAttribute('aria-invalid'),'true');assert.equal(await dialog().count(),0);
   await code.fill('wrong-code');await code.press('Enter');assert.equal(await code.getAttribute('aria-invalid'),'true');assert.equal(await dialog().count(),0);
   await code.fill('HN12345');await code.press('Enter');assert.equal(await code.inputValue(),'');assert.equal((await snap()).accepted.length,1);assert.doesNotMatch(await page.locator(`#${p}-error-code`).textContent(),/Đã thêm/);
   await code.fill('HN12345');await code.press('Enter');assert.equal((await snap()).accepted.length,1);assert.match(await page.locator(`#${p}-error-code`).textContent(),/Không cộng thêm/);assert.equal(await dialog().count(),0);assert.equal(await page.locator(`.${p}-feedback`).count(),0);
  });
  if(p==='p05')await check('p05: blocked product retains contextual P17.S02 panel',async()=>{await page.fill('#p05-code','HN99999');await page.locator('#p05-code').press('Enter');await page.locator('[data-panel="P17.S02"]').waitFor();assert.equal(await dialog().count(),0);await act('exception-back').click();assert.equal((await snap()).accepted.length,1);});
  await check(`${p}: S02 scroll retains fixed header/footer at six viewports`,async()=>dimensions('S02'));
  await act('next').click();await check(`${p}: S03 content scroll keeps header/footer at six viewports`,async()=>dimensions('S03'));
  await page.locator(`.${p}-tools summary`).click();await page.selectOption(`[data-${p}-outcome]`,'failed');await act('send').click();
  await check(`${p}: rejected send shows scoped dialog, keeps request and restores focus`,async()=>{
   await dialog().waitFor();assert.match(await dialog().textContent(),/chưa được ghi nhận/);const s=await snap();assert.ok(s.request);assert.equal(s.metrics.recordCalls,1);assert.equal(s.recorded,false);assert.equal(await page.locator(`.${p}-feedback`).count(),0);assert.equal(await page.locator('.app-modal-host').count(),1);await shot('rejected');await close();assert.equal(await act('send').evaluate(e=>e===document.activeElement),true);assert.deepEqual((await snap()).request,s.request);
  });
  await page.selectOption(`[data-${p}-outcome]`,'timeout-recorded');await act('send').click();
  await check(`${p}: UNKNOWN dialog and delayed reconciliation preserve exact request; no retry`,async()=>{
   await dialog().waitFor();assert.match(await dialog().textContent(),/Chưa xác định/);const s=await snap();assert.equal(s.metrics.recordCalls,2);assert.equal(await act('send').isDisabled(),true);await dimensions('unknown',{modal:true});await close('Để sau');assert.equal((await snap()).metrics.recordCalls,2);assert.equal(await act('send').isDisabled(),true);assert.deepEqual((await snap()).request,s.request);
   await act('status-dependency').click();await dialog().waitFor();await shot('dependency');await close();await act('check').click();await page.locator(`[data-panel="${p.toUpperCase()}.S04"]`).waitFor();assert.equal((await snap()).metrics.recordCalls,2);assert.deepEqual((await snap()).request,s.request);assert.equal(await dialog().count(),0);
  });
  await check(`${p}: S04 short result fits naturally; wheel cannot move content at six viewports`,async()=>dimensions('S04',{short:true}));
  await check(`${p}: document opens P12 by verified ID and Back preserves exact result`,async()=>{
   const before=await snap();await act('document').click();await page.locator('.p12-info').waitFor();assert.ok(page.url().includes(encodeURIComponent(before.document.documentId)));await shot('document');await page.goBack();await page.locator(`[data-panel="${p.toUpperCase()}.S04"]`).waitFor();assert.deepEqual((await snap()).document,before.document);await act('home').click();await page.locator(`.hn-task[data-route="${route}"]`).click();assert.equal((await snap()).request,null);assert.equal((await snap()).attempts.length,0);assert.equal(await dialog().count(),0);
  });
  await check(`${p}: dialog Đối chiếu resolves UNKNOWN without another send`,async()=>{
   if(p==='p05'){await choose(page,'recipient','walk-in');await page.fill('[data-p05-field="recipient"]','Người nhận có tên rất dài '.repeat(9));await page.fill('[data-p05-field="phone"]','0901234567');await address(page);}
   const note='Ghi chú dài\n'.repeat(16);await page.locator(`[data-${p}-note]`).fill(note);await act('next').click();await act('manual').click();await page.fill(`#${p}-code`,'HN12345');await page.locator(`#${p}-code`).press('Enter');await act('next').click();
   const noteMetrics=await page.locator(`.${p}-scroll`).evaluate((el,p)=>{el.scrollTop=el.scrollHeight;const r=el.getBoundingClientRect(),n=el.querySelector(`.${p}-saved-note`);return{height:el.clientHeight,scrollHeight:el.scrollHeight,note:n.textContent,noteBottom:n.getBoundingClientRect().bottom,bottom:r.bottom};},p);assert.ok(noteMetrics.scrollHeight>noteMetrics.height);assert.match(noteMetrics.note,/Ghi chú dài/);assert.ok(noteMetrics.noteBottom<=noteMetrics.bottom+1);await shot('long-note');await page.selectOption(`[data-${p}-outcome]`,'timeout-recorded');await act('send').click();await dialog().waitFor();const s=await snap();await close('Đối chiếu');await page.locator(`[data-panel="${p.toUpperCase()}.S04"]`).waitFor();assert.equal((await snap()).metrics.recordCalls,s.metrics.recordCalls);assert.deepEqual((await snap()).request,s.request);assert.equal(await dialog().count(),0);
  });
  if(p==='p05')await check('p05: long recipient remains fully readable with legitimate internal scroll',async()=>{
   const m=await page.locator('.p05-scroll').evaluate(el=>{el.scrollTop=el.scrollHeight;const r=el.getBoundingClientRect(),last=el.querySelector('.p05-content').lastElementChild.getBoundingClientRect();return{height:el.clientHeight,scrollHeight:el.scrollHeight,bottom:r.bottom,lastBottom:last.bottom};});assert.ok(m.scrollHeight>m.height);assert.ok(m.lastBottom<=m.bottom+1);assert.equal((await snap()).document.recipient,'Người nhận có tên rất dài '.repeat(9));await shot('long-result');
  });
  await page.close();page=null;
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({checks,layouts,errors},null,2));console.log(JSON.stringify({groups:checks.length,layouts:layouts.length,errors}));
 }catch(e){if(page)await page.screenshot({path:path.join(out,'failure.png'),fullPage:true});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,layouts,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}
})();
