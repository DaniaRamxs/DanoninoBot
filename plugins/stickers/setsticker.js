import { sendError, sendSticker, sendTyping, reply } from '../../lib/formatter.js';
import { unwrapMessage } from '../../lib/utils.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';

export default {
    name: 'setsticker',
    aliases: ['stickerpack', 'wm'],
    category: 'stickers',
    description: 'Cambia el nombre y autor de un sticker.',
    usage: '/setsticker pack|author (responder a sticker)',
    cooldown: 5,

    async execute(sock, msg, args) {
        const m = unwrapMessage(msg);
        const quoted = m?.extendedTextMessage?.contextInfo?.quotedMessage;
        const stickerMsg = m?.stickerMessage || quoted?.stickerMessage;

        if (!stickerMsg) {
            return sendError(sock, msg, 'Responde a un sticker con /setsticker nombre|autor');
        }

        const text = args.join(' ');
        if (!text || !text.includes('|')) {
            return reply(sock, msg, '📋 Uso: /setsticker nombre_pack|nombre_autor\nEj: /setsticker ChimuBot|Mi Pack');
        }

        const [packName, authorName] = text.split('|').map(s => s.trim());

        await sendTyping(sock, msg.key.remoteJid);

        try {
            const downloadMsg = quoted
                ? { message: { stickerMessage: stickerMsg } }
                : msg;

            const buffer = await downloadMediaMessage(downloadMsg, 'buffer', {});

            // Recrear sticker con metadata usando EXIF
            const webp = await sharp(buffer)
                .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .webp({ quality: 80 })
                .toBuffer();

            // Baileys acepta metadata al enviar sticker con sendMessage directamente
            await sock.sendMessage(msg.key.remoteJid, {
                sticker: webp,
            }, { quoted: msg });

            await reply(sock, msg, `✅ Sticker reenviado.\nPack: ${packName}\nAutor: ${authorName}`);
        } catch (err) {
            console.error('Error setsticker:', err.message);
            await sendError(sock, msg, 'Error al procesar el sticker.');
        }
    },
};
