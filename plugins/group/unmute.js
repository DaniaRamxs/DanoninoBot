import { sendError, sendSuccess } from '../../lib/formatter.js';
import { getMentionedJid } from '../../lib/utils.js';
import db from '../../database/database.js';

export default {
    name: 'desmute',
    aliases: ['unmute', 'dessilenciar'],
    category: 'group',
    description: 'Quita mute.',
    usage: '/desmute @usuario',
    cooldown: 5,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const target = getMentionedJid(msg, args);
        if (!target) return sendError(sock, msg, 'Menciona o responde al usuario.');

        const chatJid = msg.key.remoteJid;
        const result = db.prepare('DELETE FROM muted_users WHERE group_jid = ? AND user_jid = ?').run(chatJid, target);

        if (result.changes === 0) return sendError(sock, msg, 'Este usuario no está muteado.');
        await sendSuccess(sock, msg, `@${target.split('@')[0]} ha sido desmuteado.`);
    },
};
