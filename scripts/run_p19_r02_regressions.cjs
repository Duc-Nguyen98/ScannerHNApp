const fs=require('node:fs');
const file=process.argv[2];
const source=fs.readFileSync(file,'utf8').replaceAll('handoff/P19/evidence/revision-01','handoff/P19/evidence/revision-02');
new Function('require',source)(require);
