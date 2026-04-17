import { reply, sendError, sendTyping } from '../../lib/formatter.js';
import axios from 'axios';

export default {
    name: 'traductor',
    aliases: ['translate', 'traducir', 'tr'],
    category: 'tools',
    description: 'Traduce frases a cualquier idioma.',
    usage: '/traductor <código_idioma> <texto>',
    cooldown: 3,

    async execute(sock, msg, args) {
        if (args.length < 2) {
            return reply(sock, msg,
                '📋 Uso: /traductor <idioma> <texto>\n\n' +
                'Ejemplos:\n' +
                '/traductor en Hola mundo\n' +
                '/traductor ja Buenos días\n' +
                '/traductor pt Me gusta programar\n\n' +
                'Usa /infoidiomas para ver códigos disponibles.'
            );
        }

        const lang = args[0].toLowerCase();
        const text = args.slice(1).join(' ');

        await sendTyping(sock, msg.key.remoteJid);

        try {
            const { data } = await axios.get(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`,
                { timeout: 15000 }
            );

            const translated = data?.[0]?.map(s => s[0]).join('') || '';
            const detectedLang = data?.[2] || 'auto';

            if (!translated) return sendError(sock, msg, 'No se pudo traducir.');

            let result = `🌐 *Traductor*\n\n`;
            result += `📝 *Original (${detectedLang}):*\n${text}\n\n`;
            result += `📗 *Traducción (${lang}):*\n${translated}`;

            await reply(sock, msg, result);
        } catch {
            await sendError(sock, msg, 'Error al traducir. Verifica el código de idioma.');
        }
    },
};
