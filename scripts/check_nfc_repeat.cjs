const auditOrigin=process.env.PREVIEW_ORIGIN||'http://127.0.0.1:8766';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.NFC_REPEAT_EVIDENCE_DIR||'handoff/P07/evidence/revision-04/repeat');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1869,height:940},deviceScaleFactor:1});const checks=[],metrics=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const act=n=>page.locator(`[data-p07="${n}"]`).first(),snap=async()=>JSON.parse(await page.locator('[data-p07-snapshot]').textContent());
 const feedback=()=>page.locator('.hn-action-dialog[open]');
 async function closeFeedback(cancel=false){await page.locator('[data-action-dialog="'+(cancel?'cancel':'confirm')+'"]').click();await feedback().waitFor({state:'detached'});await page.waitForFunction(()=>!history.state?.hnP07Feedback);}
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function login(){await page.goto(auditOrigin+'/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.click('[data-route="nfc"]');await page.locator('.p07-app').waitFor();}
 async function read(){await page.click('[data-p07-demo-read]');await page.waitForFunction(()=>!JSON.parse(document.querySelector('[data-p07-snapshot]').textContent).busy);}
 async function capture(name){await page.evaluate(()=>scrollTo(0,0));const m=await page.evaluate(()=>{
  const app=document.querySelector('.p07-app'),sc=app.querySelector('.p07-scroll'),dd=[...app.querySelectorAll('.p07-summary dd')],dt=[...app.querySelectorAll('.p07-summary dt')],tools=document.querySelector('.hn-tools');
  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
  return {viewport:[innerWidth,innerHeight],values:dd.map(rect),labels:dt.map(rect),scrollOverflow:sc.scrollWidth>sc.clientWidth,toolsOverflow:tools.scrollWidth>tools.clientWidth,scrollbar:getComputedStyle(sc).scrollbarWidth,summaryBottom:app.querySelector('.p07-summary')?.getBoundingClientRect().bottom,scrollBottom:sc.getBoundingClientRect().bottom,copy:app.querySelector('.p07-summary .p07-copy')?rect(app.querySelector('.p07-summary .p07-copy')):null};
 });assert.equal(m.scrollOverflow,false);assert.equal(m.toolsOverflow,false);assert.equal(m.scrollbar,'none');
 if(m.values.length){assert.ok(Math.max(...m.values.map(r=>r.x))-Math.min(...m.values.map(r=>r.x))<.5);assert.ok(Math.max(...m.labels.map(r=>r.x))-Math.min(...m.labels.map(r=>r.x))<.5);assert.ok(m.copy.x+m.copy.w<=m.values[0].x+m.values[0].w+1);}
 metrics.push({name,...m});await page.screenshot({path:path.join(out,name+'.png')});}
 try{
 await login();await act('begin').click();
 await check('five codes visible; switching code invalidates previous read',async()=>{
  assert.equal(await page.locator('[data-p07-read-tag] option').count(),5);await read();assert.equal((await snap()).read.uid,'NFC-8A2F');
  await page.selectOption('[data-p07-read-tag]','NFC-DEMO-020');assert.equal((await snap()).read,null);assert.equal(await act('next').isDisabled(),true);await page.selectOption('[data-p07-read-tag]','NFC-8A2F');await capture('read-guide-desktop');
 });
 await check('five successes in one session; new link keeps product, picks unused code and resets read',async()=>{
  await act('product').click();await page.click('[data-p06-item="fixture-item-HN12345"]'); // serial missing, preserve it
  const requests=[],uids=[];
  for(let i=0;i<5;i++){
   assert.equal((await snap()).itemId,'fixture-item-HN12345');assert.equal((await snap()).read,null);
   await read();await act('next').click();await act('confirm').click();await page.locator('[data-panel="P07.S04"]').waitFor();const s=await snap();requests.push(s.receipt.requestId);uids.push(s.receipt.uid);assert.equal(s.receipt.product.serial,null);
   if(i===0){for(const [w,h]of [[1869,940],[1495,752],[685,872],[494,1000],[360,800],[340,420]]){await page.setViewportSize({width:w,height:h});await capture(`success-${w}x${h}`);}await page.setViewportSize({width:1869,height:940});}
   await act('detail').click();assert.match(await page.locator('.p07-dialog[open]').textContent(),new RegExp(s.receipt.uid));await page.keyboard.press('Escape');await page.locator('.p07-dialog[open]').waitFor({state:'detached'});
   await act('new-link').click();assert.equal((await snap()).receipt,null);assert.equal(await act('next').isDisabled(),true);
  }
  assert.equal(new Set(requests).size,5);assert.equal(new Set(uids).size,5);assert.equal((await snap()).stats.mutations,5);assert.match(await feedback().textContent(),/cả 5 thẻ/);await capture('all-five-used');await closeFeedback();
  await read();assert.equal(await act('next').isDisabled(),true);assert.match(await feedback().textContent(),/đã liên kết/);assert.equal((await snap()).stats.mutations,5);await closeFeedback();
 });
 await check('UNKNOWN locks selector and preserves request across Home; reconcile before another test',async()=>{
  await login();await act('begin').click();await page.selectOption('[data-p07-read-tag]','NFC-DEMO-022');await page.locator('.p07-tools > details > summary').click();await page.selectOption('[data-p07-scenario]','unknown');await read();await act('next').click();await act('confirm').click();await page.waitForFunction(()=>JSON.parse(document.querySelector('[data-p07-snapshot]').textContent).unknown);
  const request=(await snap()).request;assert.equal(await page.locator('[data-p07-read-tag]').isDisabled(),true);assert.equal(await page.locator('[data-p07-scenario]').isDisabled(),true);
  await closeFeedback(true);await page.evaluate(()=>location.hash='#home');await page.click('[data-route="nfc"]');await act('begin').click();assert.deepEqual((await snap()).request,request);await act('reconcile').click();await page.locator('[data-panel="P07.S04"]').waitFor();assert.equal((await snap()).receipt.uid,'NFC-DEMO-022');await act('new-link').click();assert.equal(await page.locator('[data-p07-scenario]').inputValue(),'ready');assert.notEqual((await snap()).selectedUid,'NFC-DEMO-022');
 });
 await check('long values keep column alignment and scroll above footer',async()=>{
  await read();await act('next').click();await act('confirm').click();await page.locator('[data-panel="P07.S04"]').waitFor();await page.setViewportSize({width:360,height:800});
  await page.locator('.p07-summary dd').nth(1).evaluate(e=>e.prepend('Máy in công nghiệp với tên dài để kiểm tra xuống dòng '.repeat(3)));
  await page.locator('.p07-summary dd').nth(5).evaluate(e=>e.prepend('Nguyễn Thị Minh Anh Hoàng '));
  await page.locator('.p07-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);await capture('success-long-values');
  const m=metrics.at(-1);assert.ok(m.summaryBottom<=m.scrollBottom+1);
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,metrics,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,metrics,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}
})();
