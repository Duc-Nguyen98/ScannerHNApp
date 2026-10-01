// Exact-byte, additive archive. Uses a separate bare repository/index; never resets the working copy.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync,spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),store=process.env.SCANNER_ARCHIVE_STORE||'D:/ScannerHNApp_Archive_20261001';
const repo=path.join(store,'repository.git'),staging=path.join(store,'staging');fs.mkdirSync(staging,{recursive:true});
const env={...process.env,GIT_DIR:repo,GIT_WORK_TREE:root,GIT_INDEX_FILE:path.join(staging,'archive.index'),GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never'};
const options=['-c','credential.username=Duc-Nguyen98','-c','core.autocrlf=false','-c','core.safecrlf=false','-c','user.name=Duc-Nguyen98','-c','user.email=52225998+Duc-Nguyen98@users.noreply.github.com','-c','pack.threads=2','-c','pack.window=0'];
const git=(args,input)=>execFileSync('git',[...options,...args],{cwd:root,env,input,encoding:'utf8',maxBuffer:100e6}).trim();
const localGit=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:100e6}).trim();
const stateFile=path.join(staging,'archive-state.json');
const write=x=>fs.writeFileSync(stateFile,JSON.stringify(x,null,2)+'\n');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const secretPatterns=[/gh[pousr]_[A-Za-z0-9]{36,}/,/github_pat_[A-Za-z0-9_]{60,}/,/sk-proj-[A-Za-z0-9_-]{40,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/AKIA[A-Z0-9]{16}/];
async function runGit(args,log){
 const file=fs.createWriteStream(log);const child=spawn('git',[...options,...args],{cwd:root,env,windowsHide:true});child.stdout.pipe(file);child.stderr.pipe(file);
 const exit=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve);});await new Promise(resolve=>file.end(resolve));if(exit!==0)throw Error('git failed: '+args.join(' ')+'; inspect '+log);
}
function inventory(){
 const files=localGit(['ls-files','--cached','--others','--exclude-standard','-z']).split('\0').filter(Boolean).filter(f=>fs.existsSync(path.join(root,f))&&!/(^|\/)(node_modules|__pycache__|\.git)(\/|$)/.test(f));
 const result=[],alerts=[];
 for(const f of files){const absolute=path.resolve(root,f);assert.ok(absolute.startsWith(root+path.sep));const stat=fs.lstatSync(absolute);if(!stat.isFile())throw Error('Unexpected non-file '+f);if(stat.size>=100*1024*1024)throw Error('File requires separate handling (>100 MiB): '+f);const bytes=fs.readFileSync(absolute);
  if(/\.(md|txt|log|json|csv|html|mjs|cjs|js|py|css|mmd|ya?ml)$/.test(f)&&secretPatterns.some(re=>re.test(bytes.toString('utf8'))))alerts.push(f);
  result.push({path:f,bytes:bytes.length,sha256:hash(bytes)});
 }
 if(alerts.length){fs.writeFileSync(path.join(staging,'secret-alerts.json'),JSON.stringify(alerts,null,2));throw Error('Potential secrets require review; no token values printed. '+alerts.length+' files');}
 return result.sort((a,b)=>a.path.localeCompare(b.path));
}
(async()=>{
 const command=process.argv[2]||'plan';
 if(command==='plan'){
  if(fs.existsSync(stateFile)&&JSON.parse(fs.readFileSync(stateFile)).commits.length)throw Error('Existing archive has commits; resume or create a new archive store');
  const files=inventory(),batches=[];let batch=[],bytes=0;
  // Source/UI first; immutable evidence follows. Every existing artifact remains included.
  const ordered=[...files.filter(f=>!f.path.startsWith('handoff/')),...files.filter(f=>f.path.startsWith('handoff/'))];
  for(const f of ordered){if(batch.length&&bytes+f.bytes>320*1024*1024){batches.push({files:batch,bytes});batch=[];bytes=0;}batch.push(f);bytes+=f.bytes;}if(batch.length)batches.push({files:batch,bytes});
  const state={createdAt:new Date().toISOString(),root,repo,branch:'archive/full-workspace-20261001',base:localGit(['rev-parse','origin/main']),files:files.length,bytes:files.reduce((s,f)=>s+f.bytes,0),batches,commits:[],status:'PLANNED'};write(state);
  fs.writeFileSync(path.join(staging,'file-manifest.json'),JSON.stringify(files,null,2));console.log(JSON.stringify({status:state.status,files:state.files,bytes:state.bytes,batches:batches.length,branch:state.branch}));return;
 }
 const state=JSON.parse(fs.readFileSync(stateFile,'utf8'));assert.equal(state.root,root);
 if(command==='push'){
  assert.ok(fs.existsSync(path.join(staging,'trace-secret-scan.json')),'Run trace secret scan first');assert.equal(JSON.parse(fs.readFileSync(path.join(staging,'trace-secret-scan.json'))).alerts.length,0);
  if(!state.commits.length){git(['read-tree',state.base]);state.status='PUSHING';write(state);}
  for(let i=state.commits.length;i<state.batches.length;i++){
   const batch=state.batches[i];for(const f of batch.files)assert.equal(hash(fs.readFileSync(path.join(root,f.path))),f.sha256,'Source changed after snapshot: '+f.path);
   const list=path.join(staging,'batch-paths.nul');fs.writeFileSync(list,batch.files.map(f=>':(literal)'+f.path).join('\0')+'\0');
   console.log('Staging batch '+(i+1)+'/'+state.batches.length+' '+Math.round(batch.bytes/1024/1024)+' MiB, '+batch.files.length+' files');
   await runGit(['add','--pathspec-from-file='+list,'--pathspec-file-nul'],path.join(staging,'add-'+(i+1)+'.log'));
   const tree=git(['write-tree']),parent=state.commits.at(-1)?.sha||state.base;
   const commit=git(['commit-tree',tree,'-p',parent],`Archive ScannerHNApp complete workspace (${i+1}/${state.batches.length})\n\nPreserve exact source, design, screenshots, motion evidence, traces and logs.\nUser explicitly requested all intermediate trace/log artifacts.\n`);
   git(['update-ref','refs/heads/'+state.branch,commit]);
   await runGit(['push','origin',commit+':refs/heads/'+state.branch],path.join(staging,'push-'+(i+1)+'.log'));
   state.commits.push({batch:i+1,sha:commit,tree,files:batch.files.length,bytes:batch.bytes,pushedAt:new Date().toISOString()});write(state);console.log('PUSHED '+(i+1)+' '+commit);
  }
  state.status='ARCHIVE_PUSHED';write(state);console.log(JSON.stringify({status:state.status,sha:state.commits.at(-1).sha,files:state.files,bytes:state.bytes}));return;
 }
 if(command==='verify'){
  const tip=state.commits.at(-1)?.sha;assert.ok(tip);const entries=git(['ls-tree','-r','-z',tip]).split('\0').filter(Boolean),tree=new Map(entries.map(e=>{const [meta,file]=e.split('\t');return [file,meta.split(' ')[2]];}));let verified=0;
  for(const batch of state.batches)for(const f of batch.files){const bytes=fs.readFileSync(path.join(root,f.path));assert.equal(hash(bytes),f.sha256,'Changed source '+f.path);const sha=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');assert.equal(tree.get(f.path),sha,'Git blob mismatch '+f.path);verified++;}
  const remote=git(['ls-remote','origin','refs/heads/'+state.branch]).split(/\s/)[0];assert.equal(remote,tip);
  state.verifiedAt=new Date().toISOString();state.verifiedFiles=verified;state.status='VERIFIED';write(state);console.log(JSON.stringify({status:state.status,sha:tip,verifiedFiles:verified,bytes:state.bytes}));return;
 }
 throw Error('Use plan, push or verify');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
