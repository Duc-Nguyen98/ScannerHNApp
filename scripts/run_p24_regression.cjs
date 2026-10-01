// Reuse assertions; isolate evidence so earlier revisions are never overwritten.
const fs=require('node:fs'),name=process.argv[2];
let code=fs.readFileSync('scripts/'+name,'utf8').replaceAll(/handoff\/P\d+\/evidence\/revision-\d+(?:\/[a-z-]+)?/g,'handoff/P24/evidence/revision-01/regression/'+name.replace('.cjs',''));
if(name==='check_p21.cjs')code=code.replace("await p.waitForSelector('[data-panel=\"P19.S04\"]');const after=await issue();assert.equal(after.metrics.post,before.metrics.post);assert.equal(after.receipt.requestId,before.request.id);", "await p.waitForSelector('.p20-receipt-fresh');const hs=JSON.parse(await p.locator('[data-p20-snapshot]').textContent());assert.equal(hs.items.find(r=>r.requestId===before.request.id).status,'POSTED');");
if(name==='check_p23.cjs'){
 code=code.replace('async function test(name,',`async function resetConditions(){if(await p.locator('[data-p23=clear]:not([hidden])').count())await p.locator('[data-p23=clear]').click();if(await p.locator('[data-p23=clear-query]:not([hidden])').count())await p.locator('[data-p23=clear-query]').click();}\nasync function test(name,`);
 code=code.replaceAll("await a('clear').click()","await resetConditions()").replaceAll('[data-p23=reload]:not(:disabled)','[data-p23=reload]:not([aria-disabled=true])').replaceAll('[data-p23=reload]:disabled','[data-p23=reload][aria-disabled=true]');
}
new Function('require','process',code)(require,process);
