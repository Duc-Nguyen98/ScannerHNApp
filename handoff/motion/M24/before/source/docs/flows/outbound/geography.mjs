export const GEOGRAPHY_VERSION = 'provinces.open-api.vn/v1-before-2025-07';
export function createGeographyClient({fetcher = (...args)=>fetch(...args), timeoutMs = 8000} = {}) {
  const cache=new Map(),pending=new Map();
  async function load(key,path,parse){
    if(cache.has(key))return structuredClone(cache.get(key));if(pending.has(key))return pending.get(key);
    const task=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
      try{const response=await fetcher(`https://provinces.open-api.vn/api/v1/${path}`,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error('Không tải được địa giới.');const rows=parse(await response.json());if(!Array.isArray(rows)||!rows.length||rows.some(r=>!Number.isInteger(r.code)||typeof r.name!=='string'||!r.name.trim()))throw Error('Dữ liệu địa giới không hợp lệ.');const values=rows.map(r=>({id:String(r.code),name:r.name,...(r.province_code!==undefined?{provinceId:String(r.province_code)}:{})}));if(new Set(values.map(v=>v.id)).size!==values.length)throw Error('Mã địa giới bị trùng.');cache.set(key,values);return structuredClone(values);}finally{clearTimeout(timer);pending.delete(key);}})();pending.set(key,task);return task;
  }
  return {
    cachedProvinces:()=>structuredClone(cache.get('provinces')||[]),
    cachedDistricts:id=>structuredClone(cache.get(`districts-${id}`)||[]),
    provinces:()=>load('provinces','',data=>data),
    districts:id=>{if(!cache.get('provinces')?.some(p=>p.id===id))return Promise.reject(Error('Tỉnh không hợp lệ.'));return load(`districts-${id}`,`p/${id}?depth=2`,data=>{if(String(data.code)!==id||!Array.isArray(data.districts)||data.districts.some(d=>String(d.province_code)!==id))throw Error('Quận/huyện không thuộc tỉnh.');return data.districts;});},
  };
}
