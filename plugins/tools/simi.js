import { reply, sendError, sendTyping } from '../../lib/formatter.js';
import axios from 'axios';

export default {
    name: 'simi',
    aliases: ['chat', 'hablar'],
    category: 'tools',
    description: 'Habla con el bot.',
    usage: '/simi <mensaje>',
    cooldown: 3,

    async execute(sock, msg, args) {
        const text = args.join(' ');
        if (!text) return sendError(sock, msg, 'Escribe algo.\nEj: /simi Hola cómo estás?');

        await sendTyping(sock, msg.key.remoteJid);

        try {
            const { data } = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(text)}&lc=es`, {
                timeout: 15000,
            });
            const answer = data?.success || data?.response || 'No sé qué decir...';
            await reply(sock, msg, `🗣️ ${answer}`);
        } catch {
            const responses = [
                'Hmm, no sé qué decir...',
                'Interesante, cuéntame más.',
                'Jajaja, qué gracioso!',
                'No entendí, repite por favor.',
                'Eso es genial!',
                'Me aburro, cuéntame algo divertido.',
                'Ya veo, y tú qué piensas?',
                'No me molestes, estoy ocupado 😤',
            ];
            const r = responses[Math.floor(Math.random() * responses.length)];
            await reply(sock, msg, `🗣️ ${r}`);
        }
    },
};
