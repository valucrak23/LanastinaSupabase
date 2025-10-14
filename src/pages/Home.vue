<script>
// imports para la pagina principal
import AppH1 from '../components/AppH1.vue';
import UserTag from '../components/UserTag.vue';
import { fetchAllPosts, subscribeToNewPosts } from '../services/posts';
import { darLike, quitarLike, verificarLike } from '../services/likes';
import { subscribeToAuthStateChanges } from '../services/auth';
import { usePopup } from '../composables/usePopup';
import { useUserTags } from '../composables/useUserTags';

export default {
    name: 'Home',
    components: { AppH1, UserTag },
    setup() {
        const { show } = usePopup();
        const { splitText } = useUserTags();
        return { show, splitText };
    },
    data() {
        return {
            posts: [],
            loading: true,
            user: {
                id: null,
                email: null,
            },
        }
    },
    methods: {
        // formatea fecha
        formatDate(dateString) {
            const date = new Date(dateString);
            const dateFormatter = new Intl.DateTimeFormat('es-AR', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit', 
                minute: '2-digit',
            });
            return dateFormatter.format(date);
        },
        async toggleLike(post) {
            if (!this.user.id) {
                await this.show('Iniciar sesión', 'Debes iniciar sesión para dar like');
                return;
            }

            try {
                const hasLiked = await verificarLike(post.publicacion_id, this.user.id);
                
                if (hasLiked) {
                    await quitarLike(post.publicacion_id, this.user.id);
                    post.total_likes = Math.max(0, post.total_likes - 1);
                    // actualizar estado local del like
                    if (post.likes) {
                        post.likes = post.likes.filter(like => like.perfil_id !== this.user.id);
                    }
                } else {
                    const result = await darLike(post.publicacion_id, this.user.id);
                    if (result !== null) { // Solo incrementar si se creó exitosamente
                        post.total_likes = (post.total_likes || 0) + 1;
                        // actualizar estado local del like
                        if (!post.likes) {
                            post.likes = [];
                        }
                        post.likes.push({ perfil_id: this.user.id });
                    }
                }
            } catch (error) {
                console.error('[Home.vue] Error al manejar like:', error);
                await this.show('Error', 'Error al dar like. Por favor, intenta de nuevo.');
            }
        },
        hasUserLiked(post) {
            if (!this.user.id || !post.likes) return false;
            return post.likes.some(like => like.perfil_id === this.user.id);
        },
        // obtiene nombre del usuario
        getUserDisplayName(post) {
            return post.perfiles?.username || post.perfiles?.nombre || post.perfiles?.email || 'Usuario desconocido';
        },
        
    },
    async mounted() {
        try {
            // cargar publicaciones
            this.posts = await fetchAllPosts();
            
            // suscribirse a nuevas publicaciones
            subscribeToNewPosts((newPost) => {
                this.posts.unshift(newPost);
            });
            
            // suscribirse a cambios de autenticacion
            subscribeToAuthStateChanges((userState) => {
                this.user = userState;
            });
        } catch (error) {
            console.error('[Home.vue] Error al cargar las publicaciones: ', error);
        } finally {
            this.loading = false;
        }
    },
}
</script>

    <template>
        <!-- Hero section -->
        <div class="bg-crochet-bg-secondary rounded-3xl p-12 mb-12 text-center border-2 border-crochet-violeta/30">
                <h1 class="text-6xl font-bold mb-6 text-crochet-violeta">
                    ¡Bienvenida a Lanastina! 🧶
                </h1>
                <p class="text-xl text-crochet-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
                    La red social para amantes del tejido. Comparte tus proyectos, inspírate con otros tejedores y aprende nuevas técnicas.
                </p>
                <div class="flex justify-center gap-4 text-crochet-text-muted">
                    <span class="flex items-center gap-2">
                        <span class="text-crochet-verde">✨</span> Proyectos únicos
                    </span>
                    <span class="flex items-center gap-2">
                        <span class="text-crochet-turquesa">🎨</span> Inspiración
                    </span>
                    <span class="flex items-center gap-2">
                        <span class="text-crochet-rosa">👥</span> Comunidad
                    </span>
                </div>
        </div>

        <section class="mt-8">
            <h2 class="mb-8 text-3xl font-bold text-crochet-violeta text-center">
                📱 Publicaciones recientes
            </h2>
            
            <div v-if="loading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-crochet-violeta"></div>
                <p class="text-crochet-text-secondary mt-4">Cargando publicaciones...</p>
            </div>

            <div v-else-if="posts.length === 0" class="text-center py-12">
                <div class="text-6xl mb-4">🧶</div>
                <p class="text-crochet-text-secondary text-lg">Aún no hay publicaciones. ¡Sé el primero en compartir tu proyecto de tejido!</p>
                <RouterLink 
                    to="/publicar" 
                    class="inline-block mt-6 px-6 py-3 tejido-rosa rounded-full hover:scale-105 transition-all duration-300 font-medium"
                >
                    ✨ Crear primera publicación
                </RouterLink>
            </div>

                <article 
                    v-else
                    v-for="post in posts"
                    :key="post.publicacion_id"
                    class="mb-8 crochet-card p-6 max-w-2xl mx-auto"
                >
            <header class="mb-4 flex items-center gap-4">
                <!-- Foto de perfil -->
                <RouterLink :to="`/usuario/${post.perfil_id}`" class="flex-shrink-0">
                    <img 
                        v-if="post.perfiles?.foto_perfil_url" 
                        :src="post.perfiles.foto_perfil_url" 
                        :alt="`Foto de ${getUserDisplayName(post)}`"
                        class="w-14 h-14 rounded-full object-cover border-2 border-crochet-violeta crochet-glow"
                    >
                        <div v-else class="w-14 h-14 rounded-full bg-gradient-to-br from-crochet-violeta to-crochet-turquesa text-white flex items-center justify-center font-bold text-lg border-2 border-crochet-violeta crochet-glow">
                            {{ post.perfiles?.nombre?.charAt(0) || '?' }}{{ post.perfiles?.apellido?.charAt(0) || '' }}
                        </div>
                </RouterLink>
                
                <!-- Info del post -->
                <div class="flex-1">
                    <div class="flex items-center gap-3">
                            <RouterLink 
                                :to="`/usuario/${post.perfil_id}`"
                                class="font-bold text-crochet-violeta hover:text-crochet-turquesa text-lg transition-colors"
                            >
                                {{ getUserDisplayName(post) }}
                            </RouterLink>
                            <span class="text-crochet-text-muted">•</span>
                            <time :datetime="post.created_at" class="text-sm text-crochet-text-muted">{{ formatDate(post.created_at) }}</time>
                    </div>
                    <h3 class="text-xl font-bold text-crochet-text-primary mt-2">{{ post.titulo }}</h3>
                </div>
            </header>
            
            <img 
                v-if="post.imagen_url" 
                :src="post.imagen_url" 
                :alt="`Imagen de ${post.titulo}`"
                class="w-full aspect-square object-cover rounded-2xl mb-4 border border-crochet-violeta/20"
            >
            
            <div class="text-crochet-text-secondary whitespace-pre-wrap mb-4 text-base leading-relaxed">
                <span v-for="(part, index) in splitText(post.descripcion)" :key="`${post.publicacion_id}-${index}`">
                    <UserTag v-if="part.startsWith('@')" :tag="part" />
                    <span v-else>{{ part }}</span>
                </span>
            </div>
            
            <!-- Botón de Like -->
            <div class="flex items-center gap-3 pt-4 border-t border-crochet-violeta/20">
                <button 
                    @click="toggleLike(post)"
                    :class="[
                        'flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium',
                        hasUserLiked(post) 
                            ? 'tejido-rosa' 
                            : 'bg-crochet-bg-card text-crochet-text-secondary hover:bg-crochet-bg-hover hover:text-crochet-text-primary'
                    ]"
                >
                    <span class="text-lg">{{ hasUserLiked(post) ? '❤️' : '🤍' }}</span>
                    <span class="font-bold">{{ post.total_likes || 0 }}</span>
                    <span class="text-xs">{{ post.total_likes === 1 ? 'like' : 'likes' }}</span>
                </button>
            </div>
        </article>
    </section>
</template>