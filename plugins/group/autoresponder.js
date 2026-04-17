import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import { parseToggle } from '../../lib/utils.js';
import Group from '../../database/models/Group.js';
import db from '../../database/database.js';

export default {
    name: 'autorepo',
    aliases: ['crearrespuesta', 'crearrespuestaimg', 'listarrespuestas', 'eliminarrespuesta'],
    category: 'group',
    description: 'Gestiona respuestas automáticas sin prefijo.',
    usage: '/autorepo 1|0 | /crearrespuesta <trigger>|<respuesta> | /listarrespuestas | /eliminarrespuesta <trigger>',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args, { command }) {
        const chatJid = msg.key.remoteJid;

        switch (command) {
            case 'autorepo': {
                const val = parseToggle(args[0]);
                if (val === null) return reply(sock, msg, '📋 Uso: /autorepo 1 (activar) | 0 (desactivar)');
                Group.toggleAutoResponse(chatJid, val);
                await sendSuccess(sock, msg, `Respuestas automáticas ${val ? 'activadas' : 'desactivadas'}.`);
                break;
            }

            case 'crearrespuesta': {
                const text = args.join(' ');
                const parts = text.split('|').map(s => s.trim());
                if (parts.length < 2) {
                    return reply(sock, msg,
                        '📋 Uso: /crearrespuesta trigger | respuesta\n\n' +
                        'Ejemplo:\n/crearrespuesta hola | Hola! Bienvenido al grupo'
                    );
                }
                const [trigger, response] = parts;

                db.prepare(
                    'INSERT OR REPLACE INTO auto_responses (group_jid, trigger_word, response, created_by) VALUES (?, ?, ?, ?)'
                ).run(chatJid, trigger.toLowerCase(), response, msg.key.participant || msg.key.remoteJid);

                await sendSuccess(sock, msg, `Respuesta automática creada:\n📝 Trigger: "${trigger}"\n💬 Respuesta: "${response}"`);
                break;
            }

            case 'crearrespuestaimg': {
                const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const imageMsg = quoted?.imageMessage;
                if (!imageMsg) return sendError(sock, msg, 'Responde a una imagen con el comando.\nUso: /crearrespuestaimg trigger | respuesta');

                const text = args.join(' ');
                const parts = text.split('|').map(s => s.trim());
                if (parts.length < 2) {
                    return reply(sock, msg, '📋 Uso: responde a una imagen con:\n/crearrespuestaimg trigger | respuesta');
                }

                const [trigger, response] = parts;
                // Guardar sin imagen directa (se usará la referencia)
                db.prepare(
                    'INSERT OR REPLACE INTO auto_responses (group_jid, trigger_word, response, image, created_by) VALUES (?, ?, ?, ?, ?)'
                ).run(chatJid, trigger.toLowerCase(), response, 'quoted_image', msg.key.participant || msg.key.remoteJid);

                await sendSuccess(sock, msg, `Respuesta automática con imagen creada:\n📝 Trigger: "${trigger}"\n💬 Respuesta: "${response}"\n🖼️ Con imagen adjunta`);
                break;
            }

            case 'listarrespuestas': {
                const responses = db.prepare(
                    'SELECT trigger_word, response FROM auto_responses WHERE group_jid = ?'
                ).all(chatJid);

                if (!responses.length) return reply(sock, msg, '📋 No hay respuestas automáticas en este grupo.');

                let text = '📋 *Respuestas automáticas:*\n\n';
                responses.forEach((r, i) => {
                    text += `${i + 1}. *"${r.trigger_word}"* → ${r.response}\n`;
                });

                await reply(sock, msg, text);
                break;
            }

            case 'eliminarrespuesta': {
                const trigger = args.join(' ').toLowerCase().trim();
                if (!trigger) return sendError(sock, msg, 'Escribe el trigger a eliminar.\nEj: /eliminarrespuesta hola');

                const result = db.prepare(
                    'DELETE FROM auto_responses WHERE group_jid = ? AND trigger_word = ?'
                ).run(chatJid, trigger);

                if (result.changes === 0) return sendError(sock, msg, 'No se encontró esa respuesta automática.');
                await sendSuccess(sock, msg, `Respuesta automática "${trigger}" eliminada.`);
                break;
            }
        }
    },
};
