const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.PREVIEW_BASE_URL||'http://127.0.0.1:8767';
const out=path.resolve('handoff/system-audit-2026-09-28/evidence/system');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}});
 const checks=[],errors=[],failedRequests=[];let expectedLoadFailure=false;
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',r=>{if(!expectedLoadFailure)failedRequests.push({url:r.url(),error:r.failure()});});
 const check=async(name,fn)=>{await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);};
 const snap=async()=>JSON.parse(await page.locator('[data-p03-snapshot]').textContent());
 const act=key=>page.locator(`[data-p03-action="${key}"]`);
 const home=async()=>{await page.locator('[data-tab="home"]').click();await page.locator('#hn-home').waitFor({state:'visible'});};
 async function login(){await page.goto(base+'/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator('#hn-home').waitFor({state:'visible'});}
 try {
  await check('Module failure offers explicit recovery; retry reconstructs login',async()=>{
   expectedLoadFailure=true;await page.route('**/home/home.mjs*',r=>r.abort());
   await page.goto(base+'/flows/auth-session/');await page.locator('#preview-startup-status').waitFor({state:'visible'});
   assert.equal(await page.locator('#hn-home').count(),0);
   await page.screenshot({path:path.join(out,'load-recovery.png')});
   await page.unroute('**/home/home.mjs*');expectedLoadFailure=false;
   await page.getByRole('button',{name:'Tải lại preview',exact:true}).click();await page.locator('#username').waitFor();
   assert.equal(await page.locator('#preview-startup-status').isVisible(),false);
  });
  await check('Ten successive cold reloads construct login without failed modules',async()=>{
   for(let i=0;i<10;i++){await page.reload();await page.locator('#username').waitFor();assert.equal(await page.locator('#hn-home').count(),0);}
  });
  await login();
  await check('Returning from inbound/outbound restores Home title and layout context',async()=>{
   for(const [key,p] of [['inbound','p04'],['outbound','p05']]){
    await page.locator(`.hn-task[data-route="${key}"]`).click();await page.locator(`[data-${p}="back"]`).click();
    assert.equal(await page.title(),'P02 · Hoa Nam Scanner · Prototype');assert.equal(await page.locator('#hn-destination').getAttribute('class'),'');
   }
  });
  await check('History and pending destination titles match visible routes; return restores Home',async()=>{
   for(const [key,title] of [['history','P22 · Lịch sử thao tác'],['documents','P12 · Chứng từ'],['profile','P10 · Cá nhân']]){
    await page.locator(`[data-tab="${key}"]`).click();assert.ok((await page.title()).startsWith(title));
    if(key==='history')await page.frameLocator('iframe').getByRole('heading',{name:'Lịch sử thao tác',exact:true}).waitFor();
    await home();assert.equal(await page.title(),'P02 · Hoa Nam Scanner · Prototype');
   }
  });
  await check('P03 header Back is operable, cancels without navigation or lost draft',async()=>{
   await page.locator('[data-tab="lookup"]').click();assert.equal(await page.locator('[data-p03-back]').isEnabled(),true);
   await page.locator('[data-p03-back]').click();await page.locator('.p03-dialog').waitFor({state:'detached'});
   await page.locator('.p03-tools summary').click();await page.locator('[data-p03-open="local"]').click();let original=(await snap()).document;
   await act('discard').click();await page.locator('[data-p03-back]').click();assert.equal((await snap()).panel,'P03.S02');assert.deepEqual((await snap()).document,original);
   await page.locator('[data-p03-back]').click();await page.locator('.p03-dialog').waitFor({state:'detached'});assert.deepEqual((await snap()).document,original);
  });
  await check('Busy save visibly locks footer/header; failure unlocks controls without losing draft',async()=>{
   await page.selectOption('[data-p03-fixture="save"]','failed');await page.locator('[data-p03-open="resume"]').click();let original=(await snap()).document;
   await act('save').click();assert.equal(await page.locator('[data-p03-back]').isDisabled(),true);
   for(const key of ['home','documents','lookup','history','profile'])assert.equal(await page.locator(`[data-tab="${key}"]`).isDisabled(),true);
   await page.waitForFunction(()=>document.querySelector('[data-p03-action="save"]')?.disabled===false);
   assert.deepEqual((await snap()).document,original);assert.equal(await page.locator('[data-tab="home"]').isEnabled(),true);await home();
  });
  await check('Warehouse stopped keeps header disabled but explicit read-only Home remains available',async()=>{
   await page.locator('[data-p03-open="stopped"]').click();assert.equal(await page.locator('[data-p03-back]').isDisabled(),true);
   assert.equal(await page.locator('[data-tab="home"]').isEnabled(),true);await home();await page.selectOption('[data-p03-fixture="warehouse"]','active');
  });
  await login();
  await check('Locked Home/P03 shell and footer match; backdrop no-op; heading/menu focus works at three sizes',async()=>{
   for(const [width,height]of [[360,800],[494,1000],[1440,900]]){
    await page.setViewportSize({width,height});await home();const initial=await page.locator('.hn-screen').boundingBox();
    await page.locator('[data-tab="lookup"]').click();const actual=await page.locator('.hn-screen').boundingBox();
    for(const k of ['x','y','width','height'])assert.ok(Math.abs(actual[k]-initial[k])<1);
    await page.locator('.p03-backdrop').click({position:{x:4,y:4}});assert.equal((await snap()).panel,'P03.S01');
    await page.keyboard.press('Tab');assert.equal(await page.locator('[data-p03-back]').evaluate(e=>e===document.activeElement),true);
    await page.screenshot({path:path.join(out,`picker-${width}x${height}.png`)});await home();
   }
  });
  assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({status:'PASS',base,checks,errors,failedRequests},null,2));
 }catch(e){fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({message:e.message,checks,errors,failedRequests},null,2));await page.screenshot({path:path.join(out,'failure.png')});throw e;}
 finally{await browser.close();}
})();
