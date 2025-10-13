import { supabase } from "./supabase";
import { upsertUserProfile } from "./users";

let user = {
    id: null,
    email: null,
}
let observers = [];

export async function register(email, password) {
    const { data, error } = await supabase
        .auth
        .signUp({
            email,
            password,
        });

    if(error) {
        console.error('[auth.js register] Error al crear el usuario: ', error);
        throw new Error(error.message);
    }

    console.log("[auth.js] Usuario registrado: ", data);
    
    await upsertUserProfile(data.user.id, data.user.email);
    
    user = {
        id: data.user.id,
        email: data.user.email,
    }
    notifyAll();
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
