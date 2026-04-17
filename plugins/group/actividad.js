import { reply, sendError } from '../../lib/formatter.js';
import { getMentionedJid, formatNumber } from '../../lib/utils.js';
import { getGroupParticipants } from '../../lib/permissions.js';
import db from '../../database/database.js';

export default {
    name: 'contadormensajes',
    aliases: ['veractividad', 'rankactivos', 'verfantasmas', 'kickfantasmas', 'reiniciarcontador'],
    category: 'group',
    description: 'Contador de mensajes y actividad del grupo.',
    usage: '/contadormensajes | /veractividad | /rankactivos | /verfantasmas | /kickfantasmas | /reiniciarcontador',
    cooldown: 5,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args, { command }) {
        const chatJid = msg.key.remoteJid;

        switch (command) {
            case 'contadormensajes': {
                const total = db.prepare(
                    'SELECT COALESCE(SUM(message_count), 0) as total FROM group_activity WHERE group_jid = ?'
                ).get(chatJid).total;
                await reply(sock, msg, `📊 Total de mensajes en el grupo: *${formatNumber(total)}*`);
                break;
            }

            case 'veractividad': {
                const target = getMentionedJid(msg, args);
                const userJid = target || (msg.key.participant || msg.key.remoteJid);

                const data = db.prepare(
                    'SELECT message_count, last_active FROM group_activity WHERE group_jid = ? AND user_jid = ?'
                ).get(chatJid, userJid);

                if (!data) return reply(sock, msg, `📊 @${userJid.split('@')[0]} no tiene mensajes registrados.`);
                await reply(sock, msg,
                    `📊 *Actividad de @${userJid.split('@')[0]}*\n\n` +
                    `✦ Mensajes: ${formatNumber(data.message_count)}\n` +
                    `✦ Última actividad: ${data.last_active}`
                );
                break;
            }

            case 'rankactivos': {
                const top = db.prepare(
                    'SELECT user_jid, message_count FROM group_activity WHERE group_jid = ? ORDER BY message_count DESC LIMIT 10'
                ).all(chatJid);

                if (!top.length) return reply(sock, msg, '📊 No hay datos de actividad aún.');

                let text = '🏆 *Top 10 más activos*\n\n';
                const medals = ['🥇', '🥈', '🥉'];
                top.forEach((u, i) => {
                    const medal = medals[i] || `${i + 1}.`;
                    text += `${medal} @${u.user_jid.split('@')[0]} → ${formatNumber(u.message_count)} msgs\n`;
                });

                await sock.sendMessage(chatJid, {
                    text,
                    mentions: top.map(u => u.user_jid),
                }, { quoted: msg });
                break;
            }

            case 'verfantasmas': {
                const participants = await getGroupParticipants(sock, chatJid);
                const active = db.prepare(
                    'SELECT user_jid FROM group_activity WHERE group_jid = ? AND message_count > 0'
                ).all(chatJid).map(r => r.user_jid);

                const ghosts = participants.filter(p => !active.includes(p));

                if (!ghosts.length) return reply(sock, msg, '👻 No hay fantasmas en el grupo.');

                let text = `👻 *Fantasmas del grupo: ${ghosts.length}*\n\n`;
                ghosts.forEach((g, i) => {
                    text += `${i + 1}. @${g.split('@')[0]}\n`;
                });

                await sock.sendMessage(chatJid, {
                    text,
                    mentions: ghosts,
                }, { quoted: msg });
                break;
            }

            case 'kickfantasmas': {
                const participants = await getGroupParticipants(sock, chatJid);
                const active = db.prepare(
                    'SELECT user_jid FROM group_activity WHERE group_jid = ? AND message_count > 0'
                ).all(chatJid).map(r => r.user_jid);

                const ghosts = participants.filter(p => !active.includes(p));
                // No expulsar admins ni al bot
                const metadata = await sock.groupMetadata(chatJid);
                const admins = metadata.participants
                    .filter(p => p.admin)
                    .map(p => p.id);
                const botJid = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';

                const toKick = ghosts.filter(g => !admins.includes(g) && g !== botJid);

                if (!toKick.length) return reply(sock, msg, '👻 No hay fantasmas para expulsar (o son admins).');

                let kicked = 0;
                for (const g of toKick) {
                    try {
                        await sock.groupParticipantsUpdate(chatJid, [g], 'remove');
                        kicked++;
                    } catch {}
                }

                await reply(sock, msg, `👻 Se expulsaron *${kicked}* fantasmas del grupo.`);
                break;
            }

            case 'reiniciarcontador': {
                db.prepare('DELETE FROM group_activity WHERE group_jid = ?').run(chatJid);
                await reply(sock, msg, '📊 Contador de mensajes reiniciado.');
                break;
            }
        }
    },
};
