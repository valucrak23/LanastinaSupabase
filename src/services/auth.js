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

// configuración de timeout de inactividad (30 minutos)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos en ms
let inactivityTimer = null;
let lastActivity = Date.now();

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
    
    console.log('[auth.js login] Usuario logueado:', user);
    
    // iniciar timer de inactividad
    startInactivityTimer();
    notifyAll();
}

export async function logout() {
    try {
        console.log('[auth.js] Iniciando logout...');
        
        // limpiar timer de inactividad primero
        clearInactivityTimer();
        
        // cerrar sesión en Supabase
        const { error } = await supabase.auth.signOut();
        
        if(error) {
            console.error('[auth.js logout] Error al cerrar sesión: ', error);
            throw new Error(error.message);
        }
        
        console.log('[auth.js] Logout exitoso');
        
        // limpiar estado local
        user = {
            id: null,
            email: null,
        }
        
        // notificar a todos los observadores
        notifyAll();
        
    } catch (error) {
        console.error('[auth.js] Error en logout:', error);
        throw error;
    }
}

export function subscribeToAuthStateChanges(callback) {
    observers.push(callback);
    
    callback(user);
}

function notifyAll() {
    observers.forEach(callback => callback(user));
}

// notificar con flag de inactividad
function notifyAllWithInactivity() {
    observers.forEach(callback => callback({ ...user, inactivityLogout: true }));
}

export function getCurrentUser() {
    return user;
}

// inicializar sesión persistente
export async function initializeAuth() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
            user = {
                id: session.user.id,
                email: session.user.email,
            };
            console.log('[auth.js] Sesión restaurada, iniciando timer de inactividad');
            startInactivityTimer();
            notifyAll();
        } else {
            console.log('[auth.js] No hay sesión activa');
        }
    } catch (error) {
        console.error('[auth.js] Error al inicializar sesión:', error);
    }
}

// manejar actividad del usuario
export function updateActivity() {
    console.log('[auth.js] updateActivity llamada, usuario:', user.id);
    if (user.id) {
        lastActivity = Date.now();
        resetInactivityTimer();
        console.log('[auth.js] Actividad detectada, timer reseteado');
    } else {
        console.log('[auth.js] No hay usuario logueado, ignorando actividad');
    }
}

// iniciar timer de inactividad
function startInactivityTimer() {
    lastActivity = Date.now();
    console.log('[auth.js] Timer de inactividad iniciado');
    resetInactivityTimer();
}

// resetear timer de inactividad
function resetInactivityTimer() {
    clearInactivityTimer();
    
    inactivityTimer = setTimeout(() => {
        console.log('[auth.js] Sesión expirada por inactividad después de', INACTIVITY_TIMEOUT / 1000, 'segundos');
        handleInactivityLogout();
    }, INACTIVITY_TIMEOUT);
    
    console.log('[auth.js] Timer reseteado, expira en', INACTIVITY_TIMEOUT / 1000, 'segundos');
}

// manejar logout por inactividad
async function handleInactivityLogout() {
    try {
        // limpiar timer de inactividad
        clearInactivityTimer();
        
        // cerrar sesión en Supabase
        const { error } = await supabase.auth.signOut();
        
        if(error) {
            console.error('[auth.js] Error al cerrar sesión por inactividad:', error);
        }
        
        // actualizar estado local
        user = {
            id: null,
            email: null,
        }
        
        // notificar con flag de inactividad
        notifyAllWithInactivity();
        
    } catch (error) {
        console.error('[auth.js] Error en handleInactivityLogout:', error);
    }
}

// limpiar timer de inactividad
function clearInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
        console.log('[auth.js] Timer limpiado');
    }
}



// cambiar contraseña (solo una vez por semana)
export async function changePassword(currentPassword, newPassword) {
    try {
        // chequear si puede cambiar (una vez por semana nomás)
        const canChange = await canChangePasswordThisWeek();
        if (!canChange.allowed) {
            throw new Error(`Tenés que esperar hasta ${canChange.nextAllowedDate} para cambiar tu contraseña otra vez`);
        }

        // verificar contraseña actual (lo comenté para evitar quilombos)
        // const { error: signInError } = await supabase.auth.signInWithPassword({
        //     email: user.email,
        //     password: currentPassword
        // });

        // if (signInError) {
        //     throw new Error('La contraseña actual es incorrecta');
        // }

        // cambiar contraseña en supabase
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('[auth.js] Error al cambiar contraseña:', error);
            throw new Error(error.message);
        }

        // guardar que cambió la contraseña
        await recordPasswordChange();
        
        return { success: true };
    } catch (error) {
        console.error('[auth.js] Error en changePassword:', error);
        throw error;
    }
}

// ver si puede cambiar contraseña esta semana
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
            return { allowed: true }; // si hay error, dejarlo pasar
        }

        if (!data || data.length === 0) {
            return { allowed: true }; // nunca cambió contraseña
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
        return { allowed: true }; // si hay error, dejarlo pasar jeje
    }
}

// anotar que cambió la contraseña
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

// manejar cambios de estado de autenticación
supabase.auth.onAuthStateChange((event, session) => {
    console.log('[auth.js] Auth state change:', event, session ? 'con sesión' : 'sin sesión');
    
    if (event === 'SIGNED_IN' && session) {
        user = {
            id: session.user.id,
            email: session.user.email,
        };
        console.log('[auth.js] Usuario autenticado, iniciando timer');
        startInactivityTimer();
        notifyAll();
    } else if (event === 'SIGNED_OUT') {
        console.log('[auth.js] Usuario deslogueado, limpiando estado');
        clearInactivityTimer();
        user = { id: null, email: null };
        notifyAll();
    } else if (event === 'TOKEN_REFRESHED' && !session) {
        console.log('[auth.js] Token refresh falló, limpiando estado');
        clearInactivityTimer();
        user = { id: null, email: null };
        notifyAll();
    }
});
