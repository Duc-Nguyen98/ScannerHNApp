const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P09/evidence/revision-09/dataset');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const {WARRANTY_SEED,WARRANTY_LEDGER}=await import('../docs/flows/shared/warranty-cases.mjs');
 const b=await chromium.launch({headless:true}),p=await b.newPage({viewport:{width:494,height:1000}}),checks=[],errors=[],metrics=[];
 p.on('pageerror',e=>errors.push(e.message));
 const act=a=>p.locator(`[data-p09="${a}"]`).first(),tab=t=>p.locator(`[data-p09-tab="${t}"]`);
 const check=async(name,fn)=>{await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);};
 const shot=async n=>p.locator('.hn-screen').screenshot({path:path.join(out,n+'.png')});
 const clean=async()=>assert.doesNotMatch(await p.locator('.p09-app').innerText(),/dữ liệu mẫu|demo|fixture|Chưa có dữ liệu/i);
 try{
  await p.goto('http://127.0.0.1:8766/flows/auth-session/?review=p09-r09');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.locator('#hn-home:visible').waitFor();await p.click('[data-route=warranty]');
  await check('Eight list records have customers and no sample badges',async()=>{assert.equal(await p.locator('[data-p09-case]').count(),8);await clean();await shot('list');});
  await check('All eight profiles reconcile customer, symptom, accessories, result, ledger and timeline',async()=>{
   for(const c of WARRANTY_SEED){
    await p.fill('#p09-query',c.id);await p.click(`[data-p09-case="${c.id}"]`);
    const text=(await p.locator('.p09-case-kv').allTextContents()).join(' ');for(const value of [c.customer,c.contact,c.fault,c.accessories,c.note,c.result||'Chưa cập nhật kết quả sửa chữa'])assert.ok(text.includes(value),c.id+':'+value);
    assert.equal(await act('update').isDisabled(),c.status==='Đã trả khách');await clean();
    if(c.status==='Chờ bàn giao')assert.equal(await act('list').count(),1);
    await tab('parts').click();const docs=WARRANTY_LEDGER.filter(d=>d.caseId===c.id);assert.equal(await p.locator('.p09-document').count(),docs.length);assert.equal(Number(await tab('parts').locator('.hn-tab-count').textContent()),docs.flatMap(d=>d.lines).reduce((n,l)=>n+l.quantity,0));await clean();
    await tab('events').click();assert.equal(await p.locator('.p09-timeline li').count(),c.events.length);assert.deepEqual(await p.locator('.p09-event-description').allTextContents(),c.events.map(e=>e.description));await clean();await act('back').click();assert.equal(await p.inputValue('#p09-query'),c.id);
   }
  });
  await check('Search by customer without Vietnamese accents preserves exact case',async()=>{await p.fill('#p09-query','phuc an');assert.equal(await p.locator('[data-p09-case]').count(),1);await p.click('[data-p09-case=BH-005]');});
  await check('Rich waiting-handover profile fits three tabs at six viewport sizes',async()=>{
   for(const t of ['info','parts','events']){await tab(t).click();for(const [width,height]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
    await p.setViewportSize({width,height});await p.locator('.p09-scroll').evaluate(e=>e.scrollTop=0);
    const m=await p.locator('.p09-app').evaluate(a=>{const s=a.closest('.hn-screen'),sc=a.querySelector('.p09-scroll'),f=a.querySelector('.p09-footer');return {shell:[s.offsetWidth,s.offsetHeight],overflow:sc.scrollWidth>sc.clientWidth+1,footerInside:f.getBoundingClientRect().bottom<=s.getBoundingClientRect().bottom+1,contentAboveFooter:sc.getBoundingClientRect().bottom<=f.getBoundingClientRect().top+1};});assert.deepEqual(m.shell,[494,950]);assert.ok(!m.overflow&&m.footerInside&&m.contentAboveFooter);metrics.push({tab:t,width,height,...m});await shot('BH005-'+t+'-'+width+'x'+height);
   }}await p.setViewportSize({width:494,height:1000});
  });
  await check('Warranty history uses the same waiting-handover case and events',async()=>{
   await act('list').click();
   // Open via the shared history hub rather than relying on a guessed detail URL.
   await p.click('[data-tab=history]');await p.frameLocator('iframe').locator('[data-action=warranty]').click();await p.fill('#p08-search','BH-005');await p.locator('.p08-row').click();await p.click('[data-p08-tab=timeline]');assert.equal(await p.locator('[data-event-id]').count(),WARRANTY_SEED.find(c=>c.id==='BH-005').events.length);await shot('history-BH005');
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,metrics,errors,production:'NOT_RUN'},null,2));
 }catch(e){await p.screenshot({path:path.join(out,'failure.png'),fullPage:true});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,error:e.stack,errors},null,2));throw e;}finally{await b.close();}
})();
