const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.FEEDBACK_LIFECYCLE_OUT||'handoff/dialog-sync-2026-09-28/p04-p05');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  // Same-origin, isolated document: no P01/P02 listeners or app state changes.
  await page.goto((process.env.DIALOG_SYNC_BASE||'http://127.0.0.1:8766')+'/flows/shared/action-dialog.css');
  const results=await page.evaluate(async()=>{
   const {createActionFeedback}=await import('/flows/shared/action-feedback.mjs'),{openAppModal}=await import('/flows/shared/app-modal.mjs');
   const screen=document.createElement('section');screen.style.cssText='position:fixed;inset:0;width:494px;height:950px';screen.innerHTML='<h1 tabindex="-1">Lifecycle verification</h1>';document.body.replaceChildren(screen);
   const pause=()=>new Promise(r=>setTimeout(r,120)),results=[];let run=0;
   for(const scenario of ['normal','clear-open','clear-reactivate','clear-next','queued-next','behind-rich','dispose-pending']){
    let active=true,calls=0,closed=0;const feedback=createActionFeedback({getScreen:()=>screen,isActive:()=>active,key:'hnLifecycleTest'+(++run)});
    const config={title:'first',message:'first',confirmLabel:'Apply',onConfirm:()=>calls++,onClose:()=>closed++};
    let whileRich=null;
    if(scenario==='behind-rich'){
     const dialog=document.createElement('dialog');dialog.innerHTML='<button>Close rich dialog</button>';const rich=openAppModal({screen,dialog});feedback.show(config);whileRich=screen.querySelectorAll('.app-modal-host').length;rich.close();await pause();
    }else{
     feedback.show(config);if(scenario==='queued-next')feedback.show({title:'next',message:'next'});
     if(scenario!=='clear-open')screen.querySelector('[data-action-dialog="confirm"]').click();
     if(scenario.startsWith('clear')){active=false;feedback.clear();active=true;if(scenario==='clear-next')feedback.show({title:'next',message:'next'});}
     if(scenario==='dispose-pending')feedback.dispose();
     await pause();
    }
    results.push({scenario,calls,closed,whileRich,title:screen.querySelector('dialog[open] h2')?.textContent||null,overlays:screen.querySelectorAll('.app-modal-host').length});
    feedback.clear();await pause();feedback.dispose();
   }
   return results;
  });
  for(const r of results){
   assert.equal(r.calls,['normal','queued-next'].includes(r.scenario)?1:0,r.scenario+' action count');
   assert.equal(r.closed,['normal','queued-next'].includes(r.scenario)?1:0,r.scenario+' onClose count');
   const title=['clear-next','queued-next'].includes(r.scenario)?'next':r.scenario==='behind-rich'?'first':null;assert.equal(r.title,title,r.scenario+' next dialog');assert.equal(r.overlays,title?1:0,r.scenario+' overlay count');if(r.scenario==='behind-rich')assert.equal(r.whileRich,1);
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'shared-feedback-lifecycle.json'),JSON.stringify({status:'PASS',cases:results,errors},null,2));console.log(JSON.stringify({cases:results.length,status:'PASS',results}));
 }catch(e){fs.writeFileSync(path.join(out,'shared-feedback-lifecycle-failure.json'),JSON.stringify({error:e.stack,errors},null,2));throw e;}finally{await browser.close();}
})();
