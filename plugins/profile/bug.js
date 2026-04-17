import { sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid } from '../../lib/utils.js';
import settings from '../../config/settings.js';

export default {
    name: 'bug',
    aliases: ['reportar', 'reporte'],
    category: 'profile',
    description: 'Reporta un fallo o error del bot.',
    usage: '/bug <descripción del error>',
    cooldown: 30,

    async execute(sock, msg, args) {
        const text = args.join(' ');
        if (!text) return sendError(sock, msg, 'Describe el error.\nEj: /bug El comando /play no funciona');
        if (text.length < 10) return sendError(sock, msg, 'Sé más descriptivo sobre el error.');

        const senderJid = getSenderJid(msg);
        const senderNum = senderJid.split('@')[0];
        const chatJid = msg.key.remoteJid;
        const isGroup = chatJid.endsWith('@g.us');

        let report = '';
        report += `🐛 *REPORTE DE BUG*\n\n`;
        report += `👤 De: @${senderNum}\n`;
        if (isGroup) report += `👥 Grupo: ${chatJid}\n`;
        report += `\n📋 ${text}`;

        try {
            await sock.sendMessage(settings.ownerJid, {
                text: report,
                mentions: [senderJid],
            });
            await sendSuccess(sock, msg, 'Reporte de bug enviado al creador. ¡Gracias por reportar!');
        } catch {
            await sendError(sock, msg, 'No se pudo enviar el reporte.');
        }
    },
};
