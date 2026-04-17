import { reply } from '../../lib/formatter.js';

export default {
    name: 'ping',
    aliases: ['p', 'bot', 'speed'],
    category: 'core',
    description: 'Mide la velocidad del bot.',
    usage: '/ping',
    cooldown: 3,

    async execute(sock, msg, args, { formatter }) {
        const start = Date.now();
        await reply(sock, msg, '🏓 Pong!');
        const latency = Date.now() - start;
        await reply(sock, msg, `⚡ Velocidad: ${latency}ms`);
    },
};
