const http = require('http');
const mineflayer = require('mineflayer');
const TelegramBot = require('node-telegram-bot-api');

// --- SOZLAMALAR ---
const BOTS_CONFIG = [
  { id: 'bot1', username: 'zahridinafk_emas', password: 'shukrona' },
  { id: 'bot2', username: 'Zahridin____',      password: 'shukrona' },
  { id: 'bot3', username: 'Zahridin_unban',    password: 'shukrona' },
  { id: 'bot4', username: 'dffhggfgd',         password: 'shukrona' },
];

const SERVER = { host: '92.63.189.147', port: 25565 };

// Telegram ma'lumotlarini to'g'ridan-to'g'ri kodga yozdim
const TG_TOKEN = '8711128717:AAG25f3UB3Vx2x3iCO4OMku9pVOa6_xoN5o'; 
const ADMIN_ID = 8161736033; 

const tgBot = new TelegramBot(TG_TOKEN, { polling: true });
let bots = {};
let globalAllowBots = true;
const state = {};

BOTS_CONFIG.forEach(c => { state[c.id] = { loggedIn: false }; });

// --- LOG VA TELEGRAM XABAR ---
function logToTg(msg) {
  console.log(msg);
  tgBot.sendMessage(ADMIN_ID, `📝 **Log:** ${msg}`, { parse_mode: 'Markdown' });
}

// --- TELEGRAM BUYRUQLARI ---
tgBot.onText(/\/start/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  tgBot.sendMessage(ADMIN_ID, "🤖 **Articraft Bot Paneliga xush kelibsiz!**\n\n/on - Botlarni yoqish\n/off - Botlarni o'chirish\n/status - Holatni tekshirish", { parse_mode: 'Markdown' });
});

tgBot.onText(/\/on/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  globalAllowBots = true;
  tgBot.sendMessage(ADMIN_ID, "✅ **Botlar ishga tushirilmoqda...**");
  startAllBots();
});

tgBot.onText(/\/off/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  globalAllowBots = false;
  Object.keys(bots).forEach(id => {
    if (bots[id]) {
      bots[id].quit();
      bots[id] = null;
    }
  });
  tgBot.sendMessage(ADMIN_ID, "🛑 **Hamma botlar o'yindan chiqarildi.**");
});

tgBot.onText(/\/status/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  let statusMsg = globalAllowBots ? "🟢 **Tizim: ON**\n\n" : "🔴 **Tizim: OFF**\n\n";
  BOTS_CONFIG.forEach(c => {
    statusMsg += `👤 ${c.username}: ${bots[c.id] ? '✅ Online' : '❌ Offline'}\n`;
  });
  tgBot.sendMessage(ADMIN_ID, statusMsg, { parse_mode: 'Markdown' });
});

// --- MINECRAFT BOT LOGIKASI ---
function createBot(config) {
  if (!globalAllowBots) return;

  const { id, username, password } = config;
  
  // Eski botni tozalash
  if (bots[id]) { try { bots[id].quit(); } catch(e) {} }

  const bot = mineflayer.createBot({ ...SERVER, username });
  bots[id] = bot;

  bot.on('message', (jsonMsg) => {
    const msg = jsonMsg.toString();
    
    // Login qilish
    if (msg.includes('ʟᴏɢɪɴ') || msg.includes('Tizimga kirish')) {
      bot.chat(`/login ${password}`);
    }
    
    // Muvaffaqiyatli kirsa Anarxiya2 ga o'tish
    if (msg.includes('xᴜꜱʜ ᴋᴇʟɪʙꜱɪᴢ') || msg.includes(username)) {
      state[id].loggedIn = true;
      setTimeout(() => { if(bots[id]) bot.chat('/server anarxiya2'); }, 5000);
    }
  });

  // Har 1 soatda Hubdan Anarxiya2 ga o'tkazish
  const hourlyCheck = setInterval(() => {
    if (bots[id] && state[id].loggedIn) {
      bot.chat('/server anarxiya2');
    }
  }, 3600000);

  bot.on('spawn', () => {
    if (state[id].loggedIn) {
      setTimeout(() => { if(bots[id]) bot.chat('/server anarxiya2'); }, 5000);
    }
  });

  bot.on('error', (err) => console.log(`[${username}] Xato: ${err.message}`));

  bot.on('end', () => {
    clearInterval(hourlyCheck);
    bots[id] = null;
    state[id].loggedIn = false;
    if (globalAllowBots) {
      setTimeout(() => createBot(config), 15000);
    }
  });
}

function startAllBots() {
  BOTS_CONFIG.forEach((config, index) => {
    setTimeout(() => {
      if (globalAllowBots) createBot(config);
    }, index * 10000); // 10 soniya farq bilan ulanish
  });
}

// Skript yonganda botlarni boshlash
startAllBots();

// --- RAILWAY UCHUN WEB SERVER ---
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Botlar Telegram orqali boshqarilmoqda...");
}).listen(process.env.PORT || 8080);
