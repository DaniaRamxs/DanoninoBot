import { sendSuccess, sendError, reply } from '../../lib/formatter.js';
import Group from '../../database/models/Group.js';

const leyendaMap = {
    leyendawelcom:  { field: 'setWelcomeMessage',  label: 'Bienvenida con imagen' },
    leyendasalio:   { field: 'setGoodbyeMessage',  label: 'Salida con imagen' },
    leyendawelcom2: { field: 'setWelcome2Message',  label: 'Bienvenida sin imagen' },
    leyendasalio2:  { field: 'setGoodbye2Message',  label: 'Salida sin imagen' },
};

export default {
    name: 'leyendawelcom',
    aliases: ['leyendasalio', 'leyendawelcom2', 'leyendasalio2'],
    category: 'group',
    description: 'Cambia texto de bienvenida/salida.',
    usage: '/leyendawelcom <texto>\nVariables: @user @grupo @miembros',
    cooldown: 3,
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args, { command }) {
        const text = args.join(' ');
        if (!text) {
            return reply(sock, msg,
                `📋 Uso: /${command} <texto>\n\n` +
                `Variables disponibles:\n` +
                `• @user - nombre del usuario\n` +
                `• @grupo - nombre del grupo\n` +
                `• @miembros - cantidad de miembros`
            );
        }

        const config = leyendaMap[command];
        if (!config) return;

        Group[config.field](msg.key.remoteJid, text);
        await sendSuccess(sock, msg, `${config.label} actualizada:\n\n${text}`);
    },
};
