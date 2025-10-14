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
    console.log('[auth.js] Intentando registrar usuario:', email);
    
    const { data, error } = await supabase
        .auth
        .signUp({
            email,
            password,
        });

    if(error) {
        console.error('[auth.js register] Error completo:', error);
        console.error('[auth.js register] Status:', error.status);
        console.error('[auth.js register] Message:', error.message);
        throw new Error(error.message);
    }

    console.log("[auth.js] Respuesta completa del registro:", data);
    console.log("[auth.js] Usuario creado:", data.user);
    console.log("[auth.js] Email confirmado:", data.user?.email_confirmed_at);
    
    // Intentar crear perfil, pero no fallar si hay error
    if (data.user) {
        try {
            await upsertUserProfile(data.user.id, data.user.email, null, '', username);
            console.log("[auth.js] Perfil creado exitosamente");
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

    console.log("[auth.js] Sesion iniciada: ", data);
    
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
