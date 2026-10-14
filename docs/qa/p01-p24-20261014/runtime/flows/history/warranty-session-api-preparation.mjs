import {P23_READ_CONTRACT,P23_READ_GATE} from './warranty-session-api-contract.mjs';
import {createP23ReadAdapter} from './warranty-session-api-adapter.mjs';
import {createP23ReadOwner} from './warranty-session-api-owner.mjs';
export function prepareP23Read(){return Object.freeze({contract:P23_READ_CONTRACT,gate:P23_READ_GATE,activated:false,
 createOfflineOwner({offlineRequest,approvedApiOrigin,getAccessToken,timeoutMs,...options}){return createP23ReadOwner({...options,adapter:createP23ReadAdapter({offlineRequest,approvedApiOrigin,getAccessToken,timeoutMs})});},
});}
