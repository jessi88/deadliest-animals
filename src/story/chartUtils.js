export const NS='http://www.w3.org/2000/svg';
    export const format=n=>n.toLocaleString('en-US');
    export const formatScale=n=>n>=1000?(n/1000)+'k':String(n);
    export const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    export const svgEl=(tag,attrs={})=>{const node=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))node.setAttribute(k,v);return node};
    export const polar=(cx,cy,a,r)=>({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});
    export const lerp=(a,b,t)=>a+(b-a)*t;
    export const ease=t=>1-Math.pow(1-t,3);
    export function annularPath(cx,cy,a0,a1,r0,r1){if(r1<r0+.1)r1=r0+.1;const p0=polar(cx,cy,a0,r1),p1=polar(cx,cy,a1,r1),p2=polar(cx,cy,a1,r0),p3=polar(cx,cy,a0,r0),large=(a1-a0)>Math.PI?1:0;return`M ${p3.x} ${p3.y} L ${p0.x} ${p0.y} A ${r1} ${r1} 0 ${large} 1 ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${r0} ${r0} 0 ${large} 0 ${p3.x} ${p3.y} Z`}
    export function outerRadius(value,max,innerR,outerR){const t=Math.max(0,Math.min(value,max))/max;return Math.sqrt(innerR*innerR+(outerR*outerR-innerR*innerR)*t)}
    export function tooltipHTML(d){return `<div class="tooltip-kicker">Our World in Data · rounded annual estimate</div><div class="tooltip-title">${d.name}</div><div class="tooltip-value">${d.display||format(d.value)} / year</div><div class="tooltip-mechanism">${d.mechanism}</div><div class="tooltip-fact">${d.fact}</div>`}
    export function positionFloatingTooltip(el,x,y){const pad=14,w=el.offsetWidth||330,h=el.offsetHeight||170;let left=x+16,top=y+16;if(left+w>innerWidth-pad)left=x-w-16;if(top+h>innerHeight-pad)top=y-h-16;el.style.left=`${Math.max(pad,left)}px`;el.style.top=`${Math.max(pad,top)}px`}
