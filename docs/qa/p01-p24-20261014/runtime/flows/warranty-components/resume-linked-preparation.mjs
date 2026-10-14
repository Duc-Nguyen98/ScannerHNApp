import {clone,P19_LINKED_MODE,P19_LINKED_GATE} from './linked-contract.mjs';
import {P21_LINKED_RESUME_GATE,P21_LINKED_RESUME_MODE,P21_LINKED_RESUME_CONTRACT,ResumeReadError,resumeScope,resumeFamily,linkedResumeTask,validateResumeBusinessTarget} from './resume-linked-contract.mjs';
import {createP21LinkedResumeAdapter} from './resume-linked-adapter.mjs';
import {createLinkedResumeReader} from './resume-linked-reader.mjs';

export function linkedResumeDisposition(task,{owner,scope,pending=false,approvedOrigin}={}){
 if(pending||owner?.snapshot()?.pending||owner?.snapshot()?.unknown)return {panel:'P21.S04',action:'CHECK_ORIGINAL',mutation:false};
 if(task?.resume_policy==='OPEN_EXISTING_RESULT'){
  const path=validateResumeBusinessTarget(task,scope,approvedOrigin);return {panel:'P21.S02',action:'OPEN_P20',businessId:task.business_document_id,caseId:task.warranty_case_id,path,headerOwner:'P20',mutation:false};
 }
 if(task?.resume_policy!=='OWNER_PREFLIGHT_REQUIRED')return {panel:'P21.S03',action:'READ_ONLY',reason:task?.resume_policy||'UNKNOWN_POLICY',mutation:false};
 const s=owner?.snapshot();if(s?.mode!==P19_LINKED_MODE||resumeFamily(s.scope||{})!==resumeFamily(scope)||s.draftId!==task.document_id||s.scanSessionId!==task.scan_session_id||s.caseRow?.warranty_case_id!==task.warranty_case_id)return {panel:'P21.S03',action:'RETAINED_OWNER_UNAVAILABLE',mutation:false};
 return {panel:'P21.S02',action:'OWNER_PREFLIGHT_REQUIRED',owner,mutation:false,recordLocked:task.codes.length>P19_LINKED_GATE.maxRecordRows,maxRecordRows:P19_LINKED_GATE.maxRecordRows};
}
export function linkedResumeInfo(task,original=null){return [['Phiếu dở',task?.document_id??original?.draftId],['Hồ sơ',task?.warranty_case_id??original?.caseId],['Phiên quét',task?.scan_session_id??original?.scanSessionId],['Version hiện tại',task?.version],['Yêu cầu gốc',original?.key],['Lệnh gốc',original?.command],['Version yêu cầu',original?.draftVersion]].map(([k,v])=>`${k}: ${v??'Chưa xác minh'}`).join('\n');}
// No live factory, switch or writer. OFF preparation is visible to QA only.
export function prepareP21LinkedResume(){return Object.freeze({gate:P21_LINKED_RESUME_GATE,mode:P21_LINKED_RESUME_MODE,contract:P21_LINKED_RESUME_CONTRACT,activated:false,
 createOfflineReader({offlineRequest,approvedApiOrigin,getAccessToken,timeoutMs,...options}){if(typeof offlineRequest!=='function')throw new ResumeReadError('P21_ACTIVATION_OFF');return createLinkedResumeReader({...options,adapter:createP21LinkedResumeAdapter({offlineRequest,approvedApiOrigin,getAccessToken,timeoutMs})});},
 navigate({task,owner,getScope,approvedOrigin,onOwner,onBusiness}){
  const scope=resumeScope(getScope());task=linkedResumeTask(task,scope);const d=linkedResumeDisposition(task,{owner,scope,approvedOrigin});
  if(d.action==='OWNER_PREFLIGHT_REQUIRED')onOwner?.(owner,{draftId:task.document_id,scanSessionId:task.scan_session_id,caseId:task.warranty_case_id,preflightRequired:true});
  if(d.action==='OPEN_P20')onBusiness?.({businessId:d.businessId,caseId:d.caseId,path:d.path,headerOwner:'P20',permissionRecheck:true});
  return d;
 },
 async handoffRecovery({reader,owner,onOwner}){const verified=await reader.recoveryHandoff(owner);if(!verified)return false;onOwner?.(verified.owner,{verifiedRead:verified.proof,preflightRequired:true,mutationExposed:false});return true;},
});}
