export const escapeChoice=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function choiceOptions(name,values,value){
 return '<div class="p08-options">'+values.map(([v,t])=>'<label><input type="radio" name="'+escapeChoice(name)+'" value="'+escapeChoice(v)+'" '+(value===v?'checked':'')+'><span>'+escapeChoice(t)+'</span></label>').join('')+'</div>';
}
