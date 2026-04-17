import { reply, sendSuccess } from '../../lib/formatter.js';
import { parseToggle } from '../../lib/utils.js';
import Group from '../../database/models/Group.js';

export default {
    name: 'antifacke',
    aliases: ['antifake'],
    category: 'group',
    description: 'Bloquea números fuera de país / desconocidos.',
    usage: '/antifacke 1 | 0',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const val = parseToggle(args[0]);
        if (val === null) return reply(sock, msg, '📋 Uso: /antifacke 1 (activar) | 0 (desactivar)');

        Group.toggleAntiFake(msg.key.remoteJid, val);
        await sendSuccess(sock, msg, `Anti-fake ${val ? 'activado' : 'desactivado'}.`);
    },
};
