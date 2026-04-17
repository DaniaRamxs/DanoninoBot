import { reply, sendError } from '../../lib/formatter.js';
import { random } from '../../lib/utils.js';

const words = [
    { word: 'elefante', hints: ['Animal', 'Grande', 'Tiene trompa', 'Gris'] },
    { word: 'guitarra', hints: ['Instrumento', 'Tiene cuerdas', 'Se toca con las manos', 'Musical'] },
    { word: 'computadora', hints: ['Tecnología', 'Tiene pantalla', 'Se usa para trabajar', 'Electrónico'] },
    { word: 'chocolate', hints: ['Comida', 'Dulce', 'Viene del cacao', 'Marrón'] },
    { word: 'mariposa', hints: ['Animal', 'Tiene alas', 'Vuela', 'Colorida'] },
    { word: 'dinosaurio', hints: ['Animal', 'Extinto', 'Prehistórico', 'Grande'] },
    { word: 'pirámide', hints: ['Construcción', 'Egipto', 'Triangular', 'Antigua'] },
    { word: 'volcán', hints: ['Naturaleza', 'Tiene lava', 'Montaña', 'Erupciona'] },
    { word: 'astronauta', hints: ['Persona', 'Va al espacio', 'Traje especial', 'NASA'] },
    { word: 'helado', hints: ['Comida', 'Frío', 'Dulce', 'Verano'] },
    { word: 'televisión', hints: ['Electrónico', 'Pantalla', 'Se ven programas', 'Control remoto'] },
    { word: 'bicicleta', hints: ['Vehículo', 'Dos ruedas', 'Pedales', 'No tiene motor'] },
    { word: 'vampiro', hints: ['Criatura', 'Nocturno', 'Colmillos', 'Sangre'] },
    { word: 'arcoíris', hints: ['Naturaleza', 'Colores', 'Después de lluvia', 'Cielo'] },
    { word: 'pizza', hints: ['Comida', 'Italiana', 'Redonda', 'Queso'] },
    { word: 'tornado', hints: ['Naturaleza', 'Viento', 'Destructor', 'Gira'] },
    { word: 'reloj', hints: ['Objeto', 'Muestra la hora', 'Tiene agujas', 'Tic-tac'] },
    { word: 'pingüino', hints: ['Animal', 'Blanco y negro', 'Hielo', 'No vuela'] },
];

const activeGames = new Map();

export default {
    name: 'gartic',
    aliases: ['adivina', 'revelargartic'],
    category: 'games',
    description: 'Inicia el juego adivina la palabra con pistas.',
    usage: '/gartic | /revelargartic',
    cooldown: 5,
    groupOnly: true,

    async execute(sock, msg, args, { command }) {
        const chatJid = msg.key.remoteJid;

        if (command === 'revelargartic') {
            const game = activeGames.get(chatJid);
            if (!game) return sendError(sock, msg, 'No hay partida activa.');
            activeGames.delete(chatJid);
            return reply(sock, msg, `🔓 La palabra era: *${game.word}*`);
        }

        if (activeGames.has(chatJid)) {
            return sendError(sock, msg, 'Ya hay una partida activa. Adivina o usa /revelargartic');
        }

        const game = words[random(0, words.length - 1)];
        activeGames.set(chatJid, game);

        // Mostrar primera pista
        const hidden = game.word.replace(/./g, (c, i) => i === 0 ? c.toUpperCase() : ' _ ');

        let text = '';
        text += `🎨 *GARTIC - Adivina la palabra*\n\n`;
        text += `Palabra: ${hidden}\n`;
        text += `📝 Letras: ${game.word.length}\n\n`;
        text += `💡 Pista 1: ${game.hints[0]}\n`;
        text += `💡 Pista 2: ${game.hints[1]}\n\n`;
        text += `Escribe la respuesta en el chat!`;

        await reply(sock, msg, text);

        // Más pistas después de 30s
        setTimeout(() => {
            if (activeGames.get(chatJid) === game) {
                sock.sendMessage(chatJid, {
                    text: `🎨 *Pistas extra:*\n💡 ${game.hints[2]}\n💡 ${game.hints[3]}`,
                }).catch(() => {});
            }
        }, 30000);

        // Auto-revelar después de 90s
        setTimeout(() => {
            if (activeGames.get(chatJid) === game) {
                activeGames.delete(chatJid);
                sock.sendMessage(chatJid, {
                    text: `⏰ Tiempo agotado! La palabra era: *${game.word}*`,
                }).catch(() => {});
            }
        }, 90000);
    },
};

export function checkGarticAnswer(chatJid, text) {
    const game = activeGames.get(chatJid);
    if (!game) return null;
    if (text.toLowerCase().trim() === game.word.toLowerCase()) {
        activeGames.delete(chatJid);
        return game;
    }
    return null;
}
