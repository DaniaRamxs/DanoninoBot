import { reply, sendError } from '../../lib/formatter.js';
import { getGroupParticipants } from '../../lib/permissions.js';

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function generateSquads(participants, perTeam) {
    const shuffled = shuffle(participants);
    const team1 = shuffled.slice(0, perTeam);
    const team2 = shuffled.slice(perTeam, perTeam * 2);
    return { team1, team2 };
}

function formatTeam(name, players) {
    let text = `*${name}:*\n`;
    players.forEach((p, i) => {
        text += `${i + 1}. @${p.split('@')[0]}\n`;
    });
    return text;
}

export default {
    name: 'guerra',
    aliases: ['4vs4', '6vs6', '12vs12', '16vs16'],
    category: 'games',
    description: 'Genera escuadras aleatorias para guerra.',
    usage: '/guerra | /4vs4 | /6vs6 | /12vs12 | /16vs16',
    cooldown: 10,
    groupOnly: true,

    async execute(sock, msg, args, { command }) {
        const chatJid = msg.key.remoteJid;
        const participants = await getGroupParticipants(sock, chatJid);

        const sizeMap = {
            guerra: 4,
            '4vs4': 4,
            '6vs6': 6,
            '12vs12': 12,
            '16vs16': 16,
        };

        const perTeam = sizeMap[command] || 4;
        const needed = perTeam * 2;

        if (participants.length < needed) {
            return sendError(sock, msg, `Se necesitan al menos ${needed} participantes en el grupo. Hay ${participants.length}.`);
        }

        const { team1, team2 } = generateSquads(participants, perTeam);
        const conditions = args.join(' ');

        let text = '';
        text += `╭━━⸻⌔∎\n`;
        text += `┃ ⚔️ *GUERRA ${perTeam}vs${perTeam}*\n`;
        text += `╰━━━━━─⌔∎\n\n`;

        text += formatTeam('🔴 Equipo Rojo', team1);
        text += `\n`;
        text += formatTeam('🔵 Equipo Azul', team2);

        if (conditions) text += `\n📋 *Condiciones:* ${conditions}`;
        text += `\n\n🎮 ¡Buena suerte a ambos equipos!`;

        await sock.sendMessage(chatJid, {
            text,
            mentions: [...team1, ...team2],
        }, { quoted: msg });
    },
};
