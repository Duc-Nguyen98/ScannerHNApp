import {P22_GATE,P22_CONTRACT} from './nfc-audit-api-contract.mjs';
import {createP22AuditAdapter} from './nfc-audit-api-adapter.mjs';
import {createP22AuditOwner} from './nfc-audit-api-owner.mjs';
export function prepareP22Audit(){return Object.freeze({gate:P22_GATE,contract:P22_CONTRACT,activated:false,
 createOfflineOwner({offlineRequest,approvedApiOrigin,getAccessToken,timeoutMs,timePolicy,...options}){return createP22AuditOwner({...options,adapter:createP22AuditAdapter({offlineRequest,approvedApiOrigin,getAccessToken,timeoutMs,timePolicy})});},
});}
