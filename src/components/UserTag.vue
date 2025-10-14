        <template>
            <RouterLink 
                v-if="userId" 
                :to="`/usuario/${userId}`"
                class="text-crochet-turquesa hover:text-crochet-rosa font-bold transition-colors duration-300 hover:underline bg-crochet-bg-card px-2 py-1 rounded-full border border-crochet-turquesa/30 hover:border-crochet-rosa hover:bg-crochet-violeta/20"
            >
                {{ tag }}
            </RouterLink>
            <span v-else class="text-crochet-text-muted font-semibold bg-crochet-bg-card px-2 py-1 rounded-full border border-crochet-text-muted/30">
                {{ tag }}
            </span>
        </template>

<script>
import { ref, onMounted } from 'vue';
import { getUserByUsername } from '../services/users';

export default {
    name: 'UserTag',
    props: {
        tag: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const userId = ref(null);

        onMounted(async () => {
            // quitar el @ y limpiar el username (quitar puntos al final, espacios, etc.)
            let username = props.tag.substring(1).trim();
            // quitar puntos al final si los hay
            while (username.endsWith('.')) {
                username = username.slice(0, -1);
            }
            
            console.log('[UserTag] Tag recibido:', props.tag);
            console.log('[UserTag] Username limpio:', username);
            
            try {
                console.log('[UserTag] Llamando a getUserByUsername...');
                const userData = await getUserByUsername(username);
                console.log('[UserTag] Respuesta de getUserByUsername:', userData);
                
                if (userData && userData.perfil_id) {
                    userId.value = userData.perfil_id;
                    console.log('[UserTag] ✅ Usuario encontrado, ID asignado:', userData.perfil_id);
                } else {
                    console.log('[UserTag] ❌ Usuario no encontrado o sin perfil_id');
                }
            } catch (error) {
                console.error('[UserTag] ❌ Error en la búsqueda:', error);
            }
        });

        return {
            userId
        };
    }
};
</script>