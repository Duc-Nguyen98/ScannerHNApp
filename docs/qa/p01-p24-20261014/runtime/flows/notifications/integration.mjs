import {P13_RELEASE,requireP13,uuid} from './api-contract.mjs';
import {scopeKey as documentScopeKey} from '../documents/api-client.mjs';
import {createP13PreparedSource} from './api-source.mjs';
import {createNotificationPreview} from './notification-model.mjs';

// Compile-time release gate. URL params, localStorage and a caller's boolean
// cannot enable production. A prepared client is dependency injection for QA.
export const P13_PRODUCTION_ACTIVATION=false;
export function createP13Source({getState,apiPreparation=null,onCount=()=>{},onSystemError=()=>false}){
 if(!apiPreparation)return createNotificationPreview({getState});
 requireP13(apiPreparation.productionActivation!==true&&apiPreparation.client?.mode==='MOCK_PREPARATION','ACTIVATION_OFF');
 return createP13PreparedSource({client:apiPreparation.client,onChange:onCount,onSystemError});
}
// BE03/04: keep independent owner reads prepared; no aggregate/readiness → sent projection.
export function createP13BusinessBridge({readOwner,getContext,mapping=null}={}){
 return {release:P13_RELEASE,
  waiting(){return {status:'pending',items:null,total:null,code:'SENT_WAITING_WEB_CONTRACT_PENDING'};},
  async source(type){requireP13(['inbound','outbound'].includes(type)&&readOwner&&getContext,'BUSINESS_READ_OWNER_REQUIRED');const ctx=getContext();documentScopeKey(ctx);return readOwner.list(type,{warehouse_id:ctx.warehouseId,page:1,per_page:10,sort_order:'desc'});},
  resolve(recipient){if(typeof mapping!=='function'||!uuid(recipient?.subject_id))return null;const result=mapping({subjectType:recipient.subject_type,subjectId:recipient.subject_id});return result&&['inbound','outbound','warranty'].includes(result.type)&&result.id===recipient.subject_id?result:null;},
  async open(recipient){const target=this.resolve(recipient);requireP13(target&&readOwner&&getContext,'SUBJECT_MAPPING_PENDING');const scope=documentScopeKey(getContext()),result=await readOwner.detail(target.type,target.id);requireP13(scope===documentScopeKey(getContext()),'STALE_CONTEXT');return result;},
  web(){return {url:null,status:'NOT_CONFIGURED'};}
 };
}
