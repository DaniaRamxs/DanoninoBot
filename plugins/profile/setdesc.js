import { sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid } from '../../lib/utils.js';
import User from '../../database/models/User.js';

export default {
    name: 'setdesc',
    aliases: ['deldesc'],
    category: 'profile',
    description: 'Establece o elimina tu descripción.',
    usage: '/setdesc <texto> | /deldesc',
    cooldown: 5,

    async execute(sock, msg, args, { command }) {
        const senderJid = getSenderJid(msg);
        User.getOrCreate(senderJid, msg.pushName || '');

        if (command === 'deldesc') {
            User.deleteDescription(senderJid);
            return sendSuccess(sock, msg, 'Descripción eliminada.');
        }

        const text = args.join(' ');
        if (!text) return sendError(sock, msg, 'Escribe tu descripción.\nEj: /setdesc Me encanta el anime');
        if (text.length > 200) return sendError(sock, msg, 'Máximo 200 caracteres.');

        User.setDescription(senderJid, text);
        await sendSuccess(sock, msg, `Descripción actualizada:\n${text}`);
    },
};
