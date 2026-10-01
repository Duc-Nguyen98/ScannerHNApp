const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.FINAL_URL||'http://127.0.0.1:8766/review/';
const out=path.resolve('handoff/FINAL/evidence/'+(process.env.FINAL_RUN||'local'));fs.mkdirSync(out,{recursive:true});
const catalog=JSON.parse(fs.readFileSync('docs/review/catalog.json'));
(async()=>{const browser=await chromium.launch(),checks=[];try{
const mode=process.env.FINAL_MODE||'auto',selected=process.env.FINAL_PANELS?.split(',');
for(const item of catalog.panels.filter(p=>!selected||selected.includes(p.id))){
 const context=await browser.newContext({viewport:{width:Number(process.env.FINAL_WIDTH)||1440,height:950},reducedMotion:mode==='reduced'?'reduce':'no-preference',timezoneId:'Asia/Ho_Chi_Minh'}),p=await context.newPage();p.setDefaultTimeout(18000);const errors=[],external=[],failed=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});p.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
 try{await p.goto(base+'?'+new URLSearchParams({view:'review',panel:item.id,motion:mode}),{waitUntil:'domcontentloaded'});await p.waitForFunction(id=>document.querySelector('#status')?.textContent.startsWith('Đã mở '+id),item.id,{timeout:55000});
  const frame=p.frames().find(f=>f.url().includes('/auth-session/'));assert.ok(frame);
  const actual=await frame.evaluate(()=>[...document.querySelectorAll('[data-panel],[data-state-panel]')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').flatMap(e=>[e.dataset.panel,e.dataset.statePanel]).filter(Boolean));
  if(item.id!=='P22.S01')assert.ok(actual.includes(item.id),JSON.stringify(actual));
  const geometry=await frame.evaluate(()=>{const e=[...document.querySelectorAll('.hn-screen,.screen')].find(e=>e.getClientRects().length),r=e.getBoundingClientRect();return {width:innerWidth,height:innerHeight,screen:r.toJSON(),overflow:document.documentElement.scrollWidth>innerWidth+1};});assert.equal(geometry.overflow,false);
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(failed,[]);await p.screenshot({path:path.join(out,item.id+'-'+mode+'.png')});
  checks.push({id:item.id,mode,status:'PASS',actual,geometry,errors,external,failed,screenshot:item.id+'-'+mode+'.png'});
 }catch(e){await p.screenshot({path:path.join(out,item.id+'-failure.png')});checks.push({id:item.id,mode,status:'FAIL',error:e.message,statusText:await p.locator('#status').textContent().catch(()=>''),errors,external,failed});}
 await context.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({build:catalog.build,url:base,checks},null,2));console.log(checks.at(-1).status+' '+item.id+' '+(checks.at(-1).statusText||''));
}
}finally{await browser.close();}process.exitCode=checks.some(c=>c.status!=='PASS')?1:0;})().catch(e=>{console.error(e);process.exitCode=1;});
