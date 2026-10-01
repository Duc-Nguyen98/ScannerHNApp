import { sessionGuard } from '../home/home-flow.mjs';
import { BOARD_PRODUCT,NFC_NAMESPACE } from './fixture-adapter.mjs';
export function createNfcFlow({adapter,getState,onChange=()=>{}}){
 let state={panel:1,query:'',tab:'all',itemId:BOARD_PRODUCT.id,selectedUid:'NFC-8A2F',read:null,receipt:null,request:null,busy:false,unknown:false,settledFailure:false,message:'',dependency:null},disposed=false,generation=0,sequence=0;
 const snapshot=()=>structuredClone(state);
 const scope=()=>{const s=getState();return !disposed&&!sessionGuard(s)?{actorId:s.session.actor.id,warehouseId:s.session.warehouse.id,actor:structuredClone(s.session.actor),warehouseName:s.session.warehouse.name}:null;};
 const update=next=>{if(disposed)return;state={...state,...next};onChange(snapshot(),next);};
 const product=()=>adapter.product(scope(),state.itemId);
 const writeOK=()=>!!scope()&&getState().session.warehouse.active===true&&adapter.capabilities().link===true;
 const blocked=()=>{update({message:!scope()?'Phiên chưa được xác nhận.':getState().session.warehouse.active!==true?'Kho tạm dừng hoặc chưa xác minh. Giữ nguyên thông tin, chưa thể liên kết.':'Không có quyền liên kết thẻ.',dependency:null});return false;};
 function mappingOK(){
  const tag=adapter.mapping(scope(),state.read?.uid);
  if(tag?.status==='locked'){update({message:'Thẻ đang tạm khóa. Không thể liên kết.',dependency:{target:'P17',reason:'tag-locked',tagId:tag.id}});return false;}
  if(tag?.status==='linked'&&tag.product?.id!==state.itemId){update({message:'Thẻ đã liên kết với sản phẩm khác. Không ghi đè liên kết hiện tại.',dependency:{target:'P17',panel:'P17.S03',tagId:tag.id,uid:tag.uid,itemId:state.itemId}});return false;}
  if(tag?.status==='linked'){update({message:'Thẻ này đã liên kết với sản phẩm đang chọn. Hãy quay lại bước đọc và chọn thẻ chưa liên kết.',dependency:null});return false;}
  return true;
 }
 function confirmed(result){
  const r=state.request,s=scope();
  return s&&result?.kind==='fixture-confirmed'&&result.namespace===NFC_NAMESPACE&&r&&['requestId','tagId','uid','itemId'].every(k=>result[k]===r[k])&&result.warehouseId===s.warehouseId&&result.actorId===s.actorId&&result.product?.id===r.itemId&&!!result.linkedAt&&result.actor?.id===s.actorId;
 }
 function accept(result){
  if(confirmed(result)){update({panel:state.panel===3?4:state.panel,busy:false,unknown:false,settledFailure:false,receipt:result,message:'',dependency:null});return;}
  if(result?.kind==='conflict'||result?.kind==='locked'){update({busy:false,unknown:false,settledFailure:true,message:result.kind==='conflict'?'Thẻ đã liên kết với sản phẩm khác. Không ghi đè.':'Thẻ đang tạm khóa.',dependency:{target:'P17',panel:result.kind==='conflict'?'P17.S03':null,tagId:result.tagId||state.read.tagId}});return;}
  if(['failed','denied','already-linked'].includes(result?.kind)){update({busy:false,unknown:false,settledFailure:true,message:result.kind==='denied'?'Không có quyền liên kết thẻ.':result.kind==='already-linked'?'Thẻ này đã được liên kết. Quay lại và chọn thẻ khác.':'Liên kết thất bại đã xác định. Giữ thông tin để thử lại.'});return;}
  update({busy:false,unknown:true,message:'Chưa xác định kết quả liên kết. Giữ UID và yêu cầu; kiểm tra kết quả trước khi thử lại.'});
 }
 return {
  dismissException(){if(!scope()||state.busy||state.unknown||state.dependency?.panel!=='P17.S03')return false;update({panel:2,dependency:null,message:''});return true;},
  snapshot,scope,product,list:()=>adapter.list(scope(),state),detail:id=>adapter.detail(scope(),id),readTags:()=>adapter.readTags(scope()),
  canContinue:()=>!state.busy&&!state.unknown&&writeOK()&&adapter.capabilities().read===true&&!!product()&&!!state.read?.uid&&!['linked','locked'].includes(adapter.mapping(scope(),state.read?.uid)?.status),
  resetFilters(){if(!scope())return false;update({query:'',tab:'all'});return true;},
  search(query){if(!scope())return false;update({query});return true;},
  searchIntent(){
   if(!scope()||state.panel!==1||!state.query.trim())return null;
   let result;try{result=adapter.list(scope(),state);}catch{return null;}
   if(result?.status!=='ready'||result.error||result.stale||!Array.isArray(result.items)||!result.items.length)return null;
   const id=result.items[0]?.id;if(typeof id!=='string'||!id)return null;
   // One loaded row is not proof of a unique match when the source is partial.
   return {action:result.items.length===1&&result.partial===false?'open':'focus',id};
  },
  tab(tab){if(!scope()||!['all','linked','unlinked'].includes(tab))return false;update({tab});return true;},
  begin(){
   if(!scope())return false;
   if(state.busy||state.unknown){update({panel:state.request?3:2});return true;}
   let message='';
   if(state.receipt||state.settledFailure){
    const next=adapter.readTags(scope()).find(t=>t.status==='unlinked');generation++;
    state={...state,read:null,receipt:null,request:null,settledFailure:false,selectedUid:next?.uid||state.selectedUid};
    if(!next)message='Đã sử dụng cả 5 thẻ mô phỏng. Có thể xem lại các thẻ; tải lại preview nếu muốn làm lại bộ test.';
   }
   update({panel:2,message,dependency:null});return true;
  },
  selectReadTag(uid){
   if(!scope()||state.panel!==2||state.busy||state.unknown||!adapter.readTags(scope()).some(t=>t.uid===uid))return false;
   generation++;update({selectedUid:uid,read:null,request:null,settledFailure:false,message:'',dependency:null});return true;
  },
  scenarioChanged(){if(!scope()||state.busy||state.unknown)return false;generation++;update({read:state.panel===2?null:state.read,request:state.panel===2?null:state.request,message:'',dependency:null});return true;},
  select(id){if(!writeOK()||state.busy||state.unknown||!adapter.product(scope(),id))return false;generation++;update({itemId:id,read:null,request:null,receipt:null,settledFailure:false,panel:2,message:'',dependency:null});return true;},
  panel(panel){if(!scope()||![1,2,3,4].includes(panel)||panel===3&&(!state.read||!state.unknown&&!mappingOK())||panel===4&&!state.receipt)return false;if(state.busy&&panel!==1)return false;if(state.receipt&&[2,3].includes(panel))return false;update({panel:state.unknown&&panel===2?3:panel});return true;},
  async read(){
   if(state.panel!==2||state.busy||state.unknown||!product())return false;
   if(!writeOK())return blocked();
   if(adapter.capabilities().read!==true){update({read:null,message:'Thiết bị không hỗ trợ NFC. Không thể đọc thẻ.',dependency:{target:'P15',reason:'nfc-unsupported'}});return false;}
   const token=++generation,s=scope();update({busy:true,read:null,request:null,settledFailure:false,message:'',dependency:null});
   let result;try{result=await adapter.read(s,state.selectedUid);}catch{result={kind:'read-error'};}
   if(disposed||token!==generation)return false;
   if(scope()?.actorId!==s.actorId||scope()?.warehouseId!==s.warehouseId){update({busy:false,read:null,message:'Phiên đã thay đổi. Chưa xác nhận lần đọc này.'});return false;}
   if(result?.kind==='fixture-read'&&result.uid&&result.tagId&&result.readAt&&result.warehouseId===s.warehouseId){update({busy:false,read:result});mappingOK();return true;}
   const reason=result?.kind==='permission'?'nfc-permission-denied':result?.kind==='unsupported'?'nfc-unsupported':'nfc-read-error';
   update({busy:false,read:null,message:reason==='nfc-permission-denied'?'Quyền đọc NFC bị từ chối.':reason==='nfc-unsupported'?'Thiết bị không hỗ trợ NFC.':'Không đọc được thẻ. Giữ thẻ ổn định và thử lại.',dependency:{target:reason==='nfc-read-error'?'P17':'P15',reason}});return false;
  },
  next(){if(state.busy||state.unknown||!state.read||!product())return false;if(!writeOK())return blocked();if(adapter.capabilities().read!==true||!mappingOK())return false;update({panel:3,message:'',dependency:null});return true;},
  async confirm(){
   if(state.panel!==3||state.busy||state.unknown||state.receipt||!state.read)return false;
   if(!writeOK())return blocked();if(!mappingOK())return false;
   const s=scope(),token=generation;
   if(!state.request)state.request={requestId:`${NFC_NAMESPACE}-${++sequence}`,tagId:state.read.tagId,uid:state.read.uid,itemId:state.itemId};
   const request=structuredClone(state.request);update({busy:true,message:'',dependency:null});
   let result;try{result=await adapter.link(s,request);}catch{result={kind:'unknown'};}
   if(disposed||generation!==token)return false;
   if(scope()?.actorId!==s.actorId||scope()?.warehouseId!==s.warehouseId){update({busy:false,unknown:true,message:'Phiên đã thay đổi. Cần đối chiếu kết quả.'});return false;}
   accept(result);return !!state.receipt;
  },
  async reconcile(){
   if(!scope()||state.busy||!state.unknown||!state.request)return false;
   const token=generation,s=scope();update({busy:true});let result;try{result=await adapter.reconcile(s,state.request);}catch{result={kind:'unknown'};}
   if(disposed||generation!==token)return false;
   if(scope()?.actorId!==s.actorId||scope()?.warehouseId!==s.warehouseId){update({busy:false,unknown:true,message:'Phiên đã thay đổi. Cần đối chiếu kết quả.'});return false;}
   accept(result);return !!state.receipt;
  },
  message(message){update({message});},
  dispose(){disposed=true;generation++;},
 };
}
