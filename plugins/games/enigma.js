import { reply, sendError, sendSuccess } from '../../lib/formatter.js';
import { random } from '../../lib/utils.js';

const riddles = [
    { q: 'Tengo agujas pero no sé coser, tengo números pero no sé leer.', a: 'reloj' },
    { q: 'Blanco por dentro, verde por fuera, si quieres que te lo diga, espera.', a: 'pera' },
    { q: 'Oro parece, plata no es. ¿Qué es?', a: 'platano' },
    { q: 'Tiene ojos y no ve, tiene agua y no la bebe, tiene carne y no la come, tiene barba y no es hombre.', a: 'coco' },
    { q: 'Cuanto más se moja, más te seca.', a: 'toalla' },
    { q: 'Soy alto cuando soy joven y bajo cuando soy viejo. ¿Qué soy?', a: 'vela' },
    { q: 'Tiene cabeza, tiene dientes, no es animal ni es gente.', a: 'ajo' },
    { q: 'No es león y tiene garra, no es pato y tiene pata.', a: 'guitarra' },
    { q: '¿Qué cosa es, que la cortas y lloras?', a: 'cebolla' },
    { q: 'Vuelo sin alas, lloro sin ojos. ¿Qué soy?', a: 'nube' },
    { q: 'Tiene dientes y no come, tiene cabeza y no es hombre.', a: 'peine' },
    { q: 'Siempre quietas, siempre inquietas; dormidas de día, de noche despiertas.', a: 'estrellas' },
    { q: '¿Qué tiene pies pero no camina?', a: 'mesa' },
    { q: 'Si me nombras, desaparezco. ¿Qué soy?', a: 'silencio' },
    { q: 'Todos pasan por mí, yo no paso por nadie. Todos preguntan por mí, yo no pregunto por nadie.', a: 'calle' },
    { q: 'Tengo hojas sin ser árbol, te hablo sin tener voz.', a: 'libro' },
    { q: 'Soy redonda como el mundo, al morir me estiran. En el campo soy bonita, en la casa, soy más fina.', a: 'pelota' },
    { q: 'Con mi cara roja, mi ojo negro y mi vestido verde, el campo alegro.', a: 'amapola' },
];

/** Almacén temporal de enigmas activos por grupo */
const activeRiddles = new Map();

export default {
    name: 'enigma',
    aliases: ['acertijo', 'riddle', 'revelarenigma'],
    category: 'games',
    description: 'Envía un acertijo para que el grupo lo resuelva.',
    usage: '/enigma | /revelarenigma',
    cooldown: 5,
    groupOnly: true,

    async execute(sock, msg, args, { command }) {
        const chatJid = msg.key.remoteJid;

        if (command === 'revelarenigma') {
            const active = activeRiddles.get(chatJid);
            if (!active) return sendError(sock, msg, 'No hay enigma activo.');
            activeRiddles.delete(chatJid);
            return reply(sock, msg, `🔓 La respuesta era: *${active.a}*`);
        }

        if (activeRiddles.has(chatJid)) {
            return sendError(sock, msg, 'Ya hay un enigma activo. Resuélvelo o usa /revelarenigma');
        }

        const riddle = riddles[random(0, riddles.length - 1)];
        activeRiddles.set(chatJid, riddle);

        // Auto-revelar después de 2 minutos
        setTimeout(() => {
            if (activeRiddles.get(chatJid) === riddle) {
                activeRiddles.delete(chatJid);
                sock.sendMessage(chatJid, {
                    text: `⏰ Tiempo agotado! La respuesta era: *${riddle.a}*`,
                }).catch(() => {});
            }
        }, 120000);

        await reply(sock, msg,
            `🧩 *ENIGMA*\n\n` +
            `${riddle.q}\n\n` +
            `💡 Escribe la respuesta en el chat.\n` +
            `⏰ 2 minutos para responder.`
        );
    },
};

// Exportar para verificar respuestas desde el commandHandler
export function checkEnigmaAnswer(chatJid, text) {
    const active = activeRiddles.get(chatJid);
    if (!active) return null;
    if (text.toLowerCase().trim() === active.a.toLowerCase()) {
        activeRiddles.delete(chatJid);
        return active;
    }
    return null;
}
