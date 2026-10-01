import {sessionGuard} from './home-flow.mjs';
import {pendingStockRun} from '../shared/flow-guidance.mjs';
// Read-only owner snapshots. Never allocate a document or reconstruct a scan session.
export function pendingWork(auth, sources) {
  if(sessionGuard(auth))return [];
  return sources.flatMap(({operation,snapshot:s})=>{
    const d=pendingStockRun(operation,s,auth.session)?.document;
    if(!d?.documentId||!d.scanSessionId||d.version==null)return [];
    return [{operation,id:d.documentId,number:d.number,scanSessionId:d.scanSessionId,version:d.version,
      acceptedCount:s.accepted?.length||0,busy:s.busy===true,unknown:s.unknown===true,
      label:s.unknown?'Cần đối chiếu':s.busy?'Đang gửi phiếu':'Tiếp tục phiếu đang làm'}];
  });
}
