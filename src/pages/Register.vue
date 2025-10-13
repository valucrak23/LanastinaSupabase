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

                const result = await register(this.user.email, this.user.password);
                
                // Verificar si el usuario necesita confirmación
                if (result.user && !result.user.email_confirmed_at) {
                    alert('¡Cuenta creada! Revisa tu email para confirmar tu cuenta antes de iniciar sesión.');
                } else {
                    this.$router.push('/mi-perfil');
                }
            } catch (error) {
                console.error("Error: ", error);
                
                // Mensaje más específico para el error de base de datos
                if (error.message.includes('Database error')) {
                    alert('Error de configuración en la base de datos. Por favor, contacta al administrador o usa el usuario: lanastina@gmail.com');
                } else {
                    alert('Error al crear la cuenta: ' + error.message);
                }
            }

            this.loading = false;
        },
    },
}
</script>

<template>
    <AppH1>Crear una cuenta 🧶</AppH1>
    <p class="mb-6 text-dark-300">Únete a la comunidad de tejedores de Lanastina</p>

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
                minlength="6"
            >
            <p class="mt-1 text-sm text-dark-400">Mínimo 6 caracteres</p>
        </div>
        <button 
            type="submit" 
            class="px-6 py-3 rounded bg-secondary-500 hover:bg-secondary-600 text-white font-semibold transition disabled:bg-gray-400"
            :disabled="loading"
        >
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>
        <p class="mt-4 text-dark-300">
            ¿Ya tienes cuenta? 
            <RouterLink to="/ingresar" class="text-primary-400 hover:text-primary-300 font-semibold">
                Ingresar
            </RouterLink>
        </p>
    </form>
</template>