<!-- Componente para mostrar y gestionar comentarios de una publicación -->
<template>
    <section class="mt-4 border-t border-crochet-violeta/20 pt-4" aria-label="Comentarios">
        <h3 class="text-lg font-semibold text-crochet-text-primary mb-4 flex items-center gap-2">
            <span aria-hidden="true">💬</span> Comentarios 
            <span v-if="comentarios.length > 0" class="text-sm font-normal text-crochet-text-muted">
                ({{ comentarios.length }})
            </span>
        </h3>

        <!-- Lista de comentarios -->
        <div v-if="comentarios.length > 0" class="space-y-4 mb-4">
            <article 
                v-for="comentario in comentarios" 
                :key="comentario.comentario_id"
                class="bg-crochet-bg-card p-4 rounded-lg border border-crochet-violeta/20"
            >
                <header class="flex items-center gap-3 mb-2">
                    <!-- Foto de perfil -->
                    <RouterLink :to="`/usuario/${comentario.perfiles?.perfil_id}`" class="flex-shrink-0">
                        <img 
                            v-if="comentario.perfiles?.foto_perfil_url" 
                            :src="comentario.perfiles.foto_perfil_url" 
                            :alt="`Foto de ${comentario.perfiles.username || comentario.perfiles.nombre}`"
                            class="w-10 h-10 rounded-full object-cover border-2 border-crochet-violeta"
                        >
                        <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-crochet-violeta to-crochet-turquesa text-white flex items-center justify-center font-bold text-sm border-2 border-crochet-violeta">
                            {{ comentario.perfiles?.nombre?.charAt(0) || '?' }}{{ comentario.perfiles?.apellido?.charAt(0) || '' }}
                        </div>
                    </RouterLink>
                    
                    <!-- Info del usuario -->
                    <div class="flex-1">
                        <RouterLink 
                            :to="`/usuario/${comentario.perfiles?.perfil_id}`"
                            class="font-semibold text-crochet-violeta hover:text-crochet-turquesa transition-colors"
                        >
                            {{ comentario.perfiles?.username || comentario.perfiles?.nombre || 'Usuario' }}
                        </RouterLink>
                        <time :datetime="comentario.created_at" class="block text-xs text-crochet-text-muted">
                            {{ formatDate(comentario.created_at) }}
                        </time>
                    </div>
                    
                    <!-- Botón eliminar (solo si es el autor) -->
                    <button
                        v-if="user && user.id === comentario.perfil_id"
                        @click="handleDeleteComentario(comentario.comentario_id)"
                        class="text-red-500 hover:text-red-600 transition-colors text-sm"
                        :disabled="deletingId === comentario.comentario_id"
                        title="Eliminar comentario"
                    >
                        {{ deletingId === comentario.comentario_id ? '⏳' : '🗑️' }}
                    </button>
                </header>
                
                <!-- Contenido del comentario -->
                <div class="text-crochet-text-secondary whitespace-pre-wrap pl-13">
                    <span v-for="(part, index) in splitText(comentario.contenido)" :key="index">
                        <UserTag v-if="part.startsWith('@')" :tag="part" />
                        <span v-else>{{ part }}</span>
                    </span>
                </div>
            </article>
        </div>

        <!-- Mensaje cuando no hay comentarios -->
        <div v-else class="text-center py-6 text-crochet-text-muted text-sm bg-crochet-bg-card rounded-lg border border-crochet-violeta/20">
            <p>No hay comentarios todavía. ¡Sé el primero en comentar!</p>
        </div>

        <!-- Formulario para agregar comentario -->
        <form v-if="user && user.id" @submit.prevent="handleSubmitComentario" class="mt-4">
            <div class="flex gap-2">
                <textarea
                    v-model="nuevoComentario"
                    rows="2"
                    class="flex-1 crochet-input resize-none"
                    placeholder="Escribe un comentario..."
                    required
                    :disabled="saving"
                ></textarea>
                <button
                    type="submit"
                    class="px-4 py-2 bg-crochet-turquesa hover:bg-crochet-violeta text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    :disabled="saving || !nuevoComentario.trim()"
                >
                    <span v-if="saving">⏳</span>
                    <span v-else>📤</span>
                </button>
            </div>
            <p class="mt-1 text-xs text-crochet-text-muted">
                💡 Puedes mencionar a otros usuarios usando @usuario
            </p>
        </form>

        <!-- Mensaje para usuarios no autenticados -->
        <div v-else class="mt-4 text-center py-3 bg-crochet-bg-card rounded-lg border border-crochet-violeta/20">
            <p class="text-sm text-crochet-text-muted">
                <RouterLink to="/ingresar" class="text-crochet-violeta hover:text-crochet-turquesa font-semibold">
                    Inicia sesión
                </RouterLink>
                para comentar
            </p>
        </div>
    </section>
</template>

<script>
import { fetchComentariosByPost, createComentario, deleteComentario, subscribeToComentarios } from '../services/comentarios';
import { useUserTags } from '../composables/useUserTags';
import { usePopup } from '../composables/usePopup';
import UserTag from './UserTag.vue';

export default {
    name: 'Comentarios',
    components: { UserTag },
    props: {
        publicacionId: {
            type: String,
            required: true
        },
        user: {
            type: Object,
            default: () => ({ id: null, email: null })
        }
    },
    setup() {
        const { splitText } = useUserTags();
        const { show } = usePopup();
        return { splitText, show };
    },
    data() {
        return {
            comentarios: [],
            nuevoComentario: '',
            saving: false,
            deletingId: null,
            subscription: null
        };
    },
    methods: {
        formatDate(dateString) {
            const date = new Date(dateString);
            const dateFormatter = new Intl.DateTimeFormat('es-AR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            return dateFormatter.format(date);
        },
        
        async loadComentarios() {
            try {
                this.comentarios = await fetchComentariosByPost(this.publicacionId);
            } catch (error) {
                console.error('[Comentarios.vue] Error al cargar comentarios:', error);
                await this.show('Error', 'No se pudieron cargar los comentarios');
            }
        },
        
        async handleSubmitComentario() {
            if (!this.user.id || !this.nuevoComentario.trim()) {
                return;
            }

            try {
                this.saving = true;
                const nuevoComentario = await createComentario(this.publicacionId, this.user.id, this.nuevoComentario);
                this.nuevoComentario = '';
                
                // Agregar inmediatamente a la lista para feedback instantáneo
                if (nuevoComentario) {
                    const exists = this.comentarios.some(c => c.comentario_id === nuevoComentario.comentario_id);
                    if (!exists) {
                        this.comentarios.push(nuevoComentario);
                    }
                }
            } catch (error) {
                console.error('[Comentarios.vue] Error al crear comentario:', error);
                await this.show('Error', 'No se pudo crear el comentario. Probá de nuevo.');
            } finally {
                this.saving = false;
            }
        },
        
        async handleDeleteComentario(comentarioId) {
            const confirmed = await this.show('Confirmar eliminación', '¿Estás segura de que quieres eliminar este comentario?', 'confirm');
            if (!confirmed) {
                return;
            }

            try {
                this.deletingId = comentarioId;
                await deleteComentario(comentarioId);
                
                // Remover inmediatamente de la lista para feedback instantáneo
                this.comentarios = this.comentarios.filter(c => c.comentario_id !== comentarioId);
            } catch (error) {
                console.error('[Comentarios.vue] Error al eliminar comentario:', error);
                await this.show('Error', 'No se pudo eliminar el comentario. Probá de nuevo.');
            } finally {
                this.deletingId = null;
            }
        }
    },
    async mounted() {
        await this.loadComentarios();
        
        this.subscription = subscribeToComentarios(
            this.publicacionId,
            (nuevoComentario) => {
                console.log('[Comentarios.vue] Callback onInsert recibido:', nuevoComentario);
                if (nuevoComentario) {
                    const exists = this.comentarios.some(c => c.comentario_id === nuevoComentario.comentario_id);
                    if (!exists) {
                        console.log('[Comentarios.vue] Agregando nuevo comentario a la lista');
                        this.comentarios.push(nuevoComentario);
                    } else {
                        console.log('[Comentarios.vue] El comentario ya existe en la lista');
                    }
                }
            },
            (comentarioId) => {
                console.log('[Comentarios.vue] Callback onDelete recibido para:', comentarioId);
                this.comentarios = this.comentarios.filter(c => c.comentario_id !== comentarioId);
            }
        );
    },
    beforeUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
};
</script>

