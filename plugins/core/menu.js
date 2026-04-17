import { reply } from '../../lib/formatter.js';
import { getCategories, getPluginsByCategory, getPluginCount } from '../../lib/pluginLoader.js';
import settings from '../../config/settings.js';

const categoryEmojis = {
    core: '📋',
    owner: '🔱',
    profile: '📋',
    group: '🛡️',
    sales: '🛍️',
    downloads: '🔽',
    tools: '⚙️',
    stickers: '💝',
    economy: '🪙',
    leveling: '🏆',
    gacha: '🧩',
    games: '🎮',
    anime: '🎬',
    subbots: '🌐',
};

export default {
    name: 'menu',
    aliases: ['m'],
    category: 'core',
    description: 'Muestra el menú principal con categorías.',
    usage: '/menu',
    cooldown: 5,

    async execute(sock, msg, args, { config, prefix }) {
        const botName = config.botName;
        const totalCmds = getPluginCount();
        const categories = getCategories();
        const time = new Date();
        const hours = time.getHours();
        let greeting = '🌙 Buenas noches';
        if (hours >= 6 && hours < 12) greeting = '🌅 Buenos días';
        else if (hours >= 12 && hours < 18) greeting = '🌞 Buenas tardes';

        const pushName = msg.pushName || 'Usuario';

        let text = '';
        text += `┃⏤͟͟͞͞✌️ꦿ ${greeting} ${pushName}\n`;
        text += `╭━━⸻⌔∎\n`;
        text += `┃✎ ᴀᴜᴛᴏᴍᴀᴛɪᴢᴀ, sɪᴍᴘʟɪғɪᴄᴀ, ᴄʀᴇᴄᴇ.\n`;
        text += `┃✦ ➮ sᴏʏ:   ${botName}\n`;
        text += `┃✦ ➮ ᴘʀᴇғɪᴊᴏ:   [ ${prefix} ]\n`;
        text += `┃✦ ➮ ᴄᴏᴍᴀɴᴅᴏs:   ${totalCmds}\n`;
        text += `╰━━━━━─⌔∎\n\n`;

        text += `📂 *Categorías disponibles:*\n\n`;

        for (const cat of categories) {
            const emoji = categoryEmojis[cat] || '📁';
            const count = getPluginsByCategory(cat).length;
            text += `${emoji} *${cat}* (${count} cmds)\n`;
            text += `   ➮ ${prefix}help ${cat}\n\n`;
        }

        text += `────────────────────\n`;
        text += `📌 Usa *${prefix}help <categoría>* para ver\nlos comandos de cada sección.\n\n`;
        text += `💬 Gracias por usar ${botName}`;

        await reply(sock, msg, text);
    },
};
