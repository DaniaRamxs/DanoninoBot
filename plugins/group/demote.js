import { sendError, sendSuccess } from '../../lib/formatter.js';
import { getMentionedJid } from '../../lib/utils.js';

export default {
    name: 'degradar',
    aliases: ['demote', 'quitar'],
    category: 'group',
    description: 'Quitar admin.',
    usage: '/degradar @usuario',
    cooldown: 5,
    groupOnly: true,
    adminOnly: true,
    botAdminRequired: true,

    async execute(sock, msg, args) {
        const target = getMentionedJid(msg, args);
        if (!target) return sendError(sock, msg, 'Menciona o responde al usuario.');

        try {
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], 'demote');
            await sendSuccess(sock, msg, `@${target.split('@')[0]} ya no es administrador.`);
        } catch {
            await sendError(sock, msg, 'No se pudo degradar al usuario.');
        }
    },
};
