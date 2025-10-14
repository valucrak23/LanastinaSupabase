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

        // Agregar total de likes a cada post
        const postsWithLikes = data.map(post => ({
            ...post,
            total_likes: post.likes ? post.likes.length : 0
        }))


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

        // Agregar total de likes a cada post
        const postsWithLikes = data.map(post => ({
            ...post,
            total_likes: post.likes ? post.likes.length : 0
        }))

        return postsWithLikes
    } catch (error) {
        console.error('Error in fetchUserPosts:', error)
        throw error
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

export function subscribeToNewPosts(callback) {
    const subscription = supabase
        .channel('publicaciones_changes')
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'publicaciones' 
            }, 
            (payload) => {
                console.log('Nueva publicación recibida:', payload)
                callback(payload.new)
            }
        )
        .subscribe()

    return subscription
}
