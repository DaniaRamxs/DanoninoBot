import { reply, sendError } from '../../lib/formatter.js';
import { getMentionedJid, formatNumber } from '../../lib/utils.js';
import Level from '../../database/models/Level.js';

export default {
    name: 'vernivel',
    aliases: ['checklevel'],
    category: 'leveling',
    description: 'Consulta el nivel/rango de otro participante.',
    usage: '/vernivel @usuario',
    cooldown: 5,
    groupOnly: true,

    async execute(sock, msg, args) {
        const target = getMentionedJid(msg, args);
        if (!target) return sendError(sock, msg, 'Menciona o responde al usuario.');

        const chatJid = msg.key.remoteJid;
        const data = Level.get(chatJid, target);

        if (!data) {
            return reply(sock, msg, `@${target.split('@')[0]} no tiene datos de nivel en este grupo.`);
        }

        const rank = Level.getRank(data.level);
        const xpNeeded = Level.xpForLevel(data.level + 1);
        const progress = Math.floor((data.xp / xpNeeded) * 20);
        const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);

        let text = '';
        text += `🏆 *Nivel de @${target.split('@')[0]}*\n\n`;
        text += `🏅 Rango: *${rank}*\n`;
        text += `📊 Nivel: *${data.level}*\n`;
        text += `✨ XP: *${formatNumber(data.xp)}* / ${formatNumber(xpNeeded)}\n`;
        text += `💬 Mensajes: *${formatNumber(data.messages)}*\n\n`;
        text += `${bar}`;

        await sock.sendMessage(chatJid, {
            text,
            mentions: [target],
        }, { quoted: msg });
    },
};
