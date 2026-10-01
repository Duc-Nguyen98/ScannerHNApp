const fs=require('node:fs');const name=process.argv[2],base='handoff/motion/M22/regression';
if(!['check_p22.cjs','check_p22_edges.cjs','check_p22_r02.cjs','audit_p22_r03.cjs','check_p22_r03_edges.cjs','test_p22.cjs','check_home_footer_locked.cjs','check_motion_p02.cjs'].includes(name))throw Error('Unsupported test');
if(name==='check_home_footer_locked.cjs')process.env.HOME_FOOTER_EVIDENCE_DIR=base+'/footer';
if(name==='check_motion_p02.cjs'){fs.mkdirSync(base+'/shell',{recursive:true});fs.copyFileSync('handoff/motion/M02/evidence/before.json',base+'/shell/before.json');}
if(name==='audit_p22_r03.cjs')process.argv[2]='after';
let code=fs.readFileSync('scripts/'+name,'utf8').replaceAll('handoff/P22/evidence/revision-01',base+'/p22').replaceAll('handoff/P22/evidence/revision-02/ux',base+'/p22-r02').replaceAll('handoff/P22/evidence/revision-03',base+'/p22-r03').replaceAll('handoff/motion/M02/evidence',base+'/shell');
if(name==='test_p22.cjs')code=code.replace("['nfc-audit',","['motion-p22','motion-p02','nfc-audit-experience','nfc-audit',");
if(['check_p22.cjs','check_p22_edges.cjs'].includes(name)){
 code=code.replace('async function test(name,',`async function resetFilters(){while(await p.locator('[data-p22-remove]').count())await p.locator('[data-p22-remove]').first().click();if(await p.locator('.p22-query-clear:not([hidden])').count())await p.locator('.p22-query-clear').click();}\nasync function test(name,`);
 code=code.replaceAll("await a('clear').click()","await resetFilters()").replaceAll("await a('clear').count()","await p.locator('[data-p22-remove],.p22-query-clear:not([hidden])').count()");
}
// P23 was migrated to its native owner after the original P22 suite; retain the exact panel assertion.
if(name==='check_p22_edges.cjs')code=code.replace("'[data-screen-id=\"'+panel+'\"]'","'[data-screen-id=\"'+panel+'\"],[data-panel=\"'+panel+'\"]'");
new Function('require','process','__dirname',code)(require,process,require('node:path').resolve('scripts'));
