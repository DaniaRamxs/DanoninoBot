import { reply, sendError, sendTyping } from '../../lib/formatter.js';
import axios from 'axios';

export default {
    name: 'clima',
    aliases: ['weather', 'tiempo'],
    category: 'tools',
    description: 'Busca clima de una ciudad.',
    usage: '/clima <ciudad>',
    cooldown: 5,

    async execute(sock, msg, args) {
        const city = args.join(' ');
        if (!city) return sendError(sock, msg, 'Escribe la ciudad.\nEj: /clima Lima');

        await sendTyping(sock, msg.key.remoteJid);

        try {
            const { data } = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=es`, {
                timeout: 15000,
            });

            const current = data.current_condition?.[0];
            const area = data.nearest_area?.[0];
            if (!current) return sendError(sock, msg, 'No se encontró el clima de esa ciudad.');

            const cityName = area?.areaName?.[0]?.value || city;
            const country = area?.country?.[0]?.value || '';

            let text = '';
            text += `╭━━⸻⌔∎\n`;
            text += `┃ 🌤️ *Clima en ${cityName}, ${country}*\n`;
            text += `╰━━━━━─⌔∎\n\n`;
            text += `🌡️ Temperatura: *${current.temp_C}°C* (${current.temp_F}°F)\n`;
            text += `🤔 Sensación: *${current.FeelsLikeC}°C*\n`;
            text += `💨 Viento: *${current.windspeedKmph} km/h* ${current.winddir16Point}\n`;
            text += `💧 Humedad: *${current.humidity}%*\n`;
            text += `☁️ Nubosidad: *${current.cloudcover}%*\n`;
            text += `👁️ Visibilidad: *${current.visibility} km*\n`;
            text += `🌧️ Precipitación: *${current.precipMM} mm*\n`;

            const desc = current.lang_es?.[0]?.value || current.weatherDesc?.[0]?.value || '';
            if (desc) text += `\n📋 ${desc}`;

            await reply(sock, msg, text);
        } catch {
            await sendError(sock, msg, 'Error al buscar el clima. Verifica el nombre de la ciudad.');
        }
    },
};
