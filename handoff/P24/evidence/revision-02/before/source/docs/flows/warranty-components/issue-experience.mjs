import {scopeGuard} from '../attachments/model.mjs';

// Presentation of existing owner state; no new backend policy or persistence.
export function quantityControls(value,available){
 const n=Number(value),valid=/^\d+$/.test(String(value).trim())&&Number.isSafeInteger(n)&&n>0;
 return {minus:!valid||n<=1,plus:!valid||n===Number.MAX_SAFE_INTEGER||(Number.isSafeInteger(available)&&available>=0&&n>=available)};
}
export function pendingIssueForCase(rows,caseId,state){
 if(state?.sessionExpired)return null;
 return rows.find(s=>s.caseId===caseId&&!s.receipt&&!scopeGuard(state,s.scope)&&s.document?.caseId===caseId&&s.document.actorId===s.scope.actorId&&s.document.warehouseId===s.scope.warehouseId&&s.document.scanSessionId===s.scanSessionId&&(s.lines.length||s.busy||s.unknown))||null;
}
