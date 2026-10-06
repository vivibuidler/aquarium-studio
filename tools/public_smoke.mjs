import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const url=process.env.AQUARIUM_URL||'http://127.0.0.1:8765';
const browser=await chromium.launch({...(process.env.AQUARIUM_CHROME?{executablePath:process.env.AQUARIUM_CHROME}:{}),headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(url);await page.waitForFunction(()=>window.aquarium?.worlds[0]);
 const manifest=await (await page.request.get(url+'/data/plans.json')).json();const counts=[],links=[];
 for(const [i,p] of manifest.plans.entries()){
  await page.locator('.plan-button').nth(i).click();await page.waitForFunction(id=>window.aquarium.worlds[0].plan.id===id,p.id);
  const actual=await page.evaluate(()=>window.aquarium.worlds[0].agents.reduce((m,a)=>(m[a.species.scientificName]=(m[a.species.scientificName]||0)+1,m),{}));assert.deepEqual(actual,Object.fromEntries(p.groups.map(g=>[g.species,g.count])));counts.push({id:p.id,actual});
  const anchors=await page.locator('#plan-notes a[href^="/references/"]').evaluateAll(as=>as.map(a=>a.href));assert.equal(anchors.length,2);for(const href of anchors){const res=await page.request.get(href);assert.equal(res.status(),200,href);links.push(new URL(href).pathname);}
 }
 await page.locator('.plan-button').nth(1).click();await page.locator('#compare').click();await page.locator('#plan-b').selectOption(manifest.plans[7].id);await page.waitForTimeout(1200);await page.screenshot({path:'validation/comparison.png',fullPage:true});
 for(const pathname of ['/references/habitat-options/comparison.md','/docs/provenance.md']){assert.equal((await page.request.get(url+pathname)).status(),200,pathname);}
 assert.deepEqual(errors,[]);await fs.writeFile('validation/public-smoke.json',JSON.stringify({date:new Date().toISOString(),scope:'Portable public package, local server, all ten species/count groups and all twenty public source-link HTTP responses; comparison screenshot',browserVersion:browser.version(),counts,referencePaths:links,errors},null,2));console.log('Public smoke: ten plans and twenty source responses verified, comparison captured, no browser errors.');
}finally{await browser.close();}
