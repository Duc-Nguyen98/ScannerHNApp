// Render evidence for r02 layout review; reuse the behavioral suite for assertions.
const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const out='handoff/P13/evidence/revision-02';
(async()=>{const browser=await chromium.launch({headless:true}),p=await browser.newPage({viewport:{width:494,height:950},deviceScaleFactor:1,timezoneId:'Asia/Ho_Chi_Minh'}),observations=[],errors=[];p.on('pageerror',e=>errors.push(e.message));
try{await p.goto('http://127.0.0.1:8766/flows/auth-session/');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.click('.hn-bell');
for(const [width,height] of [[494,950],[459,874],[360,800],[430,932],[1440,900],[340,420],[1869,940]]){
 await p.setViewportSize({width,height});await p.evaluate(()=>scrollTo(0,0));
 for(const filter of ['unread','all']){
  await p.click(`[data-p13-filter=${filter}]`);await p.locator('.p13-scroll').evaluate(e=>e.scrollTop=0);await p.mouse.move(0,0);await p.locator('.p13-header h1').focus();await p.waitForTimeout(80);
  const read=()=>p.evaluate(()=>{const s=document.querySelector('.hn-screen'),scroll=document.querySelector('.p13-scroll'),dock=document.querySelector('.p13-filter-dock'),list=document.querySelector('.p13-records'),button=document.querySelector('.p13-notification-open'),surface=document.querySelector('.p13-body'),rect=e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height];};return {viewport:[innerWidth,innerHeight],panel:document.querySelector('.p13-app').dataset.panel,shell:[s.offsetWidth,s.offsetHeight],shellRect:rect(s),dock:rect(dock),footer:rect(document.querySelector('.hn-nav')),bodyBackground:getComputedStyle(surface).backgroundColor,scroller:[scroll.clientWidth,scroll.scrollWidth,scroll.clientHeight,scroll.scrollHeight,scroll.scrollTop],scrollerPadding:getComputedStyle(scroll).padding,rowsGap:getComputedStyle(list).gap,rowPadding:getComputedStyle(button).padding,firstIcon:rect(button.querySelector('.hn-operation-icon')),firstCopy:rect(button.querySelector('.p13-notification-copy')),taskBlocks:document.querySelectorAll('.p13-follow,[data-panel="P13.S01"] [data-p13=waiting]').length};});
  const before=await read();await p.locator('.hn-screen').screenshot({path:path.join(out,`inbox-${filter}-${width}x${height}.png`)});
  await p.locator('.p13-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);const after=await read();observations.push({filter,before,after,tabFixed:JSON.stringify(before.dock)===JSON.stringify(after.dock),footerFixed:JSON.stringify(before.footer)===JSON.stringify(after.footer)});
 }
}
await p.setViewportSize({width:494,height:950});await p.click('[data-p13-filter=all]');
// Stress the shared reader with escaped DOM text only; no change to store or input policy.
const text='Nội dung thông báo dài 🌸\n\n'+('Giữ_nguyên_Unicode_và_xuống_dòng_'.repeat(90));
await p.locator('.p13-excerpt').first().evaluate((e,t)=>e.textContent=t,text);await p.locator('.p13-notification .hn-read-more:visible').first().waitFor();
await p.locator('.p13-scroll').evaluate(e=>e.scrollTop=0);await p.locator('.p13-header h1').focus();await p.locator('.hn-screen').screenshot({path:path.join(out,'inbox-long-text.png')});
await p.locator('.p13-notification .hn-read-more:visible').first().click();await p.locator('.app-modal-host dialog').waitFor();const full=await p.locator('.app-modal-host .app-modal-body').textContent();await p.locator('.hn-screen').screenshot({path:path.join(out,'inbox-reader.png')});
await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('.app-modal-host'));
fs.writeFileSync(path.join(out,'layout-observations.json'),JSON.stringify({observations,reader:{sourceLength:text.length,fullTextMatches:full===text,restoredFocus:await p.locator('.p13-notification .hn-read-more:visible').first().evaluate(e=>e===document.activeElement)},errors},null,2));console.log('Captured 14 inbox states across 7 viewports and long-text reader; observations saved.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
