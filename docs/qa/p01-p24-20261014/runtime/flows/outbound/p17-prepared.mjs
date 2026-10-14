import {requireP17,uuid} from '../scan-exceptions/api-contract.mjs';
import {referenceFromFrozen} from '../scan-exceptions/api-owner.mjs';
import {mountPreparedScanExceptions} from '../scan-exceptions/prepared.mjs';

// Bridge for the retained HTML source-linked owner only. Exported for explicit
// mock preparation, never selected by Home, native manual-create or legacy.
export function mountP05PreparedExceptions({flow,client,getOwnerScope,getCallerGeneration,...ui}){
 requireP17(client?.mode==='MOCK_PREPARATION'&&typeof flow?.snapshot==='function'&&typeof getOwnerScope==='function','ACTIVATION_OFF');
 const snapshot=flow.snapshot(),scope=getOwnerScope();
 requireP17(snapshot.mode==='source-linked'&&scope?.trusted===true&&snapshot.document?.actorId===scope.actor_id&&snapshot.document?.authSessionId===scope.auth_session_id&&snapshot.document?.warehouseId===scope.warehouse_id&&uuid(snapshot.source?.source_document_id)&&snapshot.document.documentId===snapshot.source.source_document_id,'SOURCE_LINK_EVIDENCE_REQUIRED');
 const operation=snapshot.unknown?'P05_LINKED_RECONCILE':'P05_RESOLVE';
 const r=snapshot.unknown?referenceFromFrozen('P05','SOURCE_LINKED',snapshot.pending,client.context(),scope):{owner:'P05',mode:'SOURCE_LINKED',actor_id:scope.actor_id,auth_session_id:scope.auth_session_id,warehouse_id:scope.warehouse_id};
 return mountPreparedScanExceptions({...ui,client,operation,getReference:()=>r,getBody:()=>operation==='P05_RESOLVE'?{warehouse_id:r.warehouse_id,raw_code:ui.rawCode}:undefined,getCallerGeneration,getOriginalRequest:operation==='P05_LINKED_RECONCILE'?()=>flow.snapshot().pending:undefined,getOriginalScope:()=>getOwnerScope(),getSnapshot:()=>flow.snapshot()});
}
