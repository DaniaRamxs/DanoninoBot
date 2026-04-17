import { reply, sendError, sendSticker, sendTyping } from '../../lib/formatter.js';
import { unwrapMessage } from '../../lib/utils.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';

export default {
    name: 'sticker',
    aliases: ['figu', 's', 'sticker2'],
    category: 'stickers',
    description: 'Responde una imagen o video corto y conviértelo en sticker.',
    usage: '/sticker (responder a imagen/video)',
    cooldown: 5,

    async execute(sock, msg, args) {
        const m = unwrapMessage(msg);
        const quoted = m?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mediaMsg = m?.imageMessage || quoted?.imageMessage || m?.videoMessage || quoted?.videoMessage;

        if (!mediaMsg) {
            return sendError(sock, msg, 'Responde a una imagen o video corto con /sticker');
        }

        await sendTyping(sock, msg.key.remoteJid);

        try {
            // Construir objeto de mensaje para descargar
            const downloadMsg = quoted
                ? { message: { [quoted.imageMessage ? 'imageMessage' : 'videoMessage']: mediaMsg } }
                : msg;

            const buffer = await downloadMediaMessage(downloadMsg, 'buffer', {});

            // Convertir a WebP con sharp
            const stickerBuffer = await sharp(buffer)
                .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .webp({ quality: 80 })
                .toBuffer();

            await sendSticker(sock, msg.key.remoteJid, stickerBuffer, msg);
        } catch (err) {
            console.error('Error sticker:', err.message);
            await sendError(sock, msg, 'Error al crear el sticker. Asegúrate de responder a una imagen.');
        }
    },
};
