import settings from '../config/settings.js';
import db from '../database/database.js';
import User from '../database/models/User.js';
import Group from '../database/models/Group.js';
import Level from '../database/models/Level.js';
import { findPlugin } from './pluginLoader.js';
import { checkPermissions } from './permissions.js';
import { runMiddleware } from './middleware.js';
import { sendTyping, reply, sendError } from './formatter.js';
import {
    extractMessageText,
    getSenderJid,
    getChatJid,
    isGroup,
    isOwner,
    getMentionedJid,
    getQuotedMessage,
    getMessageType,
} from './utils.js';

/** Mapa de cooldowns por usuario-comando */
const cooldowns = new Map();

/**
 * Procesar un mensaje entrante
 */
export async function handleMessage(sock, msg) {
    // Debug: ver qué llega
    if (settings.consoleMode) {
        const rawText = extractMessageText(msg);
        const type = getMessageType(msg);
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        console.log(`📨 MSG [${type}] de ${sender.split('@')[0]} en ${from.split('@')[0]}: "${rawText?.substring(0, 50) || '(vacío)'}"`);
    }

    const text = extractMessageText(msg);
    const chatJid = getChatJid(msg);
    const senderJid = getSenderJid(msg);
    const isGroupChat = isGroup(msg);

    // ═══ Registrar usuario si no existe ═══
    const pushName = msg.pushName || 'Sin nombre';
    User.getOrCreate(senderJid, pushName);

    // ═══ Verificar usuario bloqueado ═══
    if (User.isBlocked(senderJid) && !isOwner(senderJid)) return;

    // ═══ Verificar grupo baneado ═══
    if (isGroupChat) {
        Group.getOrCreate(chatJid);
        if (Group.isBanned(chatJid) && !isOwner(senderJid)) return;

        // Actualizar actividad del grupo
        updateGroupActivity(sock, chatJid, senderJid);
    }

    // ═══ Anti-PV: no responder en privado ═══
    if (!isGroupChat && settings.antiPV2 && !isOwner(senderJid)) return;

    // ═══ Ejecutar middleware (anti-*, spam, etc.) ═══
    if (isGroupChat) {
        const allowed = await runMiddleware(sock, msg);
        if (!allowed) return;
    }

    // ═══ Verificar respuestas de juegos (gartic/enigma) ═══
    if (isGroupChat && text) {
        const gameHandled = await checkGameAnswers(sock, msg, chatJid, senderJid, text);
        if (gameHandled) return;
    }

    // ═══ Verificar auto-respuestas (sin prefijo) ═══
    if (isGroupChat && text) {
        const handled = await checkAutoResponses(sock, msg, chatJid, text);
        if (handled) return;
    }

    // ═══ Detectar comando con prefijo ═══
    if (!text) return;

    // Obtener prefijos válidos para este chat
    let validPrefixes = [settings.defaultPrefix];
    if (isGroupChat) {
        const group = Group.get(chatJid);
        if (group?.multi_prefix) {
            validPrefixes = settings.prefixes;
            // Agregar prefijos extra del grupo
            try {
                const extras = JSON.parse(group.extra_prefixes || '[]');
                validPrefixes = [...new Set([...validPrefixes, ...extras])];
            } catch {}
        }
    }

    let usedPrefix = null;
    for (const prefix of validPrefixes) {
        if (text.startsWith(prefix)) {
            usedPrefix = prefix;
            break;
        }
    }

    if (!usedPrefix) return;

    // ═══ Verificar modo admin-only ═══
    if (isGroupChat) {
        const group = Group.get(chatJid);
        if (group?.admin_only && !isOwner(senderJid)) {
            const { isAdmin: checkAdm } = await import('./permissions.js');
            const isAdm = await checkAdm(sock, chatJid, senderJid);
            if (!isAdm) return; // Solo admins pueden usar comandos
        }
    }

    // ═══ Extraer comando y argumentos ═══
    const body = text.slice(usedPrefix.length).trim();
    if (!body) return;

    const [cmdName, ...args] = body.split(/\s+/);
    const command = cmdName.toLowerCase();

    // ═══ Buscar comando personalizado del grupo ═══
    if (isGroupChat) {
        const customCmd = db.prepare(
            'SELECT response, image FROM custom_commands WHERE group_jid = ? AND command = ?'
        ).get(chatJid, command);

        if (customCmd) {
            if (customCmd.image) {
                await sock.sendMessage(chatJid, {
                    image: { url: customCmd.image },
                    caption: customCmd.response,
                }, { quoted: msg });
            } else {
                await reply(sock, msg, customCmd.response);
            }
            return;
        }
    }

    // ═══ Buscar plugin registrado ═══
    const plugin = findPlugin(command);
    if (!plugin) return;

    // ═══ Verificar permisos ═══
    const { allowed, reason } = await checkPermissions(sock, msg, plugin);
    if (!allowed) {
        await sendError(sock, msg, reason);
        return;
    }

    // ═══ Verificar cooldown ═══
    const cooldownKey = `${senderJid}:${plugin.name}`;
    const cooldownTime = (plugin.cooldown || 3) * 1000;
    const now = Date.now();
    const lastUsed = cooldowns.get(cooldownKey) || 0;

    if (now - lastUsed < cooldownTime && !isOwner(senderJid)) {
        const remaining = Math.ceil((cooldownTime - (now - lastUsed)) / 1000);
        await sendError(sock, msg, `Espera ${remaining}s para usar este comando.`);
        return;
    }
    cooldowns.set(cooldownKey, now);

    // ═══ Indicador de escritura ═══
    if (settings.autoTyping) {
        await sendTyping(sock, chatJid);
    }

    // ═══ Log en consola ═══
    if (settings.consoleMode) {
        const sender = senderJid.split('@')[0];
        const chat = isGroupChat ? chatJid.split('@')[0] : 'Privado';
        console.log(`📩 [${chat}] ${sender}: ${usedPrefix}${command} ${args.join(' ')}`);
    }

    // ═══ Ejecutar plugin ═══
    try {
        await plugin.execute(sock, msg, args, {
            db,
            config: settings,
            utils: await import('./utils.js'),
            formatter: await import('./formatter.js'),
            permissions: await import('./permissions.js'),
            prefix: usedPrefix,
            command,
        });
    } catch (err) {
        console.error(`❌ Error en /${command}:`, err);
        await sendError(sock, msg, `Error ejecutando el comando: ${err.message}`);
    }
}

/**
 * Verificar respuestas automáticas del grupo
 */
async function checkAutoResponses(sock, msg, groupJid, text) {
    const group = Group.get(groupJid);
    if (!group?.auto_response_enabled) return false;

    const responses = db.prepare(
        'SELECT * FROM auto_responses WHERE group_jid = ?'
    ).all(groupJid);

    const lowerText = text.toLowerCase();

    for (const ar of responses) {
        const trigger = ar.trigger_word.toLowerCase();
        const match = ar.exact_match
            ? lowerText === trigger
            : lowerText.includes(trigger);

        if (match) {
            if (ar.image) {
                await sock.sendMessage(msg.key.remoteJid, {
                    image: { url: ar.image },
                    caption: ar.response,
                }, { quoted: msg });
            } else {
                await reply(sock, msg, ar.response);
            }
            return true;
        }
    }
    return false;
}

/**
 * Actualizar actividad del grupo (mensajes por usuario) y XP
 */
async function updateGroupActivity(sock, groupJid, userJid) {
    // Actualizar contador de mensajes
    db.prepare(`
        INSERT INTO group_activity (group_jid, user_jid, message_count, last_active)
        VALUES (?, ?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(group_jid, user_jid)
        DO UPDATE SET message_count = message_count + 1, last_active = CURRENT_TIMESTAMP
    `).run(groupJid, userJid);

    // Sistema de XP/Leveling
    const group = Group.get(groupJid);
    if (group?.leveling_enabled) {
        const result = Level.addXP(groupJid, userJid);
        if (result.leveledUp) {
            try {
                await sock.sendMessage(groupJid, {
                    text: `🎉 *¡Level Up!*\n\n` +
                        `@${userJid.split('@')[0]} subió al *nivel ${result.newLevel}*\n` +
                        `🏅 Rango: ${result.newRank}`,
                    mentions: [userJid],
                });
            } catch {}
        }
    }
}

/**
 * Verificar respuestas de juegos activos (gartic, enigma)
 */
async function checkGameAnswers(sock, msg, chatJid, senderJid, text) {
    try {
        // Verificar Gartic
        const { checkGarticAnswer } = await import('../plugins/games/gartic.js');
        const gartic = checkGarticAnswer(chatJid, text);
        if (gartic) {
            await sock.sendMessage(chatJid, {
                text: `🎨 *¡Correcto!* 🎉\n\n@${senderJid.split('@')[0]} adivinó la palabra: *${gartic.word}*`,
                mentions: [senderJid],
            }, { quoted: msg });
            return true;
        }

        // Verificar Enigma
        const { checkEnigmaAnswer } = await import('../plugins/games/enigma.js');
        const enigma = checkEnigmaAnswer(chatJid, text);
        if (enigma) {
            await sock.sendMessage(chatJid, {
                text: `🧩 *¡Correcto!* 🎉\n\n@${senderJid.split('@')[0]} resolvió el enigma: *${enigma.a}*`,
                mentions: [senderJid],
            }, { quoted: msg });
            return true;
        }
    } catch {}
    return false;
}
