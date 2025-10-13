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

            // Redireccionamos al usuario al login.
            // Esto requiere usar la instanacia de Router de Vue Router.
            // La tenemos disponible en la propiedad especial $router.
            this.$router.push('/ingresar');
        },
    },
    mounted() {
        // Nos suscribimos para recibir los cambios en el estado de autenticación.
        subscribeToAuthStateChanges(newUserState => this.user = newUserState);
    }
    // La propiedad "components" de Vue indica qué componentes usamos en el template.
    // components: { Home, },
}
</script>

<template>
    <!-- 
    En Tailwind, cada clase representa un valor de un estilo.
    La mayoría de estas clases llevan la nomenclatura de:
        <estilo>-<valor>
            
    Por ejemplo:
        .p-4                padding: 1rem;
        .text-xl            font-size: 1.25rem;
        .border-0           border: 0;

    Hay ciertos casos que pueden tener 3 segmentos. Por ejemplo, manejo de colores:
        .text-red-700
        .bg-slate-500
    
    Por último, hay algunas clases (como display o text-decoration) donde el nombre
    de la clase hace referencia solo al valor del estilo.
    Por ejemplo:
        .flex               display: flex;
        .grid               display: grid;
        .underline          text-decoration: underline;
    -->
    <nav class="flex items-center justify-between p-4 bg-pink-100 border-b-2 border-pink-300">
        <h1 class="text-2xl font-bold text-pink-800">🧶 Lanastina</h1>
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
        <!--
        RouterView es un componete que registra globalmente el use(router) (en main.js).
        Esto define dónde queremos que se monte los componentes de las vistas que 
        correspondan a la URL.
        -->
        <RouterView />
    </main>
    <footer class="flex justify-center items-center p-6 bg-pink-800 text-pink-50">
        <p>Lanastina - Red social de tejido &copy; 2025</p>
    </footer>
</template>