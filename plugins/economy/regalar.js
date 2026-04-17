import { sendSuccess, sendError } from '../../lib/formatter.js';
import { getMentionedJid, getSenderJid, formatNumber } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

export default {
    name: 'regalar',
    aliases: ['give', 'transferir', 'pay'],
    category: 'economy',
    description: 'Transfiere dinero a otro usuario.',
    usage: '/regalar @usuario <cantidad>',
    cooldown: 5,

    async execute(sock, msg, args, { config }) {
        const senderJid = getSenderJid(msg);
        const target = getMentionedJid(msg, args);
        const currency = config.economy.currencyName;

        if (!target) return sendError(sock, msg, 'Menciona al usuario.\nEj: /regalar @usuario 500');
        if (target === senderJid) return sendError(sock, msg, 'No puedes regalarte a ti mismo.');

        const amount = parseInt(args.find(a => /^\d+$/.test(a)));
        if (!amount || amount <= 0) return sendError(sock, msg, 'Ingresa una cantidad válida.\nEj: /regalar @usuario 500');

        const success = Economy.transfer(senderJid, target, amount);
        if (!success) return sendError(sock, msg, `No tienes suficiente dinero. Necesitas ${formatNumber(amount)} ${currency}`);

        await sock.sendMessage(msg.key.remoteJid, {
            text: `🎁 @${senderJid.split('@')[0]} regaló *${formatNumber(amount)}* ${currency} a @${target.split('@')[0]}`,
            mentions: [senderJid, target],
        }, { quoted: msg });
    },
};
