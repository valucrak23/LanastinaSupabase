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

// manejar errores de refresh token silenciosamente
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && !session) {
        // si el refresh falla, limpiar usuario sin mostrar error
        user = { id: null, email: null };
        notifyAll();
    }
});
