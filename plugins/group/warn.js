import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import { getMentionedJid, getSenderJid, isOwner } from '../../lib/utils.js';
import db from '../../database/database.js';
import settings from '../../config/settings.js';

export default {
    name: 'warn',
    aliases: ['advertir', 'unwarn', 'warnings', 'resetwarn'],
    category: 'group',
    description: 'Gestiona advertencias de usuarios.',
    usage: '/warn @usuario [razón] | /unwarn @usuario | /warnings @usuario | /resetwarn @usuario',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args, { command }) {
        const chatJid = msg.key.remoteJid;
        const senderJid = getSenderJid(msg);

        switch (command) {
            case 'warn':
            case 'advertir': {
                const target = getMentionedJid(msg, args);
                if (!target) return sendError(sock, msg, 'Menciona o responde al usuario.');
                if (isOwner(target)) return sendError(sock, msg, 'No puedes advertir al dueño.');

                const reason = args.slice(1).join(' ') || 'Sin razón especificada';

                db.prepare(
                    'INSERT INTO warnings (group_jid, user_jid, reason, warned_by) VALUES (?, ?, ?, ?)'
                ).run(chatJid, target, reason, senderJid);

                const count = db.prepare(
                    'SELECT COUNT(*) as total FROM warnings WHERE group_jid = ? AND user_jid = ?'
                ).get(chatJid, target).total;

                let text = `⚠️ *Advertencia para @${target.split('@')[0]}*\n\n`;
                text += `📋 Razón: ${reason}\n`;
                text += `📊 Advertencias: ${count}/${settings.maxWarnings}`;

                if (count >= settings.maxWarnings) {
                    text += `\n\n🚫 Máximo alcanzado. Expulsando...`;
                    try {
                        await sock.groupParticipantsUpdate(chatJid, [target], 'remove');
                    } catch {}
                    db.prepare('DELETE FROM warnings WHERE group_jid = ? AND user_jid = ?').run(chatJid, target);
                }

                await sock.sendMessage(chatJid, { text, mentions: [target] }, { quoted: msg });
                break;
            }

            case 'unwarn': {
                const target = getMentionedJid(msg, args);
                if (!target) return sendError(sock, msg, 'Menciona o responde al usuario.');

                const last = db.prepare(
                    'SELECT id FROM warnings WHERE group_jid = ? AND user_jid = ? ORDER BY id DESC LIMIT 1'
                ).get(chatJid, target);

                if (!last) return sendError(sock, msg, 'Este usuario no tiene advertencias.');

                db.prepare('DELETE FROM warnings WHERE id = ?').run(last.id);

                const remaining = db.prepare(
                    'SELECT COUNT(*) as total FROM warnings WHERE group_jid = ? AND user_jid = ?'
                ).get(chatJid, target).total;

                await sendSuccess(sock, msg, `Se removió 1 advertencia de @${target.split('@')[0]}.\nAdvertencias restantes: ${remaining}/${settings.maxWarnings}`);
                break;
            }

            case 'warnings': {
                const target = getMentionedJid(msg, args);
                if (!target) return sendError(sock, msg, 'Menciona o responde al usuario.');

                const warns = db.prepare(
                    'SELECT reason, warned_at FROM warnings WHERE group_jid = ? AND user_jid = ? ORDER BY warned_at DESC'
                ).all(chatJid, target);

                if (!warns.length) return reply(sock, msg, `@${target.split('@')[0]} no tiene advertencias.`);

                let text = `⚠️ *Advertencias de @${target.split('@')[0]}*\n`;
                text += `📊 Total: ${warns.length}/${settings.maxWarnings}\n\n`;
                warns.forEach((w, i) => {
                    text += `${i + 1}. ${w.reason}\n   📅 ${w.warned_at}\n`;
                });

                await sock.sendMessage(chatJid, { text, mentions: [target] }, { quoted: msg });
                break;
            }

            case 'resetwarn': {
                const target = getMentionedJid(msg, args);
                if (!target) return sendError(sock, msg, 'Menciona o responde al usuario.');

                db.prepare('DELETE FROM warnings WHERE group_jid = ? AND user_jid = ?').run(chatJid, target);
                await sendSuccess(sock, msg, `Se eliminaron todas las advertencias de @${target.split('@')[0]}.`);
                break;
            }
        }
    },
};
