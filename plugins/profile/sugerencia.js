import { sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid } from '../../lib/utils.js';
import settings from '../../config/settings.js';

export default {
    name: 'sugerencia',
    aliases: ['suggest'],
    category: 'profile',
    description: 'Envía una sugerencia al creador.',
    usage: '/sugerencia <texto>',
    cooldown: 30,

    async execute(sock, msg, args) {
        const text = args.join(' ');
        if (!text) return sendError(sock, msg, 'Escribe tu sugerencia.\nEj: /sugerencia Agregar comando de clima');
        if (text.length < 10) return sendError(sock, msg, 'La sugerencia es muy corta. Sé más descriptivo.');

        const senderJid = getSenderJid(msg);
        const senderNum = senderJid.split('@')[0];
        const chatJid = msg.key.remoteJid;
        const isGroup = chatJid.endsWith('@g.us');

        let report = '';
        report += `📬 *SUGERENCIA*\n\n`;
        report += `👤 De: @${senderNum}\n`;
        if (isGroup) report += `👥 Grupo: ${chatJid}\n`;
        report += `\n💬 ${text}`;

        try {
            await sock.sendMessage(settings.ownerJid, {
                text: report,
                mentions: [senderJid],
            });
            await sendSuccess(sock, msg, 'Sugerencia enviada al creador. ¡Gracias por tu aporte!');
        } catch {
            await sendError(sock, msg, 'No se pudo enviar la sugerencia.');
        }
    },
};
