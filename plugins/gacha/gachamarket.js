import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid, getMentionedJid, formatNumber } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';
import db from '../../database/database.js';

export default {
    name: 'sell',
    aliases: ['delchar', 'wshop', 'buyc', 'givechar', 'giveall', 'trade', 'votar', 'wtop'],
    category: 'gacha',
    description: 'Gestión de personajes: vender, comprar, regalar, intercambiar, votar.',
    usage: '/sell <id> <precio> | /wshop | /buyc <id> | /givechar @user <id> | /votar <id> | /wtop',
    cooldown: 5,

    async execute(sock, msg, args, { command, config }) {
        const senderJid = getSenderJid(msg);
        const currency = config.economy.currencyName;

        switch (command) {
            case 'sell': {
                const charId = parseInt(args[0]);
                const price = parseInt(args[1]);
                if (!charId || !price || price < 10) return sendError(sock, msg, 'Uso: /sell <id_personaje> <precio>\nEj: /sell 5 500');

                const char = db.prepare(
                    'SELECT * FROM gacha_collection WHERE user_jid = ? AND character_id = ?'
                ).get(senderJid, charId);
                if (!char) return sendError(sock, msg, 'No tienes ese personaje.');

                db.prepare(
                    'UPDATE gacha_collection SET for_sale = 1, sale_price = ? WHERE user_jid = ? AND character_id = ?'
                ).run(price, senderJid, charId);
                await sendSuccess(sock, msg, `*${char.character_name}* puesto en venta por *${formatNumber(price)}* ${currency}`);
                break;
            }

            case 'delchar': {
                const charId = parseInt(args[0]);
                if (!charId) return sendError(sock, msg, 'Uso: /delchar <id_personaje>');

                const result = db.prepare(
                    'DELETE FROM gacha_collection WHERE user_jid = ? AND character_id = ?'
                ).run(senderJid, charId);
                if (result.changes === 0) return sendError(sock, msg, 'No tienes ese personaje.');
                await sendSuccess(sock, msg, 'Personaje eliminado de tu colección.');
                break;
            }

            case 'wshop': {
                const shop = db.prepare(
                    'SELECT * FROM gacha_collection WHERE for_sale = 1 ORDER BY sale_price ASC LIMIT 20'
                ).all();
                if (!shop.length) return reply(sock, msg, '🛒 No hay personajes en venta.');

                let text = '╭━━⸻⌔∎\n┃ 🛒 *Tienda de Personajes*\n╰━━━━━─⌔∎\n\n';
                shop.forEach((c, i) => {
                    text += `${i + 1}. *${c.character_name}* (${c.rarity})\n`;
                    text += `   💰 ${formatNumber(c.sale_price)} | Dueño: @${c.user_jid.split('@')[0]}\n`;
                    text += `   /buyc ${c.character_id}\n\n`;
                });

                const mentions = [...new Set(shop.map(c => c.user_jid))];
                await sock.sendMessage(msg.key.remoteJid, { text, mentions }, { quoted: msg });
                break;
            }

            case 'buyc': {
                const charId = parseInt(args[0]);
                if (!charId) return sendError(sock, msg, 'Uso: /buyc <id_personaje>');

                const item = db.prepare(
                    'SELECT * FROM gacha_collection WHERE character_id = ? AND for_sale = 1'
                ).get(charId);
                if (!item) return sendError(sock, msg, 'Ese personaje no está en venta.');
                if (item.user_jid === senderJid) return sendError(sock, msg, 'No puedes comprar tu propio personaje.');

                const eco = Economy.getOrCreate(senderJid);
                if (eco.wallet < item.sale_price) return sendError(sock, msg, `No tienes suficiente. Necesitas ${formatNumber(item.sale_price)} ${currency}`);

                // Transferir
                Economy.removeWallet(senderJid, item.sale_price);
                Economy.addWallet(item.user_jid, item.sale_price);
                db.prepare('UPDATE gacha_collection SET user_jid = ?, for_sale = 0, sale_price = 0 WHERE id = ?')
                    .run(senderJid, item.id);

                await sendSuccess(sock, msg, `Compraste *${item.character_name}* por *${formatNumber(item.sale_price)}* ${currency}!`);
                break;
            }

            case 'givechar': {
                const target = getMentionedJid(msg, args);
                const charId = parseInt(args.find(a => /^\d+$/.test(a)));
                if (!target || !charId) return sendError(sock, msg, 'Uso: /givechar @usuario <id_personaje>');
                if (target === senderJid) return sendError(sock, msg, 'No puedes regalarte a ti mismo.');

                const char = db.prepare(
                    'SELECT * FROM gacha_collection WHERE user_jid = ? AND character_id = ?'
                ).get(senderJid, charId);
                if (!char) return sendError(sock, msg, 'No tienes ese personaje.');

                db.prepare('UPDATE gacha_collection SET user_jid = ?, for_sale = 0 WHERE id = ?')
                    .run(target, char.id);

                await sock.sendMessage(msg.key.remoteJid, {
                    text: `🎁 @${senderJid.split('@')[0]} regaló *${char.character_name}* a @${target.split('@')[0]}!`,
                    mentions: [senderJid, target],
                }, { quoted: msg });
                break;
            }

            case 'giveall': {
                const target = getMentionedJid(msg, args);
                if (!target) return sendError(sock, msg, 'Uso: /giveall @usuario');
                if (target === senderJid) return sendError(sock, msg, 'No puedes regalarte a ti mismo.');

                const result = db.prepare(
                    'UPDATE gacha_collection SET user_jid = ?, for_sale = 0 WHERE user_jid = ?'
                ).run(target, senderJid);
                if (result.changes === 0) return sendError(sock, msg, 'No tienes personajes.');

                await sock.sendMessage(msg.key.remoteJid, {
                    text: `🎁 @${senderJid.split('@')[0]} regaló *${result.changes} personajes* a @${target.split('@')[0]}!`,
                    mentions: [senderJid, target],
                }, { quoted: msg });
                break;
            }

            case 'trade': {
                const target = getMentionedJid(msg, args);
                const ids = args.filter(a => /^\d+$/.test(a)).map(Number);
                if (!target || ids.length < 2) return sendError(sock, msg, 'Uso: /trade @usuario <tu_id> <su_id>');

                const [myCharId, theirCharId] = ids;
                const myChar = db.prepare('SELECT * FROM gacha_collection WHERE user_jid = ? AND character_id = ?').get(senderJid, myCharId);
                const theirChar = db.prepare('SELECT * FROM gacha_collection WHERE user_jid = ? AND character_id = ?').get(target, theirCharId);

                if (!myChar) return sendError(sock, msg, `No tienes el personaje ID ${myCharId}.`);
                if (!theirChar) return sendError(sock, msg, `@${target.split('@')[0]} no tiene el personaje ID ${theirCharId}.`);

                db.prepare('UPDATE gacha_collection SET user_jid = ? WHERE id = ?').run(target, myChar.id);
                db.prepare('UPDATE gacha_collection SET user_jid = ? WHERE id = ?').run(senderJid, theirChar.id);

                await sock.sendMessage(msg.key.remoteJid, {
                    text: `🔄 *Intercambio exitoso!*\n@${senderJid.split('@')[0]}: ${myChar.character_name} → ${theirChar.character_name}\n@${target.split('@')[0]}: ${theirChar.character_name} → ${myChar.character_name}`,
                    mentions: [senderJid, target],
                }, { quoted: msg });
                break;
            }

            case 'votar': {
                const charId = parseInt(args[0]);
                if (!charId) return sendError(sock, msg, 'Uso: /votar <id_personaje>');

                const char = db.prepare('SELECT * FROM gacha_collection WHERE character_id = ? LIMIT 1').get(charId);
                if (!char) return sendError(sock, msg, 'Personaje no encontrado.');

                db.prepare('UPDATE gacha_collection SET votes = votes + 1 WHERE character_id = ?').run(charId);
                await sendSuccess(sock, msg, `Votaste por *${char.character_name}*! ❤️ Votos: ${char.votes + 1}`);
                break;
            }

            case 'wtop': {
                const top = db.prepare(
                    'SELECT character_name, rarity, votes, user_jid FROM gacha_collection ORDER BY votes DESC LIMIT 10'
                ).all();
                if (!top.length) return reply(sock, msg, '📊 No hay personajes con votos.');

                let text = '╭━━⸻⌔∎\n┃ ❤️ *Top Personajes más votados*\n╰━━━━━─⌔∎\n\n';
                const medals = ['🥇', '🥈', '🥉'];
                top.forEach((c, i) => {
                    const medal = medals[i] || `${i + 1}.`;
                    text += `${medal} *${c.character_name}* (${c.rarity})\n`;
                    text += `   ❤️ ${c.votes} votos | Dueño: @${c.user_jid.split('@')[0]}\n\n`;
                });

                const mentions = [...new Set(top.map(c => c.user_jid))];
                await sock.sendMessage(msg.key.remoteJid, { text, mentions }, { quoted: msg });
                break;
            }
        }
    },
};
