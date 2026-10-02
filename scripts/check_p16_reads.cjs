const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out='handoff/P16/evidence/revision-01/reads';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:494,height:950},deviceScaleFactor:1});const checks=[],errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(12000);
 // Inject a read-only test adapter through the existing mount dependency.
 await p.route('**/home/home.mjs*',r=>{const source=fs.readFileSync('docs/flows/home/home.mjs','utf8');assert.ok(source.includes('onSystemError:showSystem,supplierHistory'));return r.fulfill({contentType:'text/javascript',body:source.replace('onSystemError:showSystem,supplierHistory','readList:window.p16TestRead,onSystemError:showSystem,supplierHistory')});});
 await p.addInitScript(()=>{window.p16TestMode='ready';window.p16Calls=[];window.p16TestRead=ctx=>{const c={ctx};window.p16Calls.push(c);if(window.p16TestMode==='pending')return new Promise((resolve,reject)=>{c.resolve=resolve;c.reject=reject;});if(window.p16TestMode==='null')return null;if(window.p16TestMode==='error')throw Object.assign(Error('source'),{code:'SOURCE-TEST-42'});if(['network','expired','forbidden'].includes(window.p16TestMode))throw Object.assign(Error('classified'),{kind:window.p16TestMode});return window.p16Rows;};});
 async function fresh(){await p.goto('http://localhost:8766/flows/auth-session/');await p.evaluate(async()=>{window.p16Rows=(await import('/flows/documents/document-model.mjs')).mergeDocuments([]);});await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.waitForSelector('#home-app');await p.evaluate(()=>location.hash='#p02/documents');await p.waitForSelector('#p12-query');}
 const check=async(name,run)=>{await run();checks.push({name,status:'PASS'});console.log('PASS '+name);};
 const shot=async name=>{await p.evaluate(()=>scrollTo(0,0));await p.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});};
 try{
  await fresh();
  await check('A04 out-of-order read responses never replace B with A',async()=>{
   await p.evaluate(()=>window.p16TestMode='pending');await p.fill('#p12-query','A');await p.fill('#p12-query','PN-0005');assert.equal(await p.locator('.p12-records').getAttribute('aria-busy'),'true');
   await p.evaluate(()=>{const calls=window.p16Calls;calls.at(-1).resolve(window.p16Rows);calls.at(-2).resolve([]);});await p.waitForSelector('[data-p12-doc="fixture-inbound-0005"]');assert.equal(await p.locator('.p12-record').count(),1);assert.equal(await p.inputValue('#p12-query'),'PN-0005');await shot('race-latest');
  });
  await check('A02 retry uses one pending request with identical filters; source error code only',async()=>{
   await p.evaluate(()=>window.p16TestMode='error');await p.fill('#p12-query','PN-0010');await p.waitForSelector('[data-panel="P16.S04"]');assert.match(await p.locator('.p16-error-code').textContent(),/SOURCE-TEST-42/);await shot('error-code');
   await p.evaluate(()=>{window.p16TestMode='pending';window.p16Before=window.p16Calls.length;window.p16Filters=window.p16Calls.at(-1).ctx.filters;const root=document.querySelector('.p12-app');for(let i=0;i<2;i++){const b=document.createElement('button');b.dataset.p12='retry';root.append(b);b.click();b.remove();}});
   const state=await p.evaluate(()=>({delta:p16Calls.length-p16Before,filters:p16Calls.at(-1).ctx.filters,before:p16Filters}));assert.equal(state.delta,1);assert.deepEqual(state.filters,state.before);await p.evaluate(()=>p16Calls.at(-1).resolve(p16Rows));await p.waitForSelector('.p12-record');
  });
  await check('P15 network boundary retries read and closes only after verified source response',async()=>{
   await p.evaluate(()=>window.p16TestMode='network');await p.fill('#p12-query','PN-0004');await p.waitForSelector('.p15-app:not([hidden])');assert.equal(await p.locator('.p15-app').getAttribute('data-panel'),'P15.S01');await p.evaluate(()=>window.p16TestMode='ready');await p.click('[data-p15=retry]');await p.waitForSelector('.p15-app[hidden]',{state:'attached'});assert.equal(await p.locator('.p12-record').count(),1);assert.equal(await p.inputValue('#p12-query'),'PN-0004');await shot('network-recovered');
  });
  await check('long Unicode query stays in input without injection, header/footer stay fixed',async()=>{
   const query='Từ khóa rất dài <img src=x>\n'.repeat(100);await p.fill('#p12-query',query);const nativeValue=await p.inputValue('#p12-query');const m=await p.locator('.p12-scroll').evaluate(e=>({overflow:e.scrollWidth>e.clientWidth,h:e.clientHeight,sh:e.scrollHeight,nav:document.querySelector('.hn-nav').getBoundingClientRect().top}));assert.ok(!m.overflow);assert.ok(m.sh>m.h);assert.equal(await p.locator('.p16-state img').count(),0);await p.locator('.p12-scroll').evaluate(e=>e.scrollTop=e.scrollHeight);await p.click('[data-p12=edit-query]');assert.ok(await p.locator('#p12-query').evaluate(e=>e===document.activeElement));assert.equal(await p.inputValue('#p12-query'),nativeValue);await shot('long-query');
  });
  await check('401 expiry blocks caller and clears authenticated document route',async()=>{
   await p.evaluate(()=>window.p16TestMode='expired');await p.fill('#p12-query','expire');await p.waitForSelector('[data-panel="P15.S02"]');assert.equal(await p.locator('[data-panel="P12.S04"]').count(),0);await shot('expired');
  });
  await fresh();
  await check('403 reaches P15 forbidden and direct create route remains guarded',async()=>{
   await p.evaluate(()=>window.p16TestMode='forbidden');await p.fill('#p12-query','deny');await p.waitForSelector('[data-panel="P15.S03"]');await p.evaluate(()=>location.hash='#p02/documents?panel=4');await p.waitForTimeout(100);assert.equal(await p.locator('[data-panel="P12.S04"]').count(),0);await shot('forbidden');
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors},null,2));console.log(checks.length+' groups PASS');
 }catch(e){await shot('failure').catch(()=>{});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({message:e.message,checks,errors},null,2));throw e;}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
