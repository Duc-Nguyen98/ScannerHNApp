// Presentation read lifecycle; no document API, mutation, persistence or permission enum.
export function createDataRead({read,onChange=()=>{},onError=()=>{},timeoutMs=12000}) {
 let epoch=0,currentKey='',pending=null,disposed=false;
 let state={status:'idle',rows:null,error:null,key:''};
 const emit=()=>onChange({...state});
 function cancel(){epoch++;if(pending){clearTimeout(pending.timer);pending.controller.abort();pending.resolve(false);pending=null;}if(state.status==='loading')state={...state,status:state.rows?'ready':'idle'};}
 function load(context,{force=false}={}) {
  if(disposed)return Promise.resolve(false);
  const key=JSON.stringify(context);
  if(pending&&key===currentKey&&!force)return pending.promise;
  const rows=key===currentKey?state.rows:null;
  cancel();currentKey=key;const request=epoch,controller=new AbortController();
  let resolve;const promise=new Promise(r=>resolve=r);
  pending={controller,promise,resolve,timer:null};state={status:'loading',rows,error:null,key};emit();
  const settle=(value,error)=>{
   if(disposed||request!==epoch||!pending)return;
   clearTimeout(pending.timer);pending=null;
   if(!error&&(!Array.isArray(value)||value.some(r=>!r||typeof r.id!=='string')))error=new Error('Unverified list response');
   state={status:error?'error':'ready',rows:error?rows:[...value],error:error||null,key};
   emit();if(error)onError(error);resolve(!error);
  };
  pending.timer=setTimeout(()=>{settle(null,Object.assign(new Error('Read timeout'),{kind:'timeout'}));controller.abort();},timeoutMs);
  try{const result=read({...context,signal:controller.signal});if(result&&typeof result.then==='function')result.then(v=>settle(v,null),e=>settle(null,e||new Error('Read failed')));else settle(result,null);}catch(e){settle(null,e||new Error('Read failed'));}
  return promise;
 }
 return {load,cancel,reset(){cancel();currentKey='';state={status:'idle',rows:null,error:null,key:''};},snapshot:()=>({...state}),dispose(){cancel();disposed=true;state={status:'idle',rows:null,error:null,key:''};}};
}

export function listDataState(snapshot,filteredRows) {
 if(snapshot.status==='loading')return snapshot.rows?.length?'refreshing':'loading';
 if(snapshot.status==='error')return snapshot.rows?.length?'stale':'error';
 if(snapshot.status!=='ready'||!Array.isArray(snapshot.rows))return 'loading';
 return !snapshot.rows.length?'empty':!filteredRows.length?'no-results':'ready';
}
