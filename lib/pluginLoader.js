import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

/** Almacén global de plugins */
const plugins = new Map();

/**
 * Cargar todos los plugins del directorio plugins/
 */
export async function loadPlugins() {
    plugins.clear();
    const pluginsDir = resolve('./plugins');
    let loaded = 0;
    let errors = 0;

    const categories = readdirSync(pluginsDir).filter(f => {
        const fullPath = join(pluginsDir, f);
        return statSync(fullPath).isDirectory() && !f.startsWith('_');
    });

    for (const category of categories) {
        const categoryPath = join(pluginsDir, category);
        const files = readdirSync(categoryPath).filter(f => f.endsWith('.js'));

        for (const file of files) {
            const filePath = join(categoryPath, file);
            try {
                const fileUrl = pathToFileURL(filePath).href;
                const module = await import(fileUrl);
                const plugin = module.default;

                if (!plugin?.name) {
                    console.log(`⚠️ Plugin sin nombre: ${filePath}`);
                    continue;
                }

                // Asignar categoría si no la tiene
                plugin.category = plugin.category || category;
                plugin.filePath = filePath;

                // Registrar comando principal
                plugins.set(plugin.name.toLowerCase(), plugin);

                // Registrar aliases
                if (plugin.aliases?.length) {
                    for (const alias of plugin.aliases) {
                        plugins.set(alias.toLowerCase(), plugin);
                    }
                }

                loaded++;
            } catch (err) {
                console.error(`❌ Error cargando ${filePath}:`, err.message);
                errors++;
            }
        }
    }

    console.log(`📂 Plugins cargados: ${loaded} | Errores: ${errors}`);
    return plugins;
}

/**
 * Buscar un plugin por nombre o alias
 */
export function findPlugin(name) {
    return plugins.get(name?.toLowerCase()) || null;
}

/**
 * Obtener todos los plugins únicos (sin aliases duplicados)
 */
export function getAllPlugins() {
    const unique = new Map();
    for (const [, plugin] of plugins) {
        unique.set(plugin.name, plugin);
    }
    return [...unique.values()];
}

/**
 * Obtener plugins por categoría
 */
export function getPluginsByCategory(category) {
    return getAllPlugins().filter(p => p.category === category);
}

/**
 * Obtener todas las categorías
 */
export function getCategories() {
    const cats = new Set();
    for (const plugin of getAllPlugins()) {
        cats.add(plugin.category);
    }
    return [...cats];
}

/**
 * Obtener cantidad de plugins cargados
 */
export function getPluginCount() {
    return getAllPlugins().length;
}

export default plugins;
