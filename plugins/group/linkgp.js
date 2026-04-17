import { reply, sendError } from '../../lib/formatter.js';

export default {
    name: 'linkgp',
    aliases: ['link', 'enlace'],
    category: 'group',
    description: 'Muestra el enlace de invitación.',
    usage: '/linkgp',
    cooldown: 10,
    groupOnly: true,
    adminOnly: true,
    botAdminRequired: true,

    async execute(sock, msg) {
        try {
            const code = await sock.groupInviteCode(msg.key.remoteJid);
            await reply(sock, msg, `🔗 Enlace del grupo:\n\nhttps://chat.whatsapp.com/${code}`);
        } catch {
            await sendError(sock, msg, 'No se pudo obtener el enlace del grupo.');
        }
    },
};
