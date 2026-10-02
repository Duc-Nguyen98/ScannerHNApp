const {mockGeography,address:prepareAddress}=require('./outbound_geography_helpers.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.OUTBOUND_EVIDENCE_DIR || 'handoff/P05/evidence/revision-04');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],errors=[],layouts=[];
 page.on('pageerror',e=>errors.push(e.message));
 const act=n=>page.locator(`[data-p05="${n}"]`).first(),code=()=>page.locator('#p05-code');
 const snap=async()=>JSON.parse(await page.locator('[data-p05-snapshot]').textContent());
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function scan(raw){await code().fill(raw);await code().press('Enter');}
 async function capture(name){await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 async function audit(name){
  const measured=await page.locator('.p05-app').evaluate(app=>{
   const shell=app.closest('.hn-screen'),scroll=app.querySelector('.p05-scroll'),footer=app.querySelector('.p05-footer'),input=app.querySelector('#p05-code'),submit=app.querySelector('.p05-check-code');
   const sr=shell.getBoundingClientRect(),fr=footer.getBoundingClientRect();
   return {w:shell.offsetWidth,h:shell.offsetHeight,overflow:scroll.scrollWidth>scroll.clientWidth,footerInside:fr.bottom<=sr.bottom+1&&fr.top>=sr.top,inputHeight:input?.offsetHeight,submitHeight:submit?.offsetHeight,submitWidth:submit?.clientWidth,submitScroll:submit?.scrollWidth,codeRowOverflow:input?input.parentElement.scrollWidth>input.parentElement.clientWidth:false};
  });
  assert.equal(measured.w,494);assert.equal(measured.h,950);assert.equal(measured.overflow,false);assert.equal(measured.footerInside,true);assert.equal(measured.codeRowOverflow,false);
  if(measured.inputHeight){assert.ok(measured.inputHeight>=48);assert.ok(measured.submitHeight>=48);assert.equal(measured.submitWidth,measured.submitScroll);}
  layouts.push({name,...measured});await capture(name);
 }
 try {
  await mockGeography(page);await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator('.hn-task[data-route="outbound"]').click();await prepareAddress(page);await page.fill('[data-p05-field="planned"]','10');await act('next').click();
  await check('empty scan: actionable hint, review unavailable, camera/torch honest, no empty list toggle',async()=>{
   assert.deepEqual(await page.locator('.p05-scan-intro .hn-operation-icon').evaluate(e=>{const s=getComputedStyle(e);return [s.color,s.backgroundColor,getComputedStyle(e.querySelector('svg')).strokeWidth];}),['rgb(34, 95, 162)','rgb(237, 244, 255)','1.8px']);assert.equal(await act('next').isDisabled(),true);assert.match(await page.locator('#p05-review-hint').textContent(),/ít nhất 1/);assert.equal(await act('torch').isDisabled(),true);assert.equal(await act('all').count(),0);assert.equal(await page.locator('progress').getAttribute('value'),'0');await audit('01-empty');
  });
  await check('manual card: expand semantics, compact camera, no native validity bubble, persistent help',async()=>{
   const camera=await page.locator('.p05-camera').evaluate(e=>e.offsetHeight);await act('manual').click();assert.equal(await act('manual').getAttribute('aria-expanded'),'true');assert.ok(await page.locator('.p05-camera').evaluate(e=>e.offsetHeight)<camera);assert.equal(await code().evaluate(e=>document.activeElement===e),true);assert.equal(await page.locator('.p05-manual').evaluate(e=>e.noValidate),true);await audit('02-manual-idle');
   await code().press('Enter');assert.equal((await snap()).attempts.length,0);assert.equal(await code().getAttribute('aria-invalid'),'true');assert.match(await page.locator('#p05-error-code').textContent(),/Vui lòng nhập/);await audit('03-required');
  });
  await check('success inline, focus retained, ready for next code, progress updates',async()=>{
   await scan('HN12345');assert.equal(await code().inputValue(),'');assert.equal(await code().evaluate(e=>document.activeElement===e),true);assert.match(await page.locator('#p05-error-code').textContent(),/Đã thêm HN12345 · 1\/10/);assert.equal(await page.locator('#p05-error-code').getAttribute('data-tone'),'valid');assert.equal(await act('next').isEnabled(),true);await audit('04-valid');
  });
  await check('duplicate amber feedback, exact raw selectable, accepted count unchanged',async()=>{
   await scan('HN12345');assert.equal((await snap()).accepted.length,1);assert.equal(await page.locator('#p05-error-code').getAttribute('data-tone'),'duplicate');assert.equal(await code().getAttribute('aria-invalid'),'false');assert.deepEqual(await code().evaluate(e=>[e.selectionStart,e.selectionEnd]),[0,7]);await audit('05-duplicate');
  });
  await check('invalid feedback only at entry, raw safe and preserved; no jump to detached global message',async()=>{
   await scan(' HN12345 ');assert.equal(await code().inputValue(),' HN12345 ');assert.equal(await code().getAttribute('aria-invalid'),'true');assert.equal(await page.locator('.p05-feedback').isVisible(),false);assert.equal((await snap()).accepted.length,1);await audit('06-invalid');
  });
  await check('collapse/Escape and reopen retain unsent raw; no accidental scan',async()=>{
   await code().fill('HN12346');const n=(await snap()).attempts.length;await code().press('Escape');assert.equal(await code().count(),0);assert.equal(await act('manual').evaluate(e=>document.activeElement===e),true);await act('manual').click();assert.equal(await code().inputValue(),'HN12346');assert.equal((await snap()).attempts.length,n);await act('close-manual').click();await act('continue').click();assert.equal(await code().inputValue(),'HN12346');
  });
  await check('manual/error layouts across six viewport sizes; stable shell/footer and no clipping',async()=>{
   for(const viewport of [{width:340,height:420},{width:390,height:844},{width:494,height:1000},{width:768,height:1024},{width:1440,height:1000},{width:1869,height:940}]){await page.setViewportSize(viewport);await scan('BAD-CODE');await audit(`07-error-${viewport.width}x${viewport.height}`);}
   await page.setViewportSize({width:494,height:1000});
  });
  await check('full quantity highlights review; secondary action reads list without adding scans',async()=>{
   for(const raw of ['HN12346','HN12347','HN12348','HN12349','HN12350','HN12351','HN12352','HN12353','HN12354'])await scan(raw);
   assert.equal((await snap()).accepted.length,10);assert.match(await act('next').getAttribute('class'),/p05-primary/);assert.equal(await act('continue').textContent(),'Xem mã đã quét');assert.equal(await page.locator('progress').getAttribute('value'),'10');await audit('08-complete');
   const n=(await snap()).attempts.length;await act('continue').click();assert.equal(await page.locator('.p05-attempt').count(),n);assert.equal(await page.locator('.p05-attempts').evaluate(e=>document.activeElement===e),true);assert.equal((await snap()).step,2);await act('next').click();assert.equal((await snap()).step,3);
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'ux-results.json'),JSON.stringify({checks,errors,layouts},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}
})();
