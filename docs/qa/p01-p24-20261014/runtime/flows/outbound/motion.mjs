import {mountScanFlowFeedback} from '../shared/motion/scan-flow-feedback.mjs';

export const mountOutboundMotion = options => mountScanFlowFeedback({
  ...options,prefix:'p05',
  reviewNotice:state=>{
    const count=state.accepted.reduce((n,row)=>n+row.quantity,0),d=state.document;
    return state.step===3&&!state.unknown&&!state.exception&&d&&count<d.planned
      ? {key:`${d.documentId}:${d.planned}:${count}`,selector:'.p05-warning'} : null;
  },
});
