import {P19_COMMAND_CONTRACT,COMMAND_BASE,UUID,ScannerOwnerError,ensure,scannerScope,scopeKey,copy,object,positive,text} from './scanner-owner-contract.mjs';
const only=(body,allowed)=>object(body)&&Object.keys(body).every(k=>allowed.includes(k));
export function canonicalCommandDraft({protocol,operation,key,scope,caseId,targetDocumentId=null,originalVersion=null,body,scanTarget=null,priorEntryIds=[]}){
 ensure(protocol===P19_COMMAND_CONTRACT,'Legacy/linked không được retrofit canonical receipt.');scope=scannerScope(scope);
 ensure(['CREATE','SCAN','POST'].includes(operation)&&UUID.test(key||'')&&UUID.test(caseId||''),'Operation/key/case không hợp lệ.');
 let path=COMMAND_BASE;const headers={'X-Component-Command-Contract':protocol,'Idempotency-Key':key};let scan=null;
 if(operation==='CREATE'){
  ensure(targetDocumentId===null&&originalVersion===null&&only(body,['warehouse_id','warranty_case_id','component_issue_no','document_date','purpose','note','lines'])&&body.warehouse_id===scope.warehouseId&&body.warranty_case_id===caseId&&Array.isArray(body.lines)&&body.lines.length>0&&body.lines.length<=500,'CREATE canonical body/max500/target/version sai.');
  ensure(body.lines.every(l=>only(l,['sku_id','required_qty','note'])&&UUID.test(l.sku_id||'')&&positive(l.required_qty)),'CREATE line sai.');
 }else{
  ensure(UUID.test(targetDocumentId||'')&&positive(originalVersion)&&originalVersion<=999999999,'SCAN/POST phải có canonical version gốc.');headers['If-Match']=`"${originalVersion}"`;path+='/'+targetDocumentId+(operation==='SCAN'?'/scans':'/post');
  if(operation==='SCAN'){
   ensure(only(body,['line_id','code_value','quantity'])&&Object.keys(body).length===3&&UUID.test(body.line_id||'')&&text(body.code_value)&&Array.from(body.code_value).length<=200&&positive(body.quantity),'SCAN phải giữ line/input thực≤200/quantity; không ID overrides.');
   ensure(object(scanTarget)&&((UUID.test(scanTarget.itemId||'')&&scanTarget.containerId===null)||(scanTarget.itemId===null&&UUID.test(scanTarget.containerId||''))),'Original resolved SCAN target phải XOR ITEM/BOX.');scan={lineId:body.line_id,quantity:body.quantity,itemId:scanTarget.itemId,containerId:scanTarget.containerId};
  }else ensure(only(body,[])&&Object.keys(body).length===0,'POST body phải rỗng.');
 }
 ensure(Array.isArray(priorEntryIds)&&priorEntryIds.every(id=>UUID.test(id)),'Known entry IDs sai.');
 return copy({protocol,protocolVersion:1,operation,key,path,method:'POST',body,headers,scope,caseId,targetDocumentId,originalVersion,scan,priorEntryIds:[...priorEntryIds]});
}
export async function freezeCanonicalCommand(input){const command=canonicalCommandDraft(input),salt=crypto.randomUUID();const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+JSON.stringify(command)));const fingerprint=[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');return copy({...command,fingerprint});}
// No raw/body/free text/token is exported. Original private body stays with owner.
export function exportCommandCheckpoint(command){validateCommandCheckpoint(command);return copy({contract:P19_COMMAND_CONTRACT,protocol:command.protocol,protocolVersion:1,operation:command.operation,key:command.key,path:command.path,method:'POST',fingerprint:command.fingerprint,scope:scannerScope(command.scope),caseId:command.caseId,targetDocumentId:command.targetDocumentId,originalVersion:command.originalVersion,scan:command.scan,priorEntryIds:command.priorEntryIds});}
export function validateCommandCheckpoint(value){
 ensure(object(value)&&value.protocol===P19_COMMAND_CONTRACT&&value.protocolVersion===1&&['CREATE','SCAN','POST'].includes(value.operation)&&UUID.test(value.key||'')&&UUID.test(value.caseId||'')&&/^[a-f0-9]{64}$/.test(value.fingerprint||''),'Checkpoint protocol/identity/fingerprint sai.');scannerScope(value.scope);
 ensure(value.method==='POST'&&value.path===COMMAND_BASE+(value.operation==='CREATE'?'':'/'+value.targetDocumentId+(value.operation==='SCAN'?'/scans':'/post')),'Checkpoint canonical path sai.');
 ensure(value.operation==='CREATE'?value.targetDocumentId===null&&value.originalVersion===null:UUID.test(value.targetDocumentId||'')&&positive(value.originalVersion),'Checkpoint original version/target sai.');
 ensure(Array.isArray(value.priorEntryIds)&&value.priorEntryIds.every(id=>UUID.test(id)),'Checkpoint prior entry list sai.');
 ensure(value.operation!=='SCAN'?value.scan===null:only(value.scan,['lineId','quantity','itemId','containerId'])&&UUID.test(value.scan.lineId||'')&&positive(value.scan.quantity)&&((UUID.test(value.scan.itemId||'')&&value.scan.containerId===null)||(value.scan.itemId===null&&UUID.test(value.scan.containerId||''))),'Checkpoint SCAN proof expectation sai.');
 return value;
}
export function importCommandCheckpoint(value,scope){ensure(only(value,['contract','protocol','protocolVersion','operation','key','path','method','fingerprint','scope','caseId','targetDocumentId','originalVersion','scan','priorEntryIds'])&&value.contract===P19_COMMAND_CONTRACT&&only(value.scope,['actorId','authSessionId','warehouseId','authenticated','contextConfirmed','actorStatus','warehouseStatus','permissions','dimensions','tenantResolved']),'Checkpoint export allowlist sai; không raw/PII/credentials.');validateCommandCheckpoint(value);ensure(scopeKey(value.scope)===scopeKey(scope),'Checkpoint khác actor/stable session/kho/quyền gốc.');return copy(value);}
export function createPrivateCommandJournal(){const map=new Map();return {retain(command){const cp=exportCommandCheckpoint(command),existing=map.get(cp.key);if(existing&&JSON.stringify(existing)!==JSON.stringify(cp))throw new ScannerOwnerError('P19_COMMAND_IDENTITY_IMMUTABLE');map.set(cp.key,cp);return copy(cp);},read(key,scope){const v=map.get(key);return v?importCommandCheckpoint(v,scope):null;},export(key){const v=map.get(key);return v?copy(v):null;}};}
