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
            bot.chat('/server anarxiya');
            console.log(`[MAJBURIY] ${account.username}: /server anarxiya2 yuborildi.`);
        }
    };

    const goToAFKWarp = () => {
        if (bot.entity) {
            bot.chat('/warp afk');
            console.log(`[WARP] ${account.username}: /warp afk yuborildi.`);
        }
    };

    // 1. HUBDAN CHIQA OLMAY QOLSA - XABARLARNI ANALIZ QILISH
    bot.on('messagestr', (msg) => {
        const cleanMsg = msg.trim().toLowerCase();
        
        // Login qismi
        if (cleanMsg.includes('/login') || cleanMsg.includes('login') || cleanMsg.includes('tizimga kirish')) {
            bot.chat(`/login ${account.password}`);
            return;
        }

        // Hubda ekanini anglatuvchi har qanday so'z kelsa (hub, lobby, articraft)
        // Yoki uzoq vaqt chatda harakat bo'lmasa ham o'tishga harakat qiladi
        if (cleanMsg.includes('hub') || cleanMsg.includes('lobby') || cleanMsg.includes('articraft') || cleanMsg.includes('xush kelibsiz')) {
            setTimeout(goToAnarchy, 10000); // 10 soniya kutib o'tadi
        }
    });

    // 2. MAJBURIY TAYMERLAR (Xabarga bog'liq bo'lmagan holda ishlaydi)
    bot.on('spawn', () => {
        console.log(`[OK] ${account.username} spawn bo'ldi.`);
        
        // Bot har safar kutilmaganda spawn bo'lsa (masalan restartdan keyin), 15 soniyadan keyin o'tadi
        setTimeout(goToAnarchy, 15000);

        // HAR 5 DAQIQADA MAJBURIY /server anarxiya2
        // Bu taymer xabar kelsa-kelmasa baribir ishlaydi!
        setInterval(() => {
            goToAnarchy();
        }, 300000);

        // Har 3 soatda /warp afk
        setInterval(() => {
            goToAFKWarp();
        }, 10800000);
    });

    bot.on('end', (reason) => {
        console.log(`[!] ${account.username} uzildi. 30 soniyadan keyin qayta kiradi...`);
        setTimeout(() => startBot(account), 30000);
    });

    bot.on('error', (err) => console.log(`[ERR] ${account.username}: ${err.message}`));
}

// Botlarni kiritish
accounts.forEach((acc, index) => {
    setTimeout(() => {
        startBot(acc);
    }, index * 45000); 
});
