import { sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid } from '../../lib/utils.js';
import db from '../../database/database.js';

export default {
    name: 'divorcio',
    aliases: ['divorce'],
    category: 'profile',
    description: 'Divorciarte de tu pareja.',
    usage: '/divorcio',
    cooldown: 10,

    async execute(sock, msg) {
        const senderJid = getSenderJid(msg);

        const marriage = db.prepare(
            'SELECT * FROM marriages WHERE user1_jid = ? OR user2_jid = ?'
        ).get(senderJid, senderJid);

        if (!marriage) return sendError(sock, msg, 'No estás casado/a con nadie.');

        const partner = marriage.user1_jid === senderJid ? marriage.user2_jid : marriage.user1_jid;

        db.prepare('DELETE FROM marriages WHERE id = ?').run(marriage.id);

        let text = '';
        text += `💔 *DIVORCIO*\n\n`;
        text += `@${senderJid.split('@')[0]} se ha divorciado de @${partner.split('@')[0]}.\n\n`;
        text += `😢 A veces las cosas no funcionan...`;

        await sock.sendMessage(msg.key.remoteJid, {
            text,
            mentions: [senderJid, partner],
        }, { quoted: msg });
    },
};
