// Capture each reference panel in a fresh browser surface after font/layout settle.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch();const records=[];try{for(const n of [1,2,3,4]){
 const page=await browser.newPage({viewport:{width:494,height:1000},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.click('[data-tab=profile]');
 if(n>1)await page.click(`[data-p10=${n===2?'edit':n===3?'rights':'security'}]`);
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(350);
 await page.locator('.hn-screen').screenshot({path:`handoff/P10/evidence/revision-01/P10-S0${n}-actual.png`,animations:'disabled',caret:'hide'});
 records.push({panel:`P10.S0${n}`,viewport:[494,1000],shell:[494,950],dpr:1,zoom:1,measurements:await page.evaluate(()=>{const a=document.querySelector('.p10-app'),s=a.querySelector('.p10-scroll');return {font:getComputedStyle(a).fontFamily,scrollHeight:s.scrollHeight,clientHeight:s.clientHeight,controls:[...a.querySelectorAll('input,button')].map(e=>({name:e.getAttribute('aria-label')||e.name||e.textContent.trim(),bounds:e.getBoundingClientRect().toJSON()}))};})});await page.close();
 }fs.writeFileSync('handoff/P10/evidence/revision-01/reference-capture.json',JSON.stringify(records,null,2));}finally{await browser.close();}})();
