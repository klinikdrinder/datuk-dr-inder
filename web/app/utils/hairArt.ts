// Small line drawings for the expertise cards (hairline, FUE units, eyebrow, beard)
/* eslint-disable */
// @ts-nocheck
function rnd(s: number){return function(){s=(s*9301+49297)%233280;return s/233280}}
export function drawArt(cv: HTMLCanvasElement, t: number){
  const CH='176,138,74', CR='200,16,46';
  const dpr=Math.min(devicePixelRatio||1,2), w=cv.clientWidth, h=cv.clientHeight;
  if(!w) return;
  cv.width=w*dpr; cv.height=h*dpr; const g=cv.getContext('2d')!; g.scale(dpr,dpr); g.clearRect(0,0,w,h);
  const kind=cv.dataset.art||'', R=rnd(kind.length*97+3);
  g.lineCap='round';
  if(kind==='hairline'){
    // irregular natural hairline: dense strands along a soft curve with feathered edge
    for(let i=0;i<150;i++){
      const u=R(), x=10+u*(w-20), base=h*.72-Math.sin(u*Math.PI)*h*.32 + (R()-.5)*14;
      const len=10+R()*18, a=-Math.PI/2+(u-.5)*0.9+Math.sin(t+i)*.05;
      g.strokeStyle=`rgba(${R()<.08?CR:CH},${.35+R()*.6})`; g.lineWidth=1;
      g.beginPath(); g.moveTo(x,base); g.quadraticCurveTo(x+Math.cos(a)*len*.5+3,base+Math.sin(a)*len*.5,x+Math.cos(a)*len,base+Math.sin(a)*len); g.stroke();
    }
    g.setLineDash([3,5]); g.strokeStyle=`rgba(${CR},.7)`; g.beginPath();
    for(let x=10;x<=w-10;x+=4){const u=(x-10)/(w-20);g.lineTo(x,h*.76-Math.sin(u*Math.PI)*h*.32)} g.stroke(); g.setLineDash([]);
  } else if(kind==='fue'){
    // follicular units: grouped 1–4 hairs on a grid
    const cols=9, rows=4;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const cx=18+c*((w-36)/(cols-1))+(R()-.5)*6, cy=18+r*((h-36)/(rows-1))+(R()-.5)*6;
      const n=1+Math.floor(R()*4), hl=(r===1&&c===4);
      g.strokeStyle=hl?`rgba(${CR},1)`:`rgba(${CH},.25)`; g.lineWidth=1;
      g.beginPath(); g.arc(cx,cy,hl?9+Math.sin(t*2)*1.5:6,0,Math.PI*2); g.stroke();
      for(let k=0;k<n;k++){g.fillStyle=hl?`rgba(${CR},1)`:`rgba(${CH},.8)`;g.beginPath();g.arc(cx+(k-(n-1)/2)*2.6,cy,1.1,0,Math.PI*2);g.fill()}
    }
  } else if(kind==='brow'){
    // eyebrow: hairs whose angle turns from upward (head) to lateral (tail)
    for(let i=0;i<110;i++){
      const u=R(), x=16+u*(w-32), arch=Math.sin(Math.min(1,u*1.4)*Math.PI*.9);
      const y=h*.7-arch*h*.32+(R()-.5)*(16*(1-u*.6));
      const a=-Math.PI/2*(1-u)+(-0.15)*u + Math.sin(t+i*.3)*.04, len=8+R()*8*(1-u*.4);
      g.strokeStyle=`rgba(${u>.45&&u<.5?CR:CH},${.4+R()*.55})`; g.lineWidth=1.1;
      g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len); g.stroke();
    }
  } else {
    // beard: downward strands filling a jaw contour
    g.strokeStyle=`rgba(${CH},.2)`; g.lineWidth=1; g.beginPath();
    g.moveTo(14,14); g.quadraticCurveTo(w/2,h*1.35,w-14,14); g.stroke();
    for(let i=0;i<190;i++){
      const u=R(), x=18+u*(w-36), top=14+ (h*.2)*Math.pow(Math.abs(u-.5)*2,2);
      const bottom=14+(h*1.35-14)*2*u*(1-u)*.92; if(bottom-top<6) continue;
      const y=top+R()*(bottom-top), len=6+R()*8, a=Math.PI/2+(u-.5)*.8+Math.sin(t+i)*.04;
      g.strokeStyle=`rgba(${R()<.06?CR:CH},${.35+R()*.5})`;
      g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len); g.stroke();
    }
  }
}
