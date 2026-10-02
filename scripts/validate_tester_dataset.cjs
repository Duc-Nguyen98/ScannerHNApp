const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'handoff','tester-dataset-2026-10-02');
const read=file=>JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
const manifest=read('MANIFEST.json'),catalog=read('RBAC_CATALOG.json');
const checks=[];
assert.equal(manifest.boards.length,24);checks.push('24 board files present');
const boardFiles=manifest.boards.map(row=>row.file);assert.deepEqual(boardFiles.sort(),Array.from({length:24},(_,i)=>`P${String(i+1).padStart(2,'0')}.json`));checks.push('P01-P24 file names complete');
const allPanels=[],allCases=[];
for(const file of boardFiles){
 const data=read(file);assert.match(data.board,/^P(?:0[1-9]|1[0-9]|2[0-4])$/);assert.equal(data.panels.length,data.panelCount);assert.equal(data.mapping&&Object.keys(data.mapping).length,data.panelCount);assert.equal(data.testCases.length,data.panelCount*4);
 for(const panel of data.panels){assert.ok(!allPanels.includes(panel.id),`duplicate panel ${panel.id}`);allPanels.push(panel.id);assert.ok(data.mapping[panel.id]);assert.equal(data.mapping[panel.id].caseIds.length,4);}
 for(const test of data.testCases){assert.ok(!allCases.includes(test.id),`duplicate case ${test.id}`);allCases.push(test.id);assert.ok(data.mapping[test.panelId].caseIds.includes(test.id));assert.ok(test.ruleIds.length);}
 assert.ok(data.permissions.used.length);assert.equal(Object.keys(data.permissions.matrix).length,Object.keys(catalog.roles).length);assert.ok(data.sourceRefs.length);
}
assert.equal(allPanels.length,91);checks.push('91 unique panel IDs mapped');assert.equal(allCases.length,364);checks.push('364 test cases mapped 4 per panel');
const allPermissions=new Set(catalog.permissionCatalog.map(p=>p.id));for(const board of manifest.boards){const data=read(board.file);for(const id of data.permissions.used)assert.ok(allPermissions.has(id),`unknown permission ${id}`);}checks.push('All board permissions resolve to catalog');
assert.equal(catalog.scopes.find(s=>s.id==='fixture-hoa-nam').active,true);assert.ok(catalog.rules.length>=15);checks.push('Scope and global rules present');
const csvRows=name=>fs.readFileSync(path.join(dir,name),'utf8').trim().split(/\r?\n/);assert.equal(csvRows('PANEL_INDEX.csv').length,92);assert.equal(csvRows('TEST_CASE_INDEX.csv').length,365);assert.equal(csvRows('RBAC_ROLE_PERMISSION.csv').length,361);checks.push('CSV indexes cover panels, cases and role permissions');
const result={status:'PASS',generatedAt:manifest.generatedAt,build:manifest.build,boards:manifest.boards.length,panels:allPanels.length,testCases:allCases.length,permissions:manifest.permissions,checks};
fs.writeFileSync(path.join(dir,'VALIDATION.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
