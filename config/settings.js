import 'dotenv/config';

const settings = {
    // ═══ Identidad del Bot ═══
    botName: process.env.BOT_NAME || 'ChimuBot',
    ownerNumber: process.env.OWNER_NUMBER || '5491112345678',
    get ownerJid() {
        return this.ownerNumber + '@s.whatsapp.net';
    },

    // ═══ Prefijos ═══
    defaultPrefix: process.env.PREFIX || '/',
    prefixes: ['/', '!', '#', '.', '@'],

    // ═══ Emojis personalizables ═══
    emojis: {
        response: '✦',
        menu: '❑',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        loading: '⏳',
        money: '🪙',
        xp: '✨',
        level: '🏆',
    },

    // ═══ Economía ═══
    economy: {
        currencyName: 'ChimuCoins',
        dailyReward: { min: 200, max: 500 },
        workReward: { min: 100, max: 300 },
        crimeReward: { min: 200, max: 600 },
        crimeFail: { min: 50, max: 200 },
        fishReward: { min: 50, max: 250 },
        mineReward: { min: 80, max: 350 },
        robChance: 0.4, // 40% de éxito
        workCooldown: 3600000,      // 1 hora
        crimeCooldown: 7200000,     // 2 horas
        robCooldown: 3600000,       // 1 hora
        fishCooldown: 1800000,      // 30 min
        mineCooldown: 1800000,      // 30 min
    },

    // ═══ Leveling ═══
    leveling: {
        xpPerMessage: { min: 5, max: 15 },
        xpPerLevel: 100,  // XP base por nivel (se multiplica)
        maxLevel: 100,
    },

    // ═══ Administración ═══
    maxWarnings: 3,
    spamThreshold: 5,        // mensajes en spamInterval
    spamInterval: 5000,      // 5 segundos
    maxSubbots: parseInt(process.env.MAX_SUBBOTS) || 5,

    // ═══ Modos del bot ═══
    autoRead: false,
    autoTyping: true,
    antiCallMode: false,
    consoleMode: true,
    antiPV: false,
    antiPV2: false,

    // ═══ APIs ═══
    apis: {
        openai: process.env.OPENAI_API_KEY || '',
        weather: process.env.WEATHER_API_KEY || '',
    },

    // ═══ Paths ═══
    paths: {
        sessions: './sessions',
        temp: './temp',
        data: './data',
        logs: './logs',
        assets: './assets',
    },
};

export default settings;
