const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const phase=process.env.HISTORY_PHASE||'before',out=path.resolve('handoff/P08/evidence/revision-22/'+phase);fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:494,height:1000},deviceScaleFactor:1});
try{await page.clock.setFixedTime(new Date('2026-09-29T05:00:00Z'));await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');
for(const scene of ['history-general','history-daily','documents','nfc','warranty','sessions']){
 await page.click('[data-tab=history]');await page.frameLocator('iframe').locator(`[data-action="${scene}"]`).click();await page.locator('.p08-app').waitFor();await page.locator('.hn-screen').screenshot({path:path.join(out,scene+'.png')});
 await page.locator('[data-p08=filter]').first().click();await page.locator('.p08-picker').waitFor();await page.locator('.hn-screen').screenshot({path:path.join(out,scene+'-filter.png')});await page.keyboard.press('Escape');await page.waitForFunction(()=>!history.state?.hnP08Picker);
}console.log('Captured '+phase+' six lists and six dialogs');
}finally{await browser.close();}})();
