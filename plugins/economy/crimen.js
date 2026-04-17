import { sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid, formatNumber, random, formatCooldown } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

const crimenes = {
    exito: [
        { emoji: '🏦', text: 'Robaste un banco sin que nadie se diera cuenta' },
        { emoji: '💎', text: 'Te infiltraste en una joyería y escapaste con diamantes' },
        { emoji: '🎰', text: 'Hackeaste un cajero automático' },
        { emoji: '🚗', text: 'Robaste un auto de lujo y lo vendiste' },
        { emoji: '📱', text: 'Vendiste celulares clonados' },
        { emoji: '🎨', text: 'Falsificaste una obra de arte y la vendiste' },
        { emoji: '💻', text: 'Hackeaste una base de datos y vendiste la info' },
        { emoji: '🃏', text: 'Hiciste trampa en un torneo de poker' },
    ],
    fallo: [
        { emoji: '🚔', text: 'La policía te atrapó in fraganti' },
        { emoji: '👮', text: 'Un guardia de seguridad te descubrió' },
        { emoji: '📹', text: 'Las cámaras te grabaron todo' },
        { emoji: '🐕', text: 'Un perro policía te encontró' },
        { emoji: '🚨', text: 'Activaste la alarma y tuviste que huir' },
        { emoji: '😰', text: 'Te dio pánico y confesaste todo' },
    ],
};

export default {
    name: 'crimen',
    aliases: ['crime'],
    category: 'economy',
    description: 'Intenta un crimen para ganar dinero (riesgo/recompensa).',
    usage: '/crimen',
    cooldown: 3,

    async execute(sock, msg, args, { config }) {
        const senderJid = getSenderJid(msg);
        const currency = config.economy.currencyName;

        const remaining = Economy.checkCooldown(senderJid, 'last_crime', config.economy.crimeCooldown);
        if (remaining > 0) {
            return sendError(sock, msg, `Debes esperar ${formatCooldown(remaining)} para cometer otro crimen.`);
        }

        Economy.setCooldown(senderJid, 'last_crime');
        const success = Math.random() > 0.4; // 60% de éxito

        if (success) {
            const reward = random(config.economy.crimeReward.min, config.economy.crimeReward.max);
            const crime = crimenes.exito[random(0, crimenes.exito.length - 1)];
            Economy.addWallet(senderJid, reward);

            await sendSuccess(sock, msg,
                `${crime.emoji} *¡Crimen exitoso!*\n\n` +
                `${crime.text}.\n\n` +
                `💰 +${formatNumber(reward)} ${currency}`
            );
        } else {
            const fine = random(config.economy.crimeFail.min, config.economy.crimeFail.max);
            const crime = crimenes.fallo[random(0, crimenes.fallo.length - 1)];
            Economy.removeWallet(senderJid, fine);

            await sendError(sock, msg,
                `${crime.emoji} *¡Te atraparon!*\n\n` +
                `${crime.text}.\n\n` +
                `💸 -${formatNumber(fine)} ${currency} de multa`
            );
        }
    },
};
