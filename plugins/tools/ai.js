import { reply, sendError, sendTyping } from '../../lib/formatter.js';
import axios from 'axios';

export default {
    name: 'chatgpt',
    aliases: ['ia', 'ai', 'gpt'],
    category: 'tools',
    description: 'Haz preguntas a una IA.',
    usage: '/chatgpt <pregunta>',
    cooldown: 5,

    async execute(sock, msg, args) {
        const question = args.join(' ');
        if (!question) return sendError(sock, msg, 'Escribe tu pregunta.\nEj: /chatgpt Qué es la inteligencia artificial?');

        await sendTyping(sock, msg.key.remoteJid);

        try {
            // API gratuita de IA
            const { data } = await axios.get(`https://api.siputzx.my.id/api/ai/luminai`, {
                params: { content: question },
                timeout: 30000,
            });

            const answer = data?.result || data?.data || data?.message || 'No obtuve respuesta.';
            await reply(sock, msg, `🤖 *ChatGPT*\n\n${answer}`);
        } catch {
            try {
                // Fallback API
                const { data } = await axios.get(`https://aemt.me/prompt/gpt?prompt=${encodeURIComponent(question)}`, {
                    timeout: 30000,
                });
                const answer = data?.result || data?.data || 'No obtuve respuesta.';
                await reply(sock, msg, `🤖 *ChatGPT*\n\n${answer}`);
            } catch {
                await sendError(sock, msg, 'No se pudo conectar con la IA. Intenta más tarde.');
            }
        }
    },
};
