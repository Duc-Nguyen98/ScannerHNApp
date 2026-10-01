const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
process.chdir(path.resolve(__dirname,'..'));
const out=path.resolve('handoff/FLOW_IMAGES_P00_P24'),quality=JSON.parse(fs.readFileSync(path.join(out,'QUALITY_CHECK.json')));
assert.equal(quality.length,50);
for(const type of ['user','data'])assert.equal(new Set(quality.filter(r=>r.type===type).flatMap(r=>r.panels)).size,91);
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:2200,height:1200}}),results=[];try{
for(const item of quality){
 const file=path.join(out,item.board,item.name+'.svg');await p.setContent(fs.readFileSync(file,'utf8'));await p.evaluate(()=>document.fonts.ready);
 const r=await p.evaluate(()=>{
  const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
  const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>3&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>3;
  const nodes=[...document.querySelectorAll('g.node')].map(e=>({id:e.id,r:rect(e),shape:e.querySelector('rect,path,polygon,ellipse'),label:e.querySelector('.nodeLabel')}));
  const clipped=nodes.filter(n=>{if(!n.shape||!n.label)return true;const a=rect(n.shape),t=rect(n.label);return t.left<a.left-2||t.right>a.right+2||t.top<a.top-2||t.bottom>a.bottom+2;}).map(n=>n.id);
  const labels=[...document.querySelectorAll('g.edgeLabel')].filter(e=>e.textContent.trim()).map(e=>({text:e.textContent,r:rect(e)}));
  const labelCollisions=[];for(const label of labels)for(const node of nodes)if(overlap(label.r,node.r))labelCollisions.push({label:label.text,node:node.id});
  return {nodes:nodes.length,clipped,labelCollisions};
 });
 results.push({name:item.name,...r});
}
}finally{await b.close();}
fs.writeFileSync(path.join(out,'LAYOUT_CHECK.json'),JSON.stringify({diagrams:50,userPanelIds:91,dataPanelIds:91,results},null,2));
// Contact sheets are QA only, outside the handoff ZIP folder.
const qa=path.resolve('handoff/flow-image-qa');fs.mkdirSync(qa,{recursive:true});
for(let i=0;i<quality.length;i+=10){const batch=quality.slice(i,i+10),tiles=[];for(let j=0;j<batch.length;j++){const item=batch[j],buf=await sharp(path.join(out,item.board,item.name+'.png')).resize(550,560,{fit:'contain',background:'#191919'}).png().toBuffer();tiles.push({input:buf,left:(j%2)*550,top:Math.floor(j/2)*560});}await sharp({create:{width:1100,height:Math.ceil(batch.length/2)*560,channels:3,background:'#191919'}}).composite(tiles).png().toFile(path.join(qa,'sheet-'+(i/10+1)+'.png'));}
console.log(JSON.stringify({diagrams:results.length,clipped:results.filter(r=>r.clipped.length),edgeNodeCollisions:results.filter(r=>r.labelCollisions.length)},null,2));
if(results.some(r=>r.clipped.length||r.labelCollisions.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
