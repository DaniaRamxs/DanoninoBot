import { reply } from '../../lib/formatter.js';

export default {
    name: 'infoidiomas',
    aliases: [],
    category: 'profile',
    description: 'Información del uso de comandos de idiomas.',
    usage: '/infoidiomas',
    cooldown: 5,

    async execute(sock, msg, args, { prefix }) {
        let text = '';
        text += `╭━━⸻⌔∎\n`;
        text += `┃ 🌐 *Idiomas disponibles*\n`;
        text += `╰━━━━━─⌔∎\n\n`;
        text += `Usa el comando traductor con un código de idioma:\n`;
        text += `${prefix}traductor <código> <texto>\n\n`;
        text += `*Códigos de idiomas:*\n`;
        text += `es → Español\n`;
        text += `en → Inglés\n`;
        text += `pt → Portugués\n`;
        text += `fr → Francés\n`;
        text += `de → Alemán\n`;
        text += `it → Italiano\n`;
        text += `ja → Japonés\n`;
        text += `ko → Coreano\n`;
        text += `zh → Chino\n`;
        text += `ru → Ruso\n`;
        text += `ar → Árabe\n`;
        text += `hi → Hindi\n`;
        text += `tr → Turco\n`;
        text += `nl → Holandés\n`;
        text += `pl → Polaco\n\n`;
        text += `*Ejemplo:*\n`;
        text += `${prefix}traductor en Hola mundo`;

        await reply(sock, msg, text);
    },
};
