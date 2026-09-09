import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=resolve('work/scanner-pages/app-scanner');const prefix='/WMS_UIUX_HoaNamv2/app-scanner';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
http.createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;if(!pathname.startsWith(prefix))throw Error();const rel=decodeURIComponent(pathname.slice(prefix.length))||'/';const file=resolve(root,'.'+(rel==='/'?'/index.html':rel));if(!file.startsWith(root+sep))throw Error();res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404);res.end('Not found');}}).listen(4174,'127.0.0.1',()=>console.log('Scanner static QA at http://127.0.0.1:4174'+prefix+'/'));
