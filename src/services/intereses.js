import { supabase } from "./supabase";

export async function fetchAllIntereses() {
    const { data, error } = await supabase
        .from('intereses')
        .select('*')
        .order('nombre');

    if (error) {
        console.error('[intereses.js fetchAllIntereses] Error al obtener los intereses: ', error);
        throw new Error(error.message);
    }

    return data;
}

export async function fetchUserIntereses(userId) {
    const { data, error } = await supabase
        .from('perfil_intereses')
        .select(`
            interes_id,
            intereses (
                interes_id,
                nombre,
                icono
            )
        `)
        .eq('perfil_id', userId);

    if (error) {
        console.error('[intereses.js fetchUserIntereses] Error al obtener los intereses del usuario: ', error);
        throw new Error(error.message);
    }

    return data.map(item => item.intereses);
}

export async function updateUserIntereses(userId, interesIds) {
    try {
        const { error: deleteError } = await supabase
            .from('perfil_intereses')
            .delete()
            .eq('perfil_id', userId);

        if (deleteError) {
            throw new Error(`Error al eliminar intereses: ${deleteError.message}`);
        }

        if (!interesIds || interesIds.length === 0) {
            return;
        }

        const interesesToInsert = interesIds.map(interesId => ({
            perfil_id: userId,
            interes_id: interesId
        }));

        const { error: insertError } = await supabase
            .from('perfil_intereses')
            .insert(interesesToInsert)
            .select();

        if (insertError) {
            throw new Error(`Error al insertar intereses: ${insertError.message}`);
        }
    } catch (error) {
        console.error('[intereses.js updateUserIntereses] Error general:', error);
        throw error;
    }
}