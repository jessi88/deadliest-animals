import {
  animals, INTRO, MIDDLE, LATE, ALL_WHEEL, BREAKAWAYS, ALL_NAMES,
  WHEEL_MAX, FULL_MAX, scenes,
} from '../data/animals.js';
import {
  format, formatScale, reducedMotion, svgEl, polar, lerp, ease,
  annularPath, outerRadius, tooltipHTML, positionFloatingTooltip,
} from './chartUtils.js';

export function buildPolarChart(){
      const svg=document.getElementById('polarChart'),tooltip=document.getElementById('chartTooltip');
      const visualRow=document.getElementById('visualRow'),filterPanel=document.getElementById('storyFilters'),filters=document.getElementById('animalFilters');
      const selectAllBtn=document.getElementById('selectAllAnimals'),clearBtn=document.getElementById('clearAnimals'),sceneBadge=document.getElementById('sceneBadge');
      const cx=480,cy=392,innerR=84,outerR=275,labelR=360,gap=.017;
      const gridG=svgEl('g'),sectorsG=svgEl('g'),leadersG=svgEl('g'),markersG=svgEl('g'),labelsG=svgEl('g'),centerG=svgEl('g');svg.append(gridG,sectorsG,leadersG,markersG,labelsG,centerG);
      const nodeMap=new Map();let token=0,rafIds=[],timers=[],active=-1,exploreInitialized=false,exploreMax=FULL_MAX;
      let exploreSelected=new Set(ALL_NAMES);

      const showTooltip=(d,e)=>{tooltip.innerHTML=tooltipHTML(d);tooltip.classList.add('show');tooltip.setAttribute('aria-hidden','false');positionFloatingTooltip(tooltip,e.clientX||innerWidth/2,e.clientY||innerHeight/2)};
      const moveTooltip=e=>{if(tooltip.classList.contains('show'))positionFloatingTooltip(tooltip,e.clientX,e.clientY)};
      const hideTooltip=()=>{tooltip.classList.remove('show');tooltip.setAttribute('aria-hidden','true')};
      function bindTooltip(node,d){
        node.addEventListener('pointerenter',e=>showTooltip(d,e));
        node.addEventListener('pointermove',moveTooltip);
        node.addEventListener('pointerleave',hideTooltip);
        node.addEventListener('focus',()=>{const r=node.getBoundingClientRect();showTooltip(d,{clientX:r.left+r.width/2,clientY:r.top+r.height/2})});
        node.addEventListener('blur',hideTooltip);
        node.addEventListener('click',e=>{e.stopPropagation();showTooltip(d,e)})
      }
      document.addEventListener('pointerdown',e=>{if(!e.target.closest?.('.sector,.animal-marker'))hideTooltip()});
      function cancelAnimations(){token++;rafIds.forEach(cancelAnimationFrame);rafIds=[];timers.forEach(clearTimeout);timers=[]}
      function later(fn,delay){const id=setTimeout(fn,delay);timers.push(id);return id}
      function frame(fn){const id=requestAnimationFrame(fn);rafIds.push(id);return id}
      function tween(duration,delay,update,done){const my=token;if(reducedMotion){later(()=>{if(my===token){update(1);done&&done()}},delay);return}later(()=>{if(my!==token)return;const start=performance.now();const tick=now=>{if(my!==token)return;const t=Math.min(1,(now-start)/duration);update(ease(t));if(t<1)frame(tick);else done&&done()};frame(tick)},delay)}
      function slotsFor(mode){if(mode==='local')return animals.filter(d=>INTRO.includes(d.name));if(mode==='wide')return animals.filter(d=>ALL_WHEEL.includes(d.name));return animals}
      function geometryFor(d,mode){const slots=slotsFor(mode),idx=slots.findIndex(x=>x.name===d.name);if(idx<0)return null;const slice=Math.PI*2/slots.length,start=-Math.PI/2-slice/2,a0=start+idx*slice+gap,a1=start+(idx+1)*slice-gap;return{a0,a1,mid:(a0+a1)/2}}
      function markerScale(mode){return mode==='full'||mode==='explore'?.82:1}
      function markerPos(g){return polar(cx,cy,g.mid,labelR)}
      function leaderEnds(g,r){return{from:polar(cx,cy,g.mid,Math.max(innerR+18,r+5)),to:polar(cx,cy,g.mid,labelR-38)}}
      function setMarkerTransform(marker,pos,scale=1){marker.setAttribute('transform',`translate(${pos.x} ${pos.y}) scale(${scale})`)}
      function setAnimalGeometry(d,mode,max,{opacity=.92,markerOpacity=.88,leaderOpacity=.32,scale=markerScale(mode)}={}){const n=nodeMap.get(d.name),g=geometryFor(d,mode);if(!n||!g)return;const r=outerRadius(d.value,max,innerR,outerR),pos=markerPos(g),le=leaderEnds(g,r);n.sector.setAttribute('d',annularPath(cx,cy,g.a0,g.a1,innerR,r));n.sector.style.opacity=opacity;n.leader.setAttribute('x1',le.from.x);n.leader.setAttribute('y1',le.from.y);n.leader.setAttribute('x2',le.to.x);n.leader.setAttribute('y2',le.to.y);n.leader.style.opacity=leaderOpacity;setMarkerTransform(n.marker,pos,scale);n.marker.style.opacity=markerOpacity;n.currentR=r;n.currentSectorOpacity=opacity;n.currentMarkerOpacity=markerOpacity;n.currentLeaderOpacity=leaderOpacity}
      function hideAnimal(d,mode='full'){const n=nodeMap.get(d.name),g=geometryFor(d,mode)||geometryFor(d,'full');if(!n||!g)return;n.sector.setAttribute('d',annularPath(cx,cy,g.a0,g.a1,innerR,innerR+.1));n.sector.style.opacity=0;n.leader.style.opacity=0;setMarkerTransform(n.marker,markerPos(g),markerScale(mode)*.78);n.marker.style.opacity=0;n.currentR=innerR+.1;n.currentSectorOpacity=0;n.currentMarkerOpacity=0;n.currentLeaderOpacity=0}
      function setFocus(visibleNames,focusNames=[]){const vis=new Set(visibleNames),focus=new Set(focusNames),hasFocus=focus.size>0;animals.forEach(d=>{if(!vis.has(d.name))return;const n=nodeMap.get(d.name),so=hasFocus?(focus.has(d.name)?.98:.25):.9,mo=hasFocus?(focus.has(d.name)?1:.48):.84,lo=hasFocus?(focus.has(d.name)?.82:.14):.28;n.sector.style.opacity=so;n.marker.style.opacity=mo;n.leader.style.opacity=lo;n.currentSectorOpacity=so;n.currentMarkerOpacity=mo;n.currentLeaderOpacity=lo})}
      function animateIn(d,mode,max,delay,duration=620){const n=nodeMap.get(d.name),g=geometryFor(d,mode);if(!n||!g)return;const r1=outerRadius(d.value,max,innerR,outerR),pos=markerPos(g),le=leaderEnds(g,r1),targetScale=markerScale(mode);n.sector.setAttribute('d',annularPath(cx,cy,g.a0,g.a1,innerR,innerR+.1));n.sector.style.opacity=0;n.leader.setAttribute('x1',le.from.x);n.leader.setAttribute('y1',le.from.y);n.leader.setAttribute('x2',le.to.x);n.leader.setAttribute('y2',le.to.y);n.leader.style.opacity=0;setMarkerTransform(n.marker,pos,targetScale*.72);n.marker.style.opacity=0;n.currentR=innerR+.1;tween(duration,delay,t=>{const r=lerp(innerR+.1,r1,t);n.sector.setAttribute('d',annularPath(cx,cy,g.a0,g.a1,innerR,r));n.sector.style.opacity=.98*t;n.leader.style.opacity=.8*t;n.marker.style.opacity=t;setMarkerTransform(n.marker,pos,targetScale*(.72+.28*t));n.currentR=r;n.currentSectorOpacity=.98*t;n.currentLeaderOpacity=.8*t;n.currentMarkerOpacity=t})}
      function animateMove(d,fromMode,fromMax,toMode,toMax,delay,duration=1050,reveal=false){const n=nodeMap.get(d.name),g0=geometryFor(d,fromMode),g1=geometryFor(d,toMode);if(!n||!g0||!g1)return;const r0=outerRadius(d.value,fromMax,innerR,outerR),r1=outerRadius(d.value,toMax,innerR,outerR),p0=markerPos(g0),p1=markerPos(g1),s0=markerScale(fromMode),s1=markerScale(toMode);n.sector.setAttribute('d',annularPath(cx,cy,g0.a0,g0.a1,innerR,r0));setMarkerTransform(n.marker,p0,s0);n.sector.style.opacity=reveal?0:.98;n.marker.style.opacity=reveal?0:1;n.leader.style.opacity=reveal?0:.75;n.currentR=r0;tween(duration,delay,t=>{const g={a0:lerp(g0.a0,g1.a0,t),a1:lerp(g0.a1,g1.a1,t),mid:lerp(g0.mid,g1.mid,t)},r=lerp(r0,r1,t),p={x:lerp(p0.x,p1.x,t),y:lerp(p0.y,p1.y,t)},le=leaderEnds(g,r),op=reveal?t:1;n.sector.setAttribute('d',annularPath(cx,cy,g.a0,g.a1,innerR,r));n.leader.setAttribute('x1',le.from.x);n.leader.setAttribute('y1',le.from.y);n.leader.setAttribute('x2',le.to.x);n.leader.setAttribute('y2',le.to.y);setMarkerTransform(n.marker,p,lerp(s0,s1,t));n.sector.style.opacity=.98*op;n.marker.style.opacity=op;n.leader.style.opacity=.75*op;n.currentR=r;n.currentSectorOpacity=.98*op;n.currentMarkerOpacity=op;n.currentLeaderOpacity=.75*op})}

      animals.forEach(d=>{
        const sector=svgEl('path',{class:'sector',tabindex:'0',role:'img','aria-label':`${d.name}: ${d.display||format(d.value)} rounded annual death estimate`});sectorsG.appendChild(sector);
        const leader=svgEl('line',{class:'leader'});leadersG.appendChild(leader);
        const marker=svgEl('g',{class:'animal-marker',tabindex:'0',role:'img','aria-label':`${d.name}: ${d.display||format(d.value)} rounded annual death estimate`});
        const hit=svgEl('rect',{x:-38,y:-61,width:76,height:114,rx:8,class:'marker-hitbox','aria-hidden':'true'});
        const name=svgEl('text',{x:0,y:-45,'text-anchor':'middle',class:'animal-name'});name.textContent=d.short;
        const icon=svgEl('image',{href:d.iconUrl,x:-30,y:-30,width:60,height:60,preserveAspectRatio:'xMidYMid meet',class:'animal-art'});
        const value=svgEl('text',{x:0,y:38,'text-anchor':'middle',class:'animal-value'});value.textContent=d.display||format(d.value);
        marker.append(hit,name,icon,value);markersG.appendChild(marker);nodeMap.set(d.name,{sector,leader,marker,currentR:innerR+.1,currentSectorOpacity:0,currentMarkerOpacity:0,currentLeaderOpacity:0});
        bindTooltip(sector,d);bindTooltip(marker,d);hideAnimal(d,'full')
      });

      animals.forEach(d=>{const label=document.createElement('label');label.className='animal-filter';label.innerHTML=`<input type="checkbox" checked value="${d.name.replace(/"/g,'&quot;')}"><span title="${d.name}">${d.short}</span><em>${d.display||format(d.value)}</em>`;filters.appendChild(label)});
      function syncFilterChecks(){filters.querySelectorAll('input[type=checkbox]').forEach(input=>input.checked=exploreSelected.has(input.value))}
      function niceMax(value){const stops=[10,20,50,100,200,500,1000,2000,5000,10000,20000,40000,100000,200000,400000,800000];return stops.find(x=>value<=x)||800000}

      function drawGrid(mode,max,selectedCount=null){
        gridG.innerHTML='';labelsG.innerHTML='';centerG.innerHTML='';
        [.25,.5,.75,1].forEach((t,i)=>gridG.appendChild(svgEl('circle',{cx,cy,r:Math.sqrt(innerR*innerR+(outerR*outerR-innerR*innerR)*t),class:`grid-ring ${i===3?'major':''}`})));
        const slots=slotsFor(mode),slice=Math.PI*2/slots.length,start=-Math.PI/2-slice/2;
        slots.forEach((d,i)=>{const mid=start+i*slice+slice/2,p0=polar(cx,cy,mid,innerR-10),p1=polar(cx,cy,mid,outerR+8);gridG.appendChild(svgEl('line',{x1:p0.x,y1:p0.y,x2:p1.x,y2:p1.y,class:'spoke'}))});
        [.25,.5,.75,1].forEach(t=>{const r=Math.sqrt(innerR*innerR+(outerR*outerR-innerR*innerR)*t),p=polar(cx,cy,-Math.PI/2,r),txt=svgEl('text',{x:cx+8,y:p.y+3,class:'ring-label'});txt.textContent=format(Math.round(max*t));labelsG.appendChild(txt)});
        centerG.appendChild(svgEl('circle',{cx,cy,r:innerR-10,class:'center-ring'}));
        let labels;
        if(mode==='local')labels=['0–200','Wolves → crocodiles'];
        else if(mode==='wide')labels=['0–40k','Wolves → dogs'];
        else if(mode==='explore')labels=[`0–${formatScale(max)}`,`${selectedCount??exploreSelected.size} selected`];
        else labels=['0–800k','Wolves → mosquitoes'];
        const ck=svgEl('text',{x:cx,y:cy-18,'text-anchor':'middle',class:'center-kicker'});ck.textContent='SCALE';
        const cm=svgEl('text',{x:cx,y:cy+7,'text-anchor':'middle',class:'center-main'});cm.textContent=labels[0];
        const cn=svgEl('text',{x:cx,y:cy+29,'text-anchor':'middle',class:'center-note'});cn.textContent=labels[1];
        centerG.append(ck,cm,cn)
      }
      function snap(visible,mode,max,focus=[]){const vis=new Set(visible);animals.forEach(d=>vis.has(d.name)?setAnimalGeometry(d,mode,max):hideAnimal(d,mode));setFocus(visible,focus)}
      function setExploreUI(on){filterPanel.hidden=!on;visualRow.classList.toggle('explore-mode',on);sceneBadge.style.display=on?'none':''}
      function updateHeader(scene){document.getElementById('chartHeading').textContent=scene.heading;document.getElementById('chartSubtitle').textContent=scene.subtitle;document.getElementById('scaleLabel').textContent=scene.mode==='explore'?'Current scale':'Wheel maximum';document.getElementById('scaleValue').textContent=scene.scaleValue;sceneBadge.querySelector('span').textContent=scene.badge}
      function updateExploreScale(max){document.getElementById('scaleValue').textContent=format(max);document.getElementById('chartSubtitle').textContent=`${exploreSelected.size} selected · radial scale adapts to the largest selected estimate`}

      function animateExploreSelection(nextSelected){
        cancelAnimations();
        const nextVals=animals.filter(d=>nextSelected.has(d.name)).map(d=>d.value);
        const nextMax=nextVals.length?niceMax(Math.max(...nextVals)):200;
        drawGrid('explore',nextMax,nextSelected.size);
        const mode='explore',duration=reducedMotion?0:650;
        const starts=new Map();
        animals.forEach(d=>{const n=nodeMap.get(d.name);starts.set(d.name,{r:n.currentR??innerR+.1,so:n.currentSectorOpacity??0,mo:n.currentMarkerOpacity??0,lo:n.currentLeaderOpacity??0})});
        const my=token,startTime=performance.now();
        const run=now=>{
          if(my!==token)return;
          const raw=duration?Math.min(1,(now-startTime)/duration):1,t=ease(raw);
          animals.forEach(d=>{
            const n=nodeMap.get(d.name),g=geometryFor(d,mode),on=nextSelected.has(d.name),st=starts.get(d.name);
            const r1=on?outerRadius(d.value,nextMax,innerR,outerR):innerR+.1;
            const r=lerp(st.r,r1,t),pos=markerPos(g),le=leaderEnds(g,r),so=lerp(st.so,on?.9:0,t),mo=lerp(st.mo,on?.84:0,t),lo=lerp(st.lo,on?.28:0,t);
            n.sector.setAttribute('d',annularPath(cx,cy,g.a0,g.a1,innerR,r));n.sector.style.opacity=so;
            n.leader.setAttribute('x1',le.from.x);n.leader.setAttribute('y1',le.from.y);n.leader.setAttribute('x2',le.to.x);n.leader.setAttribute('y2',le.to.y);n.leader.style.opacity=lo;
            setMarkerTransform(n.marker,pos,markerScale(mode));n.marker.style.opacity=mo;
            n.currentR=r;n.currentSectorOpacity=so;n.currentMarkerOpacity=mo;n.currentLeaderOpacity=lo
          });
          if(raw<1)frame(run);else{exploreSelected=new Set(nextSelected);exploreMax=nextMax;syncFilterChecks();updateExploreScale(nextMax)}
        };
        frame(run)
      }

      filters.addEventListener('change',e=>{
        if(!e.target.matches('input[type=checkbox]'))return;
        const next=new Set(exploreSelected);
        if(e.target.checked)next.add(e.target.value);else next.delete(e.target.value);
        animateExploreSelection(next)
      });
      selectAllBtn.addEventListener('click',()=>animateExploreSelection(new Set(ALL_NAMES)));
      clearBtn.addEventListener('click',()=>animateExploreSelection(new Set()));

      function render(i){
        if(i===active)return;
        const prev=active,forward=prev<0||i>prev;active=i;cancelAnimations();
        const scene=scenes[i];updateHeader(scene);setExploreUI(i===8);

        if(i===0){drawGrid('local',200);animals.forEach(d=>hideAnimal(d,INTRO.includes(d.name)?'local':'full'));INTRO.forEach((name,idx)=>animateIn(animals.find(a=>a.name===name),'local',200,180+idx*240,650));document.getElementById('chartDesc').textContent='Wolves through crocodiles enter one by one on a local zero to two hundred scale.'}
        else if(i===1){drawGrid('wide',WHEEL_MAX);animals.filter(d=>!INTRO.includes(d.name)).forEach(d=>hideAnimal(d,'wide'));if(prev===0&&forward){INTRO.forEach(name=>setAnimalGeometry(animals.find(a=>a.name===name),'local',200));INTRO.forEach((name,idx)=>animateMove(animals.find(a=>a.name===name),'local',200,'wide',WHEEL_MAX,90+idx*55,1150,false))}else snap(INTRO,'wide',WHEEL_MAX,INTRO);document.getElementById('chartDesc').textContent='The opening animals smoothly transition to their positions on the zero to forty thousand scale.'}
        else if(i===2){drawGrid('wide',WHEEL_MAX);snap(INTRO,'wide',WHEEL_MAX,[]);MIDDLE.forEach(n=>hideAnimal(animals.find(a=>a.name===n),'wide'));LATE.forEach(n=>hideAnimal(animals.find(a=>a.name===n),'wide'));BREAKAWAYS.forEach(n=>hideAnimal(animals.find(a=>a.name===n),'full'));if(forward){MIDDLE.forEach((name,idx)=>animateIn(animals.find(a=>a.name===name),'wide',WHEEL_MAX,170+idx*180,650));later(()=>setFocus([...INTRO,...MIDDLE],MIDDLE),170+MIDDLE.length*180+660)}else snap([...INTRO,...MIDDLE],'wide',WHEEL_MAX,MIDDLE);document.getElementById('chartDesc').textContent='Big cats through roundworms enter the zero to forty thousand wheel one by one.'}
        else if(i===3){drawGrid('wide',WHEEL_MAX);snap([...INTRO,...MIDDLE],'wide',WHEEL_MAX,[]);LATE.forEach(n=>hideAnimal(animals.find(a=>a.name===n),'wide'));BREAKAWAYS.forEach(n=>hideAnimal(animals.find(a=>a.name===n),'full'));if(forward){LATE.forEach((name,idx)=>animateIn(animals.find(a=>a.name===name),'wide',WHEEL_MAX,180+idx*220,700));later(()=>setFocus(ALL_WHEEL,LATE),180+LATE.length*220+710)}else snap(ALL_WHEEL,'wide',WHEEL_MAX,LATE);document.getElementById('chartDesc').textContent='Sandflies through dogs complete the zero to forty thousand wheel.'}
        else if(i===4){drawGrid('full',FULL_MAX);animals.forEach(d=>hideAnimal(d,'full'));if(prev===3&&forward){ALL_WHEEL.forEach(name=>setAnimalGeometry(animals.find(a=>a.name===name),'wide',WHEEL_MAX,{opacity:0,markerOpacity:0,leaderOpacity:0}));ALL_WHEEL.forEach((name,idx)=>animateMove(animals.find(a=>a.name===name),'wide',WHEEL_MAX,'full',FULL_MAX,420+idx*28,1050,true))}else snap(ALL_WHEEL,'full',FULL_MAX,[]);document.getElementById('chartDesc').textContent='An empty zero to eight hundred thousand wheel appears, then wolves through dogs move smoothly into their positions on the new scale.'}
        else if(i===5){drawGrid('full',FULL_MAX);snap(ALL_WHEEL,'full',FULL_MAX,[]);['Humans','Mosquitoes'].forEach(n=>hideAnimal(animals.find(a=>a.name===n),'full'));if(forward){animateIn(animals.find(a=>a.name==='Snakes'),'full',FULL_MAX,200,800);later(()=>setFocus([...ALL_WHEEL,'Snakes'],['Snakes']),1050)}else snap([...ALL_WHEEL,'Snakes'],'full',FULL_MAX,['Snakes']);document.getElementById('chartDesc').textContent='Snakes enter the full zero to eight hundred thousand polar chart at a rounded annual estimate of about one hundred thousand deaths.'}
        else if(i===6){drawGrid('full',FULL_MAX);snap([...ALL_WHEEL,'Snakes'],'full',FULL_MAX,[]);hideAnimal(animals.find(a=>a.name==='Mosquitoes'),'full');if(forward){animateIn(animals.find(a=>a.name==='Humans'),'full',FULL_MAX,200,850);later(()=>setFocus([...ALL_WHEEL,'Snakes','Humans'],['Humans']),1100)}else snap([...ALL_WHEEL,'Snakes','Humans'],'full',FULL_MAX,['Humans']);document.getElementById('chartDesc').textContent='Humans enter the full polar chart at a rounded annual estimate of about six hundred thousand deaths.'}
        else if(i===7){drawGrid('full',FULL_MAX);snap([...ALL_WHEEL,'Snakes','Humans'],'full',FULL_MAX,[]);if(forward){animateIn(animals.find(a=>a.name==='Mosquitoes'),'full',FULL_MAX,200,900);later(()=>setFocus(ALL_NAMES,['Mosquitoes']),1150)}else snap(ALL_NAMES,'full',FULL_MAX,['Mosquitoes']);document.getElementById('chartDesc').textContent='Mosquitoes complete the full polar chart at a rounded annual estimate of about seven hundred sixty thousand deaths.'}
        else{
          if(!exploreInitialized){exploreSelected=new Set(ALL_NAMES);exploreMax=FULL_MAX;exploreInitialized=true}
          syncFilterChecks();drawGrid('explore',exploreMax,exploreSelected.size);
          const visible=[...exploreSelected];animals.forEach(d=>exploreSelected.has(d.name)?setAnimalGeometry(d,'explore',exploreMax):hideAnimal(d,'explore'));
          setFocus(visible,[]);updateExploreScale(exploreMax);
          document.getElementById('chartDesc').textContent='The same final polar chart is interactive. Filters change which animals are visible and the radial scale adapts to the largest selected estimate.'
        }
      }

      drawGrid('local',200);animals.forEach(d=>hideAnimal(d,'full'));
      const steps=[...document.querySelectorAll('.step')];steps.forEach(s=>s.classList.remove('is-active'));
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){steps.forEach(s=>s.classList.remove('is-active'));entry.target.classList.add('is-active');render(+entry.target.dataset.scene)}}),{rootMargin:'-42% 0px -42% 0px',threshold:0});
      steps.forEach(s=>observer.observe(s));
    }
