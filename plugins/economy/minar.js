import { sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid, formatNumber, random, formatCooldown } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

const minerales = [
    { emoji: '🪨', nombre: 'piedra', valor: [5, 20] },
    { emoji: '⬛', nombre: 'carbón', valor: [20, 50] },
    { emoji: '🔩', nombre: 'hierro', valor: [40, 90] },
    { emoji: '🥈', nombre: 'plata', valor: [60, 130] },
    { emoji: '🥇', nombre: 'oro', valor: [100, 250] },
    { emoji: '💎', nombre: 'diamante', valor: [200, 500] },
    { emoji: '✨', nombre: 'esmeralda', valor: [150, 350] },
    { emoji: '🔮', nombre: 'amatista', valor: [120, 280] },
    { emoji: '❤️', nombre: 'rubí', valor: [180, 400] },
    { emoji: '💀', nombre: 'nada (derrumbe)', valor: [0, 0] },
    { emoji: '🐍', nombre: 'serpiente (mordida)', valor: [-50, -10] },
];

export default {
    name: 'minar',
    aliases: ['mine', 'mineria'],
    category: 'economy',
    description: 'Minar recursos para ganar dinero.',
    usage: '/minar',
    cooldown: 3,

    async execute(sock, msg, args, { config }) {
        const senderJid = getSenderJid(msg);
        const currency = config.economy.currencyName;

        const remaining = Economy.checkCooldown(senderJid, 'last_mine', config.economy.mineCooldown);
        if (remaining > 0) {
            return sendError(sock, msg, `Espera ${formatCooldown(remaining)} para minar de nuevo.`);
        }

        Economy.setCooldown(senderJid, 'last_mine');
        const mineral = minerales[random(0, minerales.length - 1)];
        const reward = random(mineral.valor[0], mineral.valor[1]);

        if (reward > 0) {
            Economy.addWallet(senderJid, reward);
            await sendSuccess(sock, msg,
                `⛏️ *¡Minaste algo!*\n\n` +
                `${mineral.emoji} Encontraste *${mineral.nombre}*\n\n` +
                `💰 +${formatNumber(reward)} ${currency}`
            );
        } else if (reward < 0) {
            Economy.removeWallet(senderJid, Math.abs(reward));
            await sendError(sock, msg,
                `⛏️ *¡Mala suerte!*\n\n` +
                `${mineral.emoji} Te encontraste con *${mineral.nombre}*\n\n` +
                `💸 ${formatNumber(reward)} ${currency}`
            );
        } else {
            await sendError(sock, msg,
                `⛏️ *${mineral.emoji} ${mineral.nombre}*\n\nNo encontraste nada de valor.`
            );
        }
    },
};
