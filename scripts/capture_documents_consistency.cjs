const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const phase=process.env.P12_CAPTURE_PHASE||'after';
const out=path.join('handoff/P12/evidence/revision-07',phase);fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true});const p=await browser.newPage({viewport:{width:494,height:950},deviceScaleFactor:1});
try{await p.goto('http://127.0.0.1:8766/flows/auth-session/');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.waitForSelector('[data-tab=documents]');await p.waitForTimeout(200);
const routes=[['history','#p02/history-list'],['list','#p02/documents'],['info','#p02/documents?panel=2&doc=p12-stock-PX-0011'],['products','#p02/documents?panel=3&doc=p12-stock-PX-0011'],['files','#p02/documents?panel=2&doc=p12-stock-PX-0011&tab=files'],['events-posted','#p02/documents?panel=2&doc=p12-stock-PX-0011&tab=events'],['events-waiting','#p02/documents?panel=2&doc=fixture-inbound-0005&tab=events'],['create','#p02/documents?panel=4']];
for(const [name,hash] of routes){await p.evaluate(hash=>location.hash=hash,hash);await p.waitForTimeout(150);await p.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});}
const response=await p.request.get('http://127.0.0.1:8766/flows/documents/documents.mjs');const source=await response.body();
fs.writeFileSync(path.join(out,'runtime.json'),JSON.stringify({phase,viewport:[494,950],dpr:1,engine:'Chromium',servedStatus:response.status(),cacheControl:response.headers()['cache-control'],sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),revision:source.toString().match(/P12 · Chứng từ · (r\d+)/)?.[1],routes},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
