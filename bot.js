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
    console.log(`[${new Date().toLocaleTimeString()}] [${botName}] ${message}`);
}

function createBot(config) {
    if (bots[config.id]) return; // Takrorlanishni oldini olish

    log(config.username, "⏳ Navbat kutilmoqda...");
    
    const bot = mineflayer.createBot({
        host: SERVER.host,
        port: SERVER.port,
        username: config.username,
        version: SERVER.version,
        connectTimeout: 60000, // Uzoqroq kutish
        checkTimeoutInterval: 60000,
        keepAlive: true // Aloqani ushlab turish
    });

    bots[config.id] = bot;
    let lastChatMessageTime = Date.now();

    // HUB DETECTOR (1 daqiqa jimlik)
    const hubCheckInterval = setInterval(() => {
        if (Date.now() - lastChatMessageTime > 60000) {
            if (bot.socket && bot.socket.writable) {
                bot.chat('/server anarxiya2');
                log(config.username, "🕵️ Hubdan anarxiya2 ga o'tilmoqda...");
                lastChatMessageTime = Date.now(); 
            }
        }
    }, 15000);

    // 5 DAQIQALIK AFK REJIMI
    const afkInterval = setInterval(() => {
        if (bot.socket && bot.socket.writable) {
            bot.chat('/server anarxiya2');
        }
    }, 5 * 60 * 1000);

    bot.on('login', () => {
        log(config.username, "✅ Serverga kirdi.");
        // Kirish bilan harakat qilishdan oldin 5-10 soniya kutish (Anti-bot uchun)
        setTimeout(() => {
            if (bot.socket && bot.socket.writable) bot.chat('/server anarxiya2');
        }, 8000);
    });

    bot.on('message', (json) => {
        const rawMsg = json.toString();
        const msg = rawMsg.toLowerCase();
        if (rawMsg.trim().length > 0) lastChatMessageTime = Date.now();

        if (msg.includes('/login') || msg.includes('ʟᴏɢɪɴ') || msg.includes('parol')) {
            // Login buyrug'ini biroz kechiktirib yuborish
            setTimeout(() => {
                if (bot.socket && bot.socket.writable) bot.chat(`/login ${config.password}`);
            }, 3000);
        }

        if (msg.includes('muvaffaqiyatli') || msg.includes('xush kelibsiz') || msg.includes('welcome')) {
            setTimeout(() => {
                if (bot.socket && bot.socket.writable) {
                    bot.chat('/server anarxiya2');
                    bot.chat('/msg ItzZahridin____ men kirdim');
                    bot.chat('/msg boltavoy1 men kirdim');
                }
            }, 10000);
        }
    });

    bot.on('error', (err) => {
        log(config.username, `⚠️ Xato: ${err.message}`);
    });

    bot.on('end', (reason) => {
        log(config.username, `🔌 Uzildi (${reason}). 1 daqiqadan keyin qayta kiradi...`);
        clearInterval(afkInterval);
        clearInterval(hubCheckInterval);
        delete bots[config.id];
        // Server bloklamasligi uchun qayta ulanish vaqtini 1 daqiqaga oshirdik
        setTimeout(() => createBot(config), 60000);
    });
}

// --- BOTLARNI 1 DAQIQA FARQ BILAN YOQISH ---
console.log("=== VORTEXCRAFT SAFE-MODE ACTIVE ===");
BOTS_CONFIG.forEach((config, index) => {
    setTimeout(() => createBot(config), index * 60000); // Har bir bot orasida 1 daqiqa
});

http.createServer((req, res) => { res.end("Safe AFK Online"); }).listen(process.env.PORT || 8080);
