import db from '../database.js';

const Economy = {
    /** Obtener o crear cuenta económica */
    getOrCreate(jid) {
        let eco = db.prepare('SELECT * FROM economy WHERE user_jid = ?').get(jid);
        if (!eco) {
            db.prepare('INSERT INTO economy (user_jid) VALUES (?)').run(jid);
            eco = db.prepare('SELECT * FROM economy WHERE user_jid = ?').get(jid);
        }
        return eco;
    },

    /** Obtener balance */
    get(jid) {
        return this.getOrCreate(jid);
    },

    /** Agregar dinero a billetera */
    addWallet(jid, amount) {
        this.getOrCreate(jid);
        db.prepare('UPDATE economy SET wallet = wallet + ?, total_earned = total_earned + ? WHERE user_jid = ?')
            .run(amount, Math.max(0, amount), jid);
    },

    /** Quitar dinero de billetera */
    removeWallet(jid, amount) {
        db.prepare('UPDATE economy SET wallet = MAX(0, wallet - ?), total_spent = total_spent + ? WHERE user_jid = ?')
            .run(amount, amount, jid);
    },

    /** Depositar al banco */
    deposit(jid, amount) {
        const eco = this.getOrCreate(jid);
        if (eco.wallet < amount) return false;
        db.prepare('UPDATE economy SET wallet = wallet - ?, bank = bank + ? WHERE user_jid = ?')
            .run(amount, amount, jid);
        return true;
    },

    /** Retirar del banco */
    withdraw(jid, amount) {
        const eco = this.getOrCreate(jid);
        if (eco.bank < amount) return false;
        db.prepare('UPDATE economy SET wallet = wallet + ?, bank = bank - ? WHERE user_jid = ?')
            .run(amount, amount, jid);
        return true;
    },

    /** Transferir dinero entre usuarios */
    transfer(fromJid, toJid, amount) {
        const from = this.getOrCreate(fromJid);
        if (from.wallet < amount) return false;
        this.removeWallet(fromJid, amount);
        this.addWallet(toJid, amount);
        return true;
    },

    /** Verificar y actualizar cooldown. Retorna ms restantes o 0 si disponible */
    checkCooldown(jid, field, cooldownMs) {
        const eco = this.getOrCreate(jid);
        const last = eco[field];
        if (!last) return 0;
        const elapsed = Date.now() - new Date(last).getTime();
        if (elapsed < cooldownMs) return cooldownMs - elapsed;
        return 0;
    },

    /** Establecer timestamp de cooldown */
    setCooldown(jid, field) {
        db.prepare(`UPDATE economy SET ${field} = ? WHERE user_jid = ?`)
            .run(new Date().toISOString(), jid);
    },

    /** Ranking global por riqueza total (wallet + bank) */
    getRichRanking(limit = 10) {
        return db.prepare(
            'SELECT user_jid, wallet, bank, (wallet + bank) as total FROM economy ORDER BY total DESC LIMIT ?'
        ).all(limit);
    },

    /** Establecer daily */
    setDaily(jid) {
        db.prepare('UPDATE economy SET last_daily = ? WHERE user_jid = ?')
            .run(new Date().toISOString().split('T')[0], jid);
    },

    /** Verificar si ya reclamó daily hoy */
    canClaimDaily(jid) {
        const eco = this.getOrCreate(jid);
        if (!eco.last_daily) return true;
        const today = new Date().toISOString().split('T')[0];
        return eco.last_daily !== today;
    },
};

export default Economy;
