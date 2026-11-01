// Dependency-free Node.js SSE demo server.
// The streaming transport is REAL (Server-Sent Events). The competition data is SIMULATED.
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
// server/ хавтсанд байрлана; сайтын файлууд (index.html, css/, js/) нэг түвшин дээр.
const serverDir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(serverDir,'..');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json; charset=utf-8'};
const racerNames=['Хээр','Зээрд','Хул','Халиун','Хар','Бор'];
const clients=new Set();let tick=0;
let racers=racerNames.map((name,i)=>({name,progress:14+(i*5)%9-i*.4,speed:47+(i*7)%13}));
function eventPacket(){tick++;
  racers=racers.map((h,i)=>({...h,progress:Math.min(100,h.progress+(h.speed/3.6)/18000*100*1.2*(9.8+Math.sin(tick*.25+i)*.7)),speed:Math.max(35,Math.min(69,h.speed+Math.sin(tick*.37+i)*.85))}));
  if(racers.every(r=>r.progress>=100)){tick=0;racers=racerNames.map((name,i)=>({name,progress:14+(i*5)%9-i*.4,speed:47+(i*7)%13}))}
  const payload=JSON.stringify({type:'race',demo:true,simulation:true,generatedAt:new Date().toISOString(),horses:racers});
  for(const client of clients){try{client.write(`data: ${payload}\n\n`)}catch{clients.delete(client)}}}
setInterval(eventPacket,1200);
// Viewer comments + subscription sign-ups (demo). Stored as JSON in server/data, which is never served as a static file.
const dataDir=path.join(serverDir,'data');
async function loadJson(name,fallback){try{return JSON.parse(await readFile(path.join(dataDir,name),'utf8'))}catch{return fallback}}
async function saveJson(name,value){await mkdir(dataDir,{recursive:true});await writeFile(path.join(dataDir,name),JSON.stringify(value,null,1))}
let comments=await loadJson('comments.json',[]);
const lastPost=new Map();
const topics=new Set(['home','wrestling','racing','archery','live']);
const clean=(v,max)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);
function readBody(req){return new Promise((resolve,reject)=>{let body='';req.on('data',c=>{body+=c;if(body.length>8000){reject(new Error('too large'));req.destroy()}});req.on('end',()=>{try{resolve(JSON.parse(body||'{}'))}catch(e){reject(e)}})})}
function sendJson(res,code,value){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value))}
function broadcast(packet){const payload=JSON.stringify(packet);for(const client of clients){try{client.write(`data: ${payload}\n\n`)}catch{clients.delete(client)}}}
async function api(req,res,pathname){
 if(pathname==='/api/comments'&&req.method==='GET'){const topic=new URL(req.url,'http://x').searchParams.get('topic');sendJson(res,200,comments.filter(c=>!topic||topic==='home'||c.topic===topic).slice(-60));return true}
 if(pathname==='/api/comments'&&req.method==='POST'){
  const ip=req.socket.remoteAddress||'?',now=Date.now();if(now-(lastPost.get(ip)||0)<5000){sendJson(res,429,{error:'slow down'});return true}
  let body;try{body=await readBody(req)}catch{sendJson(res,400,{error:'bad json'});return true}
  const text=clean(body.text,280),name=clean(body.name,32)||'Зочин',topic=topics.has(body.topic)?body.topic:'home';
  if(text.length<2){sendJson(res,400,{error:'empty'});return true}
  lastPost.set(ip,now);const comment={id:now.toString(36)+Math.random().toString(36).slice(2,6),name,text,topic,at:new Date(now).toISOString(),likes:0};
  comments.push(comment);comments=comments.slice(-500);await saveJson('comments.json',comments);broadcast({type:'comment',comment});sendJson(res,201,comment);return true}
 const like=pathname.match(/^\/api\/comments\/([a-z0-9]+)\/like$/);
 if(like&&req.method==='POST'){const c=comments.find(x=>x.id===like[1]);if(!c){sendJson(res,404,{error:'not found'});return true}c.likes++;await saveJson('comments.json',comments);broadcast({type:'like',id:c.id,likes:c.likes});sendJson(res,200,c);return true}
 if(pathname==='/api/subscribe'&&req.method==='POST'){
  let body;try{body=await readBody(req)}catch{sendJson(res,400,{error:'bad json'});return true}
  const email=clean(body.email,120).toLowerCase(),plan=['free','premium','family'].includes(body.plan)?body.plan:'free';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){sendJson(res,400,{error:'email'});return true}
  const list=await loadJson('subscribers.json',[]);const existing=list.find(s=>s.email===email);
  if(existing)existing.plan=plan;else list.push({email,plan,at:new Date().toISOString()});
  await saveJson('subscribers.json',list);sendJson(res,existing?200:201,{ok:true,plan,demo:true});return true}
 return false}
const server=http.createServer(async(req,res)=>{
 const pathname=(req.url||'/').split('?')[0];
 if(pathname.startsWith('/api/')&&pathname!=='/api/events'){try{if(await api(req,res,pathname))return}catch(e){console.warn(e);sendJson(res,500,{error:'server'});return}sendJson(res,404,{error:'not found'});return}
 if(req.url?.split('?')[0]==='/api/events'){
  res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','Access-Control-Allow-Origin':'*','X-Accel-Buffering':'no'});res.write(': NAADAM demo SSE\n\n');clients.add(res);req.on('close',()=>clients.delete(res));return;
 }
 const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
 let name=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname);
 const full=path.resolve(root,`.${name}`);
 // Only the site itself is public: no server code, saved data or dotfiles (.git, .gitignore).
 const rel=path.relative(root,full);
 if(!(full===root||full.startsWith(root+path.sep))||full.startsWith(serverDir+path.sep)||rel.split(path.sep).some(part=>part.startsWith('.'))){res.writeHead(403);res.end('Forbidden');return}
 try{const file=await readFile(full);res.writeHead(200,{'Content-Type':types[path.extname(full)]||'application/octet-stream','Cache-Control':'no-store'});res.end(file)}catch{res.writeHead(404);res.end('Not found')}
});
server.listen(port,()=>console.log(`NAADAM demo: http://localhost:${port}\nReal SSE transport + simulated race data. Not official results.`));
