import {describePlant,solidPlantSegments} from './plant-layout.js';
// Domain and behavior are independent of WebGL and browser state. All lengths are centimeters.
export const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
export const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const mul=(a,n)=>a.map(v=>v*n);
export const length=a=>Math.hypot(...a);
export const norm=a=>mul(a,1/(length(a)||1));
export function closestOnSegment(p,s){const dx=s.b[0]-s.a[0],dy=s.b[1]-s.a[1],dz=s.b[2]-s.a[2],t=clamp(((p[0]-s.a[0])*dx+(p[1]-s.a[1])*dy+(p[2]-s.a[2])*dz)/(dx*dx+dy*dy+dz*dz||1),0,1);return [s.a[0]+dx*t,s.a[1]+dy*t,s.a[2]+dz*t];}
export function distanceToBox(p,min,max){return Math.hypot(...p.map((v,k)=>v-clamp(v,min[k],max[k])));}
export class Random {
 constructor(seed){this.state=seed>>>0;}
 next(){let t=this.state+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}
 range(a,b){return a+(b-a)*this.next();}
}
/** @typedef {import('./types').GeometryData} GeometryData */
/** @typedef {import('./types').SpeciesData} SpeciesData */
/** @typedef {import('./types').HabitatPlan} HabitatPlan */
/** @typedef {import('./types').PlanManifest} PlanManifest */
export class TankGeometry {
 /** @param {GeometryData} data */
 constructor(data){Object.assign(this,data);for(const k of ['length','width','height','waterline'])if(!Number.isFinite(this[k])||this[k]<=0)throw new Error(`Invalid ${k}`);if(this.waterline>=this.height)throw new Error('Waterline must be below the tank rim.');}
 get nominalDisplayLiters(){return this.length*this.width*this.waterline/1000;}
 constraints(plan){const [l,w]=plan.minimumBaseCm;return {baseFits:this.length>=l&&this.width>=w,laneFits:this.length>=plan.minimumLaneCm,required:`${l} × ${w} cm internal base; ${plan.minimumLaneCm} cm open lane`,note:this.status==='measured'?'User-entered measured geometry; other suitability checks remain conditional.':'Display geometry is an assumption; measure before choosing stocking.'};}
}
export class SpeciesProfile {
 /** @param {SpeciesData} data */
 constructor(data){Object.assign(this,data);if(!this.scientificName||!Number.isFinite(this.totalLengthCm)||this.totalLengthCm<=0)throw new Error('A fish profile requires identity and a positive centimeter length.');if(!Number.isFinite(this.profile.clearanceRadiusFraction)||this.profile.clearanceRadiusFraction<.5)throw new Error("A fish profile requires a configured anatomical clearance radius.");this.radius=this.totalLengthCm*this.profile.clearanceRadiusFraction;}
}
export class PlantProfile {constructor(data){Object.assign(this,data);}}
export class PlanAdapter {
 /** @param {PlanManifest} manifest */
 constructor(manifest){this.manifest=manifest;this.plans=manifest.plans;this.species=new Map(Object.entries(manifest.species).map(([id,data])=>[id,new SpeciesProfile(data)]));if(this.plans.length!==10)throw new Error('Expected ten active plans.');for(const p of this.plans)for(const g of p.groups)if(!this.species.has(g.species)||!Number.isInteger(g.count)||g.count<1)throw new Error('Invalid fish group in '+p.id);}
 get(id){const p=this.plans.find(p=>p.id===id);if(!p)throw new Error(`Unknown plan ${id}`);return p;}
}
export class HabitatLayout {
 constructor(plan,tank,stage,config){this.plan=plan;this.tank=tank;this.stage=stage;this.config=config;this.patches=[];this.obstacles=[];this.sandVolume=plan.substrate.massLb/plan.substrate.densityLbPerFt3*28316.846592;this.averageSandDepth=this.sandVolume/(tank.length*tank.width);this.patchDepth=plan.substrate.patchDepthCm;this.maxSandDepth=this.patchDepth||this.averageSandDepth;
  // Rooted depth redistributes the same funded volume rather than creating extra sand.
  this.patchFraction=Math.min(plan.substrate.patchAreaFraction||0,this.sandVolume/(tank.length*tank.width*(this.patchDepth||1))*.86);
  this.frontDepth=this.patchDepth?(this.sandVolume/(tank.length*tank.width)-this.patchDepth*this.patchFraction)/(1-this.patchFraction):this.averageSandDepth;
  const rand=new Random(201903+plan.number);const spread=stage==='starter'?config.starterSpread:config.establishedSpread;
  for(const pg of plan.plants){const pf=new PlantProfile(pg.profile);const per=pf.shoots[stage==='starter'?0:1];const count=pg.quantity*per;for(let i=0;i<count;i++){
   const unitIndex=Math.floor(i/per),pattern=pg.patchPattern||[0,1,2];const patch=pattern[unitIndex%pattern.length];const x=tank.length*config.patchXFractions[patch]+rand.range(-1,1)*tank.length*config.patchWidthFraction*.38*spread;
   const z=tank.width*config.patchZFraction+rand.range(-1,1)*tank.width*config.patchDepthFraction*.46*spread;
   let floating=pg.mode==='floating'||(pg.mode==='mixed'&&unitIndex>=pg.rootedUnits);
   const height=pf.height[stage==='starter'?0:1]*rand.range(.72,1.1);
   const y=floating?tank.waterline-.7:this.floorAt(x,z);
   const plant={x,y,z,height,floating,profile:pf,species:pg.species,index:i,seed:Math.floor(rand.next()*1e7)};plant.structure=describePlant(plant,new Random(plant.seed));this.patches.push(plant);const segments=solidPlantSegments(plant.structure,config.structureClearanceCm);if(['crypt','grass'].includes(pf.form)&&!floating)segments.push({a:[x,y,z],b:[x,y+.65,z],r:config.stemCoreRadius});plant.solidSegments=segments;if(segments.length){const min=[0,1,2].map(k=>Math.min(...segments.map(s=>Math.min(s.a[k],s.b[k])-s.r))),max=[0,1,2].map(k=>Math.max(...segments.map(s=>Math.max(s.a[k],s.b[k])+s.r)));this.obstacles.push({type:'plantStructure',min,max,segments});}
  }}
  this.equipment=config.equipment.map(e=>{const y0=e.anchor==='surface'?tank.waterline-e.lengthCm:this.maxSandDepth+e.baseClearanceCm;const y1=e.anchor==='surface'?tank.waterline+e.aboveWaterCm:Math.min(tank.waterline-e.surfaceClearanceCm,y0+e.lengthCm);return {...e,x:tank.length*e.xFraction,z:tank.width*e.zFraction,y0,y1,r:e.radiusCm};});
  this.obstacles.push(...this.equipment.map(e=>({...e,r:e.collisionRadiusCm,y0:e.y0-e.collisionVerticalPaddingCm,y1:e.y1+e.collisionVerticalPaddingCm})));for(const e of this.equipment){if(e.housingSizeCm){e.housingCenter=[e.x+e.housingOffsetCm[0],tank.height+e.housingOffsetCm[1],e.z+e.housingOffsetCm[2]];this.obstacles.push({type:'box',equipmentType:e.type,min:e.housingCenter.map((v,k)=>v-e.housingSizeCm[k]/2),max:e.housingCenter.map((v,k)=>v+e.housingSizeCm[k]/2)});}if(e.capSizeCm){const center=[e.x,e.y1,e.z];this.obstacles.push({type:'box',equipmentType:e.type,min:center.map((v,k)=>v-e.capSizeCm[k]/2),max:center.map((v,k)=>v+e.capSizeCm[k]/2)});}}

 }
 floorAt(x,z){if(!this.patchDepth)return this.averageSandDepth;const halfZ=this.tank.width/2;const rearDepth=this.tank.width*this.patchFraction;const t=clamp(((-z+halfZ)-(this.tank.width-rearDepth-.8))/1.6,0,1);return this.frontDepth+(this.patchDepth-this.frontDepth)*t;}
 safe(p,r,topClearance=r){if(p[0]<-this.tank.length/2+r||p[0]>this.tank.length/2-r||Math.abs(p[2])>this.tank.width/2-r||p[1]<this.maxSandDepth+r||p[1]>this.tank.waterline-topClearance)return false;return this.obstacles.every(o=>o.type==='plantStructure'?(distanceToBox(p,o.min,o.max)>=r||o.segments.every(s=>length(sub(p,closestOnSegment(p,s)))>=r+s.r)):o.type==='box'?length(sub(p,p.map((v,k)=>clamp(v,o.min[k],o.max[k]))))>=r:p[1]+r<o.y0||p[1]-r>o.y1||Math.hypot(p[0]-o.x,p[2]-o.z)>=r+o.r);}
}
export class FishAgent {
 constructor(id,profile,sex,rng,tank,layout,config,existing){this.id=id;this.species=profile;this.sex=sex;this.rng=rng;this.radius=profile.radius;this.phase=rng.range(0,Math.PI*2);this.age=0;this.hover=0;this.display=0;this.surface=0;this.topClearance=this.radius;this.goalTimer=0;this.state='explore';this.position=[0,tank.waterline/2,0];
  for(let tries=0;tries<3000;tries++){const p=this.randomPoint(tank,layout);if(layout.safe(p,this.radius)&&existing.every(a=>length(sub(a.position,p))>this.radius+a.radius)){this.position=p;break;}if(tries===2999)throw new Error('The requested geometry cannot safely display this cohort. Increase space only if it describes your actual tank.');}
  this.goal=this.randomPoint(tank,layout);this.heading=rng.range(-Math.PI,Math.PI);this.pitch=0;this.velocity=[Math.cos(this.heading)*.01,0,Math.sin(this.heading)*.01];this.distanceTraveled=0;this.config=config;
 }
 randomPoint(tank,layout){const r=this.radius;return [this.rng.range(-tank.length/2+r+1,tank.length/2-r-1),this.rng.range(layout.maxSandDepth+r+.5,tank.waterline-r-.5),this.rng.range(-tank.width/2+r+1,tank.width/2-r-1)];}
}
export class SimulationWorld {
 constructor(plan,tank,adapter,config,stage='established',seed=config.simulation.seed){this.plan=plan;this.tank=tank;this.config=config;this.layout=new HabitatLayout(plan,tank,stage,config.layout);this.agents=[];this.time=0;this.accumulator=0;this.stepCount=0;this.corrections=0;this.maxCorrection=0;
  let idx=0;for(const g of plan.groups){const species=adapter.species.get(g.species);for(let n=0;n<g.count;n++){const rand=new Random(seed+idx*1709);this.agents.push(new FishAgent(idx,species,g.visualSexMix?.[n]||config.simulation.unsexedAppearancePattern[n%config.simulation.unsexedAppearancePattern.length],rand,tank,this.layout,config.simulation,this.agents));idx++;}}
 }
 advance(delta){this.accumulator+=Math.min(delta,this.config.simulation.maxFrameDelta);const dt=this.config.simulation.fixedStep;while(this.accumulator+1e-10>=dt){this.step(dt);this.accumulator-=dt;}}
 step(dt){const c=this.config.simulation;const old=this.agents.map(a=>({p:[...a.position],v:[...a.velocity]}));
  for(let i=0;i<this.agents.length;i++){const a=this.agents[i],p=old[i].p,prof=a.species.profile,r=a.radius;a.age+=dt;a.goalTimer-=dt;a.hover=Math.max(0,a.hover-dt);a.display=Math.max(0,a.display-dt);const hadSurface=a.surface>0;a.surface=Math.max(0,a.surface-dt);if(hadSurface&&a.surface===0){a.goalTimer=0;a.state='explore';}if(prof.surfaceVisit){a.topClearance=a.surface>0?a.species.totalLengthCm*prof.surfaceVisit.clearanceFraction:Math.min(r,Math.max(a.species.totalLengthCm*prof.surfaceVisit.clearanceFraction,this.tank.waterline-p[1]-.001));}if(a.state==='display'&&a.display===0)a.state='explore';
   if(a.goalTimer<=0){a.goal=a.randomPoint(this.tank,this.layout);a.goal[1]=clamp(this.layout.maxSandDepth+r+(this.tank.waterline-this.layout.maxSandDepth-2*r)*prof.level+a.rng.range(-5,5),this.layout.maxSandDepth+r+.5,this.tank.waterline-r-.5);a.goalTimer=a.rng.range(...c.goalSeconds);if(a.rng.next()<c.hoverChance){a.hover=a.rng.range(...c.hoverSeconds);a.state='hover';}else a.state=a.rng.next()<.25?'forage':'explore';if(a.state==='forage')a.goal[1]=this.layout.maxSandDepth+r+a.rng.range(1,6);const companion=this.agents.find((b,j)=>j!==i&&b.species.scientificName===a.species.scientificName&&length(sub(old[j].p,p))<20);if(a.sex==='male'&&companion&&a.rng.next()<c.displayChance){a.display=a.rng.range(...c.displaySeconds);a.state='display';a.hover=0;}if(prof.surfaceVisit&&a.rng.next()<prof.surfaceVisit.chance){const sv=prof.surfaceVisit,targetY=this.tank.waterline-a.species.totalLengthCm*sv.clearanceFraction-.04;a.surface=Math.max(0,targetY-p[1])/(a.species.totalLengthCm*prof.speed*.8)+a.rng.range(...sv.pauseSeconds);a.goal=[p[0]+a.rng.range(-1,1),targetY,p[2]+a.rng.range(-1,1)];a.goalTimer=a.surface+1;a.hover=0;a.display=0;a.state='surface';a.topClearance=a.species.totalLengthCm*sv.clearanceFraction;}}
   let steer=mul(norm(sub(a.goal,p)),c.wanderStrength);let center=[0,0,0],align=[0,0,0],nn=0;
   for(let j=0;j<this.agents.length;j++){if(i===j)continue;const b=this.agents[j],off=sub(p,old[j].p),dist=length(off),safe=r+b.radius;
    if(dist<safe+c.obstacleMargin)steer=add(steer,mul(norm(off),c.separationStrength*Math.pow(1-dist/(safe+c.obstacleMargin),2)));
    if(b.species.scientificName===a.species.scientificName&&dist<22&&dist>safe){center=add(center,old[j].p);align=add(align,norm(old[j].v));nn++;}}
   if(nn&&a.hover<=0){steer=add(steer,mul(norm(sub(mul(center,1/nn),p)),prof.shoal*c.cohesionStrength));steer=add(steer,mul(norm(align),prof.shoal*c.alignmentStrength));}
   const lo=[-this.tank.length/2+r,this.layout.maxSandDepth+r,-this.tank.width/2+r],hi=[this.tank.length/2-r,this.tank.waterline-a.topClearance,this.tank.width/2-r];
   for(let axis=0;axis<3;axis++){const dl=p[axis]-lo[axis],dh=hi[axis]-p[axis];if(dl<c.wallMargin)steer[axis]+=c.wallStrength*Math.pow(1-dl/c.wallMargin,2);const upperMargin=axis===1&&a.surface>0?.1:c.wallMargin;if(dh<upperMargin)steer[axis]-=c.wallStrength*Math.pow(1-dh/upperMargin,2);}
   for(const o of this.layout.obstacles){if(o.type==='plantStructure'){const margin=r+c.obstacleMargin;if(distanceToBox(p,o.min,o.max)>=margin)continue;for(const s of o.segments){const off=sub(p,closestOnSegment(p,s)),dist=length(off),lim=margin+s.r;if(dist<lim)steer=add(steer,mul(norm(off),c.obstacleStrength*Math.pow(1-dist/lim,2)));}continue;}if(o.type==='box'){const off=sub(p,p.map((v,k)=>clamp(v,o.min[k],o.max[k]))),dist=length(off),lim=r+c.obstacleMargin;if(dist<lim)steer=add(steer,mul(norm(off),c.obstacleStrength*Math.pow(1-dist/lim,2)));continue;}if(p[1]+r<o.y0||p[1]-r>o.y1)continue;const off=[p[0]-o.x,0,p[2]-o.z],dist=length(off),lim=r+o.r+c.obstacleMargin;if(dist<lim)steer=add(steer,mul(norm(off),c.obstacleStrength*Math.pow(1-dist/lim,2)));}
   const dir=norm(steer);let desired=Math.atan2(dir[2],dir[0]),diff=Math.atan2(Math.sin(desired-a.heading),Math.cos(desired-a.heading));a.heading+=clamp(diff,-c.turnRate*dt,c.turnRate*dt);
   a.pitch+=((a.surface>0?prof.surfaceVisit.pitchRadians:clamp(Math.asin(clamp(dir[1],-1,1)),-.45,.45))-a.pitch)*Math.min(1,dt*1.5);
   const speed=a.species.totalLengthCm*prof.speed*(a.surface>0&&a.goal[1]-p[1]<.35?.12:a.hover>0?.14:a.display>0?.4:1)*(1-.45*Math.min(1,Math.abs(diff)/Math.PI));const v=[Math.cos(a.heading)*Math.cos(a.pitch)*speed,Math.sin(a.pitch)*speed,Math.sin(a.heading)*Math.cos(a.pitch)*speed];
   a.velocity=add(a.velocity,mul(sub(v,a.velocity),Math.min(1,c.speedBlend*dt)));const np=add(p,mul(a.velocity,dt));
   const before=[...np];for(let k=0;k<3;k++)np[k]=clamp(np[k],lo[k]+.001,hi[k]-.001);
   
   for(let k=0;k<3;k++)np[k]=clamp(np[k],lo[k]+.001,hi[k]-.001);if(!this.layout.safe(np,r,a.topClearance)||this.agents.some((b,j)=>j!==i&&length(sub(np,b.position))<r+b.radius+.002)){for(let k=0;k<3;k++)np[k]=p[k];a.velocity=mul(a.velocity,.6);a.blockedSeconds=(a.blockedSeconds||0)+dt;if(a.blockedSeconds>.8){a.goalTimer=0;a.blockedSeconds=0;}}else{a.blockedSeconds=0;}const correction=length(sub(np,before));if(correction>.001){this.corrections++;this.maxCorrection=Math.max(this.maxCorrection,correction);}
   a.distanceTraveled+=length(sub(np,a.position));a.position=np;
  }
  this.time+=dt;this.stepCount++;
 }
 snapshot(){return this.agents.map(a=>({id:a.id,species:a.species.scientificName,position:[...a.position],velocity:[...a.velocity],state:a.state,sex:a.sex,totalLengthCm:a.species.totalLengthCm}));}
}
export class ComparisonSession {
 constructor(config){this.geometry=new TankGeometry(config.geometry);this.stage=config.ui.defaultStage;this.view=config.ui.defaultView;this.paused=false;this.labels=config.ui.showLabels;this.scale=config.ui.showScale;this.seed=config.simulation.seed;this.favoriteIds=[];this.note='';}
}
