const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P08/evidence/revision-13');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],metrics=[],errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date('2026-09-27T05:00:00Z'));
 const act=n=>page.locator('[data-p08="'+n+'"]').first(),snap=async()=>JSON.parse(await page.locator('[data-p08-snapshot]').textContent());
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function hub(scene){await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action="'+scene+'"]').click();await page.locator('.p08-app').waitFor();}
 async function apply(){await page.locator('.p08-picker [type=submit]').click();}
 async function capture(name){await page.mouse.move(0,0);await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');
 await check('All6 fresh entries default All days and identical from/to picker, with date limits',async()=>{
  let signature;
  for(const scene of ['history-general','history-daily','documents','nfc','warranty','sessions']){
   await hub(scene);assert.equal(await page.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');assert.equal(await page.locator('[data-p08=clear]').count(),0);
   for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
    await page.setViewportSize({width:w,height:h});await page.locator('.p08-scroll').evaluate(e=>e.scrollTop=0);
    const m=await page.locator('.p08-filter-summary').evaluate(e=>{const b=e.querySelector('button'),s=getComputedStyle(b),p=e.closest('.p08-scroll');return {width:b.offsetWidth,full:e.offsetWidth,height:b.offsetHeight,bg:s.backgroundColor,padding:s.padding,radius:s.borderRadius,overflow:p.scrollWidth>p.clientWidth+1};});
    assert.equal(m.width,m.full);assert.equal(m.height,44);assert.equal(m.overflow,false);signature??=m;assert.deepEqual(m,signature);metrics.push({scene,w,h,...m});await capture(scene+'-'+w+'x'+h);
   }await page.setViewportSize({width:494,height:1000});
   await page.locator('.p08-filter-summary button').click();assert.deepEqual(await page.locator('.p08-date-entry input').evaluateAll(es=>es.map(e=>[e.name,e.value])),[['from',''],['to','']]);assert.equal(await page.locator('.p08-picker h2').textContent(),'Bộ lọc lịch sử');await capture(scene+'-filter');
   await page.click('[data-calendar=from]');assert.equal(await page.locator('[data-date="2026-09-28"]').isDisabled(),true);for(let i=0;i<3;i++)await page.click('[data-month="-1"]');assert.equal(await page.locator('[data-date="2026-06-28"]').isDisabled(),true);assert.equal(await page.locator('[data-date="2026-06-29"]').isEnabled(),true);await page.keyboard.press('Escape');
  }
 });
 await check('Daily aggregate all/range/single-day, captions and Clear synchronize',async()=>{
  await hub('history-daily');assert.deepEqual(await page.locator('.p08-grid strong').allTextContents(),['19','10','6','5','8','48']);assert.equal(await page.locator('#p08-overview-title').textContent(),'Tổng quan hoạt động');
  await act('filter').click();await page.fill('[name=from]','08/09/2026');await page.fill('[name=to]','09/09/2026');await apply();
  assert.deepEqual(await page.locator('.p08-grid strong').allTextContents(),['15','8','5','4','6','38']);assert.equal(await page.locator('#p08-overview-title').textContent(),'Tổng quan theo khoảng ngày');await capture('daily-range');
  await act('filter').click();await page.fill('[name=from]','09/09/2026');await apply();assert.deepEqual(await page.locator('.p08-grid strong').allTextContents(),['12','6','4','3','5','30']);assert.equal(await page.locator('#p08-overview-title').textContent(),'Tổng quan trong ngày');
  await act('clear').click();assert.equal(await page.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');assert.equal(await page.locator('.p08-grid strong').last().textContent(),'48');
 });
 await check('Range/query/status persist through drilldown and Back; Cancel does not mutate',async()=>{
  await act('filter').click();await page.fill('[name=from]','08/09/2026');await page.fill('[name=to]','09/09/2026');await page.locator('[name=status][value=waiting]').check();await apply();await page.fill('#p08-search','Minh Anh');assert.equal(await page.locator('.p08-grid strong').last().textContent(),'23');
  await page.click('[data-p08-group=inbound]');assert.match(await page.locator('.p08-result-count').textContent(),/15 kết quả/);const f=(await snap()).filters;assert.equal(f.from,'2026-09-08');assert.equal(f.to,'2026-09-09');assert.equal(f.status,'waiting');assert.equal(f.q,'Minh Anh');
  await act('back').click();await page.locator('.p08-grid').waitFor();assert.equal((await snap()).dayFilters.from,'2026-09-08');assert.equal(await page.locator('.p08-grid strong').last().textContent(),'23');
  const before=(await snap()).dayFilters;await act('filter').click();await page.fill('[name=from]','29/06/2026');await page.keyboard.press('Escape');assert.deepEqual((await snap()).dayFilters,before);
 });
 await check('Future/day91 typed input rejected, missing source distinct from empty; fresh hub resets defaults',async()=>{
  await act('filter').click();for(const value of ['28/06/2026','28/09/2026']){await page.fill('[name=from]',value);await apply();assert.ok(await page.locator('[data-error]').textContent());}await page.keyboard.press('Escape');
  await act('clear').click();await page.fill('#p08-search','NOT-FOUND');assert.equal(await page.locator('.p08-grid strong').last().textContent(),'0');await act('clear').click();
  await act('filter').click();await page.fill('[name=from]','20/09/2026');await page.fill('[name=to]','21/09/2026');await apply();assert.equal(await page.locator('.p08-grid').count(),0);assert.match(await page.locator('.p08-state').textContent(),/Chưa có thống kê/);
  await hub('history-daily');assert.equal(await page.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');assert.equal(await page.locator('.p08-grid strong').last().textContent(),'48');
  for(const s of ['loading','error','unavailable']){await page.selectOption('[data-p08-scenario]',s);assert.equal(await page.locator('.p08-grid').count(),0);}await page.selectOption('[data-p08-scenario]','ready');
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'range-results.json'),JSON.stringify({revision:'P08-r13',checks,metrics,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})();
