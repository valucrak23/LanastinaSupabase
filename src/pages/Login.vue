<script>
import AppH1 from '../components/AppH1.vue';
import { login } from '../services/auth';

export default {
    name: 'Login',
    components: { AppH1, },
    data() {
        return {
            loading: false,
            user: {
                email: '',
                password: '',
            },
        }
    },
    methods: {
        async handleSubmit() {
            try {
                this.loading = true;

                await login(this.user.email, this.user.password);

                this.$router.push('/mi-perfil');
            } catch (error) {
                console.error("Error: ", error);
            }

            this.loading = false;
        },
    },
}
</script>

<template>
    <AppH1>Ingresar a mi cuenta 🧶</AppH1>

    <form 
        action="#"
        @submit.prevent="handleSubmit"
        class="max-w-md"
    >
        <div class="mb-4">
            <label for="email" class="block mb-2 font-semibold text-pink-900">Email</label>
            <input
                type="email"
                id="email"
                class="w-full p-3 border-2 border-pink-200 rounded focus:border-pink-400 focus:outline-none"
                v-model="user.email"
                required
            >
        </div>
        <div class="mb-4">
            <label for="password" class="block mb-2 font-semibold text-pink-900">Contraseña</label>
            <input
                type="password"
                id="password"
                class="w-full p-3 border-2 border-pink-200 rounded focus:border-pink-400 focus:outline-none"
                v-model="user.password"
                required
            >
        </div>
        <button 
            type="submit" 
            class="px-6 py-3 rounded bg-pink-600 hover:bg-pink-700 focus:bg-pink-700 text-white font-semibold transition disabled:bg-gray-400"
            :disabled="loading"
        >
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
        <p class="mt-4 text-gray-700">
            ¿No tienes cuenta? 
            <RouterLink to="/crear-cuenta" class="text-pink-700 hover:text-pink-900 font-semibold">
                Crear cuenta
            </RouterLink>
        </p>
    </form>
</template>