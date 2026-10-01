const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve('handoff/P08/evidence/revision-03');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000}});
 const checks=[],metrics=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const frame=()=>page.frameLocator('iframe');
 async function hub(){await page.locator('[data-tab="history"]').click();await frame().locator('[data-history-hub="true"]').waitFor();}
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 try{
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await hub();
 await check('Requested removals scoped to embedded hub; six entries retained',async()=>{
   assert.equal(await frame().locator('.history-demo,.resume-shortcut').count(),0);
   assert.equal(await frame().locator('.history-link').count(),6);
   assert.equal(await frame().locator('.history-link .history-forward').count(),6);
   assert.equal(await frame().locator('.history-link button').count(),0);
 });
 await check('Six viewports fixed shell, complete hub content above nav, touch targets and no overflow',async()=>{
   for(const [w,h] of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
     await page.setViewportSize({width:w,height:h});
     const m=await page.locator('iframe').evaluate(f=>{
       const d=f.contentDocument,b=d.querySelector('.body'),p=d.querySelector('.phone'),back=d.querySelector('.titlebar button'),s=f.closest('.hn-screen');
       return {shell:[s.offsetWidth,s.offsetHeight],overflow:b.scrollWidth>b.clientWidth+1,hiddenContent:b.scrollHeight>b.clientHeight+1,back:[back.offsetWidth,back.offsetHeight],minRow:Math.min(...[...d.querySelectorAll('.history-link')].map(e=>e.offsetHeight)),frameBottom:f.getBoundingClientRect().bottom,navTop:s.querySelector('.hn-nav').getBoundingClientRect().top};
     });
     assert.deepEqual(m.shell,[494,950]);assert.equal(m.overflow,false);assert.equal(m.hiddenContent,false);assert.deepEqual(m.back,[44,44]);assert.ok(m.minRow>=86);assert.ok(m.frameBottom<=m.navTop+1);metrics.push({viewport:[w,h],...m});
     await page.locator('.hn-screen').screenshot({path:path.join(out,'hub-'+w+'x'+h+'.png')});
   }
   await page.setViewportSize({width:494,height:1000});
 });
 await check('Left icon, text and chevron open same exact list; Back restores row focus',async()=>{
   for(const target of ['.icon-tile svg','.grow','.history-forward']){
     await frame().locator('[data-action="history-general"] '+target).click();
     await page.locator('[data-panel="P08.S01"]').waitFor();
     assert.equal(JSON.parse(await page.locator('[data-p08-snapshot]').textContent()).filters.scope,'all');
     await page.locator('[data-p08="back"]').click();await frame().locator('.history-link').first().waitFor();
     assert.equal(await frame().locator('[data-action="history-general"]').evaluate(e=>e===e.ownerDocument.activeElement),true);
   }
 });
 await check('All six left icons route to existing destinations without extra notification dialog',async()=>{
   for(const [action,expected] of [['history-daily','[data-panel="P08.S04"]'],['documents','[data-panel="P08.S01"]'],['nfc',null],['warranty',null],['sessions',null]]){
     await hub();await frame().locator('[data-action="'+action+'"] .icon-tile svg').click();
     if(expected)await page.locator(expected).waitFor();
     else assert.equal(await frame().locator('h1').textContent(),({nfc:'Lịch sử NFC',warranty:'Lịch sử bảo hành',sessions:'Lịch sử phiên quét'})[action]);
     if(action==='documents')assert.equal(JSON.parse(await page.locator('[data-p08-snapshot]').textContent()).filters.scope,'documents');
   }
 });
 await check('Keyboard access, clear focus, reduced motion and header Back to Home',async()=>{
   await hub();const row=frame().locator('[data-action="history-general"]');
   await row.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
   assert.equal(await row.evaluate(e=>e.ownerDocument.defaultView.getComputedStyle(e).outlineStyle),'solid');
   await row.press('Enter');await page.locator('[data-panel="P08.S01"]').waitFor();await page.locator('[data-p08="back"]').click();
   await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await frame().locator('.history-link').first().evaluate(e=>e.ownerDocument.defaultView.getComputedStyle(e).transitionDuration),'0s');
   await frame().getByRole('button',{name:'Về Trang chủ',exact:true}).click();await page.locator('.hn-intro').waitFor();
 });
 await check('Standalone retained notice shortcut; other P08 screens retain r02 label',async()=>{
   const other=await browser.newPage();await other.goto('http://127.0.0.1:8766/flows/warranty-components/?mode=screen&scene=history-hub');
   assert.equal(await other.locator('.resume-shortcut').count(),1);assert.equal(await other.locator('.statusbar').isVisible(),true);await other.close();
   await hub();await frame().locator('[data-action="history-general"]').click();assert.equal(await page.locator('.p08-demo-label').textContent(),'Dữ liệu mô phỏng');
 });
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'hub-results.json'),JSON.stringify({revision:'P08-r03',checks,metrics,errors,integration:'NOT_RUN'},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})();
