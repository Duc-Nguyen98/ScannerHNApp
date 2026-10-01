import { HOME_NAMESPACE, sessionGuard } from './home-flow.mjs';
import {mergeDocuments,initialFilters,selectDocuments} from '../documents/document-model.mjs';
import {readWarrantyCases,isOpenWarrantyCase} from '../shared/warranty-cases.mjs';
import {recentDocuments} from './recent-documents.mjs';
// Complete local fixtures shared with destination lists; not paged/WMS totals.
export function readHomeFixture(state, { unknown = false, badge = 3, recorded = [] } = {}) {
  if (sessionGuard(state)) return null;
  const rows=mergeDocuments(recorded).filter(r=>r.warehouseId===state.session.warehouse.id);
  return {
    namespace: HOME_NAMESPACE,
    source: unknown ? 'UNKNOWN' : 'SHARED_LOCAL_FIXTURE',
    pendingDocuments: unknown ? null : selectDocuments({...initialFilters(),status:'waiting'},rows).length,
    openWarranties: unknown ? null : readWarrantyCases().filter(r=>r.warehouse===state.session.warehouse.name&&isOpenWarrantyCase(r)).length,
    shiftStartedAt: state.shiftStartedAt ?? null,
    notifications: unknown ? null : badge,
    recent: unknown ? null : recentDocuments(rows),
  };
}
