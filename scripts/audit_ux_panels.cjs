const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.FINAL_URL||'http://127.0.0.1:8766/review/',phase=process.env.UX_PHASE||'panels-before';
const out=path.resolve('handoff/ux-audit-2026-10-01/'+phase);fs.mkdirSync(out,{recursive:true});
const catalog=JSON.parse(fs.readFileSync('docs/review/catalog.json'));
(async()=>{const browser=await chromium.launch(),checks=[];
 try{for(const item of catalog.panels){
  const context=await browser.newContext({viewport:{width:1440,height:950},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],failed=[];
  page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
  try{
   await page.goto(base+'?'+new URLSearchParams({view:'review',panel:item.id,motion:'reduced',flow:'closed'}));
   await page.waitForFunction(id=>document.querySelector('#status')?.textContent.startsWith('Đã mở '+id),item.id,{timeout:55000});
   const frame=page.frames().find(f=>f.url().includes('/auth-session/')),layouts=[];
   for(const width of [1440,360]){
    await page.setViewportSize({width,height:width===360?800:950});await page.waitForTimeout(120);
    const layout=await frame.evaluate(()=>{
     const root=[...document.querySelectorAll('.hn-screen,.screen')].find(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
     const screen=root.getBoundingClientRect(),outside=[],truncated=[],scroll=[];
     for(const e of root.querySelectorAll('*')){
      const r=e.getBoundingClientRect(),s=getComputedStyle(e);if(!r.width||!r.height||s.visibility==='hidden'||e.closest('[inert]'))continue;
      if(/^(BUTTON|INPUT|SELECT|TEXTAREA|A)$/.test(e.tagName)&&(r.right>screen.right+2||r.left<screen.left-2))outside.push({tag:e.tagName,cls:e.className,text:(e.textContent||e.getAttribute('aria-label')||'').slice(0,100),left:r.left,right:r.right});
      if(/^(BUTTON|LABEL|H1|H2|H3)$/.test(e.tagName)&&e.scrollWidth>e.clientWidth+3&&s.textOverflow!=='ellipsis')truncated.push({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,100),width:e.clientWidth,content:e.scrollWidth});
      if(['auto','scroll'].includes(s.overflowY)&&e.scrollHeight>e.clientHeight+3)scroll.push({cls:e.className,visible:e.clientHeight,content:e.scrollHeight});
     }
     return {width:innerWidth,height:innerHeight,screen:screen.toJSON(),documentOverflow:document.documentElement.scrollWidth>innerWidth+1,outside,truncated,scroll};
    });
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.equal(layout.documentOverflow,false);
    await page.screenshot({path:path.join(out,item.id+'-'+width+'.png')});layouts.push({width,...layout});
   }
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);checks.push({id:item.id,status:'PASS',layouts,errors,failed});
  }catch(e){checks.push({id:item.id,status:'FAIL',error:e.message,errors,failed});await page.screenshot({path:path.join(out,item.id+'-failure.png')}).catch(()=>{});}
  await context.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({build:catalog.build,base,checks},null,2));console.log(item.id+' '+checks.at(-1).status);
 }}finally{await browser.close();}process.exitCode=checks.some(c=>c.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;});
