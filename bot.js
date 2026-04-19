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

    // HAR 5 DAQIQADA AVTOMATIK BUYRUQ
    const afkInterval = setInterval(() => {
        if (bot && bot.socket && bot.socket.writable) {
            bot.chat('/server anarxiya2');
            log(config.username, "🔄 5 daqiqalik avto-o'tish yuborildi.");
        }
    }, 5 * 60 * 1000); // 5 daqiqa

    bot.on('message', (json) => {
        const rawMsg = json.toString();
        const msg = rawMsg.toLowerCase();

        // Login qilish
        if (msg.includes('/login') || msg.includes('ʟᴏɢɪɴ') || msg.includes('parol')) {
            bot.chat(`/login ${config.password}`);
            log(config.username, "🔑 Login qilindi.");
        }

        // Kirish bilan Anarxiya2 ga o'tish va bildirishnoma yuborish
        if (msg.includes('muvaffaqiyatli') || msg.includes('xush kelibsiz') || msg.includes('welcome') || msg.includes('center')) {
            setTimeout(() => {
                if (bot && bot.socket && bot.socket.writable) {
                    bot.chat('/server anarxiya2');
                    bot.chat('/msg ItzZahridin____ men kirdim');
                    bot.chat('/msg boltavoy1 men kirdim');
                    log(config.username, "🏰 Anarxiya 2 ga o'tildi va bildirishnomalar yuborildi.");
                }
            }, 3000); // 3 soniya kutib keyin o'tadi
        }
    });

    bot.on('error', (err) => log(config.username, `❌ Xato: ${err.message}`));

    bot.on('end', (reason) => {
        log(config.username, `🔌 Serverdan chiqdi (${reason}). 10 soniyadan keyin qayta kiradi...`);
        clearInterval(afkInterval);
        delete bots[config.id];
        // 10 soniyadan keyin qayta ulanish
        setTimeout(() => createBot(config), 10000);
    });
}

// --- BOTLARNI ISHGA TUSHIRISH ---
console.log("==========================================");
console.log("   VORTEXCRAFT FULL AFK SYSTEM START     ");
console.log("==========================================");

BOTS_CONFIG.forEach((config, index) => {
    // Botlar bir vaqtda kirib ban bo'lmasligi uchun 15 soniya farq bilan yoqiladi
    setTimeout(() => createBot(config), index * 15000);
});

// Railway o'chib qolmasligi uchun portni band qilamiz
http.createServer((req, res) => {
    res.end("AFK Bots are running 24/7");
}).listen(process.env.PORT || 8080);
