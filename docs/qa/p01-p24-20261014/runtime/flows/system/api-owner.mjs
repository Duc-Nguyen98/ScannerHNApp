import {P15_RELEASE,requireP15,safeOwnerReference,P15ReadError} from './api-contract.mjs';

// Caller retains its command journal. This owner holds only an ephemeral safe
// reference and a GET cancellation epoch; cancellation never cancels server writes.
export function createP15OwnerReadBinding({client,readId,getReference,getCallerGeneration}){
 requireP15(client?.mode==='MOCK_PREPARATION'&&typeof getReference==='function'&&typeof getCallerGeneration==='function','ACTIVATION_OFF');
 const reference=safeOwnerReference(getReference());client.validate(readId,reference);
 const captured=JSON.stringify(reference),initialScope=client.contextKey(),caller=getCallerGeneration();
 requireP15(Number.isSafeInteger(caller)&&caller>=0,'CALLER_GENERATION_REQUIRED');
 let epoch=0,busy=false,disposed=false,controller=null;
 function current(){try{return !disposed&&captured===JSON.stringify(safeOwnerReference(getReference()))&&initialScope===client.contextKey()&&caller===getCallerGeneration();}catch{return false;}}
 const cancel=()=>{epoch++;busy=false;controller?.abort();controller=null;};
 return {mode:'MOCK_PREPARATION',release:P15_RELEASE,reference,readId,get busy(){return busy;},current,cancel,
  async read({signal}={}){
   if(!current())return {kind:'ignored'};if(busy)return {kind:'ignored'};
   busy=true;const ticket=++epoch,abortController=new AbortController();controller=abortController;const abort=()=>abortController.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
   try{const result=await client.read(readId,reference,{signal:abortController.signal});if(!current()||epoch!==ticket||abortController.signal.aborted)return {kind:'ignored'};return result;}
   catch(error){if(!current()||epoch!==ticket||abortController.signal.aborted)return {kind:'ignored'};throw error instanceof P15ReadError?error:new P15ReadError('OWNER_READ_UNAVAILABLE');}
   finally{signal?.removeEventListener('abort',abort);if(epoch===ticket){busy=false;controller=null;}}
  },
  dispose(){disposed=true;cancel();},
 };
}
