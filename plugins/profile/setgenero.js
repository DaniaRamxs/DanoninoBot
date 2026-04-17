import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid } from '../../lib/utils.js';
import User from '../../database/models/User.js';

export default {
    name: 'setgenero',
    aliases: ['delgenero'],
    category: 'profile',
    description: 'Establece o elimina tu género.',
    usage: '/setgenero masculino | femenino | otro | /delgenero',
    cooldown: 5,

    async execute(sock, msg, args, { command }) {
        const senderJid = getSenderJid(msg);
        User.getOrCreate(senderJid, msg.pushName || '');

        if (command === 'delgenero') {
            User.deleteGender(senderJid);
            return sendSuccess(sock, msg, 'Género eliminado.');
        }

        const gender = args[0]?.toLowerCase();
        const valid = ['masculino', 'femenino', 'otro'];
        if (!gender || !valid.includes(gender)) {
            return reply(sock, msg, '📋 Uso: /setgenero masculino | femenino | otro');
        }

        User.setGender(senderJid, gender);
        const emoji = gender === 'masculino' ? '♂️' : gender === 'femenino' ? '♀️' : '⚧️';
        await sendSuccess(sock, msg, `Género establecido: ${emoji} ${gender}`);
    },
};
