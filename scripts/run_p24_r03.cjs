// Reuse r02 assertions/adaptations, storing every output under r03.
const fs=require('node:fs'),name=process.argv[2];
const adapt=s=>s.replaceAll('handoff/P24/evidence/revision-02','handoff/P24/evidence/revision-03/regression');
const reader=n=>n==='node:fs'?{...fs,readFileSync:(file,...args)=>{const data=fs.readFileSync(file,...args);return typeof data==='string'&&String(file).startsWith('scripts/')?adapt(data):data;}}:require(n);
if(name==='check_p24_r02.cjs'){process.argv[2]='after';new Function('require','process',adapt(fs.readFileSync('scripts/'+name,'utf8')))(reader,process);}
else new Function('require','process',adapt(fs.readFileSync('scripts/run_p24_r02.cjs','utf8')))(reader,process);
