import { supabase } from './supabase';

export async function fetchComentariosByPost(publicacion_id) {
    try {
        const { data, error } = await supabase
            .from('comentarios')
            .select(`
                *,
                perfiles (
                    perfil_id,
                    nombre,
                    apellido,
                    username,
                    foto_perfil_url
                )
            `)
            .eq('publicacion_id', publicacion_id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[comentarios.js] Error al obtener comentarios:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('[comentarios.js] Error in fetchComentariosByPost:', error);
        throw error;
    }
}

export async function createComentario(publicacion_id, perfil_id, contenido) {
    try {
        if (!contenido || contenido.trim() === '') {
            throw new Error('El comentario no puede estar vacío');
        }

        const { data, error } = await supabase
            .from('comentarios')
            .insert({
                publicacion_id,
                perfil_id,
                contenido: contenido.trim()
            })
            .select(`
                *,
                perfiles (
                    perfil_id,
                    nombre,
                    apellido,
                    username,
                    foto_perfil_url
                )
            `)
            .single();

        if (error) {
            console.error('[comentarios.js] Error al crear comentario:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('[comentarios.js] Error in createComentario:', error);
        throw error;
    }
}

export async function deleteComentario(comentario_id) {
    try {
        const { error } = await supabase
            .from('comentarios')
            .delete()
            .eq('comentario_id', comentario_id);

        if (error) {
            console.error('[comentarios.js] Error al eliminar comentario:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('[comentarios.js] Error in deleteComentario:', error);
        throw error;
    }
}

export function subscribeToComentarios(publicacion_id, onInsert, onDelete) {
    const channelName = `comentarios_${publicacion_id}`;
    const channel = supabase.channel(channelName);
    
    channel
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'comentarios',
                filter: `publicacion_id=eq.${publicacion_id}`
            },
            async (payload) => {
                console.log('[comentarios.js] Nuevo comentario recibido:', payload);
                
                try {
                    const { data: comentario, error } = await supabase
                        .from('comentarios')
                        .select(`
                            *,
                            perfiles (
                                perfil_id,
                                nombre,
                                apellido,
                                username,
                                foto_perfil_url
                            )
                        `)
                        .eq('comentario_id', payload.new.comentario_id)
                        .single();
                    
                    if (error) {
                        console.error('[comentarios.js] Error al obtener comentario completo:', error);
                        if (onInsert && payload.new) {
                            onInsert(payload.new);
                        }
                    } else if (comentario && onInsert) {
                        onInsert(comentario);
                    }
                } catch (error) {
                    console.error('[comentarios.js] Error en callback de INSERT:', error);
                }
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'comentarios',
                filter: `publicacion_id=eq.${publicacion_id}`
            },
            (payload) => {
                console.log('[comentarios.js] Comentario eliminado:', payload);
                if (onDelete && payload.old) {
                    onDelete(payload.old.comentario_id);
                }
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log(`[comentarios.js] ✅ Suscripción ${channelName} activa`);
            } else if (status === 'CHANNEL_ERROR') {
                console.error(`[comentarios.js] ❌ Error en suscripción ${channelName}`);
            } else {
                console.log(`[comentarios.js] Suscripción ${channelName} estado:`, status);
            }
        });

    return {
        unsubscribe: () => {
            console.log(`[comentarios.js] Desuscribiendo canal ${channelName}`);
            supabase.removeChannel(channel);
        }
    };
}

