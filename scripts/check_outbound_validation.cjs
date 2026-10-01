const {mockGeography,address:prepareAddress}=require('./outbound_geography_helpers.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.OUTBOUND_EVIDENCE_DIR || 'handoff/P05/evidence/revision-03');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const act=n=>page.locator(`[data-p05="${n}"]`).first(),phone=()=>page.locator('[data-p05-field="phone"]'),address=()=>page.locator('[data-p05-field="address"]');
 const snap=async()=>JSON.parse(await page.locator('[data-p05-snapshot]').textContent());
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 try {
  await mockGeography(page);await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator('.hn-task[data-route="outbound"]').click();await prepareAddress(page);await page.fill('[data-p05-field="planned"]','10');
  await check('required phone/address: inline errors, first invalid focus, no transition',async()=>{
   await phone().fill('');await address().fill('   ');await act('next').click();assert.equal((await snap()).step,1);
   assert.equal(await phone().getAttribute('aria-invalid'),'true');assert.equal(await address().getAttribute('aria-invalid'),'true');assert.equal(await phone().evaluate(e=>document.activeElement===e),true);
   assert.match(await page.locator('#p05-error-phone').textContent(),/Vui lòng nhập/);await page.locator('.hn-screen').screenshot({path:path.join(out,'01-required.png')});
  });
  await check('malformed phone blocked; live correction keeps focus/value; tel +84 and landline accepted',async()=>{
   for(const value of ['abc','090123456','+840901234567']){await phone().fill(value);await act('next').click();assert.equal((await snap()).step,1);assert.match(await page.locator('#p05-error-phone').textContent(),/không hợp lệ/);}
   await page.locator('.hn-screen').screenshot({path:path.join(out,'02-phone-format.png')});
   for(const value of ['+84 901 234 567','028 3822 1234','0901 234 567']){await phone().fill(value);assert.equal(await phone().getAttribute('aria-invalid'),'false');assert.equal(await phone().evaluate(e=>document.activeElement===e),true);await address().fill('123 Lê Lợi, TP. Hồ Chí Minh');await act('next').click();assert.equal((await snap()).step,2);assert.equal((await snap()).document.phone,value);await act('back').click();}
  });
  await check('optional note boundary 200, valid metadata enters scan',async()=>{
   await page.locator('[data-p05-note]').fill('N'.repeat(200));assert.equal(await page.locator('.p05-note-count').textContent(),'200/200');await act('next').click();assert.equal((await snap()).document.note.length,200);
  });
  await act('manual').click();
  await check('empty and spaces: custom inline error, no native bubble, no scan attempt',async()=>{
   assert.equal(await page.locator('.p05-manual').evaluate(e=>e.noValidate),true);
   for(const code of ['', '   ']){await page.fill('#p05-code',code);await page.locator('#p05-code').press('Enter');assert.equal((await snap()).attempts.length,0);assert.equal(await page.locator('#p05-code').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('#p05-code').evaluate(e=>document.activeElement===e),true);}
   await page.locator('.hn-screen').screenshot({path:path.join(out,'03-empty-code.png')});
  });
  await check('invalid raw preserved safely; duplicate does not increment; valid code clears entry',async()=>{
   for(const code of [' HN12345 ','hn12345','<img src=x onerror=alert(1)>']){await page.fill('#p05-code',code);await page.locator('#p05-code').press('Enter');assert.equal(await page.inputValue('#p05-code'),code);assert.equal((await snap()).attempts.at(-1).raw,code);assert.equal((await snap()).accepted.length,0);assert.equal(await page.locator('#p05-code').getAttribute('aria-invalid'),'true');}
   await page.fill('#p05-code','HN12345');await page.locator('#p05-code').press('Enter');assert.equal((await snap()).accepted.length,1);assert.equal(await page.inputValue('#p05-code'),'');
   await page.fill('#p05-code','HN12345');await page.locator('#p05-code').press('Enter');assert.equal((await snap()).accepted.length,1);assert.match(await page.locator('#p05-error-code').textContent(),/Không cộng/);
  });
  await check('metadata edits preserve accepted codes and document identity',async()=>{
   const before=await snap();await act('back').click();await phone().fill('bad');await act('next').click();assert.equal((await snap()).step,1);assert.deepEqual((await snap()).accepted,before.accepted);
   await phone().fill('0901234567');await act('next').click();assert.equal((await snap()).document.documentId,before.document.documentId);assert.deepEqual((await snap()).accepted,before.accepted);
  });
  await check('10/10 sends successfully and next outbound starts clean',async()=>{
   for(const code of ['HN12346','HN12347','HN12348','HN12349','HN12350','HN12351','HN12352','HN12353','HN12354']){await page.fill('#p05-code',code);await page.locator('#p05-code').press('Enter');}
   await act('next').click();await act('send').click();await page.locator('[data-panel="P05.S04"]').waitFor();await act('home').click();await page.locator('.hn-task[data-route="outbound"]').click();assert.equal((await snap()).step,1);assert.equal((await snap()).attempts.length,0);assert.equal(await page.locator('[aria-invalid="true"]').count(),0);
  });
  await check('error layouts at mobile and desktop: fixed app shell, CTA reachable, no horizontal overflow',async()=>{
   await prepareAddress(page);for(const viewport of [{width:390,height:844},{width:1440,height:1000}]){await page.setViewportSize(viewport);await phone().fill('bad');await address().fill('');await act('next').click();const layout=await page.locator('.hn-screen').evaluate(e=>({w:e.offsetWidth,h:e.offsetHeight,overflow:e.scrollWidth>e.clientWidth}));assert.deepEqual(layout,{w:494,h:950,overflow:false});assert.equal(await act('next').isVisible(),true);await page.locator('.hn-screen').screenshot({path:path.join(out,`04-layout-${viewport.width}.png`)});}
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({checks,errors},null,2));
 } catch(e) {await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,errors,error:e.stack},null,2));throw e;} finally {await browser.close();}
})();
