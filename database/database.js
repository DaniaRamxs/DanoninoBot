import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const DB_PATH = './data/chimubot.db';

// Asegurar que el directorio existe
const dir = dirname(DB_PATH);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

// Optimizaciones de rendimiento
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

/** Inicializar todas las tablas */
export function initDatabase() {
    db.exec(`
        -- ═══════════════════════════════════
        -- Usuarios
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS users (
            jid TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            gender TEXT,
            birthday TEXT,
            registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            blocked INTEGER DEFAULT 0
        );

        -- ═══════════════════════════════════
        -- Grupos
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS groups (
            jid TEXT PRIMARY KEY,
            name TEXT,
            banned INTEGER DEFAULT 0,
            warning_mode INTEGER DEFAULT 0,
            anti_spam INTEGER DEFAULT 0,
            anti_link INTEGER DEFAULT 0,
            anti_link_hard INTEGER DEFAULT 0,
            anti_fake INTEGER DEFAULT 0,
            anti_fake_legend TEXT DEFAULT '',
            anti_badword INTEGER DEFAULT 0,
            anti_image INTEGER DEFAULT 0,
            anti_video INTEGER DEFAULT 0,
            anti_audio INTEGER DEFAULT 0,
            anti_sticker INTEGER DEFAULT 0,
            anti_document INTEGER DEFAULT 0,
            anti_contact INTEGER DEFAULT 0,
            anti_location INTEGER DEFAULT 0,
            anti_catalog INTEGER DEFAULT 0,
            anti_voicenote INTEGER DEFAULT 0,
            spam_limit INTEGER DEFAULT 500,
            welcome_enabled INTEGER DEFAULT 0,
            welcome2_enabled INTEGER DEFAULT 0,
            welcome_message TEXT DEFAULT '',
            welcome_image TEXT,
            goodbye_message TEXT DEFAULT '',
            goodbye_image TEXT,
            welcome2_message TEXT DEFAULT '',
            goodbye2_message TEXT DEFAULT '',
            rules TEXT DEFAULT '',
            leveling_enabled INTEGER DEFAULT 0,
            nsfw_enabled INTEGER DEFAULT 0,
            rpg_enabled INTEGER DEFAULT 0,
            fun_enabled INTEGER DEFAULT 0,
            admin_only INTEGER DEFAULT 0,
            multi_prefix INTEGER DEFAULT 0,
            extra_prefixes TEXT DEFAULT '[]',
            x9_enabled INTEGER DEFAULT 0,
            x9_viewonce INTEGER DEFAULT 0,
            odelete INTEGER DEFAULT 0,
            auto_response_enabled INTEGER DEFAULT 0,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- ═══════════════════════════════════
        -- Actividad de grupo
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS group_activity (
            group_jid TEXT NOT NULL,
            user_jid TEXT NOT NULL,
            message_count INTEGER DEFAULT 0,
            last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (group_jid, user_jid)
        );

        -- ═══════════════════════════════════
        -- Advertencias
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS warnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_jid TEXT NOT NULL,
            user_jid TEXT NOT NULL,
            reason TEXT DEFAULT 'Sin razón',
            warned_by TEXT,
            warned_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- ═══════════════════════════════════
        -- Matrimonios
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS marriages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user1_jid TEXT NOT NULL,
            user2_jid TEXT NOT NULL,
            married_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user1_jid),
            UNIQUE(user2_jid)
        );

        -- ═══════════════════════════════════
        -- Economía
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS economy (
            user_jid TEXT PRIMARY KEY,
            wallet INTEGER DEFAULT 0,
            bank INTEGER DEFAULT 0,
            last_daily TEXT,
            last_work TEXT,
            last_crime TEXT,
            last_rob TEXT,
            last_fish TEXT,
            last_mine TEXT,
            total_earned INTEGER DEFAULT 0,
            total_spent INTEGER DEFAULT 0
        );

        -- ═══════════════════════════════════
        -- Niveles y XP
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS levels (
            group_jid TEXT NOT NULL,
            user_jid TEXT NOT NULL,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            messages INTEGER DEFAULT 0,
            PRIMARY KEY (group_jid, user_jid)
        );

        -- ═══════════════════════════════════
        -- Gacha - Colección de personajes
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS gacha_collection (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_jid TEXT NOT NULL,
            character_id INTEGER NOT NULL,
            character_name TEXT NOT NULL,
            character_image TEXT,
            rarity TEXT DEFAULT 'common',
            value INTEGER DEFAULT 100,
            votes INTEGER DEFAULT 0,
            for_sale INTEGER DEFAULT 0,
            sale_price INTEGER DEFAULT 0,
            claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- ═══════════════════════════════════
        -- Productos (catálogo)
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_jid TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image_url TEXT,
            stock INTEGER DEFAULT -1,
            active INTEGER DEFAULT 1,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- ═══════════════════════════════════
        -- Ofertas
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS offers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_jid TEXT NOT NULL,
            product_id INTEGER,
            description TEXT NOT NULL,
            discount REAL DEFAULT 0,
            active INTEGER DEFAULT 1,
            expires_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(product_id) REFERENCES products(id)
        );

        -- ═══════════════════════════════════
        -- Pedidos
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_jid TEXT NOT NULL,
            user_jid TEXT NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            total_price REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(product_id) REFERENCES products(id)
        );

        -- ═══════════════════════════════════
        -- Subastas
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS auctions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_jid TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            starting_price REAL NOT NULL,
            current_price REAL,
            current_bidder TEXT,
            end_time DATETIME NOT NULL,
            status TEXT DEFAULT 'active',
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS auction_bids (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            auction_id INTEGER NOT NULL,
            bidder_jid TEXT NOT NULL,
            amount REAL NOT NULL,
            bid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(auction_id) REFERENCES auctions(id)
        );

        -- ═══════════════════════════════════
        -- Comandos personalizados por grupo
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS custom_commands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_jid TEXT NOT NULL,
            command TEXT NOT NULL,
            response TEXT NOT NULL,
            image TEXT,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(group_jid, command)
        );

        -- ═══════════════════════════════════
        -- Respuestas automáticas por grupo
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS auto_responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_jid TEXT NOT NULL,
            trigger_word TEXT NOT NULL,
            response TEXT NOT NULL,
            image TEXT,
            exact_match INTEGER DEFAULT 0,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- ═══════════════════════════════════
        -- Malas palabras por grupo
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS badwords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_jid TEXT NOT NULL,
            word TEXT NOT NULL,
            UNIQUE(group_jid, word)
        );

        -- ═══════════════════════════════════
        -- Sub-bots
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS subbots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_jid TEXT NOT NULL,
            subbot_jid TEXT UNIQUE NOT NULL,
            connected INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- ═══════════════════════════════════
        -- Configuración dinámica del bot
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        -- ═══════════════════════════════════
        -- Sesiones de juegos activos
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS game_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_type TEXT NOT NULL,
            group_jid TEXT NOT NULL,
            players TEXT NOT NULL,
            game_state TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- ═══════════════════════════════════
        -- Rankings de diversión
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS fun_stats (
            group_jid TEXT NOT NULL,
            user_jid TEXT NOT NULL,
            stat_type TEXT NOT NULL,
            value INTEGER DEFAULT 0,
            PRIMARY KEY (group_jid, user_jid, stat_type)
        );

        -- ═══════════════════════════════════
        -- Usuarios muteados
        -- ═══════════════════════════════════
        CREATE TABLE IF NOT EXISTS muted_users (
            group_jid TEXT NOT NULL,
            user_jid TEXT NOT NULL,
            muted_by TEXT,
            muted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (group_jid, user_jid)
        );

        -- ═══════════════════════════════════
        -- Índices para rendimiento
        -- ═══════════════════════════════════
        CREATE INDEX IF NOT EXISTS idx_activity_group ON group_activity(group_jid);
        CREATE INDEX IF NOT EXISTS idx_warnings_group ON warnings(group_jid, user_jid);
        CREATE INDEX IF NOT EXISTS idx_economy_wallet ON economy(wallet DESC);
        CREATE INDEX IF NOT EXISTS idx_levels_group ON levels(group_jid);
        CREATE INDEX IF NOT EXISTS idx_gacha_user ON gacha_collection(user_jid);
        CREATE INDEX IF NOT EXISTS idx_products_group ON products(group_jid);
        CREATE INDEX IF NOT EXISTS idx_orders_group ON orders(group_jid);
        CREATE INDEX IF NOT EXISTS idx_auctions_group ON auctions(group_jid);
        CREATE INDEX IF NOT EXISTS idx_custom_cmd_group ON custom_commands(group_jid);
        CREATE INDEX IF NOT EXISTS idx_auto_resp_group ON auto_responses(group_jid);
        CREATE INDEX IF NOT EXISTS idx_badwords_group ON badwords(group_jid);
        CREATE INDEX IF NOT EXISTS idx_fun_stats_group ON fun_stats(group_jid);
    `);

    // ═══════════════════════════════════
    // Migraciones: agregar columnas que
    // faltan en tablas existentes
    // ═══════════════════════════════════
    const groupColumns = db.prepare("PRAGMA table_info(groups)").all().map(c => c.name);
    const addIfMissing = (table, column, definition) => {
        const cols = table === 'groups' ? groupColumns : db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
        if (!cols.includes(column)) {
            db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
            console.log(`  + Columna añadida: ${table}.${column}`);
        }
    };

    // Columnas de groups que pueden faltar
    addIfMissing('groups', 'absence_mode', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'absence_message', 'TEXT DEFAULT ""');
    addIfMissing('groups', 'warning_mode', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_spam', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_link', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_link_hard', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_fake', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_fake_legend', 'TEXT DEFAULT ""');
    addIfMissing('groups', 'anti_badword', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_image', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_video', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_audio', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_sticker', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_document', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_contact', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_location', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_catalog', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'anti_voicenote', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'spam_limit', 'INTEGER DEFAULT 500');
    addIfMissing('groups', 'welcome_enabled', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'welcome2_enabled', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'welcome_message', 'TEXT DEFAULT ""');
    addIfMissing('groups', 'welcome_image', 'TEXT');
    addIfMissing('groups', 'goodbye_message', 'TEXT DEFAULT ""');
    addIfMissing('groups', 'goodbye_image', 'TEXT');
    addIfMissing('groups', 'welcome2_message', 'TEXT DEFAULT ""');
    addIfMissing('groups', 'goodbye2_message', 'TEXT DEFAULT ""');
    addIfMissing('groups', 'rules', 'TEXT DEFAULT ""');
    addIfMissing('groups', 'leveling_enabled', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'nsfw_enabled', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'rpg_enabled', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'fun_enabled', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'admin_only', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'multi_prefix', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'extra_prefixes', 'TEXT DEFAULT "[]"');
    addIfMissing('groups', 'x9_enabled', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'x9_viewonce', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'odelete', 'INTEGER DEFAULT 0');
    addIfMissing('groups', 'auto_response_enabled', 'INTEGER DEFAULT 0');

    console.log('📦 Base de datos inicializada correctamente');
    return db;
}

export default db;
