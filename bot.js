const mineflayer = require('mineflayer');

const botArgs = {
  host: '92.63.189.147', // Articraft IP
  port: 25565,
  username: 'zahridinafk_emas',
  version: '1.21'
};

let bot;

function createBot() {
  bot = mineflayer.createBot(botArgs);

  console.log('--- [SYSTEM] SILENT AFK MODE START ---');

  bot.on('message', (jsonMsg) => {
    const msg = jsonMsg.toString();
    
    // Faqat login va serverga o'tish logikasi qoladi (ishlashi uchun shart)
    if (msg.includes('ʟᴏɢɪɴ') || msg.includes('Tizimga kirish')) {
      bot.chat('/login shukrona');
    }

    if (msg.includes('xᴜꜱʜ ᴋᴇʟɪʙꜱɪᴢ') || msg.includes('zahridinafk_emas')) {
      setTimeout(() => {
        bot.chat('/server anarxiya2');
        console.log('>>> Bot Anarxiya 2 ga kirdi va AFK holatda.');
      }, 5000);
    }
  });

  // Xatolik bo'lsa o'zi qayta ulanadi
  bot.on('error', (err) => console.log('Error:', err.message));
  bot.on('end', () => {
    console.log('Aloqa uzildi. 5 soniyadan keyin qayta ulanmoqda...');
    setTimeout(createBot, 5000);
  });
}

createBot();
