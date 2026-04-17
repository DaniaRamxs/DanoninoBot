import { sendSuccess, sendError } from '../../lib/formatter.js';
import { getSenderJid, formatNumber, random, formatCooldown } from '../../lib/utils.js';
import Economy from '../../database/models/Economy.js';

const trabajos = [
    { emoji: '👨‍🍳', nombre: 'cocinero', accion: 'Preparaste un banquete delicioso' },
    { emoji: '👨‍🔧', nombre: 'mecánico', accion: 'Reparaste un motor complejo' },
    { emoji: '👨‍🏫', nombre: 'profesor', accion: 'Diste clases todo el día' },
    { emoji: '👨‍⚕️', nombre: 'doctor', accion: 'Atendiste a varios pacientes' },
    { emoji: '👨‍🌾', nombre: 'granjero', accion: 'Cosechaste los campos' },
    { emoji: '👨‍💻', nombre: 'programador', accion: 'Terminaste un proyecto importante' },
    { emoji: '🧑‍🚒', nombre: 'bombero', accion: 'Apagaste un incendio peligroso' },
    { emoji: '👷', nombre: 'constructor', accion: 'Construiste una pared entera' },
    { emoji: '🧑‍🎨', nombre: 'artista', accion: 'Vendiste una pintura hermosa' },
    { emoji: '🧑‍✈️', nombre: 'piloto', accion: 'Completaste un vuelo internacional' },
    { emoji: '📦', nombre: 'repartidor', accion: 'Entregaste todos los paquetes a tiempo' },
    { emoji: '🧹', nombre: 'limpiador', accion: 'Dejaste todo impecable' },
    { emoji: '🎵', nombre: 'músico', accion: 'Tocaste en un concierto' },
    { emoji: '📸', nombre: 'fotógrafo', accion: 'Hiciste una sesión de fotos profesional' },
    { emoji: '🧑‍🍳', nombre: 'pastelero', accion: 'Horneaste pasteles para un evento' },
];

export default {
    name: 'work',
    aliases: ['trabajar', 'trabajo'],
    category: 'economy',
    description: 'Realiza un trabajo para ganar dinero.',
    usage: '/work',
    cooldown: 3,

    async execute(sock, msg, args, { config }) {
        const senderJid = getSenderJid(msg);
        const currency = config.economy.currencyName;

        const remaining = Economy.checkCooldown(senderJid, 'last_work', config.economy.workCooldown);
        if (remaining > 0) {
            return sendError(sock, msg, `Estás cansado. Descansa ${formatCooldown(remaining)} más.`);
        }

        const job = trabajos[random(0, trabajos.length - 1)];
        const reward = random(config.economy.workReward.min, config.economy.workReward.max);

        Economy.addWallet(senderJid, reward);
        Economy.setCooldown(senderJid, 'last_work');

        await sendSuccess(sock, msg,
            `${job.emoji} *Trabajaste como ${job.nombre}*\n\n` +
            `${job.accion}.\n\n` +
            `💰 +${formatNumber(reward)} ${currency}`
        );
    },
};
