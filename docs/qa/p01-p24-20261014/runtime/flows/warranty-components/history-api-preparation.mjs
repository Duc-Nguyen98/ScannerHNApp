import {P20_HISTORY_GATE,P20_HISTORY_CONTRACT,HistoryReadError} from './history-api-contract.mjs';
import {createP20HistoryAdapter} from './history-api-adapter.mjs';
import {createP20HistoryOwner} from './history-api-owner.mjs';
export function prepareP20History(){return Object.freeze({gate:P20_HISTORY_GATE,contract:P20_HISTORY_CONTRACT,activated:false,
 createOfflineOwner({offlineRequest,approvedApiOrigin,getAccessToken,timeoutMs,...options}){if(typeof offlineRequest!=='function')throw new HistoryReadError('P20_ACTIVATION_OFF');return createP20HistoryOwner({...options,adapter:createP20HistoryAdapter({offlineRequest,approvedApiOrigin,getAccessToken,timeoutMs})});},
});}
