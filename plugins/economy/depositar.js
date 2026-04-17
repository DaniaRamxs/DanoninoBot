import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid, formatNumber } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

export default {
    name: 'dep',
    aliases: ['depositar', 'deposit'],
    category: 'economy',
    description: 'Deposita dinero en el banco para protegerlo.',
    usage: '/dep <cantidad | todo>',
    cooldown: 3,

    async execute(sock, msg, args, { config }) {
        const senderJid = getSenderJid(msg);
        const eco = Economy.getOrCreate(senderJid);
        const currency = config.economy.currencyName;

        if (eco.wallet <= 0) return sendError(sock, msg, 'No tienes dinero en la billetera.');

        let amount;
        if (args[0] === 'todo' || args[0] === 'all') {
            amount = eco.wallet;
        } else {
            amount = parseInt(args[0]);
            if (!amount || amount <= 0) return reply(sock, msg, `📋 Uso: /dep <cantidad | todo>\nEj: /dep 500`);
            if (amount > eco.wallet) return sendError(sock, msg, `No tienes suficiente. Billetera: ${formatNumber(eco.wallet)} ${currency}`);
        }

        Economy.deposit(senderJid, amount);
        const updated = Economy.get(senderJid);
        await sendSuccess(sock, msg,
            `Depositaste *${formatNumber(amount)}* ${currency} al banco.\n\n` +
            `💰 Billetera: ${formatNumber(updated.wallet)}\n` +
            `🏦 Banco: ${formatNumber(updated.bank)}`
        );
    },
};
