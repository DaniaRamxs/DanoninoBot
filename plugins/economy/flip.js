import { reply, sendError } from '../../lib/formatter.js';
import { getSenderJid, formatNumber } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

export default {
    name: 'flip',
    aliases: ['coinflip', 'moneda', 'cara', 'cruz'],
    category: 'economy',
    description: 'Lanza moneda.',
    usage: '/flip <apuesta> <cara | cruz>',
    cooldown: 5,

    async execute(sock, msg, args, { config, command }) {
        const senderJid = getSenderJid(msg);
        const eco = Economy.getOrCreate(senderJid);
        const currency = config.economy.currencyName;

        const bet = parseInt(args[0]);
        let choice = args[1]?.toLowerCase();

        // Si usaron alias directamente
        if (command === 'cara') choice = 'cara';
        if (command === 'cruz') choice = 'cruz';

        if (!bet) return reply(sock, msg, '📋 Uso: /flip <apuesta> <cara | cruz>\nEj: /flip 100 cara');
        if (bet <= 0 || bet < 10) return sendError(sock, msg, 'La apuesta mínima es 10.');
        if (bet > eco.wallet) return sendError(sock, msg, `No tienes suficiente. Billetera: ${formatNumber(eco.wallet)} ${currency}`);
        if (!choice || !['cara', 'cruz', 'heads', 'tails'].includes(choice)) {
            return sendError(sock, msg, 'Elige: cara o cruz.');
        }

        const isCara = ['cara', 'heads'].includes(choice);
        const result = Math.random() > 0.5; // true = cara, false = cruz
        const resultText = result ? 'cara' : 'cruz';
        const resultEmoji = result ? '🪙 Cara' : '🪙 Cruz';
        const won = (isCara && result) || (!isCara && !result);

        if (won) {
            Economy.addWallet(senderJid, bet);
            await reply(sock, msg,
                `🪙 *COIN FLIP*\n\n` +
                `${resultEmoji}\n\n` +
                `Tu elección: *${choice}*\n` +
                `🎉 ¡Ganaste!\n` +
                `💰 +${formatNumber(bet)} ${currency}`
            );
        } else {
            Economy.removeWallet(senderJid, bet);
            await reply(sock, msg,
                `🪙 *COIN FLIP*\n\n` +
                `${resultEmoji}\n\n` +
                `Tu elección: *${choice}*\n` +
                `😢 Perdiste.\n` +
                `💸 -${formatNumber(bet)} ${currency}`
            );
        }
    },
};
