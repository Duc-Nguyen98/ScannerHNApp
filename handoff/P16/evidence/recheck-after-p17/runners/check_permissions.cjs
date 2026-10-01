const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out="handoff/P16/evidence/recheck-after-p17/permissions";fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch(),p=await browser.newPage({viewport:{width:494,height:950},deviceScaleFactor:1,timezoneId:'Asia/Ho_Chi_Minh',reducedMotion:'reduce'});
 const errors=[],checks=[],metrics=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
 const shot=async name=>{await p.evaluate(()=>scrollTo(0,0));await p.locator('.hn-screen').screenshot({path:path.join(out,name+'.png')});};
 const check=async(name,fn)=>{await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);};
 async function login(){await p.goto('http://localhost:8766/flows/auth-session/');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.waitForSelector('#home-app');await p.evaluate(()=>location.hash='#p02/documents');await p.waitForSelector('#p12-query');}
 async function demo(s){await p.locator('.p16-tools').evaluate(e=>e.open=true);await p.locator(`[data-p16-demo="${s}"]`).click();await p.evaluate(()=>scrollTo(0,0));}
 const kind=()=>p.locator('[data-data-state]').first().getAttribute('data-data-state');
 try{
 await login();
  await check('A05 readonly hides create, rejects synthetic action and direct create route',async()=>{
   await demo('empty');await p.locator('#p16-readonly').check();assert.equal(await p.locator('[data-p12=create]').count(),0);
   await p.evaluate(()=>{const b=document.createElement('button');b.dataset.p12='create';document.querySelector('.p12-app').append(b);b.click();b.remove();});await p.locator('.app-modal-host dialog').waitFor();assert.match(await p.locator('.app-modal-host dialog').textContent(),/Không có quyền/);await p.keyboard.press('Escape');await p.waitForTimeout(100);
   await p.evaluate(()=>location.hash='#p02/documents?panel=4');await p.waitForTimeout(100);assert.equal(await p.locator('[data-panel="P12.S04"]').count(),0);assert.equal(await p.locator('[data-p12=create]').count(),0);await shot('readonly');await p.locator('#p16-readonly').uncheck();
  });
  await check('empty CTA enters existing P12 form, preserves 200 limit and routes to P04 owner',async()=>{
   await demo('empty');await p.locator('.p16-state [data-p12=create]').click();await p.waitForSelector('[data-panel="P12.S04"]');assert.equal(await p.locator('#p12-note').getAttribute('maxlength'),'200');await p.click('[data-p12=continue]');await p.waitForSelector('[data-panel="P04.S02"]');await shot('create-owner');await p.evaluate(()=>location.hash='#p02/documents');await p.waitForSelector('#p12-query');
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({checks,metrics,errors},null,2));console.log(checks.length+' groups PASS');
 }catch(e){fs.writeFileSync(path.join(out,'browser-failure.json'),JSON.stringify({message:e.message,checks,metrics,errors},null,2));await shot('failure').catch(()=>{});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
