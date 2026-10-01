// Preserve earlier revision evidence; adjust only selectors for focusable aria-disabled reload.
const fs=require('node:fs'),name=process.argv[2];
const adapt=code=>code.replaceAll('handoff/P23/evidence/revision-02','handoff/P23/evidence/revision-03').replaceAll('[data-p23=reload]:disabled','[data-p23=reload][aria-disabled=true]').replaceAll('[data-p23=reload]:not(:disabled)','[data-p23=reload]:not([aria-disabled=true])').replace("['warranty-session-experience',","['warranty-session-r03','warranty-session-experience',");
const localRequire=n=>n==='node:fs'?{...fs,readFileSync:(file,...args)=>{const data=fs.readFileSync(file,...args);return String(file).startsWith('scripts/')&&typeof data==='string'?adapt(data):data;}}:require(n);
let code;
if(name==='capture'){code=adapt(fs.readFileSync('scripts/capture_p23_r02.cjs','utf8'));process.argv[2]=process.argv[3]||'after';}
else if(name==='check_p23_r02.cjs')code=adapt(fs.readFileSync('scripts/'+name,'utf8'));
else code=adapt(fs.readFileSync('scripts/run_p23_r02.cjs','utf8'));
new Function('require','process',code)(localRequire,process);
