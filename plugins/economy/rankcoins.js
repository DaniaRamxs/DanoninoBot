import { reply } from '../../lib/formatter.js';
import { formatNumber } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

export default {
    name: 'rankcoins',
    aliases: ['ricos', 'richrank', 'topricos'],
    category: 'economy',
    description: 'Ranking global de usuarios más ricos.',
    usage: '/rankcoins',
    cooldown: 10,

    async execute(sock, msg, args, { config }) {
        const currency = config.economy.currencyName;
        const top = Economy.getRichRanking(10);

        if (!top.length) return reply(sock, msg, '📊 Nadie tiene dinero aún.');

        const medals = ['🥇', '🥈', '🥉'];
        let text = '';
        text += `╭━━⸻⌔∎\n`;
        text += `┃ 💰 *Top 10 más ricos*\n`;
        text += `╰━━━━━─⌔∎\n\n`;

        const mentions = [];
        top.forEach((u, i) => {
            const medal = medals[i] || `${i + 1}.`;
            const num = u.user_jid.split('@')[0];
            text += `${medal} @${num}\n`;
            text += `   💰 ${formatNumber(u.wallet)} | 🏦 ${formatNumber(u.bank)} | 📊 ${formatNumber(u.total)} ${currency}\n\n`;
            mentions.push(u.user_jid);
        });

        await sock.sendMessage(msg.key.remoteJid, {
            text,
            mentions,
        }, { quoted: msg });
    },
};
