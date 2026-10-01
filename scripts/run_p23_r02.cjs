const fs=require('node:fs');const name=process.argv[2];
if(['check_p23.cjs','check_p23_edges.cjs'].includes(name)){
 let code=fs.readFileSync('scripts/'+name,'utf8').replaceAll('handoff/P23/evidence/revision-01','handoff/P23/evidence/revision-02/regression');
 code=code.replace('async function test(name,',`async function resetConditions(){if(await p.locator('[data-p23=clear]:not([hidden])').count())await p.locator('[data-p23=clear]').click();if(await p.locator('[data-p23=clear-query]:not([hidden])').count())await p.locator('[data-p23=clear-query]').click();}\nasync function test(name,`);
 code=code.replaceAll("await a('clear').click()","await resetConditions()");
 new Function('require','process',code)(require,process);
}else{
 let code=fs.readFileSync('scripts/regression_p23.cjs','utf8').replaceAll('handoff/P23/evidence/revision-01','handoff/P23/evidence/revision-02').replace("['warranty-session',","['warranty-session-experience','warranty-session',");
 new Function('require','process',code)(require,process);
}
