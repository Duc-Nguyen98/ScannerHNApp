const fs=require('node:fs');const file=process.argv[2];if(!['check_p21.cjs','check_p21_edges.cjs','regression_p21.cjs','test_p21.cjs'].includes(file))throw Error('Unsupported');
let s=fs.readFileSync('scripts/'+file,'utf8').replaceAll('handoff/P21/evidence/revision-01','handoff/P21/evidence/revision-02/regression');
if(file==='test_p21.cjs')s=s.replace("const files=[","const files=['component-resume-experience.test.mjs',");
if(file==='regression_p21.cjs')process.argv[2]=process.argv[3];
// P21 confirmed live receipts now open P20 directly; isolated B21 still opens P19 result.
if(file==='check_p21.cjs')s=s.replace("await p.waitForSelector('[data-panel=\"P19.S04\"]');const after=await issue();assert.equal(after.metrics.post,before.metrics.post);assert.equal(after.receipt.requestId,before.request.id);", "await p.waitForSelector('.p20-receipt-fresh');const hs=JSON.parse(await p.locator('[data-p20-snapshot]').textContent());assert.equal(hs.items.find(r=>r.requestId===before.request.id).status,'POSTED');");
new Function('require','process',s)(require,process);
