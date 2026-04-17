const http = require('http');
const mineflayer = require('mineflayer');

const BOTS_CONFIG = [
  { id: 'bot1', username: 'zahridinafk_emas', password: 'shukrona' },
  { id: 'bot2', username: 'Zahridin____',      password: 'shukrona' },
  { id: 'bot3', username: 'Zahridin_unban',    password: 'shukrona' },
  { id: 'bot4', username: 'dffhggfgd',         password: 'shukrona' },
];

const SERVER = { host: '92.63.189.147', port: 25565, version: '1.21' };
const HOSTILE_MOBS = ['zombie','skeleton','spider','cave_spider','creeper','witch',
  'enderman','blaze','slime','phantom','drowned','husk','stray','pillager','vindicator'];

let bots = {};
let logs = [];
let clients = [];

// Har bot uchun holat
const state = {};
BOTS_CONFIG.forEach(c => { state[c.id] = { moving: false, fighting: false, loggedIn: false }; });

const LABELS = { bot1:'[BOT-1]', bot2:'[BOT-2]', bot3:'[BOT-3]', bot4:'[BOT-4]' };

function addLog(id, msg) {
  const entry = `[${new Date().toLocaleTimeString()}] ${LABELS[id]||id} ${msg}`;
  logs.push(entry);
  if (logs.length > 300) logs.shift();
  clients.forEach(r => r.write(`data: ${JSON.stringify(entry)}\n\n`));
  console.log(entry);
}

// ── Web server ─────────────────────────────────────────────────
const server = http.createServer((req, res) => {

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'});
    res.end(`<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Articraft Bot</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0f0f1a;color:#e0e0e0;font-family:'Segoe UI',sans-serif}
header{background:#1a1a2e;padding:14px 20px;border-bottom:2px solid #4ade80;display:flex;align-items:center;gap:10px}
header h1{font-size:1.2rem;color:#4ade80}
.dot{width:9px;height:9px;border-radius:50%;background:#4ade80;margin-left:auto;animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.wrap{max-width:920px;margin:18px auto;padding:0 14px;display:flex;flex-direction:column;gap:14px}
.card{background:#1a1a2e;border-radius:10px;border:1px solid #2a2a4a;overflow:hidden}
.ct{padding:10px 14px;font-size:.78rem;color:#666;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #2a2a4a}
#log-box{height:300px;overflow-y:auto;padding:10px 14px;font-family:monospace;font-size:.8rem;line-height:1.7;display:flex;flex-direction:column;gap:1px}
.e{color:#a0f0a0}.e.b2{color:#7dd3fc}.e.b3{color:#c084fc}.e.b4{color:#fb923c}.e.err{color:#f87171}
.badges{display:flex;flex-wrap:wrap;gap:8px;padding:8px 14px;border-bottom:1px solid #2a2a4a}
.badge{font-size:.72rem;padding:3px 9px;border-radius:20px;font-weight:600}
.b1g{background:#1a3a1a;color:#4ade80;border:1px solid #4ade80}
.b2g{background:#1a2a3a;color:#7dd3fc;border:1px solid #7dd3fc}
.b3g{background:#2a1a3a;color:#c084fc;border:1px solid #c084fc}
.b4g{background:#3a2a1a;color:#fb923c;border:1px solid #fb923c}
.sel-row{display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px;border-bottom:1px solid #2a2a4a}
.sel-row button{background:#2a2a4a;color:#888;border:none;border-radius:6px;padding:8px 14px;cursor:pointer;font-size:.85rem;transition:all .2s}
.sel-row button.active{background:#4ade80;color:#0f0f1a;font-weight:700}
.btn-grid{display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px}
.btn{border:none;border-radius:6px;padding:9px 16px;font-weight:600;font-size:.82rem;cursor:pointer;transition:all .2s}
.btn-green{background:#4ade80;color:#0f0f1a}.btn-green:hover{background:#22c55e}
.btn-red{background:#f87171;color:#0f0f1a}.btn-red:hover{background:#ef4444}
.btn-blue{background:#7dd3fc;color:#0f0f1a}.btn-blue:hover{background:#38bdf8}
.btn-gray{background:#2a2a4a;color:#a0c4ff}.btn-gray:hover{background:#3a3a6a}
.btn-orange{background:#fb923c;color:#0f0f1a}.btn-orange:hover{background:#f97316}
.btn-purple{background:#c084fc;color:#0f0f1a}.btn-purple:hover{background:#a855f7}
.cmd-row{display:flex;gap:8px;padding:10px 14px}
input{flex:1;background:#0f0f1a;border:1px solid #3a3a5a;border-radius:6px;padding:9px 12px;color:#e0e0e0;font-size:.9rem;outline:none}
input:focus{border-color:#4ade80}
#status{padding:0 14px 10px;font-size:.78rem;min-height:20px}
</style>
</head>
<body>
<header><h1>🤖 Articraft Botlar</h1><div class="dot"></div></header>
<div class="wrap">

  <div class="card">
    <div class="ct">Loglar</div>
    <div class="badges">
      <span class="badge b1g">● BOT-1: zahridinafk_emas</span>
      <span class="badge b2g">● BOT-2: Zahridin____</span>
      <span class="badge b3g">● BOT-3: Zahridin_unban</span>
      <span class="badge b4g">● BOT-4: dffhggfgd</span>
    </div>
    <div id="log-box"></div>
  </div>

  <div class="card">
    <div class="ct">Bot tanlash</div>
    <div class="sel-row">
      <button id="s1" class="active" onclick="sel('bot1')">BOT-1</button>
      <button id="s2" onclick="sel('bot2')">BOT-2</button>
      <button id="s3" onclick="sel('bot3')">BOT-3</button>
      <button id="s4" onclick="sel('bot4')">BOT-4</button>
      <button id="sA" onclick="sel('all')">HAMMASI</button>
    </div>
  </div>

  <div class="card">
    <div class="ct">Harakat va Jangovar</div>
    <div class="btn-grid">
      <button class="btn btn-green"  onclick="toggle('move','on')">🚶 Yurish ON</button>
      <button class="btn btn-red"    onclick="toggle('move','off')">🛑 Yurish OFF</button>
      <button class="btn btn-orange" onclick="toggle('fight','on')">⚔️ Urish ON</button>
      <button class="btn btn-red"    onclick="toggle('fight','off')">🛑 Urish OFF</button>
    </div>
  </div>

  <div class="card">
    <div class="ct">Server buyruqlari</div>
    <div class="btn-grid">
      <button class="btn btn-blue"   onclick="cmd('/server anarxiya2')">Anarxiya 2</button>
      <button class="btn btn-blue"   onclick="cmd('/server anarxiya')">Anarxiya</button>
      <button class="btn btn-gray"   onclick="cmd('/server hub')">Hub</button>
      <button class="btn btn-gray"   onclick="cmd('/afk')">AFK</button>
    </div>
  </div>

  <div class="card">
    <div class="ct">Buyruq / Chat yozish</div>
    <div class="cmd-row">
      <input id="inp" placeholder="/tp, /say yoki oddiy chat..." />
      <button class="btn btn-green" onclick="sendInp()">Yuborish</button>
    </div>
    <div id="status"></div>
  </div>

</div>
<script>
const box = document.getElementById('log-box');
let cur = 'bot1';
function sel(id) {
  cur = id;
  ['s1','s2','s3','s4','sA'].forEach(s => document.getElementById(s).className = 'sel-row button'.split(' ')[1] ? '' : '');
  document.querySelectorAll('.sel-row button').forEach(b => b.classList.remove('active'));
  const m = {bot1:'s1',bot2:'s2',bot3:'s3',bot4:'s4',all:'sA'};
  document.getElementById(m[id]).classList.add('active');
}
function addEntry(t) {
  const d = document.createElement('div');
  const err = t.toLowerCase().includes('xato')||t.toLowerCase().includes('error');
  d.className='e'+(err?' err':t.includes('[BOT-2]')?' b2':t.includes('[BOT-3]')?' b3':t.includes('[BOT-4]')?' b4':'');
  d.textContent=t; box.appendChild(d); box.scrollTop=box.scrollHeight;
}
new EventSource('/logs').onmessage = e => addEntry(JSON.parse(e.data));
function showSt(msg, ok) {
  const el = document.getElementById('status');
  el.style.color = ok ? '#4ade80' : '#f87171';
  el.textContent = msg;
  clearTimeout(el._t); el._t = setTimeout(() => el.textContent='', 3000);
}
async function post(url, data) {
  const r = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  return r.json();
}
async function cmd(c) {
  const d = await post('/command', {cmd:c, bot:cur});
  showSt(d.sent>0 ? '\u2713 Yuborildi ('+d.sent+' bot)' : '\u2717 Bot ulanmagan', d.sent>0);
}
async function toggle(type, onoff) {
  const d = await post('/toggle', {type, onoff, bot:cur});
  showSt('\u2713 '+d.message, true);
}
function sendInp() {
  const v = document.getElementById('inp').value.trim();
  if (!v) return;
  document.getElementById('inp').value='';
  cmd(v);
}
document.getElementById('inp').addEventListener('keydown', e => { if(e.key==='Enter') sendInp(); });
</script>
</body></html>`);

  } else if (req.method === 'GET' && req.url === '/logs') {
    res.writeHead(200, {'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});
    logs.forEach(l => res.write(`data: ${JSON.stringify(l)}\n\n`));
    clients.push(res);
    req.on('close', () => { clients = clients.filter(c => c !== res); });

  } else if (req.method === 'POST' && req.url === '/command') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      let sent = 0, failed = [];
      try {
        const { cmd, bot: target } = JSON.parse(body);
        if (cmd) {
          const targets = target === 'all' ? Object.keys(bots) : [target];
          targets.forEach(id => {
            if (bots[id]) { bots[id].chat(cmd); addLog(id, `[SIZ] ${cmd}`); sent++; }
            else { failed.push(id); addLog(id, '[XATO] Bot ulanmagan'); }
          });
        }
      } catch(e) {}
      res.writeHead(200,{'Content-Type':'application/json'});
      res.end(JSON.stringify({sent, failed}));
    });

  } else if (req.method === 'POST' && req.url === '/toggle') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      let message = '';
      try {
        const { type, onoff, bot: target } = JSON.parse(body);
        const on = onoff === 'on';
        const targets = target === 'all' ? BOTS_CONFIG.map(c => c.id) : [target];
        targets.forEach(id => {
          if (type === 'move') {
            state[id].moving = on;
            if (!on && bots[id]) { try { bots[id].setControlState('forward', false); bots[id].setControlState('jump', false); } catch(e) {} }
            addLog(id, `Yurish ${on ? 'YOQILDI' : 'O\'CHIRILDI'}`);
          } else if (type === 'fight') {
            state[id].fighting = on;
            addLog(id, `Urish ${on ? 'YOQILDI' : 'O\'CHIRILDI'}`);
          }
        });
        message = `${type==='move'?'Yurish':'Urish'} ${on?'yoqildi':'o\'chirildi'} (${targets.length} bot)`;
      } catch(e) { message = 'Xato'; }
      res.writeHead(200,{'Content-Type':'application/json'});
      res.end(JSON.stringify({message}));
    });

  } else {
    res.writeHead(404); res.end();
  }
});

server.listen(process.env.PORT || 5000);

// ── Bot logikasi ───────────────────────────────────────────────
function createBot(config) {
  const { id, username, password } = config;
  const bot = mineflayer.createBot({ ...SERVER, username });
  bots[id] = bot;
  addLog(id, `Ulanmoqda: ${username}`);

  // ── Yurish sikli ─────────────────────────
  const moveLoop = setInterval(() => {
    if (!state[id].moving || !bots[id]) return;
    try {
      bot.look(Math.random() * Math.PI * 2, 0, true);
      bot.setControlState('forward', true);
      setTimeout(() => { try { bot.setControlState('forward', false); } catch(e){} }, 2000);
      if (Math.random() > 0.6) {
        bot.setControlState('jump', true);
        setTimeout(() => { try { bot.setControlState('jump', false); } catch(e){} }, 500);
      }
    } catch(e) {}
  }, 12000 + Math.random() * 8000);

  // ── Urish sikli ──────────────────────────
  const fightLoop = setInterval(() => {
    if (!state[id].fighting || !bots[id]) return;
    try {
      const mob = bot.nearestEntity(e => {
        if (!e || !e.name) return false;
        return HOSTILE_MOBS.includes(e.name) && bot.entity.position.distanceTo(e.position) < 5;
      });
      if (mob) { bot.lookAt(mob.position.offset(0, mob.height, 0)); bot.attack(mob); addLog(id, `Mob urildi: ${mob.name}`); }
    } catch(e) {}
  }, 1000);

  bot.on('message', (jsonMsg) => {
    const msg = jsonMsg.toString();
    const isPersonal = msg.includes(username) || msg.includes('ʟᴏɢɪɴ') ||
      msg.includes('Tizimga kirish') || msg.includes('xᴜꜱʜ ᴋᴇʟɪʙꜱɪᴢ') ||
      msg.includes('PlayerPoints') || msg.includes('AFK');
    if (id === 'bot1' || isPersonal) addLog(id, msg);

    if (msg.includes('ʟᴏɢɪɴ') || msg.includes('Tizimga kirish')) {
      bot.chat(`/login ${password}`);
    }
    if (msg.includes('xᴜꜱʜ ᴋᴇʟɪʙꜱɪᴢ') || msg.includes(username)) {
      state[id].loggedIn = true;
      setTimeout(() => { bot.chat('/server anarxiya2'); addLog(id, 'Anarxiya 2 ga o\'tildi.'); }, 5000);
    }
  });

  bot.on('spawn', () => {
    if (!state[id].loggedIn) return;
    try { bot.setControlState('forward', false); bot.setControlState('jump', false); } catch(e){}
    setTimeout(() => { bot.chat('/server anarxiya2'); addLog(id, 'Hub — Anarxiya 2 ga qayta o\'tilmoqda...'); }, 5000);
  });

  bot.on('error', (err) => {
    addLog(id, `Xato: ${err.message}`);
    try { bot.setControlState('forward', false); } catch(e){}
  });

  bot.on('end', () => {
    clearInterval(moveLoop); clearInterval(fightLoop);
    bots[id] = null;
    addLog(id, 'Uzildi. 5 soniyadan keyin qayta ulanmoqda...');
    setTimeout(() => createBot(config), 5000);
  });
}

BOTS_CONFIG.forEach(config => createBot(config));
