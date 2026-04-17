import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import Group from '../../database/models/Group.js';

export default {
    name: 'reglas',
    aliases: ['rules', 'setreglas'],
    category: 'group',
    description: 'Muestra o establece reglas del grupo.',
    usage: '/reglas | /setreglas <texto>',
    cooldown: 5,
    groupOnly: true,

    async execute(sock, msg, args, { command }) {
        const chatJid = msg.key.remoteJid;

        if (command === 'setreglas') {
            // Solo admins pueden establecer reglas
            const { isAdmin } = await import('../../lib/permissions.js');
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const adminCheck = await isAdmin(sock, chatJid, senderJid);
            if (!adminCheck) return sendError(sock, msg, 'Solo los admins pueden cambiar las reglas.');

            const text = args.join(' ');
            if (!text) return sendError(sock, msg, 'Escribe las reglas.\nEj: /setreglas 1. No spam 2. Respetar');

            Group.setRules(chatJid, text);
            await sendSuccess(sock, msg, 'Reglas del grupo actualizadas.');
            return;
        }

        // Mostrar reglas
        const group = Group.get(chatJid);
        if (!group?.rules) return reply(sock, msg, '📋 Este grupo no tiene reglas configuradas.\nUsa /setreglas <texto> para establecerlas.');

        let text = `╭━━⸻⌔∎\n`;
        text += `┃ 📋 *Reglas del grupo*\n`;
        text += `╰━━━━━─⌔∎\n\n`;
        text += group.rules;

        await reply(sock, msg, text);
    },
};
