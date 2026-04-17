import db from '../database.js';

const Group = {
    /** Obtener o crear grupo */
    getOrCreate(jid, name = '') {
        let group = db.prepare('SELECT * FROM groups WHERE jid = ?').get(jid);
        if (!group) {
            db.prepare('INSERT INTO groups (jid, name) VALUES (?, ?)').run(jid, name);
            group = db.prepare('SELECT * FROM groups WHERE jid = ?').get(jid);
        }
        return group;
    },

    /** Obtener grupo */
    get(jid) {
        return db.prepare('SELECT * FROM groups WHERE jid = ?').get(jid);
    },

    /** Actualizar un campo del grupo */
    set(jid, field, value) {
        this.getOrCreate(jid);
        db.prepare(`UPDATE groups SET ${field} = ? WHERE jid = ?`).run(value, jid);
        return true;
    },

    /** Verificar si el grupo está baneado */
    isBanned(jid) {
        const g = this.get(jid);
        return g?.banned === 1;
    },

    /** Banear grupo */
    ban(jid) {
        return this.set(jid, 'banned', 1);
    },

    /** Desbanear grupo */
    unban(jid) {
        return this.set(jid, 'banned', 0);
    },

    // ═══ Toggle de funciones anti-* ═══

    toggleAntiSpam(jid, val) { return this.set(jid, 'anti_spam', val ? 1 : 0); },
    toggleAntiLink(jid, val) { return this.set(jid, 'anti_link', val ? 1 : 0); },
    toggleAntiLinkHard(jid, val) { return this.set(jid, 'anti_link_hard', val ? 1 : 0); },
    toggleAntiFake(jid, val) { return this.set(jid, 'anti_fake', val ? 1 : 0); },
    toggleAntiBadword(jid, val) { return this.set(jid, 'anti_badword', val ? 1 : 0); },
    toggleAntiImage(jid, val) { return this.set(jid, 'anti_image', val ? 1 : 0); },
    toggleAntiVideo(jid, val) { return this.set(jid, 'anti_video', val ? 1 : 0); },
    toggleAntiAudio(jid, val) { return this.set(jid, 'anti_audio', val ? 1 : 0); },
    toggleAntiSticker(jid, val) { return this.set(jid, 'anti_sticker', val ? 1 : 0); },
    toggleAntiDocument(jid, val) { return this.set(jid, 'anti_document', val ? 1 : 0); },
    toggleAntiContact(jid, val) { return this.set(jid, 'anti_contact', val ? 1 : 0); },
    toggleAntiLocation(jid, val) { return this.set(jid, 'anti_location', val ? 1 : 0); },
    toggleAntiCatalog(jid, val) { return this.set(jid, 'anti_catalog', val ? 1 : 0); },
    toggleAntiVoicenote(jid, val) { return this.set(jid, 'anti_voicenote', val ? 1 : 0); },

    // ═══ Welcome / Goodbye ═══

    toggleWelcome(jid, val) { return this.set(jid, 'welcome_enabled', val ? 1 : 0); },
    toggleWelcome2(jid, val) { return this.set(jid, 'welcome2_enabled', val ? 1 : 0); },
    setWelcomeMessage(jid, msg) { return this.set(jid, 'welcome_message', msg); },
    setGoodbyeMessage(jid, msg) { return this.set(jid, 'goodbye_message', msg); },
    setWelcome2Message(jid, msg) { return this.set(jid, 'welcome2_message', msg); },
    setGoodbye2Message(jid, msg) { return this.set(jid, 'goodbye2_message', msg); },

    // ═══ Otros toggles ═══

    toggleLeveling(jid, val) { return this.set(jid, 'leveling_enabled', val ? 1 : 0); },
    toggleNSFW(jid, val) { return this.set(jid, 'nsfw_enabled', val ? 1 : 0); },
    toggleRPG(jid, val) { return this.set(jid, 'rpg_enabled', val ? 1 : 0); },
    toggleFun(jid, val) { return this.set(jid, 'fun_enabled', val ? 1 : 0); },
    toggleAdminOnly(jid, val) { return this.set(jid, 'admin_only', val ? 1 : 0); },
    toggleX9(jid, val) { return this.set(jid, 'x9_enabled', val ? 1 : 0); },
    toggleX9ViewOnce(jid, val) { return this.set(jid, 'x9_viewonce', val ? 1 : 0); },
    toggleAutoResponse(jid, val) { return this.set(jid, 'auto_response_enabled', val ? 1 : 0); },
    toggleWarningMode(jid, val) { return this.set(jid, 'warning_mode', val ? 1 : 0); },

    // ═══ Reglas ═══
    setRules(jid, rules) { return this.set(jid, 'rules', rules); },

    // ═══ Spam limit ═══
    setSpamLimit(jid, limit) { return this.set(jid, 'spam_limit', limit); },

    // ═══ Anti-fake leyenda ═══
    setFakeLegend(jid, text) { return this.set(jid, 'anti_fake_legend', text); },
};

export default Group;
