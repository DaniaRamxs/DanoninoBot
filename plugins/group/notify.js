import { sendError } from '../../lib/formatter.js';
import { getGroupParticipants } from '../../lib/permissions.js';

export default {
    name: 'notify',
    aliases: ['hidetag'],
    category: 'group',
    description: 'Mención oculta a los participantes (sin @ visible).',
    usage: '/notify <mensaje>',
    cooldown: 10,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const text = args.join(' ');
        if (!text) return sendError(sock, msg, 'Escribe el mensaje.\nEj: /notify Hola a todos');

        const participants = await getGroupParticipants(sock, msg.key.remoteJid);

        await sock.sendMessage(msg.key.remoteJid, {
            text,
            mentions: participants,
        });
    },
};
