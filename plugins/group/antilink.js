import { reply, sendSuccess } from '../../lib/formatter.js';
import { parseToggle } from '../../lib/utils.js';
import Group from '../../database/models/Group.js';

export default {
    name: 'antilinkgp',
    aliases: ['antilink'],
    category: 'group',
    description: 'Bloquea solo enlaces de WhatsApp.',
    usage: '/antilinkgp 1 | 0',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const val = parseToggle(args[0]);
        if (val === null) return reply(sock, msg, '📋 Uso: /antilinkgp 1 (activar) | 0 (desactivar)');

        Group.toggleAntiLink(msg.key.remoteJid, val);
        await sendSuccess(sock, msg, `Anti-link WhatsApp ${val ? 'activado' : 'desactivado'}.`);
    },
};
