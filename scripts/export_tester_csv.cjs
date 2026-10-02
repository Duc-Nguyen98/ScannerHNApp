const fs=require('node:fs');
const path=require('node:path');
const dir=path.resolve(__dirname,'../handoff/tester-dataset-2026-10-02');
const cell=value=>`"${String(value??'').replaceAll('"','""').replaceAll('\r',' ').replaceAll('\n',' ')}"`;
const csv=rows=>rows.map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
const boards=Array.from({length:24},(_,i)=>`P${String(i+1).padStart(2,'0')}`).map(board=>JSON.parse(fs.readFileSync(path.join(dir,board+'.json'),'utf8')));
const panels=[['board','panel_id','title','disposition','data_ref','permission_ids','rule_ids']];
const cases=[['case_id','panel_id','board','type','actor_id','role','status','rule_ids','setup','expected']];
const roles=[['role','label','scope','permission','grant']];
for(const board of boards){for(const panel of board.panels){const map=board.mapping[panel.id];panels.push([board.board,panel.id,panel.title,panel.disposition,map.dataRef,map.permissionIds.join('|'),map.ruleIds.join('|')]);}for(const test of board.testCases)cases.push([test.id,test.panelId,board.board,test.type,test.actorId,test.role,test.status,test.ruleIds.join('|'),test.setup,test.expected]);}
const rbac=JSON.parse(fs.readFileSync(path.join(dir,'RBAC_CATALOG.json'),'utf8'));
for(const [role,def] of Object.entries(rbac.roles))for(const permission of rbac.permissionCatalog.map(p=>p.id))roles.push([role,def.label,def.scope,permission,def.allow.includes(permission)?'allow':'deny']);
for(const [name,rows] of [['PANEL_INDEX.csv',panels],['TEST_CASE_INDEX.csv',cases],['RBAC_ROLE_PERMISSION.csv',roles]])fs.writeFileSync(path.join(dir,name),csv(rows),'utf8');
console.log(JSON.stringify({panelRows:panels.length-1,caseRows:cases.length-1,rbacRows:roles.length-1},null,2));
