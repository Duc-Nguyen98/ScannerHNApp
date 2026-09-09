import {writeFileSync,mkdirSync} from 'node:fs';import assert from 'node:assert/strict';
const luminance=hex=>{const c=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
const checks=[];
// All possible gradients are convex blends of these endpoints. The tinted corner
// #DCECF1 is the darkest surface behind heading/brand text; cards are solid white.
for(const [foreground,background,use]of [['193b49','dcecf1','Heading on darkest gradient stop'],['426875','dcecf1','Subtitle on darkest stop'],['426875','dcecf1','Brand caption on darkest stop'],['ffffff','0c6286','Primary CTA and brand icon'],['526f7c','ffffff','Supporting copy'],['607680','fafcfc','Placeholder'],['a12f35','ffffff','Inline validation'],['70431f','fff4ed','Suspended/error message'],['0c5d7d','edf5f8','Warehouse active status']]){const a=luminance(foreground),b=luminance(background),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert.ok(ratio>=4.5);checks.push({foreground:'#'+foreground,background:'#'+background,use,ratio:+ratio.toFixed(2),result:'PASS AA normal text'});}
mkdirSync('artifacts/scanner-entry-ui/after',{recursive:true});writeFileSync('artifacts/scanner-entry-ui/after/contrast.json',JSON.stringify(checks,null,2));console.log(checks);
