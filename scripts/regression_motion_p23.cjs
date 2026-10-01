const fs=require('node:fs'),name=process.argv[2],base='handoff/motion/M23/regression';
const adapt=code=>code.replace("p.locator('.p20-footer').innerText()","p.locator('.p20-app').innerText()").replaceAll('handoff/P23/evidence/revision-03',base).replaceAll('handoff/P23/evidence/revision-02',base).replaceAll('handoff/P23/evidence/revision-01',base).replaceAll('handoff/motion/M02/evidence',base+'/shell').replaceAll('[data-p23=reload]:disabled','[data-p23=reload][aria-disabled=true]').replaceAll('[data-p23=reload]:not(:disabled)','[data-p23=reload]:not([aria-disabled=true])').replace("['warranty-session-r03',","['motion-p23','warranty-session-r03',");
const localRequire=n=>n==='node:fs'?{...fs,readFileSync:(file,...args)=>{const r=fs.readFileSync(file,...args);return String(file).startsWith('scripts/')&&typeof r==='string'?adapt(r):r;}}:require(n);
let code;
if(name==='check_motion_p02.cjs'){fs.mkdirSync(base+'/shell',{recursive:true});fs.copyFileSync('handoff/motion/M02/evidence/before.json',base+'/shell/before.json');code=adapt(fs.readFileSync('scripts/'+name,'utf8'));}
else if(['audit_p23_r03.cjs','check_p23_r03_guards.cjs'].includes(name)){process.argv[2]='after';code=adapt(fs.readFileSync('scripts/'+name,'utf8'));}
else code=adapt(fs.readFileSync('scripts/run_p23_r03.cjs','utf8'));
new Function('require','process','__dirname',code)(localRequire,process,require('node:path').resolve('scripts'));
