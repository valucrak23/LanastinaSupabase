import { supabase } from "./supabase";

export async function createPost({ perfil_id, titulo, descripcion, imagen_url }) {
    const { data, error } = await supabase
        .from('publicaciones')
        .insert({
            perfil_id,
            titulo,
            descripcion,
            imagen_url,
        })
        .select()
        .single();

    if (error) {
        console.error('[posts.js createPost] Error al crear la publicación: ', error);
        throw new Error(error.message);
    }

    return data;
}

export async function fetchAllPosts() {
    const { data, error } = await supabase
        .from('publicaciones')
        .select(`
            *,
            perfiles (
                perfil_id,
                email,
                nombre,
                apellido,
                username,
                foto_perfil_url
            ),
            likes (
                like_id,
                perfil_id
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[posts.js fetchAllPosts] Error al obtener las publicaciones: ', error);
        throw new Error(error.message);
    }

    return data;
}

export async function fetchUserPosts(userId) {
    const { data, error } = await supabase
        .from('publicaciones')
        .select(`
            *,
            perfiles (
                perfil_id,
                email,
                nombre,
                apellido,
                username,
                foto_perfil_url
            ),
            likes (
                like_id,
                perfil_id
            )
        `)
        .eq('perfil_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[posts.js fetchUserPosts] Error al obtener las publicaciones del usuario: ', error);
        throw new Error(error.message);
    }

    return data;
}

export async function deletePost(postId) {
    const { error } = await supabase
        .from('publicaciones')
        .delete()
        .eq('publicacion_id', postId);

    if (error) {
        console.error('[posts.js deletePost] Error al eliminar la publicación: ', error);
        throw new Error(error.message);
    }
}

export function subscribeToNewPosts(callback) {
    const postsChannel = supabase.channel('publicaciones_changes');
    postsChannel.on(
        'postgres_changes',
        {
            event: 'INSERT',
            table: 'publicaciones',
            schema: 'public',
        },
        async (payload) => {
            const { data } = await supabase
                .from('publicaciones')
                .select(`
                    *,
                    perfiles (
                        perfil_id,
                        email,
                        nombre,
                        apellido,
                        username,
                        foto_perfil_url
                    ),
                    likes (
                        like_id,
                        perfil_id
                    )
                `)
                .eq('publicacion_id', payload.new.publicacion_id)
                .single();
            callback(data);
        }
    );
    postsChannel.subscribe();
    return postsChannel;
}