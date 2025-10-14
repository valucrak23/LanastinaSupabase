<script>
// imports necesarios para la app principal
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
            // datos del usuario logueado
            user: {
                id: null,
                email: null,
            },
            // control del menu mobile
            showMobileMenu: false
        }
    },
    methods: {
        // cerrar sesion y redirigir al login
        handleLogout() {
            logout();
            this.$router.push('/ingresar');
        },
        // mostrar/ocultar menu mobile
        toggleMobileMenu() {
            this.showMobileMenu = !this.showMobileMenu;
        },
        // cerrar menu mobile
        closeMobileMenu() {
            this.showMobileMenu = false;
        },
    },
    mounted() {
        // escuchar cambios en el estado de autenticacion
        subscribeToAuthStateChanges(newUserState => this.user = newUserState);
    }
}
</script>

<template>
            <div class="min-h-screen flex flex-col lana-texture">
                <!-- navegacion principal -->
                <nav class="nav-glow flex items-center justify-between p-4 md:p-6 sticky top-0 z-50">
                    <!-- Logo y título -->
                    <div class="flex items-center gap-2 md:gap-4">
                        <div class="relative">
                            <img src="/logo.png" alt="Logo Lanastina" class="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-crochet-violeta crochet-glow" />
                            <div class="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-crochet-rosa rounded-full animate-pulse"></div>
                        </div>
                        <RouterLink to="/" class="text-xl md:text-3xl font-bold text-crochet-violeta hover:text-crochet-turquesa transition-colors duration-300">
                            <span class="hidden sm:inline">Lanastina</span>
                            <span class="sm:hidden">🧶</span>
                        </RouterLink>
                    </div>
                    
                    <!-- Menú desktop -->
                    <ul class="hidden md:flex gap-4 lg:gap-8 items-center">
                        <li>
                            <RouterLink 
                                to="/" 
                                :class="[
                                    'px-3 py-2 rounded-full transition-all duration-300 font-medium text-sm lg:text-base',
                                    $route.path === '/' 
                                        ? 'bg-crochet-violeta text-white' 
                                        : 'text-crochet-violeta hover:text-black hover:bg-crochet-violeta'
                                ]"
                            >🏠 Inicio</RouterLink>
                        </li>
                        <template v-if="user.id === null">
                            <li>
                                <RouterLink 
                                    to="/ingresar" 
                                    :class="[
                                        'px-3 py-2 rounded-full transition-all duration-300 font-medium text-sm lg:text-base',
                                        $route.path === '/ingresar' 
                                            ? 'bg-crochet-violeta text-white' 
                                            : 'text-crochet-violeta hover:text-black hover:bg-crochet-violeta'
                                    ]"
                                >🔑 Ingresar</RouterLink>
                            </li>
                            <li>
                                <RouterLink 
                                    to="/crear-cuenta" 
                                    :class="[
                                        'px-3 py-2 rounded-full transition-all duration-300 font-medium text-sm lg:text-base hover:scale-105',
                                        $route.path === '/crear-cuenta' 
                                            ? 'bg-crochet-violeta text-white' 
                                            : 'tejido-accent'
                                    ]"
                                >✨ Crear cuenta</RouterLink>
                            </li>
                        </template>
                        <template v-else>
                            <li>
                                <RouterLink 
                                    to="/publicar" 
                                    :class="[
                                        'px-3 py-2 rounded-full transition-all duration-300 font-medium text-sm lg:text-base hover:scale-105',
                                        $route.path === '/publicar' 
                                            ? 'bg-crochet-rosa text-white' 
                                            : 'tejido-rosa'
                                    ]"
                                >📝 Publicar</RouterLink>
                            </li>
                            <li>
                                <RouterLink 
                                    to="/mi-perfil" 
                                    :class="[
                                        'px-3 py-2 rounded-full transition-all duration-300 font-medium text-sm lg:text-base',
                                        $route.path === '/mi-perfil' || $route.path.startsWith('/usuario/')
                                            ? 'bg-crochet-violeta text-white' 
                                            : 'text-crochet-violeta hover:text-black hover:bg-crochet-violeta'
                                    ]"
                                >👤 Perfil</RouterLink>
                            </li>
                            <li>
                                <button 
                                    @click="handleLogout"
                                    class="px-3 py-2 rounded-full text-crochet-violeta hover:text-black hover:bg-crochet-violeta transition-all duration-300 font-medium text-sm lg:text-base"
                                >🚪 Salir</button>
                            </li>
                        </template>
                    </ul>
                    
                    <!-- Menú móvil -->
                    <div class="md:hidden">
                        <button 
                            @click="toggleMobileMenu"
                            class="p-2 text-crochet-text-primary hover:text-crochet-turquesa transition-colors"
                        >
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        
                        <!-- Menú desplegable móvil -->
                        <div v-if="showMobileMenu" class="absolute top-full left-0 right-0 bg-crochet-bg-secondary border-t border-crochet-violeta/20 shadow-lg">
                            <ul class="py-4 px-4 space-y-2">
                                <li>
                                    <RouterLink 
                                        to="/" 
                                        @click="closeMobileMenu"
                                        class="block px-4 py-3 rounded-lg text-crochet-violeta hover:text-black hover:bg-crochet-violeta transition-all duration-300 font-medium"
                                    >🏠 Inicio</RouterLink>
                                </li>
            <template v-if="user.id === null">
                                    <li>
                                        <RouterLink 
                                            to="/ingresar" 
                                            @click="closeMobileMenu"
                                            class="block px-4 py-3 rounded-lg text-crochet-violeta hover:text-black hover:bg-crochet-violeta transition-all duration-300 font-medium"
                                        >🔑 Ingresar</RouterLink>
                                    </li>
                                    <li>
                                        <RouterLink 
                                            to="/crear-cuenta" 
                                            @click="closeMobileMenu"
                                            class="block px-4 py-3 rounded-lg tejido-accent transition-all duration-300 font-medium text-center"
                                        >✨ Crear cuenta</RouterLink>
                                    </li>
            </template>
            <template v-else>
                                    <li>
                                        <RouterLink 
                                            to="/publicar" 
                                            @click="closeMobileMenu"
                                            class="block px-4 py-3 rounded-lg tejido-rosa transition-all duration-300 font-medium text-center"
                                        >📷 Nueva publicación</RouterLink>
                                    </li>
                                    <li>
                                        <RouterLink 
                                            to="/mi-perfil" 
                                            @click="closeMobileMenu"
                                            class="block px-4 py-3 rounded-lg text-crochet-violeta hover:text-black hover:bg-crochet-violeta transition-all duration-300 font-medium"
                                        >🎅 Mi perfil</RouterLink>
                                    </li>
                                    <li>
                                        <button 
                                            @click="handleLogout(); closeMobileMenu()"
                                            class="w-full text-left px-4 py-3 rounded-lg text-crochet-violeta hover:text-black hover:bg-crochet-violeta transition-all duration-300 font-medium"
                                        >🗝 Cerrar sesión</button>
                                    </li>
            </template>
        </ul>
                        </div>
                    </div>
    </nav>
                
                <main class="flex-1 container p-4 md:p-6 mx-auto max-w-6xl">
                    <!-- router view para paginas -->
        <RouterView />
    </main>
                
                <footer class="flex justify-center items-center p-4 md:p-8 bg-crochet-bg-secondary border-t border-crochet-violeta/20">
                    <p class="text-crochet-text-secondary text-center text-sm md:text-base">
                        <span class="text-crochet-violeta">🧶 Lanastina</span> - Red social de tejido &copy; 2025
                        <br class="hidden md:block">
                        <span class="block md:inline md:ml-1 text-xs md:text-sm text-crochet-text-muted">Hecho con 💜 para la comunidad crochet</span>
                    </p>
    </footer>
            </div>
            
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