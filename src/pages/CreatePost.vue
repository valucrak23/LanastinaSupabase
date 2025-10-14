<script>
import AppH1 from '../components/AppH1.vue';
import SubidorImagen from '../components/SubidorImagen.vue';
import { createPost } from '../services/posts';
import { subscribeToAuthStateChanges } from '../services/auth';
import { usePopup } from '../composables/usePopup';

export default {
    name: 'CreatePost',
    components: { AppH1, SubidorImagen },
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
                titulo: '',
                descripcion: '',
                imagen_url: '',
            },
            loading: false,
            successMessage: '',
        }
    },
    methods: {
        // maneja imagen subida
        onImagenSubida(url) {
            this.post.imagen_url = url;
        },

        // envio de nueva publicacion
        async handleSubmit() {
            try {
                this.loading = true;
                this.successMessage = '';

                // Validar que el usuario esté autenticado
                if (!this.user.id) {
                    await this.show('Error', 'Debes estar autenticado para crear una publicación', 'error');
                    this.loading = false;
                    return;
                }

                await createPost(
                    this.post.titulo,
                    this.post.descripcion,
                    this.post.imagen_url || null,
                    this.user.id
                );

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
                await this.show('Ups', 'No se pudo crear la publicación. Probá de nuevo.');
            } finally {
                this.loading = false;
            }
        },
    },
    mounted() {
        // suscribirse al estado de autenticacion
        subscribeToAuthStateChanges(newUserState => {
            this.user = newUserState;
        });
    },
}
</script>

    <template>
        <div class="max-w-2xl mx-auto">
            <!-- Hero del crear post -->
            <div class="text-center mb-8">
                <div class="text-6xl mb-4">📝</div>
                <h1 class="text-4xl font-bold text-crochet-violeta mb-2">
                    ¡Comparte tu proyecto!
                </h1>
                <p class="text-crochet-text-secondary">Inspira a la comunidad con tu trabajo de tejido</p>
            </div>

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

                    <button 
                        type="submit" 
                        class="tejido-rosa w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="loading"
                    >
                        <span v-if="loading" class="flex items-center justify-center gap-2">
                            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Publicando...
                        </span>
                        <span v-else class="flex items-center justify-center gap-2">
                            🚀 Publicar proyecto
                        </span>
                    </button>
                </form>
            </div>
        </div>
    </template>

