// Read recorded browser evidence; no browser automation or domain writes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
process.chdir(path.resolve(__dirname,'..'));
const dir='handoff/motion/M01/evidence',read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const proof=read(dir+'/modes-and-states.json'),geometry=read(dir+'/geometry.json'),life=read(dir+'/lifecycle.json'),trace=read(dir+'/submit-actual-frame-trace.json');
assert.equal(proof.motionResults.length,3);assert.equal(proof.stateResults.length,21);assert.equal(geometry.length,18);
for(const r of proof.motionResults){
  assert.deepEqual(r.end.counts,{authenticate:1,startShift:1,logout:0});
  assert.ok(r.eye.same&&r.eye.valueOK&&r.pending.same&&r.pending.valueOK&&r.pending.readOnly&&r.pending.submitDisabled);
  assert.equal(r.pending.focus,'password');assert.equal(r.pending.start,1);assert.equal(r.pending.end,4);assert.equal(r.eye.animations,0);
  assert.equal(r.end.authAnimations,0);assert.equal(r.end.authModeRemoved,true);
  assert.deepEqual(r.pending.animations,r.mode==='auto'?[140]:r.mode==='os-reduced'?[80]:[]);
  assert.ok(r.end.trace.every(a=>a.frames.every(f=>!('transform' in f))));
}
for(const r of proof.stateResults){const base=proof.stateResults.find(b=>b.mode==='auto'&&b.scenario===r.scenario);assert.deepEqual({...r,mode:''},{...base,mode:''});assert.equal(r.homeVisible,false);}
for(const r of geometry){assert.equal(r.overflow,false);const base=geometry.find(b=>b.mode==='auto'&&b.panel===r.panel&&b.viewport.join()===r.viewport.join());for(const k of ['card','cta','screen','nodes'])assert.deepEqual(r[k],base[k]);}
for(const r of life.filter(r=>r.case==='logout cancel then confirm'))assert.deepEqual(r.counts,{authenticate:1,startShift:0,logout:1});
assert.equal(life[0].before,1);assert.equal(life[0].after,0);assert.equal(life[2].panel,'P01.S01');assert.equal(life[2].animations,0);assert.equal(life[3].animations,0);
assert.ok(trace.samples.length>2);assert.equal(Number(trace.samples[0].opacity),.65);assert.equal(Number(trace.samples.at(-1).opacity),1);
for(const s of trace.samples){assert.deepEqual(s.bounds,trace.samples[0].bounds);assert.equal(s.focus,'password');assert.equal(s.busy,'true');}
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const gate=read('handoff/flow/FLOW_GATE.json');assert.equal(gate.gate_status,'PASS');
const baseline=read('handoff/motion/M00/before-evidence/flow-repaired-guard-final/baseline.json');
const referenceOriginDeltas=[];
for(const r of geometry.filter(r=>r.viewport[0]===494)){const b=baseline.rows.find(b=>b.id===(r.panel==='P01.S01'?'P01-login':'P01-confirmation')&&b.mode==='normal');assert.equal(r.nodes+1,b.screenDomNodes);for(const k of ['width','height'])assert.equal(r.screen[k],b.screen[k]);referenceOriginDeltas.push({panel:r.panel,mode:r.mode,x:r.screen.x-b.screen.x,y:r.screen.y-b.screen.y});}
const pre=read('handoff/flow/SOURCE_MANIFEST.json'),allowed=new Set(['docs/flows/auth-session/app.mjs','docs/flows/auth-session/index.html','docs/flows/auth-session/bootstrap.mjs']);
const changed=pre.files.filter(f=>f.path.startsWith('docs/flows/')&&sha(fs.readFileSync(f.path))!==f.sha256).map(f=>f.path);assert.ok(changed.every(p=>allowed.has(p)),JSON.stringify(changed));
const motionFiles=['docs/flows/auth-session/motion.mjs','docs/flows/auth-session/motion.css','docs/flows/shared/motion/motion-primitives.mjs','docs/flows/shared/motion/motion-tokens.css'];
const appFiles=fs.readdirSync('docs/flows',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>path.join(e.parentPath,e.name).replaceAll('\\','/')).sort().map(file=>({file,sha256:sha(fs.readFileSync(file)),bytes:fs.statSync(file).size}));
const result={status:'PASS_SCOPED_UI_FIXTURE',panels:['P01.S01','P01.S02'],modes:3,stateCases:21,layoutCases:18,lifecycleCases:life.length,frameSamples:trace.samples.length,baselineAppSourceHash:gate.appSourceHash,appSourceHash:sha(JSON.stringify(appFiles)),changedExistingAppFiles:changed,newAppMotionBytes:motionFiles.reduce((n,p)=>n+fs.statSync(p).size,0),motionFiles:motionFiles.map(p=>({path:p,bytes:fs.statSync(p).size,sha256:sha(fs.readFileSync(p))})),staticGeometryAcrossModes:'IDENTICAL',referenceScreenSizeAndNodeCounts:'MATCH_M00',referenceOriginDeltas,pixelAcceptance:'NOT_CLAIMED_DIFFERENT_CAPTURE_PIPELINE',fps:'NOT_MEASURED',hardware:'NOT_RUN'};
fs.writeFileSync(dir+'/verification.json',JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(dir+'/source-manifest.json',JSON.stringify({source_commit:gate.source_commit,files:appFiles},null,2)+'\n');
console.log(JSON.stringify(result,null,2));
