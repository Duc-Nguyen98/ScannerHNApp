// Re-run existing dependency checks into P23 evidence; never overwrite prior reviews.
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const name=process.argv[2],base='handoff/P23/evidence/revision-01/regression';
fs.mkdirSync(base,{recursive:true});
if(name==='logic'){
 const tests=['warranty-session','warranty','warranty-dataset','component-history','component-history-r03','home','home-recent','home-ux','nfc-audit','nfc-audit-experience','history-picker','history-range','auth-session'];
 const r=spawnSync(process.execPath,['--test',...tests.map(n=>'tests/'+n+'.test.mjs')],{encoding:'utf8'});fs.writeFileSync(base+'/logic.txt',r.stdout+r.stderr);process.stdout.write(r.stdout);process.exitCode=r.status??1;
}else{
 if(!['check_p22.cjs','check_p20.cjs','check_warranty_navigation.cjs','check_home_footer_locked.cjs'].includes(name))throw Error('Unsupported regression');
 process.env.WARRANTY_NAVIGATION_EVIDENCE_DIR=base+'/p09';process.env.HOME_FOOTER_EVIDENCE_DIR=base+'/footer';
 let code=fs.readFileSync('scripts/'+name,'utf8').replaceAll('handoff/P22/evidence/revision-01',base+'/p22').replaceAll('handoff/P20/evidence/revision-01',base+'/p20');
 if(name==='check_p22.cjs'){
  code=code.replace('async function test(name,',`async function resetFilters(){while(await p.locator('[data-p22-remove]').count())await p.locator('[data-p22-remove]').first().click();if(await p.locator('.p22-query-clear:not([hidden])').count())await p.locator('.p22-query-clear').click();}\nasync function test(name,`);
  code=code.replaceAll("await a('clear').click()","await resetFilters()").replaceAll("await a('clear').count()","await p.locator('[data-p22-remove],.p22-query-clear:not([hidden])').count()");
 }
 new Function('require','process',code)(require,process);
}
