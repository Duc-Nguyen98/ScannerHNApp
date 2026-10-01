from pathlib import Path
p=Path('scripts/check_motion_p11.cjs');s=p.read_text(encoding='utf-8')
s=s.replace("if(mode==='off')await p.selectOption('#motion-mode','off');",'')
s=s.replace("await p.click('#start');await p.click('[data-tab=profile]');", "await p.click('#start');await p.locator('#hn-home:visible').waitFor();await p.locator('#home-motion-mode').evaluate(e=>e.closest('details').open=true);await p.selectOption('#home-motion-mode',mode==='off'?'off':'auto');await p.click('[data-tab=profile]');")
s=s.replace('handoff/motion/M11/before/results.json','handoff/motion/M11/before-complete/results.json')
s=s.replace("await p.click('[data-system-demo=expired]');", "await p.locator('[data-system-demo=expired]').evaluate(e=>e.click());")
s=s.replace('.p15-root:not([hidden]),.p15-app','.p15-host:not([hidden]),[data-panel="P15.S02"]')
start=s.index("body+=`\\nexport function createSecurityAdapter(options)")
end=s.index("body+=`\\nconst originalSecurityFactory",start)
s=s[:start]+s[end:]
p.write_text(s,encoding='utf-8')
