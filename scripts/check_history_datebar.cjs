const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P08/evidence/revision-12');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),metrics=[],errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.setFixedTime(new Date('2026-09-27T05:00:00Z'));
 const scenes=['history-general','history-daily','documents','nfc','warranty','sessions'];
 let reference;
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');
 for(const scene of scenes){
  await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action="'+scene+'"]').click();await page.locator('.p08-filter-summary').waitFor();
  for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
   await page.setViewportSize({width:w,height:h});await page.mouse.move(0,0);await page.locator('.p08-scroll').evaluate(e=>e.scrollTop=0);
   const m=await page.locator('.p08-filter-summary').evaluate(e=>{const b=e.querySelector('button'),s=getComputedStyle(b),i=getComputedStyle(b.querySelector('svg')),t=getComputedStyle(b.querySelector('span'));return {width:b.offsetWidth,containerWidth:e.offsetWidth,height:b.offsetHeight,bg:s.backgroundColor,border:s.borderRadius,padding:s.padding,font:t.fontSize,line:t.lineHeight,icon:[i.width,i.height,i.color],clearInside:e.querySelectorAll('[data-p08=clear]').length,overflow:b.scrollWidth>b.clientWidth+1};});
   assert.equal(m.width,m.containerWidth);assert.equal(m.height,44);assert.equal(m.clearInside,0);assert.equal(m.overflow,false);
   const signature=[m.width,m.height,m.bg,m.border,m.padding,m.font,m.line,...m.icon];reference??=signature;assert.deepEqual(signature,reference);
   metrics.push({scene,viewport:[w,h],...m});await page.locator('.hn-screen').screenshot({path:path.join(out,scene+'-'+w+'x'+h+'.png')});
  }
  await page.setViewportSize({width:494,height:1000});
  await page.locator('.p08-filter-summary button').click();assert.doesNotMatch(await page.locator('.p08-picker').textContent(),/hôm nay lùi 90 ngày|Để xem lịch sử cũ hơn/);
  await page.locator('[data-calendar="'+(scene==='history-daily'?'day':'from')+'"]').click();
  assert.equal(await page.locator('.p08-picker[data-view=calendar] .p08-picker-help').count(),0);
  const fit=await page.locator('.p08-picker').evaluate(e=>{const r=e.getBoundingClientRect(),s=e.closest('.hn-screen').getBoundingClientRect();return r.top>=s.top&&r.bottom<=s.bottom&&e.scrollWidth<=e.clientWidth;});assert.equal(fit,true);assert.equal(await page.locator('.app-modal-host').count(),1);
  assert.equal(await page.locator('[data-date="2026-09-28"]').isDisabled(),true);
  for(let i=0;i<3;i++)await page.locator('[data-month="-1"]').click();
  assert.equal(await page.locator('[data-date="2026-06-28"]').isDisabled(),true);assert.equal(await page.locator('[data-date="2026-06-29"]').isEnabled(),true);
  await page.mouse.move(0,0);await page.locator('.hn-screen').screenshot({path:path.join(out,scene+'-calendar.png')});
  await page.keyboard.press('Escape');assert.equal(await page.locator('.p08-filter-summary button').evaluate(e=>e===document.activeElement),true);
  if(scene==='history-general'){
   await page.locator('.p08-filter-summary button').click();await page.locator('[name=status][value=waiting]').check();await page.locator('.p08-picker [type=submit]').click();
   assert.match(await page.locator('.p08-active-status').textContent(),/Chờ xử lý trên Web/);assert.equal(await page.locator('.p08-filter-summary button').evaluate(e=>e.offsetHeight),44);
   await page.locator('[data-p08=clear]').click();assert.equal(await page.locator('.p08-filter-summary button').textContent(),'Tất cả ngày');
  }
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'datebar-results.json'),JSON.stringify({revision:'P08-r12',status:'PASS',surfaces:6,viewports:6,metrics,errors},null,2));console.log('PASS 6 surfaces x 6 viewports; full-width shared date style; calendar copy removed; range locks/focus/clear preserved');
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})();
