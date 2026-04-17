import { sendError, sendSticker, sendTyping } from '../../lib/formatter.js';
import sharp from 'sharp';

const styles = {
    attp:  { bg: 'transparent', color: '#FFFFFF', stroke: '#000000', font: 'bold 80px sans-serif' },
    attp2: { bg: '#000000',     color: '#FF0000', stroke: '#FFFFFF', font: 'bold 72px sans-serif' },
    attp3: { bg: '#1a1a2e',     color: '#e94560', stroke: '#0f3460', font: 'italic bold 68px serif' },
};

function textToSvg(text, style) {
    const lines = text.match(/.{1,15}/g) || [text];
    const lineHeight = 90;
    const height = Math.max(512, lines.length * lineHeight + 100);
    const y0 = (height - lines.length * lineHeight) / 2 + 70;

    const bgRect = style.bg === 'transparent'
        ? ''
        : `<rect width="512" height="${height}" fill="${style.bg}"/>`;

    const textLines = lines.map((line, i) =>
        `<text x="256" y="${y0 + i * lineHeight}" text-anchor="middle"
         font-family="sans-serif" font-size="72" font-weight="bold"
         fill="${style.color}" stroke="${style.stroke}" stroke-width="3">${escapeXml(line)}</text>`
    ).join('\n');

    return `<svg width="512" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${bgRect}
        ${textLines}
    </svg>`;
}

function escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default {
    name: 'attp',
    aliases: ['attp2', 'attp3'],
    category: 'stickers',
    description: 'Convierten textos a stickers (estilos distintos).',
    usage: '/attp <texto>',
    cooldown: 5,

    async execute(sock, msg, args, { command }) {
        const text = args.join(' ');
        if (!text) return sendError(sock, msg, `Escribe el texto.\nEj: /${command} Hola mundo`);
        if (text.length > 100) return sendError(sock, msg, 'Máximo 100 caracteres.');

        await sendTyping(sock, msg.key.remoteJid);

        try {
            const style = styles[command] || styles.attp;
            const svg = textToSvg(text, style);

            const buffer = await sharp(Buffer.from(svg))
                .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .webp({ quality: 80 })
                .toBuffer();

            await sendSticker(sock, msg.key.remoteJid, buffer, msg);
        } catch (err) {
            console.error('Error attp:', err.message);
            await sendError(sock, msg, 'Error al crear el sticker de texto.');
        }
    },
};
