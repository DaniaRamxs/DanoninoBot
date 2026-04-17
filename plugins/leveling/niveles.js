import { reply } from '../../lib/formatter.js';
import Level from '../../database/models/Level.js';

export default {
    name: 'niveles',
    aliases: ['rangos', 'ranks'],
    category: 'leveling',
    description: 'Muestra la lista completa de rangos que puedes alcanzar.',
    usage: '/niveles',
    cooldown: 10,

    async execute(sock, msg) {
        const ranks = Level.getAllRanks();

        let text = '';
        text += `╭━━⸻⌔∎\n`;
        text += `┃ 🏅 *Rangos disponibles*\n`;
        text += `╰━━━━━─⌔∎\n\n`;

        for (const r of ranks) {
            text += `${r.name}\n`;
            text += `   Nivel ${r.min} - ${r.max}\n\n`;
        }

        text += `✨ XP por mensaje: 5-15\n`;
        text += `📈 XP para subir: nivel × 100`;

        await reply(sock, msg, text);
    },
};
