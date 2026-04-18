const http = require('http');
const mineflayer = require('mineflayer');

const BOTS_CONFIG = [
  { id: 'bot1', username: 'zahridinafk_emas', password: 'shukrona' },
  { id: 'bot2', username: 'Zahridin____',      password: 'shukrona' },
  { id: 'bot3', username: 'Zahridin_unban',    password: 'shukrona' },
  { id: 'bot4', username: 'dffhggfgd',         password: 'shukrona' },
];

const SERVER = { host: '92.63.189.147', port: 25565 }; 
const HOSTILE_MOBS = ['zombie','skeleton','spider','cave_spider','creeper','witch',
  'enderman','blaze','slime','phantom','drowned','husk','stray','pillager','vindicator'];

// MAXFIY KODLAR
const OFF_CODE = 'abothelpoffgguzbkingqwertyuiop';
const ON_CODE = 'abothelpongguzbkingqwertyuiop';

let bots = {};
let logs = [];
let clients = [];
let globalAllowBots = true; // Botlar ishlashiga ruxsat

const state = {};
BOTS_CONFIG.forEach(c => { 
    state[c.id] = { moving: false, fighting: false, loggedIn: false }; 
});

const LABELS = { bot1:'[BOT-1]', bot2:'[BOT-2]', bot3:'[BOT-3]', bot4:'[BOT-4]' };

function addLog(id, msg) {
  const entry = `[${new Date().toLocaleTimeString()}] ${LABELS[id]||id} ${msg}`;
  logs.push(entry);
  if (logs.length > 300) logs.shift();
  clients.forEach(r => r.write(`data: ${JSON.stringify(entry)}\n\n`));
  console.log(entry);
}

// ── Web server (O'zgarishsiz qoldi) ──────────────────────────────
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, {'Content-Type':'text/html;charset=utf-8'});
    res.end(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Articraft Bot Control</title></head><body style="background:#0f0f1a;color:white;font-family:sans-serif;padding:20px;"><h1>🤖 Botlar Boshqaruvi</h1><p>Botlar holati: <b>Active</b></p><div id="logs" style="background:#1a1a2e;height:400px;overflow-y:auto;padding:10px;font-family:monospace;border:1px solid #4ade80;"></div><script>const l=document.getElementById('logs');new EventSource('/logs').onmessage=e=>{const d=document.createElement('div');d.textContent=JSON.parse(e.data);l.appendChild(d);l.scrollTop=l.scrollHeight;}</script></body></html>`);
  } else if (req.method === 'GET' && req.url === '/logs') {
    res.writeHead(200, {'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});
    clients.push(res);
    req.on('close', () => { clients = clients.filter(c => c !== res); });
  } else { res.writeHead(404); res.end(); }
});
server.listen(process.env.PORT || 5000);

// ── Bot logikasi ───────────────────────────────────────────────
function createBot(config) {
  if (!globalAllowBots) return; // Agar ruxsat bo'lmasa, botni yaratma

  const { id, username, password } = config;
  const bot = mineflayer.createBot({ ...SERVER, username });
  bots[id] = bot;
  addLog(id, `Ulanmoqda: ${username}`);

  const moveLoop = setInterval(() => {
    if (!state[id].moving || !bots[id]) return;
    try {
      bot.look(Math.random() * Math.PI * 2, 0, true);
      bot.setControlState('forward', true);
      setTimeout(() => { if(bots[id]) bot.setControlState('forward', false); }, 2000);
    } catch(e) {}
  }, 15000);

  const fightLoop = setInterval(() => {
    if (!state[id].fighting || !bots[id]) return;
    try {
      const mob = bot.nearestEntity(e => HOSTILE_MOBS.includes(e.name) && bot.entity.position.distanceTo(e.position) < 5);
      if (mob) { bot.lookAt(mob.position.offset(0, mob.height, 0)); bot.attack(mob); }
    } catch(e) {}
  }, 1000);

  const hourlyCheck = setInterval(() => {
    if (bots[id] && state[id].loggedIn) {
      bot.chat('/server anarxiya2');
    }
  }, 3600000);

  bot.on('chat', (username, message) => {
    // Agar chatda OFF kodini ko'rsa
    if (message === OFF_CODE) {
      addLog(id, "⚠️ OFF KOD qabul qilindi! Botlar o'chmoqda...");
      globalAllowBots = false;
      Object.values(bots).forEach(b => { if(b) b.quit(); });
    }
    
    // Agar chatda ON kodini ko'rsa (Faqat bitta bot ko'rsa ham hamma ulanadi)
    if (message === ON_CODE && !globalAllowBots) {
      addLog(id, "✅ ON KOD qabul qilindi! Botlar qayta ulanmoqda...");
      globalAllowBots = true;
      startAllBots();
    }
  });

  bot.on('message', (jsonMsg) => {
    const msg = jsonMsg.toString();
    if (msg.includes('ʟᴏɢɪɴ') || msg.includes('Tizimga kirish')) {
      bot.chat(`/login ${password}`);
    }
    if (msg.includes('xᴜꜱʜ ᴋᴇʟɪʙꜱɪᴢ') || msg.includes(username)) {
      state[id].loggedIn = true;
      setTimeout(() => { if(bots[id]) bot.chat('/server anarxiya2'); }, 5000);
    }
  });

  bot.on('spawn', () => {
    if (!state[id].loggedIn) return;
    setTimeout(() => { if(bots[id]) bot.chat('/server anarxiya2'); }, 5000);
  });

  bot.on('error', (err) => addLog(id, `Xato: ${err.message}`));

  bot.on('end', () => {
    clearInterval(moveLoop); 
    clearInterval(fightLoop);
    clearInterval(hourlyCheck);
    bots[id] = null;
    state[id].loggedIn = false;
    
    // Agar global ruxsat bo'lsa, 10 soniyadan keyin qayta ulanadi
    if (globalAllowBots) {
      addLog(id, 'Uzildi. 10 soniyadan keyin qayta ulanadi...');
      setTimeout(() => createBot(config), 10000);
    } else {
      addLog(id, "O'chirildi (Kutish rejimida)");
    }
  });
}

// Hammani ishga tushirish funksiyasi
function startAllBots() {
  BOTS_CONFIG.forEach((config, index) => {
    setTimeout(() => {
      if (globalAllowBots) createBot(config);
    }, index * 10000);
  });
}

// Birinchi marta botlarni ishga tushirish
startAllBots();
