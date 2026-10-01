const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve('handoff/motion/M00/harness'),out=path.resolve('handoff/motion/M00/verification');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch(),rows=[],errors=[];
 try{
 for(const viewport of [{width:360,height:800},{width:1440,height:900},{width:360,height:420}]){
  const context=await browser.newContext({viewport,reducedMotion:'no-preference'});
  await context.tracing.start({screenshots:true,snapshots:true,sources:true});
  const p=await context.newPage();p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
  await p.route('http://motion.test/**',r=>{const file=path.basename(new URL(r.request().url()).pathname)||'index.html';if(!['index.html','harness.mjs','motion-primitives.mjs','motion-tokens.css'].includes(file))return r.abort();return r.fulfill({body:fs.readFileSync(path.join(root,file)),contentType:file.endsWith('.mjs')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});});
  await p.goto('http://motion.test/index.html');await p.waitForFunction(()=>!!window.harness);
  for(const mode of ['auto','reduced','off']){
   await p.selectOption('#mode',mode);
   const initial=await p.evaluate(()=>harness.operations);
   const effect=await p.evaluate(()=>{document.querySelector('#press').click();document.querySelector('#navigate').click();return document.getAnimations().map(a=>({frames:a.effect.getKeyframes(),duration:a.effect.getTiming().duration}));});
   assert.equal(await p.evaluate(()=>harness.operations),initial+1);
   if(mode==='off')assert.deepEqual(effect,[]);else assert.ok(effect.length>0);
   if(mode==='reduced')for(const e of effect){assert.ok(e.duration<=80);assert.ok(e.frames.every(f=>!f.transform));}
   await p.locator('#list').evaluate(e=>e.scrollTop=200);const top=await p.locator('#list').evaluate(e=>e.scrollTop);
   await p.click('#open');await p.locator('#modal[open]').waitFor();await p.fill('#note','IME fixture / ghi chu');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'close');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'note');
   await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),'open');assert.equal(await p.locator('#list').evaluate(e=>e.scrollTop),top);assert.equal(await p.evaluate(()=>harness.motion.activeCount),0);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await p.screenshot({path:path.join(out,`${viewport.width}x${viewport.height}-${mode}.png`)});
   rows.push({viewport,mode,operationDelta:1,modalFocusCleanup:true,nativeScrollPreserved:true,effects:effect});
  }
  await p.selectOption('#mode','auto');
  await p.evaluate(()=>{for(let i=0;i<20;i++)document.querySelector('#navigate').click();document.querySelector('#open').click();});
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>harness.motion.mode==='reduced');assert.equal(await p.evaluate(()=>harness.motion.activeCount),0);
  await p.keyboard.press('Escape');await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForFunction(()=>harness.motion.mode==='auto');
  const guards=await p.evaluate(()=>{const m=harness.motion,button=document.querySelector('#press'),modal=document.querySelector('#modal');button.disabled=true;m.pressFeedback(button);const disabled=m.activeCount;button.disabled=false;document.querySelector('#open').click();const exit=m.modalSheetMotion(modal,{exit:true});exit.cancel();const cancelled=m.activeCount;document.querySelector('#close').click();m.setMode('invalid');m.noticeFeedback(document.querySelector('#notice'));const failSafe=m.mode==='off'&&m.activeCount===0;m.setMode('auto');return {disabled,cancelled,failSafe};});assert.deepEqual(guards,{disabled:0,cancelled:0,failSafe:true});
  const security=await p.evaluate(()=>{document.querySelector('#navigate').click();document.querySelector('#security').click();return {protected:!!document.querySelector('#protected'),active:harness.motion.activeCount};});assert.deepEqual(security,{protected:false,active:0});
  const cleanup=await p.evaluate(()=>{harness.motion.noticeFeedback(document.querySelector('#notice'));harness.motion.dispose();document.querySelector('#press').click();return {active:harness.motion.activeCount,animations:document.getAnimations().length,attribute:document.querySelector('#owner').hasAttribute('data-hn-motion-mode')};});assert.deepEqual(cleanup,{active:0,animations:0,attribute:false});
  await context.tracing.stop({path:path.join(out,`${viewport.width}x${viewport.height}-trace.zip`)});await context.close();
 }
 assert.deepEqual(errors,[]);
 const bytes=Object.fromEntries(['motion-primitives.mjs','motion-tokens.css'].map(f=>[f,fs.statSync(path.join(root,f)).size]));
 const sourceHashes=Object.fromEntries(['motion-primitives.mjs','motion-tokens.css','harness.mjs','index.html'].map(f=>[f,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({status:'PASS_HARNESS',rows,errors,liveOSChange:true,rapidNavigation:true,securityImmediate:true,cleanup:true,sourceBytes:bytes,sourceHashes,appImportedBytes:0,hardware:'NOT_RUN'},null,2));console.log(JSON.stringify({status:'PASS_HARNESS',cases:rows.length,errors,sourceBytes:bytes}));
 }catch(e){fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:e.stack,rows,errors},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
