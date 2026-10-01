// Read identity/cancellation belongs to the data layer, never to animation.
// Supports the current synchronous fixture and future promise-based read adapters.
export function createLookupReadOwner({onCommit=()=>{}}={}){
 const current=new Map(),cache=new Map();let disposed=false,sequence=0;
 const empty=()=>({items:[],totals:{}});
 function cancel(){for(const request of current.values())request.abort.abort();current.clear();sequence++;}
 function invalidate(){cancel();}
 function read(kind,key,load){
  if(disposed)return {...empty(),error:'Nguồn đọc đã đóng.'};
  if(current.get(kind)?.key===key)return current.get(kind).value;
  current.get(kind)?.abort.abort();
  const request={id:++sequence,key,abort:new AbortController(),value:{...(cache.get(key)||empty()),loading:true,stale:cache.has(key)}};
  current.set(kind,request);
  const accepted=()=>!disposed&&!request.abort.signal.aborted&&current.get(kind)===request;
  function settle(result,notify){
   if(!accepted())return;
   if(!result||!Array.isArray(result.items))result={error:'Phản hồi dữ liệu chưa hợp lệ.',items:[]};
   if(result.error)request.value={...(cache.get(key)||empty()),error:result.error,stale:cache.has(key),loading:false};
   else{request.value={...result,loading:false};cache.set(key,request.value);if(cache.size>32)cache.delete(cache.keys().next().value);}
   if(notify)onCommit(kind,key,request.value);
  }
  try{const result=load(request.abort.signal);if(result?.then)Promise.resolve(result).then(value=>settle(value,true),()=>settle({error:'Không tải được dữ liệu. Vui lòng thử lại.',items:[]},true));else settle(result,false);}
  catch{settle({error:'Không tải được dữ liệu. Vui lòng thử lại.',items:[]},false);}
  return request.value;
 }
 return {read,invalidate,cancel,dispose(){disposed=true;cancel();cache.clear();}};
}
