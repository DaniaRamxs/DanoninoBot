import Group from '../database/models/Group.js';
import settings from '../config/settings.js';

/**
 * Manejar eventos de participantes del grupo (join/leave/promote/demote)
 */
export async function handleGroupParticipantsUpdate(sock, update) {
    const { id: groupJid, participants, action } = update;

    const group = Group.get(groupJid);
    if (!group) return;

    for (const participant of participants) {
        const number = participant.split('@')[0];

        switch (action) {
            case 'add': {
                // ═══ Bienvenida ═══
                if (group.welcome_enabled) {
                    await sendWelcome(sock, groupJid, participant, group, true);
                } else if (group.welcome2_enabled) {
                    await sendWelcome2(sock, groupJid, participant, group, true);
                }
                break;
            }

            case 'remove': {
                // ═══ Despedida ═══
                if (group.welcome_enabled) {
                    await sendWelcome(sock, groupJid, participant, group, false);
                } else if (group.welcome2_enabled) {
                    await sendWelcome2(sock, groupJid, participant, group, false);
                }
                break;
            }

            case 'promote': {
                if (group.x9_enabled) {
                    await sock.sendMessage(groupJid, {
                        text: `🛡️ @${number} ahora es administrador`,
                        mentions: [participant],
                    });
                }
                break;
            }

            case 'demote': {
                if (group.x9_enabled) {
                    await sock.sendMessage(groupJid, {
                        text: `📉 @${number} ya no es administrador`,
                        mentions: [participant],
                    });
                }
                break;
            }
        }
    }
}

/**
 * Enviar bienvenida CON imagen
 */
async function sendWelcome(sock, groupJid, participant, group, isJoin) {
    const number = participant.split('@')[0];

    try {
        const metadata = await sock.groupMetadata(groupJid);
        const groupName = metadata.subject;
        const memberCount = metadata.participants.length;

        let text = isJoin
            ? (group.welcome_message || `Bienvenid@ @${number} al grupo *${groupName}*! 🎉\nEres el miembro #${memberCount}`)
            : (group.goodbye_message || `Adiós @${number}, te extrañaremos 👋`);

        // Reemplazar variables
        text = text
            .replace(/@user/g, `@${number}`)
            .replace(/@grupo/g, groupName)
            .replace(/@miembros/g, memberCount.toString());

        const imageUrl = isJoin ? group.welcome_image : group.goodbye_image;

        if (imageUrl) {
            await sock.sendMessage(groupJid, {
                image: { url: imageUrl },
                caption: text,
                mentions: [participant],
            });
        } else {
            await sock.sendMessage(groupJid, {
                text,
                mentions: [participant],
            });
        }
    } catch (err) {
        console.error('Error en welcome:', err.message);
    }
}

/**
 * Enviar bienvenida SIN imagen
 */
async function sendWelcome2(sock, groupJid, participant, group, isJoin) {
    const number = participant.split('@')[0];

    try {
        const metadata = await sock.groupMetadata(groupJid);
        const groupName = metadata.subject;
        const memberCount = metadata.participants.length;

        let text = isJoin
            ? (group.welcome2_message || `👋 Bienvenid@ @${number} a *${groupName}*!\nEres el miembro #${memberCount}`)
            : (group.goodbye2_message || `👋 Adiós @${number}`);

        text = text
            .replace(/@user/g, `@${number}`)
            .replace(/@grupo/g, groupName)
            .replace(/@miembros/g, memberCount.toString());

        await sock.sendMessage(groupJid, {
            text,
            mentions: [participant],
        });
    } catch (err) {
        console.error('Error en welcome2:', err.message);
    }
}
