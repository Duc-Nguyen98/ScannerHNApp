export const API_ORIGIN='https://khohoanamdev.lptech.info.vn';
export function requestFromTemplate(row,values){
 if(row.method!=='GET'||row.body)throw Error('Chỉ GET không body');
 const template=row.url.split('?'),fill=s=>s.replace(/\{\{(\w+)\}\}/g,(_,k)=>{const v=String(values[k]||'').trim();if(!v||v.length>2048)throw Error('Thiếu/không hợp lệ: '+k);return v;});
 const path=template[0].replace(/\{\{(\w+)\}\}/g,(_,k)=>{const v=fill('{{'+k+'}}');if(!/^[A-Za-z0-9:_-]{1,200}$/.test(v))throw Error('ID/key phải đúng nguồn');return encodeURIComponent(v);});
 if(!path.startsWith('/api/v1/')||path.includes('..')||path.includes('//'))throw Error('Path không hợp lệ');
 const url=new URL(path,API_ORIGIN);for(const [key,value]of new URLSearchParams(template[1]||''))url.searchParams.set(key,fill(value));
 const headers={Accept:'application/json'};for(const [key,v]of Object.entries(row.headers||{}))headers[key]=fill(v);
 return {url:url.href,method:'GET',headers};
}
export function redact(value){if(Array.isArray(value))return value.map(redact);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,/(token|password|secret|proof|check_token|email|phone|customer|name|address|receiver|auth_session|session_id|cursor|raw_content|before_data|after_data|actor|reason|note|description|message|user_agent|ip_address|download_url)/i.test(k)?(v===null?null:'[REDACTED]'):redact(v)]));return typeof value==='string'&&/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(value)?'[REDACTED]':value;}
export async function runRead(row,values,token,{origin,consent,signal,fetcher=fetch}={}){
 if(origin!==API_ORIGIN)throw Error('Public CORS chưa duyệt: chỉ chạy browser GET trên origin BE hiện tại');
 if(!consent||!token||/\s/.test(token))throw Error('Cần tài khoản/ACCESS token và scope được phép');
 const req=requestFromTemplate(row,values);const response=await fetcher(req.url,{method:'GET',headers:{...req.headers,Authorization:'Bearer '+token,'X-Request-ID':crypto.randomUUID()},credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal});
 const type=response.headers.get('content-type')||'';if(!type.includes('json')){const blob=await response.blob();return {http:response.status,request_id:response.headers.get('x-request-id'),content_type:type,bytes:blob.size,cache_control:response.headers.get('cache-control'),nosniff:response.headers.get('x-content-type-options'),note:'Byte thật đã nhận; chưa kiểm integrity hoặc hiển thị tệp. Không lưu/download tự động.'};}
 return {http:response.status,request_id:response.headers.get('x-request-id'),cache_control:response.headers.get('cache-control'),data:redact(await response.json()),note:'HTTP 200 không tự chứng minh đúng semantics/receipt; xem contract owner. Kết quả chỉ trong bộ nhớ trang.'};
}
