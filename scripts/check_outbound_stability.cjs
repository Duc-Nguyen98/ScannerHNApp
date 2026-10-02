const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {choose,address,provinces,districts}=require('./outbound_geography_helpers.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.OUTBOUND_EVIDENCE_DIR||'handoff/P05/evidence/revision-09');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));let releaseProvince,hold=false;
 await page.route('https://provinces.open-api.vn/api/v1/**',async route=>{const match=new URL(route.request().url()).pathname.match(/p\/(\d+)/);if(!match&&hold)await new Promise(resolve=>releaseProvince=resolve);return route.fulfill({json:match?{code:Number(match[1]),districts:districts(Number(match[1]))}:provinces});});
 const act=n=>page.locator(`[data-p05="${n}"]`).first(),sel=n=>page.locator(`[data-p05-select="${n}"]`),snap=async()=>JSON.parse(await page.locator('[data-p05-snapshot]').textContent());
 async function login(){await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator('.hn-task[data-route="outbound"]').click();}
 async function check(name,fn){try{await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}catch(e){checks.push({name,status:'FAIL',error:e.message});console.log('FAIL '+name+': '+e.message);if(!process.env.P05_AUDIT_BEFORE)throw e;}}
 async function finish(outcome='confirmed'){await address(page);await act('next').click();await act('manual').click();await page.fill('#p05-code','HN12345');await page.locator('#p05-code').press('Enter');await act('next').click();if(!await page.locator('.p05-tools').evaluate(e=>e.open))await page.locator('.p05-tools summary').click();await page.selectOption('[data-p05-outcome]',outcome);await act('send').click();await page.waitForFunction(()=>{const s=JSON.parse(document.querySelector('[data-p05-snapshot]').textContent);return !s.busy&&(s.outcome||s.unknown);});}
 try{
  hold=true;await login();await check('late geography completion preserves shared picker draft and focused option',async()=>{
   await sel('recipient').click();await page.locator('.app-modal-host input[value="an-binh"]').check();releaseProvince();await page.waitForFunction(()=>JSON.parse(document.querySelector('[data-p05-snapshot]').textContent).geography.provinceStatus==='ready');assert.equal(await page.locator('.app-modal-host').count(),1);assert.equal(await page.locator('.app-modal-host input[value="an-binh"]').isChecked(),true);await page.locator('.app-modal-host [type="submit"]').click();assert.equal(await sel('recipient').getAttribute('data-value'),'an-binh');
  });
  releaseProvince?.();await login();await check('late geography completion preserves note value and caret selection',async()=>{
   const note=page.locator('[data-p05-note]');await note.fill('Ghi chú cần giữ vị trí');await note.evaluate(e=>e.setSelectionRange(4,7));releaseProvince();await page.waitForFunction(()=>JSON.parse(document.querySelector('[data-p05-snapshot]').textContent).geography.provinceStatus==='ready');assert.deepEqual(await note.evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd,e.value]),[true,4,7,'Ghi chú cần giữ vị trí']);
  });
  hold=false;await login();await check('dependent validation focuses available province retry instead of disabled input',async()=>{
   await page.waitForFunction(()=>!document.querySelector('[data-p05-select="province"]').disabled);await act('next').click();assert.equal(await sel('province').evaluate(e=>document.activeElement===e),true);assert.equal(await page.locator('[data-p05-field="address"]').isDisabled(),true);
  });
  await check('blocked code return clears stale manual feedback while preserving scan audit',async()=>{
   await address(page);await act('next').click();await act('manual').click();await page.fill('#p05-code','HN99999');await page.locator('#p05-code').press('Enter');await page.locator('[data-panel="P17.S02"]').waitFor();await act('exception-back').click();await act('manual').click();assert.equal(await page.locator('#p05-code').inputValue(),'');assert.equal((await snap()).attempts.at(-1).raw,'HN99999');
  });
  await login();await finish('failed');await check('rejected frozen request has clear retry path; return-to-scan does not offer silent no-op scanning',async()=>{
   const before=(await snap()).request;await act('back').click();assert.equal(await act('manual').isDisabled(),true);assert.match(await page.locator('[data-p05-frozen]').textContent(),/giữ nguyên|khóa/i);await act('next').click();await act('send').click();await page.waitForFunction(()=>JSON.parse(document.querySelector('[data-p05-snapshot]').textContent).outcome==='not-recorded');assert.deepEqual((await snap()).request,before);await page.locator('.hn-screen').screenshot({path:path.join(out,'frozen-retry.png')});
  });
  if(process.env.P05_AUDIT_BEFORE){fs.writeFileSync(path.join(out,'before.json'),JSON.stringify({checks,errors},null,2));return;}
  await act('home').click();await page.locator('.hn-task[data-route="outbound"]').click();await check('new attempt after failure is clean; metadata picker cancel preserves input and no stacked overlays',async()=>{
   assert.equal((await snap()).document.planned,1);assert.equal((await snap()).request,null);await page.fill('[data-p05-field="phone"]','0901234567');await sel('source').click();await page.locator('.app-modal-host input[value="demo-0006"]').check();await page.keyboard.press('Escape');assert.equal((await snap()).document.sourceId,'new');assert.equal(await page.locator('[data-p05-field="phone"]').inputValue(),'0901234567');assert.equal(await page.locator('.app-modal-host').count(),0);
  });
  await check('source confirmation handles same-source selection; header back labels and view-all states are scoped',async()=>{
   await sel('source').click();await page.locator('.app-modal-host input[value="board-0005"]').check();await page.locator('.app-modal-host [type="submit"]').click();await sel('source').click();await page.locator('.app-modal-host input[value="new"]').check();await page.locator('.app-modal-host [type="submit"]').click();assert.equal(await page.locator('.p05-source-confirm').count(),0);assert.equal(await act('next').isEnabled(),true);await address(page);await page.fill('[data-p05-field="planned"]','10');await act('next').click();await act('batch').click();await act('all').click();await act('next').click();assert.equal(await act('products').textContent(),'Xem tất cả →');await act('products').click();assert.equal(await page.locator('.p05-serials').isVisible(),true);
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'stability-results.json'),JSON.stringify({checks,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,errors,error:e.stack},null,2));throw e;}finally{releaseProvince?.();await browser.close();}
})();
