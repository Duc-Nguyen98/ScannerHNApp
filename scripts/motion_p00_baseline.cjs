const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.resolve(process.env.MOTION_BASELINE_DIR||'handoff/motion/M00/before-evidence');
const base=process.env.PREVIEW_BASE_URL||'http://127.0.0.1:8766';
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch();
  const crypto=require('node:crypto'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
  const files=fs.readdirSync('docs/flows',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>path.join(e.parentPath,e.name).replaceAll('\\','/')).sort().map(file=>({file,sha256:hash(fs.readFileSync(file)),bytes:fs.statSync(file).size}));
  const appSourceHash=hash(JSON.stringify(files));
  fs.writeFileSync(path.join(out,'source-manifest.json'),JSON.stringify({definition:'SHA256 of sorted docs/flows file/sha256/bytes array; includes untracked application files',appSourceHash,files},null,2));
  const rows=[],errors=[],external=[];
  async function collect(mode){
    const context=await browser.newContext({viewport:{width:494,height:950},timezoneId:'Asia/Ho_Chi_Minh'});
    await context.tracing.start({screenshots:true,snapshots:true,sources:true});
    await context.grantPermissions([]);
    const page=await context.newPage();
    page.setDefaultTimeout(10000);
    await page.emulateMedia({reducedMotion:mode==='reduced'?'reduce':'no-preference'});
    page.on('pageerror',e=>errors.push({mode,message:e.message}));
    page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:')&&r.url()!=='about:blank')external.push({mode,url:r.url()});});
    async function openLogin(){
      await page.goto(`${base}/flows/auth-session/`);
    }
    async function record(id,ready){
      await ready();
      const selector='.hn-screen:visible, .screen:visible';
      await page.locator(selector).screenshot({path:path.join(out,`${mode}-${id}.png`)});
      const data=await page.locator(selector).evaluate((screen,{id,mode})=>{
        const nodes=[screen,...screen.querySelectorAll('*')];
        const visible=nodes.filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
        const scrollers=visible.filter(e=>{const s=getComputedStyle(e);return /(auto|scroll)/.test(s.overflow+s.overflowY)&&e.scrollHeight>e.clientHeight+1;});
        const animated=visible.map(e=>{const s=getComputedStyle(e);return {class:e.className,animation:s.animationName,transition:s.transitionProperty,animationDuration:s.animationDuration,transitionDuration:s.transitionDuration};}).filter(x=>(x.animation!=='none'&&x.animationDuration.split(',').some(v=>parseFloat(v)>0))||(x.transition!=='none'&&x.transitionDuration.split(',').some(v=>parseFloat(v)>0)));
        const rect=screen?.getBoundingClientRect();
        const snapshots=[...document.querySelectorAll('[data-p04-snapshot], [data-p20-snapshot]')].map(e=>{try{const s=JSON.parse(e.textContent);return {owner:e.getAttributeNames().find(n=>n.endsWith('-snapshot')),metrics:s.metrics||null};}catch{return null;}}).filter(Boolean);
        const resources=performance.getEntriesByType('resource');
        return {id,mode,viewport:[innerWidth,innerHeight],screen:rect?{x:rect.x,y:rect.y,width:rect.width,height:rect.height}:null,documentDomNodes:document.querySelectorAll('*').length,screenDomNodes:nodes.length,visibleScreenNodes:visible.length,scrollContainers:scrollers.map(e=>({class:e.className||'',id:e.id||'',client:[e.clientWidth,e.clientHeight],scroll:[e.scrollWidth,e.scrollHeight]})),animatedStyles:animated,operationSnapshots:snapshots,activeElement:document.activeElement?.outerHTML?.slice(0,240)||null,route:location.hash,documentTitle:document.title,performance:{navigation:performance.getEntriesByType('navigation')[0]?.toJSON?.()||null,resourceCount:resources.length,resourceTransferBytes:resources.reduce((n,r)=>n+r.transferSize,0),resourceDecodedBytes:resources.reduce((n,r)=>n+r.decodedBodySize,0)}};
      },{id,mode});
      data.listRows=await page.locator('.p06-list [data-p06-item], .p08-row, .p12-record, [data-p20-document], .p22-row, .p23-row').count();
      rows.push(data);
      console.log(`${mode} ${id} nodes=${data.visibleScreenNodes}`);
    }
    try{
      await openLogin(); await page.locator('#login-form').waitFor(); await record('P01-login',async()=>{});
      await page.fill('#username','minhanh');await page.fill('#password','preview');await page.click('#submit');await page.locator('#start').waitFor();
      await record('P01-confirmation',async()=>{await page.locator('#start').waitFor();});
      await page.click('#start');await page.locator('#hn-home:not([hidden])').waitFor();
      await record('P02-home',async()=>{});
      await page.click('[data-tab=lookup]');await page.locator('.p03-dialog').waitFor();
      await record('P03-picker',async()=>{});
      await page.locator('[data-p03-operation=inbound]').click();await page.locator('.p04-app').waitFor();
      await page.locator('[data-p04=next]').first().click();await page.locator('[data-panel="P04.S02"]').waitFor();
      await record('P04-scanner',async()=>{});
      await page.locator('[data-p04=back]').first().click();await page.locator('[data-p04=back]').first().click();await page.locator('#hn-home:not([hidden])').waitFor();
      await page.click('.hn-scanner');await page.locator('.p06-app').waitFor();await record('P06-lookup-list',async()=>{});await page.locator('[data-p06=back]').first().click();
      await page.click('[data-tab=history]');await page.frameLocator('iframe').locator('[data-action="history-general"]').click();await page.locator('.p08-app').waitFor();
      await record('P08-history-list',async()=>{});
      await page.fill('#p08-search','LS-0001');await page.click('[data-p08-record="LS-0001"]');await page.locator('.p08-detail-hero').waitFor();
      await record('P08-history-detail',async()=>{});
      await page.click('[data-p08=back]');await page.click('[data-tab=documents]');await page.locator('.p12-app').waitFor();
      await record('P12-documents',async()=>{});
      await page.evaluate(()=>location.hash='#p02/component-history?case=BH-001&sample=history');await page.locator('.p20-app').waitFor();
      await record('P20-component-history',async()=>{await page.waitForFunction(()=>{const s=JSON.parse(document.querySelector('[data-p20-snapshot]').textContent);return s.loaded&&!s.loading;});});
      await page.evaluate(()=>location.hash='#p02/history?scene=nfc');await page.locator('.p22-app').waitFor();
      await record('P22-nfc-unavailable',async()=>{});
      await page.evaluate(()=>location.hash='#p02/history?scene=sessions');await page.locator('.p23-app').waitFor();
      await record('P23-sessions-unavailable',async()=>{});
    }catch(error){errors.push({mode,message:error.message,stack:error.stack});await page.screenshot({path:path.join(out,`${mode}-failure.png`)}).catch(()=>{});}
    await context.tracing.stop({path:path.join(out,`${mode}-trace.zip`)});
    await context.close();
  }
  await collect('normal'); await collect('reduced');
  const summary={fixture_version:'hn-flow-gate-2026-09-30-v1',appSourceHash,browser:browser.version(),harnessHash:hash(fs.readFileSync(__filename)),source_commit:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),modes:['normal','reduced'],rows,errors,externalRequests:external,notes:['Pre-motion baseline only; no animation imported into app.','Browser/emulation measurements, not hardware acceptance.','Existing authored transitions/animations are inventoried, not changed by this setup.']};
  fs.writeFileSync(path.join(out,'baseline.json'),JSON.stringify(summary,null,2));
  console.log(JSON.stringify({rows:rows.length,errors:errors.length,external:external.length,output:path.relative(process.cwd(),path.join(out,'baseline.json')).replaceAll('\\','/')}));
  await browser.close();
  if(errors.length||external.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
