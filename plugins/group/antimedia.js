import { reply, sendSuccess } from '../../lib/formatter.js';
import { parseToggle } from '../../lib/utils.js';
import Group from '../../database/models/Group.js';

const mediaTypes = {
    antiimg:       { field: 'toggleAntiImage',     label: 'Anti-imágenes' },
    antivideo:     { field: 'toggleAntiVideo',     label: 'Anti-videos' },
    antiaudio:     { field: 'toggleAntiAudio',     label: 'Anti-audios' },
    antisticker:   { field: 'toggleAntiSticker',   label: 'Anti-stickers' },
    antiloc:       { field: 'toggleAntiLocation',  label: 'Anti-localizaciones' },
    anticontacto:  { field: 'toggleAntiContact',   label: 'Anti-contactos' },
    antidoc:       { field: 'toggleAntiDocument',  label: 'Anti-documentos' },
    antinotas:     { field: 'toggleAntiVoicenote', label: 'Anti-notas de voz' },
    anticatalogo:  { field: 'toggleAntiCatalog',   label: 'Anti-catálogos' },
};

export default {
    name: 'antiimg',
    aliases: Object.keys(mediaTypes).filter(k => k !== 'antiimg'),
    category: 'group',
    description: 'Bloquea tipos de media (imágenes, videos, audios, stickers, etc.)',
    usage: '/antiimg 1 | 0 (también: /antivideo, /antiaudio, /antisticker, /antiloc, /anticontacto, /antidoc, /antinotas, /anticatalogo)',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args, { command }) {
        const val = parseToggle(args[0]);
        if (val === null) return reply(sock, msg, `📋 Uso: /${command} 1 (activar) | 0 (desactivar)`);

        const config = mediaTypes[command];
        if (!config) return;

        Group[config.field](msg.key.remoteJid, val);
        await sendSuccess(sock, msg, `${config.label} ${val ? 'activado' : 'desactivado'}.`);
    },
};
