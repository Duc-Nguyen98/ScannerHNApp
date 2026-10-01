const fs=require('node:fs');
const file=process.argv[2];if(!file||!file.startsWith('scripts/'))throw Error('Expected scoped script path');
let source=fs.readFileSync(file,'utf8').replaceAll('handoff/P20/evidence/revision-01','handoff/P20/evidence/revision-02').replaceAll('handoff/P19/evidence/revision-01/after','handoff/P20/evidence/revision-02/p19-regression');
if(file.endsWith('test_p20_logic.cjs'))source=source.replace("const files=[","const files=['component-history-experience.test.mjs',");
new Function('require',source)(require);
