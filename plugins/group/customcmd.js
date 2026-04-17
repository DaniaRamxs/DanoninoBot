import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import db from '../../database/database.js';

export default {
    name: 'crearcomando',
    aliases: ['eliminarcomando', 'menunuevo'],
    category: 'group',
    description: 'Crea/elimina comandos personalizados para el bot.',
    usage: '/crearcomando <nombre>|<respuesta> | /eliminarcomando <nombre> | /menunuevo',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args, { command, prefix }) {
        const chatJid = msg.key.remoteJid;

        switch (command) {
            case 'crearcomando': {
                const text = args.join(' ');
                const parts = text.split('|').map(s => s.trim());
                if (parts.length < 2) {
                    return reply(sock, msg,
                        '📋 Uso: /crearcomando nombre | respuesta\n\n' +
                        'Ejemplo:\n/crearcomando horario | Lunes a viernes de 9am a 5pm'
                    );
                }

                const [cmdName, response] = parts;
                const cleanName = cmdName.toLowerCase().replace(/\s/g, '');

                try {
                    db.prepare(
                        'INSERT OR REPLACE INTO custom_commands (group_jid, command, response, created_by) VALUES (?, ?, ?, ?)'
                    ).run(chatJid, cleanName, response, msg.key.participant || msg.key.remoteJid);

                    await sendSuccess(sock, msg, `Comando personalizado creado:\n📝 ${prefix}${cleanName}\n💬 ${response}`);
                } catch (err) {
                    await sendError(sock, msg, 'Error creando el comando.');
                }
                break;
            }

            case 'eliminarcomando': {
                const cmdName = args.join(' ').toLowerCase().trim();
                if (!cmdName) return sendError(sock, msg, 'Escribe el nombre del comando.\nEj: /eliminarcomando horario');

                const result = db.prepare(
                    'DELETE FROM custom_commands WHERE group_jid = ? AND command = ?'
                ).run(chatJid, cmdName);

                if (result.changes === 0) return sendError(sock, msg, 'No se encontró ese comando.');
                await sendSuccess(sock, msg, `Comando "${cmdName}" eliminado.`);
                break;
            }

            case 'menunuevo': {
                const cmds = db.prepare(
                    'SELECT command, response FROM custom_commands WHERE group_jid = ?'
                ).all(chatJid);

                if (!cmds.length) return reply(sock, msg, '📋 No hay comandos personalizados en este grupo.\nUsa /crearcomando para crear uno.');

                let text = '╭━━⸻⌔∎\n';
                text += '┃ 📋 *Comandos Personalizados*\n';
                text += '╰━━━━━─⌔∎\n\n';

                cmds.forEach((c, i) => {
                    text += `❑ ${prefix}${c.command}\n`;
                    text += `> ${c.response.substring(0, 50)}${c.response.length > 50 ? '...' : ''}\n`;
                });

                await reply(sock, msg, text);
                break;
            }
        }
    },
};
