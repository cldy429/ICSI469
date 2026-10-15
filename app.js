// NAADAM frontend — simulated sport events are explicitly marked as DEMO.
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const pages=['home','wrestling','racing','archery'];
const firstNames=['Хээр','Зээрд','Хул','Халиун','Хар','Бор'];
const riderNames=['Б. Отгонбаатар','Д. Наранболд','С. Батжаргал','Г. Эрдэнэбат','П. Алтансүх','Ж. Төгөлдөр'];
const horseColors=['#9f573f','#c0a77f','#725042','#c57843','#6d6d70','#ac8961'];
let currentPage='home', scene=null, SceneClass=null, sceneLoading=null, racePaused=false,age='Азарга',sse=null,sseActive=false,soundOn=false,audioCtx=null;
let matchStep=0,shots=[],racers=[],raceTick=0,selectedRacer=0,lastDataTime=Date.now();
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function seedRacers(ageName='Азарга') {let off=ageName==='Азарга'?0:ageName==='Соёолон'?2:5;return firstNames.map((n,i)=>({id:i,name:n,rider:riderNames[i],color:horseColors[i],progress:Math.max(0,14+((i*5+off)%9)-i*.4),speed:47+(i*7)%13,age:ageName}));}
racers=seedRacers();
function fmt(n,d=1){return Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})}
function sound(freq=440,dur=.1){if(!soundOn)return;try{audioCtx ||=new(window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(freq,audioCtx.currentTime);g.gain.setValueAtTime(.06,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur)}catch{}}
function go(page){if(!pages.includes(page))page='home';if(currentPage!==page){scene?.dispose();scene=null;currentPage=page;}$$('.page').forEach(e=>{e.classList.toggle('active',e.id==='page-'+page)});$$('[data-route]').forEach(a=>{a.classList.toggle('active',a.dataset.route===page)});$('#mobile-nav').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');window.scrollTo({top:0,behavior:reducedMotion?'instant':'smooth'});if(page==='racing')renderRace();if(page==='wrestling')renderBracket();if(page==='archery')renderShots();if(page!=='home')load3D(page);sound(490,.08)}
function onHash(){go((location.hash||'#home').slice(1))}
window.addEventListener('hashchange',onHash);
$$('[data-route]').forEach(a=>a.addEventListener('click',()=>{if(location.hash.slice(1)===a.dataset.route)go(a.dataset.route)}));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>{location.hash=b.dataset.go;if(currentPage===b.dataset.go)go(b.dataset.go)}));
$('#menu-toggle').addEventListener('click',()=>{const menu=$('#mobile-nav');menu.hidden=!menu.hidden;$('#menu-toggle').setAttribute('aria-expanded',String(!menu.hidden))});
$('#sound-toggle').addEventListener('click',()=>{soundOn=!soundOn;$('#sound-toggle').setAttribute('aria-pressed',String(soundOn));if(soundOn)sound(660,.12)});

async function load3D(page){const sceneType={racing:'race',wrestling:'wrestling',archery:'archery'}[page];const container=$(`#${page==='racing'?'race':page}-canvas`);if(!container||scene)return;
  const fallback=$(`#${page==='racing'?'race':page}-fallback`);
  if(fallback){fallback.hidden=false;fallback.querySelector('span:not(.fallback-sun)').textContent='3D ТАЛБАЙ АЧААЛЖ БАЙНА…'}
  try{sceneLoading||=import('./scene3d.js').then(m=>{SceneClass=m.NaadamScene;return SceneClass});const TheScene=await sceneLoading;if(page!==currentPage)return;scene=new TheScene(container,sceneType);if(fallback)fallback.hidden=true;if(page==='racing'){scene.updateRace({horses:racers});scene.setPaused(racePaused);scene.selectRacer(selectedRacer)}if(page==='archery')shots.forEach(s=>scene.shoot(s));}
  catch(e){console.warn('3D loading unavailable',e);if(fallback)fallback.querySelector('span:not(.fallback-sun)').textContent='3D АЧААЛАХ БОЛОМЖГҮЙ — ИНТЕРНЕТ / WEBGL ШАЛГАНА УУ';sceneLoading=null;}
}

function renderRace(){let sorted=[...racers].sort((a,b)=>b.progress-a.progress);$('#racer-count').textContent=`${String(sorted.length).padStart(2,'0')} / 06`;
  $('#leaderboard').innerHTML=sorted.map((r,i)=>`<button type="button" class="leader-row ${r.id===selectedRacer?'selected':''}" data-racer="${r.id}" aria-label="${r.name} морины явцыг харах"><span class="leader-rank">${String(i+1).padStart(2,'0')}</span><span class="horse-dot" style="--horse-color:${r.color}">♞</span><span class="leader-name"><b>${r.name}</b><small>${r.rider}</small></span><span class="leader-value">${fmt(r.speed)} <small>км/ц</small></span></button>`).join('');
  $('#leaderboard').querySelectorAll('[data-racer]').forEach(el=>el.addEventListener('click',()=>{selectedRacer=Number(el.dataset.racer);renderRace();scene?.selectRacer(selectedRacer);sound(520,.055)}));
  const leader=sorted[0];let max=leader?.progress||0;$('#race-distance').textContent=`${Math.round(max*180).toLocaleString('en-US')} / 18,000 м`;$('#track-fill').style.width=`${Math.max(0,Math.min(100,max))}%`;$('#top-speed').textContent=`${fmt(leader?.speed||0)} км/ц`;$('#last-update').textContent=new Date(lastDataTime).toLocaleTimeString('mn-MN',{hour12:false});$('#race-phase').textContent=max>=100?'Барианд ирлээ':racePaused?'Түр зогсоосон':'Уралдаан үргэлжилж байна';scene?.updateRace({horses:racers});
}
function advanceRace(){if(racePaused||sseActive)return;raceTick++;racers=racers.map((r,i)=>({...r,progress:Math.min(100,r.progress+(r.speed/3.6)/18000*100*1.2*(9.8+Math.sin(raceTick*.25+i)*.7)),speed:Math.max(35,Math.min(69,r.speed+Math.sin(raceTick*.37+i)*.85))}));if(racers.every(r=>r.progress>=100)){raceTick=0;racers=seedRacers(age)}lastDataTime=Date.now();if(currentPage==='racing')renderRace()}
function ageChange(newAge){age=newAge;raceTick=0;racers=seedRacers(age);selectedRacer=0;$$('.age-tab').forEach(el=>el.classList.toggle('active',el.dataset.age===age));lastDataTime=Date.now();renderRace();sound(600,.09)}
$$('.age-tab').forEach(e=>e.addEventListener('click',()=>ageChange(e.dataset.age)));
$('#race-pause').addEventListener('click',()=>{racePaused=!racePaused;scene?.setPaused(racePaused);$('#race-pause').innerHTML=racePaused?'▶ <span>Үргэлжлүүлэх</span>':'Ⅱ <span>Зогсоох</span>';renderRace()});
$('#camera-reset').addEventListener('click',()=>scene?.resetCamera());
$('#wrestle-reset').addEventListener('click',()=>scene?.resetCamera());
$('#archery-reset').addEventListener('click',()=>scene?.resetCamera());
setInterval(advanceRace,1200);

// EventSource is an actual streaming transport. Data from the bundled server is simulated, NOT official results.
function connectStream(){if(location.protocol==='file:')return;let opened=false;try{const es=new EventSource('/api/events');sse=es;es.onopen=()=>{opened=true;sseActive=true;$('#stream-status').textContent='DEMO · SSE STREAM'};es.onmessage=event=>{try{const packet=JSON.parse(event.data);if(packet.type==='race'&&!racePaused&&age==='Азарга'&&Array.isArray(packet.horses)){racers=packet.horses.map((h,i)=>({...h,id:i,name:firstNames[i],rider:riderNames[i],color:horseColors[i],age:'Азарга'}));lastDataTime=Date.now();if(currentPage==='racing')renderRace()}}catch(e){console.warn('Skipped bad stream packet',e)}};es.onerror=()=>{sseActive=false;es.close();$('#stream-status').textContent='DEMO · LOCAL STREAM'};setTimeout(()=>{if(!opened){es.close();sseActive=false}},5000)}catch{}}
connectStream();

const fighters=['О. Орхон','Б. Тэмүүлэн','Д. Амарсайхан','С. Батбаатар','М. Лхагвагэрэл','А. Баярхүү','Н. Энхтөр','Ц. Эрхэс'];
const resultFirst=[0,2,4,7],resultSecond=[0,4],resultFinal=0;
function bracketFighter(i,win){return `<div class="fighter ${win?'winner':''}"><b>${fighters[i]}</b><small>${win?'●':'◦'}</small></div>`}
function renderBracket(){const round1=Array.from({length:4},(_,i)=>{let a=i*2,b=a+1,w=matchStep>i?resultFirst[i]:-1;return `<div class="match-pair">${bracketFighter(a,w===a)}${bracketFighter(b,w===b)}</div>`}).join('');const round2=Array.from({length:2},(_,i)=>{let a=resultFirst[i*2],b=resultFirst[i*2+1],ready=matchStep>=4,win=matchStep>4+i?resultSecond[i]:-1;return `<div class="match-pair">${ready?bracketFighter(a,win===a)+bracketFighter(b,win===b):'<div class="fighter">Тодорхойгүй</div><div class="fighter">Тодорхойгүй</div>'}</div>`}).join('');
  $('#bracket').innerHTML=`<div class="bracket-first">${round1}</div><div class="bracket-middle">⟶<br/><br/>⟶</div><div class="bracket-second">${round2}</div>`;$('#match-callout').textContent=matchStep>=7?`${fighters[resultFinal]} — ТҮРҮҮЛЛЭЭ`:matchStep===0?'БАРИЛДААН ЭХЭЛЛЭЭ':`${matchStep} / 7 БАРИЛДААН ДУУСЛАА`;$('#next-match').disabled=matchStep>=7;$('#next-match').textContent=matchStep>=7?'ТЭМЦЭЭН ДУУСЛАА':'ДАРААГИЙН БАРИЛДААН →';}
$('#next-match').addEventListener('click',()=>{if(matchStep<7){matchStep++;renderBracket();sound(480,.12)}});
$('#reset-bracket').addEventListener('click',()=>{matchStep=0;renderBracket()});

// Educational, fictional archery scoring visualization. Does not represent the official Sur scoring rules.
function scoreShot(){if(shots.length>=8)return;let r=.15+Math.random()*2.55;const angle=Math.random()*Math.PI*2;const score=Math.max(2,10-Math.floor(r/2.8*8));const shot={score,radius:r,angle};shots.push(shot);scene?.shoot(shot);renderShots();sound(400+score*35,.2)}
function renderShots(){$('#archery-score').innerHTML=shots.reduce((a,s)=>a+s.score,0)+'<span>/ 80</span>';$('#shot-counter').innerHTML=shots.length+'<span>/ 8</span>';
  $('#shot-list').innerHTML=Array.from({length:8},(_,i)=>shots[i]?`<div class="shot-item" title="${i+1}-р сум: ${shots[i].score} оноо"><small>${i+1}</small>${shots[i].score}</div>`:`<div class="shot-item empty"><small>${i+1}</small>—</div>`).join('');$('#last-shot').textContent=shots.length?`СҮҮЛИЙН СУМ: ${shots.at(-1).score} ОНОО`:'БАЙНД ТУСАХЫГ ХҮЛЭЭНЭ ҮҮ';$('#shoot-arrow').disabled=shots.length===8;}
$('#shoot-arrow').addEventListener('click',scoreShot);$('#reset-shots').addEventListener('click',()=>{shots=[];scene?.clearShots();renderShots()});
renderBracket();renderShots();onHash();
