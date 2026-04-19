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
const TG_TOKEN = process.env.TG_TOKEN || '8711128717:AAG4KjgTsCr9V10dHzQDCF1J4T_rYkavxiY'; 
const ADMIN_ID = 8161736033; 

const tgBot = new TelegramBot(TG_TOKEN, { polling: true });
let bots = {}; 
let globalAllowBots = true;
const userState = {};

// --- TELEGRAM LOGIKA ---
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
  tgBot.sendMessage(ADMIN_ID, "🎮 **Control Panel Active**", opts);
});

tgBot.on('callback_query', async (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;

  if (data === 'all_on') {
    globalAllowBots = true;
    startAllBots();
    tgBot.answerCallbackQuery(query.id, { text: "Navbat bilan ulanmoqda..." });
  } 
  else if (data === 'all_off') {
    globalAllowBots = false;
    Object.keys(bots).forEach(id => stopBot(id));
    tgBot.answerCallbackQuery(query.id, { text: "Botlar o'chirildi." });
  }
  else if (data === 'status') {
    let txt = "📊 **Status:**\n\n";
    BOTS_CONFIG.forEach(c => {
      const isOnline = (bots[c.id] && bots[c.id].socket && bots[c.id].socket.writable) ? "✅ Online" : "❌ Offline";
      txt += `${isOnline} **${c.username}**\n`;
    });
    tgBot.sendMessage(chatId, txt, { parse_mode: 'Markdown' });
  }
  else if (data === 'manage_bots') {
    const buttons = BOTS_CONFIG.map(c => [{ text: `👤 ${c.username}`, callback_data: `bot_menu_${c.id}` }]);
    tgBot.sendMessage(chatId, "Botni tanlang:", { reply_markup: { inline_keyboard: buttons } });
  }
  else if (data.startsWith('bot_menu_')) {
    const botId = data.replace('bot_menu_', '');
    showBotMenu(chatId, botId);
  }
  else if (data.startsWith('srv_')) {
    const [_, botId, srvName] = data.split('_');
    const targetBot = bots[botId];
    if (targetBot && targetBot.socket && targetBot.socket.writable) {
      targetBot.chat(`/server ${srvName}`);
      tgBot.answerCallbackQuery(query.id, { text: "O'tilmoqda..." });
    } else {
      tgBot.answerCallbackQuery(query.id, { text: "Bot offline!", show_alert: true });
    }
  }
  else if (data.startsWith('cmd_')) {
    const botId = data.replace('cmd_', '');
    userState[chatId] = { action: 'await_command', targetBot: botId };
    tgBot.sendMessage(chatId, "Buyruqni yozing:");
  }
  else if (data.startsWith('in_')) {
    createBot(BOTS_CONFIG.find(c => c.id === data.replace('in_', '')));
    tgBot.answerCallbackQuery(query.id, { text: "Kiritilmoqda..." });
  }
  else if (data.startsWith('out_')) {
    stopBot(data.replace('out_', ''));
    tgBot.answerCallbackQuery(query.id, { text: "Chiqarildi." });
  }
});

tgBot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (userState[chatId] && userState[chatId].action === 'await_command') {
    const targetBot = bots[userState[chatId].targetBot];
    if (targetBot && targetBot.socket && targetBot.socket.writable) {
      targetBot.chat(msg.text);
      tgBot.sendMessage(chatId, "✅ Yuborildi.");
    }
    delete userState[chatId];
  }
});

function showBotMenu(chatId, botId) {
  const config = BOTS_CONFIG.find(c => c.id === botId);
  tgBot.sendMessage(chatId, `🤖 **Bot: ${config.username}**`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Anarxiya 2", callback_data: `srv_${botId}_anarxiya2` }, { text: "Hub", callback_data: `srv_${botId}_hub` }],
        [{ text: "✍️ Buyruq", callback_data: `cmd_${botId}` }],
        [{ text: "🚀 Kirish", callback_data: `in_${botId}` }, { text: "🚪 Chiqish", callback_data: `out_${botId}` }],
        [{ text: "⬅️ Orqaga", callback_data: 'manage_bots' }]
      ]
    }
  });
}

// --- MINECRAFT BOT ---
function stopBot(id) {
  if (bots[id]) {
    try { bots[id].quit(); } catch(e) {}
    delete bots[id]; 
  }
}

function createBot(config) {
  if (!globalAllowBots) return;
  if (bots[config.id]) stopBot(config.id);

  const bot = mineflayer.createBot({ ...SERVER, username: config.username });
  bots[config.id] = bot;

  bot.on('message', (json) => {
    const msg = json.toString();
    if (msg.includes('/login')) bot.chat(`/login ${config.password}`);
    if (msg.includes('muvaffaqiyatli kirdingiz')) {
      setTimeout(() => { if (bots[config.id]) bot.chat('/server anarxiya2'); }, 5000);
    }
  });

  bot.on('spawn', () => {
    setTimeout(() => { if (bots[config.id]) bot.chat('/server anarxiya2'); }, 5000);
  });

  bot.on('end', () => {
    delete bots[config.id];
    if (globalAllowBots) setTimeout(() => createBot(config), 25000); 
  });

  bot.on('error', (err) => {
    console.log(`[${config.username}] Error: ${err.message}`);
    delete bots[config.id];
  });
}

function startAllBots() {
  BOTS_CONFIG.forEach((config, index) => {
    setTimeout(() => { if (globalAllowBots) createBot(config); }, index * 25000);
  });
}

tgBot.on('polling_error', (err) => console.log("TG Error:", err.message));
process.on('uncaughtException', (err) => console.log('Crash prevention:', err.message));

http.createServer((req, res) => { res.end("Online"); }).listen(process.env.PORT || 8080);
