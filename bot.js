const http = require('http');
const mineflayer = require('mineflayer');
const TelegramBot = require('node-telegram-bot-api');

// --- SOZLAMALAR ---
const TG_TOKEN = process.env.TG_TOKEN || '8710360006:AAFgfl_EAOaqHB0KItrxo3Lqp-N7ZtiFlRw'; 
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

// --- ASOSIY MENYU ---
function getMainMenu() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🚀 Hammasini Yoqish", callback_data: 'all_on' }, { text: "🛑 Hammasini O'chirish", callback_data: 'all_off' }],
                [{ text: "📊 Statusni Ko'rish", callback_data: 'status' }],
                [{ text: "🎮 Botlar Ro'yxati", callback_data: 'list' }]
            ]
        }
    };
}

// --- TELEGRAM LOGIKASI (HAMMA UCHUN OCHIQ) ---
tgBot.onText(/\/start/, (msg) => {
    // ID tekshiruvi olib tashlandi
    tgBot.sendMessage(msg.chat.id, "🌐 **VortexCraft | Ommaviy Panel**\nBarcha foydalanuvchilar boshqara oladi.", getMainMenu());
});

tgBot.on('callback_query', (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;

    if (data === 'all_on') {
        globalAllowBots = true;
        BOTS_CONFIG.forEach((c, i) => setTimeout(() => createBot(c), i * 10000));
        tgBot.answerCallbackQuery(query.id, { text: "Botlar yoqilmoqda..." });
    } 
    else if (data === 'all_off') {
        globalAllowBots = false;
        Object.keys(bots).forEach(id => { try { bots[id].quit(); } catch(e){} delete bots[id]; });
        tgBot.answerCallbackQuery(query.id, { text: "To'xtatildi." });
    }
    else if (data === 'status') {
        let txt = "🛰 **Botlar holati:**\n\n";
        BOTS_CONFIG.forEach(c => {
            const isOnline = (bots[c.id] && bots[c.id].socket && bots[c.id].socket.writable) ? "🟢 Online" : "🔴 Offline";
            txt += `${isOnline} — **${c.username}**\n`;
        });
        tgBot.sendMessage(chatId, txt, { parse_mode: 'Markdown' });
        tgBot.answerCallbackQuery(query.id);
    }
    else if (data === 'list') {
        const btns = BOTS_CONFIG.map(c => [{ text: `🤖 ${c.username}`, callback_data: `manage_${c.id}` }]);
        tgBot.sendMessage(chatId, "Botni tanlang:", { reply_markup: { inline_keyboard: btns } });
        tgBot.answerCallbackQuery(query.id);
    }
    else if (data.startsWith('manage_')) {
        const botId = data.replace('manage_', '');
        tgBot.sendMessage(chatId, `🎮 Boshqaruv:`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "⚔️ Anarxiya 2", callback_data: `go_${botId}_anarxiya2` }, { text: "🏰 Hub", callback_data: `go_${botId}_hub` }],
                    [{ text: "💬 Buyruq", callback_data: `cmd_${botId}` }]
                ]
            }
        });
        tgBot.answerCallbackQuery(query.id);
    }
    else if (data.startsWith('go_')) {
        const [_, id, srv] = data.split('_');
        if (bots[id]) {
            bots[id].chat(`/server ${srv}`);
            tgBot.answerCallbackQuery(query.id, { text: "Buyruq yuborildi." });
        }
    }
    else if (data.startsWith('cmd_')) {
        const botId = data.replace('cmd_', '');
        userState[chatId] = { action: 'typing', targetBot: botId };
        tgBot.sendMessage(chatId, `✍️ Buyruq yozing:`);
        tgBot.answerCallbackQuery(query.id);
    }
});

tgBot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (userState[chatId] && userState[chatId].action === 'typing' && msg.text !== '/start') {
        const target = bots[userState[chatId].targetBot];
        if (target) {
            target.chat(msg.text);
            tgBot.sendMessage(chatId, "✅ Yuborildi.");
        }
        delete userState[chatId];
    }
});

// --- MINECRAFT BOT ---
function createBot(config) {
  if (!globalAllowBots) return;
  if (bots[config.id]) { try { bots[config.id].quit(); } catch(e){} }

  const bot = mineflayer.createBot({
    host: SERVER.host, port: SERVER.port, username: config.username, version: SERVER.version
  });

  bots[config.id] = bot;

  bot.on('message', (json) => {
    const rawMsg = json.toString();
    const msg = rawMsg.toLowerCase();
    
    if (msg.includes('/login') || msg.includes('ʟᴏɢɪɴ') || msg.includes('parol')) {
        bot.chat(`/login ${config.password}`);
    }
    
    if (msg.includes('xush kelibsiz') || msg.includes('welcome') || msg.includes('center')) {
        setTimeout(() => { if (bots[config.id]) bot.chat('/server anarxiya2'); }, 5000);
    }
  });

  bot.on('end', () => {
    delete bots[config.id];
    if (globalAllowBots) setTimeout(() => createBot(config), 20000);
  });
}

// Avto-Redirect har 20 daqiqada
setInterval(() => {
    Object.keys(bots).forEach(id => {
        if (bots[id] && bots[id].socket && bots[id].socket.writable) bots[id].chat('/server anarxiya2');
    });
}, 20 * 60 * 1000);

http.createServer((req, res) => { res.end("Public Vortex OK"); }).listen(process.env.PORT || 8080);
