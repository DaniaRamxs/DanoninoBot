import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import { getMentionedJid, getSenderJid } from '../../lib/utils.js';
import db from '../../database/database.js';

export default {
    name: 'casarse',
    aliases: ['marry', 'matrimonio'],
    category: 'profile',
    description: 'Casarte con alguien.',
    usage: '/casarse @usuario',
    cooldown: 10,

    async execute(sock, msg, args) {
        const senderJid = getSenderJid(msg);
        const target = getMentionedJid(msg, args);

        if (!target) return sendError(sock, msg, 'Menciona o responde a la persona con quien te quieres casar.');
        if (target === senderJid) return sendError(sock, msg, 'No puedes casarte contigo mismo.');

        // Verificar si ya están casados
        const senderMarriage = db.prepare(
            'SELECT * FROM marriages WHERE user1_jid = ? OR user2_jid = ?'
        ).get(senderJid, senderJid);

        if (senderMarriage) {
            const partner = senderMarriage.user1_jid === senderJid ? senderMarriage.user2_jid : senderMarriage.user1_jid;
            return sendError(sock, msg, `Ya estás casado/a con @${partner.split('@')[0]}.\nUsa /divorcio para divorciarte primero.`);
        }

        const targetMarriage = db.prepare(
            'SELECT * FROM marriages WHERE user1_jid = ? OR user2_jid = ?'
        ).get(target, target);

        if (targetMarriage) {
            return sendError(sock, msg, `@${target.split('@')[0]} ya está casado/a con otra persona.`);
        }

        // Crear matrimonio
        try {
            db.prepare(
                'INSERT INTO marriages (user1_jid, user2_jid) VALUES (?, ?)'
            ).run(senderJid, target);

            const senderNum = senderJid.split('@')[0];
            const targetNum = target.split('@')[0];

            let text = '';
            text += `💍✨ *¡MATRIMONIO!* ✨💍\n\n`;
            text += `@${senderNum} y @${targetNum}\n`;
            text += `se han casado! 💕\n\n`;
            text += `🎉 ¡Felicidades a la pareja!\n`;
            text += `💐 Que sean muy felices juntos.`;

            await sock.sendMessage(msg.key.remoteJid, {
                text,
                mentions: [senderJid, target],
            }, { quoted: msg });
        } catch (err) {
            await sendError(sock, msg, 'Error al registrar el matrimonio.');
        }
    },
};
