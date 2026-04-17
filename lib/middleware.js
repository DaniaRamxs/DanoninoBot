import Group from '../database/models/Group.js';
import User from '../database/models/User.js';
import db from '../database/database.js';
import settings from '../config/settings.js';
import { reply, sendWarning } from './formatter.js';
import {
    extractMessageText,
    getMessageType,
    getSenderJid,
    containsLink,
    containsWhatsAppLink,
    isOwner,
} from './utils.js';
import { isAdmin } from './permissions.js';

/** Mapa para rastrear spam por usuario */
const spamMap = new Map();

/**
 * Ejecutar todos los checks de middleware
 * Retorna true si el mensaje debe ser procesado, false si fue bloqueado
 */
export async function runMiddleware(sock, msg) {
    const chatJid = msg.key.remoteJid;
    const senderJid = getSenderJid(msg);

    // Solo aplicar en grupos
    if (!chatJid.endsWith('@g.us')) return true;

    // Los admins y owners están exentos
    if (isOwner(senderJid)) return true;
    const adminCheck = await isAdmin(sock, chatJid, senderJid);
    if (adminCheck) return true;

    const group = Group.get(chatJid);
    if (!group) return true;

    // ═══ Usuario muteado ═══
    const isMuted = db.prepare('SELECT 1 FROM muted_users WHERE group_jid = ? AND user_jid = ?').get(chatJid, senderJid);
    if (isMuted) {
        await deleteMessage(sock, msg);
        return false;
    }

    const text = extractMessageText(msg);
    const msgType = getMessageType(msg);

    // ═══ Anti-spam ═══
    if (group.anti_spam) {
        const blocked = checkSpam(senderJid, chatJid, group.spam_limit);
        if (blocked) {
            await handleViolation(sock, msg, group, 'Spam detectado');
            return false;
        }
    }

    // ═══ Anti-link WhatsApp ═══
    if (group.anti_link && text && containsWhatsAppLink(text)) {
        await deleteMessage(sock, msg);
        await handleViolation(sock, msg, group, 'Enlaces de WhatsApp no permitidos');
        return false;
    }

    // ═══ Anti-link genérico ═══
    if (group.anti_link_hard && text && containsLink(text)) {
        await deleteMessage(sock, msg);
        await handleViolation(sock, msg, group, 'Enlaces no permitidos');
        return false;
    }

    // ═══ Anti-fake (números extranjeros) ═══
    if (group.anti_fake) {
        const number = senderJid.replace('@s.whatsapp.net', '');
        // Verificar si el número NO empieza con el prefijo del owner
        const ownerPrefix = settings.ownerNumber.substring(0, 2);
        if (!number.startsWith(ownerPrefix)) {
            const legend = group.anti_fake_legend || 'Número no permitido en este grupo.';
            await sock.sendMessage(chatJid, { text: `⚠️ ${legend}` });
            try {
                await sock.groupParticipantsUpdate(chatJid, [senderJid], 'remove');
            } catch {}
            return false;
        }
    }

    // ═══ Anti-malas palabras ═══
    if (group.anti_badword && text) {
        const badwords = db.prepare('SELECT word FROM badwords WHERE group_jid = ?')
            .all(chatJid)
            .map(r => r.word.toLowerCase());

        const lowerText = text.toLowerCase();
        const found = badwords.some(w => lowerText.includes(w));
        if (found) {
            await deleteMessage(sock, msg);
            await handleViolation(sock, msg, group, 'Palabra prohibida detectada');
            return false;
        }
    }

    // ═══ Anti-media (por tipo) ═══
    const mediaChecks = {
        image: group.anti_image,
        video: group.anti_video,
        audio: group.anti_audio,
        ptt: group.anti_voicenote,
        sticker: group.anti_sticker,
        document: group.anti_document,
        contact: group.anti_contact,
        location: group.anti_location,
        catalog: group.anti_catalog,
    };

    if (mediaChecks[msgType]) {
        await deleteMessage(sock, msg);
        const typeNames = {
            image: 'Imágenes', video: 'Videos', audio: 'Audios',
            ptt: 'Notas de voz', sticker: 'Stickers', document: 'Documentos',
            contact: 'Contactos', location: 'Ubicaciones', catalog: 'Catálogos',
        };
        await handleViolation(sock, msg, group, `${typeNames[msgType]} no permitidos`);
        return false;
    }

    // ═══ Anti-spam (mensajes largos) ═══
    if (group.anti_spam && text && text.length > group.spam_limit) {
        await deleteMessage(sock, msg);
        await handleViolation(sock, msg, group, 'Mensaje demasiado largo (spam)');
        return false;
    }

    return true;
}

/**
 * Verificar spam (demasiados mensajes en poco tiempo)
 */
function checkSpam(userJid, groupJid, limit) {
    const key = `${groupJid}:${userJid}`;
    const now = Date.now();
    const data = spamMap.get(key) || { count: 0, firstMsg: now };

    if (now - data.firstMsg > settings.spamInterval) {
        spamMap.set(key, { count: 1, firstMsg: now });
        return false;
    }

    data.count++;
    spamMap.set(key, data);
    return data.count >= settings.spamThreshold;
}

/**
 * Eliminar un mensaje
 */
async function deleteMessage(sock, msg) {
    try {
        await sock.sendMessage(msg.key.remoteJid, { delete: msg.key });
    } catch {}
}

/**
 * Manejar violación: advertir o expulsar
 */
async function handleViolation(sock, msg, group, reason) {
    const chatJid = msg.key.remoteJid;
    const senderJid = getSenderJid(msg);

    if (group.warning_mode) {
        // Modo advertencia: agregar warning
        db.prepare('INSERT INTO warnings (group_jid, user_jid, reason) VALUES (?, ?, ?)')
            .run(chatJid, senderJid, reason);

        const count = db.prepare('SELECT COUNT(*) as total FROM warnings WHERE group_jid = ? AND user_jid = ?')
            .get(chatJid, senderJid).total;

        if (count >= settings.maxWarnings) {
            // Máximo de advertencias alcanzado -> expulsar
            await sock.sendMessage(chatJid, {
                text: `⚠️ @${senderJid.split('@')[0]} ha alcanzado ${settings.maxWarnings} advertencias y será eliminado.\n📋 Razón: ${reason}`,
                mentions: [senderJid],
            });
            try {
                await sock.groupParticipantsUpdate(chatJid, [senderJid], 'remove');
            } catch {}
            // Limpiar advertencias
            db.prepare('DELETE FROM warnings WHERE group_jid = ? AND user_jid = ?').run(chatJid, senderJid);
        } else {
            await sock.sendMessage(chatJid, {
                text: `⚠️ @${senderJid.split('@')[0]} advertencia ${count}/${settings.maxWarnings}\n📋 Razón: ${reason}`,
                mentions: [senderJid],
            });
        }
    } else {
        // Sin modo advertencia: solo notificar
        await sock.sendMessage(chatJid, {
            text: `⚠️ @${senderJid.split('@')[0]}\n📋 ${reason}`,
            mentions: [senderJid],
        });
    }
}
