<script>
import AppH1 from '../components/AppH1.vue';
import { getUserProfile } from '../services/users';
import { fetchUserPosts } from '../services/posts';
import { fetchUserIntereses } from '../services/intereses';

export default {
    name: 'UserProfile',
    components: { AppH1, },
    data() {
        return {
            profile: null,
            posts: [],
            loading: true,
            error: null,
            userIntereses: [],
            showAllIntereses: false,
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
            console.log('[UserProfile.vue] Cargando datos para userId:', userId);
            
            try {
                this.loading = true;
                this.error = null;
                
                // verificar si el usuario existe
                console.log('[UserProfile.vue] Verificando si el usuario existe...');
                const profileData = await getUserProfile(userId);
                console.log('[UserProfile.vue] Perfil cargado exitosamente:', profileData);
                
                this.profile = profileData;
                
                // cargar publicaciones e intereses en paralelo
                const [postsData] = await Promise.all([
                    fetchUserPosts(userId),
                ]);
                
                this.posts = postsData;
                
                // cargar intereses por separado
                try {
                    console.log('[UserProfile.vue] Cargando intereses para userId:', userId);
                    this.userIntereses = await fetchUserIntereses(userId);
                    console.log('[UserProfile.vue] Intereses cargados exitosamente:', this.userIntereses);
                    console.log('[UserProfile.vue] Cantidad de intereses:', this.userIntereses.length);
                } catch (interesesError) {
                    console.error('[UserProfile.vue] Error al cargar intereses del usuario: ', interesesError);
                    console.error('[UserProfile.vue] Error details:', interesesError);
                    this.userIntereses = []; // Fallback a array vacío
                }
            } catch (error) {
                console.error('[UserProfile.vue] Error al cargar los datos del usuario: ', error);
                console.error('[UserProfile.vue] UserId intentado:', userId);
                console.error('[UserProfile.vue] Tipo de error:', typeof error);
                console.error('[UserProfile.vue] Error stack:', error.stack);
                this.error = `No se pudo cargar el perfil del usuario. Error: ${error.message}`;
            } finally {
                this.loading = false;
            }
        },
    },
    mounted() {
        this.loadUserData();
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
    <div v-if="loading" class="text-center py-8">
        <p class="text-gray-600">Cargando perfil...</p>
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
                <p class="text-xl text-gray-700">{{ profile.nombre }}{{ profile.apellido ? ' ' + profile.apellido : '' }}</p>
            </div>
        </div>

        <section class="mb-8 p-6 border-2 border-pink-200 rounded-lg bg-white">
            <h2 class="text-xl font-semibold text-pink-800 mb-3">Sobre este usuario</h2>
            
            <div class="mb-3">
                <p class="text-sm font-semibold text-gray-600">Nombre</p>
                <p class="text-lg">{{ profile.nombre }}{{ profile.apellido ? ' ' + profile.apellido : '' }}</p>
            </div>
            
            <div class="mb-3">
                <p class="text-sm font-semibold text-gray-600">Email</p>
                <p class="text-lg">{{ profile.email }}</p>
            </div>
            
            <div v-if="profile.edad" class="mb-3">
                <p class="text-sm font-semibold text-gray-600">Edad</p>
                <p class="text-lg">{{ profile.edad }} años</p>
            </div>
            
            <div v-if="profile.descripcion" class="mb-3">
                <p class="text-sm font-semibold text-gray-600">Descripción</p>
                <p class="text-lg">{{ profile.descripcion }}</p>
            </div>
            
            <div class="mb-3">
                <p class="text-sm font-semibold text-gray-600 mb-2">Intereses</p>
                
                <!-- Mostrar intereses si existen -->
                <div v-if="userIntereses.length > 0" class="flex flex-wrap gap-2">
                    <!-- Mostrar los primeros 3 intereses -->
                    <span
                        v-for="interes in displayedIntereses"
                        :key="interes.interes_id"
                        class="px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-sm font-medium border border-pink-200 hover:bg-pink-200 transition-colors"
                    >
                        {{ interes.icono }} {{ interes.nombre }}
                    </span>
                    
                    <!-- Botón "+" si hay más de 3 intereses -->
                    <button
                        v-if="userIntereses.length > 3 && !showAllIntereses"
                        @click="showAllIntereses = true"
                        class="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium border border-gray-200 hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                        +{{ userIntereses.length - 3 }}
                    </button>
                    
                    <!-- Botón "menos" para colapsar -->
                    <button
                        v-if="showAllIntereses && userIntereses.length > 3"
                        @click="showAllIntereses = false"
                        class="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium border border-gray-200 hover:bg-gray-200 transition-colors"
                    >
                        −
                    </button>
                </div>
                
                <!-- Mensaje cuando no hay intereses -->
                <div v-else class="text-gray-500 text-sm">
                    <p>Este usuario no tiene intereses seleccionados</p>
                    <p class="text-xs mt-1 text-gray-400">
                        Debug: userIntereses.length = {{ userIntereses.length }}
                    </p>
                </div>
            </div>
        </section>

        <section>
            <h2 class="text-2xl font-semibold text-pink-800 mb-4">
                Publicaciones de @{{ profile.username }}
            </h2>
            
            <div v-if="posts.length === 0" class="text-center py-8 p-6 border-2 border-pink-200 rounded-lg bg-pink-50">
                <p class="text-gray-600">Este usuario aún no tiene publicaciones</p>
            </div>

            <article 
                v-else
                v-for="post in posts"
                :key="post.publicacion_id"
                class="mb-6 p-6 border-2 border-pink-200 rounded-lg bg-white shadow-sm hover:shadow-md transition"
            >
                <header class="mb-4">
                    <h3 class="text-xl font-bold text-pink-900 mb-2">{{ post.titulo }}</h3>
                    <time :datetime="post.created_at" class="text-sm text-gray-600">
                        {{ formatDate(post.created_at) }}
                    </time>
                </header>
                
                <img 
                    v-if="post.imagen_url" 
                    :src="post.imagen_url" 
                    :alt="`Imagen de ${post.titulo}`"
                    class="w-full max-h-96 object-cover rounded mb-4"
                >
                
                <p class="text-gray-800 whitespace-pre-wrap">{{ post.descripcion }}</p>
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

