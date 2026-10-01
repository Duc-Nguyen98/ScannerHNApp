const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P08/evidence/revision-15');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),metrics=[],checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date('2026-09-27T05:00:00Z'));
 const act=n=>page.locator('[data-p08="'+n+'"]').first();
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function capture(name){await page.mouse.move(0,0);await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 async function hub(scene){await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action="'+scene+'"]').click();await page.locator('.p08-app').waitFor();}
 async function apply(){await page.locator('.p08-picker [type=submit]').click();}
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');
 await check('Six views share readonly result badge without altering counts or date bar',async()=>{
  for(const [scene,count]of [['history-general',48],['history-daily',48],['documents',29],['nfc',10],['warranty',8],['sessions',8]]){
   await hub(scene);assert.equal(await page.locator('.p08-result-count .p08-count-badge strong').textContent(),String(count));assert.equal(await page.locator('.p08-result-count button').count(),0);assert.equal(await page.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');await capture(scene);
  }
 });
 await check('Daily continuous canvas, no footnote/shadow strip; aligned quantity badges at6 viewports/top and bottom',async()=>{
  await hub('history-daily');
  for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
   await page.setViewportSize({width:w,height:h});await page.locator('.p08-scroll').evaluate(e=>e.scrollTop=0);
   assert.doesNotMatch(await page.locator('.p08-app').textContent(),/Dữ liệu lịch sử được lưu trữ/);assert.equal(await page.locator('.p08-scroll>.p08-hint').count(),0);
   assert.deepEqual(await page.locator('.p08-activity-count strong').allTextContents(),['19','10','6','5','8']);
   const m=await page.locator('.p08-app').evaluate(app=>{const sc=app.querySelector('.p08-scroll'),body=app.querySelector('.p08-body'),screen=app.closest('.hn-screen'),bar=app.querySelector('.p08-filter-summary'),result=app.querySelector('.p08-result-count .p08-count-badge'),counts=[...app.querySelectorAll('.p08-activity-count .p08-count-badge')];return {shell:[screen.offsetWidth,screen.offsetHeight],canvas:[app,body,sc].map(n=>getComputedStyle(n).backgroundColor),cardShadows:[...app.querySelectorAll('.p08-card')].map(n=>getComputedStyle(n).boxShadow),leftAligned:Math.abs(bar.getBoundingClientRect().left-result.getBoundingClientRect().left)<1,widths:counts.map(n=>n.offsetWidth),rightEdges:counts.map(n=>n.getBoundingClientRect().right),overflow:sc.scrollWidth>sc.clientWidth+1,navSafe:sc.getBoundingClientRect().bottom<=screen.querySelector('.hn-nav').getBoundingClientRect().top+1,bad:[...app.querySelectorAll('button,strong,small')].filter(n=>n.clientWidth&&n.scrollWidth>n.clientWidth+1).map(n=>n.textContent)};});
   assert.deepEqual(m.shell,[494,950]);assert.equal(new Set(m.canvas).size,1);assert.ok(m.cardShadows.every(s=>s==='none'));assert.equal(m.leftAligned,true);assert.equal(new Set(m.widths).size,1);assert.ok(m.rightEdges.every(r=>Math.abs(r-m.rightEdges[0])<1));assert.equal(m.overflow,false);assert.equal(m.navSafe,true);assert.deepEqual(m.bad,[]);metrics.push({w,h,...m});
   await capture('daily-top-'+w+'x'+h);await page.locator('.p08-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);await capture('daily-bottom-'+w+'x'+h);
  }await page.setViewportSize({width:494,height:1000});
 });
 await check('Badges update with range/status/query and drilldown; unknown source is not0',async()=>{
  await act('filter').click();await page.fill('[name=from]','08/09/2026');await page.fill('[name=to]','09/09/2026');await apply();assert.equal(await page.locator('.p08-result-count strong').textContent(),'38');assert.deepEqual(await page.locator('.p08-activity-count strong').allTextContents(),['15','8','5','4','6']);
  await page.click('[data-p08-group=inbound]');assert.match(await page.locator('.p08-result-count').textContent(),/15 kết quả/);await act('back').click();await page.locator('.p08-grid').waitFor();
  await act('filter').click();await page.locator('[name=status][value=waiting]').check();await apply();assert.equal(await page.locator('.p08-result-count strong').textContent(),'23');assert.deepEqual(await page.locator('.p08-activity-count strong').allTextContents(),['15','8','0','0','0']);
  await act('clear').click();await page.fill('#p08-search','not-found');assert.equal(await page.locator('.p08-result-count strong').textContent(),'0');await page.selectOption('[data-p08-scenario]','unavailable');assert.equal(await page.locator('.p08-result-count .p08-count-badge').count(),0);assert.equal(await page.locator('.p08-grid').count(),0);assert.match(await page.locator('.p08-result-count').textContent(),/Chưa xác định/);
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'badge-results.json'),JSON.stringify({revision:'P08-r15',checks,metrics,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})();
