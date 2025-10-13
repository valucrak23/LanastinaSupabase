import { ref } from 'vue';
import { getUserByUsername } from '../services/users';

export function useUserTags() {
    const userCache = ref({});

    // divide el texto en partes (texto normal y @usuario)
    const splitText = (text) => {
        if (!text) return [];
        // Dividir por @usuario manteniendo el @
        return text.split(/(@[a-zA-Z0-9._-]+)/g).filter(part => part.length > 0);
    };

    // obtiene el ID del usuario por username - BUSCA EN BD SIEMPRE
    const getUserIdByUsername = async (username) => {
        // Si ya está en cache, devolverlo
        if (userCache.value[username]) {
            return userCache.value[username];
        }
        
        // Si no está en cache, buscar en BD
        try {
            const userData = await getUserByUsername(username);
            if (userData) {
                userCache.value[username] = userData.perfil_id;
                return userData.perfil_id;
            }
        } catch (error) {
            console.error('[useUserTags] Error al buscar usuario:', error);
        }
        
        return null;
    };

    return {
        userCache,
        splitText,
        getUserIdByUsername
    };
}
