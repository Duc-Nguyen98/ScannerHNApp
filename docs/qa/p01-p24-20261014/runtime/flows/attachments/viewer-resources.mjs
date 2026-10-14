// Used by the existing PDF.js/Blob lifecycle and by the prepared mock reader.
export function createAttachmentResources({urls=URL}={}){const owned=new Set();let epoch=0;
 return {get epoch(){return epoch;},url(blob){const url=urls.createObjectURL(blob);owned.add(url);return url;},clear(){epoch++;for(const url of owned)urls.revokeObjectURL(url);owned.clear();},get count(){return owned.size;}};
}
