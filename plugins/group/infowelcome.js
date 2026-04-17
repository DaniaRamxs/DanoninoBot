import { reply } from '../../lib/formatter.js';

export default {
    name: 'infowelcome',
    aliases: [],
    category: 'group',
    description: 'Guía para configurar bienvenidas y despedidas en el grupo.',
    usage: '/infowelcome',
    cooldown: 5,
    groupOnly: true,

    async execute(sock, msg, args, { prefix }) {
        let text = '';
        text += `╭━━⸻⌔∎\n`;
        text += `┃ 📋 *Guía de Bienvenidas*\n`;
        text += `╰━━━━━─⌔∎\n\n`;

        text += `*Con imagen:*\n`;
        text += `❑ ${prefix}welcome 1/0 → Activar/desactivar\n`;
        text += `❑ ${prefix}leyendawelcom <texto> → Texto de bienvenida\n`;
        text += `❑ ${prefix}leyendasalio <texto> → Texto de salida\n`;
        text += `❑ ${prefix}fondobienvenido → Cambiar imagen (responder foto)\n`;
        text += `❑ ${prefix}fondosalio → Cambiar imagen salida\n\n`;

        text += `*Sin imagen:*\n`;
        text += `❑ ${prefix}welcome2 1/0 → Activar/desactivar\n`;
        text += `❑ ${prefix}leyendawelcom2 <texto> → Texto bienvenida\n`;
        text += `❑ ${prefix}leyendasalio2 <texto> → Texto salida\n\n`;

        text += `*Variables para textos:*\n`;
        text += `• @user → Nombre del usuario\n`;
        text += `• @grupo → Nombre del grupo\n`;
        text += `• @miembros → Cantidad de miembros\n\n`;

        text += `*Ejemplo:*\n`;
        text += `${prefix}leyendawelcom Bienvenid@ @user a *@grupo*! 🎉 Eres el miembro #@miembros`;

        await reply(sock, msg, text);
    },
};
