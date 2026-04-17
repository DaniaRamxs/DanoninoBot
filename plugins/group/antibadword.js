import { reply, sendSuccess } from '../../lib/formatter.js';
import { parseToggle } from '../../lib/utils.js';
import Group from '../../database/models/Group.js';

export default {
    name: 'antipalabrotas',
    aliases: ['antibadword'],
    category: 'group',
    description: 'Elimina mensajes que contienen insultos.',
    usage: '/antipalabrotas 1 | 0',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const val = parseToggle(args[0]);
        if (val === null) return reply(sock, msg, '📋 Uso: /antipalabrotas 1 (activar) | 0 (desactivar)');

        Group.toggleAntiBadword(msg.key.remoteJid, val);
        await sendSuccess(sock, msg, `Anti-palabrotas ${val ? 'activado' : 'desactivado'}.`);
    },
};
