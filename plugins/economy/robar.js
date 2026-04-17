import { sendSuccess, sendError } from '../../lib/formatter.js';
import { getMentionedJid, getSenderJid, formatNumber, random, formatCooldown } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

export default {
    name: 'robar',
    aliases: ['rob', 'steal'],
    category: 'economy',
    description: 'Intenta robar a otro usuario.',
    usage: '/robar @usuario',
    cooldown: 5,

    async execute(sock, msg, args, { config }) {
        const senderJid = getSenderJid(msg);
        const target = getMentionedJid(msg, args);
        const currency = config.economy.currencyName;

        if (!target) return sendError(sock, msg, 'Menciona al usuario que quieres robar.');
        if (target === senderJid) return sendError(sock, msg, 'No puedes robarte a ti mismo.');

        const remaining = Economy.checkCooldown(senderJid, 'last_rob', config.economy.robCooldown);
        if (remaining > 0) {
            return sendError(sock, msg, `Debes esperar ${formatCooldown(remaining)} para robar de nuevo.`);
        }

        const targetEco = Economy.getOrCreate(target);
        if (targetEco.wallet < 50) return sendError(sock, msg, `@${target.split('@')[0]} no tiene suficiente dinero para robar.`);

        Economy.setCooldown(senderJid, 'last_rob');
        const success = Math.random() < config.economy.robChance;

        if (success) {
            const maxRob = Math.floor(targetEco.wallet * 0.3); // máx 30% de su billetera
            const stolen = random(50, Math.max(50, maxRob));
            Economy.removeWallet(target, stolen);
            Economy.addWallet(senderJid, stolen);

            await sock.sendMessage(msg.key.remoteJid, {
                text: `🦹 @${senderJid.split('@')[0]} robó *${formatNumber(stolen)}* ${currency} a @${target.split('@')[0]}!`,
                mentions: [senderJid, target],
            }, { quoted: msg });
        } else {
            const fine = random(50, 200);
            Economy.removeWallet(senderJid, fine);

            await sock.sendMessage(msg.key.remoteJid, {
                text: `🚔 @${senderJid.split('@')[0]} intentó robar a @${target.split('@')[0]} pero fue atrapado!\n💸 Multa: -${formatNumber(fine)} ${currency}`,
                mentions: [senderJid, target],
            }, { quoted: msg });
        }
    },
};
