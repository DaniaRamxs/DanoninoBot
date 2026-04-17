import db from '../database.js';

const User = {
    /** Obtener o crear usuario */
    getOrCreate(jid, name = '') {
        let user = db.prepare('SELECT * FROM users WHERE jid = ?').get(jid);
        if (!user) {
            db.prepare('INSERT INTO users (jid, name) VALUES (?, ?)').run(jid, name);
            user = db.prepare('SELECT * FROM users WHERE jid = ?').get(jid);
        }
        return user;
    },

    /** Obtener usuario */
    get(jid) {
        return db.prepare('SELECT * FROM users WHERE jid = ?').get(jid);
    },

    /** Actualizar campo del perfil */
    update(jid, field, value) {
        const allowed = ['name', 'description', 'gender', 'birthday', 'blocked'];
        if (!allowed.includes(field)) return false;
        db.prepare(`UPDATE users SET ${field} = ? WHERE jid = ?`).run(value, jid);
        return true;
    },

    /** Establecer descripción */
    setDescription(jid, desc) {
        this.getOrCreate(jid);
        return this.update(jid, 'description', desc);
    },

    /** Eliminar descripción */
    deleteDescription(jid) {
        return this.update(jid, 'description', null);
    },

    /** Establecer género */
    setGender(jid, gender) {
        this.getOrCreate(jid);
        return this.update(jid, 'gender', gender);
    },

    /** Eliminar género */
    deleteGender(jid) {
        return this.update(jid, 'gender', null);
    },

    /** Establecer cumpleaños */
    setBirthday(jid, birthday) {
        this.getOrCreate(jid);
        return this.update(jid, 'birthday', birthday);
    },

    /** Eliminar cumpleaños */
    deleteBirthday(jid) {
        return this.update(jid, 'birthday', null);
    },

    /** Bloquear usuario */
    block(jid) {
        this.getOrCreate(jid);
        return this.update(jid, 'blocked', 1);
    },

    /** Desbloquear usuario */
    unblock(jid) {
        return this.update(jid, 'blocked', 0);
    },

    /** Verificar si está bloqueado */
    isBlocked(jid) {
        const user = this.get(jid);
        return user?.blocked === 1;
    },

    /** Eliminar todos los perfiles */
    resetAll() {
        db.prepare('UPDATE users SET description = NULL, gender = NULL, birthday = NULL').run();
        return true;
    },
};

export default User;
