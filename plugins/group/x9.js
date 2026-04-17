import { reply, sendSuccess } from '../../lib/formatter.js';
import { parseToggle } from '../../lib/utils.js';
import Group from '../../database/models/Group.js';

const x9Commands = {
    x9:              { field: 'toggleX9',          label: 'Alertas de promote/demote (x9)' },
    x9vistaunica:    { field: 'toggleX9ViewOnce',  label: 'Ver mensajes de vista única' },
    odelete:         { field: 'set',               label: 'Borrar mensajes prohibidos' },
};

export default {
    name: 'x9',
    aliases: ['x9vistaunica', 'odelete', 'revelar'],
    category: 'group',
    description: 'Activar alertas de promote, demote y otros cambios (x9).',
    usage: '/x9 1|0 | /x9vistaunica 1|0 | /odelete 1|0 | /revelar 1|0',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args, { command }) {
        // /revelar es alias de x9vistaunica
        if (command === 'revelar') {
            const val = parseToggle(args[0]);
            if (val === null) return reply(sock, msg, '📋 Uso: /revelar 1 (activar) | 0 (desactivar)');
            Group.toggleX9ViewOnce(msg.key.remoteJid, val);
            await sendSuccess(sock, msg, `Revelar vista única ${val ? 'activado' : 'desactivado'}.`);
            return;
        }

        const val = parseToggle(args[0]);
        if (val === null) return reply(sock, msg, `📋 Uso: /${command} 1 (activar) | 0 (desactivar)`);

        if (command === 'odelete') {
            Group.set(msg.key.remoteJid, 'odelete', val ? 1 : 0);
            await sendSuccess(sock, msg, `Borrar mensajes tras expulsión ${val ? 'activado' : 'desactivado'}.`);
            return;
        }

        const config = x9Commands[command];
        if (config) {
            Group[config.field](msg.key.remoteJid, val);
            await sendSuccess(sock, msg, `${config.label} ${val ? 'activado' : 'desactivado'}.`);
        }
    },
};
