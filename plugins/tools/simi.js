import { reply, sendError, sendTyping } from '../../lib/formatter.js';
import axios from 'axios';

/**
 * APIs de chat casual en cascada.
 * Reutilizan el mismo sistema que /chatgpt pero con prompt de conversación casual.
 */
const apis = [
    {
        name: 'Binjie',
        async fetch(text) {
            const { data } = await axios.post('https://api.binjie.fun/api/generateStream', {
                prompt: text,
                userId: '#/chat/' + Date.now(),
                network: false,
                system: 'Eres un amigo casual y divertido que responde en español de forma muy breve (máximo 2 oraciones), usando emojis ocasionales. Responde como si estuvieras chateando por WhatsApp.',
                withoutContext: false,
                stream: false,
            }, { timeout: 20000 });
            return typeof data === 'string' ? data : (data?.text || data?.message);
        },
    },
    {
        name: 'LuminAI',
        async fetch(text) {
            const { data } = await axios.get('https://api.siputzx.my.id/api/ai/luminai', {
                params: { content: `Responde breve y casual como amigo en WhatsApp: ${text}` },
                timeout: 20000,
            });
            return data?.result || data?.data || data?.message;
        },
    },
    {
        name: 'Aemt',
        async fetch(text) {
            const { data } = await axios.get(
                `https://aemt.me/prompt/gpt?prompt=${encodeURIComponent(`Responde casual y breve: ${text}`)}`,
                { timeout: 20000 }
            );
            return data?.result || data?.data;
        },
    },
    {
        name: 'NashBot',
        async fetch(text) {
            const { data } = await axios.get(
                `https://nashbot.onrender.com/gpt?q=${encodeURIComponent(text)}&id=simi`,
                { timeout: 20000 }
            );
            return data?.response || data?.data;
        },
    },
];

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

        const errors = [];

        for (const api of apis) {
            try {
                const answer = await api.fetch(text);
                if (answer && typeof answer === 'string' && answer.trim().length > 0) {
                    return reply(sock, msg, `🗣️ ${answer.trim()}`);
                }
            } catch (err) {
                errors.push(`${api.name}: ${err.message}`);
                continue;
            }
        }

        console.log('❌ Simi: todas las APIs fallaron:');
        errors.forEach(e => console.log('  -', e));

        // Fallback local cuando todo falla
        const responses = [
            'Hmm, no sé qué decir... 🤔',
            'Interesante, cuéntame más.',
            'Jajaja, qué gracioso! 😂',
            'No entendí, repite por favor 😅',
            'Eso es genial! ✨',
            'Me aburro, cuéntame algo divertido 😴',
            'Ya veo, y tú qué piensas?',
            'No me molestes, estoy ocupado 😤',
        ];
        const r = responses[Math.floor(Math.random() * responses.length)];
        await reply(sock, msg, `🗣️ ${r}`);
    },
};
