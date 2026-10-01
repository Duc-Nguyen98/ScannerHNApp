const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:494,height:950},deviceScaleFactor:1,reducedMotion:'reduce',timezoneId:'Asia/Ho_Chi_Minh'}),out='handoff/P16/evidence/revision-02/before';
try{
 for(const [url,file,type]of [['**/documents/documents.mjs*','documents.mjs','text/javascript'],['**/data-states/view.mjs*','view.mjs','text/javascript'],['**/data-states/style.css*','style.css','text/css']])await p.route(url,r=>r.fulfill({contentType:type,body:fs.readFileSync(out+'/'+file,'utf8')}));
 await p.goto('http://localhost:8766/flows/auth-session/');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.waitForSelector('#home-app');await p.evaluate(()=>location.hash='#p02/documents');await p.waitForSelector('#p12-query');
 await p.fill('#p12-query','PN-9999');await p.click('[data-p12-type=inbound]');await p.locator('[data-p12=filter]').first().click();await p.fill('#pick-from','01/09/2026');await p.fill('#pick-to','02/09/2026');await p.check('[name=status][value=posted]');await p.locator('.p08-picker [type=submit]').click();await p.waitForTimeout(100);await p.evaluate(()=>scrollTo(0,0));await p.locator('.hn-screen').screenshot({path:out+'/combined.png'});
 await p.fill('#p12-query','');await p.locator('.hn-screen').screenshot({path:out+'/filter-only.png'});
 await p.locator('[data-p12=clear]').first().click();await p.locator('.p16-tools').evaluate(e=>e.open=true);await p.click('[data-p16-demo=stale]');await p.evaluate(()=>scrollTo(0,0));await p.locator('.hn-screen').screenshot({path:out+'/stale.png'});
 console.log('Captured immutable r01 source: combined, filter-only, stale');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
