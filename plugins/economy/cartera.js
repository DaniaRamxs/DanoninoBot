import { reply } from '../../lib/formatter.js';
import { getSenderJid, formatNumber } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

export default {
    name: 'cartera',
    aliases: ['wallet', 'bal', 'balance', 'saldo'],
    category: 'economy',
    description: 'Muestra tu saldo disponible.',
    usage: '/cartera',
    cooldown: 3,

    async execute(sock, msg, args, { config }) {
        const senderJid = getSenderJid(msg);
        const eco = Economy.getOrCreate(senderJid);
        const currency = config.economy.currencyName;

        let text = '';
        text += `╭━━⸻⌔∎\n`;
        text += `┃ 🪙 *Cartera de @${senderJid.split('@')[0]}*\n`;
        text += `╰━━━━━─⌔∎\n\n`;
        text += `💰 Billetera: *${formatNumber(eco.wallet)}* ${currency}\n`;
        text += `🏦 Banco: *${formatNumber(eco.bank)}* ${currency}\n`;
        text += `📊 Total: *${formatNumber(eco.wallet + eco.bank)}* ${currency}\n\n`;
        text += `📈 Ganado: ${formatNumber(eco.total_earned)}\n`;
        text += `📉 Gastado: ${formatNumber(eco.total_spent)}`;

        await sock.sendMessage(msg.key.remoteJid, {
            text,
            mentions: [senderJid],
        }, { quoted: msg });
    },
};
