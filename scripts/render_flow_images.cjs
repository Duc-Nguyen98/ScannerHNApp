const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {boards}=require('./flow_images_spec.cjs');
const {owners}=require('./flow_gate_spec.cjs');
const {chromium}=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
process.chdir(path.resolve(__dirname,'..'));
const out=path.resolve('handoff/FLOW_IMAGES_P00_P24'),mermaidPath=path.resolve('../flow-diagram-tools/package/dist/mermaid.min.js');
const gate=JSON.parse(fs.readFileSync('handoff/FINAL/FINAL_GATE.json','utf8'));
const escape=t=>String(t).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const theme={theme:'base',securityLevel:'strict',startOnLoad:false,fontFamily:'Arial, sans-serif',themeVariables:{darkMode:true,background:'#191919',primaryColor:'#2d1948',primaryTextColor:'#d1b7ee',primaryBorderColor:'#513966',lineColor:'#a5a9ab',secondaryColor:'#363f40',tertiaryColor:'#3c3020',edgeLabelBackground:'#21172e',fontSize:'18px'},flowchart:{htmlLabels:true,curve:'basis',nodeSpacing:36,rankSpacing:62,padding:20,wrappingWidth:260,useMaxWidth:false},themeCSS:'.node rect{rx:14px;ry:14px}.nodeLabel{font-weight:550}.edgeLabel{color:#d5bdf1!important;font-size:16px}.edgeLabel p{background:#21172e!important;border-radius:12px;padding:3px 7px}.flowchart-link{stroke-width:1.4px}.marker{fill:#a5a9ab!important;stroke:#a5a9ab!important}'};
function mermaidSource(board,type){
 const g=board[type],prefix=board.id+'_'+type+'_';let text='flowchart '+(board.id==='P02'&&type==='user'?'LR':'TB')+'\n';
 for(const [key,[label,kind]]of Object.entries(g.nodes)){
  const lines=label.split('\n').map(escape),title=lines.shift();const html=(kind==='panel'?'<b>'+title+'</b>':title)+(lines.length?'<br/>'+lines.join('<br/>'):'');
  text+='  '+prefix+key+(kind==='store'?'[("'+html+'")]':'["'+html+'"]')+':::'+kind+'\n';
 }
 for(const [from,to,label='',style]of g.edges)text+='  '+prefix+from+(style==='dashed'?' -.->':' -->')+(label?'|"'+escape(label)+'"|':'')+' '+prefix+to+'\n';
 text+='  classDef action fill:#2d1948,stroke:#53396b,color:#d0b1ef,stroke-width:1.4px;\n';
 text+='  classDef panel fill:#363f40,stroke:#08a4bc,color:#f2f7f8,stroke-width:1.6px;\n';
 text+='  classDef store fill:#363f40,stroke:#08a4bc,color:#f2f7f8,stroke-width:1.6px;\n';
 text+='  classDef guard fill:#413b32,stroke:#b97e18,color:#fff1d5,stroke-width:1.6px;\n';
 text+='  classDef blocked fill:#392a32,stroke:#ad637a,color:#ffcfda,stroke-width:1.4px;\n';
 return '---\nconfig: '+JSON.stringify(theme)+'\n---\n'+text;
}
fs.mkdirSync(out,{recursive:true});
const selected=process.argv.slice(2),results=[];
const headerNote='Bản UI fixture hiện hành · Không phải hợp đồng API / nghiệm thu WMS hoặc phần cứng';
(async()=>{
 const browser=await chromium.launch(),context=await browser.newContext({deviceScaleFactor:2,viewport:{width:1800,height:1000}}),page=await context.newPage();
 await page.setContent('<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>html,body{margin:0;background:#191919;font-family:Arial,sans-serif}svg{display:block}</style></head><body><div id="stage"></div></body></html>');
 await page.addScriptTag({path:mermaidPath});await page.evaluate(config=>mermaid.initialize(config),theme);
 try{
 for(const board of boards.filter(b=>!selected.length||selected.includes(b.id))){
  fs.mkdirSync(path.join(out,board.id),{recursive:true});
  for(const type of ['user','data']){
   const name=board.id+'_'+(type==='user'?'User_Flow':'Data_Flow'),source=mermaidSource(board,type);
   const graph=board[type];for(const edge of graph.edges)assert.ok(graph.nodes[edge[0]]&&graph.nodes[edge[1]]);
   const ownPanels=[...Object.values(graph.nodes).map(n=>n[0]).join('\n').matchAll(new RegExp(board.id+'\\.S\\d{2}','g'))].map(m=>m[0]);
   if(board.id!=='P00')assert.equal(new Set(ownPanels).size,board.id==='P01'?2:board.id==='P02'?1:4,'Missing panel '+name);
   fs.writeFileSync(path.join(out,board.id,name+'.mmd'),source);
   const info=await page.evaluate(async({source,name,title,type,note,build,ownPanels})=>{
    document.querySelector('#stage').replaceChildren();
    const {svg}=await mermaid.render('diagram_'+name,source);
    const parsed=new DOMParser().parseFromString(svg,'text/html').querySelector('svg');
    if(!parsed?.hasAttribute('viewBox'))throw Error('Mermaid did not produce a measurable SVG: '+svg.slice(0,180));
    const v=parsed.getAttribute('viewBox').split(/\s+/).map(Number),graphWidth=v[2],graphHeight=v[3];
    const width=Math.ceil(Math.max(1140,graphWidth+96)),height=Math.ceil(graphHeight+266),ns='http://www.w3.org/2000/svg';
    const root=document.createElementNS(ns,'svg');root.setAttribute('xmlns',ns);root.setAttribute('width',width);root.setAttribute('height',height);root.setAttribute('viewBox',`0 0 ${width} ${height}`);root.setAttribute('role','img');root.setAttribute('aria-label',title+' '+type);
    function element(tag,attrs={},text){const e=document.createElementNS(ns,tag);for(const [k,value]of Object.entries(attrs))e.setAttribute(k,value);if(text)e.textContent=text;root.append(e);return e;}
    element('rect',{x:0,y:0,width,height,fill:'#191919'});
    element('text',{x:48,y:45,fill:'#f1f6f7','font-size':28,'font-family':'Arial, sans-serif','font-weight':700},title);
    element('text',{x:48,y:78,fill:'#cbb2e9','font-size':18,'font-family':'Arial, sans-serif','font-weight':600},type==='user'?'USER FLOW  |  Đường đi thao tác':'DATA FLOW  |  Dòng dữ liệu và nguồn trạng thái');
    element('text',{x:48,y:106,fill:'#a9afb2','font-size':14,'font-family':'Arial, sans-serif'},name.startsWith('P00')?'P00 là nền tảng chung, không phải board thứ 25.':Array.from(new Set(ownPanels)).sort().join('   ·   '));
    element('path',{d:`M48 124H${width-48}`,stroke:'#43464a','stroke-width':1});
    parsed.removeAttribute('style');parsed.setAttribute('x',(width-graphWidth)/2);parsed.setAttribute('y',148);parsed.setAttribute('width',graphWidth);parsed.setAttribute('height',graphHeight);root.append(parsed);
    const bottom=height-78;const legend=[['#08a4bc','Màn hình / Nguồn'],['#8e62b3','Thao tác / Điểm nối'],['#b97e18','Điều kiện / UNKNOWN'],['#ad637a','Chặn / Chưa kết nối']];
    legend.forEach(([color,label],i)=>{const x=48+i*260;element('rect',{x,y:bottom-12,width:12,height:12,fill:color,rx:2});element('text',{x:x+21,y:bottom,fill:'#c8cbd0','font-size':14,'font-family':'Arial, sans-serif'},label);});
    element('text',{x:48,y:height-43,fill:'#a9afb2','font-size':13,'font-family':'Arial, sans-serif'},note);
    element('text',{x:48,y:height-20,fill:'#8d949b','font-size':12,'font-family':'Arial, sans-serif'},'ScannerHNApp · '+build+' · Nguồn: Flow Gate + source owner · 01/10/2026');
    document.querySelector('#stage').append(root);await document.fonts.ready;
    const overlaps=[];const nodes=[...parsed.querySelectorAll('g.node')].map(n=>({id:n.id,r:n.getBoundingClientRect()}));
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j],w=Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left),h=Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top);if(w>2&&h>2)overlaps.push([a.id,b.id,w,h]);}
    const labels=[...parsed.querySelectorAll('.nodeLabel')].map(n=>({text:n.textContent,width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height}));
    return {width,height,graphWidth,graphHeight,overlaps,labels,svg:new XMLSerializer().serializeToString(root)};
   },{source,name,title:board.id+' · '+board.title,type,note:headerNote,build:gate.build,ownPanels});
   assert.deepEqual(info.overlaps,[],'Overlapping nodes '+name);assert.ok(info.labels.length>=Object.keys(graph.nodes).length);
   const {svg,...qa}=info;fs.writeFileSync(path.join(out,board.id,name+'.svg'),svg);
   await page.setViewportSize({width:info.width,height:Math.min(info.height,1100)});
   await page.locator('#stage > svg').screenshot({path:path.join(out,board.id,name+'.png')});
   const meta=await sharp(path.join(out,board.id,name+'.png')).metadata();assert.equal(meta.width,info.width*2);assert.ok(meta.height>500);
   const stats=await sharp(path.join(out,board.id,name+'.png')).stats();assert.ok(stats.channels.some(c=>c.stdev>15),'Blank diagram '+name);
   results.push({name,board:board.id,type,panels:[...new Set(ownPanels)].sort(),nodes:Object.keys(graph.nodes).length,edges:graph.edges.length,png:{width:meta.width,height:meta.height,bytes:fs.statSync(path.join(out,board.id,name+'.png')).size},...qa});
   console.log(name+' '+meta.width+'x'+meta.height);
  }
 }
 }finally{await browser.close();}
 const all=selected.length&&fs.existsSync(path.join(out,'QUALITY_CHECK.json'))?JSON.parse(fs.readFileSync(path.join(out,'QUALITY_CHECK.json'))).filter(r=>!selected.includes(r.board)).concat(results).sort((a,b)=>a.name.localeCompare(b.name)):results;
 fs.writeFileSync(path.join(out,'QUALITY_CHECK.json'),JSON.stringify(all,null,2));
 const modules=fs.readdirSync('docs/flows',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()&&e.name.endsWith('.mjs')).map(e=>path.join(e.parentPath,e.name).replaceAll('\\','/'));
 const sourcePaths=[...new Set(Object.values(owners).map(v=>'docs/flows/'+v[0]).concat(modules,['AGENTS.md','scripts/flow_gate_spec.cjs','scripts/flow_images_spec.cjs','scripts/render_flow_images.cjs','handoff/FINAL/FINAL_GATE.json','handoff/flow/FLOW_GRAPH.csv']))].sort();
 fs.writeFileSync(path.join(out,'SOURCES.json'),JSON.stringify({date:'2026-10-01',build:gate.build,sourceAppHash:gate.source_app_hash,deploymentCommit:gate.deployment_commit,scope:'Diagrams of current UI fixture, not production API schemas or new business requirements',panelCount:91,boardCount:24,foundation:'P00 is an overview, not an additional board',renderer:'Mermaid 11.12.0 + Chromium + Arial, PNG 2x',files:sourcePaths.map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}))},null,2));
 const cards=boards.map(b=>`<section id="${b.id}"><h2>${escape(b.id+' · '+b.title)}</h2><div class="pair">${['User_Flow','Data_Flow'].map(type=>{const stem=b.id+'/'+b.id+'_'+type;return `<article><h3>${type.replaceAll('_',' ')}</h3><a href="${stem}.png" target="_blank"><img loading="lazy" src="${stem}.png" alt="${escape(b.title+' '+type)}"></a><p><a href="${stem}.png">PNG</a> · <a href="${stem}.svg">SVG</a> · <a href="${stem}.mmd">Mermaid</a></p></article>`;}).join('')}</div></section>`).join('');
 fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ScannerHNApp | User Flow & Data Flow</title><style>*{box-sizing:border-box}body{margin:0;background:#191919;color:#eef1f2;font:16px Arial,sans-serif;line-height:1.5}header,main{max-width:1540px;padding:24px;margin:auto}h1{font-size:28px}h2{font-size:22px;border-top:1px solid #48515a;padding-top:22px}h3{font-size:16px;color:#d0b1ef}nav{display:flex;gap:10px;flex-wrap:wrap}a{color:#64cddd}nav a{padding:4px}p{color:#bfc7cc}.pair{display:grid;grid-template-columns:1fr 1fr;gap:28px}article{min-width:0}img{width:100%;height:auto;border:1px solid #39434b}article p{margin-top:6px}a:focus-visible{outline:3px solid #cf9d38}@media(max-width:850px){.pair{grid-template-columns:1fr}}</style><header><h1>ScannerHNApp · User Flow & Data Flow</h1><p>50 ảnh riêng cho P00–P24. P00 là nền tảng chung; P01–P24 bao quát 91 panel. Bấm ảnh để mở PNG đầy đủ; SVG/Mermaid đi kèm để chỉnh sửa. Không có bộ test case/UAT trong gói này.</p><p>Source: ${gate.build} · Preview/fixture hiện hành. Các chỗ chưa kết nối WMS hoặc phần cứng được đánh dấu; nhãn dữ liệu không phải schema API.</p><nav>${boards.map(b=>`<a href="#${b.id}">${b.id}</a>`).join('')}</nav></header><main>${cards}</main></html>`);
 console.log(JSON.stringify({diagrams:all.length,folder:out}));
})().catch(e=>{console.error(e);process.exitCode=1;});
