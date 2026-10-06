import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const plans=JSON.parse(await fs.readFile('data/plans.json','utf8')).plans;
const images=[];
for(let i=0;i<10;i++)for(const stage of ['starter','scene'])images.push({name:plans[i].name,stage:stage==='scene'?'Established':'Starter',image:'data:image/png;base64,'+(await fs.readFile(`validation/${String(i+1).padStart(2,'0')}-${stage}.png`)).toString('base64')});
const browser=await chromium.launch({...(process.env.AQUARIUM_CHROME?{executablePath:process.env.AQUARIUM_CHROME}:{}),headless:true,args:['--no-sandbox']});
try{const page=await browser.newPage();const png=await page.evaluate(async images=>{const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=3600;const ctx=canvas.getContext('2d');ctx.fillStyle='#f5f4ec';ctx.fillRect(0,0,1200,3600);for(let i=0;i<images.length;i++){const record=images[i],img=new Image();await new Promise(r=>{img.onload=r;img.src=record.image;});const x=i%2*600,y=Math.floor(i/2)*360;ctx.drawImage(img,x,y,600,320);ctx.fillStyle='#314b37';ctx.font='17px Georgia';ctx.fillText(record.name+' · '+record.stage,x+12,y+345);}return canvas.toDataURL();},images);await fs.writeFile('validation/planting-review.png',Buffer.from(png.split(',')[1],'base64'));console.log('Captured 20 planting scenes in validation/planting-review.png');}finally{await browser.close();}
