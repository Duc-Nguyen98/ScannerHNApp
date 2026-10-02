const fs=require('node:fs'),name=process.argv[2],phase=(name==='regression'?process.argv[4]:process.argv[3])||'after';
if(!['before','after'].includes(phase))throw Error('Invalid phase');
let code=fs.readFileSync('scripts/'+(name==='regression'?'run_p24_regression.cjs':name),'utf8').replaceAll('handoff/P24/evidence/revision-01','handoff/P24/evidence/revision-02/'+phase);
if(name==='check_p24.cjs'&&phase==='after')code=code.replace("await a(pre,'history').click();await p.waitForSelector('.p08-app');",`assert.match(await a(pre,'document').innerText(),new RegExp(s.document.number));assert.ok((await a(pre,'document').getAttribute('class')).includes('primary'));assert.equal(await p.locator('.hn-waiting-steps li').count(),2);assert.match(await p.locator('.hn-waiting-steps li[aria-current=step]').textContent(),/Chờ xử lý trên Web/);await a(pre,'document').click();await p.waitForSelector('.p12-app');assert.equal(new URLSearchParams(p.url().split('?').pop()).get('doc'),s.document.documentId);await p.goBack();await p.waitForSelector('.hn-waiting-web');assert.equal((await snap(pre)).document.documentId,s.document.documentId);await a(pre,'history').click();await p.waitForSelector('.p08-app');`);
if(name==='regression'){
 process.argv[2]=process.argv[3];
 // User moved the closed-case notice out of the footer; keep the same assertion
 // on its new visible location, retaining all closed mutation/route guards.
 if(process.argv[2]==='check_p20.cjs')code=code.replace("new Function('require','process',code)",`code=code.replace("p.locator('.p20-footer').innerText()","p.locator('.p24-closed-note').innerText()");new Function('require','process',code)`);
}
new Function('require','process',code)(require,process);
