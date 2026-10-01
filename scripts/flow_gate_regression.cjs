// Re-run existing assertions without overwriting historical evidence.
const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname, '..');
process.chdir(root);
const suites = [
  ['P01', 'check_flow_audit.cjs'],
  ['P02', 'check_home_recent.cjs'],
  ['P03', 'check_dialogs.cjs'],
  ['P04', 'check_inbound.cjs'],
  ['P05', 'check_outbound_lifecycle.cjs'],
  ['P06', 'check_lookup_recent_edges.cjs'],
  ['P07', 'check_nfc_r13.cjs'],
  ['P08', 'check_history_r23.cjs'],
  ['P09', 'check_warranty_navigation.cjs'],
  ['P10', 'check_profile_stability.cjs'],
  ['P11', 'check_security_live_preview.cjs'],
  ['P12', 'check_documents_tabs.cjs'],
  ['P13', 'check_notification_detail_nav.cjs'],
  ['P14', 'check_p14_audit_r06.cjs'],
  ['P15', 'check_p15_navigation_r03.cjs'],
  ['P16', 'check_p16_r03.cjs'],
  ['P17', 'check_p17_navigation_r03.cjs'],
  ['P18', 'check_p18_r03_edges.cjs'],
  ['P19', 'check_p19.cjs'],
  ['P20', 'run_p24_r03.cjs', 'regression', 'check_p20.cjs'],
  ['P21', 'run_p24_r03.cjs', 'regression', 'check_p21.cjs'],
  ['P22', 'run_p22_r03.cjs', 'check_p22.cjs'],
  ['P23', 'run_p24_r03.cjs', 'regression', 'check_p23.cjs'],
  ['P24', 'run_p24_r03.cjs', 'check_p24.cjs'],
];
const runId = process.env.FLOW_RUN_ID || 'initial';
const evidence = path.join(root, 'handoff/flow/evidence', runId === 'initial' ? '' : runId);
fs.mkdirSync(evidence, {recursive: true});
if (process.argv[2] === '--worker') {
  const [board, name, ...args] = process.argv.slice(3);
  const out = `${path.relative(root,evidence).replaceAll('\\','/')}/regression/${board}`;
  fs.mkdirSync(out, {recursive: true});
  require('./flow_gate_browser_coverage.cjs')(require(process.env.PLAYWRIGHT_MODULE||'C:/Users/TAN MIE/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright').chromium,path.join(evidence,board+'-observed-panels.json'));
  const adapt = code => code.replace(/handoff\/(?:P\d+|stability-2026-09-28|ux-[^/'"`]+)\/[^'"`\r\n]*/g, match => `${out}/${match.slice(8)}`);
  const localRequire = createRequire(path.join(root, 'scripts', name));
  const reader = n => n === 'node:fs' ? {...fs, writeFileSync(file, ...options) {
    fs.mkdirSync(path.dirname(path.resolve(file)), {recursive:true});
    return fs.writeFileSync(file,...options);
  }, readFileSync(file, ...options) {
    const data = fs.readFileSync(file, ...options);
    return typeof data === 'string' && String(file).startsWith('scripts/') ? adapt(data) : data;
  }} : localRequire(n);
  process.argv = [process.execPath, path.join(root, 'scripts', name), ...args];
  process.env.P14_AUDIT_STAGE = 'after';
  new Function('require', 'process', '__dirname', adapt(fs.readFileSync(`scripts/${name}`, 'utf8')))(reader, process, path.join(root, 'scripts'));
} else {
  (async () => {
    const selected = process.argv.slice(2);
    const results = [];
    for (const suite of suites.filter(s => !selected.length || selected.includes(s[0]))) {
      const log = path.join(evidence, `${suite[0]}-regression.log`);
      const stream = fs.createWriteStream(log);
      const started = new Date().toISOString();
      const child = spawn(process.execPath, [__filename, '--worker', ...suite], {cwd: root, windowsHide: true});
      child.stdout.pipe(stream); child.stderr.pipe(stream);
      const code = await new Promise(resolve => child.on('close', resolve));
      await new Promise(resolve => stream.end(resolve));
      results.push({board: suite[0], command: suite.slice(1), exit_code: code, started, finished: new Date().toISOString(), log: path.relative(root, log).replaceAll('\\', '/')});
      fs.writeFileSync(path.join(evidence, 'regression-runs.json'), JSON.stringify(results, null, 2));
      console.log(`${suite[0]} exit=${code} ${suite[1]}`);
    }
    process.exitCode = results.some(r => r.exit_code !== 0) ? 1 : 0;
  })().catch(error => {console.error(error); process.exitCode = 1;});
}
