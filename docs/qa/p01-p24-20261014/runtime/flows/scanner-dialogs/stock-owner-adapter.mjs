import {createDialogFixtureAdapter, DIALOG_NAMESPACE} from './fixture-adapter.mjs';
import {pendingStockRun} from '../shared/flow-guidance.mjs';

// A projection of the existing owner, never an import of legacy PN display IDs.
export function createStockDialogAdapter({getState, getOwner, getOperation}) {
  const fixture = createDialogFixtureAdapter();
  const saved = new Map();
  const fingerprint = s => JSON.stringify([s.document, s.accepted, s.attempts, s.request, s.recorded, s.unknown, s.busy]);
  function project(operation) {
    const s = getOwner(operation)?.snapshot();
    const d = s?.mode==='source-linked'&&!s.recorded?s.document:pendingStockRun(operation, s, getState()?.session)?.document;
    if (!d || !Array.isArray(s.accepted) || (s.mode!=='source-linked'&&!s.attempts?.length&&!s.request&&!d.note)) return null;
    const ownerFingerprint = fingerprint(s);
    return {
      namespace:DIALOG_NAMESPACE, serverLinked:s.mode==='source-linked', sourceDocumentId:s.source?.source_document_id, sourceVersion:s.source?.source_version, draftId:s.draftId, ownerBacked:true, ownerFingerprint,
      actorId:d.actorId, warehouseId:d.warehouseId, documentId:s.mode==='source-linked'?s.draftId:d.documentId,
      scanSessionId:d.scanSessionId, version:s.mode==='source-linked'?s.draftVersion:d.version, operation,
      codes:s.accepted.map(row=>row.raw), localOnly:s.mode!=='source-linked'&&!s.request&&!s.recorded,
      serverRecorded:s.recorded===true, posted:false, uncertain:s.unknown||s.busy||!!s.pending,
      unsaved:s.mode==='source-linked'?true:saved.get(d.documentId)!==ownerFingerprint,
    };
  }
  function current(doc) {
    const latest=project(doc?.operation);
    return doc?.ownerBacked && latest?.documentId===doc.documentId && latest.ownerFingerprint===doc.ownerFingerprint ? latest : null;
  }
  return {
    ...fixture,
    pendingDocument() { return project(getOperation()); },
    refreshDocument(doc) { return doc?.ownerBacked ? project(doc.operation) : doc; },
    canResume(doc) { return !doc?.ownerBacked || !!current(doc); },
    canDiscardLocal(doc) { if(doc?.serverLinked)return false;return doc?.ownerBacked ? !!current(doc)&&fixture.canDiscardLocal(doc) : fixture.canDiscardLocal(doc); },
    discardLocal(doc) {
      if (!doc?.ownerBacked) return true;
      if (!current(doc)) return false;
      const result=getOwner(doc.operation)?.discardPreview(doc.ownerFingerprint);
      if(result)saved.delete(doc.documentId);
      return result===true;
    },
    isOperationUnknown(doc){const s=getOwner(doc?.operation)?.snapshot();return !!(s?.pending||s?.unknown||s?.busy);},
    async discardServer(doc){if(!doc?.serverLinked||!current(doc)||doc.uncertain)return false;return getOwner(doc.operation)?.discardServer(doc.ownerFingerprint);},
    async checkSave(doc){if(!doc?.serverLinked)return fixture.checkSave(doc);const owner=getOwner(doc.operation);await owner?.check();const projected=project(doc.operation);if(!owner?.snapshot().source&&!owner?.snapshot().pending)return {kind:'server-cancelled',document:doc};return projected&&!projected.uncertain?{kind:'server-saved',document:projected}:{kind:'unknown'};},
    async saveDraft(doc) {
      if (!doc?.ownerBacked) return fixture.saveDraft(doc);
      if(doc.serverLinked){if(!current(doc))return {kind:'failed'};const owner=getOwner(doc.operation),ok=await owner?.save();return ok?{kind:'server-saved',document:project(doc.operation)}:{kind:owner?.snapshot().unknown?'unknown':'failed'};}
      if (!current(doc)||doc.uncertain||doc.serverRecorded) return {kind:'failed'};
      saved.set(doc.documentId,doc.ownerFingerprint);
      return {kind:'fixture-saved',document:{...doc,unsaved:false}};
    },
  };
}
