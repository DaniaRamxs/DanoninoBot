import { reply, sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid } from '../../lib/utils.js';
import db from '../../database/database.js';
import { readFileSync } from 'fs';

const characters = JSON.parse(readFileSync('./data/characters.json', 'utf8'));

export default {
    name: 'claim',
    aliases: ['reclamar'],
    category: 'gacha',
    description: 'Reclamar un personaje.',
    usage: '/claim <id>',
    cooldown: 5,

    async execute(sock, msg, args) {
        const senderJid = getSenderJid(msg);
        const charId = parseInt(args[0]);

        if (!charId) return sendError(sock, msg, 'Escribe el ID del personaje.\nPrimero usa /rw para ver un personaje.');

        const char = characters.find(c => c.id === charId);
        if (!char) return sendError(sock, msg, 'Personaje no encontrado.');

        // Verificar si ya lo tiene
        const existing = db.prepare(
            'SELECT 1 FROM gacha_collection WHERE user_jid = ? AND character_id = ?'
        ).get(senderJid, charId);

        if (existing) return sendError(sock, msg, 'Ya tienes este personaje.');

        // Verificar límite (máx 50 personajes)
        const count = db.prepare('SELECT COUNT(*) as c FROM gacha_collection WHERE user_jid = ?').get(senderJid).c;
        if (count >= 50) return sendError(sock, msg, 'Tu harén está lleno (máx 50). Vende o elimina personajes.');

        db.prepare(
            'INSERT INTO gacha_collection (user_jid, character_id, character_name, character_image, rarity, value) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(senderJid, char.id, char.name, char.image, char.rarity, char.value);

        await sendSuccess(sock, msg, `Reclamaste a *${char.name}* (${char.rarity}) de ${char.anime}!`);
    },
};
