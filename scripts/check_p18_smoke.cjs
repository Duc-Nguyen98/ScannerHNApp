const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:494,height:950},deviceScaleFactor:1});p.on('pageerror',e=>console.log('PAGEERROR',e.message));p.on('console',m=>{if(m.type()==='error')console.log(m.text());});
await p.goto('http://localhost:8766/flows/auth-session/');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');
await p.locator('.p18-tools').evaluate(e=>e.open=true);
for(const panel of ['files','handoff','location']){await p.click(`[data-p18-demo=${panel}]`);await p.waitForTimeout(300);console.log(panel,await p.locator('.p18-app').innerText());await p.locator('.hn-screen').screenshot({path:`handoff/P18/evidence/revision-01/smoke-${panel}.png`});}
await p.click('[data-p18-demo=files]');await p.click('[data-p18=view]');await p.waitForTimeout(2500);console.log('PDF',await p.locator('.p18-app').innerText());await p.locator('.hn-screen').screenshot({path:'handoff/P18/evidence/revision-01/smoke-viewer.png'});await b.close();})();
