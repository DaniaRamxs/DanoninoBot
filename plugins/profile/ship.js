import { reply, sendError } from '../../lib/formatter.js';
import { getSenderJid } from '../../lib/utils.js';

export default {
    name: 'ship',
    aliases: ['love', 'amor'],
    category: 'profile',
    description: 'Calcula porcentaje de amor entre dos personas.',
    usage: '/ship @usuario1 @usuario2',
    cooldown: 5,

    async execute(sock, msg, args) {
        const chatJid = msg.key.remoteJid;
        const senderJid = getSenderJid(msg);
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        let user1, user2;

        if (mentioned.length >= 2) {
            user1 = mentioned[0];
            user2 = mentioned[1];
        } else if (mentioned.length === 1) {
            user1 = senderJid;
            user2 = mentioned[0];
        } else {
            // Si responde a alguien
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
            if (quoted) {
                user1 = senderJid;
                user2 = quoted;
            } else {
                return sendError(sock, msg, 'Menciona a dos personas o responde a alguien.\nEj: /ship @persona1 @persona2');
            }
        }

        if (user1 === user2) return reply(sock, msg, '💕 Uno no puede shippear consigo mismo... ¿o sí? 🤔');

        // Generar porcentaje determinístico basado en los JIDs
        const combined = [user1, user2].sort().join('');
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            hash = ((hash << 5) - hash) + combined.charCodeAt(i);
            hash = hash & hash;
        }
        const percentage = Math.abs(hash) % 101;

        // Barra visual
        const filled = Math.round(percentage / 10);
        const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

        // Mensaje según porcentaje
        let message;
        if (percentage >= 90) message = '💕 ¡Almas gemelas! Nacieron el uno para el otro.';
        else if (percentage >= 70) message = '💗 ¡Gran compatibilidad! Hacen una hermosa pareja.';
        else if (percentage >= 50) message = '💛 ¡Buena conexión! Hay potencial.';
        else if (percentage >= 30) message = '🤔 Algo hay... pero les falta química.';
        else if (percentage >= 10) message = '😬 Mmm... mejor como amigos.';
        else message = '💀 No. Simplemente no.';

        const num1 = user1.split('@')[0];
        const num2 = user2.split('@')[0];

        let text = '';
        text += `💘 *SHIP* 💘\n\n`;
        text += `@${num1} ❤️ @${num2}\n\n`;
        text += `${bar} *${percentage}%*\n\n`;
        text += message;

        await sock.sendMessage(chatJid, {
            text,
            mentions: [user1, user2],
        }, { quoted: msg });
    },
};
