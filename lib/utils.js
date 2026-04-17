import settings from '../config/settings.js';

/**
 * Desenvuelve el mensaje real de las capas de Baileys
 * (ephemeralMessage, viewOnceMessageV2, documentWithCaptionMessage, etc.)
 */
export function unwrapMessage(msg) {
    let m = msg.message;
    if (!m) return null;
    // Desenvolver capas
    if (m.ephemeralMessage) m = m.ephemeralMessage.message;
    if (m.viewOnceMessageV2) m = m.viewOnceMessageV2.message;
    if (m.viewOnceMessage) m = m.viewOnceMessage.message;
    if (m.documentWithCaptionMessage) m = m.documentWithCaptionMessage.message;
    if (m.editedMessage) m = m.editedMessage.message;
    return m;
}

/**
 * Extraer texto del mensaje de Baileys
 */
export function extractMessageText(msg) {
    const m = unwrapMessage(msg);
    if (!m) return '';
    return (
        m.conversation ||
        m.extendedTextMessage?.text ||
        m.imageMessage?.caption ||
        m.videoMessage?.caption ||
        m.documentMessage?.caption ||
        m.buttonsResponseMessage?.selectedButtonId ||
        m.listResponseMessage?.singleSelectReply?.selectedRowId ||
        m.templateButtonReplyMessage?.selectedId ||
        m.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson ||
        ''
    );
}

/**
 * Obtener el tipo de mensaje
 */
export function getMessageType(msg) {
    const m = unwrapMessage(msg);
    if (!m) return 'unknown';
    if (m.conversation || m.extendedTextMessage) return 'text';
    if (m.imageMessage) return 'image';
    if (m.videoMessage) return 'video';
    if (m.audioMessage) return m.audioMessage.ptt ? 'ptt' : 'audio';
    if (m.stickerMessage) return 'sticker';
    if (m.documentMessage) return 'document';
    if (m.contactMessage || m.contactsArrayMessage) return 'contact';
    if (m.locationMessage || m.liveLocationMessage) return 'location';
    if (m.orderMessage) return 'catalog';
    return 'unknown';
}

/**
 * Extraer JID del remitente
 */
export function getSenderJid(msg) {
    return msg.key.participant || msg.key.remoteJid;
}

/**
 * Verificar si es mensaje de grupo
 */
export function isGroup(msg) {
    return msg.key.remoteJid.endsWith('@g.us');
}

/**
 * Obtener el JID del chat (grupo o privado)
 */
export function getChatJid(msg) {
    return msg.key.remoteJid;
}

/**
 * Obtener el usuario mencionado o citado
 */
export function getMentionedJid(msg, args) {
    const m = unwrapMessage(msg);
    // Si menciona con @
    const mentioned = m?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentioned?.length) return mentioned[0];

    // Si responde a un mensaje
    const quoted = m?.extendedTextMessage?.contextInfo?.participant;
    if (quoted) return quoted;

    // Si pasa un número como argumento
    if (args[0]) {
        const num = args[0].replace(/[^0-9]/g, '');
        if (num.length >= 8) return num + '@s.whatsapp.net';
    }

    return null;
}

/**
 * Obtener mensaje citado
 */
export function getQuotedMessage(msg) {
    const m = unwrapMessage(msg);
    return m?.extendedTextMessage?.contextInfo?.quotedMessage;
}

/**
 * Verificar si es dueño del bot
 */
export function isOwner(senderJid) {
    return senderJid === settings.ownerJid || senderJid.replace('@s.whatsapp.net', '') === settings.ownerNumber;
}

/**
 * Delay (promesa)
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Número aleatorio entre min y max
 */
export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formatear número con separador de miles
 */
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Formatear tiempo restante (cooldown)
 */
export function formatCooldown(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

/**
 * Parsear booleano de texto (1/0, on/off, si/no)
 */
export function parseToggle(text) {
    const on = ['1', 'on', 'si', 'yes', 'activar', 'true'];
    const off = ['0', 'off', 'no', 'desactivar', 'false'];
    const lower = text?.toLowerCase?.();
    if (on.includes(lower)) return true;
    if (off.includes(lower)) return false;
    return null;
}

/**
 * Generar ID aleatorio
 */
export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Verificar si un texto contiene un enlace
 */
export function containsLink(text) {
    const linkRegex = /https?:\/\/[^\s]+|www\.[^\s]+/gi;
    return linkRegex.test(text);
}

/**
 * Verificar si un texto contiene un enlace de WhatsApp
 */
export function containsWhatsAppLink(text) {
    const waLink = /chat\.whatsapp\.com\/[A-Za-z0-9]+/gi;
    return waLink.test(text);
}

/**
 * Limpiar número de teléfono
 */
export function cleanNumber(jid) {
    return jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
}

/**
 * Convertir segundos a formato legible
 */
export function secondsToHms(d) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);
    return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
}
