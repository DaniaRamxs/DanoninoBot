import db from '../database.js';
import settings from '../../config/settings.js';

/** Lista de rangos por nivel */
const RANKS = [
    { min: 1,  max: 5,   name: '🌱 Novato' },
    { min: 6,  max: 10,  name: '🌿 Aprendiz' },
    { min: 11, max: 15,  name: '🍀 Explorador' },
    { min: 16, max: 20,  name: '⭐ Aventurero' },
    { min: 21, max: 25,  name: '🌟 Guerrero' },
    { min: 26, max: 30,  name: '💫 Veterano' },
    { min: 31, max: 35,  name: '🔥 Elite' },
    { min: 36, max: 40,  name: '⚡ Campeón' },
    { min: 41, max: 50,  name: '👑 Maestro' },
    { min: 51, max: 60,  name: '🏆 Gran Maestro' },
    { min: 61, max: 70,  name: '💎 Leyenda' },
    { min: 71, max: 80,  name: '🐉 Mítico' },
    { min: 81, max: 90,  name: '🌌 Cósmico' },
    { min: 91, max: 100, name: '🪐 Divino' },
];

const Level = {
    /** Obtener o crear datos de nivel */
    getOrCreate(groupJid, userJid) {
        let data = db.prepare(
            'SELECT * FROM levels WHERE group_jid = ? AND user_jid = ?'
        ).get(groupJid, userJid);
        if (!data) {
            db.prepare(
                'INSERT INTO levels (group_jid, user_jid) VALUES (?, ?)'
            ).run(groupJid, userJid);
            data = db.prepare(
                'SELECT * FROM levels WHERE group_jid = ? AND user_jid = ?'
            ).get(groupJid, userJid);
        }
        return data;
    },

    /** Obtener datos de nivel */
    get(groupJid, userJid) {
        return db.prepare(
            'SELECT * FROM levels WHERE group_jid = ? AND user_jid = ?'
        ).get(groupJid, userJid);
    },

    /**
     * Agregar XP y verificar si sube de nivel
     * Retorna { xpGained, leveledUp, newLevel, newRank } o null si leveling está desactivado
     */
    addXP(groupJid, userJid) {
        const data = this.getOrCreate(groupJid, userJid);
        const { min, max } = settings.leveling.xpPerMessage;
        const xpGained = Math.floor(Math.random() * (max - min + 1)) + min;

        const newXP = data.xp + xpGained;
        const xpNeeded = this.xpForLevel(data.level + 1);
        let leveledUp = false;
        let newLevel = data.level;

        if (newXP >= xpNeeded) {
            newLevel = data.level + 1;
            leveledUp = true;
            db.prepare(
                'UPDATE levels SET xp = ?, level = ?, messages = messages + 1 WHERE group_jid = ? AND user_jid = ?'
            ).run(newXP - xpNeeded, newLevel, groupJid, userJid);
        } else {
            db.prepare(
                'UPDATE levels SET xp = ?, messages = messages + 1 WHERE group_jid = ? AND user_jid = ?'
            ).run(newXP, groupJid, userJid);
        }

        return {
            xpGained,
            leveledUp,
            newLevel,
            newRank: this.getRank(newLevel),
            currentXP: leveledUp ? newXP - xpNeeded : newXP,
            xpNeeded: this.xpForLevel(newLevel + 1),
        };
    },

    /** Calcular XP necesario para un nivel */
    xpForLevel(level) {
        return settings.leveling.xpPerLevel * level;
    },

    /** Obtener rango según nivel */
    getRank(level) {
        for (const rank of RANKS) {
            if (level >= rank.min && level <= rank.max) return rank.name;
        }
        return '🪐 Divino';
    },

    /** Ranking del grupo por nivel */
    getGroupRanking(groupJid, limit = 10) {
        return db.prepare(
            'SELECT user_jid, xp, level, messages FROM levels WHERE group_jid = ? ORDER BY level DESC, xp DESC LIMIT ?'
        ).all(groupJid, limit);
    },

    /** Obtener todos los rangos disponibles */
    getAllRanks() {
        return RANKS;
    },

    /** Resetear niveles de todos */
    resetAll() {
        db.prepare('DELETE FROM levels').run();
    },

    /** Resetear niveles de un grupo */
    resetGroup(groupJid) {
        db.prepare('DELETE FROM levels WHERE group_jid = ?').run(groupJid);
    },
};

export default Level;
