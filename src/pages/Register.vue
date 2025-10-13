<script>
import AppH1 from '../components/AppH1.vue';
import { register } from '../services/auth';

export default {
    name: 'Register',
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

                await register(this.user.email, this.user.password);

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
    <AppH1>Crear una cuenta 🧶</AppH1>
    <p class="mb-6 text-gray-700">Únete a la comunidad de tejedores de Lanastina</p>

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
                minlength="6"
            >
            <p class="mt-1 text-sm text-gray-600">Mínimo 6 caracteres</p>
        </div>
        <button 
            type="submit" 
            class="px-6 py-3 rounded bg-pink-600 hover:bg-pink-700 focus:bg-pink-700 text-white font-semibold transition disabled:bg-gray-400"
            :disabled="loading"
        >
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>
        <p class="mt-4 text-gray-700">
            ¿Ya tienes cuenta? 
            <RouterLink to="/ingresar" class="text-pink-700 hover:text-pink-900 font-semibold">
                Ingresar
            </RouterLink>
        </p>
    </form>
</template>