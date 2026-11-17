// Small line drawings for the expertise cards (long-hair FUE, hairline, donor planning, corrective)
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
  } else if(kind==='igraft'){
    // long-hair FUE: long strands rising from the skin and swaying, a few freshly placed grafts in red
    const base=h*.86;
    g.strokeStyle=`rgba(${CH},.35)`; g.lineWidth=1; g.beginPath(); g.moveTo(10,base); g.lineTo(w-10,base); g.stroke();
    for(let i=0;i<34;i++){
      const x=16+R()*(w-32), len=h*(.5+R()*.28), red=R()<.12, sway=Math.sin(t*.9+i*.7)*6;
      const bend=(R()-.5)*30+sway;
      g.strokeStyle=`rgba(${red?CR:CH},${red?.95:.4+R()*.5})`; g.lineWidth=red?1.4:1.1;
      g.beginPath(); g.moveTo(x,base); g.bezierCurveTo(x+bend*.2,base-len*.4,x+bend*.9,base-len*.7,x+bend,base-len); g.stroke();
      g.fillStyle=`rgba(${red?CR:CH},${red?1:.6})`; g.beginPath(); g.arc(x,base+2,red?2:1.3,0,Math.PI*2); g.fill();
    }
  } else if(kind==='donor'){
    // donor area: follicular units on a grid, the safe zone dashed, harvests spread out (in red)
    const cols=9, rows=4;
    g.setLineDash([3,5]); g.strokeStyle=`rgba(${CR},.55)`; g.lineWidth=1;
    const zy=18+((h-36)/(rows-1))*.5-12, zh=((h-36)/(rows-1))*2+24;
    g.beginPath(); g.roundRect?g.roundRect(8,zy,w-16,zh,12):g.rect(8,zy,w-16,zh); g.stroke(); g.setLineDash([]);
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const cx=18+c*((w-36)/(cols-1))+(R()-.5)*6, cy=18+r*((h-36)/(rows-1))+(R()-.5)*6;
      const n=1+Math.floor(R()*4), inZone=r===1||r===2, pick=inZone&&(c+r*2)%3===0;
      const pulse=pick?1+Math.sin(t*2+c)*.12:1;
      g.strokeStyle=pick?`rgba(${CR},.95)`:`rgba(${CH},${inZone?.35:.18})`; g.lineWidth=1;
      g.beginPath(); g.arc(cx,cy,(pick?7.5:6)*pulse,0,Math.PI*2); g.stroke();
      for(let k=0;k<n;k++){g.fillStyle=pick?`rgba(${CR},1)`:`rgba(${CH},${inZone?.8:.4})`;g.beginPath();g.arc(cx+(k-(n-1)/2)*2.6,cy,1.1,0,Math.PI*2);g.fill()}
    }
  } else {
    // corrective: an old, pluggy straight line on the left refined into a soft natural hairline on the right
    const mid=w/2, y0=h*.62;
    for(let x=14;x<mid-18;x+=13){
      for(let k=0;k<5;k++){
        const xx=x+(k-2)*1.6, a=-Math.PI/2+(k-2)*.06;
        g.strokeStyle=`rgba(${CH},.35)`; g.lineWidth=1.1;
        g.beginPath(); g.moveTo(xx,y0); g.lineTo(xx+Math.cos(a)*16,y0+Math.sin(a)*16); g.stroke();
      }
    }
    g.strokeStyle=`rgba(${CH},.3)`; g.setLineDash([2,4]); g.beginPath(); g.moveTo(14,y0+3); g.lineTo(mid-18,y0+3); g.stroke(); g.setLineDash([]);
    const ax=mid+Math.sin(t*1.5)*2; g.strokeStyle=`rgba(${CR},.9)`; g.lineWidth=1.4;
    g.beginPath(); g.moveTo(ax-10,y0-8); g.lineTo(ax+8,y0-8); g.moveTo(ax+3,y0-13); g.lineTo(ax+8,y0-8); g.lineTo(ax+3,y0-3); g.stroke();
    for(let i=0;i<80;i++){
      const u=R(), x=mid+18+u*(w-mid-32), base=y0-Math.sin(u*Math.PI)*h*.12+(R()-.5)*10;
      const len=10+R()*14, a=-Math.PI/2+(u-.5)*.7+Math.sin(t+i)*.05;
      g.strokeStyle=`rgba(${R()<.1?CR:CH},${.4+R()*.55})`; g.lineWidth=1;
      g.beginPath(); g.moveTo(x,base); g.quadraticCurveTo(x+Math.cos(a)*len*.5+2,base+Math.sin(a)*len*.5,x+Math.cos(a)*len,base+Math.sin(a)*len); g.stroke();
    }
  }
}
