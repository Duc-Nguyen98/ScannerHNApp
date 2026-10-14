import {P24_OWNER_GATE,P24_OWNER_CONTRACT} from './scanner-owner-contract.mjs';
import {createScannerOwnerAdapter} from './scanner-owner-adapter.mjs';
import {createScannerOwner} from './scanner-owner-controller.mjs';
export function prepareP24Owner(){return Object.freeze({gate:P24_OWNER_GATE,contract:P24_OWNER_CONTRACT,activated:false,
 createOfflineOwner({offlineRequest,approvedApiOrigin,getAccessToken,timeoutMs,...options}){return createScannerOwner({...options,adapter:createScannerOwnerAdapter({offlineRequest,approvedApiOrigin,getAccessToken,timeoutMs})});},
});}
