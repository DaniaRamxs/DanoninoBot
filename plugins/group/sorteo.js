import { reply } from '../../lib/formatter.js';
import { getGroupParticipants } from '../../lib/permissions.js';
import { random } from '../../lib/utils.js';

export default {
    name: 'sorteo',
    aliases: ['raffle', 'random'],
    category: 'group',
    description: 'Sorteo aleatorio entre tus participantes.',
    usage: '/sorteo [cantidad_ganadores]',
    cooldown: 10,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const chatJid = msg.key.remoteJid;
        const participants = await getGroupParticipants(sock, chatJid);
        const count = Math.min(parseInt(args[0]) || 1, participants.length, 10);

        // Mezclar y tomar los ganadores
        const shuffled = [...participants].sort(() => Math.random() - 0.5);
        const winners = shuffled.slice(0, count);

        let text = `🎰 *¡SORTEO!* 🎰\n\n`;
        text += `Participantes: ${participants.length}\n`;
        text += `Ganador${count > 1 ? 'es' : ''}:\n\n`;

        winners.forEach((w, i) => {
            const medal = ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;
            text += `${medal} @${w.split('@')[0]}\n`;
        });

        text += `\n🎉 ¡Felicidades!`;

        await sock.sendMessage(chatJid, {
            text,
            mentions: winners,
        }, { quoted: msg });
    },
};
