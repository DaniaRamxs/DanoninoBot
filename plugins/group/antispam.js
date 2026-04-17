import { reply, sendSuccess } from '../../lib/formatter.js';
import { parseToggle } from '../../lib/utils.js';
import Group from '../../database/models/Group.js';

export default {
    name: 'antispam',
    aliases: [],
    category: 'group',
    description: 'Activa protección contra mensajes largos o spam.',
    usage: '/antispam 1 | 0',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const val = parseToggle(args[0]);
        if (val === null) return reply(sock, msg, '📋 Uso: /antispam 1 (activar) | 0 (desactivar)');

        Group.toggleAntiSpam(msg.key.remoteJid, val);
        await sendSuccess(sock, msg, `Anti-spam ${val ? 'activado' : 'desactivado'}.`);
    },
};
