const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.MOTION_BASE||'http://127.0.0.1:8774',out=path.resolve(process.env.MOTION_P04_EVIDENCE_DIR||'handoff/motion/M04/evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch(),results=[];try{for(const mode of ['auto','os-reduced','off']){
 const context=await browser.newContext({viewport:{width:494,height:950},deviceScaleFactor:1,timezoneId:'Asia/Ho_Chi_Minh',reducedMotion:mode==='os-reduced'?'reduce':'no-preference'});await context.tracing.start({screenshots:true,snapshots:true,sources:true});const p=await context.newPage(),errors=[],r={mode,checks:[],errors,frames:[],layouts:[]};results.push(r);p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.m04Log=[];window.m04Calls={record:0,check:0,camera:0};const original=Element.prototype.animate;Element.prototype.animate=function(frames,options){const row={owner:this.dataset.hnMotionConsumer||'',node:this.className,duration:options.duration,frames,cancelled:false};window.m04Log.push(row);const a=original.call(this,frames,options),cancel=a.cancel.bind(a);a.cancel=()=>{row.cancelled=true;return cancel();};return a;};if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=async()=>{window.m04Calls.camera++;throw Error('No hardware in prototype');};});
 await p.route('**/inbound/inbound.mjs*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const flow = createInboundFlow(', 'const flow = window.m04Flow = createInboundFlow(')});});
 await p.route('**/inbound/fixture-adapter.mjs*',async route=>{const response=await route.fetch();let body=await response.text();for(const name of ['record','check'])body=body.replace('async '+name+'(request) {','async '+name+'(request) { window.m04Calls.'+name+'++;');await route.fulfill({response,body});});
 await p.clock.setFixedTime(new Date('2026-09-30T01:15:20Z'));
 const a=name=>p.locator(`[data-p04="${name}"]`).first(),snap=()=>p.evaluate(()=>window.m04Flow.snapshot());
 const log=()=>p.evaluate(()=>m04Log.filter(x=>x.owner)),reset=()=>p.evaluate(()=>window.m04Log=[]);
 const frame=async(label,action)=>{await reset();await action();const samples=await p.evaluate(()=>{const start=performance.now(),frames=[];return new Promise(resolve=>{const sample=t=>{frames.push({ms:t-start,nodes:[...document.querySelectorAll('[data-hn-motion-consumer]')].map(n=>({owner:n.dataset.hnMotionConsumer,opacity:getComputedStyle(n).opacity,transform:getComputedStyle(n).transform}))});if(t-start<230)requestAnimationFrame(sample);else resolve(frames);};requestAnimationFrame(sample);});});r.frames.push({label,samples,log:await log()});};
 async function check(name,fn){try{await fn();r.checks.push({name,status:'PASS'});console.log('PASS '+mode+' '+name);}catch(e){r.failure={name,error:e.stack};await p.screenshot({path:path.join(out,mode+'-failure.png'),fullPage:true});throw e;}}
 async function shot(id){await p.evaluate(()=>{scrollTo(0,0);document.querySelector('.p04-scroll').scrollTop=0;});await p.waitForTimeout(240);await p.locator('.hn-screen').screenshot({path:path.join(out,mode+'-'+id+'.png')});
  const geometry=await p.evaluate(()=>Object.fromEntries(['.p04-header','.p04-sheet','.p04-scroll','.p04-footer','.p04-section-title','.p04-camera','.p04-counter','.p04-products','.hn-waiting-hero'].map(s=>{const n=document.querySelector(s),r=n?.getBoundingClientRect();return[s,r?[r.x,r.y,r.width,r.height]:null]})));
  const baseline=JSON.parse(fs.readFileSync(path.join(out,'before/geometry.json'))).find(p=>p.id===id);assert.deepEqual(geometry,baseline.geometry,mode+' '+id+' settled geometry');(r.panels??=[]).push({id,geometry,status:'PASS'});
 }
 try{
 await p.goto(base+'/flows/auth-session/');await p.locator('.preview-tools details summary').click();await p.selectOption('#motion-mode',mode==='off'?'off':'auto');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.locator('.hn-task[data-route="inbound"]').click();await p.waitForTimeout(230);
 await check('S01 field error is immediate, fixed geometry and140ms/full or <=80ms reduced',async()=>{
  const rect=()=>p.locator('[data-p04-note]').boundingBox(),before=await rect();
  await frame('form-error',()=>p.evaluate(()=>{const e=document.querySelector('[data-p04-note]');e.value='X'.repeat(201);e.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-p04="next"]').click();}));
  assert.equal((await snap()).step,1);assert.equal(await p.locator('[data-p04-note]').getAttribute('aria-invalid'),'true');assert.deepEqual(await rect(),before);
  const effects=(await log()).filter(x=>x.owner==='FormFeedback');assert.equal(effects.length,mode==='off'?0:1);if(effects.length)assert.equal(effects[0].duration,mode==='auto'?140:80);
  assert.equal(await p.locator('#p04-error-note').evaluate(e=>e.scrollWidth<=e.clientWidth&&e.offsetHeight<=20),true);
  await p.locator('[data-p04-note]').fill('');await shot('P04.S01');
 });
 await a('next').click();await p.locator('.p04-tools summary').click();
 await p.evaluate(()=>window.cameraBefore=document.querySelector('.p04-camera'));
 await check('S02 sequence12 produces11 accepted and one duplicate, exactly11 one-shot event effects',async()=>{
  await reset();await a('batch').click();const s=await snap(),events=await log();assert.equal(s.attempts.length,12);assert.equal(s.accepted.length,11);assert.equal(new Set(s.attempts.map(x=>x.eventId)).size,12);
  const scans=events.filter(x=>x.owner==='ScanFeedback');assert.equal(scans.length,mode==='auto'?11:0);assert.ok(scans.every(x=>x.duration===160&&x.frames.every(f=>!f.transform)));
  assert.equal(await p.evaluate(()=>cameraBefore===document.querySelector('.p04-camera')&&cameraBefore.isConnected),true);await shot('P04.S02');
 });
 await check('Manual input/camera identity survives feedback; duplicate text immediate and never animates',async()=>{
  await a('manual').click();await p.evaluate(()=>window.inputBefore=document.querySelector('#p04-code'));await reset();await p.fill('#p04-code','HN12345');await p.locator('#p04-code').press('Enter');
  assert.equal((await snap()).accepted.length,11);assert.match(await p.locator('#p04-error-code').textContent(),/Không cộng/);assert.equal((await log()).filter(x=>x.owner==='ScanFeedback').length,0);
  assert.equal(await p.evaluate(()=>cameraBefore===document.querySelector('.p04-camera')&&inputBefore===document.querySelector('#p04-code')&&document.activeElement===inputBefore),true);
 });
 await check('Filter/repaint/Back never replays existing rows and counters stay final',async()=>{
  await reset();await p.locator('[data-p04-filter="valid"]').click();await a('all').click();await a('next').click();assert.match(await p.locator('.p04-products-title').textContent(),/11/);await shot('P04.S03');await a('back').click();assert.equal((await log()).filter(x=>x.owner==='ScanFeedback').length,0);assert.equal((await snap()).accepted.reduce((n,l)=>n+l.quantity,0),11);
 });
 await check('Current accepted-list profile stays small; camera/reticle geometry is static',async()=>{
  r.listProfile=await p.evaluate(()=>({accepted:m04Flow.snapshot().accepted.length,renderedScanRows:document.querySelectorAll('.p04-attempt').length,domNodes:document.querySelector('.p04-app').querySelectorAll('*').length,cameraAnimations:document.querySelector('.p04-camera').getAnimations({subtree:true}).length}));assert.equal(r.listProfile.accepted,11);assert.equal(r.listProfile.cameraAnimations,0);
 });
 await check('Leave scan with delayed callback cannot add data while away or after re-entry',async()=>{
  await p.evaluate(()=>window.lateScan=m04Flow.bindScan('camera-fixture'));const s=await snap();await p.goBack();await p.locator('#hn-home').waitFor({state:'visible'});assert.equal(await p.evaluate(()=>lateScan('HN12347')),false);await p.locator('.hn-task[data-route="inbound"]').click();assert.deepEqual((await snap()).attempts,s.attempts);assert.equal(await p.evaluate(()=>lateScan('HN12347')),false);
 });
 await a('next').click();
 await check('S04 fade starts only after confirmed record, one operation, no replay on document Back',async()=>{
  await reset();await a('send').click();assert.equal((await log()).filter(x=>x.owner==='SubmitFeedback').length,0);await p.locator('[data-panel="P04.S04"]').waitFor();
  const effects=(await log()).filter(x=>x.owner==='SubmitFeedback');assert.equal(effects.length,mode==='auto'?1:0);if(effects.length)assert.equal(effects[0].duration,160);assert.equal((await snap()).recorded,true);assert.match(await p.locator('.hn-waiting-web').textContent(),/Chờ xử lý trên Web/);await shot('P04.S04');
  await reset();await a('document').click();await p.locator('[data-panel="P12.S02"]').waitFor();await p.goBack();await p.locator('[data-panel="P04.S04"]').waitFor();assert.equal((await log()).filter(x=>x.owner==='SubmitFeedback').length,0);assert.equal((await p.evaluate(()=>m04Calls)).record,1);
 });
 await a('new-run').click();await a('next').click();await a('manual').click();
 await check('Real frame trace for accepted row160ms, immediate quantity and no camera motion',async()=>{
  await p.fill('#p04-code','HN12346');await frame('accepted-row',()=>p.locator('#p04-code').press('Enter'));assert.equal((await snap()).accepted.length,1);
  const events=await log();assert.equal(events.filter(x=>x.owner==='ScanFeedback').length,mode==='auto'?1:0);assert.ok(events.every(x=>x.frames.every(f=>!f.transform)));assert.equal(await p.locator('.p04-camera').evaluate(e=>e.getAnimations({subtree:true}).length),0);
  const values=r.frames.at(-1).samples.flatMap(f=>f.nodes.filter(n=>n.owner==='ScanFeedback').map(n=>Number(n.opacity)));assert.ok(values.length);if(mode==='auto')assert.ok(values.some(v=>v<1));else assert.ok(values.every(v=>v===1));
 });
 await a('next').click();await p.selectOption('[data-p04-outcome]','timeout-recorded');
 await check('UNKNOWN never fades success or enables resend; checking keeps original request',async()=>{
  await reset();await a('send').click();await p.locator('[data-panel="P17.S04"]').waitFor();const unknown=await snap();assert.equal(unknown.unknown,true);assert.equal((await log()).filter(x=>x.owner==='SubmitFeedback').length,0);assert.equal(await a('new-run').count(),0);assert.equal(await a('send').isDisabled(),true);assert.equal(await p.evaluate(()=>m04Flow.send()),false);
  await a('check').click();await p.locator('[data-panel="P04.S04"]').waitFor();assert.deepEqual((await snap()).request,unknown.request);assert.equal((await p.evaluate(()=>m04Calls)).record,2);
 });
 await a('new-run').click();await a('next').click();await a('manual').click();
 await check('Mode change and OS reduced cancel live effects without changing domain state',async()=>{
  await p.locator('.hn-tools > details > summary').first().click();await p.selectOption('#home-motion-mode','auto');
  await p.evaluate(()=>{const e=document.querySelector('#p04-code');e.value='HN12345';e.dispatchEvent(new Event('input',{bubbles:true}));e.form.requestSubmit();const m=document.querySelector('#home-motion-mode');m.value='off';m.dispatchEvent(new Event('change',{bubbles:true}));});
  assert.equal((await snap()).accepted.length,1);assert.equal(await p.locator('.p04-app').evaluate(e=>e.getAnimations({subtree:true}).length),0);await p.selectOption('#home-motion-mode','auto');await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>document.querySelector('#hn-destination').dataset.hnMotionMode==='reduced');await p.fill('#p04-code','HN12346');await reset();await p.locator('#p04-code').press('Enter');assert.equal((await log()).filter(x=>x.owner==='ScanFeedback').length,0);await p.emulateMedia({reducedMotion:mode==='os-reduced'?'reduce':'no-preference'});await p.selectOption('#home-motion-mode',mode==='off'?'off':'auto');
 });
 await check('Hidden page cancels feedback and consumes events without replay on visibility restore',async()=>{
  await p.evaluate(()=>{const e=document.querySelector('#p04-code');e.value='HN12347';e.dispatchEvent(new Event('input',{bubbles:true}));e.form.requestSubmit();Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await p.locator('.p04-app').evaluate(n=>n.getAnimations({subtree:true}).length),0);
  await reset();await p.evaluate(()=>{const e=document.querySelector('#p04-code');e.value='HN12348';e.dispatchEvent(new Event('input',{bubbles:true}));e.form.requestSubmit();delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));document.querySelector('[data-p04-filter="all"]').click();});assert.equal((await snap()).accepted.length,4);assert.equal((await log()).filter(x=>x.owner==='ScanFeedback').length,0);
 });
 await check('Permission guard cancels P04 effects immediately without dropping the scoped draft',async()=>{
  await p.evaluate(()=>{const e=document.querySelector('#p04-code');e.value='HN12349';e.dispatchEvent(new Event('input',{bubbles:true}));e.form.requestSubmit();document.querySelector('[data-system-demo="deny"]').click();});
  await p.locator('[data-panel="P15.S03"]').waitFor();assert.equal(await p.locator('#hn-destination').isVisible(),false);assert.equal(await p.locator('#hn-destination').evaluate(e=>e.getAnimations({subtree:true}).length),0);
  await p.evaluate(()=>document.querySelector('[data-system-demo="allow"]').click());await p.locator('.p04-app').waitFor({state:'visible'});assert.equal((await snap()).accepted.length,5);
 });
 r.domain=await snap();
 await check('Compact viewports, native focus/scroll, cancellation and logout leave no owned animations',async()=>{
  for(const [width,height]of [[360,800],[360,420]]){await p.setViewportSize({width,height});await p.locator('#p04-code').focus();await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const m=await p.evaluate(()=>{const s=document.querySelector('.hn-screen'),f=document.querySelector('.p04-footer').getBoundingClientRect(),r=s.getBoundingClientRect();return{viewport:[innerWidth,innerHeight],size:[s.offsetWidth,s.offsetHeight],overflow:document.documentElement.scrollWidth>innerWidth,footer:f.bottom<=r.bottom+1};});assert.deepEqual(m.size,[494,950]);assert.equal(m.overflow,false);assert.ok(m.footer);r.layouts.push(m);await p.locator('.hn-screen').screenshot({path:path.join(out,mode+'-small-'+height+'.png')});}
  await p.setViewportSize({width:494,height:950});await p.evaluate(()=>{window.detachedOwner=document.querySelector('#hn-destination');document.querySelector('#hn-logout').click();});await p.locator('#username').waitFor();assert.equal(await p.evaluate(()=>detachedOwner.getAnimations({subtree:true}).length),0);assert.equal(await p.evaluate(()=>detachedOwner.hasAttribute('data-hn-motion-mode')),false);
 });
 r.operations=await p.evaluate(()=>m04Calls);assert.deepEqual(r.operations,{record:2,check:1,camera:0});assert.deepEqual(errors,[]);
 await context.tracing.stop({path:path.join(out,mode+'-trace.zip')});await context.close();
 }catch(e){fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify(results,null,2));await context.tracing.stop({path:path.join(out,mode+'-failure-trace.zip')});throw e;}
}for(const r of results)assert.deepEqual(r.domain,results[0].domain,'mode cannot change domain state');fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({modes:results.length,groups:results.reduce((n,r)=>n+r.checks.length,0)}));}finally{await browser.close();}})();
