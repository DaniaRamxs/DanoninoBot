import { sendSuccess, sendError } from '../../lib/formatter.js';
import Group from '../../database/models/Group.js';

export default {
    name: 'leyendafacke',
    aliases: ['leyendafake'],
    category: 'group',
    description: 'Mensaje que se enviará cuando se eliminen número falso/extranjero.',
    usage: '/leyendafacke <texto>',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const text = args.join(' ');
        if (!text) return sendError(sock, msg, 'Escribe el mensaje que se enviará.\nEj: /leyendafacke Solo números de este país.');

        Group.setFakeLegend(msg.key.remoteJid, text);
        await sendSuccess(sock, msg, `Leyenda anti-fake actualizada:\n${text}`);
    },
};
