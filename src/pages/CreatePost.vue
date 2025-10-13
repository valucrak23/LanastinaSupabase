<script>
import AppH1 from '../components/AppH1.vue';
import { createPost } from '../services/posts';
import { subscribeToAuthStateChanges } from '../services/auth';

export default {
    name: 'CreatePost',
    components: { AppH1, },
    data() {
        return {
            user: {
                id: null,
                email: null,
            },
            post: {
                titulo: '',
                descripcion: '',
                imagen_url: '',
            },
            loading: false,
            successMessage: '',
        }
    },
    methods: {
        // envio de nueva publicacion
        async handleSubmit() {
            try {
                this.loading = true;
                this.successMessage = '';

                await createPost({
                    perfil_id: this.user.id,
                    titulo: this.post.titulo,
                    descripcion: this.post.descripcion,
                    imagen_url: this.post.imagen_url || null,
                });

                this.successMessage = '¡Publicación creada con éxito!';
                
                // limpiar formulario
                this.post.titulo = '';
                this.post.descripcion = '';
                this.post.imagen_url = '';

                // redirigir al inicio
                setTimeout(() => {
                    this.$router.push('/');
                }, 1000);
            } catch (error) {
                console.error('[CreatePost.vue] Error al crear la publicación: ', error);
                alert('Error al crear la publicación. Por favor, intenta de nuevo.');
            } finally {
                this.loading = false;
            }
        },
    },
    mounted() {
        // suscribirse al estado de autenticacion
        subscribeToAuthStateChanges(newUserState => this.user = newUserState);
    },
}
</script>

<template>
    <AppH1>Crear nueva publicación 🧶</AppH1>
    <p class="mb-6 text-gray-700">Comparte tu proyecto de tejido con la comunidad</p>

    <div v-if="successMessage" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ successMessage }}
    </div>

    <form 
        action="#"
        @submit.prevent="handleSubmit"
        class="max-w-2xl"
    >
        <div class="mb-4">
            <label for="titulo" class="block mb-2 font-semibold text-pink-900">Título *</label>
            <input
                type="text"
                id="titulo"
                class="w-full p-3 border-2 border-pink-200 rounded focus:border-pink-400 focus:outline-none"
                v-model="post.titulo"
                required
                placeholder="Ej: Sweater de lana merino"
            >
        </div>

        <div class="mb-4">
            <label for="descripcion" class="block mb-2 font-semibold text-pink-900">Descripción *</label>
            <textarea
                id="descripcion"
                rows="8"
                class="w-full p-3 border-2 border-pink-200 rounded focus:border-pink-400 focus:outline-none"
                v-model="post.descripcion"
                required
                placeholder="Cuéntanos sobre tu proyecto: materiales, técnicas utilizadas, tiempo que te llevó, etc."
            ></textarea>
        </div>

        <div class="mb-6">
            <label for="imagen_url" class="block mb-2 font-semibold text-pink-900">URL de imagen (opcional)</label>
            <input
                type="url"
                id="imagen_url"
                class="w-full p-3 border-2 border-pink-200 rounded focus:border-pink-400 focus:outline-none"
                v-model="post.imagen_url"
                placeholder="https://ejemplo.com/imagen.jpg"
            >
            <p class="mt-1 text-sm text-gray-600">Puedes subir tu imagen a un servicio como Imgur y pegar la URL aquí</p>
        </div>

        <button 
            type="submit" 
            class="px-6 py-3 rounded bg-pink-600 hover:bg-pink-700 focus:bg-pink-700 text-white font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            :disabled="loading"
        >
            {{ loading ? 'Publicando...' : 'Publicar' }}
        </button>
    </form>
</template>

