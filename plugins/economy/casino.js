import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid, formatNumber, random } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

const slots = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣', '🍀'];

export default {
    name: 'casino',
    aliases: ['slot', 'slots', 'tragamonedas'],
    category: 'economy',
    description: 'Juega en el casino para ganar.',
    usage: '/casino <apuesta>',
    cooldown: 5,

    async execute(sock, msg, args, { config }) {
        const senderJid = getSenderJid(msg);
        const eco = Economy.getOrCreate(senderJid);
        const currency = config.economy.currencyName;

        const bet = parseInt(args[0]);
        if (!bet || bet <= 0) return reply(sock, msg, '📋 Uso: /casino <apuesta>\nEj: /casino 100');
        if (bet > eco.wallet) return sendError(sock, msg, `No tienes suficiente. Billetera: ${formatNumber(eco.wallet)} ${currency}`);
        if (bet < 10) return sendError(sock, msg, 'La apuesta mínima es 10.');

        // Girar tragamonedas
        const s1 = slots[random(0, slots.length - 1)];
        const s2 = slots[random(0, slots.length - 1)];
        const s3 = slots[random(0, slots.length - 1)];

        let multiplier = 0;
        let result = '';

        if (s1 === s2 && s2 === s3) {
            // Triple
            if (s1 === '7️⃣') multiplier = 10;
            else if (s1 === '💎') multiplier = 7;
            else if (s1 === '🍀') multiplier = 5;
            else multiplier = 3;
            result = '🎉 ¡JACKPOT!';
        } else if (s1 === s2 || s2 === s3 || s1 === s3) {
            // Par
            multiplier = 1.5;
            result = '😊 ¡Par!';
        } else {
            multiplier = 0;
            result = '😢 Perdiste...';
        }

        const display = `╔══════════╗\n║ ${s1} │ ${s2} │ ${s3} ║\n╚══════════╝`;

        if (multiplier > 0) {
            const winnings = Math.floor(bet * multiplier);
            const profit = winnings - bet;
            Economy.addWallet(senderJid, profit);

            await reply(sock, msg,
                `🎰 *CASINO*\n\n` +
                `${display}\n\n` +
                `${result} (x${multiplier})\n` +
                `💰 +${formatNumber(profit)} ${currency}`
            );
        } else {
            Economy.removeWallet(senderJid, bet);

            await reply(sock, msg,
                `🎰 *CASINO*\n\n` +
                `${display}\n\n` +
                `${result}\n` +
                `💸 -${formatNumber(bet)} ${currency}`
            );
        }
    },
};
