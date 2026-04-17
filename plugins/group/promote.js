import { sendError, sendSuccess } from '../../lib/formatter.js';
import { getMentionedJid } from '../../lib/utils.js';

export default {
    name: 'promover',
    aliases: ['promote', 'admin'],
    category: 'group',
    description: 'Dar admin a alguien.',
    usage: '/promover @usuario',
    cooldown: 5,
    groupOnly: true,
    adminOnly: true,
    botAdminRequired: true,

    async execute(sock, msg, args) {
        const target = getMentionedJid(msg, args);
        if (!target) return sendError(sock, msg, 'Menciona o responde al usuario.');

        try {
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], 'promote');
            await sendSuccess(sock, msg, `@${target.split('@')[0]} ahora es administrador.`);
        } catch {
            await sendError(sock, msg, 'No se pudo promover al usuario.');
        }
    },
};
