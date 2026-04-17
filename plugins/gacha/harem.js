import { reply, sendError } from '../../lib/formatter.js';
import { getSenderJid, getMentionedJid, formatNumber } from '../../lib/utils.js';
import db from '../../database/database.js';

const rarityEmojis = {
    common: '⬜', uncommon: '🟩', rare: '🟦', epic: '🟪', legendary: '🟨',
};

export default {
    name: 'harem',
    aliases: ['coleccion', 'mypersonajes'],
    category: 'gacha',
    description: 'Ver tus personajes reclamados.',
    usage: '/harem [@usuario]',
    cooldown: 5,

    async execute(sock, msg, args) {
        const target = getMentionedJid(msg, args) || getSenderJid(msg);

        const chars = db.prepare(
            'SELECT * FROM gacha_collection WHERE user_jid = ? ORDER BY rarity DESC, value DESC'
        ).all(target);

        if (!chars.length) return reply(sock, msg, `@${target.split('@')[0]} no tiene personajes.`);

        const totalValue = chars.reduce((sum, c) => sum + c.value, 0);

        let text = '';
        text += `╭━━⸻⌔∎\n`;
        text += `┃ 🧩 *Harén de @${target.split('@')[0]}*\n`;
        text += `╰━━━━━─⌔∎\n\n`;
        text += `📊 Total: ${chars.length}/50 | 💰 Valor: ${formatNumber(totalValue)}\n\n`;

        chars.forEach((c, i) => {
            const emoji = rarityEmojis[c.rarity] || '⬜';
            const sale = c.for_sale ? ' 🏷️' : '';
            text += `${emoji} ${i + 1}. *${c.character_name}* (${c.rarity})${sale}\n`;
            text += `   💰 ${c.value} | 🆔 ${c.character_id} | ❤️ ${c.votes}\n`;
        });

        await sock.sendMessage(msg.key.remoteJid, {
            text,
            mentions: [target],
        }, { quoted: msg });
    },
};
