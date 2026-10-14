import {hashBlobInChunks} from './file-hash.mjs';
self.onmessage=async e=>{try{self.postMessage({sha256:await hashBlobInChunks(e.data.file)});}catch{self.postMessage({error:'FILE_HASH_FAILED'});}};
