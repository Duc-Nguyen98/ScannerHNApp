const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
process.chdir(path.resolve(__dirname,'..'));
const known=new Set(execFileSync('git',['ls-tree','-r','HEAD'],{encoding:'utf8',maxBuffer:30e6}).split('\n').map(l=>l.split(/\s+/)[2]));
const files=fs.readdirSync('docs/review',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>path.join(e.parentPath,e.name).replaceAll('\\','/')).sort();
const binary=[],tree=[];
for(const file of files){const b=fs.readFileSync(file),sha=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),entry={path:file,mode:'100644',type:'blob'};
if(known.has(sha))tree.push({...entry,sha});
else if(/\.(html|mjs|js|css|json|txt|md)$/.test(file)){const content=b.toString('utf8');if(content.includes('\ufffd'))throw Error('Invalid UTF-8 '+file);tree.push({...entry,content});}
else{binary.push({file,sha,bytes:b.length});tree.push({...entry,sha});}}
fs.mkdirSync('handoff/FINAL/publish',{recursive:true});fs.writeFileSync('handoff/FINAL/publish/tree.json',JSON.stringify(tree));fs.writeFileSync('handoff/FINAL/publish/binary.json',JSON.stringify(binary));
console.log(JSON.stringify({files:files.length,binary:binary.length,treeBytes:fs.statSync('handoff/FINAL/publish/tree.json').size,known:tree.filter(t=>t.sha).length}));
