import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import Group from '../../database/models/Group.js';

export default {
    name: 'ausente',
    aliases: ['afk', 'activo'],
    category: 'group',
    description: 'Crea mensaje automático de ausencia / quita ausencia.',
    usage: '/ausente <motivo> | /activo',
    cooldown: 5,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args, { command }) {
        const chatJid = msg.key.remoteJid;

        if (command === 'activo') {
            Group.set(chatJid, 'absence_mode', 0);
            Group.set(chatJid, 'absence_message', '');
            await sendSuccess(sock, msg, 'Modo ausencia desactivado. Estás activo de nuevo.');
            return;
        }

        const reason = args.join(' ') || 'Estoy ausente, responderé luego.';
        Group.set(chatJid, 'absence_mode', 1);
        Group.set(chatJid, 'absence_message', reason);
        await sendSuccess(sock, msg, `Modo ausencia activado.\n📋 Motivo: ${reason}\n\nUsa /activo para desactivar.`);
    },
};
