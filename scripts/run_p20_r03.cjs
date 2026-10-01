const fs=require('node:fs');
const file=process.argv[2];if(!file||!file.startsWith('scripts/'))throw Error('Expected scoped script path');
let source=fs.readFileSync(file,'utf8').replaceAll('handoff/P20/evidence/revision-01','handoff/P20/evidence/revision-03/regression').replaceAll('handoff/P20/evidence/revision-02','handoff/P20/evidence/revision-03/regression').replaceAll('handoff/P19/evidence/revision-01/after','handoff/P20/evidence/revision-03/p19-regression');
new Function('require',source)(require);
