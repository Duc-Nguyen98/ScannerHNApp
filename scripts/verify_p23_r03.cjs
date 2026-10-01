const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const dir='handoff/P23',base=dir+'/evidence/revision-03',json=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const run=json('RUN_STATE.json'),local=json(dir+'/RUN_STATE.json');
assert.equal(run.current_prompt,'P23');assert.equal(run.revision,'P23-r03');assert.equal(local.revision,'P23-r03');
assert.equal(local.visual,'AWAITING_USER_REVIEW');assert.equal(local.integration,'BLOCKED_PRODUCTION');
for(const id of local.completed_panel_ids){assert.ok(run.implemented_panel_ids.includes(id));assert.ok(!run.remaining_panel_ids.includes(id));}
const rows=fs.readFileSync('SCREEN_COVERAGE.csv','utf8').trim().split(/\r?\n/).slice(1);
assert.equal(rows.length,91);assert.equal(new Set(rows.map(l=>l.split(',')[0])).size,24);
const p23=rows.filter(l=>l.startsWith('"P23",'));assert.equal(p23.length,4);assert.ok(p23.every(l=>l.includes('revision-03')));
const review=fs.readFileSync(dir+'/REVIEW_03.html','utf8');let links=0;
for(const m of review.matchAll(/(?:src|href)="([^"#]+)"/g)){if(/^https?:/.test(m[1]))continue;assert.ok(fs.existsSync(path.resolve(dir,m[1])),m[1]);links++;}
const counts={};for(const [label,file]of Object.entries({main:'regression/after/results.json',edges:'regression/edges/results.json',ux:'ux/results.json',guards:'guards/results.json',p22:'regression/p22/after/results.json',p20:'regression/p20/after/results.json',p09:'regression/p09/navigation-results.json',footer:'regression/footer/results.json'})){
 const data=json(base+'/'+file);assert.deepEqual(data.errors,[]);assert.ok(data.checks.every(c=>c.status==='PASS'));counts[label]=data.checks.length;
}
assert.equal(Object.entries(counts).filter(([k])=>k!=='footer').reduce((n,[,v])=>n+v,0),53);assert.equal(counts.footer,4);
const layouts=['regression/after/layout.json','regression/edges/layout-long.json','ux/layout.json','guards/layout.json'].map(f=>json(base+'/'+f).length);assert.deepEqual(layouts,[20,10,10,10]);
const logic=fs.readFileSync(base+'/regression/logic.txt','utf8');assert.match(logic,/tests 149/);assert.match(logic,/pass 149/);assert.match(logic,/fail 0/);
for(const f of local.artifact_paths)assert.ok(fs.existsSync(f),f);
const before=json(base+'/before/source/RUN_STATE.json');assert.deepEqual(run.p23_revision_r02,before.p23_revision_r02);assert.deepEqual(run.p23_revision_r01,before.p23_revision_r01);
const prior=json(base+'/before/audit.json'),audit=json(base+'/after/audit.json');assert.equal(prior.filter(r=>r.status==='FAIL').length,13);assert.equal(audit.length,14);assert.ok(audit.every(r=>r.status==='PASS'));counts.audit=audit.length;assert.equal(Object.entries(counts).filter(([k])=>k!=='footer').reduce((n,[,v])=>n+v,0),67);
const raster=json(base+'/header-after/results.json');assert.equal(raster.length,4);assert.ok(raster.every(r=>r.status==='PASS'));
const baseline='evidence/revision-01/baseline/B23.png';assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(dir+'/'+baseline)).digest('hex').toUpperCase(),'DDF7AE5493B7932184808EEF684B9406D2CEA88C074D7D8D64CFE7D298F97F09');
const result={status:'PASS',boards:24,panels:91,counts,logic:149,layouts,localLinks:links,visual:local.visual,integration:local.integration};fs.writeFileSync(base+'/handoff-verification.json',JSON.stringify(result,null,2));console.log(result);
