// NAADAM 3D scenes. Loaded only when the user enters a 3D page.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.186.1/+esm';

const GOLD = 0xd9b577, RED = 0xb83f37, NAVY = 0x09243a;
const material = (hex, roughness=0.83, metalness=0.04) => new THREE.MeshStandardMaterial({color:hex,roughness,metalness});
const mats = {ground:material(0x9a8164),sand:material(0xbd9360),dark:material(NAVY),red:material(RED),gold:material(GOLD,.48,.22),pale:material(0xe9d2a4),sky:material(0x183d55),wood:material(0x62412d)};
function mesh(geo, mat, parent, pos=[0,0,0], rot=[0,0,0], scale=[1,1,1]){const o=new THREE.Mesh(geo,mat);o.position.set(...pos);o.rotation.set(...rot);o.scale.set(...scale);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
const box=(parent,w,h,d,mat,pos=[0,0,0])=>mesh(new THREE.BoxGeometry(w,h,d),mat,parent,pos);
const ball=(parent,r,mat,pos=[0,0,0],scale=[1,1,1])=>mesh(new THREE.SphereGeometry(r,12,9),mat,parent,pos,[0,0,0],scale);
const stick=(parent,r1,r2,h,mat,pos=[0,0,0],rot=[0,0,0])=>mesh(new THREE.CylinderGeometry(r1,r2,h,9),mat,parent,pos,rot);
function world(scene){scene.background=new THREE.Color(0x0f3143);scene.fog=new THREE.FogExp2(0x0f3143,.0065);scene.add(new THREE.HemisphereLight(0xfce2ab,0x365163,2.3));const sun=new THREE.DirectionalLight(0xffdeb4,2.35);sun.position.set(-28,62,32);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-90;sun.shadow.camera.right=90;sun.shadow.camera.top=90;sun.shadow.camera.bottom=-90;scene.add(sun);
  mesh(new THREE.PlaneGeometry(600,600),mats.ground,scene,[0,-.11,0],[-Math.PI/2,0,0]);
  for(let i=0;i<21;i++){let x=-155+i*17, z=-72-Math.sin(i*3.3)*28, h=16+((i*17)%19);let m=mesh(new THREE.ConeGeometry(15+((i*7)%9),h,3),material(i%2?0x476471:0x375362),scene,[x,h*.44-.5,z],[0,i*.43,0]);m.castShadow=false;}
  const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(17,24,12),new THREE.MeshBasicMaterial({color:0xefbd72,fog:false}));sunDisc.position.set(-61,37,-116);scene.add(sunDisc);
}
function flag(parent,x,y,z,col=RED){stick(parent,.09,.11,7,mats.wood,[x,y+3.5,z]);const cloth=mesh(new THREE.PlaneGeometry(3.1,1.65),material(col),parent,[x+1.57,y+5.8,z],[0,Math.PI/10,0]);cloth.material.side=THREE.DoubleSide;return cloth}
function horseModel(parent,color){const g=new THREE.Group();parent.add(g);const fur=material(color),shadow=material(0x2d2b30),saddle=material(0x8d2b33),trim=mats.gold;
  ball(g,.95,fur,[0,1.85,0],[1.62,.72,.65]);ball(g,.52,fur,[1.0,2.09,0],[.69,.82,.7]);ball(g,.43,fur,[1.55,2.56,0],[.72,.9,.62]);ball(g,.28,fur,[1.85,2.27,0],[.9,.54,.84]);
  for(let s of [-1,1]){mesh(new THREE.ConeGeometry(.13,.49,5),fur,g,[1.38,3.09,s*.23],[0,0,-.3]);ball(g,.055,shadow,[1.73,2.68,s*.33]);}
  const limbs=[];for(let x of [-.88,.89])for(let z of [-.35,.35]){const leg=new THREE.Group();leg.position.set(x,1.45,z);g.add(leg);stick(leg,.16,.12,.95,fur,[0,-.45,0]);stick(leg,.11,.09,.7,fur,[.12,-1.18,0],[0,0,-.13]);box(leg,.36,.18,.24,shadow,[.22,-1.52,0]);limbs.push(leg)}
  const tail=mesh(new THREE.ConeGeometry(.24,1.8,7),shadow,g,[-1.55,1.96,0],[0,0,1.13]);
  const saddlePad=ball(g,.7,saddle,[-.2,2.42,0],[1,.18,.8]);ball(g,.36,trim,[-.22,2.48,0],[.7,.1,.74]);
  // Rider with red deel and dark hat.
  const rider=new THREE.Group();rider.position.set(-.3,2.45,0);g.add(rider);mesh(new THREE.ConeGeometry(.46,1.27,8),mats.red,rider,[0,.58,0],[0,0,Math.PI]);ball(rider,.24,material(0xbc8b67),[0,1.37,0]);stick(rider,.31,.32,.17,shadow,[0,1.64,0]);mesh(new THREE.ConeGeometry(.14,.23,7),shadow,rider,[0,1.83,0]);stick(rider,.12,.1,.88,mats.red,[.24,.86,.31],[0,0,-.43]);stick(rider,.12,.1,.88,mats.red,[.24,.86,-.31],[0,0,-.43]);
  g.scale.setScalar(.93);return {group:g,limbs,tail};
}
function createRace(scene){const race=new THREE.Group();scene.add(race);mesh(new THREE.PlaneGeometry(160,43),mats.sand,race,[0,.001,0],[-Math.PI/2,0,0]);
  for(let z=-17;z<=17;z+=6.4){mesh(new THREE.BoxGeometry(150,.05,.055),material(0xdbbe92),race,[0,.04,z]);}
  for(let x=-70;x<=70;x+=10)for(let z of [-20,20]){stick(race,.12,.12,1,mats.wood,[x,.45,z]);}
  for(let x of [-67,67]){box(race,.38,8,.38,mats.gold,[x,4,-19.3]);box(race,.38,8,.38,mats.gold,[x,4,19.3]);box(race,1,0.5,39,mats.gold,[x,8,0]);}
  // Finish line: checkered strip + banner where progress reaches 100%.
  {const c=document.createElement('canvas');c.width=64;c.height=512;const x2=c.getContext('2d');for(let i=0;i<4;i++)for(let k=0;k<32;k++){x2.fillStyle=(i+k)%2?'#111':'#f4f1e8';x2.fillRect(i*16,k*16,16,16)}const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;mesh(new THREE.PlaneGeometry(1.6,40),new THREE.MeshStandardMaterial({map:tex,roughness:.8}),race,[52.8,.03,0],[-Math.PI/2,0,0]).castShadow=false;for(const z of [-20.5,20.5])stick(race,.16,.18,7,mats.red,[52.8,3.5,z]);box(race,.3,1.3,41,material(0x1f5f99,.6),[52.8,6.6,0]);box(race,.32,.18,41,mats.gold,[52.8,7.3,0]);box(race,.32,.18,41,mats.gold,[52.8,5.9,0]);}
  for(let i=0;i<12;i++){const x=-66+i*12;flag(race,x,0,-24,i%2?0xc34e46:0x173e63);}
  const racers=[0x76412d,0xccc2a0,0x4a322b,0xb86c41,0x4d4747,0x9e7c55].map((col,index)=>{const h=horseModel(race,col);h.group.position.set(-55,index*0,-15+index*6.1);const marker=mesh(new THREE.TorusGeometry(1.85,.06,6,38),mats.gold,h.group,[0,.09,0],[Math.PI/2,0,0]);marker.visible=index===0;return {...h,marker,targetX:-55,fromX:-55,z:-15+index*6.1}});
  const dust=[];const dustMat=new THREE.MeshBasicMaterial({color:0xd5ab79,transparent:true,opacity:.27,depthWrite:false});for(let i=0;i<90;i++){const p=mesh(new THREE.IcosahedronGeometry(.12+(i%6)*.06,0),dustMat,race,[0,0,0]);p.castShadow=false;p.userData.index=i;dust.push(p)}
  return {racers,dust,select(index){racers.forEach((h,i)=>h.marker.visible=(i===index))},update(data){(data?.horses||[]).forEach((o,i)=>{if(racers[i])racers[i].targetX=-54+Math.min(100,o.progress)*1.06})},tick(t,paused,dt){for(let i=0;i<racers.length;i++){let h=racers[i];h.group.position.x=THREE.MathUtils.damp(h.group.position.x,h.targetX,2.5,dt);if(!paused){h.group.position.y=Math.abs(Math.sin(t*7+i))*.12;h.limbs.forEach((leg,j)=>leg.rotation.z=Math.sin(t*11+i+j*Math.PI*.62)*.49);h.tail.rotation.z=1.05+Math.sin(t*7+i)*.14;}for(let j=0;j<15;j++){let d=dust[i*15+j],q=(j*31)%47/47;d.position.set(h.group.position.x-1.5-j*.26,Math.abs(Math.sin(t*2+j))*.5+q*.25,h.z+(j%5-2)*.19);d.scale.setScalar(.45+q*.7)}}}}}
// Articulated wrestler (metres, scaled to scene units). Joints are Groups so poses are plain rotations.
const M=1.85;
function limb(parent,r,len,mat,pos){const j=new THREE.Group();j.position.set(...pos);parent.add(j);mesh(new THREE.CapsuleGeometry(r,len,4,10),mat,j,[0,-(len/2+r*.6),0]);return j}
function wrestlerModel(parent,{skin,cloth,x}){
  const root=new THREE.Group();root.rotation.order='YXZ';root.position.x=x;root.scale.setScalar(M);parent.add(root);
  const sk=material(skin,.55),cl=material(cloth,.62),boot=material(0x5a3420,.55),trim=material(GOLD,.4,.3),hair=material(0x15110f,.9),dark=material(0x111111,.3);
  cl.side=THREE.DoubleSide;
  const hips=new THREE.Group();hips.position.y=.95;root.add(hips);
  mesh(new THREE.CylinderGeometry(.17,.155,.15,20),cl,hips,[0,0,0],[0,0,0],[1.2,1,.95]); // shuudag
  const spine=new THREE.Group();spine.position.y=.04;hips.add(spine);
  const torso=[[.14,0],[.15,.1],[.175,.24],[.2,.37],[.19,.45],[.12,.51],[.05,.54]].map(([r,y])=>new THREE.Vector2(r,y));
  mesh(new THREE.LatheGeometry(torso,20),sk,spine,[0,0,0],[0,0,0],[1.35,1,.82]);
  for(const s of [-1,1])ball(spine,.075,sk,[s*.08,.36,.12],[1.3,.85,.55]); // chest
  // jodag: open-front jacket over back, shoulders and arms
  mesh(new THREE.CylinderGeometry(.215,.19,.42,22,1,true,.8,Math.PI*2-1.6),cl,spine,[0,.27,0],[0,0,0],[1.38,1,.88]);
  mesh(new THREE.TorusGeometry(.17,.014,6,24),trim,spine,[0,.05,0],[Math.PI/2,0,0],[1.32,.86,1]);
  const neck=new THREE.Group();neck.position.y=.52;spine.add(neck);stick(neck,.055,.065,.12,sk,[0,.05,0]);
  const head=new THREE.Group();head.position.y=.1;neck.add(head);
  ball(head,.105,sk,[0,.1,0],[.92,1.12,1]);ball(head,.08,sk,[0,.04,.025],[1,.8,1]);
  mesh(new THREE.SphereGeometry(.112,16,10,0,Math.PI*2,0,Math.PI*.5),hair,head,[0,.11,-.01],[-.25,0,0],[.93,1.1,1.02]);
  mesh(new THREE.ConeGeometry(.018,.045,6),sk,head,[0,.09,.105],[Math.PI/2,0,0]);
  for(const s of [-1,1]){ball(head,.012,dark,[s*.035,.12,.093]);ball(head,.026,sk,[s*.097,.1,0],[.5,1,.8])}
  const j={root,hips,spine,neck,head};
  for(const [side,s] of [['L',1],['R',-1]]){
    const sh=limb(spine,.06,.2,sk,[s*.25,.45,0]);ball(sh,.085,cl,[0,-.02,0]);mesh(new THREE.CapsuleGeometry(.068,.18,4,10),cl,sh,[0,-.16,0]);
    const el=limb(sh,.05,.18,sk,[0,-.31,0]);mesh(new THREE.CapsuleGeometry(.058,.15,4,10),cl,el,[0,-.11,0]);
    ball(el,.05,sk,[0,-.3,.005],[.85,1.2,.55]);
    const hip=limb(hips,.085,.28,sk,[s*.1,-.03,0]);stick(hip,.095,.092,.07,cl,[0,-.04,0]);
    const knee=limb(hip,.062,.3,sk,[0,-.45,0]);stick(knee,.075,.068,.32,boot,[0,-.24,0]);mesh(new THREE.TorusGeometry(.076,.012,6,18),trim,knee,[0,-.09,0],[Math.PI/2,0,0]);
    const ankle=new THREE.Group();ankle.position.y=-.43;knee.add(ankle);box(ankle,.1,.07,.26,boot,[0,-.03,.05]);mesh(new THREE.ConeGeometry(.045,.1,8),boot,ankle,[0,-.01,.2],[1.05,0,0]);
    Object.assign(j,{[side+'sh']:sh,[side+'el']:el,[side+'hip']:hip,[side+'knee']:knee,[side+'ankle']:ankle});
  }
  root.traverse(o=>{if(o.isMesh)o.userData.pickRoot=root});
  return j;
}
// Poses: joint → [x,y,z]. y is the hip height. Character faces +z, L is the +x side.
const POSES={
  stance:{y:.86,spine:[.45,0,0],neck:[-.35,0,0],Lsh:[-.8,0,.45],Rsh:[-.8,0,-.45],Lel:[-.7,0,0],Rel:[-.7,0,0],Lhip:[-.45,0,.08],Rhip:[-.45,0,-.08],Lknee:[.9,0,0],Rknee:[.9,0,0],Lankle:[-.45,0,0],Rankle:[-.45,0,0]},
  grip:{y:.84,spine:[.8,0,0],neck:[-.5,.35,0],Lsh:[-2.0,0,-.1],Rsh:[-2.0,0,.1],Lel:[-.35,0,0],Rel:[-.35,0,0],Lhip:[-.65,0,.1],Lknee:[1.0,0,0],Lankle:[-.35,0,0],Rhip:[.2,0,-.1],Rknee:[.45,0,0],Rankle:[-.65,0,0]},
  eagle:{y:.9,spine:[.2,0,0],neck:[-.15,0,0],Lsh:[-.15,0,1.45],Rsh:[-.15,0,-1.45],Lel:[-.1,0,0],Rel:[-.1,0,0],Lhip:[-.3,0,.06],Rhip:[-.3,0,-.06],Lknee:[.6,0,0],Rknee:[.6,0,0],Lankle:[-.3,0,0],Rankle:[-.3,0,0]},
  down:{y:.95,spine:[-.2,0,0],neck:[.3,0,0],Lsh:[0,0,1.2],Rsh:[0,0,-1.2],Lel:[-.4,0,0],Rel:[-.4,0,0],Lhip:[-.6,0,.15],Rhip:[-.3,0,-.15],Lknee:[1.1,0,0],Rknee:[.7,0,0],Lankle:[-.4,0,0],Rankle:[-.3,0,0]},
};
const JOINTS=['spine','neck','Lsh','Rsh','Lel','Rel','Lhip','Rhip','Lknee','Rknee','Lankle','Rankle'];
function applyPose(j,a,b=a,k=0){j.hips.position.y=THREE.MathUtils.lerp(a.y,b.y,k);for(const n of JOINTS){const p=a[n]||[0,0,0],q=b[n]||[0,0,0];j[n].rotation.set(p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k,p[2]+(q[2]-p[2])*k)}}
const smooth01=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x)};
function createWrestling(scene){const g=new THREE.Group();scene.add(g);
  mesh(new THREE.CylinderGeometry(11.7,11.85,.6,80),material(0x8d9a5a,.95),g,[0,.12,0]);mesh(new THREE.TorusGeometry(10.7,.12,8,80),mats.gold,g,[0,.47,0],[Math.PI/2,0,0]);mesh(new THREE.TorusGeometry(9.45,.05,8,80),mats.red,g,[0,.46,0],[Math.PI/2,0,0]);for(let i=0;i<12;i++){let a=i*Math.PI/6;flag(g,Math.sin(a)*14,-.1,Math.cos(a)*14,i%3===0?RED:0x31577a)}
  const pair=new THREE.Group();pair.position.y=.42;g.add(pair);
  const fighters=[wrestlerModel(pair,{skin:0xc7926b,cloth:0xb3262f,x:-1}),wrestlerModel(pair,{skin:0xb98360,cloth:0x1f5f99,x:1})];
  fighters[0].root.rotation.y=Math.PI/2;fighters[1].root.rotation.y=-Math.PI/2;
  // Bout state: 'circle' → 'grip' loop until the app reports a result, then 'fall' + eagle dance.
  let phase='circle',phaseT=0,winner=0,gap=2.4;
  const pickables=[];fighters.forEach((f,i)=>f.root.traverse(o=>{if(o.isMesh){o.userData.pick={kind:'wrestler',side:i};pickables.push(o)}}));
  return {pickables,bout(w){winner=w;phase='fall';phaseT=0},
    tick(t,paused,dt){if(paused)return;phaseT+=dt;
      if(phase==='circle'&&phaseT>3.5){phase='approach';phaseT=0}
      if(phase==='approach'&&phaseT>1.2){phase='grip';phaseT=0}
      if(phase==='grip'&&phaseT>7){phase='break';phaseT=0}
      if(phase==='break'&&phaseT>1.2){phase='circle';phaseT=0}
      if(phase==='fall'&&phaseT>1.4){phase='dance';phaseT=0}
      if(phase==='dance'&&phaseT>4.5){phase='circle';phaseT=0}
      const sway=Math.sin(t*1.7)*.06;
      let targetGap=2.4;
      fighters.forEach((f,i)=>{f.root.rotation.x=0;f.root.position.y=0;f.root.rotation.y=i?-Math.PI/2:Math.PI/2});
      if(phase==='circle'){pair.rotation.y+=dt*.35;fighters.forEach((f,i)=>{applyPose(f,POSES.stance);f.hips.position.y+=Math.abs(Math.sin(t*3+i))*.02;f.spine.rotation.z=Math.sin(t*1.5+i)*.08})}
      else if(phase==='approach'||phase==='break'){const k=smooth01(phaseT/1.2),m=phase==='approach'?k:1-k;targetGap=THREE.MathUtils.lerp(2.4,1.05,m);fighters.forEach(f=>applyPose(f,POSES.stance,POSES.grip,m))}
      else if(phase==='grip'){targetGap=1.05;pair.rotation.y+=Math.sin(t*.6)*dt*.5;pair.position.x=Math.sin(t*.9)*.35;fighters.forEach((f,i)=>{applyPose(f,POSES.grip);f.spine.rotation.z=sway*(i?-1:1);f.spine.rotation.x+=Math.sin(t*2.2+i*Math.PI)*.06})}
      else if(phase==='fall'){targetGap=1.2;const k=smooth01(phaseT/.9),w=fighters[winner],l=fighters[1-winner];applyPose(w,POSES.grip,POSES.stance,k*.6);applyPose(l,POSES.grip,POSES.down,k);l.root.rotation.x=-1.45*k*k;l.root.position.y=.14*k}
      else if(phase==='dance'){targetGap=2.6;const w=fighters[winner],l=fighters[1-winner];applyPose(l,POSES.down);l.root.rotation.x=-1.45*(1-smooth01((phaseT-1.5)/1.5));l.root.position.y=.14*(1-smooth01((phaseT-1.5)/1.5));if(phaseT>1.5)applyPose(l,POSES.down,POSES.stance,smooth01((phaseT-1.5)/1.5));
        applyPose(w,POSES.eagle);const flap=Math.sin(t*4.2)*.25;w.Lsh.rotation.z=1.45+flap;w.Rsh.rotation.z=-1.45-flap;w.hips.position.y=.9+Math.abs(Math.sin(t*2.1))*.06;w.root.rotation.y=(winner?-Math.PI/2:Math.PI/2)+phaseT*1.4}
      gap=THREE.MathUtils.damp(gap,targetGap,4,dt);fighters[0].root.position.x=-gap/2*M;fighters[1].root.position.x=gap/2*M;
    }}}
function createArchery(scene){const g=new THREE.Group();scene.add(g);let beam=material(0x62422e),ivory=material(0xe7d1a9),blue=material(0x236078),red=material(0xb54440),gold=mats.gold;
  stick(g,.23,.3,6.5,beam,[-2.1,2.45,-.4],[0,0,-.13]);stick(g,.23,.3,6.5,beam,[2.1,2.45,-.4],[0,0,.13]);box(g,5.3,.24,.6,beam,[0,5.4,-.4]);
  const target=new THREE.Group();target.position.set(0,3.25,0);g.add(target);
  let cols=[0x263e55,0xe8d6b6,0xc3483f,0xe4b361,0x233b51];for(let i=0;i<5;i++){let radius=2.8-i*.54;mesh(new THREE.CylinderGeometry(radius,radius,.10,64),material(cols[i],.71),target,[0,0,.13+i*.01],[Math.PI/2,0,0]);}
  mesh(new THREE.SphereGeometry(.18,16,12),mats.gold,target,[0,0,.28]);
  for(let k=0;k<10;k++){let angle=k*Math.PI/5;const dot=ball(target,.035,mats.gold,[Math.cos(angle)*3,Math.sin(angle)*3,.18]);dot.castShadow=false;}
  const shots=[];function addShot(x,y){const arrow=new THREE.Group();g.add(arrow);arrow.position.set(x,y+3.25,13);const shaft=stick(arrow,.036,.036,1.6,beam,[0,0,-.7],[Math.PI/2,0,0]);const arrowTip=mesh(new THREE.ConeGeometry(.09,.3,8),gold,arrow,[0,0,-1.58],[-Math.PI/2,0,0]);const feather=mesh(new THREE.ConeGeometry(.15,.35,5),red,arrow,[0,0,.03],[Math.PI/2,0,0]);shots.push({arrow,x,y,depth:.42,t:0});return shots.length}
  return {shoot(s){let a=(s.angle??0),r=(s.radius??.3);addShot(Math.cos(a)*r,Math.sin(a)*r)},reset(){shots.splice(0).forEach(s=>g.remove(s.arrow))},tick(t,paused,dt){shots.forEach(s=>{if(!paused){s.t=Math.min(1,s.t+dt*1.25);let f=1-Math.pow(1-s.t,3);s.arrow.position.z=13+(s.depth-13)*f;s.arrow.rotation.y=Math.sin(t*4)*.012}})}}}

export class NaadamScene {
  constructor(element,type){this.element=element;this.type=type;this.disposed=false;this.paused=false;this.last=0;this.tickTime=0;this.fpsCounter=0;this.fpsTime=0;this.fps=0;
    const {clientWidth:w,clientHeight:h}=element;this.scene=new THREE.Scene();world(this.scene);this.camera=new THREE.PerspectiveCamera(44,Math.max(1,w)/Math.max(1,h),.1,500);this.camera.position.set(type==='race'?45:12,type==='race'?40:12,type==='race'?89:18);
    this.target=new THREE.Vector3(type==='race'?0:0,type==='race'?1.7:2,0);if(type==='archery'){this.camera.position.set(0,7.2,17);this.target.set(0,3,0)}
    this.renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));this.renderer.setSize(w,h);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFShadowMap;element.append(this.renderer.domElement);
    this.model=type==='race'?createRace(this.scene):type==='wrestling'?createWrestling(this.scene):createArchery(this.scene);
    this.basePos=this.camera.position.clone();this.baseTarget=this.target.clone();this.drag=null;this.canvas=this.renderer.domElement;this.onDown=e=>{this.drag={x:e.clientX,y:e.clientY};this.downAt={x:e.clientX,y:e.clientY};this.canvas.setPointerCapture(e.pointerId)};this.onMove=e=>{if(!this.drag)return;const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;this.drag={x:e.clientX,y:e.clientY};const off=this.camera.position.clone().sub(this.target);const sph=new THREE.Spherical().setFromVector3(off);sph.theta-=dx*.005;sph.phi=THREE.MathUtils.clamp(sph.phi-dy*.005,.25,Math.PI*.49);this.camera.position.copy(this.target).add(new THREE.Vector3().setFromSpherical(sph));this.camera.lookAt(this.target)};this.raycaster=new THREE.Raycaster();this.onUp=e=>{const d=this.downAt;this.drag=null;this.downAt=null;if(d&&e&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<6)this.pick(e)};
    this.onHover=e=>{if(this.drag||!this.model.pickables)return;this.canvas.style.cursor=this.hit(e)?'pointer':'grab'};
    this.onWheel=e=>{e.preventDefault();const off=this.camera.position.clone().sub(this.target);off.multiplyScalar(e.deltaY>0?1.08:.92);off.clampLength(this.type==='race'?24:7,this.type==='race'?165:45);this.camera.position.copy(this.target).add(off);this.camera.lookAt(this.target)};
    this.canvas.addEventListener('pointerdown',this.onDown);this.canvas.addEventListener('pointermove',this.onMove);this.canvas.addEventListener('pointermove',this.onHover);this.canvas.addEventListener('pointerup',this.onUp);this.canvas.addEventListener('pointercancel',this.onUp);this.canvas.addEventListener('wheel',this.onWheel,{passive:false});this.canvas.style.touchAction='pan-y';this.camera.lookAt(this.target);
    this.resizeObserver=new ResizeObserver(()=>{if(this.disposed)return;let w=Math.max(1,element.clientWidth),h=Math.max(1,element.clientHeight);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h)});this.resizeObserver.observe(element);
    this.loop=this.loop.bind(this);this.frame=requestAnimationFrame(this.loop);
  }
  loop(now){if(this.disposed)return;const dt=Math.min(.05,(now-this.last)/1000||.016);this.last=now;if(!this.paused)this.tickTime+=dt;this.model.tick(this.tickTime,this.paused,dt);this.camera.lookAt(this.target);this.renderer.render(this.scene,this.camera);this.fpsCounter++;if(now-this.fpsTime>1000){this.fps=this.fpsCounter;this.fpsCounter=0;this.fpsTime=now;const e=document.getElementById('hud-fps');if(e&&this.type==='race')e.textContent=this.fps+' FPS'}this.frame=requestAnimationFrame(this.loop)}
  hit(e){if(!this.model.pickables)return null;const r=this.canvas.getBoundingClientRect();this.raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.camera);return this.raycaster.intersectObjects(this.model.pickables,false)[0]?.object.userData.pick||null}
  pick(e){const p=this.hit(e);if(p)this.element.dispatchEvent(new CustomEvent('scene-pick',{bubbles:true,detail:p}))}
  wrestleBout(winnerSide){if(this.type==='wrestling')this.model.bout(winnerSide)}
  updateRace(data){if(this.type==='race')this.model.update(data)}
  selectRacer(index){if(this.type==='race')this.model.select(index)}
  shoot(shot){if(this.type==='archery')this.model.shoot(shot)}
  clearShots(){if(this.type==='archery')this.model.reset()}
  setPaused(v){this.paused=!!v}
  resetCamera(){this.camera.position.copy(this.basePos);this.target.copy(this.baseTarget);this.camera.lookAt(this.target)}
  dispose(){if(this.disposed)return;this.disposed=true;cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();this.canvas.removeEventListener('pointerdown',this.onDown);this.canvas.removeEventListener('pointermove',this.onMove);this.canvas.removeEventListener('pointermove',this.onHover);this.canvas.removeEventListener('pointerup',this.onUp);this.canvas.removeEventListener('pointercancel',this.onUp);this.canvas.removeEventListener('wheel',this.onWheel);this.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose()}});this.renderer.dispose();this.renderer.domElement.remove()}
}
