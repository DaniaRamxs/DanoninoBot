import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import { parseToggle } from '../../lib/utils.js';
import Group from '../../database/models/Group.js';

export default {
    name: 'multiprefijo',
    aliases: ['addprefijo', 'delprefijo'],
    category: 'group',
    description: 'Permite múltiples prefijos (ej: # . ! / @).',
    usage: '/multiprefijo 1|0 | /addprefijo <prefijo> | /delprefijo <prefijo>',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args, { command }) {
        const chatJid = msg.key.remoteJid;

        switch (command) {
            case 'multiprefijo': {
                const val = parseToggle(args[0]);
                if (val === null) return reply(sock, msg, '📋 Uso: /multiprefijo 1 (activar) | 0 (desactivar)');

                Group.set(chatJid, 'multi_prefix', val ? 1 : 0);
                await sendSuccess(sock, msg, `Multi-prefijo ${val ? 'activado (/, !, #, ., @)' : 'desactivado (solo prefijo por defecto)'}.`);
                break;
            }

            case 'addprefijo': {
                const prefix = args[0];
                if (!prefix || prefix.length > 3) return sendError(sock, msg, 'Escribe un prefijo válido (1-3 caracteres).\nEj: /addprefijo #');

                const group = Group.getOrCreate(chatJid);
                let extras;
                try { extras = JSON.parse(group.extra_prefixes || '[]'); } catch { extras = []; }

                if (extras.includes(prefix)) return sendError(sock, msg, 'Ese prefijo ya está agregado.');

                extras.push(prefix);
                Group.set(chatJid, 'extra_prefixes', JSON.stringify(extras));
                await sendSuccess(sock, msg, `Prefijo "${prefix}" añadido.\nPrefijos extra: ${extras.join(', ')}`);
                break;
            }

            case 'delprefijo': {
                const prefix = args[0];
                if (!prefix) return sendError(sock, msg, 'Escribe el prefijo a quitar.\nEj: /delprefijo #');

                const group = Group.getOrCreate(chatJid);
                let extras;
                try { extras = JSON.parse(group.extra_prefixes || '[]'); } catch { extras = []; }

                const idx = extras.indexOf(prefix);
                if (idx === -1) return sendError(sock, msg, 'Ese prefijo no está en la lista.');

                extras.splice(idx, 1);
                Group.set(chatJid, 'extra_prefixes', JSON.stringify(extras));
                await sendSuccess(sock, msg, `Prefijo "${prefix}" eliminado.\nPrefijos extra: ${extras.length ? extras.join(', ') : 'ninguno'}`);
                break;
            }
        }
    },
};
