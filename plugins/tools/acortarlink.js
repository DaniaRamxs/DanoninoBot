import { reply, sendSuccess, sendError, sendTyping } from '../../lib/formatter.js';
import axios from 'axios';

export default {
    name: 'acortarlink',
    aliases: ['shorturl', 'acortar'],
    category: 'tools',
    description: 'Convierte enlaces largos en enlaces cortos.',
    usage: '/acortarlink <url>',
    cooldown: 5,

    async execute(sock, msg, args) {
        const url = args[0];
        if (!url) return sendError(sock, msg, 'Escribe la URL.\nEj: /acortarlink https://ejemplo.com/pagina-larga');

        if (!/^https?:\/\//i.test(url)) return sendError(sock, msg, 'URL inválida. Debe empezar con http:// o https://');

        await sendTyping(sock, msg.key.remoteJid);

        try {
            const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, {
                timeout: 15000,
            });

            await reply(sock, msg, `🔗 *Link acortado:*\n\n${data}`);
        } catch {
            await sendError(sock, msg, 'Error al acortar el enlace.');
        }
    },
};
