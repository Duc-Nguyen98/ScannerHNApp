// Run unchanged P19 browser suite with evidence redirected to this revision.
const fs=require('node:fs');
const source=fs.readFileSync('scripts/check_p19.cjs','utf8').replaceAll('handoff/P19/evidence/revision-01/after','handoff/P20/evidence/revision-01/p19-regression');
new Function('require',source)(require);
