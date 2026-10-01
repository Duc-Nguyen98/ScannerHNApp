const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P08/evidence/revision-14');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],metrics=[],errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date('2026-09-27T05:00:00Z'));
 const act=n=>page.locator('[data-p08="'+n+'"]').first();
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function hub(scene){await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action="'+scene+'"]').click();await page.locator('.p08-app').waitFor();}
 async function apply(){await page.locator('.p08-picker [type=submit]').click();}
 async function capture(name){await page.mouse.move(0,0);await page.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');
 await check('Six filter dialogs default today draft; stacked dates/equal3button footer at6 viewports; no format note',async()=>{
  for(const scene of ['history-general','history-daily','documents','nfc','warranty','sessions']){
   await hub(scene);assert.equal(await page.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');
   for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
    await page.setViewportSize({width:w,height:h});await act('filter').click();
    assert.deepEqual(await page.locator('.p08-date-entry input').evaluateAll(es=>es.map(e=>e.value)),['27/09/2026','27/09/2026']);assert.equal(await page.locator('.p08-picker .p08-picker-help').count(),0);
    assert.deepEqual(await page.locator('.p08-picker footer button').allTextContents(),['Đặt lại','Hủy','Áp dụng']);
    const m=await page.locator('.p08-picker').evaluate(e=>{const r=e.getBoundingClientRect(),s=e.closest('.hn-screen').getBoundingClientRect(),fields=[...e.querySelectorAll('.p08-date-entry')].map(n=>n.getBoundingClientRect()),buttons=[...e.querySelectorAll('footer button')].map(n=>({w:n.offsetWidth,h:n.offsetHeight,top:n.getBoundingClientRect().top,border:getComputedStyle(n).borderTopStyle}));return {inside:r.top>=s.top-1&&r.bottom<=s.bottom+1&&r.left>=s.left-1&&r.right<=s.right+1,overflow:e.scrollWidth>e.clientWidth+1,stacked:fields[1].top>fields[0].bottom,aligned:Math.abs(fields[0].left-fields[1].left)<1,buttons};});
    assert.equal(m.inside,true);assert.equal(m.overflow,false);assert.equal(m.stacked,true);assert.equal(m.aligned,true);assert.ok(m.buttons.every(b=>b.h>=48&&Math.abs(b.w-m.buttons[0].w)<=1&&Math.abs(b.top-m.buttons[0].top)<1&&b.border==='solid'));metrics.push({scene,w,h,...m});await capture(scene+'-'+w+'x'+h);
    for(let i=0;i<18;i++)await page.keyboard.press('Tab');assert.equal(await page.locator('.p08-picker').evaluate(e=>e.contains(document.activeElement)),true);
    await page.keyboard.press('Escape');assert.equal(await page.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');
   }
  }
  await page.setViewportSize({width:494,height:1000});
 });
 await check('Existing range retained; Reset is draft-only; reset Apply returns All days; reopen current-day seed',async()=>{
  await hub('history-general');await act('filter').click();await page.fill('[name=from]','08/09/2026');await page.fill('[name=to]','09/09/2026');await page.locator('[name=status][value=waiting]').check();await apply();assert.match(await page.locator('.p08-result-count').textContent(),/23 kết quả/);
  await act('filter').click();assert.deepEqual(await page.locator('.p08-date-entry input').evaluateAll(es=>es.map(e=>e.value)),['08/09/2026','09/09/2026']);
  await page.getByRole('button',{name:'Đặt lại',exact:true}).click();assert.deepEqual(await page.locator('.p08-date-entry input').evaluateAll(es=>es.map(e=>e.value)),['','']);assert.equal(await page.locator('[name=status]:checked').inputValue(),'all');await page.getByRole('button',{name:'Hủy',exact:true}).click();assert.match(await page.locator('.p08-result-count').textContent(),/23 kết quả/);
  await act('filter').click();await page.click('[data-reset]');await capture('reset-draft');await apply();assert.equal(await page.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');assert.match(await page.locator('.p08-result-count').textContent(),/48 kết quả/);
  await act('filter').click();assert.equal(await page.inputValue('[name=from]'),'27/09/2026');await apply();assert.equal(await page.locator('.p08-filter-summary button').textContent(),'27/09/2026');
 });
 await check('Current-day value uses runtime Vietnam date, not2025 literal; calendar and90-day guard remain',async()=>{
  await act('clear').click();await page.clock.setFixedTime(new Date('2026-09-27T17:01:00Z'));await act('filter').click();assert.equal(await page.inputValue('[name=from]'),'28/09/2026');assert.equal(await page.inputValue('[name=to]'),'28/09/2026');
  await page.click('[data-calendar=from]');assert.equal(await page.locator('[data-date="2026-09-29"]').isDisabled(),true);await capture('calendar');await page.click('[data-calendar-back]');await page.fill('[name=from]','29/06/2026');await apply();assert.ok(await page.locator('[data-error]').textContent());await page.fill('[name=from]','29/09/2026');await apply();assert.ok(await page.locator('[data-error]').textContent());await page.keyboard.press('Escape');
  assert.equal(await page.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'filter-results.json'),JSON.stringify({revision:'P08-r14',checks,metrics,errors},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})();
