import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import Group from '../../database/models/Group.js';

export default {
    name: 'limiteglobal',
    aliases: [],
    category: 'group',
    description: 'Establece cuántos caracteres largos tolera el grupo.',
    usage: '/limiteglobal <número>',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const num = parseInt(args[0]);
        if (!num || num < 50 || num > 10000) {
            return sendError(sock, msg, 'Ingresa un número entre 50 y 10000.');
        }

        Group.setSpamLimit(msg.key.remoteJid, num);
        await sendSuccess(sock, msg, `Límite de caracteres establecido en *${num}*.`);
    },
};
