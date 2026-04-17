import { sendError, sendAudio, sendTyping } from '../../lib/formatter.js';
import gtts from 'node-gtts';

export default {
    name: 'gtts',
    aliases: ['tts', 'habla', 'voz'],
    category: 'tools',
    description: 'Convierte texto en audio.',
    usage: '/gtts [idioma] <texto>',
    cooldown: 5,

    async execute(sock, msg, args) {
        if (!args.length) return sendError(sock, msg, 'Escribe el texto.\nEj: /gtts Hola mundo\nEj: /gtts en Hello world');

        const langs = ['es', 'en', 'pt', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ru', 'ar', 'hi', 'tr', 'nl', 'pl'];
        let lang = 'es';
        let text;

        if (langs.includes(args[0]?.toLowerCase())) {
            lang = args[0].toLowerCase();
            text = args.slice(1).join(' ');
        } else {
            text = args.join(' ');
        }

        if (!text) return sendError(sock, msg, 'Escribe el texto a convertir.');
        if (text.length > 500) return sendError(sock, msg, 'Máximo 500 caracteres.');

        await sendTyping(sock, msg.key.remoteJid);

        try {
            const tts = gtts(lang);
            const buffer = await new Promise((resolve, reject) => {
                const chunks = [];
                const stream = tts.stream(text);
                stream.on('data', c => chunks.push(c));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });

            await sendAudio(sock, msg.key.remoteJid, buffer, true, msg);
        } catch {
            await sendError(sock, msg, 'Error al generar el audio.');
        }
    },
};
