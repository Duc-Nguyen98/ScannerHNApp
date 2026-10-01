const fs=require('node:fs'),path=require('node:path');
const out='handoff/P20/evidence/revision-02/before';
for(const f of ['docs/flows/warranty-components/history-view.mjs','docs/flows/warranty-components/history-model.mjs','docs/flows/warranty-components/history.css','docs/flows/home/home.mjs','RUN_STATE.json','SCREEN_COVERAGE.csv']){const dest=path.join(out,'source',f);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(f,dest);}
const source=fs.readFileSync('scripts/check_p20.cjs','utf8').replaceAll('handoff/P20/evidence/revision-01/after',out+'/panels');new Function('require',source)(require);
