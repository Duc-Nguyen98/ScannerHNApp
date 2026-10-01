const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(process.env.HOME_KPI_EVIDENCE_DIR||'handoff/P02/evidence/revision-10-kpi');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:950},deviceScaleFactor:1});const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const kpi=k=>page.locator(`[data-home-kpi="${k}"]`),home=async()=>{await page.locator('[data-tab=home]').click();await page.locator('#hn-home').waitFor({state:'visible'});};
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 try{
  await page.goto((process.env.PREVIEW_BASE_URL||'http://127.0.0.1:8766')+'/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await kpi('waiting').waitFor();
  await check('KPI counts use the complete shared fixtures; footer remains locked',async()=>{
   assert.equal(await kpi('waiting').locator('strong').textContent(),'5');assert.equal(await kpi('open').locator('strong').textContent(),'4');
   assert.equal(await page.locator('.hn-nav').evaluate(n=>getComputedStyle(n).backgroundColor),'rgba(255, 255, 255, 0.98)');
   await page.screenshot({path:path.join(out,'home-494.png')});
  });
  await page.click('[data-tab=documents]');await page.fill('#p12-query','PX-0004');await home();
  await check('Waiting KPI resets stale search, opens only waiting Web documents, and Back restores focus',async()=>{
   await kpi('waiting').click();await page.locator('.p12-record').first().waitFor();assert.equal(await page.locator('#p12-query').inputValue(),'');assert.equal(await page.locator('.p12-record').count(),5);
   assert.ok((await page.locator('.p12-record .p12-badge').allTextContents()).every(s=>s==='Chờ xử lý trên Web'));assert.match(await page.locator('.p12-result-count').textContent(),/5\s*kết quả/);
   await page.screenshot({path:path.join(out,'waiting-documents.png')});await page.goBack();await page.locator('#hn-home').waitFor({state:'visible'});assert.equal(await kpi('waiting').evaluate(n=>n===document.activeElement),true);
  });
  await check('Keyboard opens waiting list; detail Back keeps KPI filter/search; normal entry keeps its own filter',async()=>{
   await kpi('waiting').press('Enter');await page.fill('#p12-query','PN-0005');await page.locator('.p12-record').click();await page.locator('[data-panel="P12.S02"]').waitFor();await page.goBack();await page.locator('#p12-query').waitFor();assert.equal(await page.locator('#p12-query').inputValue(),'PN-0005');assert.equal(await page.locator('.p12-record').count(),1);
   await home();await page.click('[data-tab=documents]');assert.equal(await page.locator('#p12-query').inputValue(),'PX-0004');assert.match(await page.locator('.p12-record').textContent(),/Đã ghi sổ/);await home();
  });
  await page.click('.hn-task[data-route=warranty]');await page.fill('#p09-query','BH-002');await home();
  await check('Open-warranty KPI excludes returned cases and overrides old search without losing normal view',async()=>{
   await kpi('open').click();await page.locator('.p09-case').first().waitFor();assert.equal(await page.locator('#p09-query').inputValue(),'');assert.equal(await page.locator('.p09-case').count(),4);
   const statuses=await page.locator('.p09-case .p09-badge').allTextContents();assert.ok(statuses.every(s=>['Đã tiếp nhận','Đang kiểm tra','Chờ bàn giao'].includes(s)));assert.match(await page.locator('.p09-controls').textContent(),/Bảo hành đang mở/);
   await page.screenshot({path:path.join(out,'open-warranties.png')});
   await page.locator('[data-p09-case=BH-005]').click();await page.locator('[data-panel="P09.S03"]').waitFor();await page.getByRole('button',{name:'Về danh sách bảo hành',exact:true}).click();await page.locator('#p09-query').waitFor();assert.match(await page.locator('.p09-controls').textContent(),/Bảo hành đang mở/);assert.equal(await page.locator('.p09-case').count(),4);
   await page.fill('#p09-query','BH-001');await page.locator('[data-p09-case=BH-001]').click();await page.locator('[data-panel="P09.S03"]').waitFor();await page.goBack();await page.locator('#p09-query').waitFor();assert.equal(await page.locator('#p09-query').inputValue(),'BH-001');assert.equal(await page.locator('.p09-case').count(),1);
   await home();await page.click('.hn-task[data-route=warranty]');assert.equal(await page.locator('#p09-query').inputValue(),'BH-002');assert.match(await page.locator('.p09-case').textContent(),/Đã trả khách/);await home();
  });
  await check('Returning Home recomputes open count; zero opens honest empty list',async()=>{
   await page.evaluate(async()=>{const m=await import('/flows/shared/warranty-cases.mjs');for(const c of m.readWarrantyCases())m.writeWarrantyCase({...c,status:'Đã trả khách'});});
   await page.click('.hn-scanner');await page.locator('.p06-app').waitFor();await page.click('[data-p06=back]');await page.locator('#hn-home').waitFor({state:'visible'});assert.equal(await kpi('open').locator('strong').textContent(),'0');assert.equal(await kpi('open').isEnabled(),true);
   await kpi('open').click();assert.equal(await page.locator('.p09-case').count(),0);assert.match(await page.locator('.p09-empty').textContent(),/Không có hồ sơ phù hợp/);await home();
   await page.evaluate(async()=>{const m=await import('/flows/shared/warranty-cases.mjs');m.resetWarrantyCases();});
  });
  await check('UNKNOWN is not clickable and cannot silently open all records',async()=>{
   await page.getByText('Kịch bản kiểm tra P02',{exact:true}).click();await page.selectOption('#hn-scenario','unknown');assert.equal(await kpi('waiting').isEnabled(),false);assert.equal(await kpi('open').isEnabled(),false);
   await kpi('waiting').evaluate(n=>n.dispatchEvent(new MouseEvent('click',{bubbles:true})));assert.equal(new URL(page.url()).hash,'#home');await page.selectOption('#hn-scenario','baseline');
  });
  await page.setViewportSize({width:360,height:800});await page.evaluate(()=>scrollTo(0,0));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,'home-360.png')});
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors,source:'Complete local fixture dataset; not production totals'},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:e.stack,checks,errors},null,2));throw e;}finally{await browser.close();}
})();
