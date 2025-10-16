<script>
import UserTag from '../components/UserTag.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import { getUserProfile } from '../services/users';
import { fetchUserPosts } from '../services/posts';
import { fetchUserIntereses } from '../services/intereses';
import { darLike, quitarLike, verificarLike } from '../services/likes';
import { subscribeToAuthStateChanges } from '../services/auth';
import { usePopup } from '../composables/usePopup';
import { useUserTags } from '../composables/useUserTags';
import { reportPost, reportUser, isUserAdmin } from '../services/reports';
import { deletePost } from '../services/posts';

export default {
    name: 'UserProfile',
    components: { UserTag, SkeletonLoader },
    setup() {
        const { show } = usePopup();
        const { splitText } = useUserTags();
        return { show, splitText };
    },
    data() {
        return {
            profile: null,
            posts: [],
            loading: true,
            error: null,
            userIntereses: [],
            showAllIntereses: false,
            user: {
                id: null,
                email: null,
            },
            isAdmin: false,
        }
    },
    computed: {
        displayedIntereses() {
            if (this.showAllIntereses || this.userIntereses.length <= 3) {
                return this.userIntereses;
            }
            return this.userIntereses.slice(0, 3);
        }
    },
    methods: {
        formatDate(dateString) {
            const date = new Date(dateString);
            const dateFormatter = new Intl.DateTimeFormat('es-AR', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
            });
            return dateFormatter.format(date);
        },
        async loadUserData() {
            const userId = this.$route.params.id;
            
            try {
                this.loading = true;
                this.error = null;
                
                // verificar si el usuario existe
                const profileData = await getUserProfile(userId);
                this.profile = profileData;
                
                // cargar publicaciones e intereses en paralelo
                const [postsData] = await Promise.all([
                    fetchUserPosts(userId),
                ]);
                
                this.posts = postsData;
                
                // cargar intereses por separado
                try {
                    this.userIntereses = await fetchUserIntereses(userId);
                } catch (interesesError) {
                    console.error('[UserProfile.vue] Error al cargar intereses del usuario: ', interesesError);
                    this.userIntereses = [];
                }
            } catch (error) {
                console.error('[UserProfile.vue] Error al cargar los datos del usuario: ', error);
                this.error = `No se pudo cargar el perfil del usuario. Error: ${error.message}`;
            } finally {
                this.loading = false;
            }
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
                    if (result !== null) {
                        post.total_likes = (post.total_likes || 0) + 1;
                        // actualizar estado local del like
                        if (!post.likes) {
                            post.likes = [];
                        }
                        post.likes.push({ perfil_id: this.user.id });
                    }
                }
            } catch (error) {
                console.error('[UserProfile.vue] Error al manejar like:', error);
                await this.show('Ups', 'No se pudo dar like. Probá de nuevo.');
            }
        },
        hasUserLiked(post) {
            if (!this.user.id || !post.likes) return false;
            return post.likes.some(like => like.perfil_id === this.user.id);
        },
        getTotalLikes(post) {
            return post.likes ? post.likes.length : 0;
        },
        
        async reportPost(post) {
            const reason = await this.show('Reportar publicación', '¿Por qué quieres reportar esta publicación?', 'confirm');
            if (!reason) return;
            
            try {
                await reportPost(post.publicacion_id, this.user.id, reason);
                await this.show('Reporte enviado', 'Lo reportamos. Los admin lo van a revisar.');
            } catch (error) {
                console.error('[UserProfile.vue] Error al reportar publicación:', error);
                await this.show('Ups', 'No se pudo reportar. Probá de nuevo.');
            }
        },
        async reportUser() {
            const reason = await this.show('Reportar usuario', '¿Por qué quieres reportar a este usuario?', 'confirm');
            if (!reason) return;
            
            try {
                await reportUser(this.profile.perfil_id, this.user.id, reason);
                await this.show('Reporte enviado', 'Lo reportamos. Los admin lo van a revisar.');
            } catch (error) {
                console.error('[UserProfile.vue] Error al reportar usuario:', error);
                await this.show('Ups', 'No se pudo reportar. Probá de nuevo.');
            }
        },
        async deletePostAsAdmin(post) {
            const confirmed = await this.show('Eliminar publicación', '¿Estás seguro de que quieres eliminar esta publicación como administrador?', 'confirm');
            if (!confirmed) return;
            
            try {
                await deletePost(post.publicacion_id);
                this.posts = this.posts.filter(p => p.publicacion_id !== post.publicacion_id);
                await this.show('Publicación eliminada', 'La eliminamos.');
            } catch (error) {
                console.error('[UserProfile.vue] Error al eliminar publicación:', error);
                await this.show('Ups', 'No se pudo eliminar. Probá de nuevo.');
            }
        },
    },
    mounted() {
        this.loadUserData();
        // suscribirse a cambios de autenticacion
        subscribeToAuthStateChanges(async (userState) => {
            this.user = userState;
            if (userState && userState.id) {
                this.isAdmin = await isUserAdmin(userState.id);
            } else {
                this.isAdmin = false;
            }
        });
    },
    // watch para cambios de ruta
    watch: {
        '$route.params.id': function() {
            this.loadUserData();
        }
    },
}
</script>

<template>
    <div v-if="loading" class="max-w-2xl mx-auto">
        <SkeletonLoader type="profile" />
    </div>

    <div v-else-if="error" class="text-center py-8">
        <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else>
        <!-- Header con foto de perfil -->
        <div class="flex items-center gap-6 mb-8">
            <div class="foto-perfil-container">
                <img 
                    v-if="profile.foto_perfil_url" 
                    :src="profile.foto_perfil_url" 
                    :alt="`Foto de ${profile.username}`"
                    class="foto-perfil"
                >
                <div v-else class="foto-perfil-iniciales">
                    {{ profile.nombre.charAt(0) }}{{ profile.apellido ? profile.apellido.charAt(0) : '' }}
                </div>
            </div>
            <div>
                <h1 class="text-3xl font-bold text-pink-900 mb-1">@{{ profile.username }}</h1>
                <p class="text-xl text-crochet-text-primary">{{ profile.nombre }}{{ profile.apellido ? ' ' + profile.apellido : '' }}</p>
            </div>
        </div>

        <section class="mb-8 p-6 border-2 border-crochet-violeta/30 rounded-lg bg-crochet-bg-secondary">
            <div class="flex justify-between items-center mb-3">
                <h2 class="text-xl font-semibold text-crochet-text-primary">Sobre este usuario</h2>
                <button 
                    v-if="user.id && user.id !== profile.perfil_id"
                    @click="reportUser"
                    class="px-3 py-1 rounded bg-crochet-rosa hover:bg-crochet-violeta text-white text-sm font-medium transition"
                >
                    🚨 Reportar usuario
                </button>
            </div>
            
            <div class="mb-3">
                <p class="text-sm font-semibold text-crochet-text-secondary">Nombre</p>
                <p class="text-lg">{{ profile.nombre }}{{ profile.apellido ? ' ' + profile.apellido : '' }}</p>
            </div>
            
            <div class="mb-3">
                <p class="text-sm font-semibold text-crochet-text-secondary">Email</p>
                <p class="text-lg">{{ profile.email }}</p>
            </div>
            
            <div v-if="profile.edad" class="mb-3">
                <p class="text-sm font-semibold text-crochet-text-secondary">Edad</p>
                <p class="text-lg">{{ profile.edad }} años</p>
            </div>
            
            <div v-if="profile.descripcion" class="mb-3">
                <p class="text-sm font-semibold text-crochet-text-secondary">Descripción</p>
                <p class="text-lg">{{ profile.descripcion }}</p>
            </div>
            
            <div class="mb-3">
                <p class="text-sm font-semibold text-crochet-text-secondary mb-2">Intereses</p>
                
                <!-- Mostrar intereses si existen -->
                <div v-if="userIntereses.length > 0" class="flex flex-wrap gap-2">
                    <!-- Mostrar los primeros 3 intereses -->
                    <span
                        v-for="interes in displayedIntereses"
                        :key="interes.interes_id"
                        class="px-3 py-1 rounded-full bg-crochet-bg-card text-crochet-text-primary text-sm font-medium border border-crochet-violeta/30 hover:bg-crochet-bg-hover transition-colors"
                    >
                        {{ interes.icono }} {{ interes.nombre }}
                    </span>
                    
                    <!-- Botón "+" si hay más de 3 intereses -->
                    <button
                        v-if="userIntereses.length > 3 && !showAllIntereses"
                        @click="showAllIntereses = true"
                        class="px-3 py-1 rounded-full bg-crochet-bg-card text-crochet-text-secondary text-sm font-medium border border-crochet-violeta/30 hover:bg-crochet-bg-hover transition-colors flex items-center gap-1"
                    >
                        +{{ userIntereses.length - 3 }}
                    </button>
                    
                    <!-- Botón "menos" para colapsar -->
                    <button
                        v-if="showAllIntereses && userIntereses.length > 3"
                        @click="showAllIntereses = false"
                        class="px-3 py-1 rounded-full bg-crochet-bg-card text-crochet-text-secondary text-sm font-medium border border-crochet-violeta/30 hover:bg-crochet-bg-hover transition-colors"
                    >
                        −
                    </button>
                </div>
                
                <!-- Mensaje cuando no hay intereses -->
                <div v-else class="text-crochet-text-muted text-sm">
                    <p>Este usuario no tiene intereses seleccionados</p>
                </div>
            </div>
        </section>

        <section>
            <h2 class="text-2xl font-semibold text-crochet-text-primary mb-4">
                Publicaciones de @{{ profile.username }}
            </h2>
            
            <div v-if="posts.length === 0" class="text-center py-8 p-6 border-2 border-crochet-violeta/30 rounded-lg bg-crochet-bg-secondary">
                <p class="text-crochet-text-secondary">Este usuario aún no tiene publicaciones</p>
            </div>

            <article 
                v-else
                v-for="post in posts"
                :key="post.publicacion_id"
                class="mb-6 p-6 border-2 border-crochet-violeta/30 rounded-lg bg-crochet-bg-secondary shadow-sm hover:shadow-md transition"
            >
                <header class="mb-4">
                    <h3 class="text-xl font-bold text-pink-900 mb-2">{{ post.titulo }}</h3>
                    <time :datetime="post.created_at" class="text-sm text-crochet-text-muted">
                        {{ formatDate(post.created_at) }}
                    </time>
                </header>
                
                <img 
                    v-if="post.imagen_url" 
                    :src="post.imagen_url" 
                    :alt="`Imagen de ${post.titulo}`"
                    class="w-full aspect-square object-cover rounded-lg mb-4 max-w-md mx-auto"
                >
                
                <div class="text-crochet-text-secondary whitespace-pre-wrap mb-4">
                    <span v-for="(part, index) in splitText(post.descripcion)" :key="index">
                        <UserTag v-if="part.startsWith('@')" :tag="part" />
                        <span v-else>{{ part }}</span>
                    </span>
                </div>
                
                <!-- Botones de Like, Reportar y Eliminar -->
                <div class="flex items-center justify-between pt-4">
                    <button 
                        @click="toggleLike(post)"
                        :class="[
                            'flex items-center gap-2 px-3 py-2 rounded-full transition',
                            hasUserLiked(post) 
                                ? 'bg-crochet-rosa text-white border-2 border-crochet-rosa' 
                                : 'bg-crochet-bg-card text-crochet-text-secondary border-2 border-crochet-violeta/30 hover:bg-crochet-bg-hover hover:text-crochet-text-primary'
                        ]"
                    >
                        <span class="text-lg">{{ hasUserLiked(post) ? '❤️' : '🤍' }}</span>
                        <span class="font-medium">{{ getTotalLikes(post) }} {{ getTotalLikes(post) === 1 ? 'like' : 'likes' }}</span>
                    </button>
                    
                    <div class="flex gap-2">
                        <!-- Botón de reportar (para usuarios no admin) -->
                        <button 
                            v-if="user.id && user.id !== profile.perfil_id"
                            @click="reportPost(post)"
                            class="px-3 py-2 rounded bg-crochet-turquesa hover:bg-crochet-violeta text-white text-sm font-medium transition"
                        >
                            🚨 Reportar
                        </button>
                        
                        <!-- Botón de eliminar (solo para admin) -->
                        <button 
                            v-if="isAdmin"
                            @click="deletePostAsAdmin(post)"
                            class="px-3 py-2 rounded bg-crochet-violeta hover:bg-crochet-rosa text-white text-sm font-medium transition"
                        >
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            </article>
        </section>
    </div>
</template>

<style scoped>
.foto-perfil-container {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
}

.foto-perfil {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #f9a8d4;
}

.foto-perfil-iniciales {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: bold;
    border: 4px solid #f9a8d4;
}
</style>

