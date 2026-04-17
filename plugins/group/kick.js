import { reply, sendError, sendSuccess } from '../../lib/formatter.js';
import { getMentionedJid, getSenderJid, isOwner } from '../../lib/utils.js';

export default {
    name: 'kick',
    aliases: ['ban', 'expulsar'],
    category: 'group',
    description: 'Elimina participante del grupo.',
    usage: '/kick @usuario',
    cooldown: 5,
    groupOnly: true,
    adminOnly: true,
    botAdminRequired: true,

    async execute(sock, msg, args, { config }) {
        const target = getMentionedJid(msg, args);
        if (!target) return sendError(sock, msg, 'Menciona o responde al usuario que quieres expulsar.');

        const chatJid = msg.key.remoteJid;
        const senderJid = getSenderJid(msg);

        if (target === sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net') {
            return sendError(sock, msg, 'No puedo expulsarme a mí mismo.');
        }
        if (target === senderJid) {
            return sendError(sock, msg, 'No puedes expulsarte a ti mismo.');
        }
        if (isOwner(target)) {
            return sendError(sock, msg, 'No puedo expulsar al dueño del bot.');
        }

        try {
            await sock.groupParticipantsUpdate(chatJid, [target], 'remove');
            await sendSuccess(sock, msg, `@${target.split('@')[0]} ha sido expulsado.`);
        } catch (err) {
            await sendError(sock, msg, 'No se pudo expulsar al usuario. Verifica que el bot sea admin.');
        }
    },
};
