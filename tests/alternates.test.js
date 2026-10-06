import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PlanAdapter,TankGeometry,SimulationWorld} from '../src/core.js';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const main=read('data/plans.json'),alt=read('data/alternates.json'),config=read('data/config.json'),adapter=new PlanAdapter({...main,plans:[...main.plans,...alt.plans],species:{...main.species,...alt.species}});
test('alternate catalog preserves ten main plans and three distinct full communities',()=>{
 assert.equal(main.plans.length,10);assert.equal(alt.plans.length,3);assert.equal(adapter.plans.length,13);
 assert.deepEqual(alt.plans.map(p=>p.groups.map(g=>g.count)),[[6,12],[10,10,6],[10,10,10]]);
 assert.deepEqual(alt.plans.map(p=>p.fishCount),[18,26,30]);
 for(const p of alt.plans){assert.equal(p.category,'alternate');assert.ok(p.unresolved.length);assert.ok(fs.existsSync(new URL('../'+p.planUrl,import.meta.url)));}
 assert.equal(alt.plans[1].startupUsd,null);assert.equal(alt.plans[1].maintenance,null);
 assert.equal(alt.plans[2].startupUsd,1140.37);assert.equal(alt.plans[2].decor[0].costUsd,20);
 assert.equal(main.plans.find(p=>p.number===9).groups[0].count,12);
 assert.equal(main.plans.find(p=>p.number===4).groups.length,2);
});
test('every alternate remains bounded and mobile across both planting stages',()=>{
 for(const plan of alt.plans)for(const stage of ['starter','established'])for(const seed of [47291,9182]){
  const world=new SimulationWorld(plan,new TankGeometry(config.geometry),adapter,config,stage,seed);
  for(let tick=0;tick<60*90;tick++){
   world.step(1/60);
   if(tick%30===0)for(const a of world.agents){assert.ok(world.layout.safe(a.position,a.radius,a.topClearance,a.floorClearance),`${plan.id} ${a.id} escaped`);assert.ok(a.position.every(Number.isFinite));for(const b of world.agents)if(b.id>a.id)assert.ok(Math.hypot(...a.position.map((v,k)=>v-b.position[k]))>=a.radius+b.radius-1e-6);}
  }
  for(const a of world.agents)assert.ok(a.distanceTraveled>15,`${plan.id}: stuck ${a.id}`);
  const corys=world.agents.filter(a=>a.species.profile.bottomHabitat);
  if(corys.length){assert.equal(corys.length,6);for(const a of corys){assert.ok(a.position[1]<world.tank.waterline*.4,'cory left lower water');assert.ok(Math.abs(a.pitch)<=a.species.profile.pitchLimit+.001);}}
 }
});
