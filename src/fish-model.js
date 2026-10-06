import * as THREE from 'three';
// Original procedural anatomy and textures. No copied photos or third-party fish assets.
const textures=new Map();
function skin(profile,sex){const key=profile.mark+sex+profile.color;if(textures.has(key))return textures.get(key);const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');let base=profile.color;if(sex==='female'&&['honey','cherry','ruby'].includes(profile.mark))base=profile.mark==='honey'?'#bcab71':'#a39b7d';
 const grad=ctx.createLinearGradient(0,0,0,256);grad.addColorStop(0,'#788c74');grad.addColorStop(.3,base);grad.addColorStop(.55,base);grad.addColorStop(1,'#e2dbc0');ctx.fillStyle=grad;ctx.fillRect(0,0,512,256);
 // Staggered restrained scale crescent texture; anatomy silhouette supplies the main form.
 ctx.strokeStyle='rgba(237,234,203,.13)';ctx.lineWidth=.7;for(let y=22;y<240;y+=10)for(let x=3;x<510;x+=12){ctx.beginPath();ctx.arc(x+(y%20?6:0),y,5,.3,2.5);ctx.stroke();}
 const band=(y,h,color)=>{ctx.fillStyle=color;ctx.fillRect(40,y,465,h);};
 switch(profile.mark){
 case 'zebra':for(let y=67;y<180;y+=24)band(y,8,'#354d5d');break;
 case 'blackneon':band(122,24,'#273d34');band(108,7,'#e6e3a8');break;
 case 'glowlight':band(120,9,'#dc8546');band(117,3,'#edd091');break;
 case 'cherry':band(128,9,'#4c4a35');if(sex==='male'){ctx.fillStyle='rgba(168,39,29,.2)';ctx.fillRect(0,0,512,256);}break;
 case 'ruby':ctx.fillStyle='rgba(45,43,39,.7)';for(const x of [100,235,375])ctx.fillRect(x,35,27,175);if(sex==='male'){ctx.fillStyle='rgba(143,45,41,.35)';ctx.fillRect(365,40,130,145);}break;
 case 'gold':ctx.fillStyle='#7a7050';for(const [x,y] of [[95,128],[160,109],[235,120],[310,119],[356,90]]){ctx.beginPath();ctx.ellipse(x,y,6,8,0,0,7);ctx.fill();}break;
 case 'phantom':ctx.fillStyle='#34483d';ctx.beginPath();ctx.ellipse(347,126,21,48,-.12,0,7);ctx.fill();ctx.strokeStyle='#bac7b5';ctx.lineWidth=3;ctx.stroke();break;
 case 'rasbora':band(126,9,'#3e4838');band(118,4,'#d2c58b');break;
 case 'headtail':ctx.fillStyle='#394537';for(const x of [58,368]){ctx.beginPath();ctx.ellipse(x,128,15,21,0,0,7);ctx.fill();ctx.fillStyle='#d3cf96';ctx.fillRect(x-5,98,10,5);ctx.fillStyle='#394537';}break;
 case 'sparkler':band(127,4,'#666842');ctx.fillStyle='#75b8b2';for(let i=0;i<28;i++){ctx.beginPath();ctx.ellipse(55+i*15,108+(i%3)*10,2,3,0,0,7);ctx.fill();}break;
 case 'honey':if(sex==='male'){ctx.fillStyle='rgba(63,61,41,.65)';ctx.beginPath();ctx.ellipse(385,197,72,32,0,0,7);ctx.fill();}break;
 case 'pencil':for(const y of [87,124,165])band(y,y===124?10:5,'#494437');break;
 case 'bronze':band(105,42,'#647269');ctx.strokeStyle='rgba(70,76,53,.3)';for(let x=65;x<450;x+=34){ctx.beginPath();ctx.moveTo(x,55);ctx.lineTo(x+7,125);ctx.lineTo(x,203);ctx.stroke();}break;
 case 'threadfin':band(125,3,'#b1a073');break;
 case 'ember':ctx.fillStyle='rgba(216,89,27,.3)';ctx.fillRect(0,0,512,256);break;
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;textures.set(key,t);return t;
}
function bodyGeometry(p){const g=new THREE.BufferGeometry(),verts=[],uv=[],index=[];const nx=32,nr=20;const front=.5,rear=-.5+p.tail;for(let i=0;i<=nx;i++){const u=i/nx,x=rear+(front-rear)*u;let envelope=Math.pow(Math.sin(Math.PI*u),p.bodyTaperExponent);envelope*=.6+.6*u;if(i===0)envelope=.075;if(i===nx)envelope=p.form==='catfish'?.24:.025;
 for(let j=0;j<=nr;j++){const a=j/nr*Math.PI*2;verts.push(x,Math.cos(a)*p.depth*.5*envelope+p.noseRise*u*u*u,Math.sin(a)*p.thickness*.5*envelope);uv.push(u,(1+Math.cos(a))/2);if(i<nx&&j<nr){const a0=i*(nr+1)+j,b=a0+nr+1;index.push(a0,b,a0+1,b,b+1,a0+1);}}}g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;}
function fan(points,material){points=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal').getPoints(points.length*5).map(p=>p.toArray());const vertices=[0,0,0,...points.flat()],indices=[];for(let i=1;i<points.length;i++)indices.push(0,i,i+1);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,material);const rayPoints=[];for(const p of points)rayPoints.push(new THREE.Vector3(),new THREE.Vector3(...p));const rays=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(rayPoints),new THREE.LineBasicMaterial({color:0x63644d,transparent:true,opacity:.18}));mesh.add(rays);return mesh;}
export class FishModel {
 constructor(agent){this.agent=agent;const p=agent.species.profile;this.root=new THREE.Group();this.rig=new THREE.Group();this.root.add(this.rig);this.rig.scale.setScalar(p.visualLengthBySex?.[agent.sex]??agent.species.totalLengthCm);this.uniforms={time:{value:0},effort:{value:1},phase:{value:agent.phase}};
 const material=new THREE.MeshStandardMaterial({map:skin(p.ornamentalColors?{...p,color:p.ornamentalColors[agent.id%p.ornamentalColors.length]}:p,agent.sex),roughness:.4,metalness:.18});material.onBeforeCompile=s=>{Object.assign(s.uniforms,this.uniforms);s.vertexShader='uniform float time;uniform float effort;uniform float phase;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nfloat tailWeight=pow(clamp((0.3-position.x)/0.65,0.,1.),2.);transformed.z+=sin(time*(4.+effort*3.)+phase-position.x*5.)*tailWeight*(0.006+effort*0.015);`);};
 this.body=new THREE.Mesh(bodyGeometry(p),material);this.body.castShadow=true;this.rig.add(this.body);
 let finColor=p.mark==='threadfin'?0xab9564:p.mark==='pencil'?0xc77d62:p.mark==='gold'?0xc59139:p.mark==='ember'?0xd98453:p.mark==='cherry'&&agent.sex==='male'?0xbc6552:0xa8ad84;
 const finmat=new THREE.MeshStandardMaterial({color:finColor,transparent:true,opacity:p.finOpacity,side:THREE.DoubleSide,forceSinglePass:true,roughness:.6,depthWrite:false});
 this.tail=new THREE.Group();this.tail.position.x=-.5+p.tail;this.rig.add(this.tail);const fork=p.form==='gourami'||p.form==='ricefish'?0:.065;
 this.tail.add(fan([[-p.tail*.22,p.depth*.045,0],[-p.tail,p.depth*.35,0],[-p.tail+fork,0,0],[-p.tail,-p.depth*.35,0],[-p.tail*.22,-p.depth*.045,0]],finmat));
 if(p.mark==='rasbora'||p.mark==='xray')this.tail.children[0].material=new THREE.MeshStandardMaterial({color:0xc46c54,transparent:true,opacity:.58,side:THREE.DoubleSide,forceSinglePass:true,depthWrite:false});
 let dh=p.form==='deep'?(agent.sex==='male'?.17:.11):p.form==='blueeye'?.11:p.form==='gourami'?.08:.095;
 this.dorsal=fan(p.dorsalOutline,finmat);this.rig.add(this.dorsal);if(p.form==='blueeye'||p.form==='threadfin'){this.firstDorsal=fan([[-.015,.06,0],[-.025,.12,0],[.065,.13,0],[.095,.055,0]],finmat);this.firstDorsal.position.set(.1,.025,0);this.rig.add(this.firstDorsal);}
 this.anal=fan(p.analOutline,finmat);this.rig.add(this.anal);
 if(p.form==='threadfin'&&agent.sex==='male'){const rayMaterial=new THREE.LineBasicMaterial({color:0x494940,transparent:true,opacity:.85});for(const [fin,sign] of [[this.dorsal,1],[this.anal,-1]])for(let i=0;i<3;i++){const points=[new THREE.Vector3(-.10-i*.025,sign*.08,0),new THREE.Vector3(-.21-i*.025,sign*(.17+i*.015),0),new THREE.Vector3(-.42-i*.016,sign*(.24+i*.018),0),new THREE.Vector3(-.48+i*.015,sign*(.22+i*.02),0)];const curve=new THREE.CatmullRomCurve3(points);fin.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(18)),rayMaterial));}}
 if(p.mark==='phantom'){this.dorsal.material=new THREE.MeshStandardMaterial({color:agent.sex==='male'?0x394b41:0x9d665c,transparent:true,opacity:.65,side:THREE.DoubleSide,forceSinglePass:true,depthWrite:false});}
 this.pectorals=[];for(const side of [-1,1]){const f=fan([[-.08,-.035,side*.055],[-.15,-.095,side*.115],[-.02,-.095,side*.13]],finmat);f.position.set(.20,-.02,side*p.thickness*.45);this.rig.add(f);this.pectorals.push(f);}
 const eyeColor=p.form==='blueeye'?0x6ea8cf:p.mark==='blackneon'?0xa06b47:0xb5a674;
 const ringmat=new THREE.MeshStandardMaterial({color:eyeColor,roughness:.28,metalness:.2});const pupilmat=new THREE.MeshStandardMaterial({color:0x111b17,roughness:.16});for(const side of [-1,1]){
 const eye=new THREE.Mesh(new THREE.SphereGeometry(p.eyeRadiusFraction,12,8),ringmat);eye.scale.set(.88,1,.35);eye.position.set(.325,p.depth*.105,side*p.thickness*.385);this.rig.add(eye);
 const pupil=new THREE.Mesh(new THREE.SphereGeometry(p.eyeRadiusFraction*.63,10,8),pupilmat);pupil.scale.set(1,1,.25);pupil.position.copy(eye.position);pupil.position.z+=side*.011;this.rig.add(pupil);
 const highlight=new THREE.Mesh(new THREE.SphereGeometry(.006,6,6),new THREE.MeshBasicMaterial({color:0xeeeacb}));highlight.position.copy(pupil.position);highlight.position.x+=.004;highlight.position.y+=.006;highlight.position.z+=side*.005;this.rig.add(highlight);}
 // Mouth and gill line avoid a featureless ellipse at close range.
 const lineMat=new THREE.LineBasicMaterial({color:0x596859,transparent:true,opacity:.45});for(const side of [-1,1]){const pts=[new THREE.Vector3(.23,p.depth*.28,side*p.thickness*.35),new THREE.Vector3(.17,0,side*p.thickness*.48),new THREE.Vector3(.24,-p.depth*.25,side*p.thickness*.35)];this.rig.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMat));}
 if(p.form==='catfish'){for(const side of [-1,1]){for(const spread of [1,2]){const pts=[new THREE.Vector3(.40,-.075,side*.02),new THREE.Vector3(.46,-.10,side*.035*spread),new THREE.Vector3(.505,-.135,side*.042*spread)];this.rig.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMat));}}const adipose=fan([[-.28,.08,0],[-.27,.16,0],[-.20,.09,0]],finmat);this.rig.add(adipose);}
 if(p.form==='gourami'){for(const side of [-1,1]){const pts=[new THREE.Vector3(.17,-p.depth*.27,side*.02),new THREE.Vector3(.09,-p.depth*.65,side*.025),new THREE.Vector3(-.06,-p.depth*.78,side*.025)];this.rig.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMat));}}
 if(p.mark==='xray'){for(const fin of [this.dorsal,this.anal]){fin.add(fan([[-.12,fin===this.dorsal?.19:-.2,0],[-.06,fin===this.dorsal?.27:-.26,0],[.005,fin===this.dorsal?.23:-.23,0]],new THREE.MeshBasicMaterial({color:0x484a37,transparent:true,opacity:.75,side:THREE.DoubleSide,forceSinglePass:true,depthWrite:false})));}}
 if(p.form==='blueeye'){this.addSpots(this.dorsal);this.addSpots(this.anal);}

 this.root.userData.agentId=agent.id;this.root.traverse(o=>{o.userData.agentId=agent.id;});
 }
 addSpots(fin){const mat=new THREE.MeshBasicMaterial({color:0x545844,side:THREE.DoubleSide,forceSinglePass:true,transparent:true,opacity:.6});for(let i=0;i<5;i++){const s=new THREE.Mesh(new THREE.CircleGeometry(.007,6),mat);s.position.set(-.18+i*.030,(fin===this.dorsal?1:-1)*(.12+(i%2)*.023),.001);fin.add(s);}}
 update(time){const a=this.agent;this.root.position.set(...a.position);this.root.rotation.set(0,-a.heading,a.pitch,'YXZ');const speed=Math.hypot(...a.velocity)/a.species.totalLengthCm;this.uniforms.time.value=time;this.uniforms.effort.value=speed;this.tail.rotation.y=Math.sin(time*(4+speed*3)+a.phase)*(.07+speed*.12);for(let i=0;i<this.pectorals.length;i++)this.pectorals[i].rotation.x=Math.sin(time*7+a.phase+i)*.24;this.dorsal.rotation.x=Math.sin(time*2+a.phase)*.04;this.dorsal.scale.y=(a.sex==='female'?a.species.profile.femaleDorsalScale:1)*(a.display>0?1.12:1);this.anal.scale.y=(a.sex==='female'?a.species.profile.femaleAnalScale:1)*(a.display>0?1.08:1);if(this.firstDorsal)this.firstDorsal.rotation.x=Math.sin(time*2+a.phase)*.04;}
 dispose(){this.root.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});}
}
