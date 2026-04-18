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
const userState = {};

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
  tgBot.sendMessage(ADMIN_ID, "🎮 **Articraft Master Control Panel**", opts);
});

// --- CALLBACK QUERY ISHLOVCHI ---
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
    tgBot.answerCallbackQuery(query.id, { text: "Barcha botlar o'chirildi." });
  }
  else if (data === 'status') {
    let txt = "📊 **Botlar holati:**\n\n";
    BOTS_CONFIG.forEach(c => {
      const isOnline = (bots[c.id] && bots[c.id].entity) ? "✅ Online" : "❌ Offline";
      txt += `${isOnline} **${c.username}**\n`;
    });
    tgBot.sendMessage(chatId, txt, { parse_mode: 'Markdown' });
  }
  else if (data === 'manage_bots') {
    const buttons = BOTS_CONFIG.map(c => [{ text: `👤 ${c.username}`, callback_data: `bot_menu_${c.id}` }]);
    tgBot.sendMessage(chatId, "Boshqarish uchun botni tanlang:", { reply_markup: { inline_keyboard: buttons } });
  }
  else if (data.startsWith('bot_menu_')) {
    const botId = data.replace('bot_menu_', '');
    showBotMenu(chatId, botId);
  }
  else if (data.startsWith('srv_')) {
    const [_, botId, srvName] = data.split('_');
    if (bots[botId] && bots[botId].entity) {
      bots[botId].chat(`/server ${srvName}`);
      tgBot.answerCallbackQuery(query.id, { text: `${srvName} ga o'tilmoqda...` });
    } else {
      tgBot.answerCallbackQuery(query.id, { text: "Xato: Bot o'yinda emas!", show_alert: true });
    }
  }
  else if (data.startsWith('cmd_')) {
    const botId = data.replace('cmd_', '');
    userState[chatId] = { action: 'await_command', targetBot: botId };
    tgBot.sendMessage(chatId, `✍️ **${BOTS_CONFIG.find(b => b.id === botId).username}** uchun buyruq yozing:`);
  }
  else if (data.startsWith('in_')) {
    const botId = data.replace('in_', '');
    createBot(BOTS_CONFIG.find(c => c.id === botId));
    tgBot.answerCallbackQuery(query.id, { text: "Ulanmoqda..." });
  }
  else if (data.startsWith('out_')) {
    const botId = data.replace('out_', '');
    stopBot(botId);
    tgBot.answerCallbackQuery(query.id, { text: "Bot uzildi." });
  }
});

// --- CHAT XABARLARINI TUTIB OLISH ---
tgBot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (userState[chatId] && userState[chatId].action === 'await_command') {
    const botId = userState[chatId].targetBot;
    if (bots[botId] && bots[botId].entity) {
      bots[botId].chat(msg.text);
      tgBot.sendMessage(chatId, `✅ Yuborildi: ${msg.text}`);
    } else {
      tgBot.sendMessage(chatId, "❌ Bot o'yinda emas!");
    }
    delete userState[chatId];
  }
});

// --- MENYU FUNKSIYASI ---
function showBotMenu(chatId, botId) {
  const config = BOTS_CONFIG.find(c => c.id === botId);
  const botMenu = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Anarxiya", callback_data: `srv_${botId}_anarxiya` }, { text: "Anarxiya 2", callback_data: `srv_${botId}_anarxiya2` }],
        [{ text: "SMP", callback_data: `srv_${botId}_smp` }, { text: "Hub", callback_data: `srv_${botId}_hub` }],
        [{ text: "✍️ Buyruq yozish", callback_data: `cmd_${botId}` }],
        [{ text: "🚀 Kirish", callback_data: `in_${botId}` }, { text: "🚪 Chiqish", callback_data: `out_${botId}` }],
        [{ text: "⬅️ Orqaga", callback_data: 'manage_bots' }]
      ]
    }
  };
  tgBot.sendMessage(chatId, `🤖 **Bot: ${config.username}**`, botMenu);
}

// --- MINECRAFT BOT LOGIKASI (MUHIM TUZATISHLAR) ---
function stopBot(id) {
  if (bots[id]) {
    try { bots[id].quit(); } catch(e) {}
    delete bots[id]; // Obyektni butunlay o'chirish
  }
  loginStatus[id] = false;
}

function createBot(config) {
  if (!globalAllowBots) return;
  const { id, username, password } = config;

  if (bots[id]) stopBot(id);

  const bot = mineflayer.createBot({ ...SERVER, username });
  
  // Bot obyektini darhol ro'yxatga qo'shish
  bots[id] = bot;

  bot.on('message', (json) => {
    const msg = json.toString();
    if (msg.includes('ʟᴏɢɪɴ') || msg.includes('Tizimga kirish')) bot.chat(`/login ${password}`);
    if (msg.includes('xᴜꜱʜ ᴋᴇʟɪʙꜱɪᴢ') || msg.includes(username)) {
      loginStatus[id] = true;
      setTimeout(() => { if (bots[id]) bot.chat('/server anarxiya2'); }, 5000);
    }
  });

  bot.on('end', () => {
    delete bots[id]; // Uzilganda o'chirish
    loginStatus[id] = false;
    if (globalAllowBots) setTimeout(() => createBot(config), 15000);
  });

  bot.on('error', (err) => {
    console.log(`[${username}] Xato: ${err.message}`);
    delete bots[id];
  });
}

function startAllBots() {
  BOTS_CONFIG.forEach((config, index) => {
    setTimeout(() => { if (globalAllowBots) createBot(config); }, index * 10000);
  });
}

// Avtomatik boshlash
startAllBots();

// Railway uchun server
http.createServer((req, res) => { res.end("OK"); }).listen(process.env.PORT || 8080);
