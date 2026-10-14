import {caseDetails,postedDocuments} from '../warranty/warranty-model.mjs';

const wait=(ms,signal)=>new Promise((resolve,reject)=>{if(signal?.aborted){reject(new DOMException('Aborted','AbortError'));return;}const timer=setTimeout(()=>{signal?.removeEventListener('abort',abort);resolve();},ms);function abort(){clearTimeout(timer);reject(new DOMException('Aborted','AbortError'));}signal?.addEventListener('abort',abort,{once:true});});
export function createComponentHistoryFixture({getIssuedDocuments=()=>[],sample=null,delay=350}={}){
 let mode='ready';const calls=[];
 return {setMode(value){mode=value;},getMode:()=>mode,metrics:()=>structuredClone(calls),async read({caseId,cursor,scope,signal}){
  const requestMode=mode;calls.push({caseId,cursor,scope});
  await wait(requestMode==='slow'?1800:delay,signal);
  if(requestMode==='error')throw Error('Kết nối mô phỏng bị gián đoạn.');
  if(!caseDetails(caseId)?.ledgerKnown)throw Error('Chưa có nguồn lịch sử được xác minh cho hồ sơ này.');
  let rows=[...postedDocuments(caseId),...getIssuedDocuments().filter(r=>r.caseId===caseId&&r.status==='POSTED')];
  if(sample){const base=postedDocuments('BH-001')[0];rows=sample==='empty'?[]:[{...base,caseId},{...base,id:'XLK-DEMO-OLDER',caseId,at:'09/09/2026 09:20',lines:[{code:'LK0003-HN008',sku:'LK-0003',name:'Trục lăn máy in XP-420B',quantity:1}]}];}
  if(sample==='long-history')rows[0]={...rows[0],lines:[...rows[0].lines,...Array.from({length:4},(_,i)=>({sku:'LK-DEMO-'+(i+3),name:['Trục lăn','Cáp tín hiệu USB','Cụm cảm biến','Bo giao tiếp'][i],code:'DEMO-CODE-'+i,quantity:i+1}))]};
  rows=[...new Map(rows.map(r=>[r.id,r])).values()];
  // Deliberate overlap exercises immutable-ID merge. This cursor belongs only
  // to the fixture, and is never sent to a guessed backend endpoint.
  if(cursor===null)return {caseId,items:rows.slice(0,1),hasMore:rows.length>1,nextCursor:rows.length>1?'fixture-rest':null};
  if(cursor!=='fixture-rest')throw Error('Cursor mô phỏng không hợp lệ.');
  return {caseId,items:structuredClone(rows),hasMore:false,nextCursor:null};
 }};
}
