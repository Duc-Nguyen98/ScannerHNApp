// Preserve earlier revision evidence; adapt route assertions only for the new P21 dependency.
const fs=require('node:fs');const file=process.argv[2];
if(!['check_p19.cjs','check_p20.cjs','check_p20_edges.cjs','check_warranty_navigation.cjs','check_home_footer_locked.cjs','check_dialogs.cjs'].includes(file))throw Error('Unsupported regression script');
process.env.HOME_FOOTER_EVIDENCE_DIR='handoff/P21/evidence/revision-01/footer';
process.env.WARRANTY_NAVIGATION_EVIDENCE_DIR='handoff/P21/evidence/revision-01/p09-regression';
let source=fs.readFileSync('scripts/'+file,'utf8').replaceAll('handoff/P19/evidence/revision-01/after','handoff/P21/evidence/revision-01/p19-regression').replaceAll('handoff/P20/evidence/revision-01','handoff/P21/evidence/revision-01/p20-regression').replaceAll("p.locator('.p19-tools')","p.locator('.p19-tools:not(.p21-tools)')");
if(file==='check_p20_edges.cjs')source=source.replace("await a('issue').click();const resumed=","await a('issue').click();await p.waitForSelector('[data-p21=scan]:not(:disabled)');await p.click('[data-p21=scan]');await p.waitForSelector('[data-panel=\"P19.S01\"]');const resumed=");
new Function('require','process',source)(require,process);
