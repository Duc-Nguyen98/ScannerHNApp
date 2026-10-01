// Presentation boundary only. No new WMS API, permissions or mutation retry.
export function classifySystemError(error) {
  if (error?.status === 401 || error?.kind === 'expired') return 'expired';
  if (error?.status === 403 || error?.kind === 'forbidden') return 'forbidden';
  if (error?.kind === 'network' || error?.kind === 'unknown') return 'connection';
  if (error?.kind === 'device') return 'device';
  return null; // Do not mislabel validation/500/programming failures as offline.
}

export function createReadRetry({read, isActive = () => true}) {
  let busy = false, epoch = 0;
  return {
    get busy() { return busy; },
    cancel() { epoch++; busy = false; },
    async run() {
      if (busy || !isActive()) return {kind:'ignored'};
      if (typeof read !== 'function') return {kind:'unavailable'};
      const ticket = ++epoch; busy = true;
      try {
        const result = await read();
        if(ticket !== epoch || !isActive())return {kind:'ignored'};
        const panel=classifySystemError(result);
        return ['expired','forbidden'].includes(panel)?{kind:'failed',panel}:result ?? {kind:'unknown'};
      } catch (error) {
        return ticket === epoch && isActive() ? {kind:'failed', panel:classifySystemError(error)} : {kind:'ignored'};
      } finally { if (ticket === epoch) busy = false; }
    },
  };
}

export function deviceError(error) {
  if (['NotAllowedError','SecurityError'].includes(error?.name)) return 'denied';
  if (['NotSupportedError'].includes(error?.name)) return 'unsupported';
  return 'hardware-error';
}

// Capability presence is not proof of functioning hardware. Never inspect UA/model.
export function createDeviceAccess(env = globalThis) {
  const media = env.navigator?.mediaDevices;
  let camera = env.isSecureContext && typeof media?.getUserMedia === 'function' ? 'not-requested' : 'unsupported';
  let nfc = env.isSecureContext && typeof env.NDEFReader === 'function' ? 'not-requested' : 'unsupported';
  let pending = false;
  return {
    snapshot: () => ({camera,nfc,pending}),
    reportFailure(type,error,{fixture=false}={}) {
      if(fixture||!['camera','nfc'].includes(type))return false;
      if(type==='camera')camera=deviceError(error);else nfc=deviceError(error);
      return true;
    },
    async requestCamera() {
      if (pending || camera === 'unsupported') return camera;
      pending = true;
      let stream;
      try {
        stream = await media.getUserMedia({video:true,audio:false});
        const tracks = stream.getVideoTracks();
        camera = tracks.some(t => t.readyState === 'live') ? 'granted' : 'hardware-error';
      } catch (error) { camera = deviceError(error); }
      finally {
        // Release every track even if validation or another track's cleanup fails.
        try { for(const track of stream?.getTracks()||[])try{track.stop();}catch{camera='hardware-error';} }
        catch { camera='hardware-error'; }
        pending = false;
      }
      return camera;
    },
  };
}

export const DEVICE_COPY = Object.freeze({
  'not-requested':'Chưa yêu cầu quyền', denied:'Chưa cho phép', unsupported:'Không khả dụng trên thiết bị này',
  'hardware-error':'Chưa truy cập được thiết bị', granted:'Đã cho phép camera',
});
