import { reply, sendSuccess } from '../../lib/formatter.js';
import { parseToggle } from '../../lib/utils.js';
import Group from '../../database/models/Group.js';

export default {
    name: 'antilinkhard',
    aliases: [],
    category: 'group',
    description: 'Bloquea cualquier enlace.',
    usage: '/antilinkhard 1 | 0',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const val = parseToggle(args[0]);
        if (val === null) return reply(sock, msg, '📋 Uso: /antilinkhard 1 (activar) | 0 (desactivar)');

        Group.toggleAntiLinkHard(msg.key.remoteJid, val);
        await sendSuccess(sock, msg, `Anti-link total ${val ? 'activado' : 'desactivado'}.`);
    },
};
