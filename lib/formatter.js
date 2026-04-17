import settings from '../config/settings.js';

const e = settings.emojis;

/**
 * Enviar mensaje de texto simple
 */
export async function reply(sock, msg, text) {
    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
}

/**
 * Enviar mensaje con reacción
 */
export async function react(sock, msg, emoji) {
    await sock.sendMessage(msg.key.remoteJid, {
        react: { text: emoji, key: msg.key },
    });
}

/**
 * Enviar respuesta de éxito
 */
export async function sendSuccess(sock, msg, text) {
    await reply(sock, msg, `${e.success} ${text}`);
}

/**
 * Enviar respuesta de error
 */
export async function sendError(sock, msg, text) {
    await reply(sock, msg, `${e.error} ${text}`);
}

/**
 * Enviar respuesta de advertencia
 */
export async function sendWarning(sock, msg, text) {
    await reply(sock, msg, `${e.warning} ${text}`);
}

/**
 * Enviar respuesta de info
 */
export async function sendInfo(sock, msg, text) {
    await reply(sock, msg, `${e.info} ${text}`);
}

/**
 * Enviar imagen con texto
 */
export async function sendImage(sock, chatJid, imageBuffer, caption = '', quoted = null) {
    const opts = { image: imageBuffer, caption };
    if (quoted) return sock.sendMessage(chatJid, opts, { quoted });
    return sock.sendMessage(chatJid, opts);
}

/**
 * Enviar audio
 */
export async function sendAudio(sock, chatJid, audioBuffer, ptt = false, quoted = null) {
    const opts = { audio: audioBuffer, mimetype: 'audio/mp4', ptt };
    if (quoted) return sock.sendMessage(chatJid, opts, { quoted });
    return sock.sendMessage(chatJid, opts);
}

/**
 * Enviar video
 */
export async function sendVideo(sock, chatJid, videoBuffer, caption = '', quoted = null) {
    const opts = { video: videoBuffer, caption };
    if (quoted) return sock.sendMessage(chatJid, opts, { quoted });
    return sock.sendMessage(chatJid, opts);
}

/**
 * Enviar documento
 */
export async function sendDocument(sock, chatJid, docBuffer, filename, mimetype, quoted = null) {
    const opts = { document: docBuffer, fileName: filename, mimetype };
    if (quoted) return sock.sendMessage(chatJid, opts, { quoted });
    return sock.sendMessage(chatJid, opts);
}

/**
 * Enviar sticker
 */
export async function sendSticker(sock, chatJid, stickerBuffer, quoted = null) {
    const opts = { sticker: stickerBuffer };
    if (quoted) return sock.sendMessage(chatJid, opts, { quoted });
    return sock.sendMessage(chatJid, opts);
}

/**
 * Enviar con mención a todos
 */
export async function sendMentionAll(sock, chatJid, text, participants) {
    await sock.sendMessage(chatJid, {
        text,
        mentions: participants,
    });
}

/**
 * Indicador de "escribiendo..."
 */
export async function sendTyping(sock, chatJid) {
    await sock.sendPresenceUpdate('composing', chatJid);
}

/**
 * Indicador de "grabando audio..."
 */
export async function sendRecording(sock, chatJid) {
    await sock.sendPresenceUpdate('recording', chatJid);
}

/**
 * Crear separador decorativo
 */
export function separator(char = '─', length = 30) {
    return char.repeat(length);
}

/**
 * Formatear texto del menú con estilo NaufraBot
 */
export function menuHeader(title) {
    return `╭━━⸻⌔∎\n┃${e.response} ${title}\n╰━━━━━─⌔∎`;
}

/**
 * Formatear item del menú
 */
export function menuItem(command, description) {
    return `${e.menu} ${command}\n> ${description}`;
}
