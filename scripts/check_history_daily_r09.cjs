const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P08/evidence/revision-09');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}}),checks=[],metrics=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action=history-general]').click();
 await check('Search focus has no inner outline/background activation; typing, clear and keyboard focus preserved',async()=>{
  await page.click('#p08-search');assert.deepEqual(await page.locator('#p08-search').evaluate(e=>({outline:getComputedStyle(e).outlineStyle,shadow:getComputedStyle(e).boxShadow})),{outline:'none',shadow:'none'});
  await page.fill('#p08-search','HN12345');assert.equal(await page.locator('#p08-search').evaluate(e=>e===document.activeElement),true);assert.equal(await page.locator('.p08-row').count(),2);await page.locator('.hn-screen').screenshot({path:path.join(out,'search-focused.png')});
  await page.keyboard.press('Tab');assert.equal(await page.getByRole('button',{name:'Bộ lọc lịch sử',exact:true}).evaluate(e=>e===document.activeElement),true);
  await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#p08-search').evaluate(e=>getComputedStyle(e).outlineStyle),'none');await page.fill('#p08-search','');
 });
 await page.click('[data-p08-preview="4"]');
 await check('Daily six viewports: muted visual tokens, six read-only stats, five groups, fixed nav',async()=>{
  for(const [w,h]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
   await page.setViewportSize({width:w,height:h});await page.mouse.move(0,0);await page.locator('.p08-scroll').evaluate(e=>e.scrollTop=0);
   assert.equal(await page.locator('.p08-demo-label').count(),0);assert.equal(await page.locator('.p08-grid button').count(),0);assert.equal(await page.locator('.p08-group').count(),5);
   assert.deepEqual(await page.locator('.p08-grid strong').allTextContents(),['12','6','4','3','5','30']);
   const m=await page.locator('.p08-app').evaluate(e=>{const s=e.closest('.hn-screen'),sc=e.querySelector('.p08-scroll');return {shell:[s.offsetWidth,s.offsetHeight],overflow:sc.scrollWidth>sc.clientWidth+1,navSafe:sc.getBoundingClientRect().bottom<=s.querySelector('.hn-nav').getBoundingClientRect().top+1,colors:[...e.querySelectorAll('.p08-grid svg,.p08-day-tile svg')].map(n=>getComputedStyle(n).color),bad:[...e.querySelectorAll('button,strong,small')].filter(n=>n.clientWidth&&n.scrollWidth>n.clientWidth+1).map(n=>n.textContent)};});
   assert.deepEqual(m.shell,[494,950]);assert.equal(m.overflow,false);assert.equal(m.navSafe,true);assert.deepEqual(m.bad,[]);assert.equal(new Set(m.colors).size,1);const alignment=await page.locator('.p08-app').evaluate(e=>{
     const sc=e.querySelector('.p08-scroll'),date=e.querySelector('.p08-day-button'),over=e.querySelector('.p08-day-overview'),list=e.querySelector('.p08-day-activities'),grid=e.querySelector('.p08-grid');
     const rect=n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};};
     return {outer:[date,over,list].map(rect),inner:[over.querySelector('h2'),grid,list.querySelector('.p08-section-head'),list.querySelector('.p08-group')].map(rect),padding:getComputedStyle(sc).paddingLeft,gap:getComputedStyle(sc).gap,cardPadding:getComputedStyle(over).paddingLeft,totalBg:getComputedStyle(e.querySelector('.p08-stat-total')).backgroundColor,normalBg:getComputedStyle(e.querySelector('.p08-stat')).backgroundColor,tiles:[...grid.children].map(n=>[n.getBoundingClientRect().width,n.getBoundingClientRect().height])};
   });
   assert.equal(alignment.padding,'18px');assert.equal(alignment.cardPadding,'16px');assert.equal(alignment.gap,'16px');
   for(const r of alignment.outer){assert.ok(Math.abs(r.left-alignment.outer[0].left)<1);assert.ok(Math.abs(r.right-alignment.outer[0].right)<1);}
   for(const r of alignment.inner){assert.ok(Math.abs(r.left-alignment.inner[0].left)<1);assert.ok(Math.abs(r.right-alignment.inner[0].right)<1);}
   assert.notEqual(alignment.totalBg,alignment.normalBg);
   for(const [width,height]of alignment.tiles){assert.ok(Math.abs(width-alignment.tiles[0][0])<1);assert.ok(Math.abs(height-alignment.tiles[0][1])<1);}
   metrics.push({viewport:[w,h],...m,alignment});
   await page.locator('.hn-screen').screenshot({path:path.join(out,'daily-'+w+'x'+h+'.png')});
  }
 });
 await check('Same custom calendar and aggregates; group opens scoped list, Back restores day; missing is not zero',async()=>{
  await page.setViewportSize({width:494,height:1000});await page.click('[data-p08=choose-day]');await page.click('[data-calendar=day]');assert.equal(await page.locator('.app-modal-host').count(),1);await page.locator('.hn-screen').screenshot({path:path.join(out,'daily-calendar.png')});await page.click('[data-date="2026-09-08"]');await page.locator('.p08-picker [type=submit]').click();
  assert.deepEqual(await page.locator('.p08-grid strong').allTextContents(),['3','2','1','1','1','8']);
  await page.click('[data-p08-group=warranty]');assert.equal(await page.locator('.p08-row').count(),1);const snapshot=JSON.parse(await page.locator('[data-p08-snapshot]').textContent());assert.equal(snapshot.filters.from,'2026-09-08');assert.equal(snapshot.filters.type,'warranty');
  await page.locator('[data-p08=back]').click();await page.locator('.p08-grid').waitFor();assert.match(await page.locator('[data-p08=choose-day]').textContent(),/08\/09\/2026/);
  await page.click('[data-p08=choose-day]');await page.fill('[name=day]','01/10/2026');await page.locator('.p08-picker [type=submit]').click();assert.equal(await page.locator('.p08-grid').count(),0);assert.match(await page.locator('.p08-state').textContent(),/Chưa có thống kê/);
 });
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({revision:'P08-r09',checks,metrics,errors,integration:'NOT_RUN'},null,2));
}catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}})();
