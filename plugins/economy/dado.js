import { reply, sendError } from '../../lib/formatter.js';
import { getSenderJid, formatNumber, random } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default {
    name: 'dado',
    aliases: ['dice'],
    category: 'economy',
    description: 'Lanza un dado para ganar o perder.',
    usage: '/dado <apuesta> <número 1-6>',
    cooldown: 5,

    async execute(sock, msg, args, { config }) {
        const senderJid = getSenderJid(msg);
        const eco = Economy.getOrCreate(senderJid);
        const currency = config.economy.currencyName;

        const bet = parseInt(args[0]);
        const guess = parseInt(args[1]);

        if (!bet || !guess) return reply(sock, msg, '📋 Uso: /dado <apuesta> <número 1-6>\nEj: /dado 100 4');
        if (bet <= 0 || bet < 10) return sendError(sock, msg, 'La apuesta mínima es 10.');
        if (bet > eco.wallet) return sendError(sock, msg, `No tienes suficiente. Billetera: ${formatNumber(eco.wallet)} ${currency}`);
        if (guess < 1 || guess > 6) return sendError(sock, msg, 'Elige un número del 1 al 6.');

        const result = random(1, 6);
        const emoji = diceEmojis[result - 1];

        if (result === guess) {
            const winnings = bet * 5;
            const profit = winnings - bet;
            Economy.addWallet(senderJid, profit);

            await reply(sock, msg,
                `🎲 *DADO*\n\n` +
                `${emoji} Salió: *${result}*\n` +
                `🎯 Tu número: *${guess}*\n\n` +
                `🎉 ¡Acertaste! (x5)\n` +
                `💰 +${formatNumber(profit)} ${currency}`
            );
        } else {
            Economy.removeWallet(senderJid, bet);

            await reply(sock, msg,
                `🎲 *DADO*\n\n` +
                `${emoji} Salió: *${result}*\n` +
                `🎯 Tu número: *${guess}*\n\n` +
                `😢 No acertaste.\n` +
                `💸 -${formatNumber(bet)} ${currency}`
            );
        }
    },
};
