const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.HISTORY_EVIDENCE_DIR||'handoff/P08/evidence/stability-2026-09-28/search');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],errors=[];
 page.on('pageerror',e=>{errors.push(e.stack);console.log('PAGEERROR '+e.stack);});
 await page.clock.setFixedTime(new Date('2026-09-28T05:00:00Z'));
 try{
  await page.goto(process.env.HISTORY_PREVIEW_URL||'http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');
  for(const scene of ['history-general','history-daily','documents','nfc','warranty','sessions']){
   await page.click('[data-tab=history]');await page.frameLocator('iframe').locator(`[data-action="${scene}"]`).click();await page.locator('#p08-search').waitFor();
   await page.locator('#p08-search').evaluate(e=>{window.historyAuditInput=e;e.focus();e.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));});
   for(const q of ['M','Minh','Minh Anh']){
    await page.fill('#p08-search',q);
    assert.equal(await page.locator('#p08-search').evaluate(e=>e===window.historyAuditInput&&e===document.activeElement&&e.isConnected),true,scene+' retains input/focus');
   }
   await page.locator('#p08-search').evaluate(e=>e.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:e.value})));
   assert.match(await page.locator('.p08-result-count').textContent(),/\d+ kết quả/);
   await page.fill('#p08-search','khong-ton-tai-987');assert.equal(await page.locator('.p08-result-count strong').textContent(),'0');
   await page.fill('#p08-search','');assert.ok(Number(await page.locator('.p08-result-count strong').textContent())>0);
   assert.equal(await page.locator('[data-p08=clear]').count(),0);
   await page.fill('#p08-search','Minh Anh');
   if(scene==='history-daily'){
    assert.equal(await page.locator('.p08-grid strong').last().textContent(),await page.locator('.p08-result-count strong').textContent());
    await page.click('[data-p08-group=inbound]');
   }else await page.locator('.p08-row').first().click();
   await page.click('[data-p08=back]');await page.locator('#p08-search').waitFor();assert.equal(await page.inputValue('#p08-search'),'Minh Anh');
   await page.click('[data-p08=clear]');
   await page.locator('.hn-screen').screenshot({path:path.join(out,scene+'.png')});
   checks.push({name:scene+' stable input, live results, empty/reset and detail Back',status:'PASS'});console.log('PASS '+checks.at(-1).name);
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}
})();
