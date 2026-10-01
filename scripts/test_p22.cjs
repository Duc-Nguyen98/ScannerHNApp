const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const files=['nfc-audit','home','home-recent','home-ux','history-picker','history-range','nfc','auth-session'].map(n=>'tests/'+n+'.test.mjs');
const result=spawnSync(process.execPath,['--test',...files],{encoding:'utf8'});
fs.mkdirSync('handoff/P22/evidence/revision-01/logic',{recursive:true});
fs.writeFileSync('handoff/P22/evidence/revision-01/logic/node-tests.txt',result.stdout+result.stderr);process.stdout.write(result.stdout);process.stderr.write(result.stderr);process.exitCode=result.status??1;
