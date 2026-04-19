const http = require('http');
const mineflayer = require('mineflayer');

// --- SERVER SOZLAMALARI ---
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
    log(config.username, "🚀 Serverga ulanmoqda...");
    
    const bot = mineflayer.createBot({
        host: SERVER.host,
        port: SERVER.port,
        username: config.username,
        version: SERVER.version
    });

    bots[config.id] = bot;

    // --- HUBDAN CHIQISH LOGIKASI (1 DAQIQA CHAT JIMGINALIIGI) ---
    let lastChatMessageTime = Date.now();

    const hubCheckInterval = setInterval(() => {
        const currentTime = Date.now();
        // Agar 1 daqiqa (60000 ms) davomida hech qanday chat xabari kelmagan bo'lsa
        if (currentTime - lastChatMessageTime > 60000) {
            if (bot && bot.socket && bot.socket.writable) {
                bot.chat('/server anarxiya2');
                log(config.username, "🕵️ Hub aniqlandi (chat 1 daqiqa jim edi). Anarxiya2 ga o'tilmoqda...");
                // Taymerni yangilaymiz, aks holda har soniyada spam qiladi
                lastChatMessageTime = Date.now(); 
            }
        }
    }, 10000); // Har 10 soniyada tekshiradi

    // --- HAR 5 DAQIQADA AVTOMATIK BUYRUQ ---
    const afkInterval = setInterval(() => {
        if (bot && bot.socket && bot.socket.writable) {
            bot.chat('/server anarxiya2');
            log(config.username, "🔄 5 daqiqalik majburiy avto-o'tish.");
        }
    }, 5 * 60 * 1000);

    bot.on('message', (json) => {
        const rawMsg = json.toString();
        const msg = rawMsg.toLowerCase();
        
        // Har qanday xabar kelsa, oxirgi xabar vaqtini yangilaymiz
        if (rawMsg.trim().length > 0) {
            lastChatMessageTime = Date.now();
        }

        // Login qilish
        if (msg.includes('/login') || msg.includes('ʟᴏɢɪɴ') || msg.includes('parol')) {
            bot.chat(`/login ${config.password}`);
            log(config.username, "🔑 Login qilindi.");
        }

        // Kirish bildirishnomalari
        if (msg.includes('muvaffaqiyatli') || msg.includes('xush kelibsiz') || msg.includes('welcome') || msg.includes('center')) {
            setTimeout(() => {
                if (bot && bot.socket && bot.socket.writable) {
                    bot.chat('/server anarxiya2');
                    bot.chat('/msg ItzZahridin____ men kirdim');
                    bot.chat('/msg boltavoy1 men kirdim');
                    log(config.username, "🏰 Anarxiya 2 ga o'tildi.");
                }
            }, 3000);
        }
    });

    bot.on('error', (err) => log(config.username, `❌ Xato: ${err.message}`));

    bot.on('end', (reason) => {
        log(config.username, `🔌 Uzildi (${reason}). 10 soniyadan keyin qayta ulanadi...`);
        clearInterval(afkInterval);
        clearInterval(hubCheckInterval);
        delete bots[config.id];
        setTimeout(() => createBot(config), 10000);
    });
}

// --- BOTLARNI ISHGA TUSHIRISH ---
console.log("=== VORTEXCRAFT HUB-DETECTOR AFK SYSTEM START ===");
BOTS_CONFIG.forEach((config, index) => {
    setTimeout(() => createBot(config), index * 15000);
});

http.createServer((req, res) => { res.end("AFK Hub-Detector Active"); }).listen(process.env.PORT || 8080);
