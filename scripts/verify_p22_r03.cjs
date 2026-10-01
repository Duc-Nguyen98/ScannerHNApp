const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root='handoff/P22',e=root+'/evidence/revision-03',load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const before=load(e+'/before/audit-results.json'),after=load(e+'/after/audit-results.json');assert.equal(before.total,12);assert.ok(before.checks.every(c=>c.status==='FAIL'&&!c.errors.length));assert.equal(after.passed,12);assert.ok(after.checks.every(c=>c.status==='PASS'&&!c.errors.length));
const results=['regression/after/results.json','regression/edges/results.json','ux-regression/results.json','combinations/results.json'].map(p=>load(e+'/'+p));for(const r of results){assert.ok(r.checks.every(c=>c.status==='PASS'));assert.deepEqual(r.errors,[]);}assert.equal(results.reduce((n,r)=>n+r.checks.length,12),43);
const html=fs.readFileSync(root+'/REVIEW_03.html','utf8');for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(/^https?:/.test(m[1]))continue;assert.ok(fs.existsSync(path.resolve(root,m[1])),m[1]);}
const global=load('RUN_STATE.json'),local=load(root+'/RUN_STATE.json');assert.equal(global.p22_revision_r03.revision,'P22-r03');assert.deepEqual(global.p22_revision_r03,local);assert.equal(local.browser_groups,43);assert.equal(local.node_tests,90);
const coverage=fs.readFileSync('SCREEN_COVERAGE.csv','utf8').trim().split(/\r?\n/);assert.equal(coverage.length-1,91);assert.equal(coverage.filter(l=>l.startsWith('"P22",')).length,4);
const log=fs.readFileSync(e+'/regression/logic/node-tests.txt','utf8');assert.match(log,/pass 90/);assert.match(log,/fail 0/);
console.log('PASS r03 evidence:12 fixed /43 browser groups /90 logic;91 panel IDs;all review assets exist;RUN_STATE consistent.');
