import { reply, sendError } from '../../lib/formatter.js';
import { getSenderJid, random } from '../../lib/utils.js';
import { readFileSync } from 'fs';

const characters = JSON.parse(readFileSync('./data/characters.json', 'utf8'));

const rarityEmojis = {
    common: '⬜', uncommon: '🟩', rare: '🟦', epic: '🟪', legendary: '🟨',
};

export default {
    name: 'rw',
    aliases: ['waifu', 'husband', 'randomwaifu'],
    category: 'gacha',
    description: 'Waifu o husband aleatorio.',
    usage: '/rw',
    cooldown: 10,

    async execute(sock, msg) {
        const char = characters[random(0, characters.length - 1)];
        const emoji = rarityEmojis[char.rarity] || '⬜';

        let text = '';
        text += `╭━━⸻⌔∎\n`;
        text += `┃ 🎲 *Personaje Aleatorio*\n`;
        text += `╰━━━━━─⌔∎\n\n`;
        text += `${emoji} *${char.name}*\n`;
        text += `📺 Anime: ${char.anime}\n`;
        text += `✨ Rareza: ${char.rarity}\n`;
        text += `💰 Valor: ${char.value}\n`;
        text += `🆔 ID: ${char.id}\n\n`;
        text += `Usa /claim ${char.id} para reclamarlo!`;

        await reply(sock, msg, text);
    },
};
