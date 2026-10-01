const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve('handoff/motion/M03/evidence'),base=process.env.PREVIEW_BASE_URL||'http://127.0.0.1:8766',before=process.argv.includes('--before');fs.mkdirSync(out,{recursive:true});
async function geometry(p){return p.evaluate(()=>Object.fromEntries(['.hn-screen','.p03-header','.p03-backdrop','.p03-dialog','.hn-nav','.hn-scan-circle'].map(s=>{const e=document.querySelector(s),r=e.getBoundingClientRect(),c=getComputedStyle(e);return[s,{x:r.x,y:r.y,width:r.width,height:r.height,background:c.backgroundColor,padding:c.padding,font:c.font,borderRadius:c.borderRadius}]})));}
(async()=>{const browser=await chromium.launch(),results=[];try{
 for(const mode of before?['auto']:['auto','os-reduced','off']){
  const context=await browser.newContext({viewport:{width:494,height:950},reducedMotion:mode==='os-reduced'?'reduce':'no-preference'}),p=await context.newPage();p.setDefaultTimeout(12000);
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{window.p03MotionLog=[];window.m03Ops={discard:0,save:0};const animate=Element.prototype.animate;Element.prototype.animate=function(frames,options){if(this.closest('.p03-host'))window.p03MotionLog.push({target:this.className,panel:this.dataset.panel||null,frames,duration:options.duration});return animate.call(this,frames,options);};});
  await p.route('**/stock-owner-adapter.mjs*',async r=>{const response=await r.fetch();let body=await response.text();body=body.replace('discardLocal(doc) {','discardLocal(doc) { window.m03Ops.discard++;').replace('async saveDraft(doc) {','async saveDraft(doc) { window.m03Ops.save++;');await r.fulfill({response,body});});
  await context.tracing.start({screenshots:true,snapshots:true,sources:true});
  await p.goto(base+'/flows/auth-session/');await p.locator('.preview-tools details summary').click();await p.selectOption('#motion-mode',mode==='off'?'off':'auto');
  await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.locator('#hn-home:not([hidden])').waitFor();await p.locator('.p03-tools summary').click();
  const row={mode,panels:[],checks:[],errors};results.push(row);
  const check=async(name,fn)=>{try{await fn();row.checks.push(name);console.log('PASS '+mode+' '+name);}catch(e){row.failure={name,message:e.stack};fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify(results,null,2));await p.screenshot({path:path.join(out,mode+'-failure.png')});throw e;}};
  const snap=async()=>JSON.parse(await p.locator('[data-p03-snapshot]').textContent());
  const live=()=>p.locator('.p03-dialog[data-panel]');
  const idle=async()=>{await p.waitForTimeout(250);assert.equal(await p.locator('.p03-host').evaluate(e=>e.getAnimations({subtree:true}).length),0);};
  for(const [fixture,id] of [['picker','P03.S01'],['local','P03.S02'],['discard','P03.S04'],['stopped','P03.S03']]){
   await p.evaluate(()=>window.p03MotionLog=[]);
   await p.click(`[data-p03-open=${fixture}]`);await p.locator(`.p03-dialog[data-panel="${id}"]`).waitFor();await p.waitForTimeout(260);
   const panel={id,geometry:await geometry(p),content:await live().innerText(),motion:await p.evaluate(()=>window.p03MotionLog)};row.panels.push(panel);await p.screenshot({path:path.join(out,`${before?'before':mode}-${id}.png`)});
   if(!before)await check(id+' settled geometry/content/guard and motion policy',async()=>{
    const original=JSON.parse(fs.readFileSync(path.join(out,'before.json')))[0].panels.find(x=>x.id===id);assert.deepEqual(panel.geometry,original.geometry);
    const enter=panel.motion.filter(x=>x.panel===id);assert.equal(enter.length,mode==='auto'?1:0);
    if(mode==='auto'){assert.equal(enter[0].duration,220);assert.equal(panel.motion[0].duration,140);assert.ok(id==='P03.S03'?enter[0].frames.every(x=>!x.transform):enter[0].frames.some(x=>x.transform==='translateY(8px)'));}
    if(mode==='off')assert.equal(panel.motion.length,0);
    if(mode==='os-reduced')assert.ok(panel.motion.every(x=>x.duration<=80&&x.frames.every(f=>!f.transform)));
    const selector=({'P03.S01':'[data-p03-operation=inbound]','P03.S02':'[data-p03-action=resume]','P03.S03':'[data-p03-action=home]','P03.S04':'[data-p03-action=cancel]'})[id];assert.equal(await p.locator(selector).evaluate(e=>e===document.activeElement),true);
    if(id==='P03.S04'){await p.keyboard.press('Shift+Tab');assert.equal(await p.locator('[data-p03-action=confirmDiscard]').evaluate(e=>e===document.activeElement),true);await p.keyboard.press('Tab');}
   });
   if(id==='P03.S03')await p.click('[data-p03-action=home]');else{await p.click('[data-p03-action=cancel]');if(id==='P03.S04')await p.click('[data-p03-action=cancel]');}
   await p.locator('.p03-dialog').waitFor({state:'detached'});await p.waitForTimeout(180);
  }
  if(!before){
   await p.selectOption('[data-p03-fixture=warehouse]','active');
   await check('Ten rapid open/close cycles preserve exact draft and restore locks/focus',async()=>{
    const original=(await snap()).document;
    for(let i=0;i<10;i++){
     await p.evaluate(()=>{const trigger=document.querySelector('[data-p03-open=resume]');trigger.focus();trigger.click();document.querySelector('[data-p03-action=cancel]').click();});
     assert.equal((await snap()).panel,null);assert.deepEqual((await snap()).document,original);
     assert.equal(await p.locator('[data-p03-open=resume]').evaluate(e=>e===document.activeElement),true);
     assert.equal(await p.evaluate(()=>document.documentElement.style.overflow),'');assert.equal(await p.evaluate(()=>document.body.style.overflow),'');
    }
    await idle();assert.equal(await p.locator('.p03-backdrop').count(),0);assert.equal(await p.locator('.p03-host').getAttribute('inert'),null);
   });
   await check('Exit is presentation only, real RAF samples; rapid reopen cannot be removed by old completion',async()=>{
    await p.click('[data-p03-open=resume]');await idle();
    row.exitFrames=await p.evaluate(()=>{document.querySelector('[data-p03-action=cancel]').click();const start=performance.now(),frames=[];return new Promise(resolve=>{function frame(t){const host=document.querySelector('.p03-host'),d=host.querySelector('.p03-dialog');frames.push({ms:t-start,hidden:host.hidden,inert:host.inert,opacity:d?getComputedStyle(d).opacity:null,panel:JSON.parse(document.querySelector('[data-p03-snapshot]').textContent).panel});if(t-start<220)requestAnimationFrame(frame);else resolve(frames);}requestAnimationFrame(frame);});});
    assert.ok(row.exitFrames.every(f=>f.panel===null));assert.ok(row.exitFrames.at(-1).hidden);
    if(mode==='auto')assert.ok(row.exitFrames.some(f=>f.inert&&f.opacity>0&&f.opacity<1));
    await p.evaluate(()=>{document.querySelector('[data-p03-open=resume]').click();document.querySelector('[data-p03-action=cancel]').click();document.querySelector('[data-p03-open=resume]').click();});await idle();assert.equal(await live().count(),1);await p.click('[data-p03-action=cancel]');await idle();
   });
   await check('Counted lock + top-layer keyboard ownership; close top preserves P03 lock',async()=>{
    await p.click('[data-p03-open=resume]');
    await p.evaluate(async()=>{const {openAppModal}=await import('/flows/shared/app-modal.mjs');const d=document.createElement('dialog');d.id='m03-nested';d.innerHTML='<button>Test nested</button>';window.m03Nested=openAppModal({screen:document.querySelector('.hn-screen'),dialog:d});});
    await p.keyboard.press('Escape');assert.equal(await p.locator('#m03-nested').count(),0);assert.equal(await live().count(),1);assert.equal(await p.evaluate(()=>document.documentElement.style.overflow),'hidden');
    await p.keyboard.press('Escape');await idle();assert.equal(await p.evaluate(()=>document.documentElement.style.overflow),'');
   });
   await check('Confirm discard + immediate close occurs once; server/POSTED retain their exact data',async()=>{
    await p.click('[data-p03-open=discard]');await p.evaluate(()=>{const b=document.querySelector('[data-p03-action=confirmDiscard]');b.click();b.click();document.querySelector('[data-p03-back]').click();});
    assert.equal((await snap()).document,null);assert.equal(await p.evaluate(()=>m03Ops.discard),1);
    await p.locator('.hn-action-dialog[open]').waitFor();await p.keyboard.press('Escape');await p.locator('.app-modal-host').waitFor({state:'detached'});await idle();
    for(const kind of ['server','posted']){await p.click(`[data-p03-open=${kind}]`);const original=(await snap()).document;await p.click('[data-p03-action=discard]');await p.click('[data-p03-action=confirmDiscard]');assert.deepEqual((await snap()).document,original);assert.match(await live().innerText(),/Không được xóa/);await p.click('[data-p03-action=cancel]');await p.click('[data-p03-action=cancel]');await idle();}
    assert.equal(await p.evaluate(()=>m03Ops.discard),1);
   });
   await check('Save UNKNOWN retains IDs/codes, blocks resend; response update does not replay enter',async()=>{
    await p.selectOption('[data-p03-fixture=save]','unknown');await p.click('[data-p03-open=local]');const original=(await snap()).document;await idle();await p.evaluate(()=>window.p03MotionLog=[]);
    await p.click('[data-p03-action=save]');await p.locator('[data-p03-action=checkSave]').waitFor();assert.equal(await p.locator('[data-p03-action=save]').isDisabled(),true);assert.deepEqual((await snap()).document,original);assert.equal(await p.evaluate(()=>m03Ops.save),1);assert.equal(await p.evaluate(()=>p03MotionLog.length),0);
    await p.click('[data-p03-action=cancel]');await idle();
   });
   await check('Stopped warehouse deep link blocks mutation immediately in all modes',async()=>{
    await p.selectOption('[data-p03-fixture=warehouse]','stopped');await p.evaluate(()=>location.hash='#p02/inbound');await p.locator('[data-panel="P03.S03"]').waitFor();assert.equal(await p.locator('.p04-app:visible').count(),0);await p.keyboard.press('Escape');assert.equal(await live().getAttribute('data-panel'),'P03.S03');await p.click('[data-p03-action=home]');await idle();await p.selectOption('[data-p03-fixture=warehouse]','active');
   });
   await check('Live mode/OS changes cancel handles; native scrolling at compact viewport',async()=>{
    await p.evaluate(()=>document.querySelector('[data-p03-open=resume]').click());await p.evaluate(()=>{const s=document.querySelector('#home-motion-mode');s.value='off';s.dispatchEvent(new Event('change',{bubbles:true}));});assert.equal(await p.locator('.p03-host').evaluate(e=>e.getAnimations({subtree:true}).length),0);
    await p.click('[data-p03-action=cancel]');await p.setViewportSize({width:360,height:420});await p.click('[data-p03-open=resume]');await p.screenshot({path:path.join(out,mode+'-compact.png')});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.click('[data-p03-action=cancel]');await p.setViewportSize({width:494,height:950});
    await p.evaluate(()=>{const s=document.querySelector('#home-motion-mode');s.value='auto';s.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-p03-open=resume]').click();});await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>document.querySelector('.p03-host').dataset.hnMotionMode==='reduced');await idle();await p.click('[data-p03-action=cancel]');await idle();
   });
   await check('Security teardown during motion removes protected host immediately',async()=>{
    await p.evaluate(()=>{document.querySelector('[data-p03-open=resume]').click();document.querySelector('#hn-logout').click();});await p.locator('#username').waitFor();assert.equal(await p.locator('.p03-host').count(),0);assert.equal(await p.evaluate(()=>document.documentElement.style.overflow),'');assert.equal(await p.evaluate(()=>document.body.style.overflow),'');
   });
   row.operations=await p.evaluate(()=>m03Ops);assert.deepEqual(row.operations,{discard:1,save:1});assert.deepEqual(errors,[]);
  }
  await context.tracing.stop({path:path.join(out,`${before?'before':mode}-trace.zip`)});await context.close();
 }
 fs.writeFileSync(path.join(out,before?'before.json':'results.json'),JSON.stringify(results,null,2));
}finally{await browser.close();}})();
