<script>
// imports para la pagina principal
import UserTag from '../components/UserTag.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import Comentarios from '../components/Comentarios.vue';
import { fetchAllPosts, subscribeToPostsChanges } from '../services/posts';
import { darLike, quitarLike, verificarLike } from '../services/likes';
import { subscribeToAuthStateChanges } from '../services/auth';
import { usePopup } from '../composables/usePopup';
import { useUserTags } from '../composables/useUserTags';

export default {
    name: 'Home',
    components: { UserTag, SkeletonLoader, Comentarios },
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
            postsSubscription: null,
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
                await this.show('Ups', 'No se pudo dar like. Probá de nuevo.');
            }
        },
        hasUserLiked(post) {
            if (!this.user.id || !post.likes) return false;
            return post.likes.some(like => like.perfil_id === this.user.id);
        },
        // obtiene nombre del usuario
        getUserDisplayName(post) {
            if (post.perfiles) {
                if (post.perfiles.username) return post.perfiles.username;
                if (post.perfiles.nombre) {
                    const nombre = post.perfiles.nombre;
                    const apellido = post.perfiles.apellido || '';
                    return apellido ? `${nombre} ${apellido}` : nombre;
                }
                if (post.perfiles.email) return post.perfiles.email.split('@')[0];
            }
            
            if (post.perfil_id) {
                return `Usuario ${post.perfil_id.substring(0, 8)}`;
            }
            
            return 'Usuario desconocido';
        },
        
    },
    async mounted() {
        try {
            // cargar publicaciones
            this.posts = await fetchAllPosts();
            
            // suscribirse a cambios en tiempo real de publicaciones
            this.postsSubscription = subscribeToPostsChanges(
                (newPost) => {
                    // Agregar nueva publicación al inicio
                    const exists = this.posts.some(p => p.publicacion_id === newPost.publicacion_id);
                    if (!exists) {
                        this.posts.unshift(newPost);
                    }
                },
                (updatedPost) => {
                    // Actualizar publicación existente
                    const index = this.posts.findIndex(p => p.publicacion_id === updatedPost.publicacion_id);
                    if (index !== -1) {
                        this.posts[index] = updatedPost;
                    }
                },
                (deletedPostId) => {
                    // Eliminar publicación de la lista
                    this.posts = this.posts.filter(p => p.publicacion_id !== deletedPostId);
                }
            );
            
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
    beforeUnmount() {
        // Limpiar suscripción cuando el componente se desmonte
        if (this.postsSubscription) {
            this.postsSubscription.unsubscribe();
        }
    },
}
</script>

    <template>
        <!-- Hero section -->
        <header class="bg-crochet-bg-secondary rounded-3xl p-12 mb-12 text-center border-2 border-crochet-violeta/30">
            <h1 class="text-6xl font-bold mb-6 text-crochet-violeta">
                Bienvenidos a Lanastina!
            </h1>
            <p class="text-xl text-crochet-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
                Un lugar donde las tejedoras compartimos nuestros proyectos, nos inspiramos mutuamente y aprendemos juntas.
            </p>
            <nav aria-label="Características principales">
                <ul class="flex justify-center gap-4 text-crochet-text-muted list-none">
                    <li class="flex items-center gap-2">
                        <span class="text-crochet-verde" aria-hidden="true">✨</span> Proyectos
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="text-crochet-turquesa" aria-hidden="true">🎨</span> Ideas
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="text-crochet-rosa" aria-hidden="true">👥</span> Amigas
                    </li>
                </ul>
            </nav>
        </header>

        <section class="mt-8" aria-label="Publicaciones">
            <h2 class="mb-8 text-3xl font-bold text-crochet-violeta text-center">
                Publicaciones recientes
            </h2>
            
            <div v-if="loading" class="max-w-2xl mx-auto">
                <SkeletonLoader type="post-list" :count="3" />
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
            
            <!-- Botón de Like y Editar -->
            <div class="flex items-center justify-between gap-3 pt-4 border-t border-crochet-violeta/20">
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
                
                <!-- Botón editar (solo si es el autor) -->
                <RouterLink
                    v-if="user && user.id === post.perfil_id"
                    :to="`/editar/${post.publicacion_id}`"
                    class="px-4 py-2 bg-crochet-turquesa hover:bg-crochet-violeta text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                    title="Editar publicación"
                >
                    ✏️ Editar
                </RouterLink>
            </div>
            
            <!-- Comentarios -->
            <Comentarios :publicacion-id="post.publicacion_id" :user="user" />
        </article>
    </section>
</template>