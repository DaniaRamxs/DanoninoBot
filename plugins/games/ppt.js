import { reply } from '../../lib/formatter.js';
import { random } from '../../lib/utils.js';

const choices = {
    piedra: { emoji: '🪨', beats: 'tijera' },
    papel: { emoji: '📄', beats: 'piedra' },
    tijera: { emoji: '✂️', beats: 'papel' },
};
const aliases = { rock: 'piedra', paper: 'papel', scissors: 'tijera', p: 'piedra', t: 'tijera' };

export default {
    name: 'ppt',
    aliases: ['rps', 'piedrapapeltijera'],
    category: 'games',
    description: 'Juega contra el bot piedra, papel o tijera.',
    usage: '/ppt piedra | papel | tijera',
    cooldown: 3,

    async execute(sock, msg, args) {
        let choice = args[0]?.toLowerCase();
        choice = aliases[choice] || choice;

        if (!choice || !choices[choice]) {
            return reply(sock, msg, '📋 Uso: /ppt piedra | papel | tijera');
        }

        const botChoices = Object.keys(choices);
        const botChoice = botChoices[random(0, 2)];

        const player = choices[choice];
        const bot = choices[botChoice];

        let result;
        if (choice === botChoice) {
            result = '🤝 *¡Empate!*';
        } else if (player.beats === botChoice) {
            result = '🎉 *¡Ganaste!*';
        } else {
            result = '😢 *¡Perdiste!*';
        }

        await reply(sock, msg,
            `🎮 *Piedra, Papel o Tijera*\n\n` +
            `Tú: ${player.emoji} ${choice}\n` +
            `Bot: ${bot.emoji} ${botChoice}\n\n` +
            `${result}`
        );
    },
};
