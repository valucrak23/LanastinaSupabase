import { supabase } from "./supabase";

// genera un username único sin caracteres especiales
async function generateUniqueUsername(baseUsername) {
    // quitar todos los caracteres especiales excepto letras, números y guiones bajos
    let cleanUsername = baseUsername
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_{2,}/g, '_') // reemplazar múltiples guiones bajos por uno solo
        .replace(/^_|_$/g, ''); // quitar guiones bajos del inicio y final
    
    // si queda vacío, usar 'usuario'
    if (!cleanUsername) {
        cleanUsername = 'usuario';
    }
    
    // verificar si ya existe
    let finalUsername = cleanUsername;
    let counter = 1;
    
    while (await usernameExists(finalUsername)) {
        finalUsername = `${cleanUsername}${counter}`;
        counter++;
    }
    
    return finalUsername;
}

// verifica si un username ya existe
async function usernameExists(username) {
    const { data, error } = await supabase
        .from('perfiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();
    
    return !error && data !== null;
}

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

export async function upsertUserProfile(userId, email, nombre = null, apellido = '', username = null) {
    const emailUsername = email.split('@')[0];
    
    // verificar si el perfil ya existe
    try {
        const existingProfile = await getUserProfile(userId);
        return existingProfile; // Retorna perfil existente sin modificarlo
    } catch (error) {
        // perfil no existe, crear uno nuevo
    }
    
    // generar username limpio sin caracteres especiales
    const baseUsername = username || emailUsername;
    const cleanUsername = await generateUniqueUsername(baseUsername);
    
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
            username: cleanUsername,
            es_admin: false
        })
        .select()
        .single();

    if (error) {
        console.error('[users.js upsertUserProfile] Error al crear el perfil: ', error);
        
        // Si es error de clave duplicada, intentar obtener el perfil existente
        if (error.code === '23505' || error.message.includes('duplicate key')) {
            try {
                const existingProfile = await getUserProfile(userId);
                return existingProfile;
            } catch (getError) {
                console.error('[users.js] Error al obtener perfil existente:', getError);
                throw new Error(error.message); // Lanzar el error original si no se puede obtener el perfil
            }
        }
        
        throw new Error(error.message);
    }

    return data;
}

export async function getUserByUsername(username) {
    const { data, error } = await supabase
        .from('perfiles')
        .select('perfil_id, username, nombre, apellido')
        .eq('username', username)
        .maybeSingle(); // Usar maybeSingle() en lugar de single()

    if (error) {
        console.error('[users.js getUserByUsername] Error al buscar usuario por username: ', error);
        return null;
    }

    return data; // Retorna null si no se encuentra, o el objeto si se encuentra
}

