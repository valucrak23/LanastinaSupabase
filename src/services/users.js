import { supabase } from "./supabase";

export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('perfil_id', userId)
        .single();

    if (error) {
        console.error('[users.js getUserProfile] Error al obtener el perfil: ', error);
        if (error.code === 'PGRST116') {
            throw new Error('El usuario no existe en la base de datos');
        }
        throw new Error(error.message);
    }

    return data;
}

export async function updateUserProfile(userId, updates) {
    const { data, error } = await supabase
        .from('perfiles')
        .update(updates)
        .eq('perfil_id', userId)
        .select()
        .single();

    if (error) {
        console.error('[users.js updateUserProfile] Error al actualizar el perfil: ', error);
        throw new Error(error.message);
    }

    return data;
}

export async function upsertUserProfile(userId, email, nombre = null, apellido = '') {
    const emailUsername = email.split('@')[0];
    
    // verificar si el perfil ya existe
    try {
        const existingProfile = await getUserProfile(userId);
        return existingProfile; // Retorna perfil existente sin modificarlo
    } catch (error) {
        // perfil no existe, crear uno nuevo
    }
    
    // crear perfil si no existe
    const nombreFinal = nombre || emailUsername;
    const apellidoFinal = apellido || '';
    
    const { data, error } = await supabase
        .from('perfiles')
        .insert({
            perfil_id: userId,
            email: email,
            nombre: nombreFinal,
            apellido: apellidoFinal,
            username: emailUsername,
            es_admin: false
        })
        .select()
        .single();

    if (error) {
        console.error('[users.js upsertUserProfile] Error al crear el perfil: ', error);
        throw new Error(error.message);
    }

    return data;
}

