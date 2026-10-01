const fs=require('node:fs');
const base='docs/flows/';
function edit(file,from,to){const p=base+file,s=fs.readFileSync(p,'utf8');if(!s.includes(from))throw Error('Missing '+file+' '+from.slice(0,70));fs.writeFileSync(p,s.replace(from,to));}
edit('warranty-components/issue-view.mjs',"demo=q.get('sample')==='b19'&&!!demoFlow;flow=caseDetails(caseId)?demo?demoFlow:ensure(caseId,q.get('doc')):null;","demo=(q.get('sample')==='b19'&&!!demoFlow)||(q.get('sample')==='b21'&&!!resumeDemo);flow=caseDetails(caseId)?demo?(q.get('sample')==='b21'?resumeDemo:demoFlow):ensure(caseId,q.get('doc')):null;");
edit('warranty-components/issue-view.mjs',"...(demo?{sample:'b19'}:{doc:current().document.documentId})","...(demo?{sample:flow===resumeDemo?'b21':'b19'}:{doc:current().document.documentId})");
edit('warranty-components/issue-view.mjs',"...(demo?{sample:'b19'}:{doc:current().document.documentId})","...(demo?{sample:flow===resumeDemo?'b21':'b19'}:{doc:current().document.documentId})");
edit('warranty-components/issue-view.mjs',"if(a==='back'){if(current()?.busy||current()?.unknown)","if(a==='back'&&onResume&&flow&&(!demo||flow===resumeDemo)&&!current().receipt){onResume(current(),demo);return;}\n  if(a==='back'){if(current()?.busy||current()?.unknown)");
edit('warranty-components/issue-view.mjs','  pendingForCase:id=>',`  resumeOwner:(id,sample=false)=>sample?(resumeDemo?.snapshot().document.documentId===id?resumeDemo:null):flows.get(id)||null,
  resumePending:(sample=false)=>sample?(resumeDemo&&!resumeDemo.snapshot().receipt?[resumeDemo.snapshot()]:[]):[...flows.values()].filter(f=>!f.resumeGuard()).map(f=>f.snapshot()).filter(s=>!s.receipt&&(s.lines.length||s.busy||s.unknown)),
  async seedResume(scene){resumeDemo?.dispose();const demoAdapter=createIssueFixture({delay:120}),source=createCheckpointFixture({delay:180});resumeDemo=createRetainedIssue({getState,caseId:'BH-001',documentId:'XLK-0002',adapter:demoAdapter,source});
   if(scene==='post-check'){resumeDemo.scan('LK0001-HN001');resumeDemo.scan('BOX-LK-0002-01');resumeDemo.quantity(2);demoAdapter.setMode('timeout-posted');await resumeDemo.post();}
   else resumeDemo.restoreRecorded([{...demoAdapter.lookup('LK0001-HN001'),quantity:1}]);
   if(scene==='reconcile')source.setMode('unknown');return resumeDemo.snapshot();
  },
  pendingForCase:id=>`);
edit('warranty-components/issue-view.mjs','demoFlow?.dispose();review.remove();','demoFlow?.dispose();resumeDemo?.dispose();review.remove();');
edit('home/home-flow.mjs',"  'component-history':", "  'component-resume': { target: 'P21', label: 'Tiếp tục phiếu linh kiện', tab: 'history' },\n  'component-history':");
edit('home/home.mjs',"import {mountComponentHistory}","import {mountComponentResume} from '../warranty-components/resume-view.mjs';\nimport {mountComponentHistory}");
edit('home/home.mjs','  let componentHistory;','  let componentHistory;\n  let componentResume;');
edit('home/home.mjs',"    if (key === 'component-history'", "    if (key === 'component-resume' && result.kind === 'pending') result.kind = 'component-resume';\n    if (key === 'component-history'");
edit('home/home.mjs',"    if (result.kind !== 'component-history')", "    if (result.kind !== 'component-resume') componentResume?.hide();\n    screen.classList.toggle('p21-screen',result.kind==='component-resume');\n    if (result.kind !== 'component-history')");
edit('home/home.mjs',"    } else if (result.kind === 'component-history') {", "    } else if (result.kind === 'component-resume') {\n      destination.className='hn-component-resume';componentResume.show();document.title='P21 · Tiếp tục phiếu linh kiện · Prototype';window.scrollTo(0,0);\n    } else if (result.kind === 'component-history') {");
edit('home/home.mjs','  function openIssue(context)',`  function openResume(context){if(disposed||sessionGuard(state()))return;const hash='#p02/component-resume?'+new URLSearchParams(context);if(location.hash===hash)return;history.pushState({p21From:location.hash},'',hash);showRoute({key:'component-resume'});}
  componentResume=mountComponentResume({root:destination,screen,tools:root.querySelector('.hn-tools'),getState:state,getOwner:(id,sample)=>componentIssue?.resumeOwner(id,sample),getPending:sample=>componentIssue?.resumePending(sample)||[],seedDemo:scene=>componentIssue.seedResume(scene),onNavigate:openResume,onHome:goHome,onHistory:()=>showRoute({key:'history'},{push:true}),onIssue:(s,panel,sample)=>openIssue({case:s.caseId,doc:s.document.documentId,panel,...(sample?{sample:'b21'}:{})}),onSize:fitPreview});
  function openIssue(context)`);
edit('home/home.mjs','componentIssue=mountComponentIssue({root:',"componentIssue=mountComponentIssue({onResume:(s,sample)=>openResume({panel:s.unknown?4:2,doc:s.document.documentId,...(sample?{sample:'b21'}:{})}),root:");
edit('home/home.mjs',"onIssue:(id,doc)=>openIssue({case:id,panel:1,...(doc?{doc}:{})})","onIssue:(id,doc)=>doc?openResume({doc,panel:2}):openIssue({case:id,panel:1})");
edit('home/home.mjs',"openIssue({case:caseId,doc:documentId,panel:pending.unknown||pending.busy?3:1});","openResume({doc:documentId,panel:pending.unknown||pending.busy?4:2});");
edit('home/home.mjs','componentHistory.dispose(); dialogs.dispose();','componentHistory.dispose(); componentResume.dispose(); dialogs.dispose();');
edit('auth-session/index.html','  <link rel="stylesheet" href="../warranty-components/history.css?v=p20-r01">','  <link rel="stylesheet" href="../warranty-components/history.css?v=p20-r01">\n  <link rel="stylesheet" href="../warranty-components/resume.css?v=p21-r01">');
