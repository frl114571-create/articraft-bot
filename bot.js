const mineflayer = require('mineflayer');

const serverHost = '92.63.189.147';
const serverPort = 25565;
const password = 'shukrona'; // Hamma uchun bir xil login/parol

// Akkauntlar ro'yxati
const accounts = [
    'Zahridin____',
    'Zahridinafk_emas',
    'Zahridin_unban',
    'dffhggfgd'
];

function launchBot(username) {
    const bot = mineflayer.createBot({
        host: serverHost,
        port: serverPort,
        username: username,
        version: '1.21', // Versiyani aniq ko'rsatish ulanishni tezlashtiradi
        checkTimeoutInterval: 60000
    });

    console.log(`[TAYYORLOV] ${username} ulanishga harakat qilmoqda...`);

    bot.on('messagestr', (message) => {
        const msg = message.trim();
        
        // Loglarni terminalda ko'rish
        if (msg) console.log(`[${username}] ${msg}`);

        // 1. Avtomatik Login/Register
        if (msg.includes('/register') || msg.includes('ʀᴇɢɪꜱᴛᴇʀ')) {
            bot.chat(`/register ${password} ${password}`);
        } 
        else if (msg.includes('/login') || msg.includes('ʟᴏɢɪɴ') || msg.includes('Tizimga kirish')) {
            bot.chat(`/login ${password}`);
        }

        // 2. Hubdan Anarxiyaga o'tish
        // Agar xush kelibsiz xabarini ko'rsa yoki Hubda ekanini sezsa
        if (msg.includes('xᴜꜱʜ ᴋᴇʟɪʙꜱɪᴢ') || msg.includes('Hub') || msg.includes('Lobby')) {
            setTimeout(() => {
                bot.chat('/server anarxiya');
                console.log(`[O'TISH] ${username} anarxiyaga o'tishga urindi.`);
            }, 5000);
        }
    });

    // 3. Kick bo'lganda yoki ulanish uzilganda qayta kirish
    bot.on('end', () => {
        console.log(`[!] ${username} ulanish uzildi. 10 soniyadan keyin qayta kiradi...`);
        setTimeout(() => launchBot(username), 10000);
    });

    bot.on('error', (err) => {
        console.log(`[XATO] ${username}: ${err.message}`);
    });

    // O'yin ichida qolib ketmasligi uchun (Anti-AFK oddiy turi)
    bot.on('spawn', () => {
        console.log(`[+] ${username} spawn bo'ldi.`);
        // Har 30 soniyada ozgina qimirlab turadi
        setInterval(() => {
            if (bot.entity) bot.setControlState('jump', true);
            setTimeout(() => { if (bot.entity) bot.setControlState('jump', false); }, 500);
        }, 30000);
    });
}

// Botlarni ishga tushirish (Har bir bot orasida 15 soniya farq bilan)
accounts.forEach((name, index) => {
    setTimeout(() => {
        launchBot(name);
    }, index * 15000); 
});
