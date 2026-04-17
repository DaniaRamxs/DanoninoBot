import 'dotenv/config';
import { initDatabase } from './database/database.js';
import { loadPlugins, getPluginCount } from './lib/pluginLoader.js';
import { startBot } from './lib/baileys.js';
import { handleMessage } from './lib/commandHandler.js';
import { handleGroupParticipantsUpdate } from './lib/groupEvents.js';
import settings from './config/settings.js';

console.log('╔═══════════════════════════════════════╗');
console.log(`║       ${settings.botName} v1.0.0              ║`);
console.log('║   Automatiza, simplifica, crece.      ║');
console.log('╚═══════════════════════════════════════╝');
console.log('');

async function main() {
    try {
        // 1. Inicializar base de datos
        console.log('🔧 Inicializando base de datos...');
        initDatabase();

        // 2. Cargar plugins
        console.log('🔧 Cargando plugins...');
        await loadPlugins();
        console.log(`✅ ${getPluginCount()} comandos listos`);
        console.log('');

        // 3. Conectar a WhatsApp
        console.log('🔧 Conectando a WhatsApp...');
        await startBot(handleMessage, handleGroupParticipantsUpdate);

    } catch (err) {
        console.error('💀 Error fatal:', err);
        process.exit(1);
    }
}

// Manejar errores no capturados
process.on('uncaughtException', (err) => {
    console.error('❌ Error no capturado:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Promesa rechazada:', err);
});

main();
