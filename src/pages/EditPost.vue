<script>
import SubidorImagen from '../components/SubidorImagen.vue';
import { updatePost, fetchAllPosts } from '../services/posts';
import { subscribeToAuthStateChanges } from '../services/auth';
import { usePopup } from '../composables/usePopup';

export default {
    name: 'EditPost',
    components: { SubidorImagen },
    setup() {
        const { show } = usePopup();
        return { show };
    },
    data() {
        return {
            user: {
                id: null,
                email: null,
            },
            post: {
                publicacion_id: null,
                titulo: '',
                descripcion: '',
                imagen_url: '',
            },
            loading: false,
            loadingPost: true,
            successMessage: '',
        }
    },
    methods: {
        // maneja imagen subida
        onImagenSubida(url) {
            this.post.imagen_url = url;
        },

        // envio de publicación editada
        async handleSubmit() {
            try {
                this.loading = true;
                this.successMessage = '';

                // Validar que el usuario esté autenticado
                if (!this.user.id) {
                    await this.show('Error', 'Debes estar autenticado para editar una publicación', 'error');
                    this.loading = false;
                    return;
                }

                // Validar que tenga título y descripción
                if (!this.post.titulo.trim()) {
                    await this.show('Error', 'El título es obligatorio');
                    this.loading = false;
                    return;
                }

                if (!this.post.descripcion.trim()) {
                    await this.show('Error', 'La descripción es obligatoria');
                    this.loading = false;
                    return;
                }

                await updatePost(this.post.publicacion_id, {
                    titulo: this.post.titulo.trim(),
                    descripcion: this.post.descripcion.trim(),
                    imagen_url: this.post.imagen_url || null,
                });

                this.successMessage = '¡Publicación actualizada con éxito!';
                
                // redirigir al inicio después de un momento
                setTimeout(() => {
                    this.$router.push('/');
                }, 1000);
            } catch (error) {
                console.error('[EditPost.vue] Error al actualizar la publicación: ', error);
                await this.show('Ups', 'No se pudo actualizar la publicación. Probá de nuevo.');
            } finally {
                this.loading = false;
            }
        },

        // cargar datos de la publicación
        async loadPost() {
            try {
                this.loadingPost = true;
                const postId = this.$route.params.id;
                
                // Cargar todas las publicaciones y buscar la que corresponde
                const posts = await fetchAllPosts();
                const post = posts.find(p => p.publicacion_id === postId);
                
                if (!post) {
                    await this.show('Error', 'Publicación no encontrada');
                    this.$router.push('/');
                    return;
                }

                // Verificar que el usuario sea el autor
                if (post.perfil_id !== this.user.id) {
                    await this.show('Error', 'No tienes permiso para editar esta publicación');
                    this.$router.push('/');
                    return;
                }

                // Cargar datos del post
                this.post = {
                    publicacion_id: post.publicacion_id,
                    titulo: post.titulo || '',
                    descripcion: post.descripcion || '',
                    imagen_url: post.imagen_url || '',
                };
            } catch (error) {
                console.error('[EditPost.vue] Error al cargar la publicación: ', error);
                await this.show('Error', 'No se pudo cargar la publicación');
                this.$router.push('/');
            } finally {
                this.loadingPost = false;
            }
        }
    },
    async mounted() {
        // suscribirse al estado de autenticacion
        subscribeToAuthStateChanges(async (newUserState) => {
            this.user = newUserState;
            
            if (this.user.id) {
                await this.loadPost();
            } else {
                await this.show('Error', 'Debes iniciar sesión para editar una publicación');
                this.$router.push('/ingresar');
            }
        });
    },
}
</script>

<template>
    <div class="max-w-2xl mx-auto">
        <!-- Hero del editar post -->
        <div class="text-center mb-8">
            <div class="text-6xl mb-4">✏️</div>
            <h1 class="text-4xl font-bold text-crochet-violeta mb-2">
                Editar publicación
            </h1>
            <p class="text-crochet-text-secondary">Modifica los detalles de tu proyecto</p>
        </div>

        <div v-if="loadingPost" class="text-center py-12">
            <div class="text-4xl mb-4">⏳</div>
            <p class="text-crochet-text-secondary">Cargando publicación...</p>
        </div>

        <div v-else>
            <div v-if="successMessage" class="mb-6 p-6 bg-crochet-turquesa border-2 border-crochet-turquesa text-white rounded-2xl text-center">
                <div class="text-4xl mb-2">🎉</div>
                <p class="text-lg font-semibold">{{ successMessage }}</p>
            </div>

            <div class="crochet-card p-8">
                <form action="#" @submit.prevent="handleSubmit">
                    <div class="mb-6">
                        <label for="titulo" class="block mb-3 font-semibold text-crochet-text-primary text-lg">
                            📌 Título de tu proyecto *
                        </label>
                        <input
                            type="text"
                            id="titulo"
                            class="crochet-input w-full p-4 text-lg"
                            v-model="post.titulo"
                            required
                            placeholder="Ej: Sweater de lana merino súper suave"
                        >
                    </div>

                    <div class="mb-6">
                        <label for="descripcion" class="block mb-3 font-semibold text-crochet-text-primary text-lg">
                            📖 Cuéntanos sobre tu proyecto *
                        </label>
                        <textarea
                            id="descripcion"
                            rows="8"
                            class="crochet-input w-full p-4 text-lg resize-none"
                            v-model="post.descripcion"
                            required
                            placeholder="¡Comparte los detalles! ¿Qué materiales usaste? ¿Qué técnicas aplicaste? ¿Cuánto tiempo te llevó? ¿Tienes algún tip para otros tejedores?"
                        ></textarea>
                        <p class="mt-2 text-sm text-crochet-text-muted">
                            💡 Puedes mencionar a otros usuarios usando @usuario
                        </p>
                    </div>

                    <div class="mb-8">
                        <label class="block mb-3 font-semibold text-crochet-text-primary text-lg">
                            📸 Imagen del proyecto (opcional)
                        </label>
                        <SubidorImagen 
                            :userId="user.id"
                            carpeta="publicaciones"
                            :imagenActual="post.imagen_url"
                            @imagen-subida="onImagenSubida"
                        />
                    </div>

                    <div class="flex gap-4">
                        <button 
                            type="submit" 
                            class="flex-1 tejido-rosa py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="loading"
                        >
                            <span v-if="loading" class="flex items-center justify-center gap-2">
                                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Guardando...
                            </span>
                            <span v-else class="flex items-center justify-center gap-2">
                                💾 Guardar cambios
                            </span>
                        </button>
                        <RouterLink
                            to="/"
                            class="px-6 py-4 bg-crochet-bg-card hover:bg-crochet-bg-hover text-crochet-text-primary font-semibold rounded-lg transition-all duration-300 flex items-center"
                        >
                            Cancelar
                        </RouterLink>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

