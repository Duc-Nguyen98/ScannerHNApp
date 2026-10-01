const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {mockGeography,address}=require('./outbound_geography_helpers.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P08/evidence/revision-13/unified-regression');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],errors=[],metrics=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.setFixedTime(new Date('2026-09-27T05:00:00Z'));await mockGeography(page);
 const act=n=>page.locator('[data-p08="'+n+'"]').first(),snap=async()=>JSON.parse(await page.locator('[data-p08-snapshot]').textContent());
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function hub(action){await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action="'+action+'"]').click();await page.locator('.p08-app').waitFor();}
 async function apply(){await page.locator('.p08-picker [type=submit]').click();}
 async function capture(name){await page.mouse.move(0,0);await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');
 await check('Shared full shell/search/filter on all history lists; per-business source statuses',async()=>{
  for(const [scene,title,statuses] of [
   ['history-general','Lịch sử',['all','waiting','processing','linked','recorded']],
   ['documents','Lịch sử',['all','waiting']],
   ['nfc','Lịch sử NFC',['all','success','revoked']],
   ['warranty','Lịch sử bảo hành',['all','checking','returned']],
   ['sessions','Lịch sử phiên quét',['all','waiting','exported']]
  ]){
   await hub(scene);assert.equal(await page.locator('.p08-header h1').textContent(),title);assert.equal(await page.locator('#p08-search').count(),1);assert.equal(await page.locator('.hn-screen iframe').count(),0);assert.doesNotMatch(await page.locator('.p08-app').textContent(),/Dữ liệu mô phỏng|fixture/i);
   for(const [w,h] of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
    await page.setViewportSize({width:w,height:h});await page.locator('.p08-scroll').evaluate(e=>e.scrollTop=0);
    const m=await page.locator('.p08-app').evaluate(e=>{const s=e.closest('.hn-screen'),sc=e.querySelector('.p08-scroll');return {shell:[s.offsetWidth,s.offsetHeight],overflow:sc.scrollWidth>sc.clientWidth+1,nav:sc.getBoundingClientRect().bottom<=s.querySelector('.hn-nav').getBoundingClientRect().top+1,bad:[...e.querySelectorAll('button,strong,time,small')].filter(n=>n.clientWidth&&n.scrollWidth>n.clientWidth+1).map(n=>n.textContent)};});
    assert.deepEqual(m.shell,[494,950]);assert.equal(m.overflow,false);assert.equal(m.nav,true);assert.deepEqual(m.bad,[]);metrics.push({scene,w,h,...m});await capture(scene+'-'+w+'x'+h);
   }
   await page.setViewportSize({width:494,height:1000});await act('filter').click();assert.deepEqual(await page.locator('[name=status]').evaluateAll(es=>es.map(e=>e.value)),statuses);await capture(scene+'-filter');await page.keyboard.press('Escape');
  }
 });
 await check('NFC type/status/date/search combined; invalid status cleared on type switch; Back restores',async()=>{
  await hub('nfc');await page.fill('#p08-search','HN12345');await page.click('[data-p08-type="Gán thẻ"]');await act('filter').click();assert.equal(await page.locator('[name=status][value=revoked]').count(),0);await page.locator('[name=status][value=success]').check();await page.fill('[name=from]','09/09/2026');await page.fill('[name=to]','27/09/2026');await apply();assert.ok(await page.locator('.p08-row').count()>0);
  await page.locator('.p08-row').first().click();assert.match(await page.locator('.p08-detail-note').textContent(),/UID: NFC/);await act('back').click();assert.equal(await page.inputValue('#p08-search'),'HN12345');assert.equal((await snap()).filters.type,'Gán thẻ');
  await page.click('[data-p08-type="Thu hồi thẻ"]');assert.equal((await snap()).filters.status,'all');await act('clear').click();assert.equal((await snap()).business,'nfc');
 });
 await check('Warranty year/status/timeline consistent and searchable; empty/errors not false success',async()=>{
  await hub('warranty');await page.fill('#p08-search','BH-002');await act('filter').click();await page.locator('[name=status][value=returned]').check();await page.fill('[name=from]','10/09/2026');await page.fill('[name=to]','10/09/2026');await apply();assert.equal(await page.locator('.p08-row').count(),1);await page.locator('.p08-row').click();assert.match(await page.locator('.p08-detail-kv').textContent(),/10\/09\/2026/);await page.click('[data-p08-tab=timeline]');assert.equal(await page.locator('[data-event-id]').count(),3);await capture('warranty-detail');await act('back').click();assert.equal((await snap()).filters.status,'returned');
  await page.fill('#p08-search','not-found');assert.equal(await page.locator('.p08-row').count(),0);
  for(const s of ['loading','error','unavailable']){await page.selectOption('[data-p08-scenario]',s);assert.equal(await page.locator('.p08-row').count(),0);}await page.selectOption('[data-p08-scenario]','ready');
 });
 await check('Session records complete with actor/codes/counts, same detail and context on Back',async()=>{
  await hub('sessions');await page.fill('#p08-search','PQ-0002');await page.locator('.p08-row').click();assert.deepEqual(await page.locator('.p08-counters strong').allTextContents(),['12','12','0']);assert.match(await page.locator('.p08-person').textContent(),/Minh Anh/);await act('codes').click();assert.equal(await page.locator('[data-scan-id]').count(),12);await act('back').click();assert.equal(await page.inputValue('#p08-search'),'PQ-0002');await act('clear').click();await act('filter').click();await page.locator('[name=status][value=exported]').check();await apply();assert.ok((await page.locator('.p08-row-bottom .p08-chip').allTextContents()).every(v=>v==='Đã xuất'));
 });
 await check('Daily uses same search/filter template; statuses/query change full aggregate and drilldown',async()=>{
  await hub('history-daily');assert.equal(await page.locator('#p08-search').count(),1);await act('filter').click();await page.locator('[name=status][value=waiting]').check();await apply();assert.deepEqual(await page.locator('.p08-grid strong').allTextContents(),['19','10','0','0','0','29']);await capture('daily-filtered');await page.click('[data-p08-group=inbound]');assert.equal((await snap()).filters.status,'waiting');assert.match(await page.locator('.p08-result-count').textContent(),/19 kết quả/);await act('back').click();await act('clear').click();assert.deepEqual(await page.locator('.p08-grid strong').allTextContents(),['19','10','6','5','8','48']);
 });
 await check('P05 source/recipient/group share dialog radio UI; Cancel/Apply and source confirmation preserved',async()=>{
  await page.click('[data-tab=home]');await page.locator('.hn-task[data-route=outbound]').click();
  for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
   await page.setViewportSize({width:w,height:h});
   for(const name of ['source','recipient','group']){
    await page.locator('[data-p05-select="'+name+'"]').click();
    const fit=await page.locator('.p08-picker').evaluate(e=>{const r=e.getBoundingClientRect(),s=e.closest('.hn-screen').getBoundingClientRect();return r.top>=s.top-1&&r.bottom<=s.bottom+1&&r.left>=s.left-1&&r.right<=s.right+1&&e.scrollWidth<=e.clientWidth+1;});assert.equal(fit,true);
    for(let i=0;i<8;i++)await page.keyboard.press('Tab');assert.equal(await page.locator('.p08-picker').evaluate(e=>e.contains(document.activeElement)),true);await capture('outbound-'+name+'-'+w+'x'+h);await page.keyboard.press('Escape');
   }
  }await page.setViewportSize({width:494,height:1000});
  for(const name of ['source','recipient','group']){
   await page.locator('[data-p05-select="'+name+'"]').click();assert.equal(await page.locator('.p08-picker').count(),1);assert.equal(await page.locator('.p08-options input:checked').count(),1);await capture('outbound-'+name);await page.keyboard.press('Escape');assert.equal(await page.locator('[data-p05-select="'+name+'"]').evaluate(e=>e===document.activeElement),true);
  }
  await page.click('[data-p05-select=recipient]');await page.locator('[name=choice][value=an-binh]').check();await page.keyboard.press('Escape');assert.equal(await page.locator('[data-p05-select=recipient]').getAttribute('data-value'),'minh-phat');
  await page.click('[data-p05-select=recipient]');await page.locator('[name=choice][value=an-binh]').check();await apply();assert.equal(await page.locator('[data-p05-field=phone]').inputValue(),'0912 345 678');
  await page.click('[data-p05-select=source]');await page.locator('[name=choice][value=board-0005]').check();await apply();assert.equal(await page.locator('.p05-source-confirm').count(),1);await page.click('[data-p05=cancel-source]');assert.equal(await page.locator('[data-p05-select=source]').getAttribute('data-value'),'new');
  await page.click('[data-p05-select=source]');await page.locator('[name=choice][value=board-0005]').check();await apply();await page.click('[data-p05=apply-source]');assert.equal(await page.locator('[data-p05-field=planned]').inputValue(),'10');
  await address(page);await page.click('[data-p05=next]');await page.click('[data-p05=manual]');await page.fill('#p05-code','HN12345');await page.locator('#p05-code').press('Enter');await page.click('[data-p05=back]');assert.equal(await page.locator('[data-p05-select=source]').isDisabled(),true);assert.equal(await page.locator('[data-p05-select=group]').isDisabled(),true);
 });
 await check('Legacy history routes use shared views; unknown IDs fail closed; logout cannot restore protected views',async()=>{
  for(const business of ['nfc','warranty','sessions']){
   await page.evaluate(b=>location.hash='#p02/history?scene='+b,business);await page.locator('.p08-app[data-business="'+business+'"]').waitFor();assert.equal(await page.locator('#p08-search').count(),1);
  }
  await page.evaluate(()=>location.hash='#p02/history-list?panel=2&business=warranty&record=not-found');await page.locator('.p08-state').waitFor();assert.match(await page.locator('.p08-state').textContent(),/Không tìm thấy/);assert.equal(await page.locator('.p08-detail-hero').count(),0);
  await hub('warranty');assert.equal(await page.locator('.p08-app').getAttribute('data-screen-id'),'P23.S01');await page.fill('#p08-search','BH-002');await page.locator('.p08-row').click();assert.equal(await page.locator('.p08-app').getAttribute('data-screen-id'),'P23.S02');
  await page.locator('.hn-tools>details').first().locator('summary').click();await page.click('#hn-logout');await page.goBack();await page.locator('#login-form').waitFor();assert.equal(await page.locator('.p08-app').count(),0);
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({revision:'P08-r13 shared regression',checks,metrics,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({checks,error:e.stack,errors},null,2));throw e;}finally{await browser.close();}
})();
