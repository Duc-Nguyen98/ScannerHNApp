// PREVIEW ONLY: internal fixture fields/results, not server schema or permissions.
export const DIALOG_NAMESPACE = 'hn-scanner-dialog-preview-v1';
export function createDialogFixtureAdapter({ delay = 450 } = {}) {
  let warehouseOverride;
  let saveOutcome = 'confirmed';
  let saved = null;
  let receipt = null;
  let fixtureGeneration = 0;
  return {
    namespace: DIALOG_NAMESPACE,
    warehouseActive(state) { return warehouseOverride === undefined ? state?.session?.warehouse?.active : warehouseOverride; },
    setWarehouse(active) { warehouseOverride = active; },
    setSaveOutcome(outcome) { saveOutcome = outcome; },
    contactChannel: null, // No invented administrator address, no automatic message.
    makeDocument(state, kind = 'local') {
      return {
        namespace: DIALOG_NAMESPACE, actorId: state.session.actor.id, warehouseId: state.session.warehouse.id,
        documentId: 'PN-0001', scanSessionId: `fixture-p03-scan-${String(++fixtureGeneration).padStart(2, '0')}`, version: 1, operation: 'inbound',
        codes: ['FIXTURE-HN-0001', 'FIXTURE-HN-0002'],
        localOnly: kind === 'local', serverRecorded: kind === 'server', posted: kind === 'posted',
        uncertain: kind === 'unknown', unsaved: true,
      };
    },
    canDiscardLocal(doc) {
      return doc?.namespace === DIALOG_NAMESPACE && doc.localOnly === true && doc.unsaved === true
        && doc.serverRecorded === false && doc.posted === false && doc.uncertain === false;
    },
    async saveDraft(doc) {
      const outcome = saveOutcome;
      await new Promise(resolve => setTimeout(resolve, delay));
      if (outcome === 'unknown') { receipt = null; return { kind: 'unknown' }; }
      if (outcome === 'failed') return { kind: 'failed' };
      saved = structuredClone({ ...doc, unsaved: false });
      receipt = { kind: 'fixture-saved', document: structuredClone(saved) };
      return structuredClone(receipt);
    },
    async checkSave() { return receipt ? structuredClone(receipt) : { kind: 'unknown' }; },
    savedDocument() { return saved ? structuredClone(saved) : null; },
  };
}
