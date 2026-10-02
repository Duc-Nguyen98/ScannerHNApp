const fs=require('node:fs'),name=process.argv[2];
if(name==='check_motion_p19.cjs'){
 const code=fs.readFileSync('scripts/'+name,'utf8').replaceAll('handoff/motion/M19/','handoff/motion/M24/dependencies/M19/').replaceAll('handoff/motion/M24/dependencies/M19/before/results.json','handoff/motion/M19/before/results.json');
 new Function('require','process',code)(require,process);
}else{
 const adapt=s=>s.replaceAll('handoff/P24/evidence/revision-03','handoff/motion/M24/regression');
 const reader=n=>n==='node:fs'?{...fs,readFileSync:(file,...args)=>{const data=fs.readFileSync(file,...args);return typeof data==='string'&&String(file).startsWith('scripts/')?adapt(data):data;}}:require(n);
 const code=fs.readFileSync('scripts/run_p24_r03.cjs','utf8');new Function('require','process',adapt(code))(reader,process);
}
