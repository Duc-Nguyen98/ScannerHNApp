const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const {mockGeography,address}=require('./outbound_geography_helpers.cjs');
const out='handoff/P17/evidence/revision-01/before';
fs.mkdirSync(out,{recursive:true});
const files=['inbound/inbound.mjs','inbound/inbound-flow.mjs','inbound/fixture-adapter.mjs','outbound/outbound.mjs','outbound/outbound-flow.mjs','outbound/fixture-adapter.mjs','nfc/nfc.mjs','nfc/nfc-flow.mjs','auth-session/index.html'];
for(const f of files){const dest=path.join(out,'source',f);fs.mkdirSync(path.dirname(dest),{recursive:true});if(!fs.existsSync(dest))fs.copyFileSync('docs/flows/'+f,dest);}
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:494,height:950},deviceScaleFactor:1,reducedMotion:'reduce',timezoneId:'Asia/Ho_Chi_Minh'});await mockGeography(p);
// Re-runs render saved pre-edit modules without replacing the working copy.
await p.route('**/flows/**',r=>{const rel=new URL(r.request().url()).pathname.split('/flows/')[1],file=path.join(out,'source',rel.endsWith('/')?rel+'index.html':rel);return fs.existsSync(file)&&fs.statSync(file).isFile()?r.fulfill({body:fs.readFileSync(file),contentType:rel.endsWith('/')||rel.endsWith('.html')?'text/html':'text/javascript'}):r.continue();});
async function login(route){await p.goto('http://localhost:8766/flows/auth-session/');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.click(`[data-route=${route}]`);}
async function shot(n){await p.evaluate(()=>scrollTo(0,0));await p.locator('.hn-screen').screenshot({path:path.join(out,n+'.png')});}
await login('inbound');await p.click('[data-p04=next]');await p.click('[data-p04=manual]');await p.fill('#p04-code','HN12345');await p.press('#p04-code','Enter');await p.fill('#p04-code','HN-NOT-FOUND');await p.press('#p04-code','Enter');await shot('P17-S01');
await p.click('[data-p04=next]');await p.locator('.p04-tools').evaluate(e=>e.open=true);await p.selectOption('[data-p04-outcome]','timeout-recorded');await p.click('[data-p04=send]');await p.waitForTimeout(700);await shot('P17-S04');
await login('outbound');await address(p);await p.click('[data-p05=next]');await p.click('[data-p05=manual]');await p.fill('#p05-code','HN99999');await p.press('#p05-code','Enter');await shot('P17-S02');
await login('nfc');await p.click('[data-p07=begin]');await p.locator('.p07-tools details').first().evaluate(e=>e.open=true);await p.selectOption('[data-p07-scenario]','conflict');await p.click('[data-p07-demo-read]');await p.waitForTimeout(700);await shot('P17-S03');
await b.close();console.log('4 actual before captures + source snapshots');})();

