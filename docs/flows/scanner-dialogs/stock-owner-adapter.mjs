import {createDialogFixtureAdapter, DIALOG_NAMESPACE} from './fixture-adapter.mjs';
import {pendingStockRun} from '../shared/flow-guidance.mjs';

// A projection of the existing owner, never an import of legacy PN display IDs.
export function createStockDialogAdapter({getState, getOwner, getOperation}) {
  const fixture = createDialogFixtureAdapter();
  const saved = new Map();
  const fingerprint = s => JSON.stringify([s.document, s.accepted, s.attempts, s.request, s.recorded, s.unknown, s.busy]);
  function project(operation) {
    const s = getOwner(operation)?.snapshot();
    const d = pendingStockRun(operation, s, getState()?.session)?.document;
    if (!d || !Array.isArray(s.accepted) || (!s.attempts?.length&&!s.request&&!d.note)) return null;
    const ownerFingerprint = fingerprint(s);
    return {
      namespace:DIALOG_NAMESPACE, ownerBacked:true, ownerFingerprint,
      actorId:d.actorId, warehouseId:d.warehouseId, documentId:d.documentId,
      scanSessionId:d.scanSessionId, version:d.version, operation,
      codes:s.accepted.map(row=>row.raw), localOnly:!s.request&&!s.recorded,
      serverRecorded:s.recorded===true, posted:false, uncertain:s.unknown||s.busy,
      unsaved:saved.get(d.documentId)!==ownerFingerprint,
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
    canDiscardLocal(doc) { return doc?.ownerBacked ? !!current(doc)&&fixture.canDiscardLocal(doc) : fixture.canDiscardLocal(doc); },
    discardLocal(doc) {
      if (!doc?.ownerBacked) return true;
      if (!current(doc)) return false;
      const result=getOwner(doc.operation)?.discardPreview(doc.ownerFingerprint);
      if(result)saved.delete(doc.documentId);
      return result===true;
    },
    async saveDraft(doc) {
      if (!doc?.ownerBacked) return fixture.saveDraft(doc);
      if (!current(doc)||doc.uncertain||doc.serverRecorded) return {kind:'failed'};
      saved.set(doc.documentId,doc.ownerFingerprint);
      return {kind:'fixture-saved',document:{...doc,unsaved:false}};
    },
  };
}
