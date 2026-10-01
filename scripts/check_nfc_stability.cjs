const auditOrigin=process.env.PREVIEW_ORIGIN||'http://127.0.0.1:8766';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.NFC_STABILITY_EVIDENCE_DIR||'handoff/P07/evidence/revision-11/stability');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const act=n=>page.locator(`[data-p07="${n}"]`).first(),snap=()=>page.locator('[data-p07-snapshot]').evaluate(e=>JSON.parse(e.textContent));
 const check=async(name,fn)=>{await fn();checks.push(name);console.log('PASS '+name);};
 const read=async()=>{await page.click('[data-p07-demo-read]');await page.waitForFunction(()=>!JSON.parse(document.querySelector('[data-p07-snapshot]').textContent).busy);};
 const feedback=()=>page.locator('.hn-action-dialog[open]');
 const closeFeedback=async(cancel=false)=>{await page.locator(`[data-action-dialog="${cancel?'cancel':'confirm'}"]`).click();await feedback().waitFor({state:'detached'});await page.waitForFunction(()=>!history.state?.hnP07Feedback);};
 try{
 await page.goto(auditOrigin+'/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.click('[data-route="nfc"]');
 await check('Vietnamese composition keeps the input node until committed; uppercase search works',async()=>{
  const intact=await page.locator('#p07-search').evaluate(e=>{e.focus();e.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));e.value='ĐẦU IN';e.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}));const intact=e.isConnected;e.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}));return intact;});
  assert.equal(intact,true);assert.equal(await page.locator('.p07-tag').count(),1);assert.equal(await page.locator('#p07-search').inputValue(),'ĐẦU IN');await page.fill('#p07-search','');
 });
 await check('Denied clipboard reports once, supports retry, stays inside the dialog',async()=>{
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));
  await page.click('[data-p07-tag="fixture-tag-002"]');
  for(let i=0;i<3;i++){await act('copy').click();assert.match(await feedback().textContent(),/Không thể/);assert.equal(await page.locator('.app-modal-host').count(),1);await closeFeedback();await page.locator('#p07-detail-title').waitFor();}
  assert.equal(await page.locator('[data-p07-copy-feedback]').count(),0);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{}}}));await act('copy').click();assert.match(await feedback().textContent(),/Đã sao chép/);
  await page.screenshot({path:path.join(out,'copy-feedback.png')});await closeFeedback();await page.locator('#p07-detail-title').waitFor();await page.keyboard.press('Escape');assert.equal(await page.locator('[data-p07-tag="fixture-tag-002"]').evaluate(e=>document.activeElement===e),true);
 });
 await check('Read disables product selection and list navigation is not stolen by late confirmation',async()=>{
  await act('begin').click();await page.click('[data-p07-demo-read]');assert.equal(await act('product').isDisabled(),true);await page.waitForFunction(()=>!JSON.parse(document.querySelector('[data-p07-snapshot]').textContent).busy);assert.equal(await act('product').isDisabled(),false);
  await act('next').click();await act('confirm').click();await page.evaluate(()=>location.hash='#p02/nfc');await page.waitForFunction(()=>!JSON.parse(document.querySelector('[data-p07-snapshot]').textContent).busy);
  assert.equal((await snap()).panel,1);assert.equal((await snap()).stats.mutations,1);assert.equal(await page.locator('[data-panel="P07.S01"]').count(),1);
 });
 await check('UNKNOWN can reconcile with warehouse stopped; request is unchanged',async()=>{
  await act('begin').click();await page.locator('.p07-tools>details>summary').click();await page.selectOption('[data-p07-scenario]','unknown');await read();await act('next').click();await act('confirm').click();await page.waitForFunction(()=>JSON.parse(document.querySelector('[data-p07-snapshot]').textContent).unknown);const request=(await snap()).request;
  await closeFeedback(true);
  await page.locator('.p03-tools summary').click();await page.selectOption('[data-p03-fixture="warehouse"]','stopped');
  // Re-enter same verification panel to exercise its disabled state after rerender.
  await page.evaluate(()=>location.hash='#p02/nfc');await act('begin').click();assert.equal(await act('reconcile').isDisabled(),false);await act('reconcile').click();await page.locator('[data-panel="P07.S04"]').waitFor();assert.equal((await snap()).receipt.requestId,request.requestId);
  await page.selectOption('[data-p03-fixture="warehouse"]','active');
 });
 await check('New error uses a dialog and retains long-content scroll; no horizontal overflow',async()=>{
  await act('new-link').click();await page.selectOption('[data-p07-scenario]','permission');const stress=await page.addStyleTag({content:'#home-app [data-panel="P07.S02"] .p07-touch{min-height:1100px}'});await page.locator('.p07-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);const top=await page.locator('.p07-scroll').evaluate(e=>e.scrollTop);await read();
  assert.ok(top>0);assert.equal(await page.locator('.p07-scroll').evaluate(e=>e.scrollTop),top);assert.match(await feedback().textContent(),/từ chối/);assert.equal(await page.locator('.p07-feedback').count(),0);
  for(const [width,height]of [[494,1000],[360,800],[340,420],[1869,940]]){await page.setViewportSize({width,height});assert.equal(await page.locator('.p07-scroll').evaluate(e=>e.scrollWidth>e.clientWidth),false);}
  await stress.evaluate(e=>e.remove());
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}
})();
