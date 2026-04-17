import { reply, sendSuccess } from '../../lib/formatter.js';
import { parseToggle } from '../../lib/utils.js';
import Group from '../../database/models/Group.js';

export default {
    name: 'welcome',
    aliases: [],
    category: 'group',
    description: 'Activa bienvenida con imagen.',
    usage: '/welcome 1 | 0',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const val = parseToggle(args[0]);
        if (val === null) return reply(sock, msg, '📋 Uso: /welcome 1 (activar) | 0 (desactivar)');

        Group.toggleWelcome(msg.key.remoteJid, val);
        if (val) Group.toggleWelcome2(msg.key.remoteJid, false); // desactivar la otra
        await sendSuccess(sock, msg, `Bienvenida con imagen ${val ? 'activada' : 'desactivada'}.`);
    },
};
