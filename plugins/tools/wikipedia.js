import { reply, sendError, sendTyping } from '../../lib/formatter.js';
import axios from 'axios';

export default {
    name: 'wikipedia',
    aliases: ['wiki'],
    category: 'tools',
    description: 'Busca información en Wikipedia.',
    usage: '/wikipedia <tema>',
    cooldown: 5,

    async execute(sock, msg, args) {
        const query = args.join(' ');
        if (!query) return sendError(sock, msg, 'Escribe qué buscar.\nEj: /wikipedia Perú');

        await sendTyping(sock, msg.key.remoteJid);

        try {
            const { data } = await axios.get('https://es.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(query), {
                timeout: 15000,
            });

            if (!data.extract) return sendError(sock, msg, `No se encontró información sobre "${query}".`);

            let text = `📚 *Wikipedia: ${data.title}*\n\n`;
            text += data.extract.substring(0, 1000);
            if (data.extract.length > 1000) text += '...';

            await reply(sock, msg, text);
        } catch (err) {
            if (err.response?.status === 404) {
                return sendError(sock, msg, `No se encontró "${query}" en Wikipedia.`);
            }
            await sendError(sock, msg, 'Error al buscar en Wikipedia.');
        }
    },
};
