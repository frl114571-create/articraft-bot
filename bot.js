const mineflayer = require('mineflayer');

const serverHost = '92.63.189.147';
const serverPort = 25565;

const accounts = [
  { username: 'zahridinafk_emas', password: 'shukrona' },
  { username: 'Zahridin____',     password: 'shukrona' },
  { username: 'Zahridin_unban',    password: 'shukrona' },
  { username: 'dffhggfgd',         password: 'shukrona' }
];

function startBot(account) {
    console.log(`[ULANISH] ${account.username} ulanmoqda...`);

    const bot = mineflayer.createBot({
        host: serverHost,
        port: serverPort,
        username: account.username,
        version: '1.21',
        hideErrors: true,
        connectTimeout: 60000,
        keepAlive: true
    });

    // Anarxiya2 ga o'tish funksiyasi
    const goToAnarchy = () => {
        if (bot.entity) {
            bot.chat('/server anarxiya2');
            console.log(`[AUTO-MOVE] ${account.username}: Anarxiya2 buyrug'i yuborildi.`);
        }
    };

    // AFK zonaga borish funksiyasi
    const goToAFKWarp = () => {
        if (bot.entity) {
            bot.chat('/warp afk');
            console.log(`[WARP] ${account.username}: /warp afk buyrug'i yuborildi.`);
        }
    };

    bot.on('messagestr', (msg) => {
        const cleanMsg = msg.trim();
        
        // Loglarni ko'rib boramiz
        if (cleanMsg) console.log(`[${account.username}] ${cleanMsg}`);

        // Avtomatik Login
        if (cleanMsg.includes('/login') || cleanMsg.includes('ʟᴏɢɪɴ') || cleanMsg.includes('Tizimga kirish')) {
            bot.chat(`/login ${account.password}`);
        }

        // Hubda ekanini sezsa, Anarxiya2 ga o'tadi
        if (cleanMsg.includes('xᴜꜱʜ ᴋᴇʟɪʙꜱɪᴢ') || cleanMsg.includes('Hub') || cleanMsg.includes('Lobby')) {
            setTimeout(goToAnarchy, 7000);
        }
    });

    bot.on('spawn', () => {
        console.log(`[OK] ${account.username} serverda. AFK rejimida.`);
        
        // 1. Har 5 daqiqada (300,000 ms) Anarxiya2 ga o'tishni tekshiradi
        setInterval(goToAnarchy, 300000);

        // 2. Har 3 soatda (10,800,000 ms) AFK zonaga boradi
        // (3 soat = 3 * 60 * 60 * 1000)
        setInterval(goToAFKWarp, 10800000);
    });

    bot.on('end', (reason) => {
        console.log(`[!] ${account.username} uzildi: ${reason}. 30 soniyadan keyin qayta kiradi...`);
        setTimeout(() => startBot(account), 30000);
    });

    bot.on('error', (err) => console.log(`[ERR] ${account.username}: ${err.message}`));
}

// Botlarni NAVBAT bilan (45 soniya farq bilan) kiritish
accounts.forEach((acc, index) => {
    setTimeout(() => {
        startBot(acc);
    }, index * 45000); 
});
