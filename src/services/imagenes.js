import { supabase } from "./supabase";

export async function subirImagen(file, carpeta, userId) {
  try {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const nombreArchivo = `${userId}_${timestamp}.${extension}`;
    const rutaCompleta = `${carpeta}/${userId}/${nombreArchivo}`;

    const { data, error } = await supabase.storage
      .from('imagenes')
      .upload(rutaCompleta, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('[imagenes.js subirImagen] Error al subir imagen:', error);
      throw new Error(error.message);
    }

    const { data: urlData } = supabase.storage
      .from('imagenes')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('[imagenes.js subirImagen] Error general:', error);
    throw error;
  }
}

export async function eliminarImagen(url) {
  try {
    if (!url || !url.includes('/storage/v1/object/public/imagenes/')) {
      return;
    }

    const path = url.split('/storage/v1/object/public/imagenes/')[1];
    
    const { error } = await supabase.storage
      .from('imagenes')
      .remove([path]);

    if (error) {
      console.error('[imagenes.js eliminarImagen] Error al eliminar imagen:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('[imagenes.js eliminarImagen] Error general:', error);
    throw error;
  }
}

export function validarImagen(file, maxSizeMB = 5) {
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!tiposPermitidos.includes(file.type)) {
    return {
      valido: false,
      error: 'Tipo de archivo no permitido. Usa JPG, PNG, GIF o WebP.'
    };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valido: false,
      error: `El archivo es muy grande. Máximo ${maxSizeMB}MB.`
    };
  }
  
  return { valido: true, error: null };
}