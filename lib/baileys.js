import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    Browsers,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { existsSync, mkdirSync } from 'fs';
import qrcode from 'qrcode-terminal';
import settings from '../config/settings.js';

const logger = pino({ level: 'silent' });

/** Store simple para getMessage (evita error 428) */
const msgStore = new Map();
const MAX_STORE = 5000;

function addToStore(msg) {
    if (!msg.key?.id) return;
    msgStore.set(msg.key.id, msg.message);
    if (msgStore.size > MAX_STORE) {
        const first = msgStore.keys().next().value;
        msgStore.delete(first);
    }
}

/**
 * Crear conexión con WhatsApp usando Baileys
 */
export async function startBot(onMessage, onGroupUpdate) {
    const sessionDir = settings.paths.sessions;
    if (!existsSync(sessionDir)) mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: false,
        logger,
        browser: Browsers.ubuntu('Chrome'),
        generateHighQualityLinkPreview: false,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        retryRequestDelayMs: 2000,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        getMessage: async (key) => {
            // Intentar obtener del store para evitar error 428
            const stored = msgStore.get(key.id);
            if (stored) return stored;
            return { conversation: '' };
        },
    });

    // ═══ Evento: Actualización de conexión ═══
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n╔═══════════════════════════════════╗');
            console.log('║   Escanea el QR con WhatsApp     ║');
            console.log('╚═══════════════════════════════════╝\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.log('\n╔═══════════════════════════════════╗');
            console.log(`║  ${settings.botName} conectado!         ║`);
            console.log('╚═══════════════════════════════════╝\n');
            console.log(`🤖 Bot: ${settings.botName}`);
            console.log(`👑 Owner: ${settings.ownerNumber}`);
            console.log(`📌 Prefijo: ${settings.defaultPrefix}`);
            console.log('─'.repeat(35));
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log(`❌ Conexión cerrada. Código: ${statusCode}`);

            if (statusCode === DisconnectReason.loggedOut) {
                console.log('🚪 Sesión cerrada. Eliminando sesión y generando nuevo QR...');
                const { rmSync } = await import('fs');
                try { rmSync(sessionDir, { recursive: true, force: true }); } catch {}
                setTimeout(() => startBot(onMessage, onGroupUpdate), 2000);
            } else if (statusCode === 428) {
                // Error de precondición - esperar más tiempo antes de reconectar
                console.log('🔄 Error 428. Reconectando en 10 segundos...');
                setTimeout(() => startBot(onMessage, onGroupUpdate), 10000);
            } else if (statusCode === 515) {
                // Reinicio del stream - reconectar rápido
                console.log('🔄 Stream reiniciado. Reconectando...');
                setTimeout(() => startBot(onMessage, onGroupUpdate), 3000);
            } else if (statusCode === 503) {
                // Servicio no disponible - esperar
                console.log('🔄 Servicio no disponible. Reconectando en 15 segundos...');
                setTimeout(() => startBot(onMessage, onGroupUpdate), 15000);
            } else {
                // Otros errores - reconectar normal
                console.log('🔄 Reconectando en 5 segundos...');
                setTimeout(() => startBot(onMessage, onGroupUpdate), 5000);
            }
        }
    });

    // ═══ Guardar credenciales ═══
    sock.ev.on('creds.update', saveCreds);

    // ═══ Mensajes entrantes ═══
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            // Guardar en store para getMessage
            addToStore(msg);

            // Ignorar mensajes propios, estados y reacciones
            if (msg.key.fromMe) continue;
            if (msg.key.remoteJid === 'status@broadcast') continue;
            if (msg.message?.reactionMessage) continue;
            if (msg.message?.protocolMessage) continue;

            try {
                await onMessage(sock, msg);
            } catch (err) {
                console.error('Error procesando mensaje:', err.message);
            }
        }
    });

    // ═══ Historial de mensajes (para el store) ═══
    sock.ev.on('messaging-history.set', ({ messages }) => {
        for (const msg of messages) {
            addToStore(msg);
        }
    });

    // ═══ Participantes del grupo ═══
    sock.ev.on('group-participants.update', async (update) => {
        try {
            if (onGroupUpdate) await onGroupUpdate(sock, update);
        } catch (err) {
            console.error('Error en evento de grupo:', err.message);
        }
    });

    // ═══ Anti-llamadas ═══
    sock.ev.on('call', async (calls) => {
        if (!settings.antiCallMode) return;
        for (const call of calls) {
            if (call.status === 'offer') {
                console.log(`📵 Llamada bloqueada de: ${call.from}`);
                try {
                    await sock.rejectCall(call.id, call.from);
                    await sock.sendMessage(call.from, {
                        text: `${settings.emojis.warning} Las llamadas al bot están desactivadas.`,
                    });
                } catch {}
            }
        }
    });

    // ═══ Auto-read ═══
    if (settings.autoRead) {
        sock.ev.on('messages.upsert', async ({ messages }) => {
            for (const msg of messages) {
                if (!msg.key.fromMe) {
                    try { await sock.readMessages([msg.key]); } catch {}
                }
            }
        });
    }

    return sock;
}
