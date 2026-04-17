import { reply, sendSuccess } from '../../lib/formatter.js';
import { parseToggle } from '../../lib/utils.js';
import Group from '../../database/models/Group.js';

const modos = {
    leveling:       { field: 'toggleLeveling',   label: 'Sistema de XP, rangos y niveles' },
    modonsfw:       { field: 'toggleNSFW',       label: 'Contenido +18' },
    modorpg:        { field: 'toggleRPG',        label: 'Juegos de economía' },
    modobrincadera: { field: 'toggleFun',        label: 'Juegos de diversión' },
    modoadmin:      { field: 'toggleAdminOnly',   label: 'Solo admins usan comandos' },
};

export default {
    name: 'leveling',
    aliases: Object.keys(modos).filter(k => k !== 'leveling'),
    category: 'group',
    description: 'Activa/desactiva modos del grupo (leveling, nsfw, rpg, diversión, admin-only).',
    usage: '/leveling 1|0 | /modonsfw 1|0 | /modorpg 1|0 | /modobrincadera 1|0 | /modoadmin 1|0',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args, { command }) {
        const val = parseToggle(args[0]);
        if (val === null) return reply(sock, msg, `📋 Uso: /${command} 1 (activar) | 0 (desactivar)`);

        const config = modos[command];
        if (!config) return;

        Group[config.field](msg.key.remoteJid, val);
        await sendSuccess(sock, msg, `${config.label} ${val ? 'activado' : 'desactivado'}.`);
    },
};
