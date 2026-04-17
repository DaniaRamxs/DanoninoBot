import { sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid, formatNumber, random } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

export default {
    name: 'daily',
    aliases: ['diario'],
    category: 'economy',
    description: 'Reclama tu recompensa diaria.',
    usage: '/daily',
    cooldown: 3,

    async execute(sock, msg, args, { config }) {
        const senderJid = getSenderJid(msg);
        const currency = config.economy.currencyName;

        if (!Economy.canClaimDaily(senderJid)) {
            return sendError(sock, msg, 'Ya reclamaste tu recompensa diaria. Vuelve mañana.');
        }

        const reward = random(config.economy.dailyReward.min, config.economy.dailyReward.max);
        Economy.addWallet(senderJid, reward);
        Economy.setDaily(senderJid);

        await sendSuccess(sock, msg,
            `🎁 *Recompensa diaria reclamada!*\n\n` +
            `💰 +${formatNumber(reward)} ${currency}\n` +
            `📊 Billetera: ${formatNumber(Economy.get(senderJid).wallet)} ${currency}`
        );
    },
};
