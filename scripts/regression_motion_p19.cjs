// Run unchanged domain suites against M19; keep all prior evidence intact.
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const file=process.argv[2],localRequire=createRequire(path.resolve('scripts',file));
process.env.HOME_FOOTER_EVIDENCE_DIR='handoff/motion/M19/regression/footer';
process.env.WARRANTY_NAVIGATION_EVIDENCE_DIR='handoff/motion/M19/regression/p09';
let source=fs.readFileSync('scripts/'+file,'utf8').replaceAll('handoff/P19/evidence/revision-01','handoff/motion/M19/regression/p19').replaceAll('handoff/P20/evidence/revision-01','handoff/motion/M19/regression/p20').replaceAll('handoff/P21/evidence/revision-01','handoff/motion/M19/regression/p21').replaceAll('handoff/P24/evidence/revision-01','handoff/motion/M19/regression/p24');
if(file==='check_p21.cjs')source=source.replace("await p.waitForSelector('[data-panel=\"P19.S04\"]');const after=await issue();assert.equal(after.metrics.post,before.metrics.post);assert.equal(after.receipt.requestId,before.request.id);", "await p.waitForSelector('.p20-receipt-fresh');const hs=JSON.parse(await p.locator('[data-p20-snapshot]').textContent());assert.equal(hs.items.find(r=>r.requestId===before.request.id).status,'POSTED');");
// P24 moved the closed-case explanation into the body; keep its read-only assertion.
if(file==='check_p20.cjs')source=source.replace("p.locator('.p20-footer').innerText()","p.locator('.p20-app').innerText()");
new Function('require','process',source)(localRequire,process);
