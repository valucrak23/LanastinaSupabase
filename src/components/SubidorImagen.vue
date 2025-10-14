<script>
import { subirImagen, validarImagen } from '../services/imagenes';

export default {
  name: 'SubidorImagen',
  props: {
    userId: {
      type: String,
      required: true
    },
    carpeta: {
      type: String,
      default: 'publicaciones'
    },
    imagenActual: {
      type: String,
      default: null
    }
  },
  emits: ['imagen-subida'],
  data() {
    return {
      subiendo: false,
      preview: this.imagenActual,
      error: null
    }
  },
  watch: {
    imagenActual(newVal) {
      this.preview = newVal;
    }
  },
  methods: {
    // maneja seleccion de archivo
    async handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      // validar imagen
      const validacion = validarImagen(file);
      if (!validacion.valido) {
        this.error = validacion.error;
        return;
      }

      this.error = null;

      // mostrar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.preview = e.target.result;
      };
      reader.readAsDataURL(file);

      // subir imagen
      try {
        this.subiendo = true;
        const url = await subirImagen(file, this.carpeta, this.userId);
        this.$emit('imagen-subida', url);
      } catch (error) {
        this.error = 'Error al subir la imagen. Intenta de nuevo.';
        console.error('[SubidorImagen.vue] Error:', error);
      } finally {
        this.subiendo = false;
      }
    },
    
    // limpia imagen seleccionada
    limpiarImagen() {
      this.preview = null;
      this.error = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
      this.$emit('imagen-subida', null);
    }
  }
}
</script>

<template>
  <div class="subidor-imagen">
    <div v-if="preview" class="preview-container">
      <img :src="preview" alt="Preview de imagen" class="preview-img">
      <button 
        type="button"
        @click="limpiarImagen"
        class="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:bg-crochet-bg-card disabled:cursor-not-allowed"
        :disabled="subiendo"
      >
        ✕ Quitar imagen
      </button>
    </div>

    <div v-else class="upload-container">
      <label for="file-input" class="upload-label">
        <span v-if="!subiendo">📸 Seleccionar imagen</span>
        <span v-else>⏳ Subiendo...</span>
      </label>
      <input
        id="file-input"
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileChange"
        class="file-input"
        :disabled="subiendo"
      >
    </div>

    <p v-if="error" class="mt-2 text-red-600 text-sm">{{ error }}</p>
    <p class="mt-2 text-crochet-text-muted text-xs">JPG, PNG, GIF o WEBP. Máximo 5MB.</p>
  </div>
</template>

<style scoped>
.preview-container {
  text-align: center;
}

.preview-img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.upload-container {
  text-align: center;
  padding: 2rem;
  border: 2px dashed var(--violeta-vivo);
  border-radius: 16px;
  background: var(--bg-card);
  transition: all 0.3s ease;
}

.upload-container:hover {
  border-color: var(--turquesa-vivo);
  background: var(--bg-hover);
}

.upload-label {
  display: inline-block;
  padding: 1rem 2rem;
  background: var(--violeta-vivo);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.upload-label:hover {
  background: var(--turquesa-vivo);
  transform: translateY(-2px);
}

.file-input {
  display: none;
}
</style>

