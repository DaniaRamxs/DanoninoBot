import { sendError } from '../../lib/formatter.js';
import { getGroupParticipants } from '../../lib/permissions.js';

export default {
    name: 'todos',
    aliases: ['tagall', 'mentodos'],
    category: 'group',
    description: 'Mención pública a todos.',
    usage: '/todos [mensaje]',
    cooldown: 10,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const chatJid = msg.key.remoteJid;
        const participants = await getGroupParticipants(sock, chatJid);
        const message = args.join(' ') || '📢 Atención a todos';

        let text = `${message}\n\n`;
        participants.forEach(p => {
            text += `@${p.split('@')[0]}\n`;
        });

        await sock.sendMessage(chatJid, {
            text,
            mentions: participants,
        }, { quoted: msg });
    },
};
