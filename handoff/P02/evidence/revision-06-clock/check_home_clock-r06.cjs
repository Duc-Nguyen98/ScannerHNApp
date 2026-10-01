const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve('handoff/P02/evidence/revision-06-clock');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:494,height:950},timezoneId:'America/New_York',deviceScaleFactor:1});
 const errors=[],checks=[],metrics=[];page.on('pageerror',e=>errors.push(e.message));
 async function check(name,fn){await fn();checks.push({name,status:'PASS'});console.log('PASS '+name);}
 try{
  await page.goto('http://127.0.0.1:8766/flows/auth-session/');
  await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.locator('[data-home-clock]').waitFor();
  await check('HH:mm:ss advances and is Vietnam time even on a New York browser',async()=>{
   const first=await page.locator('[data-home-clock]').textContent();assert.match(first,/^\d{2}:\d{2}:\d{2}$/);
   await page.waitForFunction(first=>document.querySelector('[data-home-clock]').textContent!==first,first);
   const result=await page.locator('[data-home-clock]').evaluate(el=>({actual:el.textContent,expected:new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date(el.dateTime)),label:el.getAttribute('aria-label')}));
   assert.equal(result.actual,result.expected);assert.match(result.label,/UTC\+7/);
  });
  for(const [w,h] of [[494,950],[360,800],[430,932],[1264,712],[1869,940]]){
   await page.setViewportSize({width:w,height:h});await page.evaluate(()=>scrollTo(0,0));
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const m=await page.evaluate(()=>{
    const r=s=>{const a=document.querySelector(s).getBoundingClientRect();return{x:a.x,y:a.y,width:a.width,height:a.height,right:a.right,bottom:a.bottom};};
    const boxes=[...document.querySelectorAll('.hn-kpi')].map(n=>({width:n.getBoundingClientRect().width,overflow:n.scrollWidth>n.clientWidth}));
    return{viewport:[innerWidth,innerHeight],clock:r('[data-home-clock]'),clockIcon:r('.hn-kpi-clock .hn-icon'),kpi:r('.hn-kpis'),boxes,
     screen:r('.hn-screen'),nav:r('.hn-nav'),last:r('[data-id="BH-001"]'),overflow:document.documentElement.scrollWidth>innerWidth,
     surfaces:['.hn-screen','.hn-main::before','.hn-nav'].map(s=>s.includes('::')?getComputedStyle(document.querySelector('.hn-main'),'::before').backgroundColor:getComputedStyle(document.querySelector(s)).backgroundColor),
     cards:[...document.querySelectorAll('.hn-task')].map(n=>getComputedStyle(n).backgroundColor)};
   });
   assert.equal(m.overflow,false);assert.ok(m.boxes.every(b=>!b.overflow));assert.ok(Math.max(...m.boxes.map(b=>b.width))-Math.min(...m.boxes.map(b=>b.width))<1);
   assert.ok(m.clock.right<=m.clockIcon.x,'Clock and icon never overlap');assert.ok(m.screen.bottom<=h+1);assert.ok(m.last.bottom<=m.nav.y);
   assert.equal(new Set(m.surfaces).size,1);assert.equal(new Set(m.cards).size,1);metrics.push(m);
   await page.screenshot({path:path.join(out,`home-${w}.png`)});
  }
  checks.push({name:'5 viewport sizes: balanced KPI, no collision/overflow, continuous surface and consistent task cards',status:'PASS'});
  await check('Tick updates only the clock node, without re-rendering layout',async()=>{
   await page.locator('.hn-task[data-route=inbound]').focus();const before=await page.locator('.hn-kpis').boundingBox();
   const text=await page.locator('[data-home-clock]').textContent();await page.waitForFunction(t=>document.querySelector('[data-home-clock]').textContent!==t,text);
   assert.deepEqual(await page.locator('.hn-kpis').boundingBox(),before);assert.equal(await page.locator('.hn-task[data-route=inbound]').evaluate(n=>n===document.activeElement),true);
  });
  await check('UNKNOWN business metrics stay unknown while independent local time runs',async()=>{
   await page.getByText('Kịch bản kiểm tra P02',{exact:true}).click();await page.selectOption('#hn-scenario','unknown');
   assert.equal(await page.locator('.hn-kpis .hn-unknown').count(),2);assert.match(await page.locator('[data-home-clock]').textContent(),/^\d{2}:\d{2}:\d{2}$/);
   assert.doesNotMatch(await page.locator('.hn-kpis').textContent(),/Ca bắt đầu/);await page.selectOption('#hn-scenario','baseline');
  });
  await check('Leaving Home pauses updates; returning refreshes immediately',async()=>{
   await page.click('.hn-scanner');await page.locator('.p06-app').waitFor();
   const before=await page.locator('[data-home-clock]').textContent();await page.waitForTimeout(1200);
   assert.equal(await page.locator('[data-home-clock]').textContent(),before);
   await page.click('[data-p06=back]');await page.locator('#hn-home').waitFor({state:'visible'});
   assert.notEqual(await page.locator('[data-home-clock]').textContent(),before);
  });
  await check('Hidden tab pauses clock, visibility resume restores current time',async()=>{
   await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
   const value=await page.locator('[data-home-clock]').textContent();await page.waitForTimeout(1200);assert.equal(await page.locator('[data-home-clock]').textContent(),value);
   await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
   await page.waitForFunction(t=>document.querySelector('[data-home-clock]').textContent!==t,value);
  });
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,metrics,errors,conditions:'Chromium DPR1; browser timezone America/New_York; clock from device instant, no backend time service'},null,2));
 }catch(error){await page.screenshot({path:path.join(out,'failure.png')});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({message:error.stack,checks,metrics,errors},null,2));throw error;}
 finally{await browser.close();}
})();
