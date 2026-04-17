import { reply, sendError, sendTyping } from '../../lib/formatter.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default {
    name: 'google',
    aliases: ['buscar', 'search'],
    category: 'tools',
    description: 'Busca información directamente desde Google.',
    usage: '/google <búsqueda>',
    cooldown: 5,

    async execute(sock, msg, args) {
        const query = args.join(' ');
        if (!query) return sendError(sock, msg, 'Escribe qué buscar.\nEj: /google clima en Lima');

        await sendTyping(sock, msg.key.remoteJid);

        try {
            const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=es`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                timeout: 15000,
            });

            const $ = cheerio.load(data);
            const results = [];

            $('div.g').each((i, el) => {
                if (i >= 5) return false;
                const title = $(el).find('h3').text();
                const snippet = $(el).find('.VwiC3b, .IsZvec').text();
                const link = $(el).find('a').attr('href');
                if (title && snippet) {
                    results.push({ title, snippet: snippet.substring(0, 150), link });
                }
            });

            if (!results.length) {
                return reply(sock, msg, `🔍 No se encontraron resultados para: "${query}"`);
            }

            let text = `🔍 *Google: ${query}*\n\n`;
            results.forEach((r, i) => {
                text += `*${i + 1}. ${r.title}*\n`;
                text += `${r.snippet}\n\n`;
            });

            await reply(sock, msg, text);
        } catch {
            await sendError(sock, msg, 'Error al buscar en Google.');
        }
    },
};
