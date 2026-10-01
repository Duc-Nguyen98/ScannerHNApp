// Current P02 clock semantics: immutable confirmed shift time, not a running clock.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('handoff/P02/evidence/revision-07-shift');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:494,height:950},timezoneId:'America/New_York',deviceScaleFactor:1});
 const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const receipt=()=>page.locator('[data-shift-start]').evaluate(el=>({timestamp:el.dateTime,text:el.textContent}));
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 async function confirm(){
  await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.locator('#start').waitFor();
  const before=await page.evaluate(()=>Date.now());
  await page.locator('#start').evaluate(button=>{button.click();button.click();});
  await page.locator('[data-shift-start]').waitFor();
  const after=await page.evaluate(()=>Date.now()),result=await receipt();
  assert.ok(Date.parse(result.timestamp)>=before&&Date.parse(result.timestamp)<=after);
  const expected=await page.evaluate(timestamp=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(timestamp)),result.timestamp);
  assert.equal(result.text,expected);return result;
 }
 try{
  await page.goto('http://127.0.0.1:8766/flows/auth-session/?v=p02-shift-r07');
  let first;
  await check('Double start confirms once; Home shows confirmation timestamp in Vietnam time',async()=>{
   first=await confirm();assert.match(first.text,/^\d{2}:\d{2}:\d{2}$/);assert.match(await page.locator('.hn-kpi-clock').textContent(),/Ca bắt đầu/);
  });
  await check('Shift time does not tick with current device time',async()=>{await page.waitForTimeout(1500);assert.deepEqual(await receipt(),first);});
  await check('Lookup and Home navigation preserves the exact start receipt',async()=>{
   await page.click('.hn-scanner');await page.locator('.p06-app').waitFor();await page.click('[data-p06=back]');await page.locator('#hn-home').waitFor({state:'visible'});assert.deepEqual(await receipt(),first);
  });
  await check('KPI UNKNOWN and name re-render do not replace a known start receipt',async()=>{
   await page.getByText('Kịch bản kiểm tra P02',{exact:true}).click();
   for(const scenario of ['unknown','long','baseline']){await page.selectOption('#hn-scenario',scenario);assert.deepEqual(await receipt(),first);}
  });
  for(const [width,height] of [[494,950],[360,800],[1264,712]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));
   const m=await page.evaluate(()=>{const time=document.querySelector('[data-shift-start]').getBoundingClientRect(),icon=document.querySelector('.hn-kpi-clock .hn-icon').getBoundingClientRect();return{overlap:time.right>icon.left,overflow:document.documentElement.scrollWidth>innerWidth};});
   assert.equal(m.overlap,false);assert.equal(m.overflow,false);
   await page.screenshot({path:path.join(out,`home-${width}.png`)});
  }
  checks.push({name:'3 viewports keep clock/icon aligned and no horizontal overflow',status:'PASS'});
  await check('Logout clears old shift; next successful confirmation gets a new receipt',async()=>{
   await page.click('#hn-logout');await page.locator('#username').waitFor();assert.equal(await page.locator('[data-shift-start]').count(),0);
   const next=await confirm();assert.ok(Date.parse(next.timestamp)>Date.parse(first.timestamp));
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors,firstReceipt:first,timezone:'America/New_York browser, Asia/Ho_Chi_Minh display',production:'NOT_RUN'},null,2));
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:e.stack,checks,errors},null,2));throw e;}
 finally{await browser.close();}
})();
