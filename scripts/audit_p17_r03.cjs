const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const phase=process.env.AUDIT_PHASE||'before',out=`handoff/P17/evidence/revision-03/${phase}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch(),p=await browser.newPage({viewport:{width:494,height:950},deviceScaleFactor:1,reducedMotion:'reduce'}),findings=[],errors=[];p.setDefaultTimeout(20000);p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(()=>{window.copyMode='pending';window.copyCalls=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:text=>{copyCalls.push(text);return copyMode==='pending'?new Promise(r=>window.finishCopy=r):Promise.resolve();}}});});
// Exercise timeout without making the suite wait eight seconds per case.
await p.route('**/scan-exceptions/experience.mjs*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('docs/flows/scan-exceptions/experience.mjs','utf8').replace('clipboardTimeoutMs=8000','clipboardTimeoutMs=500')}));
const act=a=>p.locator(`[data-p04="${a}"]`).first();
const record=async(id,name,passed,evidence={})=>{findings.push({id,name,passed,...evidence});console.log(`${passed?'PASS':'REPRODUCED'} ${id} ${name}`);await p.evaluate(()=>scrollTo(0,0));await p.locator('.hn-screen').screenshot({path:out+'/'+id+'.png'});};
async function login(){await p.goto('http://localhost:8766/flows/auth-session/');await p.waitForSelector('#username',{timeout:60000});await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');}
async function unknown(mode='unknown'){await login();await p.click('[data-route=inbound]');await p.locator('.p04-tools').evaluate(e=>e.open=true);await act('next').click();await act('manual').click();await p.fill('#p04-code','HN12345');await p.press('#p04-code','Enter');await act('next').click();await p.selectOption('[data-p04-outcome]',mode);await act('send').click();await p.waitForSelector('[data-panel="P17.S04"]');}
async function copyOpen(){if(!await p.locator('.p17-identity').evaluate(e=>e.open))await p.locator('.p17-identity summary').click();await act('copy-reconciliation').click();}
try{
if(!process.env.AUDIT_P16_ONLY){
await unknown('status-unavailable');
await record('F01','Unavailable status has an actionable route to reconciliation details',await p.locator('.p17-footer button:not(:disabled):not([aria-disabled=true])').count()>0);
await record('F02','Reconciliation summary touch target is at least 44 CSS px',await p.locator('.p17-identity summary').evaluate(e=>e.offsetHeight>=44));
await login();await p.click('[data-route=inbound]');await p.locator('.p04-tools').evaluate(e=>e.open=true);await act('next').click();await act('batch').click();await act('all').click();await act('manual').click();await p.fill('#p04-code','HN-BAD-RAW');
await p.evaluate(()=>{const s=document.querySelector('.p04-scroll');s.scrollTop=s.scrollHeight;document.querySelector('#p04-code').form.requestSubmit();});await p.waitForSelector('[data-panel="P17.S01"]');await act('exception-manual').click();
const visibility=await p.locator('#p04-code').evaluate(e=>{const r=e.getBoundingClientRect(),s=e.closest('.p04-scroll').getBoundingClientRect();return {top:r.top,bottom:r.bottom,scrollTop:s.top,scrollBottom:s.bottom,focused:e===document.activeElement};});
await record('F03','Explicit manual correction brings focused input into the visible scroll area',visibility.focused&&visibility.top>=visibility.scrollTop&&visibility.bottom<=visibility.scrollBottom,visibility);
await p.fill('#p04-code','HN-BAD-AGAIN');await p.press('#p04-code','Enter');await p.waitForSelector('[data-panel="P17.S01"]');await p.goBack();await p.waitForTimeout(160);
await record('F04','Native Back closes the exception before leaving the owner',await p.locator('[data-panel="P04.S02"]').count()===1);
await unknown();await copyOpen();await act('home').click();await p.click('[data-route=inbound]');await p.evaluate(()=>copyMode='ok');await copyOpen();await p.waitForTimeout(150);
await record('F05','Pending clipboard from a departed view cannot lock copy after re-entry',await p.evaluate(()=>copyCalls.length)===2);
await unknown();await copyOpen();await p.waitForTimeout(700);
await record('F06','Unresponsive clipboard ends with a usable manual-copy fallback',await p.locator('.hn-action-dialog[open]').count()===1);
}
await p.route('**/home/home.mjs*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('docs/flows/home/home.mjs','utf8').replace('onSystemError:showSystem,supplierHistory','readList:window.auditRead,onSystemError:showSystem,supplierHistory')}));
await p.addInitScript(()=>{window.readMode='ready';window.auditRead=()=>readMode==='pending'?new Promise(r=>window.finishRead=r):window.rows;});
await p.goto('http://localhost:8766/flows/auth-session/');await p.evaluate(async()=>window.rows=(await import('/flows/documents/document-model.mjs')).mergeDocuments([]));await p.waitForSelector('#username',{timeout:60000});await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');await p.click('[data-tab=documents]');
const reload=()=>p.evaluate(()=>{readMode='pending';const b=document.createElement('button');b.dataset.p12='retry';document.querySelector('.p12-app').append(b);b.click();b.remove();});
await p.locator('[data-p12=scan]').focus();await reload();await p.evaluate(()=>finishRead(rows));await p.waitForTimeout(100);
await record('F07','Async list completion restores focused toolbar action',await p.evaluate(()=>document.activeElement.dataset.p12==='scan'));
await p.locator('[data-p12-doc]').first().focus();const focusedId=await p.evaluate(()=>document.activeElement.dataset.p12Doc);await reload();await p.evaluate(id=>finishRead(rows.filter(r=>r.id!==id)),focusedId);await p.waitForTimeout(100);
await record('F08','When focused record disappears focus stays in the document list',await p.locator('.p12-records').evaluate(e=>e===document.activeElement));
await p.evaluate(()=>readMode='ready');const long='Đặng Ánh '.repeat(230)+'W'.repeat(300);await p.fill('#p12-query',long);await p.press('#p12-query','Enter');await p.waitForSelector('[data-panel="P16.S03"]');await p.waitForTimeout(150);
const readers=await p.locator('.p16-state [data-p12=read-query]:not([hidden])').count();const heights=await p.locator('.p16-state p').evaluate(e=>({height:e.clientHeight,lineHeight:parseFloat(getComputedStyle(e).lineHeight)}));
await record('F09','Long no-results description is limited to 3 lines with full-text reader',readers>0&&heights.height<=heights.lineHeight*3+1,heights);
await record('F10','Full query reader touch target is at least 44 CSS px',await p.locator('[data-p12=read-query]').evaluate(e=>e.offsetHeight>=44));
if(phase.startsWith('after')&&readers){await p.locator('.p16-state [data-p12=read-query]').click();assert.ok((await p.locator('.app-modal-host').innerText()).includes(long));await p.keyboard.press('Escape');await p.waitForTimeout(100);assert.equal(await p.inputValue('#p12-query'),long);}
fs.writeFileSync(out+'/findings.json',JSON.stringify({phase,findings,errors},null,2));if(phase.startsWith('after')){assert.deepEqual(errors,[]);assert.ok(findings.every(f=>f.passed),'Unresolved audit finding');}
}catch(e){fs.writeFileSync(out+'/run-failure.json',JSON.stringify({error:e.stack,findings,errors},null,2));await p.screenshot({path:out+'/run-failure.png',fullPage:true}).catch(()=>{});throw e;}finally{await browser.close();}})();
