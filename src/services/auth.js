// imports para manejo de autenticacion
import { supabase } from "./supabase";
import { upsertUserProfile } from "./users";

// estado global del usuario
let user = {
    id: null,
    email: null,
}
// lista de funciones que escuchan cambios de auth
let observers = [];

// registrar nuevo usuario
export async function register(email, password, username = null) {
    const { data, error } = await supabase
        .auth
        .signUp({
            email,
            password,
        });

    if(error) {
        console.error('[auth.js register] Error:', error.message);
        throw new Error(error.message);
    }
    
    // Intentar crear perfil, pero no fallar si hay error
    if (data.user) {
        try {
            await upsertUserProfile(data.user.id, data.user.email, null, '', username);
        } catch (profileError) {
            console.warn("[auth.js] Error al crear perfil, pero usuario registrado:", profileError.message);
            // No lanzar error, el usuario ya está registrado
        }
        
        // Actualizar estado del usuario solo si está confirmado
        if (data.user.email_confirmed_at) {
            user = {
                id: data.user.id,
                email: data.user.email,
            }
            notifyAll();
        }
    }
    
    return data; // Devolver la respuesta completa
}

export async function login(email, password) {
    const { data, error } = await supabase
        .auth
        .signInWithPassword({
            email,
            password,
        });

    if(error) {
        console.error('[auth.js login] Error al iniciar sesión: ', error);
        throw new Error(error.message);
    }

    await upsertUserProfile(data.user.id, data.user.email);
    
    user = {
        id: data.user.id,
        email: data.user.email,
    }
    notifyAll();
}

export async function logout() {
    const { error } = await supabase.auth.signOut();
    
    if(error) {
        console.error('[auth.js logout] Error al cerrar sesión: ', error);
        throw new Error(error.message);
    }
    
    user = {
        id: null,
        email: null,
    }
    notifyAll();
}

export function subscribeToAuthStateChanges(callback) {
    observers.push(callback);
    
    callback(user);
}

function notifyAll() {
    observers.forEach(callback => callback(user));
}

export function getCurrentUser() {
    return user;
}

// cambiar contraseña con limite de una vez por semana
export async function changePassword(newPassword) {
    try {
        // verificar si puede cambiar contraseña (una vez por semana)
        const canChange = await canChangePasswordThisWeek();
        if (!canChange.allowed) {
            throw new Error(`Debes esperar hasta ${canChange.nextAllowedDate} para cambiar tu contraseña nuevamente`);
        }

        // cambiar contraseña en supabase
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('[auth.js] Error al cambiar contraseña:', error);
            throw new Error(error.message);
        }

        // registrar el cambio de contraseña
        await recordPasswordChange();
        
        return { success: true };
    } catch (error) {
        console.error('[auth.js] Error en changePassword:', error);
        throw error;
    }
}

// verificar si puede cambiar contraseña esta semana
async function canChangePasswordThisWeek() {
    try {
        const { data, error } = await supabase
            .from('cambios_contraseña')
            .select('fecha_cambio')
            .eq('perfil_id', user.id)
            .order('fecha_cambio', { ascending: false })
            .limit(1);

        if (error) {
            console.error('[auth.js] Error al verificar cambios de contraseña:', error);
            return { allowed: true }; // permitir si hay error en la consulta
        }

        if (!data || data.length === 0) {
            return { allowed: true }; // nunca ha cambiado contraseña
        }

        const lastChange = new Date(data[0].fecha_cambio);
        const now = new Date();
        const daysDiff = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));

        if (daysDiff >= 7) {
            return { allowed: true };
        } else {
            const nextAllowedDate = new Date(lastChange);
            nextAllowedDate.setDate(nextAllowedDate.getDate() + 7);
            return { 
                allowed: false, 
                nextAllowedDate: nextAllowedDate.toLocaleDateString('es-ES')
            };
        }
    } catch (error) {
        console.error('[auth.js] Error en canChangePasswordThisWeek:', error);
        return { allowed: true }; // permitir si hay error
    }
}

// registrar cambio de contraseña
async function recordPasswordChange() {
    try {
        const { error } = await supabase
            .from('cambios_contraseña')
            .insert({
                perfil_id: user.id,
                fecha_cambio: new Date().toISOString()
            });

        if (error) {
            console.error('[auth.js] Error al registrar cambio de contraseña:', error);
        }
    } catch (error) {
        console.error('[auth.js] Error en recordPasswordChange:', error);
    }
}

// manejar errores de refresh token silenciosamente
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && !session) {
        // si el refresh falla, limpiar usuario sin mostrar error
        user = { id: null, email: null };
        notifyAll();
    }
});
