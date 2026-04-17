import { sendError, sendSuccess } from '../../lib/formatter.js';
import { getMentionedJid } from '../../lib/utils.js';
import db from '../../database/database.js';

export default {
    name: 'mute',
    aliases: ['silenciar', 'mutear'],
    category: 'group',
    description: 'Mutea a un participante.',
    usage: '/mute @usuario',
    cooldown: 5,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const target = getMentionedJid(msg, args);
        if (!target) return sendError(sock, msg, 'Menciona o responde al usuario.');

        const chatJid = msg.key.remoteJid;
        const senderJid = msg.key.participant || msg.key.remoteJid;

        const exists = db.prepare('SELECT 1 FROM muted_users WHERE group_jid = ? AND user_jid = ?').get(chatJid, target);
        if (exists) return sendError(sock, msg, 'Este usuario ya está muteado.');

        db.prepare('INSERT INTO muted_users (group_jid, user_jid, muted_by) VALUES (?, ?, ?)').run(chatJid, target, senderJid);
        await sendSuccess(sock, msg, `@${target.split('@')[0]} ha sido muteado. Sus mensajes serán eliminados.`);
    },
};
