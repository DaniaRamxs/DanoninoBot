import { sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid, formatNumber, random, formatCooldown } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

const peces = [
    { emoji: '🐟', nombre: 'sardina', valor: [20, 50] },
    { emoji: '🐠', nombre: 'pez payaso', valor: [40, 80] },
    { emoji: '🐡', nombre: 'pez globo', valor: [60, 120] },
    { emoji: '🦈', nombre: 'tiburón', valor: [150, 300] },
    { emoji: '🐙', nombre: 'pulpo', valor: [80, 160] },
    { emoji: '🦐', nombre: 'camarón', valor: [30, 70] },
    { emoji: '🦀', nombre: 'cangrejo', valor: [50, 100] },
    { emoji: '🐋', nombre: 'ballena', valor: [200, 400] },
    { emoji: '🦑', nombre: 'calamar', valor: [70, 140] },
    { emoji: '🐢', nombre: 'tortuga marina', valor: [100, 200] },
    { emoji: '👢', nombre: 'bota vieja', valor: [1, 10] },
    { emoji: '🗑️', nombre: 'basura', valor: [0, 5] },
    { emoji: '💎', nombre: 'cofre del tesoro', valor: [300, 600] },
];

export default {
    name: 'pescar',
    aliases: ['fish', 'pesca'],
    category: 'economy',
    description: 'Usa tu equipo para pescar y ganar dinero.',
    usage: '/pescar',
    cooldown: 3,

    async execute(sock, msg, args, { config }) {
        const senderJid = getSenderJid(msg);
        const currency = config.economy.currencyName;

        const remaining = Economy.checkCooldown(senderJid, 'last_fish', config.economy.fishCooldown);
        if (remaining > 0) {
            return sendError(sock, msg, `Espera ${formatCooldown(remaining)} para pescar de nuevo.`);
        }

        Economy.setCooldown(senderJid, 'last_fish');
        const pez = peces[random(0, peces.length - 1)];
        const reward = random(pez.valor[0], pez.valor[1]);

        Economy.addWallet(senderJid, reward);

        await sendSuccess(sock, msg,
            `🎣 *¡Pescaste algo!*\n\n` +
            `${pez.emoji} Atrapaste un *${pez.nombre}*\n\n` +
            `💰 +${formatNumber(reward)} ${currency}`
        );
    },
};
