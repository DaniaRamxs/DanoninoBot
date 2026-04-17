import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid, formatNumber } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';
import db from '../../database/database.js';
import settings from '../../config/settings.js';

export default {
    name: 'tienda',
    aliases: ['shop', 'store'],
    category: 'economy',
    description: 'Intercambia monedas por experiencia o viceversa.',
    usage: '/tienda | /tienda comprarxp <cantidad> | /tienda venderxp <cantidad>',
    cooldown: 5,

    async execute(sock, msg, args, { config }) {
        const senderJid = getSenderJid(msg);
        const currency = config.economy.currencyName;
        const chatJid = msg.key.remoteJid;
        const isGroup = chatJid.endsWith('@g.us');

        if (!args.length) {
            let text = '';
            text += `╭━━⸻⌔∎\n`;
            text += `┃ 🛒 *Tienda*\n`;
            text += `╰━━━━━─⌔∎\n\n`;
            text += `📦 *Productos disponibles:*\n\n`;
            text += `1️⃣ *Comprar XP* → 100 ${currency} = 50 XP\n`;
            text += `   /tienda comprarxp <cantidad_monedas>\n\n`;
            text += `2️⃣ *Vender XP* → 50 XP = 80 ${currency}\n`;
            text += `   /tienda venderxp <cantidad_xp>\n\n`;
            text += `💡 Ejemplo: /tienda comprarxp 500`;
            return reply(sock, msg, text);
        }

        const action = args[0]?.toLowerCase();
        const amount = parseInt(args[1]);

        if (!amount || amount <= 0) return sendError(sock, msg, 'Ingresa una cantidad válida.');

        if (action === 'comprarxp') {
            if (!isGroup) return sendError(sock, msg, 'Este comando solo funciona en grupos (XP es por grupo).');

            const eco = Economy.getOrCreate(senderJid);
            if (eco.wallet < amount) return sendError(sock, msg, `No tienes suficiente. Billetera: ${formatNumber(eco.wallet)} ${currency}`);

            const xpGained = Math.floor(amount * 0.5); // 100 coins = 50 XP
            Economy.removeWallet(senderJid, amount);

            // Agregar XP
            db.prepare(`
                INSERT INTO levels (group_jid, user_jid, xp, messages)
                VALUES (?, ?, ?, 0)
                ON CONFLICT(group_jid, user_jid)
                DO UPDATE SET xp = xp + ?
            `).run(chatJid, senderJid, xpGained, xpGained);

            await sendSuccess(sock, msg,
                `🛒 Compraste *${formatNumber(xpGained)} XP* por *${formatNumber(amount)}* ${currency}`
            );
        } else if (action === 'venderxp') {
            if (!isGroup) return sendError(sock, msg, 'Este comando solo funciona en grupos.');

            const levelData = db.prepare(
                'SELECT xp FROM levels WHERE group_jid = ? AND user_jid = ?'
            ).get(chatJid, senderJid);

            if (!levelData || levelData.xp < amount) {
                return sendError(sock, msg, `No tienes suficiente XP. Tienes: ${formatNumber(levelData?.xp || 0)} XP`);
            }

            const coinsGained = Math.floor(amount * 1.6); // 50 XP = 80 coins
            db.prepare('UPDATE levels SET xp = xp - ? WHERE group_jid = ? AND user_jid = ?')
                .run(amount, chatJid, senderJid);
            Economy.addWallet(senderJid, coinsGained);

            await sendSuccess(sock, msg,
                `🛒 Vendiste *${formatNumber(amount)} XP* por *${formatNumber(coinsGained)}* ${currency}`
            );
        } else {
            return reply(sock, msg, '📋 Opciones: /tienda comprarxp <cantidad> | /tienda venderxp <cantidad>');
        }
    },
};
