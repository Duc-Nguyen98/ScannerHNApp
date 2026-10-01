const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {mockGeography,address,choose}=require('./outbound_geography_helpers.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.MANUAL_AUDIT_DIR||'handoff/ux-audit-2026-09-30-r02/p04-p05/before');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true}),results=[],errors=[];try{
for(const [p,route]of[['p04','inbound'],['p05','outbound']]){
const page=await browser.newPage({viewport:{width:494,height:1000},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));await mockGeography(page);await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator(`.hn-task[data-route="${route}"]`).click();
const act=n=>page.locator(`[data-${p}="${n}"]`).first(),snap=()=>page.locator(`[data-${p}-snapshot]`).evaluate(e=>JSON.parse(e.textContent));
if(p==='p05'){await address(page);await page.fill('[data-p05-field="planned"]','10');}
await act('next').click();await act('manual').click();await page.fill(`#${p}-code`,'HN12345');await page.locator(`#${p}-code`).press('Enter');
await page.locator(`#${p}-code`).focus();await page.locator(`#${p}-code`).evaluate(e=>window.heldInput=e);
for(const [width,height]of[[340,420],[390,400],[390,844],[494,1000]]){await page.setViewportSize({width,height});await page.waitForTimeout(100);const m=await page.evaluate(p=>{const e=document.querySelector(`#${p}-code`),r=e.getBoundingClientRect(),a=document.querySelector(`.${p}-scroll`).getBoundingClientRect();return{p,viewport:[innerWidth,innerHeight],input:[r.top,r.bottom],scroll:[a.top,a.bottom],inside:r.top>=a.top-1&&r.bottom<=a.bottom+1,active:e===document.activeElement,connected:e===window.heldInput};},p);results.push({case:'focused-resize',...m});await page.locator('.hn-screen').screenshot({path:path.join(out,`${p}-focus-${width}x${height}.png`)});}
await page.setViewportSize({width:494,height:1000});
for(const code of ['HN12348','HN12349','HN12350','HN12351','HN12346']){await page.fill(`#${p}-code`,code);await page.locator(`#${p}-code`).press('Enter');}
await act('all').click();await page.locator(`.${p}-scroll`).evaluate(e=>e.scrollTop=e.scrollHeight);await act('all').click();results.push({case:'collapse-focus',p,result:await page.evaluate(p=>({scroll:document.querySelector(`.${p}-scroll`).scrollTop,active:document.activeElement.outerHTML.slice(0,220)}),p)});
await page.fill(`#${p}-code`,'CHƯA-GỬI');await act('next').click();await act('back').click();results.push({case:'review-back',p,value:await page.locator(`#${p}-code`).inputValue(),active:await page.evaluate(()=>document.activeElement.outerHTML.slice(0,180))});
if(p==='p05'){
await act('back').click();if(await act('edit-shipping').isVisible())await act('edit-shipping').click();await choose(page,'recipient','walk-in');const long='Tên'.repeat(700);await page.fill('[data-p05-field="recipient"]',long);await page.fill('[data-p05-field="phone"]','0901234567');await address(page);await act('next').click();await act('next').click();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const m=await page.evaluate(()=>{const e=[...document.querySelectorAll('.p05-summary-row')].find(e=>e.textContent.includes('Người nhận')),r=e.getBoundingClientRect();return{height:r.height,reader:e.querySelector('[data-hn-readable]')!==null,contentLength:e.textContent.length,scrollHeight:document.querySelector('.p05-scroll').scrollHeight};});results.push({case:'long-recipient-review',p,...m});await page.locator('.hn-screen').screenshot({path:path.join(out,'p05-long-review.png')});
if(process.env.MANUAL_AUDIT_VERIFY==='1'){
 assert.ok(m.height<150&&m.reader);const trigger=page.getByRole('button',{name:'Xem đầy đủ người nhận',exact:true});await trigger.click();await page.locator('.hn-readable-dialog').waitFor();assert.equal(await page.locator('.hn-readable-dialog .app-modal-body p').textContent(),long);
 for(const [width,height]of [[494,1000],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){await page.setViewportSize({width,height});await page.waitForTimeout(70);const d=await page.locator('.hn-readable-dialog').evaluate(n=>{const r=n.getBoundingClientRect(),s=document.querySelector('.hn-screen').getBoundingClientRect(),f=n.querySelector('footer').getBoundingClientRect();return r.right<=s.right+1&&r.left>=s.left-1&&f.bottom<=s.bottom+1&&n.querySelector('.app-modal-body').clientHeight>0;});assert.ok(d);await page.locator('.hn-screen').screenshot({path:path.join(out,`p05-reader-${width}x${height}.png`)});}
 await page.keyboard.press('Escape');await page.locator('.hn-readable-dialog').waitFor({state:'detached'});assert.ok(await trigger.evaluate(n=>n===document.activeElement));assert.equal((await snap()).document.recipient,long);results.push({case:'long-recipient-reader-full-six-viewports',status:'PASS'});
}
}
await page.close();}
if(process.env.MANUAL_AUDIT_VERIFY==='1'){for(const r of results.filter(r=>r.case==='focused-resize'))assert.ok(r.inside&&r.active&&r.connected);assert.deepEqual(errors,[]);}
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));
}finally{await browser.close();}})();
