import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid } from '../../lib/utils.js';
import User from '../../database/models/User.js';

export default {
    name: 'setcumple',
    aliases: ['delcumple'],
    category: 'profile',
    description: 'Establece o elimina tu cumpleaños.',
    usage: '/setcumple DD/MM/AAAA | /delcumple',
    cooldown: 5,

    async execute(sock, msg, args, { command }) {
        const senderJid = getSenderJid(msg);
        User.getOrCreate(senderJid, msg.pushName || '');

        if (command === 'delcumple') {
            User.deleteBirthday(senderJid);
            return sendSuccess(sock, msg, 'Fecha de cumpleaños eliminada.');
        }

        const dateStr = args[0];
        if (!dateStr) return reply(sock, msg, '📋 Uso: /setcumple DD/MM/AAAA\nEj: /setcumple 15/03/2000');

        // Validar formato
        const match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (!match) return sendError(sock, msg, 'Formato inválido. Usa DD/MM/AAAA\nEj: /setcumple 15/03/2000');

        const [, day, month, year] = match;
        const d = parseInt(day), m = parseInt(month), y = parseInt(year);

        if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1950 || y > 2015) {
            return sendError(sock, msg, 'Fecha inválida. Verifica día, mes y año.');
        }

        const formatted = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        User.setBirthday(senderJid, formatted);

        // Calcular edad
        const now = new Date();
        let age = now.getFullYear() - y;
        if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;

        await sendSuccess(sock, msg, `🎂 Cumpleaños establecido: ${formatted}\n📅 Edad: ${age} años`);
    },
};
