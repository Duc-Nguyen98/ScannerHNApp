import {visiblePanels} from './scenes.mjs';

export function mountFlowViewer({frame,catalog,getCurrentPanel,onChange=()=>{},onOpen=()=>{}}) {
 const $=id=>document.getElementById(id),q=new URLSearchParams(location.search);
 const names=new Map([['P00','Nền tảng chung'],...catalog.panels.map(p=>[p.board,p.boardTitle])]);
 let board=names.has(q.get('flowBoard'))?q.get('flowBoard'):(q.get('panel')||'P01.S01').slice(0,3);
 if(!names.has(board))board='P01';
 let type=q.get('flow')==='data'?'data':'user',follow=q.get('flowFollow')!=='0';
 let opened=q.has('flow')?q.get('flow')!=='closed':q.get('view')==='review'&&matchMedia('(min-width:1200px)').matches;
 let scale=1,fit=true,busy=false,disposed=false,observer=null,raf=0,expected='';
 for(const [id,name]of names)$('flow-board').add(new Option(id+' · '+name,id));
 function params(){return opened?{flow:type,flowBoard:board,flowFollow:follow?'1':'0'}:{flow:'closed'};}
 function size(){if(!$('flow-image').naturalWidth)return;const image=$('flow-image'),viewport=$('flow-viewport');if(fit)scale=Math.min(1,Math.max(.02,(viewport.clientWidth-32)/image.naturalWidth));image.style.width=Math.round(image.naturalWidth*scale)+'px';image.style.height='auto';$('flow-scale').value=Math.round(scale*100)+'%';}
 function resize(){if(opened)size();}
 function reflect(){
  $('flow-pane').hidden=!opened;document.querySelector('main').classList.toggle('with-flow',opened);$('flow-toggle').setAttribute('aria-expanded',String(opened));
  $('flow-board').value=board;$('flow-follow').checked=follow;
  for(const name of ['user','data'])$('flow-'+name).setAttribute('aria-selected',String(type===name));
  $('flow-viewport').setAttribute('aria-labelledby','flow-'+type);
  $('flow-title').textContent=board+' · '+names.get(board);
  $('flow-context').textContent=board==='P00'?'Nền tảng chung, không phải board thứ 25':(follow?'Theo màn đang mở':'Đang xem độc lập')+' · '+(type==='user'?'Thao tác người dùng':'Dòng dữ liệu');
 }
 function links(){const stem='./flows/'+board+'/'+board+'_'+(type==='user'?'User_Flow':'Data_Flow');$('flow-original').href=stem+'.png';$('flow-download').href=stem+'.'+$('flow-format').value;$('flow-download').download=board+'_'+(type==='user'?'User_Flow':'Data_Flow')+'.'+$('flow-format').value;return stem;}
 function render(){
  reflect();const stem=links();if(!opened)return;
  const next=new URL(stem+'.png',location.href).href;if(next===expected){size();return;}
  expected=next;fit=true;$('flow-message').textContent='Đang tải sơ đồ...';$('flow-image').hidden=true;
  $('flow-image').alt=board+' · '+names.get(board)+' · '+(type==='user'?'User Flow':'Data Flow');$('flow-image').src=next;
  $('flow-viewport').scrollTop=0;$('flow-viewport').scrollLeft=0;
 }
 function sync(){
  if(disposed||busy||!follow)return;let ids=[];try{ids=visiblePanels(frame.contentDocument);}catch{return;}
  const wanted=getCurrentPanel(),active=ids.includes(wanted)?wanted:ids.filter(id=>id!=='P02.S01').at(-1)||ids.at(-1);
  if(!active||!names.has(active.slice(0,3)))return;const next=active.slice(0,3);if(next!==board){board=next;render();onChange();}
 }
 function watch(){observer?.disconnect();if(raf)cancelAnimationFrame(raf);try{observer=new MutationObserver(()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;sync();});});observer.observe(frame.contentDocument.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','data-panel','data-state-panel']});sync();}catch{}}
 function open(value){opened=value;render();if(opened){onOpen();requestAnimationFrame(size);}onChange();}
 function zoom(factor){if(!$('flow-image').naturalWidth)return;fit=false;const viewport=$('flow-viewport'),old=scale,cx=(viewport.scrollLeft+viewport.clientWidth/2)/old,cy=(viewport.scrollTop+viewport.clientHeight/2)/old;scale=Math.max(.04,Math.min(2,scale*factor));size();viewport.scrollLeft=cx*scale-viewport.clientWidth/2;viewport.scrollTop=cy*scale-viewport.clientHeight/2;}
 $('flow-toggle').onclick=()=>open(!opened);$('flow-close').onclick=()=>{open(false);$('flow-toggle').focus();};
 $('flow-board').onchange=()=>{board=$('flow-board').value;follow=false;render();onChange();};
 $('flow-follow').onchange=()=>{follow=$('flow-follow').checked;sync();reflect();onChange();};
 function tab(next){type=next;render();onChange();}
 for(const name of ['user','data']){$('flow-'+name).onclick=()=>tab(name);$('flow-'+name).onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'user':e.key==='End'?'data':name==='user'?'data':'user';tab(next);$('flow-'+next).focus();}};}
 $('flow-out').onclick=()=>zoom(1/1.3);$('flow-in').onclick=()=>zoom(1.3);$('flow-fit').onclick=()=>{fit=true;size();$('flow-viewport').scrollLeft=0;};$('flow-format').onchange=links;
 $('flow-viewport').onkeydown=e=>{if(e.target!==$('flow-viewport'))return;if(['+','=','-','0'].includes(e.key)){e.preventDefault();if(e.key==='0'){fit=true;size();}else zoom(e.key==='-'?1/1.3:1.3);}};
 $('flow-image').onload=()=>{if($('flow-image').currentSrc!==expected)return;$('flow-image').hidden=false;$('flow-message').textContent='';size();};
 $('flow-image').onerror=()=>{$('flow-message').textContent='Chưa tải được sơ đồ. Có thể mở ảnh riêng hoặc chọn lại board.';};
 $('flow-version').textContent='Sơ đồ P00–P24 · 91 panel · UI fixture';
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe($('flow-viewport'));frame.addEventListener('load',watch);
 reflect();render();
 return {params,setBusy(value){busy=value;if(!value)sync();},sync,dispose(){disposed=true;observer?.disconnect();resizeObserver.disconnect();if(raf)cancelAnimationFrame(raf);frame.removeEventListener('load',watch);}};
}
