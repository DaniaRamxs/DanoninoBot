import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid, formatNumber } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

export default {
    name: 'ret',
    aliases: ['retirar', 'withdraw'],
    category: 'economy',
    description: 'Retira dinero del banco para gastar.',
    usage: '/ret <cantidad | todo>',
    cooldown: 3,

    async execute(sock, msg, args, { config }) {
        const senderJid = getSenderJid(msg);
        const eco = Economy.getOrCreate(senderJid);
        const currency = config.economy.currencyName;

        if (eco.bank <= 0) return sendError(sock, msg, 'No tienes dinero en el banco.');

        let amount;
        if (args[0] === 'todo' || args[0] === 'all') {
            amount = eco.bank;
        } else {
            amount = parseInt(args[0]);
            if (!amount || amount <= 0) return reply(sock, msg, `📋 Uso: /ret <cantidad | todo>\nEj: /ret 500`);
            if (amount > eco.bank) return sendError(sock, msg, `No tienes suficiente. Banco: ${formatNumber(eco.bank)} ${currency}`);
        }

        Economy.withdraw(senderJid, amount);
        const updated = Economy.get(senderJid);
        await sendSuccess(sock, msg,
            `Retiraste *${formatNumber(amount)}* ${currency} del banco.\n\n` +
            `💰 Billetera: ${formatNumber(updated.wallet)}\n` +
            `🏦 Banco: ${formatNumber(updated.bank)}`
        );
    },
};
