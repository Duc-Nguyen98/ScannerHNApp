const fs=require('node:fs');const name=process.argv[2];
if(!['check_p22.cjs','check_p22_edges.cjs','test_p22.cjs'].includes(name))throw Error('Unsupported test');
let code=fs.readFileSync('scripts/'+name,'utf8').replaceAll('handoff/P22/evidence/revision-01','handoff/P22/evidence/revision-02/regression');
if(name==='test_p22.cjs')code=code.replace("['nfc-audit',","['nfc-audit-experience','nfc-audit',");
else{
code=code.replace("async function test(name,",`async function resetFilters(){while(await p.locator('[data-p22-remove]').count())await p.locator('[data-p22-remove]').first().click();if(await p.locator('.p22-query-clear:not([hidden])').count())await p.locator('.p22-query-clear').click();}\nasync function test(name,`);
code=code.replaceAll("await a('clear').click()","await resetFilters()").replaceAll("await a('clear').count()","await p.locator('[data-p22-remove],.p22-query-clear:not([hidden])').count()");
}
new Function('require','process',code)(require,process);
