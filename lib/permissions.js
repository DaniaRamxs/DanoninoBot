import settings from '../config/settings.js';
import { isOwner } from './utils.js';

/**
 * Normalizar JID (quitar :device y asegurar @s.whatsapp.net)
 */
function normalizeJid(jid) {
    if (!jid) return '';
    // Quitar el :device (ej: 549111234:45@s.whatsapp.net -> 549111234@s.whatsapp.net)
    return jid.replace(/:.*@/, '@');
}

/**
 * Verificar si un usuario es admin del grupo
 */
export async function isAdmin(sock, groupJid, userJid) {
    try {
        const metadata = await sock.groupMetadata(groupJid);
        const normalUser = normalizeJid(userJid);
        const admins = metadata.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(p => normalizeJid(p.id));
        return admins.includes(normalUser);
    } catch {
        return false;
    }
}

/**
 * Verificar si el bot es admin del grupo
 */
export async function isBotAdmin(sock, groupJid) {
    try {
        const botJid = normalizeJid(sock.user?.id);
        if (!botJid) return false;
        return await isAdmin(sock, groupJid, botJid);
    } catch {
        return false;
    }
}

/**
 * Obtener lista de admins del grupo
 */
export async function getGroupAdmins(sock, groupJid) {
    try {
        const metadata = await sock.groupMetadata(groupJid);
        return metadata.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(p => normalizeJid(p.id));
    } catch {
        return [];
    }
}

/**
 * Obtener lista de participantes del grupo
 */
export async function getGroupParticipants(sock, groupJid) {
    try {
        const metadata = await sock.groupMetadata(groupJid);
        return metadata.participants.map(p => normalizeJid(p.id));
    } catch {
        return [];
    }
}

/**
 * Obtener metadata del grupo
 */
export async function getGroupMetadata(sock, groupJid) {
    try {
        return await sock.groupMetadata(groupJid);
    } catch {
        return null;
    }
}

/**
 * Verificar permisos de un comando
 * Retorna { allowed, reason }
 */
export async function checkPermissions(sock, msg, plugin) {
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const chatJid = msg.key.remoteJid;
    const isGroupChat = chatJid.endsWith('@g.us');

    // Comando solo de owner
    if (plugin.ownerOnly && !isOwner(senderJid)) {
        return { allowed: false, reason: 'Este comando es solo para el dueño del bot.' };
    }

    // Comando solo de grupo
    if (plugin.groupOnly && !isGroupChat) {
        return { allowed: false, reason: 'Este comando solo funciona en grupos.' };
    }

    // Comando solo para admins
    if (plugin.adminOnly && isGroupChat) {
        const adminCheck = await isAdmin(sock, chatJid, senderJid);
        if (!adminCheck && !isOwner(senderJid)) {
            return { allowed: false, reason: 'Este comando es solo para administradores.' };
        }
    }

    // Requiere que el bot sea admin
    if (plugin.botAdminRequired && isGroupChat) {
        const botAdmin = await isBotAdmin(sock, chatJid);
        if (!botAdmin) {
            return { allowed: false, reason: 'El bot necesita ser administrador para usar este comando.' };
        }
    }

    return { allowed: true, reason: '' };
}
