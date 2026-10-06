import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PlanAdapter,TankGeometry,SimulationWorld,length,sub} from '../src/core.js';
const config=JSON.parse(fs.readFileSync(new URL('../data/config.json',import.meta.url)));
const manifest=JSON.parse(fs.readFileSync(new URL('../data/plans.json',import.meta.url)));
const original=JSON.parse(fs.readFileSync(new URL('../references/habitat-options/options.json',import.meta.url)));
const adapter=new PlanAdapter(manifest),tank=new TankGeometry(config.geometry);
test('Every active record and adult count survives normalization; no archived fish are selectable',()=>{
 assert.equal(adapter.plans.length,10);for(const [i,p] of adapter.plans.entries()){const src=original.options[i];assert.equal(p.id,src.id);assert.equal(p.fishCount,src.fish_groups.reduce((n,g)=>n+g.adult_count,0));assert.deepEqual(p.groups.map(g=>g.species),src.fish_groups.map(g=>g.scientific_name));for(const [j,g] of p.plants.entries()){assert.equal(g.quantity,src.plant_groups[j].initial_quantity);assert.equal(g.unit,src.plant_groups[j].quantity_unit);}assert.ok(p.fishCount>1);}
 const h=adapter.plans[1];assert.deepEqual(h.groups.map(g=>[g.species,g.count]),[['Barbodes semifasciolatus',10]]);assert.ok(!Object.keys(manifest.species).includes('Macropodus opercularis'));
});
test('Length semantics, cost and maintenance match source; conversion is explicitly labeled',()=>{
 for(const p of adapter.plans){const src=original.options.find(s=>s.id===p.id);const report=JSON.parse(fs.readFileSync(new URL('../references/habitat-options/'+src.evaluator_reference.current_report_json,import.meta.url)));assert.equal(p.startupUsd,report.costs.startup_known_subtotal.expected);assert.deepEqual(p.maintenance,report.maintenance.weekly_minutes);for(const g of p.groups){const s=manifest.species[g.species];assert.ok(s.totalLengthCm>0);assert.ok(s.sourceSizeField);assert.ok(s.sizeInterpretation);}}
 assert.equal(manifest.species['Barbodes semifasciolatus'].totalLengthCm,9);assert.equal(manifest.species['Danio rerio'].totalLengthCm,6);
});
test('Configurable dimensions do not scale fish counts or conceal an unmet space requirement',()=>{
 const p=adapter.plans[1],small=new TankGeometry({...config.geometry,length:85,width:40});assert.equal(small.constraints(p).baseFits,false);const big=new TankGeometry({...config.geometry,length:180,width:60,height:65,waterline:60});const a=new SimulationWorld(p,big,adapter,config);assert.equal(a.agents.length,10);assert.equal(a.tank.length,180);assert.throws(()=>new TankGeometry({...config.geometry,waterline:50}));
});
test('Reset and fixed-step updates reproduce trajectories at different frame rates',()=>{
 const p=adapter.plans[3];const worlds=[30,60,144].map(fps=>{const w=new SimulationWorld(p,tank,adapter,config);for(let i=0;i<fps*12;i++)w.advance(1/fps);return w;});for(const w of worlds)assert.equal(w.stepCount,720);assert.deepEqual(worlds[0].snapshot(),worlds[1].snapshot());assert.deepEqual(worlds[1].snapshot(),worlds[2].snapshot());
});
test('Both planting stages preserve funded substrate volume and plant unit metadata',()=>{
 for(const p of adapter.plans)for(const stage of ['starter','established']){const w=new SimulationWorld(p,tank,adapter,config,stage);const l=w.layout;const integral=(l.frontDepth*(1-l.patchFraction)+l.patchDepth*l.patchFraction)*tank.length*tank.width;assert.ok(Math.abs(integral-l.sandVolume)<.0001);assert.ok(l.frontDepth>0);assert.ok(p.decor.length===0);assert.equal(w.agents.length,p.fishCount);}
});
test('All layouts: multi-minute, multi-seed motion remains inside full-body bounds and out of solid cores',()=>{
 const results=[];for(const p of adapter.plans)for(const stage of ['starter','established'])for(const seed of [47291,87123]){const fps=seed===47291?30:144;const w=new SimulationWorld(p,tank,adapter,config,stage,seed);let maxOverlap=0,maxJump=0;for(let frame=0;frame<fps*125;frame++){const prior=w.agents.map(a=>[...a.position]),priorStep=w.stepCount;w.advance(1/fps);if(w.stepCount===priorStep)continue;for(const [i,a] of w.agents.entries()){assert.ok(a.position.every(Number.isFinite));assert.ok(w.layout.safe(a.position,a.radius,a.topClearance),`${p.name} ${stage} seed${seed} frame${frame} fish${i}: solid/wall intersection`);maxJump=Math.max(maxJump,length(sub(a.position,prior[i])));if(frame%30===0)for(let j=i+1;j<w.agents.length;j++){const b=w.agents[j];maxOverlap=Math.max(maxOverlap,a.radius+b.radius-length(sub(a.position,b.position)));}}}
 assert.ok(w.agents.every(a=>a.distanceTraveled>20),`${p.name}: stuck agent`);assert.ok(maxJump<.65,`${p.name}: teleport ${maxJump}`);assert.ok(maxOverlap<.16,`${p.name}: pair overlap ${maxOverlap}`);results.push({plan:p.name,stage,seed,inputFramesPerSecond:fps,seconds:w.time,maxJump,maxSphereOverlap:maxOverlap,maxConstraintCorrection:w.maxCorrection,fishCount:w.agents.length});}fs.writeFileSync(new URL('../validation/behavior-results.json',import.meta.url),JSON.stringify(results,null,2));
});

test('Hainan preserves two rooted pot groups and one floating group',()=>{for(const stage of ['starter','established']){const w=new SimulationWorld(adapter.plans[1],tank,adapter,config,stage);const root=w.layout.patches.filter(p=>!p.floating),float=w.layout.patches.filter(p=>p.floating);assert.equal(root.length,float.length*2);assert.ok(root.every(p=>Math.abs(p.x)>15));assert.ok(float.every(p=>Math.abs(p.x)<15));}});
