const http = require('http');
const mineflayer = require('mineflayer');
const TelegramBot = require('node-telegram-bot-api');

// --- SOZLAMALAR ---
// Railway Variables'dan oladi, bo'sh bo'lsa yangi tokeningizni ishlatadi
const TG_TOKEN = process.env.TG_TOKEN || '8710300006:AAFgfl_EAOaqHB0KItrxo3Lqp-N7ZtiFlRw'; 
const ADMIN_ID = parseInt(process.env.ADMIN_ID) || 8161736033; 
const SERVER = { 
    host: process.env.MC_HOST || '92.63.189.147', 
    port: 25565, 
    version: '1.18.2' 
}; 

const BOTS_CONFIG = [
  { id: 'bot1', username: 'zahridinafk_emas', password: 'shukrona' },
  { id: 'bot2', username: 'Zahridin____',      password: 'shukrona' },
  { id: 'bot3', username: 'Zahridin_unban',    password: 'shukrona' },
  { id: 'bot4', username: 'dffhggfgd',         password: 'shukrona' },
];

const tgBot = new TelegramBot(TG_TOKEN, { polling: true });
let bots = {}; 
let globalAllowBots = true;
const userState = {};

function log(botName, message) {
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] [${botName}] ${message}`);
}

// --- TELEGRAM PANEL ---
function getMainMenu() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🚀 Hammasini Yoqish", callback_data: 'all_on' }, { text: "🛑 Hammasini O'chirish", callback_data: 'all_off' }],
                [{ text: "📊 Status", callback_data: 'status' }],
                [{ text: "🎮 Har birini boshqarish", callback_data: 'list' }]
            ]
        }
    };
}

tgBot.onText(/\/start/, (msg) => {
    if (msg.from.id !== ADMIN_ID) return;
    tgBot.sendMessage(ADMIN_ID, "🛡 **VortexCraft Ideal Cloud Panel**\n\nBotlar avtomatik ulanmoqda...", getMainMenu());
});

tgBot.on('callback_query', (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;

    if (data === 'all_on') {
        globalAllowBots = true;
        BOTS_CONFIG.forEach((c, i) => setTimeout(() => createBot(c), i * 15000));
        tgBot.answerCallbackQuery(query.id, { text: "Botlar navbat bilan kiritilmoqda..." });
    } 
    else if (data === 'all_off') {
        globalAllowBots = false;
        Object.keys(bots).forEach(id => { try { bots[id].quit(); } catch(e){} delete bots[id]; });
        tgBot.answerCallbackQuery(query.id, { text: "Hamma botlar o'chirildi." });
    }
    else if (data === 'status') {
        let txt = "🛰 **Botlar holati:**\n\n";
        BOTS_CONFIG.forEach(c => {
            const isOnline = (bots[c.id] && bots[c.id].socket && bots[c.id].socket.writable) ? "🟢 Online" : "🔴 Offline";
            txt += `${isOnline} — **${c.username}**\n`;
        });
        tgBot.sendMessage(chatId, txt, { parse_mode: 'Markdown' });
    }
    else if (data === 'list') {
        const btns = BOTS_CONFIG.map(c => [{ text: `🤖 ${c.username}`, callback_data: `manage_${c.id}` }]);
        tgBot.sendMessage(chatId, "Boshqarish uchun tanlang:", { reply_markup: { inline_keyboard: btns } });
    }
    else if (data.startsWith('manage_')) {
        const botId = data.replace('manage_', '');
        tgBot.sendMessage(chatId, `🎮 Boshqaruv menyusi:`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "⚔️ Anarxiya 2", callback_data: `go_${botId}_anarxiya2` }, { text: "🏰 Hub", callback_data: `go_${botId}_hub` }],
                    [{ text: "💬 Buyruq", callback_data: `cmd_${botId}` }]
                ]
            }
        });
    }
    else if (data.startsWith('go_')) {
        const [_, id, srv] = data.split('_');
        if (bots[id]) {
            bots[id].chat(`/server ${srv}`);
            tgBot.answerCallbackQuery(query.id, { text: `${srv}ga yuborildi.` });
        }
    }
    else if (data.startsWith('cmd_')) {
        const botId = data.replace('cmd_', '');
        userState[chatId] = { action: 'typing', targetBot: botId };
        tgBot.sendMessage(chatId, `✍️ Buyruq yoki xabar yozing:`);
    }
});

tgBot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (userState[chatId] && userState[chatId].action === 'typing') {
        const target = bots[userState[chatId].targetBot];
        if (target) target.chat(msg.text);
        delete userState[chatId];
        tgBot.sendMessage(chatId, "✅ Yuborildi.");
    }
});

// --- MINECRAFT BOT LOGIKASI ---
function createBot(config) {
  if (!globalAllowBots) return;
  if (bots[config.id]) { try { bots[config.id].quit(); } catch(e){} }

  const bot = mineflayer.createBot({
    host: SERVER.host, port: SERVER.port, username: config.username, version: SERVER.version
  });

  bots[config.id] = bot;

  // Har 20 daqiqada avtomatik o'tkazish
  const autoRedirect = setInterval(() => {
    if (bots[config.id] && bot.socket && bot.socket.writable) {
      bot.chat('/server anarxiya2');
      log(config.username, "🔄 Auto-Server yuborildi.");
    }
  }, 20 * 60 * 1000);

  bot.on('message', (json) => {
    const rawMsg = json.toString();
    const msg = rawMsg.toLowerCase();
    
    console.log(`  > ${config.username}: ${rawMsg}`);

    if (msg.includes('/login') || msg.includes('ʟᴏɢɪɴ') || msg.includes('parol')) {
        bot.chat(`/login ${config.password}`);
        log(config.username, "🔑 Login qilindi.");
    }
    
    if (msg.includes('xush kelibsiz') || msg.includes('welcome') || msg.includes('center')) {
        setTimeout(() => {
            if (bots[config.id]) bot.chat('/server anarxiya2');
        }, 5000);
    }
  });

  bot.on('error', (err) => log(config.username, `❌ Xato: ${err.message}`));
  bot.on('end', () => {
    clearInterval(autoRedirect);
    delete bots[config.id];
    if (globalAllowBots) setTimeout(() => createBot(config), 20000);
  });
}

// --- START ---
BOTS_CONFIG.forEach((c, i) => setTimeout(() => createBot(c), i * 15000));

// --- POLLING ERROR HANDLER & SERVER ---
tgBot.on('polling_error', (err) => {
    if (err.message.includes('409 Conflict')) {
        console.log("⚠️ 409 Conflict: Bot boshqa joyda ochiq. Railway ulanishni kutmoqda...");
    }
});

http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is Active with New Token");
}).listen(process.env.PORT || 8080);
