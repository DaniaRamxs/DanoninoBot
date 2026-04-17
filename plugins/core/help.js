import { reply } from '../../lib/formatter.js';
import { getAllPlugins, getPluginsByCategory, getCategories } from '../../lib/pluginLoader.js';
import settings from '../../config/settings.js';

const categoryNames = {
    core: '📋 ᴘᴇʀғɪʟᴇs',
    owner: '🔱 ᴏᴡɴᴇʀ',
    profile: '📋 ᴘᴇʀғɪʟᴇs',
    group: '🛡️ ᴀᴅᴍɪɴɪsᴛʀᴀᴄɪᴏɴ',
    sales: '🛍️ ᴠᴇɴᴛᴀs ʏ sᴜʙᴀsᴛᴀs',
    downloads: '🔽 ᴅᴇsᴄᴀʀɢᴀs',
    tools: '⚙️ ʜᴇʀʀᴀᴍɪᴇɴᴛᴀs',
    stickers: '💝 ғɪɢᴜs',
    economy: '🪙 ᴇᴄᴏɴᴏᴍɪᴀ',
    leveling: '🏆 ɴɪᴠᴇʟᴇs',
    gacha: '🧩 ɢᴀᴄʜᴀ',
    games: '🎮 ᴊᴜᴇɢᴏs',
    anime: '🎬 ᴀɴɪᴍᴇ ɪɴᴛᴇʀᴀᴄᴄɪᴏɴᴇꜱ',
    subbots: '🌐 sᴜʙ ʙᴏᴛs',
};

const categoryDescriptions = {
    core: 'Información y comandos extra',
    owner: 'Solo para el dueño del bot',
    profile: 'Perfil Información y comandos extra',
    group: 'Configuraciones y seguridad de grupos',
    sales: 'Vende y subasta como un pro',
    downloads: 'Música, videos, imágenes y más',
    tools: 'Herramientas útiles para el día',
    stickers: 'Creo y gestiona stickers',
    economy: 'Gana dinero jugando Juegos',
    leveling: 'Sistema de niveles y rangos',
    gacha: 'Busca, colecciona y comercia personajes',
    games: 'Juegos y diversión',
    anime: 'Reacciones anime con GIF',
    subbots: 'Comandos para ser subbot',
};

export default {
    name: 'help',
    aliases: ['h', 'ayuda', 'comandos'],
    category: 'core',
    description: 'Muestra la lista de comandos.',
    usage: '/help [categoría]',
    cooldown: 5,

    async execute(sock, msg, args, { config, prefix }) {
        const e = config.emojis;

        // Si pasan una categoría específica
        if (args[0]) {
            const cat = args[0].toLowerCase();
            const plugins = getPluginsByCategory(cat);

            if (!plugins.length) {
                await reply(sock, msg, `${e.error} Categoría "${cat}" no encontrada.\nUsa /${prefix === '/' ? '' : ''}help para ver las categorías.`);
                return;
            }

            const name = categoryNames[cat] || cat;
            const desc = categoryDescriptions[cat] || '';
            let text = `➮☆ ${name} ꔷ\n`;
            text += `> ➮ ${desc}\n\n`;

            for (const p of plugins) {
                text += `❑ ${prefix}${p.name}\n`;
                text += `> ${p.description}\n`;
            }

            await reply(sock, msg, text);
            return;
        }

        // Menú completo estilo NaufraBot
        const botName = config.botName;
        const totalCmds = getAllPlugins().length;
        const categories = getCategories();

        let text = '';
        text += `┃⏤͟͟͞͞✌️ꦿ 🌞 ${botName}\n`;
        text += `╭━━⸻⌔∎\n`;
        text += `┃✎ ᴀᴜᴛᴏᴍᴀᴛɪᴢᴀ, sɪᴍᴘʟɪғɪᴄᴀ, ᴄʀᴇᴄᴇ.\n`;
        text += `┃✦ ➮ sᴏʏ:   ${botName}\n`;
        text += `┃✦ ➮ ᴘʀᴇғɪᴊᴏ ᴀᴄᴛᴜᴀʟ:   [ ${prefix} ]\n`;
        text += `┃✦ ➮ ᴄᴏᴍᴀɴᴅᴏs:   ${totalCmds}\n`;
        text += `╰━━━━━─⌔∎\n`;
        text += `────────────────────\n`;
        text += `➮☆ 📂 ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs\n`;
        text += `────────────────────\n\n`;

        for (const cat of categories) {
            const plugins = getPluginsByCategory(cat);
            const name = categoryNames[cat] || cat;
            const desc = categoryDescriptions[cat] || '';

            text += ` ➮☆ ${name} ꔷ\n`;
            text += `> ➮ ${desc}\n\n`;

            for (const p of plugins) {
                text += `❑ ${prefix}${p.name}\n`;
                text += `> ${p.description}\n`;
            }
            text += `\n`;
        }

        text += `────────────────────\n`;
        text += `💬 Gracias por usar ${botName}.`;

        await reply(sock, msg, text);
    },
};
