const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.NFC_MOTION_EVIDENCE_DIR||'handoff/P07/evidence/revision-06/motion');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1869,height:940}}),results=[];
 const act=n=>page.locator(`[data-p07="${n}"]`).first();
 try{
  await page.goto('http://127.0.0.1:8766/flows/auth-session/');await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.click('#start');await page.click('[data-route="nfc"]');await act('begin').click();
  // Freeze each real CSS animation at known times to compare transforms and layout.
  for(const time of [600,1300,2400,16000,600000]){
   const m=await page.evaluate(t=>{const el=document.querySelector('.p07-art-frame');for(const a of el.getAnimations({subtree:true})){a.pause();a.currentTime=t;}return {waves:[...el.querySelectorAll('.p07-wave')].map(e=>({iterations:getComputedStyle(e).animationIterationCount,opacity:Number(getComputedStyle(e).opacity),z:Number(getComputedStyle(e).zIndex)})),phone:{z:Number(getComputedStyle(el.querySelector('.p07-phone')).zIndex),blend:getComputedStyle(el.querySelector('.p07-phone')).mixBlendMode},transforms:[...el.querySelectorAll('.p07-wave')].map(e=>getComputedStyle(e).transform),top:document.querySelector('.p07-touch>strong').getBoundingClientRect().top,hitTesting:getComputedStyle(el).pointerEvents};},time);
   assert.equal(m.hitTesting,'none');assert.equal(m.phone.blend,'normal');for(const w of m.waves){assert.equal(w.iterations,'infinite');assert.ok(m.phone.z>w.z);}assert.ok(m.waves.some(w=>w.opacity>.01));results.push({time,...m});await page.locator('.hn-screen').screenshot({path:path.join(out,`read-${time}.png`)});await page.locator('.p07-phone').screenshot({path:path.join(out,`phone-${time}.png`)});
  }
  assert.notDeepEqual(results[0].transforms,results[1].transforms);assert.equal(results[0].top,results[2].top);
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.p07-wave').first().evaluate(e=>getComputedStyle(e).animationName),'none');await page.locator('.hn-screen').screenshot({path:path.join(out,'read-reduced-motion.png')});
  await page.emulateMedia({reducedMotion:'no-preference'});await page.click('[data-p07-demo-read]');await page.waitForFunction(()=>!JSON.parse(document.querySelector('[data-p07-snapshot]').textContent).busy);await act('next').click();await act('confirm').click();await page.locator('[data-panel="P07.S04"]').waitFor();
  for(const [width,height] of [[1869,940],[1495,752],[685,872],[494,1000],[360,800],[340,420]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const m=await page.evaluate(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,height:r.height};};
    return {buttons:[...document.querySelectorAll('.p07-footer button')].map(e=>({box:rect(e),label:rect(e.querySelector('span')),iconPaths:e.querySelector('svg').childElementCount})),label:rect(document.querySelector('.p07-summary dt')),summary:rect(document.querySelector('.p07-summary')),scroll:rect(document.querySelector('.p07-scroll'))};
   });
   for(const b of m.buttons){assert.ok(Math.abs(b.box.height-m.buttons[0].box.height)<1);assert.ok(b.iconPaths>0);assert.ok(b.label.x>=b.box.x&&b.label.right<=b.box.right);}
   assert.ok(Math.abs(m.buttons[0].label.x-m.label.x)<1);
   assert.ok(Math.abs(m.buttons[0].box.x-m.summary.x)<1);assert.ok(Math.abs(m.buttons[0].box.right-m.summary.right)<1);
   assert.ok(Math.abs(m.buttons[1].box.y-m.buttons[2].box.y)<1);
   assert.ok(Math.abs((m.buttons[1].box.right-m.buttons[1].box.x)-(m.buttons[2].box.right-m.buttons[2].box.x))<1);
   assert.ok(Math.abs(m.buttons[1].box.x-m.summary.x)<1);assert.ok(Math.abs(m.buttons[2].box.right-m.summary.right)<1);
   assert.ok(m.summary.bottom<=m.scroll.bottom-1,'Entire summary border visible without scrolling');results.push({width,height,...m});
   await page.locator('.hn-screen').screenshot({path:path.join(out,`success-${width}x${height}.png`)});
  }
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.p07-success-symbol').evaluate(e=>getComputedStyle(e,'::before').animationName),'none');
  await act('home').click();await page.locator('.p07-app').waitFor({state:'detached'});
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({status:'PASS',results,reducedMotion:'PASS: read and success',homeAction:'PASS'},null,2));console.log('PASS motion phases, reduced motion, six footer layouts, Home action');
 }finally{await browser.close();}
})();
