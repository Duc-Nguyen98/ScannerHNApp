const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve(process.env.FLOW_REMAINING_DIR||'handoff/flow/evidence/remaining-01');fs.mkdirSync(out,{recursive:true});
require('./flow_gate_browser_coverage.cjs')(chromium,path.join(out,'observed-panels.json'));
(async()=>{
 const browser=await chromium.launch(),checks=[];
 async function test(id,panels,run){const context=await browser.newContext({viewport:{width:494,height:950}}),p=await context.newPage(),errors=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));
 const a=(board,name)=>p.locator(`[data-${board}="${name}"]`).first();
 const snap=async board=>JSON.parse(await p.locator(`[data-${board}-snapshot]`).textContent());
 const login=async()=>{await p.goto('http://127.0.0.1:8766/flows/auth-session/');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.locator('#hn-home:not([hidden])').waitFor();};
 const shot=async suffix=>{await p.locator('.hn-screen').screenshot({path:path.join(out,id+'-'+suffix+'.png')});};
 try{await run({p,a,snap,login,shot});assert.deepEqual(errors,[]);checks.push({id,panels,status:'PASS',errors});}catch(e){await p.screenshot({path:path.join(out,id+'-failure.png')});checks.push({id,panels,status:'FAIL',errors,error:e.stack});}finally{await context.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks},null,2));console.log(checks.at(-1).status+' '+id);}}
 try{
 await test('R01',['P07.S03','P07.S04'],async({p,a,snap,login,shot})=>{
  await login();await p.click('[data-route=nfc]');await a('p07','begin').click();await p.locator('.p07-tools > details').evaluate(e=>e.open=true);await p.click('[data-p07-demo-read]');await p.waitForFunction(()=>!JSON.parse(document.querySelector('[data-p07-snapshot]').textContent).busy);await a('p07','next').click();await p.locator('[data-panel="P07.S03"]').waitFor();const before=await snap('p07');await shot('confirmation');await a('p07','confirm').dblclick();await p.locator('[data-panel="P07.S04"]').waitFor();const done=await snap('p07');assert.equal(done.stats.mutations,before.stats.mutations+1);assert.ok(done.receipt.tagId);await shot('receipt');await a('p07','back').click();await p.locator(`[data-p07-tag="${done.receipt.tagId}"]`).waitFor();
 });
 await test('R02',['P12.S04'],async({p,a,snap,login,shot})=>{
  await login();await p.click('[data-tab=documents]');await a('p12','create').click();await p.locator('[data-panel="P12.S04"]').waitFor();await p.fill('#p12-note','flow gate retained supplier note');await shot('create');await a('p12','continue').click();await p.locator('.p04-app').waitFor();const s=await snap('p04');assert.equal(s.document.note,'flow gate retained supplier note');assert.equal(s.metrics.recordCalls,0);assert.equal(s.step,2);
 });
 await test('R03',['P13.S03','P13.S04'],async({p,a,login,shot})=>{
  await login();await p.evaluate(()=>location.hash='#p02/notifications?panel=3');await p.locator('[data-panel="P13.S03"]').waitFor();const row=p.locator('[data-p13-doc]').first(),id=await row.getAttribute('data-p13-doc');assert.ok(id);await row.click();await p.locator('[data-panel="P13.S04"]').waitFor();assert.equal(await p.locator('[data-p13=approve],[data-p13=post]').count(),0);await shot('waiting-detail');await a('p13','document').click();await p.locator('.p12-app').waitFor();assert.ok(p.url().includes(encodeURIComponent(id)));
 });
 await test('R04',['P15.S03'],async({p,login,shot})=>{
  await login();await p.locator('.p15-tools').evaluate(e=>e.open=true);await p.click('[data-system-demo=deny]');await p.locator('[data-panel="P15.S03"]').waitFor();await shot('denied');await p.evaluate(()=>location.hash='#p02/inbound');await p.locator('[data-panel="P15.S03"]').waitFor();assert.equal(await p.locator('.p04-app:visible').count(),0);await p.click('[data-system-demo=allow]');await p.locator('.p15-app:visible').waitFor({state:'hidden'});
 });
 await test('R05',['P16.S01','P16.S04'],async({p,a,login,shot})=>{
  await p.route('**/home/home.mjs*',r=>{const source=fs.readFileSync('docs/flows/home/home.mjs','utf8');assert.ok(source.includes('onSystemError:showSystem,supplierHistory'));return r.fulfill({contentType:'text/javascript',body:source.replace('onSystemError:showSystem,supplierHistory','readList:window.gateRead,onSystemError:showSystem,supplierHistory')});});
  await p.addInitScript(()=>{window.readCalls=[];window.gateRead=ctx=>new Promise((resolve,reject)=>window.readCalls.push({ctx,resolve,reject}));});
  await login();await p.click('[data-tab=documents]');await p.locator('[data-panel="P16.S01"]').waitFor();await shot('loading');await p.evaluate(()=>window.readCalls.at(-1).reject(Object.assign(Error('fixture read failure'),{code:'GATE-READ'})));await p.locator('[data-panel="P16.S04"]').waitFor();await shot('read-error');const before=await p.evaluate(()=>window.readCalls.length);await a('p12','retry').click();await p.waitForFunction(n=>window.readCalls.length===n+1,before);await p.evaluate(()=>window.readCalls.at(-1).resolve([]));await p.locator('[data-panel="P16.S02"]').waitFor();assert.equal(await p.locator('.p12-record').count(),0);
 });
 await test('R06',['P18.S03','P18.S04'],async({p,a,snap,login,shot})=>{
  await login();await p.evaluate(()=>location.hash='#p02/warranty?panel=3&case=BH-005');await a('p09','handoff').click();await p.locator('[data-panel="P18.S03"]').waitFor();const before=await snap('p18');await shot('handoff');await a('p18','back').click();assert.match(p.url(),/case=BH-005/);await p.evaluate(()=>location.hash='#p02/lookup?panel=3&item=fixture-component-01');await a('p06','location').click();await p.locator('[data-panel="P18.S04"]').waitFor();assert.equal((await snap('p18')).mutations,before.mutations);assert.equal(await a('p18','slot').count(),0);await shot('location-readonly');await a('p18','back').click();await p.locator('[data-panel="P06.S03"]').waitFor();assert.match(p.url(),/item=fixture-component-01/);
 });
 await test('R07',['P22.S01'],async({p,login,shot})=>{
  await login();for(const [action,target]of [['history-general','.p08-app'],['history-daily','.p08-app'],['documents','.p08-app'],['nfc','.p22-app'],['warranty','.p23-app'],['sessions','.p23-app']]){
   await p.click('[data-tab=history]');const frame=p.frameLocator('iframe');await frame.locator('[data-history-hub=true]').waitFor();assert.equal(await frame.locator('.history-link').count(),6);await shot(action);await frame.locator(`[data-action="${action}"]`).click();await p.locator(target).waitFor();await p.goBack();await frame.locator('[data-history-hub=true]').waitFor();
  }
 });
 }finally{await browser.close();}
 process.exitCode=checks.some(c=>c.status!=='PASS')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
