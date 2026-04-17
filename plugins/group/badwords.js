import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import db from '../../database/database.js';

export default {
    name: 'addpalabra',
    aliases: ['delpalabra', 'listapalabra'],
    category: 'group',
    description: 'Gestiona la lista de palabrotas del grupo.',
    usage: '/addpalabra <palabra> | /delpalabra <palabra> | /listapalabra',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args, { command }) {
        const chatJid = msg.key.remoteJid;

        if (command === 'listapalabra') {
            const words = db.prepare('SELECT word FROM badwords WHERE group_jid = ?').all(chatJid);
            if (!words.length) return reply(sock, msg, '📋 No hay palabras prohibidas en este grupo.');

            let text = '🚫 *Palabras prohibidas:*\n\n';
            words.forEach((w, i) => { text += `${i + 1}. ${w.word}\n`; });
            return reply(sock, msg, text);
        }

        const word = args.join(' ').toLowerCase().trim();
        if (!word) return sendError(sock, msg, `Escribe la palabra.\nEj: /${command} palabra`);

        if (command === 'addpalabra') {
            try {
                db.prepare('INSERT INTO badwords (group_jid, word) VALUES (?, ?)').run(chatJid, word);
                await sendSuccess(sock, msg, `Palabra "${word}" añadida a la lista.`);
            } catch {
                await sendError(sock, msg, 'Esa palabra ya está en la lista.');
            }
        } else if (command === 'delpalabra') {
            const result = db.prepare('DELETE FROM badwords WHERE group_jid = ? AND word = ?').run(chatJid, word);
            if (result.changes === 0) return sendError(sock, msg, 'Esa palabra no está en la lista.');
            await sendSuccess(sock, msg, `Palabra "${word}" eliminada de la lista.`);
        }
    },
};
