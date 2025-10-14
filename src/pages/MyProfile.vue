<script>
import AppH1 from '../components/AppH1.vue';
import SubidorImagen from '../components/SubidorImagen.vue';
import UserTag from '../components/UserTag.vue';
import { subscribeToAuthStateChanges } from '../services/auth';
import { getUserProfile, updateUserProfile } from '../services/users';
import { fetchUserPosts, deletePost } from '../services/posts';
import { fetchAllIntereses, fetchUserIntereses, updateUserIntereses } from '../services/intereses';
import { darLike, quitarLike, verificarLike } from '../services/likes';
import { usePopup } from '../composables/usePopup';
import { useUserTags } from '../composables/useUserTags';

export default {
    name: 'MyProfile',
    components: { AppH1, SubidorImagen, UserTag },
    setup() {
        const { show } = usePopup();
        const { splitText } = useUserTags();
        return { show, splitText };
    },
    data() {
        return {
            user: {
                id: null,
                email: null,
            },
            profile: {
                nombre: '',
                apellido: '',
                username: '',
                edad: null,
                descripcion: '',
                foto_perfil_url: null,
            },
            posts: [],
            loading: true,
            editing: false,
            saving: false,
            // Intereses
            allIntereses: [],
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
        enableEditing() {
            this.editing = true;
        },
        async saveProfile() {
            try {
                this.saving = true;
                
                // validar nombre
                if (!this.profile.nombre || this.profile.nombre.trim() === '') {
                    await this.show('Error', 'El nombre es obligatorio');
                    return;
                }
                
                // preparar datos para actualizar
                const updates = {
                    nombre: this.profile.nombre ? this.profile.nombre.trim() : '',
                    apellido: this.profile.apellido ? this.profile.apellido.trim() : '',
                    descripcion: this.profile.descripcion ? this.profile.descripcion.trim() : '',
                    foto_perfil_url: this.profile.foto_perfil_url || null
                };
                
                // manejar edad
                if (this.profile.edad && !isNaN(this.profile.edad) && this.profile.edad > 0 && this.profile.edad < 120) {
                    updates.edad = Number(this.profile.edad);
                } else {
                    updates.edad = null;
                }
                
                // actualizar datos del perfil
                await updateUserProfile(this.user.id, updates);
                
                // actualizar intereses
                const selectedIntereses = this.userIntereses.map(interes => interes.interes_id);
                await updateUserIntereses(this.user.id, selectedIntereses);
                
                this.editing = false;
                
                // recargar datos de la BD
                await this.loadProfile();
                await this.loadUserIntereses();
                
                await this.show('Éxito', 'Perfil actualizado correctamente');
            } catch (error) {
                console.error('[MyProfile.vue] Error al actualizar el perfil: ', error);
                await this.show('Error', 'Error al actualizar el perfil. Por favor, intenta de nuevo.');
            } finally {
                this.saving = false;
            }
        },
        async cancelEditing() {
            this.editing = false;
            // recargar datos originales de la BD
            await this.loadProfile();
            await this.loadUserIntereses();
        },
        handleImagenPerfilSubida(url) {
            this.profile.foto_perfil_url = url;
        },
        async loadAllIntereses() {
            try {
                this.allIntereses = await fetchAllIntereses();
            } catch (error) {
                console.error('[MyProfile.vue] Error al cargar intereses: ', error);
            }
        },
        async loadUserIntereses() {
            if (!this.user.id) return;
            try {
                this.userIntereses = await fetchUserIntereses(this.user.id);
            } catch (error) {
                console.error('[MyProfile.vue] Error al cargar intereses del usuario: ', error);
                this.userIntereses = [];
            }
        },
        toggleInteres(interes) {
            const index = this.userIntereses.findIndex(i => i.interes_id === interes.interes_id);
            if (index > -1) {
                this.userIntereses.splice(index, 1);
            } else {
                this.userIntereses.push(interes);
            }
        },
        isInteresSelected(interes) {
            return this.userIntereses.some(i => i.interes_id === interes.interes_id);
        },
        async handleDeletePost(postId) {
            const confirmed = await this.show('Confirmar eliminación', '¿Estás segura de que quieres eliminar esta publicación?', 'confirm');
            if (!confirmed) {
                return;
            }
            
            try {
                await deletePost(postId);
                // remover publicacion de la lista
                this.posts = this.posts.filter(post => post.publicacion_id !== postId);
            } catch (error) {
                console.error('[MyProfile.vue] Error al eliminar la publicación: ', error);
                await this.show('Error', 'Error al eliminar la publicación. Por favor, intenta de nuevo.');
            }
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            const dateFormatter = new Intl.DateTimeFormat('es-AR', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
            });
            return dateFormatter.format(date);
        },
        async loadProfile() {
            if (!this.user.id) return;
            
            try {
                const profileData = await getUserProfile(this.user.id);
                
                // Asignar datos al componente
                this.profile = {
                    nombre: profileData.nombre || '',
                    apellido: profileData.apellido || '',
                    username: profileData.username || '',
                    edad: profileData.edad || null,
                    descripcion: profileData.descripcion || '',
                    foto_perfil_url: profileData.foto_perfil_url || null,
                };
            } catch (error) {
                console.error('[MyProfile.vue] Error al cargar el perfil: ', error);
            }
        },
        async loadPosts() {
            if (!this.user.id) return;
            
            try {
                this.posts = await fetchUserPosts(this.user.id);
            } catch (error) {
                console.error('[MyProfile.vue] Error al cargar las publicaciones: ', error);
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
                console.error('[MyProfile.vue] Error al manejar like:', error);
                await this.show('Error', 'Error al dar like. Por favor, intenta de nuevo.');
            }
        },
        hasUserLiked(post) {
            if (!this.user.id || !post.likes) return false;
            return post.likes.some(like => like.perfil_id === this.user.id);
        },
        
    },
    async mounted() {
        // cargar todos los intereses disponibles
        await this.loadAllIntereses();
        
        // suscribirse al estado de autenticacion
        subscribeToAuthStateChanges(async (newUserState) => {
            this.user = newUserState;
            
            if (this.user.id) {
                await this.loadProfile();
                await this.loadUserIntereses();
                await this.loadPosts();
            }
        });
    },
}
</script>

<template>
    <!-- Header con foto de perfil -->
    <div class="flex items-center gap-6 mb-8">
        <div class="foto-perfil-container">
            <img 
                v-if="profile.foto_perfil_url" 
                :src="profile.foto_perfil_url" 
                :alt="`Mi foto de perfil`"
                class="foto-perfil"
            >
            <div v-else-if="profile.nombre" class="foto-perfil-iniciales">
                {{ profile.nombre.charAt(0) }}{{ profile.apellido ? profile.apellido.charAt(0) : '' }}
            </div>
        </div>
        <div>
            <h1 class="text-3xl font-bold text-pink-900 mb-1">Mi perfil 🧶</h1>
            <p class="text-xl text-crochet-text-primary">@{{ profile.username || (user.email ? user.email.split('@')[0] : 'usuario') }}</p>
        </div>
    </div>

    <section class="mb-8 p-6 border-2 border-crochet-violeta/30 rounded-lg bg-crochet-bg-secondary">
        <h2 class="text-2xl font-semibold text-crochet-text-primary mb-4">Información personal</h2>
        
        <div v-if="!editing">
            <div class="mb-3">
                <p class="text-sm font-semibold text-crochet-text-secondary">Email</p>
                <p class="text-lg">{{ user.email || 'No disponible' }}</p>
            </div>
            
            <div class="mb-3">
                <p class="text-sm font-semibold text-crochet-text-secondary">Username</p>
                <p class="text-lg">@{{ profile.username || 'No configurado' }}</p>
            </div>
            
            <div class="mb-3">
                <p class="text-sm font-semibold text-crochet-text-secondary">Nombre</p>
                <p class="text-lg">{{ profile.nombre || 'No configurado' }}{{ profile.apellido ? ' ' + profile.apellido : '' }}</p>
            </div>
            
            <div class="mb-3" v-if="profile.edad">
                <p class="text-sm font-semibold text-crochet-text-secondary">Edad</p>
                <p class="text-lg">{{ profile.edad }} años</p>
            </div>
            
            <div class="mb-4">
                <p class="text-sm font-semibold text-crochet-text-secondary">Descripción</p>
                <p class="text-lg">{{ profile.descripcion || 'No configurada' }}</p>
            </div>
            
            <div class="mb-4">
                <p class="text-sm font-semibold text-crochet-text-secondary mb-2">Intereses</p>
                
                <!-- Mostrar intereses si existen -->
                <div v-if="userIntereses.length > 0" class="flex flex-wrap gap-2 items-center">
                    <!-- Mostrar los primeros 3 intereses -->
                    <span
                        v-for="interes in displayedIntereses"
                        :key="interes.interes_id"
                        class="px-3 py-2 rounded-full bg-crochet-turquesa text-white text-sm font-bold border-2 border-crochet-turquesa hover:bg-crochet-violeta hover:border-crochet-violeta transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                        {{ interes.icono }} {{ interes.nombre }}
                    </span>
                    
                    <!-- Botón "+" si hay más de 3 intereses -->
                    <button
                        v-if="userIntereses.length > 3 && !showAllIntereses"
                        @click="showAllIntereses = true"
                        class="px-4 py-2 rounded-full bg-crochet-turquesa text-white text-sm font-bold border-2 border-crochet-turquesa hover:bg-crochet-violeta hover:border-crochet-violeta transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-1"
                    >
                        +{{ userIntereses.length - 3 }}
                    </button>
                    
                    <!-- Botón "menos" para colapsar -->
                    <button
                        v-if="showAllIntereses && userIntereses.length > 3"
                        @click="showAllIntereses = false"
                        class="px-4 py-2 rounded-full bg-crochet-violeta text-white text-sm font-bold border-2 border-crochet-violeta hover:bg-crochet-rosa hover:border-crochet-rosa transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        −
                    </button>
                </div>
                
                <!-- Mensaje cuando no hay intereses -->
                <div v-else class="text-crochet-text-muted text-sm">
                    <p>No tienes intereses seleccionados</p>
                    <p class="text-xs mt-1">Ve a "Editar perfil" para seleccionar tus técnicas favoritas</p>
                </div>
            </div>
            
            <button 
                @click="enableEditing"
                class="px-6 py-3 rounded-lg bg-crochet-violeta hover:bg-crochet-turquesa text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
                ✏️ Editar perfil
            </button>
        </div>

        <form v-else @submit.prevent="saveProfile">
            <div class="mb-3">
                <p class="text-sm font-semibold text-crochet-text-secondary">Email</p>
                <p class="text-lg text-crochet-text-muted">{{ user.email || 'No disponible' }}</p>
                <p class="text-xs text-crochet-text-muted mt-1">El email no se puede modificar</p>
            </div>
            
            <div class="mb-3">
                <p class="text-sm font-semibold text-crochet-text-secondary">Username</p>
                <p class="text-lg text-crochet-text-muted">@{{ profile.username }}</p>
                <p class="text-xs text-crochet-text-muted mt-1">El username no se puede modificar</p>
            </div>
            
            <div class="mb-4">
                <label class="block text-sm font-semibold text-crochet-text-secondary mb-2">Foto de perfil</label>
                <SubidorImagen
                    :user-id="user.id"
                    carpeta="perfiles"
                    :imagen-actual="profile.foto_perfil_url"
                    @imagen-subida="handleImagenPerfilSubida"
                />
                <p class="text-xs text-crochet-text-muted mt-1">Sube una foto o déjala vacía para usar iniciales</p>
            </div>
            
            <div class="mb-3">
                <label for="nombre" class="block text-sm font-semibold text-crochet-text-secondary mb-1">Nombre *</label>
                <input
                    type="text"
                    id="nombre"
                    v-model="profile.nombre"
                    class="w-full p-2 border-2 border-crochet-violeta/30 rounded focus:border-pink-400 focus:outline-none"
                    placeholder="Tu nombre"
                    required
                >
            </div>
            
            <div class="mb-3">
                <label for="apellido" class="block text-sm font-semibold text-crochet-text-secondary mb-1">Apellido</label>
                <input
                    type="text"
                    id="apellido"
                    v-model="profile.apellido"
                    class="w-full p-2 border-2 border-crochet-violeta/30 rounded focus:border-pink-400 focus:outline-none"
                    placeholder="Tu apellido"
                >
            </div>
            
            <div class="mb-3">
                <label for="edad" class="block text-sm font-semibold text-crochet-text-secondary mb-1">Edad</label>
                <input
                    type="number"
                    id="edad"
                    v-model.number="profile.edad"
                    class="w-full p-2 border-2 border-crochet-violeta/30 rounded focus:border-pink-400 focus:outline-none"
                    placeholder="Tu edad"
                    min="1"
                    max="120"
                >
            </div>
            
            <div class="mb-4">
                <label for="descripcion" class="block text-sm font-semibold text-crochet-text-secondary mb-1">Descripción</label>
                <textarea
                    id="descripcion"
                    v-model="profile.descripcion"
                    rows="4"
                    class="w-full p-2 border-2 border-crochet-violeta/30 rounded focus:border-pink-400 focus:outline-none"
                    placeholder="Cuéntanos sobre ti y tu pasión por el tejido"
                ></textarea>
            </div>
            
            <div class="mb-4">
                <label class="block text-sm font-semibold text-crochet-text-secondary mb-2">Intereses</label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <button
                        v-for="interes in allIntereses"
                        :key="interes.interes_id"
                        type="button"
                        @click="toggleInteres(interes)"
                        :class="[
                            'p-3 rounded-lg border-2 text-sm font-bold transition-all duration-300 transform hover:scale-105',
                            isInteresSelected(interes) 
                                ? 'bg-crochet-turquesa border-crochet-turquesa text-white shadow-lg' 
                                : 'bg-crochet-bg-card border-crochet-violeta/50 text-crochet-text-secondary hover:border-crochet-turquesa hover:text-white hover:bg-crochet-violeta hover:shadow-md'
                        ]"
                    >
                        {{ interes.icono }} {{ interes.nombre }}
                    </button>
                </div>
                <p class="text-xs text-crochet-text-muted mt-1">Selecciona tus técnicas y estilos favoritos</p>
            </div>
            
            <div class="flex gap-3">
                <button 
                    type="submit"
                    class="px-6 py-3 rounded-lg bg-crochet-turquesa hover:bg-crochet-violeta text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    :disabled="saving"
                >
                    {{ saving ? '⏳ Guardando...' : '💾 Guardar cambios' }}
                </button>
                <button 
                    type="button"
                    @click="cancelEditing"
                    class="px-6 py-3 rounded-lg bg-crochet-violeta hover:bg-crochet-rosa text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    :disabled="saving"
                >
                    ❌ Cancelar
                </button>
            </div>
        </form>
    </section>

    <section>
        <h2 class="text-2xl font-semibold text-crochet-text-primary mb-4">Mis publicaciones</h2>
        
        <div v-if="loading" class="text-center py-8">
            <p class="text-crochet-text-secondary">Cargando publicaciones...</p>
        </div>

        <div v-else-if="posts.length === 0" class="text-center py-8 p-6 border-2 border-crochet-violeta/30 rounded-lg bg-crochet-bg-card">
            <p class="text-crochet-text-secondary mb-3">Aún no tienes publicaciones</p>
            <RouterLink 
                to="/publicar"
                class="inline-block px-6 py-3 rounded-lg bg-crochet-rosa hover:bg-crochet-violeta text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
                Crear mi primera publicación
            </RouterLink>
        </div>

        <article 
            v-else
            v-for="post in posts"
            :key="post.publicacion_id"
            class="mb-6 p-6 border-2 border-crochet-violeta/30 rounded-lg bg-crochet-bg-secondary shadow-sm"
        >
            <header class="mb-4">
                <h3 class="text-xl font-bold text-pink-900 mb-2">{{ post.titulo }}</h3>
                <time :datetime="post.created_at" class="text-sm text-crochet-text-secondary">
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
            
            <!-- Botón de Like y Eliminar -->
            <div class="flex items-center justify-between pt-4">
                <button 
                    @click="toggleLike(post)"
                    :class="[
                        'flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-300 transform hover:scale-105 font-bold',
                        hasUserLiked(post) 
                            ? 'bg-crochet-rosa text-white border-2 border-crochet-rosa shadow-lg' 
                            : 'bg-crochet-bg-card text-crochet-text-secondary border-2 border-crochet-violeta/50 hover:bg-crochet-violeta hover:text-white hover:border-crochet-turquesa hover:shadow-md'
                    ]"
                >
                    <span class="text-lg">{{ hasUserLiked(post) ? '❤️' : '🤍' }}</span>
                    <span class="font-medium">{{ post.total_likes || 0 }} {{ (post.total_likes || 0) === 1 ? 'like' : 'likes' }}</span>
                </button>
                
                <button 
                    @click="handleDeletePost(post.publicacion_id)"
                    class="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition"
                >
                    Eliminar
                </button>
            </div>
        </article>
    </section>
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