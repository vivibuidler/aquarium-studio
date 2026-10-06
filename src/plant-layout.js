// Shared original procedural botanical structure; no browser or rendering dependency.
// Leaves remain flexible foliage. Stems and hanging roots are explicit solid segments.
export function describePlant(p,rng){
 const leaves=[],stems=[],roots=[],r=rng,form=p.profile.form,center=[p.x,p.y,p.z],height=p.height;
 const add=(list,position,scale,rotation)=>list.push({position,scale,rotation});
 const segment=(a,b,radius)=>stems.push({a,b,radius});
 if(form==='fern'){
  for(let frond=0;frond<6;frond++){const az=frond/6*Math.PI*2+r.range(-.2,.2),h=height*r.range(.62,1);let prior=[p.x,p.y,p.z];for(let node=1;node<=12;node++){const t=node/12,radial=h*(p.floating?.42:.28)*t;const cy=p.y+(p.floating?Math.sin(t*Math.PI)*h*.055:h*t*.85);const c=[p.x+Math.cos(az)*radial,cy,p.z+Math.sin(az)*radial];segment(prior,c,.045);prior=c;for(const side of [-1,1]){const leafLength=(Math.pow(Math.sin(t*Math.PI),.7)*h*.13+.25)*(p.floating?.85:1);const angle=az+side*Math.PI*.45;add(leaves,c,[.45,leafLength,1],[p.floating?1.32:1.1,angle,0]);}}}
  if(p.floating)for(let k=0;k<9;k++){const rootLength=height*r.range(.3,.65);add(roots,[p.x+r.range(-1,1),p.y-rootLength/2,p.z+r.range(-1,1)],[.035,rootLength,.035],[0,r.next()*6,.04]);}
 }else if(['crypt','grass'].includes(form)){
  for(let k=0;k<7;k++){const angle=k/7*Math.PI*2+r.range(-.25,.25),h=height*r.range(.65,1)*(p.floating?.27:1),w=form==='grass'?.75:h*.23,tilt=p.floating?1.22:form==='grass'?.3:.5;add(leaves,[center[0]+r.range(-.3,.3),center[1],center[2]+r.range(-.3,.3)],[w,h,1],[tilt,angle,0]);}
  if(p.floating)for(let k=0;k<9;k++){const rootLength=height*r.range(.3,.7);add(roots,[p.x+r.range(-1,1),p.y-rootLength/2,p.z+r.range(-1,1)],[.03,rootLength,.03],[0,r.next()*6,.04]);}
 }else{
  add(stems,[p.x,p.y+height/2,p.z],[.11,height,.11],[0,0,r.range(-.13,.13)]);
  const whorls=form==='hornwort'?12:form==='mayaca'?20:11;for(let level=0;level<whorls;level++){const y=p.y+height*(level+1)/(whorls+1),n=form==='hornwort'?7:form==='mayaca'?6:4;for(let k=0;k<n;k++){const angle=k/n*Math.PI*2+level*.68,leafLength=form==='hornwort'?2.1:form==='mayaca'?1.3:2.3;add(leaves,[p.x+Math.cos(angle)*.3,y,p.z+Math.sin(angle)*.3],[form==='hornwort'?1.8:form==='mayaca'?1.35:1.65,leafLength*r.range(.7,1.2),1],[Math.sin(angle),angle,Math.cos(angle)]);if(form==='hornwort')for(let b=0;b<2;b++)add(leaves,[p.x+Math.cos(angle)*.8,y+.4+b*.45,p.z+Math.sin(angle)*.8],[1.1,1.1,1],[Math.sin(angle)*1.2,angle+.4,Math.cos(angle)*1.2]);}if(form==='najas'&&level%3===0){const a=level*1.1;add(stems,[p.x+Math.cos(a)*2,y+1.5,p.z+Math.sin(a)*2],[.05,5,.05],[Math.sin(a)*.6,a,Math.cos(a)*.6]);}}
 }
 return {leaves,stems,roots};
}
export function solidPlantSegments(structure,padding){
 return [...structure.stems,...structure.roots].map(s=>{if(s.a)return {a:s.a,b:s.b,r:s.radius*.65+padding};const [x,y,z]=s.rotation,[sx,sy,sz]=s.scale,cx=Math.cos(x),sxAngle=Math.sin(x),cy=Math.cos(y),syAngle=Math.sin(y),cz=Math.cos(z),szAngle=Math.sin(z),axis=[-cy*szAngle,cx*cz-sxAngle*syAngle*szAngle,sxAngle*cz+cx*syAngle*szAngle];return {a:s.position.map((v,k)=>v-axis[k]*sy/2),b:s.position.map((v,k)=>v+axis[k]*sy/2),r:Math.max(sx,sz)*.65+padding};});
}
