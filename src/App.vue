<script>
import { logout, subscribeToAuthStateChanges } from './services/auth';
import Popup from './components/Popup.vue';
import { usePopup } from './composables/usePopup';

export default {
    name: 'App',
    components: { Popup },
    setup() {
        const { showPopup, popupConfig, close } = usePopup();
        return { showPopup, popupConfig, close };
    },
    data() {
        return {
            user: {
                id: null,
                email: null,
            },
        }
    },
    methods: {
        handleLogout() {
            logout();
            this.$router.push('/ingresar');
        },
    },
    mounted() {
        subscribeToAuthStateChanges(newUserState => this.user = newUserState);
    }
}
</script>

<template>
    <!-- navegacion principal -->
        <nav class="flex items-center justify-between p-4 bg-dark-800 border-b-2 border-primary-500 girly-shadow">
            <div class="flex items-center gap-3">
                <img src="/logo.png" alt="Logo Lanastina" class="w-8 h-8 rounded-full" />
                <h1 class="text-2xl font-bold text-secondary-400">🧶 Lanastina</h1>
            </div>
        <ul class="flex gap-6">
            <li><RouterLink to="/" class="text-dark-100 hover:text-primary-400 transition font-medium">Inicio</RouterLink></li>
            <template v-if="user.id === null">
                <li><RouterLink to="/ingresar" class="text-dark-100 hover:text-primary-400 transition font-medium">Ingresar</RouterLink></li>
                <li><RouterLink to="/crear-cuenta" class="text-dark-100 hover:text-primary-400 transition font-medium">Crear cuenta</RouterLink></li>
            </template>
            <template v-else>
                <li><RouterLink to="/publicar" class="text-dark-100 hover:text-primary-400 transition font-medium">Nueva publicación</RouterLink></li>
                <li><RouterLink to="/mi-perfil" class="text-dark-100 hover:text-primary-400 transition font-medium">Mi perfil</RouterLink></li>
                <li>
                    <form 
                        action="#"
                        @submit.prevent="handleLogout"
                    >
                        <button type="submit" class="text-dark-100 hover:text-primary-400 transition font-medium">Cerrar sesión</button>
                    </form>
                </li>
            </template>
        </ul>
    </nav>
    <main class="container p-4 mx-auto bg-dark-900 min-h-screen">
        <!-- router view para paginas -->
        <RouterView />
    </main>
    <footer class="flex justify-center items-center p-6 bg-dark-800 text-dark-100 border-t border-primary-500">
        <p class="text-secondary-400">Lanastina - Red social de tejido &copy; 2025</p>
    </footer>
    
    <!-- popup global -->
    <Popup 
        :show="showPopup" 
        :title="popupConfig.title"
        :message="popupConfig.message"
        :type="popupConfig.type"
        @close="close"
        @confirm="close"
    />
</template>