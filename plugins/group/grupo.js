import { reply, sendError, sendSuccess } from '../../lib/formatter.js';

export default {
    name: 'grupo',
    aliases: ['group', 'abrir', 'cerrar'],
    category: 'group',
    description: 'Abre o cierra el grupo.',
    usage: '/grupo abrir | cerrar',
    cooldown: 5,
    groupOnly: true,
    adminOnly: true,
    botAdminRequired: true,

    async execute(sock, msg, args, { command }) {
        const chatJid = msg.key.remoteJid;
        let action = args[0]?.toLowerCase();

        // Si usaron el alias directamente
        if (command === 'abrir') action = 'abrir';
        if (command === 'cerrar') action = 'cerrar';

        if (!action || !['abrir', 'cerrar', 'open', 'close'].includes(action)) {
            return reply(sock, msg, '📋 Uso: /grupo abrir | cerrar');
        }

        const open = ['abrir', 'open'].includes(action);

        try {
            await sock.groupSettingUpdate(chatJid, open ? 'not_announcement' : 'announcement');
            await sendSuccess(sock, msg, open
                ? 'El grupo ha sido *abierto*. Todos pueden enviar mensajes.'
                : 'El grupo ha sido *cerrado*. Solo admins pueden enviar mensajes.');
        } catch {
            await sendError(sock, msg, 'No se pudo cambiar la configuración del grupo.');
        }
    },
};
