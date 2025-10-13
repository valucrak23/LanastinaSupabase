<script>
import AppH1 from '../components/AppH1.vue';
import { fetchAllPosts, subscribeToNewPosts } from '../services/posts';
import { darLike, quitarLike, verificarLike } from '../services/likes';
import { subscribeToAuthStateChanges } from '../services/auth';

export default {
    name: 'Home',
    components: { AppH1, },
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
        /**
         * Formatea una fecha a un formato legible en español.
         * 
         * @param {string} dateString - Fecha en formato ISO
         * @returns {string} Fecha formateada
         */
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
                alert('Debes iniciar sesión para dar like');
                return;
            }

            try {
                const hasLiked = await verificarLike(post.publicacion_id, this.user.id);
                
                if (hasLiked) {
                    await quitarLike(post.publicacion_id, this.user.id);
                    post.total_likes = Math.max(0, post.total_likes - 1);
                    // Actualizar el estado local del like
                    if (post.likes) {
                        post.likes = post.likes.filter(like => like.perfil_id !== this.user.id);
                    }
                } else {
                    const result = await darLike(post.publicacion_id, this.user.id);
                    if (result !== null) { // Solo incrementar si se creó exitosamente
                        post.total_likes = (post.total_likes || 0) + 1;
                        // Actualizar el estado local del like
                        if (!post.likes) {
                            post.likes = [];
                        }
                        post.likes.push({ perfil_id: this.user.id });
                    }
                }
            } catch (error) {
                console.error('[Home.vue] Error al manejar like:', error);
                alert('Error al dar like. Por favor, intenta de nuevo.');
            }
        },
        hasUserLiked(post) {
            if (!this.user.id || !post.likes) return false;
            return post.likes.some(like => like.perfil_id === this.user.id);
        },
        /**
         * Obtiene el nombre para mostrar del usuario.
         * 
         * @param {Object} post - Objeto de publicación
         * @returns {string} Nombre del usuario
         */
        getUserDisplayName(post) {
            return post.perfiles?.username || post.perfiles?.nombre || post.perfiles?.email || 'Usuario desconocido';
        },
    },
    async mounted() {
        try {
            // Cargamos todas las publicaciones.
            this.posts = await fetchAllPosts();
            
            // Nos suscribimos a las nuevas publicaciones en tiempo real.
            subscribeToNewPosts((newPost) => {
                this.posts.unshift(newPost);
            });
            
            // Nos suscribimos a cambios de autenticación
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
    <p class="mb-6 text-lg text-gray-700">
        La red social para amantes del tejido. Comparte tus proyectos, inspírate con otros tejedores y aprende nuevas técnicas.
    </p>

    <section class="mt-8">
        <h2 class="mb-4 text-2xl font-semibold text-pink-800">Publicaciones recientes</h2>
        
        <div v-if="loading" class="text-center py-8">
            <p class="text-gray-600">Cargando publicaciones...</p>
        </div>

        <div v-else-if="posts.length === 0" class="text-center py-8">
            <p class="text-gray-600">Aún no hay publicaciones. ¡Sé el primero en compartir tu proyecto de tejido!</p>
        </div>

        <article 
            v-else
            v-for="post in posts"
            :key="post.publicacion_id"
            class="mb-6 p-6 border-2 border-pink-200 rounded-lg bg-white shadow-sm hover:shadow-md transition"
        >
            <header class="mb-4 flex items-start gap-4">
                <!-- Foto de perfil -->
                <RouterLink :to="`/usuario/${post.perfil_id}`" class="flex-shrink-0">
                    <img 
                        v-if="post.perfiles?.foto_perfil_url" 
                        :src="post.perfiles.foto_perfil_url" 
                        :alt="`Foto de ${getUserDisplayName(post)}`"
                        class="w-12 h-12 rounded-full object-cover border-2 border-pink-300"
                    >
                    <div v-else class="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 text-white flex items-center justify-center font-bold border-2 border-pink-300">
                        {{ post.perfiles?.nombre?.charAt(0) || '?' }}{{ post.perfiles?.apellido?.charAt(0) || '' }}
                    </div>
                </RouterLink>
                
                <!-- Info del post -->
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-pink-900 mb-1">{{ post.titulo }}</h3>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <RouterLink 
                            :to="`/usuario/${post.perfil_id}`"
                            class="font-semibold text-pink-700 hover:text-pink-900"
                        >
                            {{ getUserDisplayName(post) }}
                        </RouterLink>
                        <span>•</span>
                        <time :datetime="post.created_at">{{ formatDate(post.created_at) }}</time>
                    </div>
                </div>
            </header>
            
            <img 
                v-if="post.imagen_url" 
                :src="post.imagen_url" 
                :alt="`Imagen de ${post.titulo}`"
                class="w-full max-h-96 object-cover rounded mb-4"
            >
            
            <p class="text-gray-800 whitespace-pre-wrap mb-4">{{ post.descripcion }}</p>
            
            <!-- Botón de Like -->
            <div class="flex items-center gap-2 pt-4 border-t border-pink-100">
                <button 
                    @click="toggleLike(post)"
                    :class="[
                        'flex items-center gap-2 px-3 py-2 rounded-full transition',
                        hasUserLiked(post) 
                            ? 'bg-pink-100 text-pink-700 border-2 border-pink-300' 
                            : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-pink-50 hover:text-pink-600'
                    ]"
                >
                    <span class="text-lg">{{ hasUserLiked(post) ? '❤️' : '🤍' }}</span>
                    <span class="font-medium">{{ post.total_likes || 0 }} {{ (post.total_likes || 0) === 1 ? 'like' : 'likes' }}</span>
                </button>
            </div>
        </article>
    </section>
</template>