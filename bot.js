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
const TG_TOKEN = '8711128717:AAG25f3UB3Vx2x3iCO4OMku9pVOa6_xoN5o'; 
const ADMIN_ID = 8161736033; 

const tgBot = new TelegramBot(TG_TOKEN, { polling: true });
let bots = {}; 
let globalAllowBots = true;
const loginStatus = {};
const userState = {}; // Foydalanuvchi qaysi botga buyruq yozayotganini saqlash uchun

// --- TELEGRAM ASOSIY MENYU ---
tgBot.onText(/\/start/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "✅ Hammasini yoqish", callback_data: 'all_on' }, { text: "🛑 Hammasini o'chirish", callback_data: 'all_off' }],
        [{ text: "📊 Statusni ko'rish", callback_data: 'status' }],
        [{ text: "🤖 Botlarni boshqarish", callback_data: 'manage_bots' }]
      ]
    }
  };
  tgBot.sendMessage(ADMIN_ID, "🎮 **Articraft Master Control Panel**\nBuyruq yuborish uchun botni tanlang:", opts);
});

// --- TUGMALARNI QABUL QILISH ---
tgBot.on('callback_query', async (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;

  if (data === 'all_on') {
    globalAllowBots = true;
    startAllBots();
    tgBot.answerCallbackQuery(query.id, { text: "Botlar ulanmoqda..." });
  } 
  else if (data === 'all_off') {
    globalAllowBots = false;
    Object.keys(bots).forEach(id => stopBot(id));
    tgBot.answerCallbackQuery(query.id, { text: "Hamma botlar uzildi." });
  }
  else if (data === 'status') {
    let txt = "📊 **Botlar holati:**\n\n";
    BOTS_CONFIG.forEach(c => {
      txt += `${bots[c.id] ? '✅' : '❌'} ${c.username} ${loginStatus[c.id] ? '(Login)' : '(Hub)'}\n`;
    });
    tgBot.sendMessage(chatId, txt);
  }
  else if (data === 'manage_bots') {
    const buttons = BOTS_CONFIG.map(c => [{ text: `👤 ${c.username}`, callback_data: `bot_menu_${c.id}` }]);
    tgBot.sendMessage(chatId, "Qaysi botni boshqarmoqchisiz?", { reply_markup: { inline_keyboard: buttons } });
  }
  else if (data.startsWith('bot_menu_')) {
    const botId = data.replace('bot_menu_', '');
    showBotMenu(chatId, botId);
  }
  else if (data.startsWith('srv_')) {
    const [_, botId, srvName] = data.split('_');
    if (bots[botId]) {
      bots[botId].chat(`/server ${srvName}`);
      tgBot.answerCallbackQuery(query.id, { text: `O'tilmoqda: ${srvName}` });
    } else tgBot.answerCallbackQuery(query.id, { text: "Bot o'yinda emas!", show_alert: true });
  }
  else if (data.startsWith('cmd_')) {
    const botId = data.replace('cmd_', '');
    userState[chatId] = { action: 'await_command', targetBot: botId };
    tgBot.sendMessage(chatId, `✍️ **${BOTS_CONFIG.find(b => b.id === botId).username}** uchun buyruqni yozing:\n(Masalan: /afk, /spawn, Salom xammaga)`);
  }
  else if (data.startsWith('in_')) {
    const botId = data.replace('in_', '');
    createBot(BOTS_CONFIG.find(c => c.id === botId));
    tgBot.answerCallbackQuery(query.id, { text: "Bot ulanmoqda..." });
  }
  else if (data.startsWith('out_')) {
    const botId = data.replace('out_', '');
    stopBot(botId);
    tgBot.answerCallbackQuery(query.id, { text: "Bot o'yindan chiqarildi." });
  }
});

// --- CHAT XABARLARINI TUTIB OLISH (BUYRUQ YOZISH UCHUN) ---
tgBot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (userState[chatId] && userState[chatId].action === 'await_command') {
    const botId = userState[chatId].targetBot;
    const command = msg.text;

    if (bots[botId]) {
      bots[botId].chat(command);
      tgBot.sendMessage(chatId, `✅ **${BOTS_CONFIG.find(b => b.id === botId).username}**: "${command}" buyrug'i yuborildi.`);
    } else {
      tgBot.sendMessage(chatId, "❌ Xato: Bot o'yindan chiqib ketgan.");
    }
    delete userState[chatId]; // Buyruq yuborilgach holatni o'chirish
  }
});

function showBotMenu(chatId, botId) {
  const config = BOTS_CONFIG.find(c => c.id === botId);
  const botMenu = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🌐 Anarxiya", callback_data: `srv_${botId}_anarxiya` }, { text: "🌐 Anarxiya 2", callback_data: `srv_${botId}_anarxiya2` }],
        [{ text: "🌐 SMP", callback_data: `srv_${botId}_smp` }, { text: "🏠 Hub", callback_data: `srv_${botId}_hub` }],
        [{ text: "✍️ Buyruq yozish", callback_data: `cmd_${botId}` }],
        [{ text: "🚀 Kirish", callback_data: `in_${botId}` }, { text: "🚪 Chiqish", callback_data: `out_${botId}` }],
        [{ text: "⬅️ Orqaga", callback_data: 'manage_bots' }]
      ]
    }
  };
  tgBot.sendMessage(chatId, `🤖 **Bot: ${config.username}**\nBoshqaruv menyusi:`, botMenu);
}

// --- MINECRAFT BOT LOGIKASI ---
function stopBot(id) {
  if (bots[id]) { try { bots[id].quit(); } catch(e) {} bots[id] = null; }
  loginStatus[id] = false;
}

function createBot(config) {
  const { id, username, password } = config;
  if (bots[id]) stopBot(id);

  const bot = mineflayer.createBot({ ...SERVER, username });
  bots[id] = bot;

  const timer = setInterval(() => {
    if (bots[id] && loginStatus[id]) bot.chat('/server anarxiya2');
  }, 3600000);

  bot.on('message', (json) => {
    const msg = json.toString();
    if (msg.includes('ʟᴏɢɪɴ') || msg.includes('Tizimga kirish')) bot.chat(`/login ${password}`);
    if (msg.includes('xᴜꜱʜ ᴋᴇʟɪʙꜱɪᴢ') || msg.includes(username)) {
      loginStatus[id] = true;
      setTimeout(() => { if (bots[id]) bot.chat('/server anarxiya2'); }, 5000);
    }
  });

  bot.on('end', () => {
    clearInterval(timer);
    bots[id] = null;
    loginStatus[id] = false;
    if (globalAllowBots) setTimeout(() => createBot(config), 15000);
  });

  bot.on('error', (err) => console.log(`[${username}] Error: ${err.message}`));
}

function startAllBots() {
  BOTS_CONFIG.forEach((config, index) => {
    setTimeout(() => { if (globalAllowBots) createBot(config); }, index * 10000);
  });
}

startAllBots();

http.createServer((req, res) => { res.writeHead(200); res.end("Ready"); }).listen(process.env.PORT || 8080);
