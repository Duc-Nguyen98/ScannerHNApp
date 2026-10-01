// Replay existing FLOW_GATE assertions in three explicit motion modes.
const fs=require('node:fs');const mode=process.argv[2]||'auto';if(!['auto','os-reduced','off'].includes(mode))throw Error('Invalid mode');
process.env.FLOW_JOURNEY_DIR='handoff/motion/M24/release/'+mode;
let code=fs.readFileSync('scripts/check_flow_gate.cjs','utf8');
code=code.replace("timezoneId:'Asia/Ho_Chi_Minh'","timezoneId:'Asia/Ho_Chi_Minh',reducedMotion:"+JSON.stringify(mode==='os-reduced'?'reduce':'no-preference'));
const setMode=`await p.locator('#motion-mode').evaluate(e=>{e.value=${JSON.stringify(mode==='off'?'off':'auto')};e.dispatchEvent(new Event('change'));});`;
code=code.replace("await p.fill('#username','minhanh');",setMode+"await p.fill('#username','minhanh');");
code=code.replace("await p.reload();await p.locator('#login-form').waitFor();", "await p.reload();await p.locator('#login-form').waitFor();"+setMode);
code=code.replace('  const errors=[],external=[],routes=[];',`  const errors=[],external=[],routes=[],networkWrites=[];await context.tracing.start({screenshots:true,snapshots:true,sources:true});p.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))networkWrites.push({method:r.method(),url:r.url()});});`);
code=code.replace("assert.deepEqual(errors,[]);assert.deepEqual(external,[]);checks.push", "assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(networkWrites,[]);checks.push");
code=code.replace('finally{await context.close();','finally{await context.tracing.stop({path:path.join(out,id+\'-trace.zip\')});await context.close();');
new Function('require','process',code)(require,process);
