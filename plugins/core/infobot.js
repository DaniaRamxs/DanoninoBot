import { reply } from '../../lib/formatter.js';
import { getPluginCount } from '../../lib/pluginLoader.js';
import settings from '../../config/settings.js';
import os from 'os';

export default {
    name: 'infobot',
    aliases: ['botinfo', 'info'],
    category: 'core',
    description: 'Muestra información del bot.',
    usage: '/infobot',
    cooldown: 5,

    async execute(sock, msg, args, { config, db }) {
        const totalCmds = getPluginCount();
        const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
        const totalGroups = db.prepare('SELECT COUNT(*) as c FROM groups').get().c;

        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const memUsage = process.memoryUsage();
        const ramUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
        const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

        let text = '';
        text += `╭━━⸻⌔∎\n`;
        text += `┃ 🤖 *${config.botName} Info*\n`;
        text += `╰━━━━━─⌔∎\n\n`;
        text += `✦ *Nombre:* ${config.botName}\n`;
        text += `✦ *Versión:* 1.0.0\n`;
        text += `✦ *Prefijo:* ${config.defaultPrefix}\n`;
        text += `✦ *Comandos:* ${totalCmds}\n`;
        text += `✦ *Usuarios:* ${totalUsers}\n`;
        text += `✦ *Grupos:* ${totalGroups}\n`;
        text += `✦ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n`;
        text += `✦ *RAM:* ${ramUsed} MB\n`;
        text += `✦ *Plataforma:* ${os.platform()}\n`;
        text += `✦ *Node.js:* ${process.version}\n\n`;
        text += `💬 Gracias por usar ${config.botName}`;

        await reply(sock, msg, text);
    },
};
