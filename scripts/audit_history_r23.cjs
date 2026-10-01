const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const phase=process.env.HISTORY_PHASE||'before',out=path.resolve('handoff/P08/evidence/revision-23/'+phase);fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true}),p=await b.newPage({viewport:{width:494,height:1000}}),observations=[],errors=[];p.on('pageerror',e=>errors.push(e.stack));
const shot=async n=>{await p.mouse.move(0,0);await p.locator('.hn-screen').screenshot({path:path.join(out,n+'.png')});};
async function hub(s){await p.click('[data-tab=history]');await p.frameLocator('iframe').locator(`[data-action="${s}"]`).click();await p.locator('.p08-app').waitFor();}
async function audit(name){const m=await p.locator('.p08-app').evaluate(e=>({overflow:e.scrollWidth>e.clientWidth+1,bad:[...e.querySelectorAll('strong,b,time,small,button')].filter(n=>n.clientWidth&&n.scrollWidth>n.clientWidth+2&&getComputedStyle(n).overflowX==='visible').map(n=>({text:n.textContent.slice(0,100),width:n.clientWidth,scroll:n.scrollWidth})),focus:document.activeElement.outerHTML.slice(0,160)}));observations.push({name,...m});await shot(name);}
try{await p.clock.setFixedTime(new Date('2026-09-29T05:00:00Z'));await p.goto('http://127.0.0.1:8766/flows/auth-session/');await p.fill('#username','minhanh');await p.fill('#password','preview');await p.click('#submit');await p.click('#start');
for(const scene of ['history-general','history-daily','documents','nfc','warranty','sessions']){
 await hub(scene);await audit(scene+'-list');
 if(scene==='history-daily')continue;
 await (scene==='sessions'?p.locator('[data-p08-record="PQ-0002"]'):p.locator('.p08-row').first()).click();await audit(scene+'-detail');
 if(scene==='sessions'){
  await p.locator('.p08-scroll').evaluate(e=>e.scrollTop=250);const before=await p.locator('[data-p08=codes]').boundingBox();await p.locator('[data-p08=codes]').click();const after=await p.locator('[data-p08=codes]').boundingBox();observations.push({name:'session-expand-anchor',before,after});await audit('session-expanded');
 }else{await p.click('[data-p08-tab=timeline]');await audit(scene+'-timeline');}
}
await hub('warranty');for(const id of ['BH-003','BH-005']){await p.fill('#p08-search',id);await p.locator('.p08-row').first().click();observations.push({name:id,status:await p.locator('.p08-detail-status').getAttribute('class')});await audit(id+'-status');await p.click('[data-p08=back]');}
await hub('history-general');await p.locator('[data-p08=filter]').first().click();await p.click('[data-quick-range="90"]');await p.fill('[name=from]','29/09/2026');await p.fill('[name=to]','01/07/2026');await shot('filter-errors');
await p.click('[data-quick-range="90"]');await p.click('[data-calendar=to]');await p.click('[data-date="2026-09-29"]');await shot('calendar-return');
await p.keyboard.press('Escape');await p.waitForFunction(()=>!history.state?.hnP08Picker);
await p.locator('.p08-row').first().click();await p.click('[data-p08-tab=timeline]');await p.click('[data-p08=session]');await p.click('[data-p08=back]');observations.push({name:'nested-back-tab',tab:await p.locator('[data-p08-tab][aria-selected=true]').getAttribute('data-p08-tab')});
fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify({observations,errors},null,2));console.log(JSON.stringify(observations.filter(o=>o.bad?.length||o.name.includes('anchor')||o.status||o.tab),null,2));
}finally{await b.close();}})();
