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
            <label for="email" class="block mb-2 font-semibold text-dark-100">Email</label>
            <input
                type="email"
                id="email"
                class="w-full p-3 border-2 border-primary-500 rounded bg-dark-800 text-dark-100 focus:border-primary-400 focus:outline-none"
                v-model="user.email"
                required
            >
        </div>
        <div class="mb-4">
            <label for="password" class="block mb-2 font-semibold text-dark-100">Contraseña</label>
            <input
                type="password"
                id="password"
                class="w-full p-3 border-2 border-primary-500 rounded bg-dark-800 text-dark-100 focus:border-primary-400 focus:outline-none"
                v-model="user.password"
                required
            >
        </div>
        <button 
            type="submit" 
            class="px-6 py-3 rounded bg-secondary-500 hover:bg-secondary-600 text-white font-semibold transition disabled:bg-gray-400"
            :disabled="loading"
        >
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
        <p class="mt-4 text-dark-300">
            ¿No tienes cuenta? 
            <RouterLink to="/crear-cuenta" class="text-primary-400 hover:text-primary-300 font-semibold">
                Crear cuenta
            </RouterLink>
        </p>
    </form>
</template>