const http = require('http');
const mineflayer = require('mineflayer');
const TelegramBot = require('node-telegram-bot-api');

// --- SOZLAMALAR ---
const TG_TOKEN = '8679302878:AAESHvbJmJLsbqxSRKYcansnkCzY_fnGA-4'; 
const ADMIN_ID = 8161736033; 
const SERVER = { host: '92.63.189.147', port: 25565, version: '1.18.2' }; 

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

// --- TELEGRAM PANEL MENYULARI ---
function getMainMenu() {
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🚀 Hammasini Yoqish", callback_data: 'all_on' }, { text: "🛑 Hammasini O'chirish", callback_data: 'all_off' }],
                [{ text: "📊 Botlar Statusi", callback_data: 'status' }],
                [{ text: "🎮 Har birini boshqarish", callback_data: 'list' }]
            ]
        }
    };
}

tgBot.onText(/\/start/, (msg) => {
    if (msg.from.id !== ADMIN_ID) return;
    tgBot.sendMessage(ADMIN_ID, "🛡 **VortexCraft Ideal Boshqaruv Paneli**\nBotlar avtomatik ishga tushgan.", getMainMenu());
});

tgBot.on('callback_query', (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;

    if (data === 'all_on') {
        globalAllowBots = true;
        BOTS_CONFIG.forEach((c, i) => setTimeout(() => createBot(c), i * 15000));
        tgBot.answerCallbackQuery(query.id, { text: "Botlar ulanmoqda..." });
    } 
    else if (data === 'all_off') {
        globalAllowBots = false;
        Object.keys(bots).forEach(id => { try { bots[id].quit(); } catch(e){} delete bots[id]; });
        tgBot.answerCallbackQuery(query.id, { text: "Barcha botlar o'chirildi." });
    }
    else if (data === 'status') {
        let txt = "🛰 **Tizim holati:**\n\n";
        BOTS_CONFIG.forEach(c => {
            const isOnline = (bots[c.id] && bots[c.id].socket && bots[c.id].socket.writable) ? "🟢 Online" : "🔴 Offline";
            txt += `${isOnline} — **${c.username}**\n`;
        });
        tgBot.sendMessage(chatId, txt, { parse_mode: 'Markdown' });
    }
    else if (data === 'list') {
        const btns = BOTS_CONFIG.map(c => [{ text: `🤖 ${c.username}`, callback_data: `manage_${c.id}` }]);
        tgBot.sendMessage(chatId, "Boshqarish uchun botni tanlang:", { reply_markup: { inline_keyboard: btns } });
    }
    else if (data.startsWith('manage_')) {
        const botId = data.replace('manage_', '');
        const config = BOTS_CONFIG.find(b => b.id === botId);
        tgBot.sendMessage(chatId, `🎮 **${config.username}** boshqaruvi:`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "⚔️ Anarxiya 2", callback_data: `go_${botId}_anarxiya2` }, { text: "🏰 Hub", callback_data: `go_${botId}_hub` }],
                    [{ text: "💬 Buyruq yozish", callback_data: `cmd_${botId}` }],
                    [{ text: "🔄 Qayta ulanish", callback_data: `reconnect_${botId}` }]
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
        tgBot.sendMessage(chatId, `✍️ Buyruqni yozing (masalan: /spawn):`);
    }
});

tgBot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (userState[chatId] && userState[chatId].action === 'typing') {
        const target = bots[userState[chatId].targetBot];
        if (target) target.chat(msg.text);
        delete userState[chatId];
        tgBot.sendMessage(chatId, "✅ Buyruq bajarildi.");
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

  // Har 20 daqiqada Anarxiya 2 ga o'tish
  const autoRedirect = setInterval(() => {
    if (bots[config.id] && bot.socket && bot.socket.writable) {
      bot.chat('/server anarxiya2');
      log(config.username, "🔄 Auto-Redirect: Anarxiya 2");
    }
  }, 20 * 60 * 1000);

  bot.on('message', (json) => {
    const rawMsg = json.toString();
    const msg = rawMsg.toLowerCase();
    
    // Terminalda hamma narsani ko'rish
    console.log(`  > ${config.username}: ${rawMsg}`);

    // Login va Avtomatik /server anarxiya2
    if (msg.includes('/login') || msg.includes('ʟᴏɢɪɴ') || msg.includes('parol')) {
        bot.chat(`/login ${config.password}`);
        log(config.username, "🔑 Login qilindi.");
    }
    
    // Serverga kirganda (center xabarini ham taniydi)
    if (msg.includes('xush kelibsiz') || msg.includes('welcome') || msg.includes('center')) {
        log(config.username, "🔓 Kirish muvaffaqiyatli! 5 soniyadan keyin Anarxiya 2 ga o'tadi...");
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

// --- AVTOMATIK START ---
console.log("=== VORTEXCRAFT ADMIN CONSOLE STARTED ===");
BOTS_CONFIG.forEach((c, i) => setTimeout(() => createBot(c), i * 15000));

http.createServer((req, res) => { res.end("System Ideal Online"); }).listen(process.env.PORT || 8080);
