import { reply } from '../../lib/formatter.js';
import { getSenderJid, formatNumber } from '../../lib/utils.js';
import Level from '../../database/models/Level.js';

export default {
    name: 'minivel',
    aliases: ['mylevel', 'nivel'],
    category: 'leveling',
    description: 'Revisa tu nivel y rango actual.',
    usage: '/minivel',
    cooldown: 5,
    groupOnly: true,

    async execute(sock, msg) {
        const senderJid = getSenderJid(msg);
        const chatJid = msg.key.remoteJid;
        const data = Level.getOrCreate(chatJid, senderJid);
        const rank = Level.getRank(data.level);
        const xpNeeded = Level.xpForLevel(data.level + 1);

        // Barra de progreso
        const progress = Math.floor((data.xp / xpNeeded) * 20);
        const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);
        const percent = Math.floor((data.xp / xpNeeded) * 100);

        let text = '';
        text += `╭━━⸻⌔∎\n`;
        text += `┃ 🏆 *Nivel de @${senderJid.split('@')[0]}*\n`;
        text += `╰━━━━━─⌔∎\n\n`;
        text += `🏅 Rango: *${rank}*\n`;
        text += `📊 Nivel: *${data.level}*\n`;
        text += `✨ XP: *${formatNumber(data.xp)}* / ${formatNumber(xpNeeded)}\n`;
        text += `💬 Mensajes: *${formatNumber(data.messages)}*\n\n`;
        text += `${bar} ${percent}%`;

        await sock.sendMessage(chatJid, {
            text,
            mentions: [senderJid],
        }, { quoted: msg });
    },
};
