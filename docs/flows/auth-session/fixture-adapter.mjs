import {createDraftRetention} from '../recovery-shift/draft-retention.mjs';
// PREVIEW ONLY. These local outcomes/fields are not a proposed server schema.
import {createPreviewAccountStore} from './preview-account-store.mjs';
export const FIXTURE_NAMESPACE = 'hn-scanner-auth-preview-v1';
export function createFixtureAdapter({ scenario = 'valid', delay = 450, now = Date.now } = {}) {
  let current = null;
  let shiftStartedAt = null;
  let generation = 0;
  const securityStore = createPreviewAccountStore();
  const draftRetention=createDraftRetention();
  const closeCurrent = () => {if(current)securityStore.closeSession(current.actor.id,current.authSessionId);current=null;shiftStartedAt=null;};
  const wait = () => new Promise(resolve => setTimeout(resolve, delay));
  return {
    securityStore,draftRetention,
    async authenticate({ username, password }) {
      const requestGeneration = generation;
      await wait();
      if (requestGeneration !== generation) return { kind: 'rejected' };
      if (scenario === 'auth-unknown') return { kind: 'unknown' };
      // Exact fixture match only. Never normalize a production credential here.
      const actorId=scenario==='other-user'?'fixture-lan':'fixture-minhanh';
      if (username !== 'minhanh' || !securityStore.matches(actorId,password)) return { kind: 'rejected' };
      closeCurrent();
      current = Object.freeze({
        namespace: FIXTURE_NAMESPACE,
        authSessionId: securityStore.openSession(actorId),
        actor: Object.freeze(scenario === 'other-user'
          ? { id: 'fixture-lan', name: 'Lan Nguyễn', initials: 'LN', role: 'Nhân viên kho' }
          : { id: 'fixture-minhanh', name: 'Minh Anh', initials: 'MA', role: 'Nhân viên kho' }),
        warehouse: Object.freeze({ id: 'fixture-hoa-nam', name: 'Kho Hoa Nam', active: scenario !== 'warehouse-stopped' }),
        permissions: Object.freeze({ warehouseOperations: scenario !== 'denied' }),
      });
      return { kind: 'authenticated', session: current };
    },
    isValid(session) { return !!session && session === current && securityStore.isActive(session.actor.id,session.authSessionId); },
    async startShift(session) {
      await wait();
      if (!session || session !== current || !securityStore.isActive(session.actor.id,session.authSessionId)) return { kind: 'expired' };
      if (scenario === 'expired') { closeCurrent(); return { kind: 'expired' }; }
      if (session.warehouse.active !== true || session.permissions.warehouseOperations !== true) return { kind: 'denied' };
      if (scenario === 'start-unknown') return { kind: 'unknown' };
      // Fixture confirmation timestamp, generated only after all successful checks.
      // Return the same receipt when the same authenticated session asks again.
      shiftStartedAt ??= new Date(now()).toISOString();
      return { kind: 'preview-ready', startedAt: shiftStartedAt }; // NOT a production shift response.
    },
    logout() { generation += 1; closeCurrent(); },
  };
}
