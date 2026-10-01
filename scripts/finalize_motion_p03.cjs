const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root='handoff/motion',out=root+'/M03/evidence',read=f=>JSON.parse(fs.readFileSync(f,'utf8')),write=(f,v)=>fs.writeFileSync(f,JSON.stringify(v,null,2)+'\n'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const results=read(out+'/results.json'),summary=read(out+'/summary.json');
assert.equal(results.length,3);for(const r of results){assert.equal(r.checks.length,12);assert.equal(r.panels.length,4);assert.deepEqual(r.errors,[]);assert.deepEqual(r.operations,{discard:1,save:1});}
assert.ok(summary.pixel_comparisons.every(x=>x.changed_pixels===0));
for(const f of read(out+'/after-source.json'))assert.equal(sha(fs.readFileSync(f.file)),f.sha256,f.file+' changed since verification');
const before=read(out+'/before-source.json');for(const f of ['docs/flows/scanner-dialogs/style.css','docs/flows/shared/motion/motion-tokens.css'])assert.equal(sha(fs.readFileSync(f)),before.find(x=>x.file===f).sha256);
assert.equal(read('handoff/flow/FLOW_GATE.json').gate_status,'PASS');
assert.equal(read(out+'/flow-regression/results.json').checks.length,2);
assert.equal(read(out+'/long-dialog/results.json').checks.length,2);
const shell=read(out+'/shell-regression/results.json');assert.equal(shell.length,3);for(const r of shell){assert.equal(r.checks.length,12);assert.deepEqual(r.errors,[]);}
const list=dir=>fs.readdirSync(dir,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>path.join(e.parentPath,e.name).replaceAll('\\','/')).sort();
const files=list('docs/flows').map(file=>({file,sha256:sha(fs.readFileSync(file)),bytes:fs.statSync(file).size}));
const source_commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),diffFiles=[...list('docs/flows'),...list('scripts'),...list('tests')].sort().map(file=>({path:file,sha256:sha(fs.readFileSync(file)),bytes:fs.statSync(file).size}));
const appSourceHash=sha(JSON.stringify(files)),working_diff_hash=sha(JSON.stringify({source_commit,files:diffFiles}));
write(out+'/source-manifest.json',{source_commit,appSourceHash,working_diff_hash,hash_definition:'Sorted docs/flows file/sha256/bytes; diff hashes sorted docs/flows/scripts/tests including untracked, excluding handoff',files,diffFiles});
const coverage=root+'/MOTION_COVERAGE.csv';let csv=fs.readFileSync(coverage,'utf8');assert.equal(csv.split('\n').filter(l=>/^"MOTION_P\d+"/.test(l)).length,91);
const ids=['P03.S01','P03.S02','P03.S03','P03.S04'];
for(const id of ids){const prefix=`"MOTION_P03","${id}"`;assert.equal(csv.split('\n').filter(l=>l.startsWith(prefix)).length,1);csv=csv.replace(new RegExp('^'+prefix.replaceAll('.','\\.')+'[^\\r\\n]*','m'),`${prefix},"PASS","PASS","PASS","PASS","APPLIED","handoff/motion/M03/REPORT.md;handoff/motion/M03/evidence/results.json;handoff/motion/M03/evidence/summary.json",""`);}
fs.writeFileSync(coverage,csv);
const state=read(root+'/MOTION_RUN_STATE.json');state.verification_history??={};state.verification_history.M02??=state.verification;
state.current_prompt='MOTION_P03';state.status='PASS_SCOPED_UI_FIXTURE';state.appSourceHash=appSourceHash;state.working_diff_hash=working_diff_hash;
state.completed_panel_ids=[...new Set([...state.completed_panel_ids,...ids])];state.remaining_panel_ids=state.remaining_panel_ids.filter(p=>!ids.includes(p));
state.verification={focused_tests:49,browser_groups:36,shell_regression_groups:36,feedback_cases:7,long_dialog_groups:2,flow_journeys:2,footer_viewports:4,visual:'STATIC_ACTUAL_PRESERVED_MOTION_USER_REVIEW_PENDING',fps:'NOT_MEASURED',report:'handoff/motion/M03/REPORT.md'};
state.affected_dependencies=['M00 shared motion optional backdrop/fadeOnly; M01/M02 defaults preserved and regression verified','P03 modal/sheet owner, Home motion mode and security cancellation','Shared app-modal/P03 counted page lock; layered focus/keyboard ownership','Stock-owner P04/P05, legacy resume boundary and P14 direct journeys J08/J12'];
state.artifact_paths=[...new Set([...state.artifact_paths,'handoff/motion/M03/REPORT.md',out+'/results.json',out+'/source-manifest.json'])];
state.next_action='User review M03. Do not implement another motion board until requested; preserve business integration and footerLOCK.';
write(root+'/MOTION_RUN_STATE.json',state);
console.log(JSON.stringify({appSourceHash,working_diff_hash,panels:4,modes:3,browser_groups:36,node_tests:49,remaining:state.remaining_panel_ids.length}));
