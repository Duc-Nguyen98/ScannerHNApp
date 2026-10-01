const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const before=process.argv.includes('--before'),out=path.resolve(process.env.NFC_ENTER_EVIDENCE_DIR||`handoff/ux-upgrade-2026-09-30/p07/${before?'before':'after'}`);
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),results=[];
 async function run(name,fn,{sourceError=false}={}){
  const page=await browser.newPage({viewport:{width:494,height:1000},deviceScaleFactor:1}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  if(sourceError)await page.route('**/nfc/fixture-adapter.mjs*',async route=>{const response=await route.fetch(),body=await response.text();assert.ok(body.includes("status:'ready'"),'fault injection must find status marker');await route.fulfill({response,body:body.replace("status:'ready'","status:'error'")});});
  const input=()=>page.locator('#p07-search'),snap=()=>page.locator('[data-p07-snapshot]').evaluate(e=>JSON.parse(e.textContent));
  const idle=()=>page.waitForFunction(()=>!history.state?.hnP07Detail);
  try{
   await page.goto((process.env.PREVIEW_ORIGIN||'http://127.0.0.1:8766')+'/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.click('[data-route="nfc"]');
   await fn({page,input,snap,idle});assert.deepEqual(errors,[]);results.push({name,status:'PASS'});
  }catch(e){results.push({name,status:'FAIL',error:e.message,errors});}
  finally{await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')}).catch(()=>{});await page.close();}
 }
 await run('unique-enters-existing-detail',async({page,input,snap})=>{
  await input().fill('NFC-3F7D9A');const prior=await snap();await input().press('Enter');await page.locator('#p07-detail-title').waitFor({timeout:1500});
  assert.match(await page.locator('dialog[open]').innerText(),/NFC-3F7D9A/);assert.equal(await page.locator('dialog[open]').count(),1);assert.equal((await snap()).request,prior.request);assert.equal((await snap()).receipt,null);assert.equal((await snap()).read,null);
  assert.equal(await page.locator('dialog[open] [data-p07="confirm"]').count(),0);
 });
 await run('multiple-focuses-first-row',async({page,input})=>{await input().fill('NFC-OLD');assert.ok(await page.locator('[data-p07-tag]').count()>1);await input().press('Enter');assert.equal(await page.locator('[data-p07-tag]').first().evaluate(e=>e===document.activeElement),true);assert.equal(await page.locator('dialog[open]').count(),0);});
 await run('zero-keeps-search-focus',async({page,input})=>{await input().fill('nonexistent-uid');await input().press('Enter');assert.equal(await page.locator('[data-p07-tag]').count(),0);assert.equal(await input().evaluate(e=>e===document.activeElement),true);assert.equal(await page.locator('dialog[open]').count(),0);});
 await run('empty-keeps-search-focus',async({page,input})=>{await input().fill('   ');await input().press('Enter');assert.equal(await input().evaluate(e=>e===document.activeElement),true);assert.equal(await page.locator('dialog[open]').count(),0);});
 await run('composition-blocks-enter',async({page,input})=>{await input().fill('NFC-3F7D9A');await input().dispatchEvent('compositionstart');await input().dispatchEvent('keydown',{key:'Enter',code:'Enter',bubbles:true});assert.equal(await page.locator('dialog[open]').count(),0);await input().dispatchEvent('compositionend');await input().press('Enter');await page.locator('#p07-detail-title').waitFor({timeout:1500});});
 await run('ime-key229-and-repeat-block',async({page,input})=>{await input().fill('NFC-3F7D9A');for(const extra of [{isComposing:true},{keyCode:229},{repeat:true}])await input().dispatchEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,...extra});assert.equal(await page.locator('dialog[open]').count(),0);});
 await run('keyboard-back-restores-context',async({page,input,idle})=>{await page.click('[data-p07-tab="unlinked"]');await input().fill('NFC-3F7D9A');const scroll=await page.locator('.p07-scroll').evaluate(e=>e.scrollTop);await input().press('Enter');await page.locator('#p07-detail-title').waitFor({timeout:1500});await page.keyboard.press('Tab');assert.equal(await page.locator('dialog[open]').evaluate(e=>e.contains(document.activeElement)),true);await page.goBack();await page.locator('#p07-detail-title').waitFor({state:'detached'});await idle();assert.equal(await input().inputValue(),'NFC-3F7D9A');assert.equal(await page.locator('[data-p07-tab="unlinked"]').getAttribute('aria-selected'),'true');assert.equal(await input().evaluate(e=>e===document.activeElement),true);assert.equal(await page.locator('.p07-scroll').evaluate(e=>e.scrollTop),scroll);await input().press('Enter');await page.locator('#p07-detail-title').waitFor();await page.keyboard.press('Escape');await page.locator('#p07-detail-title').waitFor({state:'detached'});assert.equal(await input().evaluate(e=>e===document.activeElement),true);});
 await run('readonly-capability-allows-view-only',async({page,input,snap})=>{await page.locator('.p07-tools>details>summary').click();await page.selectOption('[data-p07-scenario]','link-denied');await input().fill('NFC-3F7D9A');await input().press('Enter');await page.locator('#p07-detail-title').waitFor({timeout:1500});const s=await snap();assert.equal(s.read,null);assert.equal(s.request,null);assert.equal(s.receipt,null);assert.equal(s.panel,1);assert.match(await page.locator('dialog[open]').innerText(),/Chưa liên kết/);});
 if(!before){
  await run('failed-source-does-not-open-cached-row',async({page,input})=>{await input().fill('NFC-3F7D9A');assert.equal(await page.locator('[data-p07-tag]').count(),1);await input().press('Enter');assert.equal(await input().evaluate(e=>e===document.activeElement),true);assert.equal(await page.locator('dialog[open]').count(),0);},{sourceError:true});
  await run('composition-state-resets-with-search-dom',async({page,input})=>{await input().fill('NFC-3F7D9A');await input().dispatchEvent('compositionstart');await page.click('[data-p07-tab="unlinked"]');await input().press('Enter');await page.locator('#p07-detail-title').waitFor({timeout:1500});});
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({viewport:{width:494,height:1000,dpr:1},results},null,2));await browser.close();console.log(JSON.stringify(results));if(!before&&results.some(r=>r.status==='FAIL'))process.exitCode=1;
})();
