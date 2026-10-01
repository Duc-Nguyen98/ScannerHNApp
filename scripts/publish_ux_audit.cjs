// Explicit delta publication through an isolated index. Never resets the user's checkout.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),store=process.env.SCANNER_ARCHIVE_STORE||'D:/ScannerHNApp_Archive_20261001';
const audit='handoff/ux-audit-2026-10-01',read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const repo=path.join(store,'repository.git'),index=path.join(store,'staging/ux-audit.index');
const env={...process.env,GIT_DIR:repo,GIT_WORK_TREE:root,GIT_INDEX_FILE:index,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never'};
const git=(args,input)=>execFileSync('git',['-c','credential.username=Duc-Nguyen98','-c','core.autocrlf=false','-c','core.whitespace=blank-at-eol,blank-at-eof,space-before-tab,cr-at-eol','-c','gc.auto=0','-c','maintenance.auto=false','-c','user.name=Duc-Nguyen98','-c','user.email=52225998+Duc-Nguyen98@users.noreply.github.com',...args],{cwd:root,env,input,encoding:'utf8',maxBuffer:50e6}).trim();
assert.ok(process.argv.includes('--push'),'Use --push only after reviewing this explicit file scope');
for(const [file,count]of [[audit+'/after-r02/results.json',13],[audit+'/panels-after/results.json',91],...['auto','os-reduced','off'].map(m=>['handoff/FINAL/evidence/ux-20261001-journeys-'+m+'/results.json',12])]){const data=read(file);assert.equal(data.checks.length,count);assert.ok(data.checks.every(c=>c.status==='PASS'),file);}
assert.equal(read(audit+'/flow-viewer-after/results.json').status,'PASS');
const boards=read('handoff/flow/evidence/ux-audit-20261001/regression-runs.json');
assert.equal(boards.length,24);assert.ok(boards.filter(r=>r.board!=='P03').every(r=>r.exit_code===0));assert.equal(read('handoff/flow/evidence/ux-audit-20261001-p03-r03/regression-runs.json')[0].exit_code,0);
const remote=git(['remote','get-url','origin']);assert.match(remote,/github\.com[/:]Duc-Nguyen98\/ScannerHNApp(?:\.git)?$/i);
const parent=git(['ls-remote','origin','refs/heads/main']).split(/\s/)[0];git(['fetch','origin','main']);assert.equal(git(['rev-parse','FETCH_HEAD']),parent);
const files=new Set(['RUN_STATE.json','docs/review/index.html','docs/review/review.css','docs/review/review.mjs','docs/review/flow-viewer.mjs','docs/review/catalog.json','handoff/FINAL/BUILD_MANIFEST.json','scripts/check_ux_review.cjs','scripts/audit_ux_panels.cjs','scripts/check_dialogs.cjs','scripts/check_review_flows.cjs','scripts/build_ux_evidence_index.cjs','scripts/publish_ux_audit.cjs']);
function collect(dir){for(const e of fs.readdirSync(path.join(root,dir),{recursive:true,withFileTypes:true}).filter(e=>e.isFile()))files.add(path.relative(root,path.join(e.parentPath,e.name)).replaceAll('\\','/'));}
collect(audit);
files.add('scripts/finalize_ux_audit.cjs');
for(const [dir,prefix]of [['handoff/FINAL/evidence','ux-20261001'],['handoff/flow/evidence','ux-audit-20261001']])for(const e of fs.readdirSync(path.join(root,dir),{withFileTypes:true}))if(e.isDirectory()&&e.name.startsWith(prefix))collect(dir+'/'+e.name);
files.delete(audit+'/DELTA_MANIFEST.json');
const manifest=[...files].sort().map(file=>{const bytes=fs.readFileSync(path.join(root,file));assert.ok(bytes.length<100*1024*1024,file+' exceeds ordinary Git file limit');return {file,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};});
fs.writeFileSync(path.join(root,audit,'DELTA_MANIFEST.json'),JSON.stringify({parent,build:read('docs/review/catalog.json').build,files:manifest},null,2));files.add(audit+'/DELTA_MANIFEST.json');
git(['read-tree',parent]);const list=path.join(store,'staging/ux-audit-paths.nul');fs.writeFileSync(list,[...files].map(f=>':(literal)'+f).join('\0')+'\0');git(['add','--pathspec-from-file='+list,'--pathspec-file-nul']);
git(['diff','--cached','--check',parent,'--','docs/review','scripts','RUN_STATE.json',audit+'/REPORT.md']);
const tree=git(['write-tree']);
for(const locked of ['docs/index.html','docs/flows','docs/review/runtime','docs/review/flows','design'])assert.equal(git(['rev-parse',tree+':'+locked]),git(['rev-parse',parent+':'+locked]),'Locked source changed: '+locked);
const sha=git(['commit-tree',tree,'-p',parent],process.argv.includes('--evidence')?'Record public UX audit verification and all intermediate evidence\n':'Fix review context, draft preservation, mobile focus and diagram recovery\n');
assert.equal(git(['ls-remote','origin','refs/heads/main']).split(/\s/)[0],parent,'Remote advanced; stop without force pushing');
git(['push','origin',sha+':refs/heads/main']);git(['update-ref','refs/heads/main',sha]);
const result={sha,parent,tree,reviewTree:git(['rev-parse',sha+':docs/review']),build:read('docs/review/catalog.json').build,files:files.size,rawBytes:manifest.reduce((n,f)=>n+f.bytes,0),pushedAt:new Date().toISOString()};
fs.writeFileSync(path.join(store,'staging',process.argv.includes('--evidence')?'ux-public-push.json':'ux-code-push.json'),JSON.stringify(result,null,2));console.log(result);
