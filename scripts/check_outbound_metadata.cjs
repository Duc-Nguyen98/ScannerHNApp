const {mockGeography,address:prepareAddress,choose:chooseOption}=require('./outbound_geography_helpers.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.OUTBOUND_EVIDENCE_DIR || 'handoff/P05/evidence/revision-05');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const act=n=>page.locator(`[data-p05="${n}"]`).first(),field=n=>page.locator(`[data-p05-field="${n}"]`),select=n=>page.locator(`[data-p05-select="${n}"]`);
 const snap=async()=>JSON.parse(await page.locator('[data-p05-snapshot]').textContent());
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function choose(name,value){await chooseOption(page,name,value);}
 async function capture(name){await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 async function scan(raw){if(!await page.locator('#p05-code').count())await act('manual').click();await page.fill('#p05-code',raw);await page.locator('#p05-code').press('Enter');}
 try {
  await mockGeography(page);await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator('.hn-task[data-route="outbound"]').click();
  await check('new document defaults1; three styled listboxes and known customer autofill',async()=>{
   assert.equal(await field('planned').inputValue(),'1');assert.equal(await select('source').locator('..').locator('[role="option"]').count(),3);assert.equal(await select('group').locator('..').locator('[role="option"]').count(),3);await choose('recipient','an-binh');assert.equal(await field('phone').inputValue(),'0912 345 678');await capture('01-selects');
  });
  await check('source change requires explicit confirmation; cancel preserves edits and identity',async()=>{
   await page.locator('[data-p05-note]').fill('Giữ ghi chú');const before=(await snap()).document;await choose('source','demo-0006');await act('cancel-source').click();assert.equal(await page.locator('[data-p05-note]').inputValue(),'Giữ ghi chú');assert.equal((await snap()).document.documentId,before.documentId);
   await choose('source','board-0005');await act('apply-source').click();assert.equal(await field('planned').inputValue(),'10');assert.equal(await select('recipient').getAttribute('data-value'),'minh-phat');assert.notEqual((await snap()).document.documentId,before.documentId);
  });
  await check('walk-in clears old contact; required errors and Vietnamese name preserved as literal text',async()=>{
   await choose('recipient','walk-in');assert.equal(await field('recipient').inputValue(),'');assert.equal(await field('phone').inputValue(),'');assert.equal(await field('address').inputValue(),'');await act('next').click();assert.equal((await snap()).step,1);assert.equal(await field('recipient').getAttribute('aria-invalid'),'true');
   await prepareAddress(page);await field('recipient').fill('Nguyễn Văn An');await field('phone').fill('0901234567');await field('address').fill('12 Lê Lợi, TP. Hồ Chí Minh');await capture('02-walk-in');
  });
  await check('quantity paste and type validation: no truncation/coercion, invalid blocks next,1/99 accepted',async()=>{
   for(const raw of ['', '0','-1','100','1.5','1e1','+1','01',' 1','1 ','abc','999999999999999999999','１']){await field('planned').fill(raw);await act('next').click();assert.equal((await snap()).step,1,raw);assert.equal(await field('planned').inputValue(),raw);assert.equal(await field('planned').getAttribute('aria-invalid'),'true');}
   await capture('03-invalid-quantity');
   for(const raw of ['1','99']){await field('planned').fill(raw);await act('next').click();assert.equal((await snap()).step,2);assert.equal((await snap()).document.planned,Number(raw));await act('back').click();}
  });
  await check('group selection affects scan validation; source/group locked after attempts',async()=>{
   await field('planned').fill('2');await choose('group','zd');await act('next').click();await scan('HN12345');assert.equal((await snap()).accepted.length,0);assert.match((await snap()).message,/nhóm hàng/);await scan('HN12346');await scan('HN12347');assert.equal((await snap()).accepted.length,2);await act('back').click();assert.equal(await select('source').isDisabled(),true);assert.equal(await select('group').isDisabled(),true);await capture('04-locked-source');
  });
  await check('lowering below accepted blocked without losing scans; correction keeps identities',async()=>{
   const before=await snap();await field('planned').fill('1');await act('next').click();assert.equal((await snap()).step,1);assert.match(await page.locator('#p05-error-planned').textContent(),/đã soạn/);assert.deepEqual((await snap()).accepted,before.accepted);await field('planned').fill('2');await act('next').click();assert.equal((await snap()).document.documentId,before.document.documentId);
  });
  await check('walk-in receipt uses details and null customerId; fresh attempt returns1',async()=>{
   await act('next').click();await act('send').click();await page.locator('[data-panel="P05.S04"]').waitFor();const d=(await snap()).request.document;assert.equal(d.recipient,'Nguyễn Văn An');assert.equal(d.recipientId,null);assert.equal(d.recipientType,'walk-in');assert.equal(d.planned,2);await act('home').click();await page.locator('.hn-task[data-route="outbound"]').click();assert.equal(await field('planned').inputValue(),'1');
  });
  await check('walk-in form layout mobile/desktop: fixed shell, no horizontal overflow, CTA remains in shell',async()=>{
   await choose('recipient','walk-in');await act('next').click();
   for(const viewport of [{width:390,height:844},{width:1440,height:1000}]){await page.setViewportSize(viewport);const m=await page.locator('.hn-screen').evaluate(e=>{const s=e.querySelector('.p05-scroll'),r=e.getBoundingClientRect(),f=e.querySelector('.p05-footer').getBoundingClientRect();return{w:e.offsetWidth,h:e.offsetHeight,overflow:s.scrollWidth>s.clientWidth,footer:f.bottom<=r.bottom+1};});assert.deepEqual(m,{w:494,h:950,overflow:false,footer:true});await capture('05-form-'+viewport.width);}
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'metadata-results.json'),JSON.stringify({checks,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}
})();
