import {P17_RELEASE,P17OwnerError,requireP17,object,uuid,safeReference,safeCheckpoint} from './api-contract.mjs';

export function referenceFromFrozen(owner,mode,request,ctx,originalScope){
 requireP17(object(request)&&['SAVE','CANCEL','RECORD'].includes(request.command),'ORIGINAL_REQUEST_REQUIRED');
 requireP17(originalScope?.trusted===true&&originalScope.actor_id===ctx.actor_id&&originalScope.auth_session_id===ctx.auth_session_id&&originalScope.warehouse_id===ctx.warehouse_id,'ORIGINAL_OWNER_SCOPE_MISMATCH');
 const id=request.draftId,key=request.key,scan=request.scanSessionId;requireP17(uuid(id)&&uuid(key)&&uuid(scan)&&request.headers?.['Idempotency-Key']===key&&request.body?.warehouse_id===ctx.warehouse_id,'FROZEN_IDENTITY_MISMATCH');
 requireP17(owner==='P04'&&mode==='SCOPED'||owner==='P05'&&mode==='SOURCE_LINKED','OWNER_MODE_NOT_SUPPORTED');
 const base=owner==='P04'?'/api/v1/mini-app/inbound/drafts/':'/api/v1/mini-app/drafts/';
 const allowedHeaders=owner==='P05'&&request.command==='RECORD'?['Idempotency-Key','X-Draft-ID','X-Draft-Scan-Session-ID','X-Draft-Version']:['Idempotency-Key','If-Match'];
 requireP17(Object.keys(request.headers).every(k=>allowedHeaders.includes(k)),'FROZEN_HEADER_NOT_ALLOWED');
 const expected=request.command==='RECORD'?(owner==='P04'?base+id+'/record':'/api/v1/mini-app/outbound/record'):base+id+(request.command==='CANCEL'?'/cancel':'');
 requireP17(request.path===expected&&request.method===(request.command==='SAVE'?'PUT':'POST')&&!request.query,'ORIGINAL_PATH_MISMATCH');
 let version;
 if(owner==='P05'&&request.command==='RECORD'){
  requireP17(request.headers['X-Draft-ID']===id&&request.headers['X-Draft-Scan-Session-ID']===scan&&/^\d+$/.test(request.headers['X-Draft-Version']||'')&&request.headers['If-Match']===undefined,'LINKED_RECORD_HEADERS_INVALID');version=Number(request.headers['X-Draft-Version']);
 }else{requireP17(/^"\d+"$/.test(request.headers['If-Match']||'')&&request.body.scan_session_id===scan,'ORIGINAL_VERSION_REQUIRED');version=Number(request.headers['If-Match'].slice(1,-1));}
 requireP17(Number.isSafeInteger(version)&&version>=(request.command==='SAVE'?0:1),'ORIGINAL_VERSION_REQUIRED');
 const r={owner,mode,command:request.command,operation_key:key,actor_id:ctx.actor_id,auth_session_id:ctx.auth_session_id,warehouse_id:ctx.warehouse_id,draft_id:id,scan_session_id:scan,original_version:version};
 if(owner==='P05'){
  requireP17(uuid(request.sourceId)&&Number.isSafeInteger(request.sourceVersion)&&request.sourceVersion>0,'SOURCE_LINK_EVIDENCE_REQUIRED');
  if(request.command==='RECORD')requireP17(request.body.source_document_id===request.sourceId&&request.body.source_version===request.sourceVersion,'SOURCE_LINK_MISMATCH');
  if(request.command==='SAVE')requireP17(request.body.operation==='OUTBOUND'&&request.body.form?.p05_source?.document_id===request.sourceId&&request.body.form?.p05_source?.version===request.sourceVersion,'SOURCE_LINK_MISMATCH');
  r.source_document_id=request.sourceId;r.source_version=request.sourceVersion;
 }
 return Object.freeze(r);
}
// One ephemeral read/check latch. Domain owner keeps its journal, accepted list
// and versions. P17 never persists request bodies or consumes a writer command.
export function createP17OwnerBinding({client,operation,getReference,getBody=()=>undefined,getCallerGeneration,getOriginalRequest=null,getOriginalScope=()=>undefined,onChange=()=>{}}){
 requireP17(client?.mode==='MOCK_PREPARATION'&&typeof getReference==='function'&&typeof getCallerGeneration==='function','ACTIVATION_OFF');
 const r=safeReference(getReference()),scope=client.contextKey(),caller=getCallerGeneration();requireP17(Number.isSafeInteger(caller)&&caller>=0,'CALLER_GENERATION_REQUIRED');
 const original=getOriginalRequest?.();
 if(operation==='P04_RECONCILE'||operation==='P05_LINKED_RECONCILE'){
  requireP17(typeof getOriginalRequest==='function','ORIGINAL_REQUEST_REQUIRED');const from=referenceFromFrozen(r.owner,r.mode,original,client.context(),getOriginalScope());requireP17(JSON.stringify(from)===JSON.stringify(Object.fromEntries(Object.keys(from).map(k=>[k,r[k]]))),'ORIGINAL_REFERENCE_MISMATCH');
 }
 const captured=JSON.stringify(r),bodyKey=JSON.stringify(getBody()),journalKey=JSON.stringify(original),originalScopeKey=JSON.stringify(getOriginalScope());let epoch=0,disposed=false,controller=null,state={status:'idle',busy:false,observation:null,error:null};
 const snapshot=()=>structuredClone(state),emit=()=>onChange(snapshot());
 function current(){try{return !disposed&&scope===client.contextKey()&&caller===getCallerGeneration()&&captured===JSON.stringify(safeReference(getReference()))&&bodyKey===JSON.stringify(getBody())&&journalKey===JSON.stringify(getOriginalRequest?.())&&originalScopeKey===JSON.stringify(getOriginalScope());}catch{return false;}}
 function cancel(){epoch++;controller?.abort();controller=null;state={...state,busy:false};}
 function unavailable(){cancel();state={status:'unavailable',busy:false,observation:null,error:null};emit();}
 return {mode:'MOCK_PREPARATION',release:P17_RELEASE,reference:r,operation,current,snapshot,reservation:()=>current()?(state.observation?.reservation??state.error?.reservation??null):null,checkpoint:()=>safeCheckpoint(r),cancel,
  async inspect(options={}){
   requireP17(options&&Object.keys(options).every(k=>k==='reservation'),'BINDING_OPTION_NOT_APPROVED');
   if(!current()){unavailable();return {kind:'ignored'};}if(state.busy)return {kind:'ignored'};
   state={...state,status:'pending',busy:true,error:null};const ticket=++epoch;controller=new AbortController();emit();
   try{const observation=await client.inspect(operation,r,{body:getBody(),reservation:options.reservation,signal:controller.signal});if(!current()){unavailable();return {kind:'ignored'};}if(epoch!==ticket)return {kind:'ignored'};state={status:'ready',busy:false,observation,error:null};emit();return observation;}
   catch(e){if(!current()){unavailable();return {kind:'ignored'};}if(epoch!==ticket)return {kind:'ignored'};const err=e instanceof P17OwnerError?e:new P17OwnerError(e.code||'OWNER_CHECK_UNAVAILABLE');state={status:'error',busy:false,observation:null,error:{code:err.code,status:err.status,panel:err.panel,traceId:err.traceId,provenance:err.provenance,...(err.reservation!==null?{reservation:err.reservation}:{})}};emit();return {kind:'error',error:state.error};}
   finally{if(epoch===ticket){controller=null;state.busy=false;}}
  },
  invalidate:unavailable,
  dispose(){disposed=true;cancel();state={status:'unavailable',busy:false,observation:null,error:null};},
 };
}
