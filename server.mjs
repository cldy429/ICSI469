// Dependency-free Node.js SSE demo server.
// The streaming transport is REAL (Server-Sent Events). The competition data is SIMULATED.
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const racerNames=['Хээр','Зээрд','Хул','Халиун','Хар','Бор'];
const clients=new Set();let tick=0;
let racers=racerNames.map((name,i)=>({name,progress:14+(i*5)%9-i*.4,speed:47+(i*7)%13}));
function eventPacket(){tick++;
  racers=racers.map((h,i)=>({...h,progress:Math.min(100,h.progress+(h.speed/3.6)/18000*100*1.2*(9.8+Math.sin(tick*.25+i)*.7)),speed:Math.max(35,Math.min(69,h.speed+Math.sin(tick*.37+i)*.85))}));
  if(racers.every(r=>r.progress>=100)){tick=0;racers=racerNames.map((name,i)=>({name,progress:14+(i*5)%9-i*.4,speed:47+(i*7)%13}))}
  const payload=JSON.stringify({type:'race',demo:true,simulation:true,generatedAt:new Date().toISOString(),horses:racers});
  for(const client of clients){try{client.write(`data: ${payload}\n\n`)}catch{clients.delete(client)}}}
setInterval(eventPacket,1200);
const server=http.createServer(async(req,res)=>{
 if(req.url?.split('?')[0]==='/api/events'){
  res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','Access-Control-Allow-Origin':'*','X-Accel-Buffering':'no'});res.write(': NAADAM demo SSE\n\n');clients.add(res);req.on('close',()=>clients.delete(res));return;
 }
 const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
 let name=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname);
 const full=path.resolve(root,`.${name}`);
 if(!(full===root||full.startsWith(root+path.sep))){res.writeHead(403);res.end('Forbidden');return}
 try{const file=await readFile(full);res.writeHead(200,{'Content-Type':types[path.extname(full)]||'application/octet-stream','Cache-Control':'no-store'});res.end(file)}catch{res.writeHead(404);res.end('Not found')}
});
server.listen(port,()=>console.log(`NAADAM 3D demo: http://localhost:${port}\nReal SSE transport + simulated race data. Not official results.`));
