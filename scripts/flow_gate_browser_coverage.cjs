const fs=require('node:fs');
module.exports=function instrument(chromium,file){
  const panels=new Set();
  const write=()=>fs.writeFileSync(file,JSON.stringify({kind:'observed-visible-panel-not-standalone-assertion',panels:[...panels].sort()},null,2));
  write();
  const launch=chromium.launch.bind(chromium);
  chromium.launch=async(...args)=>{
    const browser=await launch(...args),seen=new WeakSet();
    async function attach(page){
      if(seen.has(page))return;seen.add(page);
      page.on('console',msg=>{if(msg.text().startsWith('FLOW_PANEL:')){const id=msg.text().slice(11);if(/^P\d{2}\.S\d{2}$/.test(id)){panels.add(id);write();}}});
      await page.addInitScript(()=>{
        const seen=new Set();let scheduled=false;
        const scan=()=>{scheduled=false;for(const el of document.querySelectorAll('[data-panel], [data-state-panel], [data-history-hub="true"]')){
          const ids=[el.dataset.statePanel,el.dataset.panel,el.dataset.historyHub==='true'?'P22.S01':null].filter(Boolean);
          for(const id of ids)if(!seen.has(id)&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden'){seen.add(id);console.debug('FLOW_PANEL:'+id);}
        }};
        const start=()=>{new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(scan);}}).observe(document.documentElement,{subtree:true,childList:true,attributes:true});scan();};
        if(document.documentElement)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
      });
    }
    const newContext=browser.newContext.bind(browser);
    browser.newContext=async(...args)=>{const context=await newContext(...args),newPage=context.newPage.bind(context);context.newPage=async(...args)=>{const page=await newPage(...args);await attach(page);return page;};return context;};
    const newPage=browser.newPage.bind(browser);
    browser.newPage=async(...args)=>{const page=await newPage(...args);await attach(page);return page;};
    return browser;
  };
};
