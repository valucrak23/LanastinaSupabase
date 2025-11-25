import { supabase } from './supabase'

export async function fetchAllPosts() {
    try {
        const { data, error } = await supabase
            .from('publicaciones')
            .select(`
                *,
                perfiles (
                    perfil_id,
                    nombre,
                    apellido,
                    username,
                    foto_perfil_url
                ),
                likes (
                    perfil_id
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching posts:', error)
            throw error
        }

        // Agregar total de likes y normalizar perfiles a cada post
        const postsWithLikes = data.map(post => {
            // Normalizar perfiles: puede venir como array o objeto
            let perfilData = null;
            if (Array.isArray(post.perfiles) && post.perfiles.length > 0) {
                perfilData = post.perfiles[0];
            } else if (post.perfiles && typeof post.perfiles === 'object') {
                perfilData = post.perfiles;
            }
            
            return {
                ...post,
                perfiles: perfilData,
                total_likes: post.likes ? post.likes.length : 0
            };
        })

        return postsWithLikes
    } catch (error) {
        console.error('Error in fetchAllPosts:', error)
        throw error
    }
}

export async function createPost(titulo, descripcion, imagen_url, perfil_id) {
    try {
        const { data, error } = await supabase
            .from('publicaciones')
            .insert({
                titulo,
                descripcion,
                imagen_url,
                perfil_id
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating post:', error)
            throw error
        }

        return data
    } catch (error) {
        console.error('Error in createPost:', error)
        throw error
    }
}

export async function fetchUserPosts(perfil_id) {
    try {
        const { data, error } = await supabase
            .from('publicaciones')
            .select(`
                *,
                perfiles (
                    perfil_id,
                    nombre,
                    apellido,
                    username,
                    foto_perfil_url
                ),
                likes (
                    perfil_id
                )
            `)
            .eq('perfil_id', perfil_id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching user posts:', error)
            throw error
        }

        // Agregar total de likes y normalizar perfiles a cada post
        const postsWithLikes = data.map(post => {
            // Normalizar perfiles: puede venir como array o objeto
            let perfilData = null;
            if (Array.isArray(post.perfiles) && post.perfiles.length > 0) {
                perfilData = post.perfiles[0];
            } else if (post.perfiles && typeof post.perfiles === 'object') {
                perfilData = post.perfiles;
            }
            
            return {
                ...post,
                perfiles: perfilData,
                total_likes: post.likes ? post.likes.length : 0
            };
        })

        return postsWithLikes
    } catch (error) {
        console.error('Error in fetchUserPosts:', error)
        throw error
    }
}

export async function updatePost(post_id, updates) {
    try {
        const { data, error } = await supabase
            .from('publicaciones')
            .update(updates)
            .eq('publicacion_id', post_id)
            .select(`
                *,
                perfiles (
                    perfil_id,
                    nombre,
                    apellido,
                    username,
                    foto_perfil_url
                ),
                likes (
                    perfil_id
                )
            `)
            .single();

        if (error) {
            console.error('Error updating post:', error);
            throw error;
        }

        // Normalizar perfiles y agregar total de likes
        let perfilData = null;
        if (Array.isArray(data.perfiles) && data.perfiles.length > 0) {
            perfilData = data.perfiles[0];
        } else if (data.perfiles && typeof data.perfiles === 'object') {
            perfilData = data.perfiles;
        }
        
        const postWithLikes = {
            ...data,
            perfiles: perfilData,
            total_likes: data.likes ? data.likes.length : 0
        };

        return postWithLikes;
    } catch (error) {
        console.error('Error in updatePost:', error);
        throw error;
    }
}

export async function deletePost(post_id) {
    try {
        const { error } = await supabase
            .from('publicaciones')
            .delete()
            .eq('publicacion_id', post_id)

        if (error) {
            console.error('Error deleting post:', error)
            throw error
        }

        return true
    } catch (error) {
        console.error('Error in deletePost:', error)
        throw error
    }
}

/**
 * Suscribe a cambios en tiempo real de publicaciones
 * @param {Function} onInsert - Callback cuando se inserta una publicación
 * @param {Function} onUpdate - Callback cuando se actualiza una publicación
 * @param {Function} onDelete - Callback cuando se elimina una publicación
 * @returns {Object} Objeto con método unsubscribe para cancelar la suscripción
 */
export function subscribeToPostsChanges(onInsert, onUpdate, onDelete) {
    const channel = supabase
        .channel('publicaciones_changes')
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'publicaciones' 
            }, 
            async (payload) => {
                console.log('[posts.js] Nueva publicación recibida:', payload);
                // Obtener información completa del post con perfil
                const { data: post } = await supabase
                    .from('publicaciones')
                    .select(`
                        *,
                        perfiles (
                            perfil_id,
                            nombre,
                            apellido,
                            username,
                            foto_perfil_url
                        ),
                        likes (
                            perfil_id
                        )
                    `)
                    .eq('publicacion_id', payload.new.publicacion_id)
                    .single();
                
                if (post && onInsert) {
                    // Normalizar perfiles
                    let perfilData = null;
                    if (Array.isArray(post.perfiles) && post.perfiles.length > 0) {
                        perfilData = post.perfiles[0];
                    } else if (post.perfiles && typeof post.perfiles === 'object') {
                        perfilData = post.perfiles;
                    }
                    
                    const postWithLikes = {
                        ...post,
                        perfiles: perfilData,
                        total_likes: post.likes ? post.likes.length : 0
                    };
                    onInsert(postWithLikes);
                }
            }
        )
        .on('postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'publicaciones'
            },
            async (payload) => {
                console.log('[posts.js] Publicación actualizada:', payload);
                if (onUpdate) {
                    // Obtener información completa del post actualizado
                    const { data: post } = await supabase
                        .from('publicaciones')
                        .select(`
                            *,
                            perfiles (
                                perfil_id,
                                nombre,
                                apellido,
                                username,
                                foto_perfil_url
                            ),
                            likes (
                                perfil_id
                            )
                        `)
                        .eq('publicacion_id', payload.new.publicacion_id)
                        .single();
                    
                    if (post) {
                        // Normalizar perfiles
                        let perfilData = null;
                        if (Array.isArray(post.perfiles) && post.perfiles.length > 0) {
                            perfilData = post.perfiles[0];
                        } else if (post.perfiles && typeof post.perfiles === 'object') {
                            perfilData = post.perfiles;
                        }
                        
                        const postWithLikes = {
                            ...post,
                            perfiles: perfilData,
                            total_likes: post.likes ? post.likes.length : 0
                        };
                        onUpdate(postWithLikes);
                    }
                }
            }
        )
        .on('postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'publicaciones'
            },
            (payload) => {
                console.log('[posts.js] Publicación eliminada:', payload);
                if (onDelete) {
                    onDelete(payload.old.publicacion_id);
                }
            }
        )
        .subscribe();

    return {
        unsubscribe: () => {
            supabase.removeChannel(channel);
        }
    };
}

/**
 * Suscribe solo a nuevas publicaciones (mantiene compatibilidad con código existente)
 * @param {Function} callback - Callback cuando se inserta una publicación
 * @returns {Object} Objeto con método unsubscribe
 */
export function subscribeToNewPosts(callback) {
    return subscribeToPostsChanges(callback, null, null);
}
