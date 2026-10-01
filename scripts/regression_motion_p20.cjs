const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const file=process.argv[2],localRequire=createRequire(path.resolve('scripts',file));
process.env.HOME_FOOTER_EVIDENCE_DIR='handoff/motion/M20/regression/footer';
process.env.WARRANTY_NAVIGATION_EVIDENCE_DIR='handoff/motion/M20/regression/p09';
let source=fs.readFileSync('scripts/'+file,'utf8').replaceAll('handoff/P19/evidence/revision-01','handoff/motion/M20/regression/p19').replaceAll('handoff/P20/evidence/revision-01','handoff/motion/M20/regression/p20').replaceAll('handoff/P20/evidence/revision-02','handoff/motion/M20/regression/p20-r02').replaceAll('handoff/P24/evidence/revision-01','handoff/motion/M20/regression/p24');
if(file==='check_p20.cjs')source=source.replace("p.locator('.p20-footer').innerText()","p.locator('.p20-app').innerText()");
// Current P21 owns pending resume; older P20 suites predate this FLOW_GATE edge.
if(['check_p20_edges.cjs','check_p20_r02_ux.cjs'].includes(file))source=source.replaceAll("await p.click('[data-p19=review]');","if(await p.locator('.p21-app').count())await p.locator('[data-p21=review]:not(:disabled)').click();else await p.click('[data-p19=review]');").replaceAll("await p.waitForSelector('[data-p19=reconcile]');","await p.waitForSelector('[data-p19=reconcile], [data-p21=check]');");
new Function('require','process',source)(localRequire,process);
