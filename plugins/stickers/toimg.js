import { sendError, sendImage, sendTyping } from '../../lib/formatter.js';
import { unwrapMessage } from '../../lib/utils.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';

export default {
    name: 'toimg',
    aliases: ['toimage', 'stickertoimg'],
    category: 'stickers',
    description: 'Convierte sticker a imagen.',
    usage: '/toimg (responder a sticker)',
    cooldown: 5,

    async execute(sock, msg) {
        const m = unwrapMessage(msg);
        const quoted = m?.extendedTextMessage?.contextInfo?.quotedMessage;
        const stickerMsg = m?.stickerMessage || quoted?.stickerMessage;

        if (!stickerMsg) {
            return sendError(sock, msg, 'Responde a un sticker con /toimg');
        }

        await sendTyping(sock, msg.key.remoteJid);

        try {
            const downloadMsg = quoted
                ? { message: { stickerMessage: stickerMsg } }
                : msg;

            const buffer = await downloadMediaMessage(downloadMsg, 'buffer', {});

            const imageBuffer = await sharp(buffer)
                .png()
                .toBuffer();

            await sendImage(sock, msg.key.remoteJid, imageBuffer, '', msg);
        } catch (err) {
            console.error('Error toimg:', err.message);
            await sendError(sock, msg, 'Error al convertir el sticker a imagen.');
        }
    },
};
