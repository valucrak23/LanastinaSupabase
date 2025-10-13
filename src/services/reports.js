import { supabase } from "./supabase";

export async function reportPost(postId, reporterId, reason) {
    const { data, error } = await supabase
        .from('reportes')
        .insert({
            publicacion_id: postId,
            reporter_id: reporterId,
            motivo: reason,
            tipo: 'publicacion'
        })
        .select()
        .single();

    if (error) {
        console.error('[reports.js reportPost] Error al reportar publicación: ', error);
        throw new Error(error.message);
    }

    return data;
}

export async function reportUser(userId, reporterId, reason) {
    const { data, error } = await supabase
        .from('reportes')
        .insert({
            usuario_reportado_id: userId,
            reporter_id: reporterId,
            motivo: reason,
            tipo: 'usuario'
        })
        .select()
        .single();

    if (error) {
        console.error('[reports.js reportUser] Error al reportar usuario: ', error);
        throw new Error(error.message);
    }

    return data;
}

export async function isUserAdmin(userId) {
    const { data, error } = await supabase
        .from('perfiles')
        .select('es_admin')
        .eq('perfil_id', userId)
        .single();

    if (error) {
        console.error('[reports.js isUserAdmin] Error al verificar admin: ', error);
        return false;
    }

    return data?.es_admin || false;
}
