const http = require('http');
const mineflayer = require('mineflayer');

const SERVER = { 
    host: '92.63.189.147', 
    port: 25565, 
    version: '1.18.2' 
}; 

const BOTS_CONFIG = [
  { id: 'bot1', username: 'zahridinafk_emas', password: 'shukrona' },
  { id: 'bot2', username: 'Zahridin____',      password: 'shukrona' },
  { id: 'bot3', username: 'Zahridin_unban',    password: 'shukrona' },
  { id: 'bot4', username: 'dffhggfgd',         password: 'shukrona' },
];

let bots = {};

function log(botName, message) {
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] [${botName}] ${message}`);
}

function createBot(config) {
    // Agar bot allaqachon ulanish jarayonida bo'lsa, to'xtatamiz
    if (bots[config.id]) {
        try { bots[config.id].quit(); } catch(e) {}
        delete bots[config.id];
    }

    log(config.username, "🚀 Ulanishga urinilmoqda...");
    
    const bot = mineflayer.createBot({
        host: SERVER.host,
        port: SERVER.port,
        username: config.username,
        version: SERVER.version,
        // Ulanish vaqtini biroz uzaytiramiz (socketClosed xatosini kamaytirish uchun)
        connectTimeout: 30000 
    });

    bots[config.id] = bot;

    let lastChatMessageTime = Date.now();

    // HUB DETECTOR (1 daqiqa jimlik bo'lsa)
    const hubCheckInterval = setInterval(() => {
        const currentTime = Date.now();
        if (currentTime - lastChatMessageTime > 60000) {
            if (bot && bot.socket && bot.socket.writable) {
                bot.chat('/server anarxiya2');
                log(config.username, "🕵️ Hub aniqlandi. Anarxiya2 ga o'tilmoqda...");
                lastChatMessageTime = Date.now(); 
            }
        }
    }, 20000);

    // 5 DAQIQALIK MAJBURIY O'TISH
    const afkInterval = setInterval(() => {
        if (bot && bot.socket && bot.socket.writable) {
            bot.chat('/server anarxiya2');
            log(config.username, "🔄 5 daqiqalik majburiy o'tkazgich.");
        }
    }, 5 * 60 * 1000);

    bot.on('login', () => {
        log(config.username, "✅ Serverga kirdi.");
        // Kirishi bilanoq bir marta o'tishga urinish
        setTimeout(() => {
            if (bot.socket && bot.socket.writable) bot.chat('/server anarxiya2');
        }, 2000);
    });

    bot.on('message', (json) => {
        const rawMsg = json.toString();
        const msg = rawMsg.toLowerCase();
        
        if (rawMsg.trim().length > 0) {
            lastChatMessageTime = Date.now();
            // console.log(`[${config.username}] Chat: ${rawMsg}`); // Chatni ko'rishni xohlasangiz oching
        }

        if (msg.includes('/login') || msg.includes('ʟᴏɢɪɴ') || msg.includes('parol')) {
            bot.chat(`/login ${config.password}`);
            log(config.username, "🔑 Login yuborildi.");
        }

        if (msg.includes('muvaffaqiyatli') || msg.includes('xush kelibsiz') || msg.includes('welcome') || msg.includes('center')) {
            setTimeout(() => {
                if (bot && bot.socket && bot.socket.writable) {
                    bot.chat('/server anarxiya2');
                    bot.chat('/msg ItzZahridin____ men kirdim');
                    bot.chat('/msg boltavoy1 men kirdim');
                    log(config.username, "🏰 Anarxiya 2 tasdiqlandi.");
                }
            }, 5000);
        }
    });

    // Muhim: Error handler o'chib qolishini oldini oladi
    bot.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') log(config.username, "❌ Server o'chiq.");
        else log(config.username, `⚠️ Xato: ${err.message}`);
    });

    bot.on('end', (reason) => {
        log(config.username, `🔌 Uzildi (${reason}). 15 soniyadan keyin qayta ulanadi...`);
        clearInterval(afkInterval);
        clearInterval(hubCheckInterval);
        delete bots[config.id];
        // Ulanish vaqtini 15 soniyaga ko'paytirdik (server bloklamasligi uchun)
        setTimeout(() => createBot(config), 15000);
    });
}

// --- BOTLARNI NAVBAT BILAN ISHGA TUSHIRISH ---
console.log("=== VORTEXCRAFT OPTIMIZED AFK SYSTEM ===");
BOTS_CONFIG.forEach((config, index) => {
    // Har bir bot orasidagi farqni 30 soniyaga oshirdik (Anti-Botdan o'tish uchun)
    setTimeout(() => createBot(config), index * 30000);
});

http.createServer((req, res) => { res.end("System Online"); }).listen(process.env.PORT || 8080);
