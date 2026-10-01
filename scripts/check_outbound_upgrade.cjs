const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {mockGeography,address,choose}=require('./outbound_geography_helpers.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P05/evidence/revision-10');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000},deviceScaleFactor:1}),checks=[],errors=[],layouts=[];
 page.on('pageerror',e=>errors.push(e.message));await mockGeography(page);
 const act=n=>page.locator(`[data-p05="${n}"]`).first(),snap=async()=>JSON.parse(await page.locator('[data-p05-snapshot]').textContent()),field=n=>page.locator(`[data-p05-field="${n}"]`);
 const guard=()=>page.evaluate(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented;});
 async function check(name,run){await run();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function capture(name){await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 async function scan(raw){await page.fill('#p05-code',raw);await page.locator('#p05-code').press('Enter');}
 async function closeDialog(label='Đóng'){await page.locator('.hn-action-dialog[open]').getByRole('button',{name:label,exact:true}).click();await page.waitForFunction(()=>!Object.keys(history.state||{}).some(k=>k.includes('Feedback')));}
 try{
  await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator('.hn-task[data-route="outbound"]').click();
  await check('untouched draft no unload warning; invalid shipping stays expanded; valid blur to quantity collapses without loss',async()=>{
   assert.equal(await guard(),false);assert.equal(await field('address').isDisabled(),true);await address(page);await field('planned').fill('10');await page.waitForFunction(()=>document.querySelector('#p05-shipping-fields').hidden);assert.match(await page.locator('.p05-shipping-card').textContent(),/Minh Phát/);assert.equal(await guard(),true);assert.equal(await field('planned').inputValue(),'10');await capture('04-shipping-card');
  });
  await check('edit collapsed shipping: invalid field stays open and blocks step; correction and collapse preserve location',async()=>{
   await act('edit-shipping').click();assert.equal(await field('phone').isVisible(),true);await field('phone').fill('abc');await field('planned').click();assert.equal(await field('phone').isVisible(),true);await act('next').click();assert.equal((await snap()).step,1);assert.equal(await field('phone').getAttribute('aria-invalid'),'true');await field('phone').fill('0901234567');await act('complete-shipping').click();assert.equal(await page.locator('#p05-shipping-fields').isVisible(),false);assert.equal(await act('edit-shipping').evaluate(e=>document.activeElement===e),true);
  });
  await act('next').click();await page.locator('.p05-tools summary').click();await act('batch').click();await act('manual').click();
  await check('clear code only clears pending input/errors; keeps attempts/count and focus, correct text keyboard',async()=>{
   const before=await snap();await page.fill('#p05-code','HN12352');await act('clear-code').click();assert.equal(await page.inputValue('#p05-code'),'');assert.deepEqual((await snap()).attempts,before.attempts);assert.equal(await page.locator('#p05-code').evaluate(e=>document.activeElement===e),true);assert.equal(await page.locator('#p05-code').getAttribute('inputmode'),'text');await page.locator('#p05-code').press('Enter');assert.match(await page.locator('#p05-error-code').textContent(),/Vui lòng nhập/);await act('clear-code').click();assert.equal(await page.locator('#p05-code').getAttribute('aria-invalid'),'false');
  });
  await act('filter-error').click();assert.equal(await page.locator('.p05-attempt').count(),0);assert.match(await page.locator('.p05-empty').textContent(),/Chưa có mã lỗi/);await act('filter-all').click();
  await scan('HN-WRONG-WAREHOUSE');await scan('<img src=x onerror=alert(1)>');
  await check('filters exact counts and empty views, audit unchanged; details Back closes modal first',async()=>{
   const before=await snap();await act('filter-duplicate').click();assert.equal(await page.locator('.p05-attempt').count(),1);await act('filter-error').click();assert.equal(await page.locator('.p05-attempt').count(),2);assert.equal((await snap()).accepted.length,7);await page.locator('[data-p05^="attempt-"]').first().click();assert.equal(await page.locator('.hn-action-dialog[open]').count(),1);assert.match(await page.locator('.hn-action-dialog[open]').textContent(),/<img src=x onerror=alert\(1\)>/);await page.goBack();await page.locator('.hn-action-dialog[open]').waitFor({state:'detached'});assert.equal((await snap()).step,2);assert.deepEqual((await snap()).attempts,before.attempts);await capture('05-error-filter');
  });
  await check('progress remains visible while scan list scrolls at6 viewports, shell/footer fixed and controls fit',async()=>{
   for(const viewport of [{width:340,height:420},{width:390,height:844},{width:494,height:1000},{width:768,height:1024},{width:1440,height:1000},{width:1869,height:940}]){
    await page.setViewportSize(viewport);await page.locator('.p05-scroll').evaluate(e=>e.scrollTop=0);const top=await page.locator('.p05-live-progress').boundingBox();await page.locator('.p05-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);assert.deepEqual(await page.locator('.p05-live-progress').boundingBox(),top);const m=await page.locator('.hn-screen').evaluate(e=>{const r=e.getBoundingClientRect(),f=e.querySelector('.p05-footer').getBoundingClientRect(),s=e.querySelector('.p05-scroll');return{w:e.offsetWidth,h:e.offsetHeight,footerInside:f.bottom<=r.bottom+1,overflow:s.scrollWidth>s.clientWidth};});assert.deepEqual(m,{w:494,h:950,footerInside:true,overflow:false});layouts.push({viewport,...m});await capture('06-filter-'+viewport.width);await act('manual').click();const r=await page.locator('#p05-code').boundingBox(),v=await page.locator('.p05-scroll').boundingBox();assert.ok(r.y>=v.y-1&&r.y+r.height<=v.y+v.height+1);
   }
   await page.setViewportSize({width:494,height:1000});
  });
  await act('next').click();
  await check('quick shipping edit preserves IDs/scan audit; invalid blocks returning and valid skips directly to review',async()=>{
   const before=await snap();await act('edit-review').click();assert.equal((await snap()).step,1);assert.equal((await snap()).returnToReview,true);await field('phone').fill('wrong');await act('next').click();assert.equal((await snap()).step,1);await field('phone').fill('0987654321');await act('next').click();assert.equal((await snap()).step,3);assert.equal((await snap()).document.documentId,before.document.documentId);assert.deepEqual((await snap()).attempts,before.attempts);assert.equal((await snap()).document.phone,'0987654321');await capture('07-review-edit');
  });
  await check('long Unicode shipping summary has full-text route; collapse does not truncate stored details',async()=>{
   await act('edit-review').click();for(const size of [18,150]){const value='Địa chỉ dài 🌸\n'.repeat(size);await field('address').fill(value);const actual=await field('address').inputValue();await act('complete-shipping').click();const reader=page.locator('.p05-shipping-card [data-hn-read-trigger]:not([hidden])');await reader.waitFor({state:'visible'});await reader.click();assert.equal(await page.locator('.hn-readable-dialog .app-modal-body p').textContent(),actual+', Quận 1, Thành phố Hồ Chí Minh');await page.goBack();await page.locator('.hn-readable-dialog').waitFor({state:'detached'});await act('edit-shipping').click();assert.equal(await field('address').inputValue(),actual);}await field('address').fill('123 Lê Lợi');await act('next').click();
  });
  await check('real reload prompt cancel keeps draft and route; no fake saved message',async()=>{
   const before=await snap();const prompt=page.waitForEvent('dialog');const navigation=page.reload().catch(()=>null);const dialog=await prompt;assert.equal(dialog.type(),'beforeunload');await dialog.dismiss();await navigation;assert.equal((await snap()).document.documentId,before.document.documentId);assert.match(await page.locator('.p05-draft-state').textContent(),/Đang soạn/);assert.equal(await guard(),true);
  });
  await act('back').click();await act('manual').click();for(const raw of ['HN12352','HN12353','HN12354'])await scan(raw);await act('continue').click();assert.equal(await act('filter-all').getAttribute('aria-pressed'),'true');await act('next').click();
  await check('pending/UNKNOWN retains warning, quick edit hidden after request; reconcile clears warning and next attempt clean',async()=>{
   await page.selectOption('[data-p05-outcome]','timeout-recorded');await act('send').click();assert.equal(await guard(),true);await page.locator('.hn-action-dialog[open]').waitFor();assert.equal(await act('edit-review').count(),0);const request=(await snap()).request;await closeDialog('Để sau');assert.equal(await guard(),true);await act('check').click();await page.locator('[data-panel="P05.S04"]').waitFor();assert.deepEqual((await snap()).request,request);assert.equal(await guard(),false);await act('home').click();await page.locator('.hn-task[data-route="outbound"]').click();assert.equal((await snap()).step,1);assert.equal(await guard(),false);assert.equal(await page.locator('.p05-shipping-card').isVisible(),false);
  });
  await check('Home keeps unfinished work warning; logout disposes it',async()=>{
   await page.fill('[data-p05-note]','Nháp mới');assert.equal(await guard(),true);await act('back').click();assert.equal(await guard(),true);await page.evaluate(()=>document.querySelector('#hn-logout').click());const confirm=page.locator('.hn-action-dialog[open]');if(await confirm.count())await confirm.getByRole('button',{name:'Đăng xuất',exact:true}).click();await page.locator('#login-form').waitFor();assert.equal(await guard(),false);
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'upgrade-results.json'),JSON.stringify({checks,layouts,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,layouts,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}
})();
