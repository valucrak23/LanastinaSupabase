<script>
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
    <AppH1>¡Bienvenida a Lanastina! 🧶</AppH1>
    <p class="mb-6 text-lg text-dark-300">
        La red social para amantes del tejido. Comparte tus proyectos, inspírate con otros tejedores y aprende nuevas técnicas.
    </p>

    <section class="mt-8">
        <h2 class="mb-4 text-2xl font-semibold text-dark-100">Publicaciones recientes</h2>
        
        <div v-if="loading" class="text-center py-8">
            <p class="text-dark-400">Cargando publicaciones...</p>
        </div>

        <div v-else-if="posts.length === 0" class="text-center py-8">
            <p class="text-dark-400">Aún no hay publicaciones. ¡Sé el primero en compartir tu proyecto de tejido!</p>
        </div>

            <article 
                v-else
                v-for="post in posts"
                :key="post.publicacion_id"
                class="mb-4 p-4 border border-primary-500 rounded-lg bg-dark-800 girly-shadow hover:girly-shadow transition max-w-2xl mx-auto"
            >
            <header class="mb-3 flex items-center gap-3">
                <!-- Foto de perfil -->
                <RouterLink :to="`/usuario/${post.perfil_id}`" class="flex-shrink-0">
                    <img 
                        v-if="post.perfiles?.foto_perfil_url" 
                        :src="post.perfiles.foto_perfil_url" 
                        :alt="`Foto de ${getUserDisplayName(post)}`"
                        class="w-10 h-10 rounded-full object-cover border border-primary-500"
                    >
                        <div v-else class="w-10 h-10 rounded-full bg-secondary-500 text-white flex items-center justify-center font-bold text-sm border border-primary-500">
                            {{ post.perfiles?.nombre?.charAt(0) || '?' }}{{ post.perfiles?.apellido?.charAt(0) || '' }}
                        </div>
                </RouterLink>
                
                <!-- Info del post -->
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                            <RouterLink 
                                :to="`/usuario/${post.perfil_id}`"
                                class="font-semibold text-primary-400 hover:text-primary-300 text-sm"
                            >
                                {{ getUserDisplayName(post) }}
                            </RouterLink>
                            <span class="text-dark-400">•</span>
                            <time :datetime="post.created_at" class="text-xs text-dark-400">{{ formatDate(post.created_at) }}</time>
                    </div>
                    <h3 class="text-lg font-bold text-dark-100 mt-1">{{ post.titulo }}</h3>
                </div>
            </header>
            
            <img 
                v-if="post.imagen_url" 
                :src="post.imagen_url" 
                :alt="`Imagen de ${post.titulo}`"
                class="w-full aspect-square object-cover rounded-lg mb-3"
            >
            
            <div class="text-dark-200 whitespace-pre-wrap mb-3 text-sm leading-relaxed">
                <span v-for="(part, index) in splitText(post.descripcion)" :key="`${post.publicacion_id}-${index}`">
                    <UserTag v-if="part.startsWith('@')" :tag="part" />
                    <span v-else>{{ part }}</span>
                </span>
            </div>
            
            <!-- Botón de Like -->
            <div class="flex items-center gap-2 pt-3 border-t border-primary-500">
                <button 
                    @click="toggleLike(post)"
                    :class="[
                        'flex items-center gap-1 px-2 py-1 rounded-full transition text-sm',
                        hasUserLiked(post) 
                            ? 'bg-secondary-500 text-dark-100' 
                            : 'bg-dark-700 text-dark-300 hover:bg-secondary-600 hover:text-dark-100'
                    ]"
                >
                    <span class="text-base">{{ hasUserLiked(post) ? '❤️' : '🤍' }}</span>
                    <span class="font-medium">{{ post.total_likes || 0 }}</span>
                </button>
            </div>
        </article>
    </section>
</template>