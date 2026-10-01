from pathlib import Path
p=Path('docs/flows/nfc/nfc.mjs');s=p.read_text(encoding='utf-8')
pairs=[
('copying=false,repeatLink=false;','copying=false,repeatLink=false,backPending=false;'),
('function cards(){const data=flow.list();return data.items.length?', '''function listData(){try{return flow.list();}catch{return {status:'error',items:[],counts:{}};}}
 function listReady(data){return data?.status==='ready'&&!data.error&&!data.stale&&Array.isArray(data.items);}
 function cards(){const data=listData();if(!listReady(data))return '<div class="p07-empty"><strong>Chưa tải được danh sách thẻ</strong><p role="status">Chưa xác minh thông tin hiện tại. Thử tải lại danh sách.</p><button data-p07="retry-list" class="p07-inline-action">Thử tải lại</button></div>';return data.items.length?'''),
('counts=flow.list().counts;', 'counts=listReady(listData())?listData().counts:{};'),
('function showDetail(id){\n  const tag=flow.detail(id);', '''function showDetail(id){
  if(flow.snapshot().panel===1){const data=listData();if(!listReady(data)||!data.items.some(t=>t.id===id)){render({focus:false});return;}}
  const tag=flow.detail(id);'''),
("if(a==='back'){if(s.panel===1)","if(a==='back'){if(backPending||detailRoute.isClosing())return;if(s.panel===1)"),
('if(history.state?.p07From===hashFor(parent))history.back();','if(history.state?.p07From===hashFor(parent)){backPending=true;history.back();}'),
("if(a==='filter')flow.message","if(a==='retry-list')render();\n  if(a==='filter')flow.message"),
('show(context={}){detailModal','show(context={}){backPending=false;detailModal'),
('hide(){exceptionNavigation','hide(){backPending=false;exceptionNavigation')]
for a,b in pairs:
 assert a in s,a
 s=s.replace(a,b,1)
p.write_text(s,encoding='utf-8')
