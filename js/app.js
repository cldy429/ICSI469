// NAADAM frontend — simulated sport events are explicitly marked as DEMO.
import {LEGENDS,winChance} from './data.js';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const pages=['home','wrestling','racing','archery','live'];
const firstNames=['Хээр','Зээрд','Хул','Халиун','Хар','Бор'];
const riderNames=['Б. Отгонбаатар','Д. Наранболд','С. Батжаргал','Г. Эрдэнэбат','П. Алтансүх','Ж. Төгөлдөр'];
const horseColors=['#9f573f','#c0a77f','#725042','#c57843','#6d6d70','#ac8961'];
let currentPage='home', racePaused=false,age='Азарга',sse=null,sseActive=false,soundOn=false,audioCtx=null;
let raceFinished=false,matchStep=0,racers=[],raceTick=0,selectedRacer=0,lastDataTime=Date.now();
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function seedRacers(ageName='Азарга') {let off=ageName==='Азарга'?0:ageName==='Соёолон'?2:5;return firstNames.map((n,i)=>({id:i,name:n,rider:riderNames[i],color:horseColors[i],progress:Math.max(0,14+((i*5+off)%9)-i*.4),speed:47+(i*7)%13,age:ageName}));}
racers=seedRacers();
function fmt(n,d=1){return Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})}
function sound(freq=440,dur=.1){if(!soundOn)return;try{audioCtx ||=new(window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(freq,audioCtx.currentTime);g.gain.setValueAtTime(.06,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur)}catch{}}
function go(page){if(!pages.includes(page))page='home';currentPage=page;$$('.page').forEach(e=>{e.classList.toggle('active',e.id==='page-'+page)});$$('[data-route]').forEach(a=>{a.classList.toggle('active',a.dataset.route===page)});$('#mobile-nav').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');window.scrollTo({top:0,behavior:reducedMotion?'instant':'smooth'});if(page==='racing'||page==='live')renderRace();if(page==='wrestling'||page==='live')renderBracket();if(page==='archery'||page==='live')renderArchery();emit('page',{page});sound(490,.08)}
function emit(name,detail){(window.naadamLast||={})[name]=detail;window.dispatchEvent(new CustomEvent('naadam:'+name,{detail}))}
function onHash(){go((location.hash||'#home').slice(1))}
window.addEventListener('hashchange',onHash);
$$('[data-route]').forEach(a=>a.addEventListener('click',()=>{if(location.hash.slice(1)===a.dataset.route)go(a.dataset.route)}));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>{location.hash=b.dataset.go;if(currentPage===b.dataset.go)go(b.dataset.go)}));
$('#menu-toggle').addEventListener('click',()=>{const menu=$('#mobile-nav');menu.hidden=!menu.hidden;$('#menu-toggle').setAttribute('aria-expanded',String(!menu.hidden))});
$('#sound-toggle').addEventListener('click',()=>{soundOn=!soundOn;$('#sound-toggle').setAttribute('aria-pressed',String(soundOn));if(soundOn)sound(660,.12)});


function renderRace(){let sorted=[...racers].sort((a,b)=>b.progress-a.progress);$('#racer-count').textContent=`${String(sorted.length).padStart(2,'0')} / 06`;
  $('#leaderboard').innerHTML=sorted.map((r,i)=>`<button type="button" class="leader-row ${r.id===selectedRacer?'selected':''}" data-racer="${r.id}" aria-label="${r.name} морины явцыг харах"><span class="leader-rank">${String(i+1).padStart(2,'0')}</span><span class="horse-dot" style="--horse-color:${r.color}">♞</span><span class="leader-name"><b>${r.name}</b><small>${r.rider}</small></span><span class="leader-value">${fmt(r.speed)} <small>км/ц</small></span></button>`).join('');
  $('#leaderboard').querySelectorAll('[data-racer]').forEach(el=>el.addEventListener('click',()=>{selectRacer(Number(el.dataset.racer))}));
  const leader=sorted[0];let max=leader?.progress||0;$('#race-distance').textContent=`${Math.round(max*180).toLocaleString('en-US')} / 18,000 м`;$('#track-fill').style.width=`${Math.max(0,Math.min(100,max))}%`;$('#top-speed').textContent=`${fmt(leader?.speed||0)} км/ц`;$('#last-update').textContent=new Date(lastDataTime).toLocaleTimeString('mn-MN',{hour12:false});$('#race-phase').textContent=max>=100?'Барианд ирлээ':racePaused?'Түр зогсоосон':'Уралдаан үргэлжилж байна';emit('race',{sorted,paused:racePaused,selected:selectedRacer});if(max>=100&&!raceFinished){raceFinished=true;emit('race-finish',{podium:sorted.slice(0,3)})}if(max<100)raceFinished=false;
}
function selectRacer(i){selectedRacer=i;renderRace();sound(520,.055)}
const watchingRace=()=>currentPage==='racing'||currentPage==='live';
function advanceRace(){if(racePaused||sseActive)return;raceTick++;racers=racers.map((r,i)=>({...r,progress:Math.min(100,r.progress+(r.speed/3.6)/18000*100*1.2*(9.8+Math.sin(raceTick*.25+i)*.7)),speed:Math.max(35,Math.min(69,r.speed+Math.sin(raceTick*.37+i)*.85))}));if(racers.every(r=>r.progress>=100)){raceTick=0;racers=seedRacers(age)}lastDataTime=Date.now();if(watchingRace())renderRace()}
function ageChange(newAge){age=newAge;raceTick=0;racers=seedRacers(age);selectedRacer=0;$$('.age-tab').forEach(el=>el.classList.toggle('active',el.dataset.age===age));lastDataTime=Date.now();renderRace();sound(600,.09)}
$$('.age-tab').forEach(e=>e.addEventListener('click',()=>ageChange(e.dataset.age)));
$('#race-pause').addEventListener('click',()=>{racePaused=!racePaused;$('#race-pause').innerHTML=racePaused?'▶ <span>Үргэлжлүүлэх</span>':'Ⅱ <span>Зогсоох</span>';renderRace()});
setInterval(advanceRace,1200);

// EventSource is an actual streaming transport. Data from the bundled server is simulated, NOT official results.
function connectStream(){if(location.protocol==='file:')return;let opened=false;try{const es=new EventSource('/api/events');sse=es;es.onopen=()=>{opened=true;sseActive=true;$('#stream-status').textContent='DEMO · SSE STREAM'};es.onmessage=event=>{try{const packet=JSON.parse(event.data);if(packet.type==='race'&&!racePaused&&age==='Азарга'&&Array.isArray(packet.horses)){racers=packet.horses.map((h,i)=>({...h,id:i,name:firstNames[i],rider:riderNames[i],color:horseColors[i],age:'Азарга'}));lastDataTime=Date.now();if(watchingRace())renderRace()}}catch(e){console.warn('Skipped bad stream packet',e)}};es.onerror=()=>{sseActive=false;es.close();$('#stream-status').textContent='DEMO · LOCAL STREAM'};setTimeout(()=>{if(!opened){es.close();sseActive=false}},5000)}catch{}}
connectStream();

const fighters=LEGENDS.map(l=>l.name);
// 7 bouts: 0–3 first round, 4–5 semi-finals, 6 final. Winners are drawn from winChance(), so every run differs.
let boutWinners=[];
function boutPair(i){if(i<4)return [i*2,i*2+1];if(i<6){const k=(i-4)*2;return [boutWinners[k],boutWinners[k+1]]}return [boutWinners[4],boutWinners[5]]}
function bracketFighter(i,win){return `<button type="button" class="fighter ${win?'winner':''}" data-fighter="${i}"><b>${fighters[i]}</b><small>${win?'●':'◦'}</small></button>`}
function renderBracket(){const round1=Array.from({length:4},(_,i)=>{let [a,b]=boutPair(i),w=matchStep>i?boutWinners[i]:-1;return `<div class="match-pair">${bracketFighter(a,w===a)}${bracketFighter(b,w===b)}</div>`}).join('');const round2=Array.from({length:2},(_,i)=>{let ready=matchStep>=4;if(!ready)return '<div class="match-pair"><div class="fighter">Тодорхойгүй</div><div class="fighter">Тодорхойгүй</div></div>';let [a,b]=boutPair(4+i),win=matchStep>4+i?boutWinners[4+i]:-1;return `<div class="match-pair">${bracketFighter(a,win===a)+bracketFighter(b,win===b)}</div>`}).join('');
  $('#bracket').innerHTML=`<div class="bracket-first">${round1}</div><div class="bracket-middle">⟶<br/><br/>⟶</div><div class="bracket-second">${round2}</div>`;$('#match-callout').textContent=matchStep>=7?`${fighters[boutWinners[6]]} — ТҮРҮҮЛЛЭЭ`:matchStep===0?'БАРИЛДААН ЭХЭЛЛЭЭ':`${matchStep} / 7 БАРИЛДААН ДУУСЛАА`;$('#next-match').disabled=matchStep>=7;$('#next-match').textContent=matchStep>=7?'ТЭМЦЭЭН ДУУСЛАА':'ДАРААГИЙН БАРИЛДААН →';
  emit('bracket',{step:matchStep,next:matchStep<7?boutPair(matchStep):null,winners:[...boutWinners]});}
$('#next-match').addEventListener('click',()=>{if(matchStep>=7)return;const [a,b]=boutPair(matchStep),p=winChance(LEGENDS[a],LEGENDS[b]),w=Math.random()<p?a:b;boutWinners[matchStep]=w;matchStep++;renderBracket();emit('bout',{winner:w,loser:w===a?b:a,chance:w===a?p:1-p,final:matchStep===7,step:matchStep});sound(480,.12)});
$('#reset-bracket').addEventListener('click',()=>{matchStep=0;boutWinners=[];renderBracket()});

// Khalkh archery (халх сур) demo: fictional archers shoot at a wall of 30 leather "sur" cylinders, men from 75 m, women from 65 m.
// One round (үе) = 4 arrows per archer; 4 rounds = the 16 arrows of the first day. Hits are simulated from skill and wind.
const ARCHERS={
  male:[['Д. Мөнх-Очир','D. Mönkh-Ochir','Завхан','Zavkhan','Улсын мэргэн','State Marksman',.7],['Б. Ганзориг','B. Ganzorig','Увс','Uvs','Аймгийн мэргэн','Aimag Marksman',.62],['Ц. Батбаяр','Ts. Batbayar','Говь-Алтай','Govi-Altai','Гоц харваач','Gots archer',.64],['Э. Тэмүүлэн','E. Temüülen','Архангай','Arkhangai','Сумын мэргэн','Sum Marksman',.55],['Ж. Сүх-Очир','J. Sükh-Ochir','Дорнод','Dornod','Онч харваач','Onch archer',.6],['Л. Энхтөр','L. Enkhtör','Хөвсгөл','Khövsgöl','Аймгийн мэргэн','Aimag Marksman',.58]],
  female:[['Б. Сарангэрэл','B. Sarangerel','Өвөрхангай','Övörkhangai','Улсын мэргэн','State Marksman',.68],['Д. Номин','D. Nomin','Увс','Uvs','Аймгийн мэргэн','Aimag Marksman',.6],['Ц. Оюунчимэг','Ts. Oyuunchimeg','Завхан','Zavkhan','Гарамгай харваач','Garamgai archer',.64],['Г. Солонго','G. Solongo','Дорнод','Dornod','Сумын мэргэн','Sum Marksman',.55],['А. Мөнхзул','A. Mönkhzul','Төв','Töv','Онч харваач','Onch archer',.58],['Н. Энхжин','N. Enkhjin','Баянхонгор','Bayankhongor','Аймгийн мэргэн','Aimag Marksman',.61]]};
const ARROWS=4,ROUNDS=4;
const L=(mn,en)=>(document.documentElement.dataset.lang||'mn')==='mn'?mn:en;
let archGender='male',arch=newArchery();
function newArchery(){return {round:0,turn:0,wind:windNow(),shots:[]}}
function windNow(){return Math.round((Math.random()*6-3)*10)/10}
function archState(){const list=ARCHERS[archGender].map(([name,en,aimag,aimagEn,rank,rankEn,skill],i)=>{const mine=arch.shots.filter(s=>s.archer===i);return {i,name,en,aimag,aimagEn,rank,rankEn,skill,hits:mine.filter(s=>s.hit).length,arrows:mine.length}});
  const done=arch.round>=ROUNDS,ranking=[...list].sort((a,b)=>b.hits-a.hits||a.i-b.i);
  return {gender:archGender,distance:archGender==='male'?75:65,round:Math.min(arch.round,ROUNDS-1),rounds:ROUNDS,arrowsPerRound:ARROWS,wind:arch.wind,turn:arch.turn,archers:list,ranking,current:done?null:list[arch.turn],shots:arch.shots,done,winner:done?ranking[0]:null}}
function shootArrow(){if(arch.round>=ROUNDS)return false;const a=ARCHERS[archGender][arch.turn],skill=a[6];
  const p=Math.max(.15,skill-Math.abs(arch.wind)*.035),hit=Math.random()<p;
  // x: −1…1 across the 30-sur wall; y: 0 = on the wall, <0 short, >0 over.
  const drift=arch.wind*.08,x=hit?Math.max(-.95,Math.min(.95,(Math.random()-.5)*1.3+drift)):Math.max(-1.3,Math.min(1.3,(Math.random()-.5)*2.2+drift*2));
  const y=hit?0:(Math.abs(x)>1?(Math.random()-.5)*.6:(Math.random()<.5?-1:1)*(.25+Math.random()*.75));
  const shot={archer:arch.turn,round:arch.round,hit,x,y,sur:hit?Math.round((x+1)/2*29):null};arch.shots.push(shot);
  const inRound=arch.shots.filter(s=>s.archer===arch.turn&&s.round===arch.round).length;
  const st0=archState(),me=st0.archers[shot.archer];
  if(inRound>=ARROWS){arch.turn++;if(arch.turn>=ARCHERS[archGender].length){arch.turn=0;arch.round++;arch.wind=windNow()}}
  renderArchery();emit('shot',{...shot,count:arch.shots.length,name:me.name,en:me.en,hits:me.hits,score:hit?1:0});sound(hit?720:300,.18);
  const st=archState();if(st.done)emit('archery-finish',{winner:st.winner,ranking:st.ranking,gender:archGender});return true}
let roundTimer=null;
function shootRound(){if(roundTimer)return;const who=arch.turn,r=arch.round;const step=()=>{if(arch.turn!==who||arch.round!==r||!shootArrow()){clearInterval(roundTimer);roundTimer=null;renderArchery();return}};step();roundTimer=setInterval(step,1100)}
function renderArchery(){const st=archState(),cur=st.current;
  $('#arch-round').textContent=st.done?L('Дууслаа','Finished'):`${st.round+1} / ${ROUNDS}`;
  $('#arch-current').textContent=cur?L(cur.name,cur.en):'—';
  $('#arch-wind').textContent=`${st.wind<0?'←':st.wind>0?'→':'·'} ${Math.abs(st.wind).toFixed(1)} ${L('м/с','m/s')}`;
  const mine=cur?st.shots.filter(s=>s.archer===cur.i&&s.round===st.round):[];
  $('#arch-arrows').innerHTML=Array.from({length:ARROWS},(_,k)=>{const s=mine[k];return `<span class="${s?(s.hit?'hit':'miss'):''}">${s?(s.hit?'●':'✕'):k+1}</span>`}).join('');
  $('#arch-board').innerHTML=st.ranking.map((a,k)=>`<li class="${cur&&a.i===cur.i?'on':''}"><span class="arch-rank">${k+1}</span><span class="arch-who"><b>${L(a.name,a.en)}</b><small>${L(a.aimag,a.aimagEn)} · ${L(a.rank,a.rankEn)}</small></span><span class="arch-bar"><i style="width:${a.hits/(ROUNDS*ARROWS)*100}%"></i></span><strong>${a.hits}<small>/${a.arrows}</small></strong></li>`).join('');
  const last=st.shots.at(-1);
  $('#last-shot').textContent=st.done?L(`${st.winner.name} — ТҮРҮҮЛЛЭЭ (${st.winner.hits} ОНОЛТ)`,`${st.winner.en} — WINNER (${st.winner.hits} HITS)`):last?(last.hit?L('ОНОЛОО — УУХАЙ!','HIT — UUKHAI!'):L('АЛДЛАА','MISSED')):L('ХАРВААЧ БЭЛДЭЖ БАЙНА','ARCHER GETTING READY');
  $('#shoot-arrow').disabled=st.done;$('#shoot-round').disabled=st.done||!!roundTimer;
  $$('.arch-gender button').forEach(b=>b.classList.toggle('active',b.dataset.gender===archGender));
  emit('archery',st)}
$('#shoot-arrow').addEventListener('click',shootArrow);$('#shoot-round').addEventListener('click',shootRound);
$('#reset-shots').addEventListener('click',()=>{clearInterval(roundTimer);roundTimer=null;arch=newArchery();renderArchery()});
$$('.arch-gender button').forEach(b=>b.addEventListener('click',()=>{clearInterval(roundTimer);roundTimer=null;archGender=b.dataset.gender;arch=newArchery();renderArchery();sound(600,.08)}));
new MutationObserver(renderArchery).observe(document.documentElement,{attributes:true,attributeFilter:['data-lang']});
renderBracket();renderArchery();onHash();
// Hooks for live.js (field dots, Live page controls).
window.naadamApp={selectRacer,shootRound,get page(){return currentPage}};
