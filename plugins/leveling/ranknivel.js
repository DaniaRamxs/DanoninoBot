import { reply } from '../../lib/formatter.js';
import { formatNumber } from '../../lib/utils.js';
import Level from '../../database/models/Level.js';

export default {
    name: 'ranknivel',
    aliases: ['toplevel', 'xprank', 'leaderboard'],
    category: 'leveling',
    description: 'Lista de usuarios con niveles más altos del grupo.',
    usage: '/ranknivel',
    cooldown: 10,
    groupOnly: true,

    async execute(sock, msg) {
        const chatJid = msg.key.remoteJid;
        const top = Level.getGroupRanking(chatJid, 10);

        if (!top.length) return reply(sock, msg, '📊 No hay datos de niveles en este grupo.\nActiva con /leveling 1');

        const medals = ['🥇', '🥈', '🥉'];
        const mentions = [];

        let text = '';
        text += `╭━━⸻⌔∎\n`;
        text += `┃ 🏆 *Top 10 Niveles*\n`;
        text += `╰━━━━━─⌔∎\n\n`;

        top.forEach((u, i) => {
            const medal = medals[i] || `${i + 1}.`;
            const num = u.user_jid.split('@')[0];
            const rank = Level.getRank(u.level);
            text += `${medal} @${num}\n`;
            text += `   Lvl ${u.level} | ${formatNumber(u.xp)} XP | ${rank}\n\n`;
            mentions.push(u.user_jid);
        });

        await sock.sendMessage(chatJid, {
            text,
            mentions,
        }, { quoted: msg });
    },
};
