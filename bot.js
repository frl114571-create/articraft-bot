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

// Telegram ma'lumotlari
const TG_TOKEN = '8711128717:AAG25f3UB3Vx2x3iCO4OMku9pVOa6_xoN5o'; 
const ADMIN_ID = 8161736033; 

const tgBot = new TelegramBot(TG_TOKEN, { polling: true });
let bots = {}; // Hozirgi bot obyektlari
let globalAllowBots = true; // Botlarga ulanishga ruxsat
const loginStatus = {}; // Botlar login bo'lganmi yoki yo'q

// --- TELEGRAM BUYRUQLARI ---
tgBot.onText(/\/start/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  tgBot.sendMessage(ADMIN_ID, "🤖 **Articraft Bot Boshqaruv Paneli**\n\n/on - Botlarni ulaydi (Start)\n/off - Botlarni uzadi (Stop)\n/status - Botlar holatini ko'rish");
});

// BOTLARNI YOQISH
tgBot.onText(/\/on/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  globalAllowBots = true;
  tgBot.sendMessage(ADMIN_ID, "✅ Botlarni ulash jarayoni boshlandi. Har bir bot 10 soniya farq bilan kiradi...");
  startAllBots();
});

// BOTLARNI O'CHIRISH
tgBot.onText(/\/off/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  globalAllowBots = false;
  
  Object.keys(bots).forEach(id => {
    if (bots[id]) {
      bots[id].quit(); // O'yindan chiqarish
      bots[id] = null;
    }
    loginStatus[id] = false;
  });
  
  tgBot.sendMessage(ADMIN_ID, "🛑 Hamma botlar o'yindan chiqarildi va avtomatik ulanish to'xtatildi.");
});

// HOLATNI TEKSHIRISH
tgBot.onText(/\/status/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  
  let report = globalAllowBots ? "🟢 **Tizim: ISHLAYAPTI**\n\n" : "🔴 **Tizim: TO'XTATILGAN**\n\n";
  
  BOTS_CONFIG.forEach(c => {
    const isOnline = bots[c.id] ? "✅ Online" : "❌ Offline";
    const isLogged = loginStatus[c.id] ? "(Login bo'lgan)" : "(Kirish kutilmoqda)";
    report += `👤 ${c.username}: ${isOnline} ${isLogged}\n`;
  });
  
  tgBot.sendMessage(ADMIN_ID, report, { parse_mode: 'Markdown' });
});

// --- ASOSIY BOT FUNKSIYASI ---
function createBot(config) {
  // Agar foydalanuvchi OFF qilgan bo'lsa, ulanishni taqiqlash
  if (!globalAllowBots) return;

  const { id, username, password } = config;

  // Eski ulanish mavjud bo'lsa tozalash
  if (bots[id]) {
    try { bots[id].quit(); } catch(e) {}
    bots[id] = null;
  }

  console.log(`[${username}] Ulanishga harakat qilinmoqda...`);
  const bot = mineflayer.createBot({ ...SERVER, username });
  bots[id] = bot;
  loginStatus[id] = false;

  // Har 1 soatda Anarxiya2 ga o'tkazish taymeri
  const hourlyTimer = setInterval(() => {
    if (bots[id] && loginStatus[id]) {
      bot.chat('/server anarxiya2');
    }
  }, 3600000);

  bot.on('message', (jsonMsg) => {
    const msg = jsonMsg.toString();
    
    // Login qilish (Agar login so'rasa)
    if (msg.includes('ʟᴏɢɪɴ') || msg.includes('Tizimga kirish') || msg.includes('/login')) {
      bot.chat(`/login ${password}`);
    }

    // Login bo'lgandan keyin serverga o'tish
    if (msg.includes('xᴜꜱʜ ᴋᴇʟɪʙꜱɪᴢ') || msg.includes('muvaffaqiyatli kirdingiz') || msg.includes(username)) {
      loginStatus[id] = true;
      setTimeout(() => { if (bots[id]) bot.chat('/server anarxiya2'); }, 5000);
    }
  });

  bot.on('spawn', () => {
    // Agar bot spawn bo'lsa (o'lsa yoki server almashsa)
    if (loginStatus[id]) {
      setTimeout(() => { if (bots[id]) bot.chat('/server anarxiya2'); }, 5000);
    }
  });

  bot.on('error', (err) => {
    console.log(`[${username}] Xatolik: ${err.message}`);
  });

  bot.on('end', () => {
    console.log(`[${username}] Serverdan uzildi.`);
    clearInterval(hourlyTimer);
    bots[id] = null;
    loginStatus[id] = false;

    // Faqat agar foydalanuvchi OFF qilmagan bo'lsa qayta ulanish
    if (globalAllowBots) {
      console.log(`[${username}] 15 soniyadan keyin qayta ulanadi...`);
      setTimeout(() => createBot(config), 15000);
    }
  });
}

function startAllBots() {
  BOTS_CONFIG.forEach((config, index) => {
    setTimeout(() => {
      if (globalAllowBots) createBot(config);
    }, index * 12000); // 12 soniya farq bilan (Server bloklamasligi uchun)
  });
}

// Skript birinchi marta yurganda botlarni yoqish
startAllBots();

// Railway o'chib qolmasligi uchun kichik server
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Botlar Telegram orqali boshqarilmoqda.");
}).listen(process.env.PORT || 8080);
