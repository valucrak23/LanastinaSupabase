<script>
// import Home from './pages/Home.vue';
import { logout, subscribeToAuthStateChanges } from './services/auth';

export default {
    name: 'App',
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

            // redireccionar al login
            this.$router.push('/ingresar');
        },
    },
    mounted() {
        // suscribirse a cambios de autenticacion
        subscribeToAuthStateChanges(newUserState => this.user = newUserState);
    }
}
</script>

<template>
    <!-- navegacion principal -->
    <nav class="flex items-center justify-between p-4 bg-pink-100 border-b-2 border-pink-300">
        <div class="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Lanastina" class="w-8 h-8" />
            <h1 class="text-2xl font-bold text-pink-800">🧶 Lanastina</h1>
        </div>
        <ul class="flex gap-6">
            <li><RouterLink to="/" class="text-pink-700 hover:text-pink-900 transition">Inicio</RouterLink></li>
            <template v-if="user.id === null">
                <li><RouterLink to="/ingresar" class="text-pink-700 hover:text-pink-900 transition">Ingresar</RouterLink></li>
                <li><RouterLink to="/crear-cuenta" class="text-pink-700 hover:text-pink-900 transition">Crear cuenta</RouterLink></li>
            </template>
            <template v-else>
                <li><RouterLink to="/publicar" class="text-pink-700 hover:text-pink-900 transition">Nueva publicación</RouterLink></li>
                <li><RouterLink to="/mi-perfil" class="text-pink-700 hover:text-pink-900 transition">Mi perfil</RouterLink></li>
                <li>
                    <form 
                        action="#"
                        @submit.prevent="handleLogout"
                    >
                        <button type="submit" class="text-pink-700 hover:text-pink-900 transition">Cerrar sesión</button>
                    </form>
                </li>
            </template>
        </ul>
    </nav>
    <main class="container p-4 mx-auto">
        <!-- router view para paginas -->
        <RouterView />
    </main>
    <footer class="flex justify-center items-center p-6 bg-pink-800 text-pink-50">
        <p>Lanastina - Red social de tejido &copy; 2025</p>
    </footer>
</template>