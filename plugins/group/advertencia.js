import { reply, sendSuccess } from '../../lib/formatter.js';
import { parseToggle } from '../../lib/utils.js';
import Group from '../../database/models/Group.js';

export default {
    name: 'advertencia',
    aliases: ['warningmode'],
    category: 'group',
    description: 'En vez de expulsar, pone advertencia a infractores.',
    usage: '/advertencia 1 | 0',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const val = parseToggle(args[0]);
        if (val === null) return reply(sock, msg, '📋 Uso: /advertencia 1 (activar) | 0 (desactivar)');

        Group.toggleWarningMode(msg.key.remoteJid, val);
        await sendSuccess(sock, msg, `Modo advertencia ${val ? 'activado (se advertirá antes de expulsar)' : 'desactivado (acción directa)'}.`);
    },
};
