import { sendError, sendSticker, sendTyping } from '../../lib/formatter.js';
import axios from 'axios';
import sharp from 'sharp';

export default {
    name: 'emojimix',
    aliases: ['mix'],
    category: 'stickers',
    description: 'Mezcla dos emojis y conviértelos en sticker.',
    usage: '/emojimix 😀+😎',
    cooldown: 5,

    async execute(sock, msg, args) {
        const text = args.join(' ');
        if (!text || !text.includes('+')) {
            return sendError(sock, msg, 'Escribe dos emojis separados por +\nEj: /emojimix 😀+😎');
        }

        const parts = text.split('+').map(s => s.trim());
        if (parts.length < 2) return sendError(sock, msg, 'Necesitas 2 emojis.\nEj: /emojimix 😀+😎');

        const emoji1 = parts[0];
        const emoji2 = parts[1];

        await sendTyping(sock, msg.key.remoteJid);

        try {
            // Convertir emojis a codepoints
            const cp1 = [...emoji1].map(c => c.codePointAt(0).toString(16)).join('-');
            const cp2 = [...emoji2].map(c => c.codePointAt(0).toString(16)).join('-');

            // Google Emoji Kitchen API
            const url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${cp1}/u${cp1}_u${cp2}.png`;

            const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });

            const buffer = await sharp(Buffer.from(data))
                .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .webp({ quality: 80 })
                .toBuffer();

            await sendSticker(sock, msg.key.remoteJid, buffer, msg);
        } catch {
            // Intentar con orden invertido
            try {
                const cp1 = [...emoji1].map(c => c.codePointAt(0).toString(16)).join('-');
                const cp2 = [...emoji2].map(c => c.codePointAt(0).toString(16)).join('-');
                const url = `https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u${cp2}/u${cp2}_u${cp1}.png`;

                const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });

                const buffer = await sharp(Buffer.from(data))
                    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                    .webp({ quality: 80 })
                    .toBuffer();

                await sendSticker(sock, msg.key.remoteJid, buffer, msg);
            } catch {
                await sendError(sock, msg, 'No se pudo mezclar esos emojis. Prueba con otros.');
            }
        }
    },
};
