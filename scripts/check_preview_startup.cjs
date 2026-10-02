const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='handoff/P16/evidence/revision-03';
(async()=>{const browser=await chromium.launch(),p=await browser.newPage(),checks=[];let finish,fail=false;
// Isolate only the entry dependency, so the test does not depend on local server load.
await p.route('**/*',async r=>{const url=r.request().url();
 if(url.includes('bootstrap.mjs'))return r.fulfill({contentType:'text/javascript',body:fs.readFileSync('docs/flows/auth-session/bootstrap.mjs','utf8')});
 if(url.includes('app.mjs')){await new Promise(resolve=>finish=resolve);return r.fulfill({contentType:'text/javascript',body:fail?'throw new Error("test module failure")':'document.querySelector("#app").textContent="Ready";'});}
 return r.fulfill({contentType:'text/html',body:'<!doctype html><main id="app"></main><aside id="preview-startup-status" hidden><p></p><button onclick="location.reload()">Tải lại preview</button></aside><script type="module" src="./bootstrap.mjs"></script>'});
});
try{
 await p.goto('http://localhost:8766/startup-test/',{waitUntil:'commit'});await p.waitForSelector('#preview-startup-status:not([hidden])');assert.match(await p.locator('#preview-startup-status p').textContent(),/Đang mở/);assert.equal(await p.locator('#preview-startup-status').getAttribute('role'),'status');checks.push({name:'Pending module gives loading feedback',status:'PASS'});
 await p.waitForFunction(()=>document.querySelector('#preview-startup-status p').textContent.includes('lâu hơn'));assert.equal(await p.locator('#app').textContent(),'');checks.push({name:'Slow import explains explicit reload without automatic restart',status:'PASS'});finish();await p.waitForFunction(()=>document.querySelector('#app').textContent==='Ready');assert.ok(await p.locator('#preview-startup-status').isHidden());checks.push({name:'Successful import removes loading state',status:'PASS'});
 fail=true;finish=null;await p.reload({waitUntil:'commit'});await p.waitForSelector('#preview-startup-status:not([hidden])');finish();await p.waitForFunction(()=>document.querySelector('#preview-startup-status').getAttribute('role')==='alert');assert.match(await p.locator('#preview-startup-status p').textContent(),/Chưa tải được/);checks.push({name:'Rejected import exposes recovery instead of blank page',status:'PASS'});
 fail=false;finish=null;await p.locator('#preview-startup-status button').click();await p.waitForSelector('#preview-startup-status:not([hidden])');finish();await p.waitForFunction(()=>document.querySelector('#app').textContent==='Ready');assert.ok(await p.locator('#preview-startup-status').isHidden());checks.push({name:'User-triggered retry reloads and recovers',status:'PASS'});
 fs.writeFileSync(out+'/startup-results.json',JSON.stringify({checks},null,2));console.log(checks.length+' startup checks PASS');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
