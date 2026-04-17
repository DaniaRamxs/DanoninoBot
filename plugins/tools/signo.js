import { reply, sendError } from '../../lib/formatter.js';
import { random } from '../../lib/utils.js';

const signos = {
    aries: { emoji: '♈', fecha: '21 Mar - 19 Abr', elemento: 'Fuego' },
    tauro: { emoji: '♉', fecha: '20 Abr - 20 May', elemento: 'Tierra' },
    geminis: { emoji: '♊', fecha: '21 May - 20 Jun', elemento: 'Aire' },
    cancer: { emoji: '♋', fecha: '21 Jun - 22 Jul', elemento: 'Agua' },
    leo: { emoji: '♌', fecha: '23 Jul - 22 Ago', elemento: 'Fuego' },
    virgo: { emoji: '♍', fecha: '23 Ago - 22 Sep', elemento: 'Tierra' },
    libra: { emoji: '♎', fecha: '23 Sep - 22 Oct', elemento: 'Aire' },
    escorpio: { emoji: '♏', fecha: '23 Oct - 21 Nov', elemento: 'Agua' },
    sagitario: { emoji: '♐', fecha: '22 Nov - 21 Dic', elemento: 'Fuego' },
    capricornio: { emoji: '♑', fecha: '22 Dic - 19 Ene', elemento: 'Tierra' },
    acuario: { emoji: '♒', fecha: '20 Ene - 18 Feb', elemento: 'Aire' },
    piscis: { emoji: '♓', fecha: '19 Feb - 20 Mar', elemento: 'Agua' },
};

const predicciones = {
    amor: [
        'El amor tocará tu puerta hoy, ábrela sin miedo.',
        'Tu pareja necesita más atención, demuéstrale lo que sientes.',
        'Hoy es un buen día para confesarte.',
        'El amor está en el aire, solo necesitas mirar a tu alrededor.',
        'Cuidado con los celos, pueden arruinar una buena relación.',
        'Alguien especial está pensando en ti en este momento.',
        'Las estrellas favorecen los encuentros románticos hoy.',
        'No fuerces las cosas, el amor llega cuando menos lo esperas.',
    ],
    dinero: [
        'Una oportunidad financiera se presentará pronto.',
        'Cuidado con los gastos innecesarios.',
        'Es buen momento para invertir en ti mismo.',
        'El dinero llegará de una fuente inesperada.',
        'Ahorra hoy para disfrutar mañana.',
        'Un proyecto puede darte buenos frutos económicos.',
        'No prestes dinero hoy, las estrellas no lo favorecen.',
        'Tu esfuerzo será recompensado financieramente.',
    ],
    salud: [
        'Cuida tu alimentación, tu cuerpo te lo agradecerá.',
        'Hoy es un buen día para hacer ejercicio.',
        'Descansa más, tu cuerpo lo necesita.',
        'La energía positiva fluye en ti hoy.',
        'Evita el estrés, busca actividades relajantes.',
        'Tu salud mejorará si mantienes una actitud positiva.',
        'Bebe más agua y cuida tu sueño.',
        'Las estrellas favorecen tu bienestar físico hoy.',
    ],
};

export default {
    name: 'signo',
    aliases: ['horoscopo', 'zodiaco'],
    category: 'tools',
    description: 'Predicción de tu signo zodiacal.',
    usage: '/signo <signo>',
    cooldown: 5,

    async execute(sock, msg, args) {
        const name = args[0]?.toLowerCase();
        if (!name || !signos[name]) {
            const list = Object.entries(signos).map(([k, v]) => `${v.emoji} ${k}`).join('\n');
            return reply(sock, msg, `📋 Elige tu signo:\n\n${list}\n\nEj: /signo aries`);
        }

        const signo = signos[name];
        const amor = predicciones.amor[random(0, predicciones.amor.length - 1)];
        const dinero = predicciones.dinero[random(0, predicciones.dinero.length - 1)];
        const salud = predicciones.salud[random(0, predicciones.salud.length - 1)];
        const suerte = random(1, 100);
        const numSuerte = `${random(1, 49)}, ${random(1, 49)}, ${random(1, 49)}`;

        let text = '';
        text += `╭━━⸻⌔∎\n`;
        text += `┃ ${signo.emoji} *${name.toUpperCase()}*\n`;
        text += `╰━━━━━─⌔∎\n\n`;
        text += `📅 ${signo.fecha}\n`;
        text += `🔥 Elemento: ${signo.elemento}\n\n`;
        text += `💕 *Amor:* ${amor}\n\n`;
        text += `💰 *Dinero:* ${dinero}\n\n`;
        text += `🏥 *Salud:* ${salud}\n\n`;
        text += `🍀 Suerte: ${suerte}%\n`;
        text += `🔢 Números: ${numSuerte}`;

        await reply(sock, msg, text);
    },
};
