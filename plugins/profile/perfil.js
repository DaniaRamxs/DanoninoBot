import { reply } from '../../lib/formatter.js';
import { getMentionedJid, getSenderJid, formatNumber } from '../../lib/utils.js';
import User from '../../database/models/User.js';
import Level from '../../database/models/Level.js';
import db from '../../database/database.js';

export default {
    name: 'perfil',
    aliases: ['profile', 'miperfil'],
    category: 'profile',
    description: 'Ver tu perfil.',
    usage: '/perfil [@usuario]',
    cooldown: 5,

    async execute(sock, msg, args) {
        const target = getMentionedJid(msg, args) || getSenderJid(msg);
        const user = User.getOrCreate(target, msg.pushName || '');

        // Datos de economía
        const eco = db.prepare('SELECT wallet, bank FROM economy WHERE user_jid = ?').get(target);

        // Matrimonio
        const marriage = db.prepare(
            'SELECT * FROM marriages WHERE user1_jid = ? OR user2_jid = ?'
        ).get(target, target);
        let partnerText = 'Soltero/a';
        if (marriage) {
            const partner = marriage.user1_jid === target ? marriage.user2_jid : marriage.user1_jid;
            partnerText = `@${partner.split('@')[0]} (desde ${marriage.married_at?.split('T')[0] || marriage.married_at})`;
        }

        // Nivel global (mejor nivel entre todos los grupos)
        const bestLevel = db.prepare(
            'SELECT level, xp FROM levels WHERE user_jid = ? ORDER BY level DESC, xp DESC LIMIT 1'
        ).get(target);

        // Gacha
        const charCount = db.prepare(
            'SELECT COUNT(*) as c FROM gacha_collection WHERE user_jid = ?'
        ).get(target).c;

        const number = target.split('@')[0];
        const genderEmoji = user.gender === 'masculino' ? '♂️' : user.gender === 'femenino' ? '♀️' : '⚧️';

        let text = '';
        text += `╭━━⸻⌔∎\n`;
        text += `┃ 📋 *Perfil de @${number}*\n`;
        text += `╰━━━━━─⌔∎\n\n`;

        text += `✦ *Nombre:* ${user.name || msg.pushName || 'Sin nombre'}\n`;
        text += `✦ *Descripción:* ${user.description || 'Sin descripción'}\n`;
        text += `✦ *Género:* ${genderEmoji} ${user.gender || 'No definido'}\n`;
        text += `✦ *Cumpleaños:* 🎂 ${user.birthday || 'No definido'}\n`;
        text += `✦ *Registrado:* ${user.registered_at?.split('T')[0] || user.registered_at}\n\n`;

        text += `💍 *Pareja:* ${partnerText}\n\n`;

        text += `🪙 *Economía:*\n`;
        text += `   Billetera: ${formatNumber(eco?.wallet || 0)}\n`;
        text += `   Banco: ${formatNumber(eco?.bank || 0)}\n\n`;

        const lvl = bestLevel?.level || 1;
        const xp = bestLevel?.xp || 0;
        const rank = Level.getRank(lvl);
        const xpNeeded = Level.xpForLevel(lvl + 1);
        const progress = Math.floor((xp / xpNeeded) * 10);
        const bar = '█'.repeat(progress) + '░'.repeat(10 - progress);

        text += `🏆 *Nivel:* ${lvl}\n`;
        text += `🏅 *Rango:* ${rank}\n`;
        text += `✨ *XP:* ${formatNumber(xp)} / ${formatNumber(xpNeeded)}\n`;
        text += `   ${bar} ${Math.floor((xp / xpNeeded) * 100)}%\n\n`;
        text += `🧩 *Personajes:* ${charCount}\n`;

        await sock.sendMessage(msg.key.remoteJid, {
            text,
            mentions: marriage ? [target, marriage.user1_jid === target ? marriage.user2_jid : marriage.user1_jid] : [target],
        }, { quoted: msg });
    },
};
