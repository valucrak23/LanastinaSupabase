import { supabase } from "./supabase";

export async function darLike(publicacionId, userId) {
    const { data, error } = await supabase
        .from('likes')
        .insert({
            publicacion_id: publicacionId,
            perfil_id: userId
        })
        .select()
        .single();

    if (error) {
        // Si ya existe el like, no es un error real
        if (error.code === '23505') { // Violación de constraint único
            console.log('[likes.js darLike] Like ya existe');
            return null;
        }
        console.error('[likes.js darLike] Error al dar like: ', error);
        throw new Error(error.message);
    }

    return data;
}

export async function quitarLike(publicacionId, userId) {
    const { error } = await supabase
        .from('likes')
        .delete()
        .eq('publicacion_id', publicacionId)
        .eq('perfil_id', userId);

    if (error) {
        console.error('[likes.js quitarLike] Error al quitar like: ', error);
        throw new Error(error.message);
    }
}

export async function verificarLike(publicacionId, userId) {
    const { data, error } = await supabase
        .from('likes')
        .select('like_id')
        .eq('publicacion_id', publicacionId)
        .eq('perfil_id', userId)
        .limit(1);

    if (error) {
        console.error('[likes.js verificarLike] Error al verificar like: ', error);
        throw new Error(error.message);
    }

    return data && data.length > 0;
}
