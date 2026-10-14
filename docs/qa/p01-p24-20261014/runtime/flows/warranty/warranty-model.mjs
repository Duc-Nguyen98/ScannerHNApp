import {readWarrantyCases,writeWarrantyCase,WARRANTY_LEDGER} from '../shared/warranty-cases.mjs';
import {sessionGuard} from '../home/home-flow.mjs';
import {createLookupFixtureAdapter} from '../lookup/fixture-adapter.mjs';
import {faultOption,faultText,faultError} from './fault-options.mjs';
// All keys/policies below belong to the design fixture, NOT backend enums/APIs.
export const WARRANTY_NAMESPACE='hn-warranty-design-v1';
// Explicit shared design ledger; POSTED case IDs stay authoritative.
export const LEDGER_FIXTURE=WARRANTY_LEDGER;
export function postedDocuments(caseId,rows=LEDGER_FIXTURE){return [...new Map(rows.filter(r=>r.caseId===caseId&&r.status==='POSTED').map(r=>[r.id,r])).values()].map(r=>structuredClone(r));}
export function caseDetails(id){
 const c=readWarrantyCases().find(c=>c.id===id);if(!c)return null;
 return {customer:null,contact:null,fault:null,diagnosis:null,note:null,accessories:null,version:1,ledgerKnown:false,...c,closed:c.status==='Đã trả khách'};
}
export function componentSummary(id){const documents=postedDocuments(id),known=caseDetails(id)?.ledgerKnown===true||documents.length>0;return {documents,known,quantity:known?documents.flatMap(d=>d.lines).reduce((n,l)=>n+l.quantity,0):null};}
export function guardWarranty(state,caseId){
 const error=sessionGuard(state);if(error)return error;
 if(state.session.warehouse?.id!=='fixture-hoa-nam'||state.session.warehouse.active!==true)return 'Kho tạm dừng hoặc chưa xác minh.';
 if(caseId&&!caseDetails(caseId))return 'Không tìm thấy hồ sơ.';
 if(caseId&&caseDetails(caseId).closed)return 'Hồ sơ đã trả khách, chỉ được xem thông tin.';
 return '';
}
export function resolveSerial(serial){
 const input=serial.trim();const c=readWarrantyCases().find(c=>c.serial===input);
 if(c)return {serial:c.serial,model:c.model,caseId:c.id,customer:caseDetails(c.id).customer,contact:caseDetails(c.id).contact};
 // Explicit authorized sample partner mapping, never inferred from a SKU/code.
 const a=createLookupFixtureAdapter(),item=a.search({warehouseId:'fixture-hoa-nam',actorId:'fixture'},{}).items.find(i=>i.serial===input);
 if(item?.id==='fixture-item-HN12346')return {serial:item.serial,model:item.name,itemId:item.id,customer:'Công ty Minh Phát',contact:'0901 234 567'};
 return null;
}
export function validateIntake(d){return !d.item?'Cần xác định đúng serial sản phẩm.':!d.item.customer?'Chưa có dữ liệu khách hàng cho serial này.':faultError(d)||([d.note,d.accessories].some(v=>typeof v!=='string'||v.length>200)?'Nội dung không được vượt quá 200 ký tự.':'');}
export function updateFieldErrors(values){
 const errors={};
 if(typeof values.diagnosis!=='string'||values.diagnosis.length>200)errors.diagnosis='Chẩn đoán tối đa 200 ký tự.';
 if(typeof values.result!=='string'||!values.result.trim())errors.result='Nhập kết quả sửa chữa.';
 else if(values.result.length>200)errors.result='Kết quả sửa chữa tối đa 200 ký tự.';
 return errors;
}
export function createWarrantyFlow(getState,{delay=()=>new Promise(r=>setTimeout(r,350)),commit=writeWarrantyCase}={}){
 const scanSessionId=crypto.randomUUID();
 let disposed=false,busy=false,unknown=false,request=null,receipt=null,mode='ready',writes=0,uncertainWrite=null;
 const draft={item:null,faultId:'',faultOther:'',fault:'',note:'',accessories:''};
 const updates=new Map(),requests=new Map(),confirmedUpdates=new Map(),confirmedIntakes=new Map(),acknowledged=new Set();
 let updateDraft={diagnosis:'',result:''},updateCaseId=null;
 const stamp=()=>{const p=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh',dateStyle:'short',timeStyle:'short'}).format(new Date()).split(' ');return {day:p[0],time:p[1]};};
 const uncertainError=()=>({error:'Chưa xác định kết quả. Giữ nguyên yêu cầu và đối chiếu trước khi thử lại.'});
 const requestKey=(kind,id)=>kind+':'+id;
 function acknowledge(row,mutated){
  if(mutated&&!acknowledged.has(request.id)){writes++;acknowledged.add(request.id);}
  receipt={caseId:row.id,kind:request.kind,requestId:request.id,version:row.version};
  if(request.kind==='intake'){
   if(draft.item?.serial===request.draft.item.serial)draft.item.caseId=row.id;
   confirmedIntakes.set(request.draft.item.serial,{receipt:structuredClone(receipt),row:structuredClone(row)});
  }else{
   confirmedUpdates.set(row.id,{receipt:structuredClone(receipt),row:structuredClone(row)});
   const values={diagnosis:row.diagnosis||'',result:row.result||''};
   updates.set(row.id,{values,base:structuredClone(values),version:row.version});
   if(updateCaseId===row.id)updateDraft=values;
  }
  requests.delete(request.key);uncertainWrite=null;unknown=false;return row;
 }
 function finish(){
  let row;
  if(request.kind==='intake'){
   const existing=caseDetails(request.draft.item.caseId);
   if(existing)return acknowledge(existing,false);
   const t=stamp();let n=readWarrantyCases().length+1;while(caseDetails('BH-'+String(n).padStart(3,'0')))n++;
   row={id:'BH-'+String(n).padStart(3,'0'),...request.draft.item,...request.draft,item:undefined,status:'Đã tiếp nhận',...t,actor:getState().session.actor.name,warehouse:'Kho Hoa Nam',version:1,ledgerKnown:true,events:[{id:request.id+'-E',label:'Đã tiếp nhận',...t,actor:getState().session.actor.name}]};
  }else{
   const c=caseDetails(request.caseId),t=stamp();
   row={...c,...request.values,status:'Chờ bàn giao',...t,actor:getState().session.actor.name,version:c.version+1,events:[...c.events,{id:request.id+'-E',label:'Hoàn tất sửa chữa',...t,actor:getState().session.actor.name}]};
  }
  // If commit throws after writing, reconcile the request event instead of writing twice.
  uncertainWrite=structuredClone(row);commit(row);return acknowledge(row,true);
 }
 async function adapterWait(){
  busy=true;
  try{await delay();return true;}
  catch{if(!disposed)unknown=true;return false;}
  finally{busy=false;}
 }
 function currentRequestGuard(){
  if(disposed)return 'Phiên đã kết thúc.';
  const error=guardWarranty(getState(),request.caseId||request.draft.item?.caseId);if(error)return error;
  if(getState().session.actor.id!==request.actorId)return 'Phiên đã thay đổi.';
  if(request.caseId&&caseDetails(request.caseId).version!==request.version)return 'Hồ sơ đã thay đổi. Cần đối chiếu phiên bản trước khi cập nhật.';
  return '';
 }
 async function submit(kind,caseId){
  if(disposed||busy)return {error:'Đang xử lý yêu cầu.'};
  if(unknown)return {error:'Cần đối chiếu yêu cầu trước khi thử lại.'};
  if(!['intake','update'].includes(kind))return {error:'Thao tác không được hỗ trợ.'};
  const blocked=guardWarranty(getState(),caseId||draft.item?.caseId);if(blocked)return {error:blocked};
  if(kind==='update'&&(!caseId||updateCaseId!==caseId))return {error:'Vui lòng mở đúng hồ sơ trước khi cập nhật.'};
  const error=kind==='intake'?validateIntake(draft):Object.values(updateFieldErrors(updateDraft))[0]||'';if(error)return {error};
  if(receipt?.kind===kind&&receipt.caseId===(caseId||draft.item?.caseId))return {error:'Yêu cầu này đã được xác nhận.'};
  if(kind==='intake')draft.fault=faultText(draft);
  const submissionDraft={...draft,faultOther:draft.faultId==='other'?draft.faultOther:''};
  const version=kind==='update'?updates.get(caseId).version:null;
  if(kind==='update'&&caseDetails(caseId).version!==version)return {error:'Hồ sơ đã thay đổi. Nháp được giữ lại; cần đối chiếu phiên bản trước khi cập nhật.'};
  const key=requestKey(kind,caseId||draft.item.serial);
  const payload=JSON.stringify(kind==='update'?{kind,caseId,version,values:updateDraft}:{kind,draft:submissionDraft});
  const cached=requests.get(key);
  request=cached?.payload===payload?cached:{id:crypto.randomUUID(),actorId:getState().session.actor.id,scanSessionId,warehouseId:getState().session.warehouse.id,kind,caseId,version,draft:structuredClone(submissionDraft),values:structuredClone(updateDraft),payload,key};
  requests.set(key,request);uncertainWrite=null;
  if(!await adapterWait())return disposed?{error:'Phiên đã kết thúc.'}:uncertainError();
  const after=currentRequestGuard();if(after)return {error:after};
  if(mode==='error')return {error:'Chưa cập nhật được. Dữ liệu đã nhập được giữ lại.'};
  if(mode==='unknown'){unknown=true;return uncertainError();}
  try{return {row:finish(),receipt};}catch{unknown=true;return uncertainError();}
 }
 async function reconcile(){
  if(!unknown||busy||disposed)return {error:'Không có yêu cầu cần đối chiếu.'};
  if(!await adapterWait())return disposed?{error:'Phiên đã kết thúc.'}:uncertainError();
  if(disposed)return {error:'Phiên đã kết thúc.'};
  if(uncertainWrite){
   const live=caseDetails(uncertainWrite.id);
   const scope=guardWarranty(getState(),request.caseId||request.draft.item?.caseId);
   if(scope)return {error:scope};if(getState().session.actor.id!==request.actorId)return {error:'Phiên đã thay đổi.'};
   if(live&&live.version===uncertainWrite.version&&live.serial===uncertainWrite.serial&&live.status===uncertainWrite.status&&live.events.some(e=>e.id===request.id+'-E'))return {row:acknowledge(live,true),receipt};
   return {error:'Chưa xác minh được kết quả ghi. Nháp và yêu cầu được giữ nguyên để đối chiếu.'};
  }
  const error=currentRequestGuard();if(error)return {error};
  try{return {row:finish(),receipt};}catch{unknown=true;return uncertainError();}
 }
 return {draft,get updateDraft(){return updateDraft;},setMode(v){mode=v;},
  chooseFault(id){if(disposed||busy||unknown||!faultOption(id))return false;draft.faultId=id;draft.fault=faultText(draft);return true;},
  describeFault(value){if(disposed||busy||unknown||draft.faultId!=='other')return false;draft.faultOther=String(value);draft.fault=faultText(draft);return true;},
  beginUpdate(id){
   if(disposed||busy||unknown)return false;const c=caseDetails(id);if(!c||c.closed)return false;
   let saved=updates.get(id);
   if(!saved||(saved.version!==c.version&&JSON.stringify(saved.values)===JSON.stringify(saved.base))){const values={diagnosis:c.diagnosis||'',result:c.result||''};saved={values,base:structuredClone(values),version:c.version};updates.set(id,saved);requests.delete(requestKey('update',id));}
   updateCaseId=id;updateDraft=saved.values;request=requests.get(requestKey('update',id))||null;receipt=null;return true;
  },
  select(serial){if(disposed||busy||unknown)return {error:'Yêu cầu đang xử lý, cần đối chiếu trước.'};const item=resolveSerial(serial);if(!item)return {error:'Không tìm thấy serial. Mã sản phẩm và SKU không thay thế serial.'};draft.item=item;receipt=null;request=null;return {item:draft.item};},
  confirmedUpdate(id){if((busy||unknown)&&request?.kind==='update'&&request.caseId===id)return null;const saved=confirmedUpdates.get(id);return saved?structuredClone(saved):null;},
  confirmedIntake(serial){if((busy||unknown)&&request?.kind==='intake'&&request.draft.item.serial===serial)return null;const saved=confirmedIntakes.get(serial);return saved?structuredClone(saved):null;},
  submit,reconcile,
  snapshot:()=>({busy,unknown,request,receipt,writes,draft,updateDraft,mode}),
  dispose(){disposed=true;updates.clear();requests.clear();confirmedUpdates.clear();confirmedIntakes.clear();acknowledged.clear();},
 };
}
