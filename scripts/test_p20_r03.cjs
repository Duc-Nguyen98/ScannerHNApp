const {spawnSync}=require('node:child_process'),fs=require('node:fs');
const phase=process.argv[2]||'after',out='handoff/P20/evidence/revision-03/'+phase;
const files=phase==='before'?['component-history-r03.test.mjs']:['component-history-r03.test.mjs','component-history-experience.test.mjs','component-history.test.mjs','component-issue.test.mjs','component-issue-experience.test.mjs','component-issue-r03.test.mjs','warranty.test.mjs','warranty-stability.test.mjs','home.test.mjs','warranty-component-history.test.cjs'];
const r=spawnSync(process.execPath,['--test',...files.map(f=>'tests/'+f)],{encoding:'utf8'});fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/node-tests.txt',r.stdout+r.stderr);process.stdout.write(r.stdout+r.stderr);process.exitCode=r.status;
