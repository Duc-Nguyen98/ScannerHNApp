const fs=require('node:fs');
const source=fs.readFileSync(process.argv[2],'utf8')
 .replaceAll('handoff/P19/evidence/revision-01','handoff/P19/evidence/revision-03')
 .replaceAll('handoff/P19/evidence/revision-02','handoff/P19/evidence/revision-03')
 .replaceAll('handoff/P18/evidence/revision-03/logout','handoff/P19/evidence/revision-03/p18-logout');
new Function('require',source)(require);
