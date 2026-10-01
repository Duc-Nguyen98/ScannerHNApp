// Presentation helpers. Never modify the scan audit or accepted quantities.
export function filterAttempts(attempts, filter = 'all') {
  return attempts.map((attempt,index)=>({...attempt,index})).filter(a=>filter==='duplicate'?a.kind==='duplicate':filter==='error'?['invalid','blocked'].includes(a.kind):true).reverse();
}
export const deliveryFields = ['recipient','phone','province','district','address'];
export const deliveryIsValid = errors => !deliveryFields.some(name=>errors[name]);

// Browsers own this prompt's text and may suppress it without prior interaction.
// A draft kept in memory across Home navigation still needs the unload guard.
export function createDraftExitGuard(target) {
  let attached=false;
  const onUnload=event=>{event.preventDefault();event.returnValue='';};
  function update(dirty){if(!!dirty===attached)return;attached=!!dirty;target[attached?'addEventListener':'removeEventListener']('beforeunload',onUnload);}
  return {update,dispose(){update(false);}};
}
