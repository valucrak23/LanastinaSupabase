<script>
import { login } from '../services/auth';

export default {
    name: 'Login',
    data() {
        return {
            loading: false,
            user: {
                email: '',
                password: '',
                remember: true,
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
        <div class="max-w-md mx-auto">
            <!-- Hero del login -->
            <div class="text-center mb-8">
                <div class="text-6xl mb-4">🔑</div>
                <h1 class="text-4xl font-bold text-crochet-violeta mb-2">
                    ¡Bienvenida de vuelta!
                </h1>
                <p class="text-crochet-text-secondary">Ingresa a tu cuenta de Lanastina</p>
            </div>

            <div class="crochet-card p-8">
                <form action="#" @submit.prevent="handleSubmit">
                    <div class="mb-6">
                        <label for="email" class="block mb-3 font-semibold text-crochet-text-primary text-lg">
                            📧 Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            class="crochet-input w-full p-4 text-lg"
                            v-model="user.email"
                            required
                            placeholder="tu@email.com"
                        >
                    </div>
                    
                    <div class="mb-6">
                        <label for="password" class="block mb-3 font-semibold text-crochet-text-primary text-lg">
                            🔒 Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            class="crochet-input w-full p-4 text-lg"
                            v-model="user.password"
                            required
                            placeholder="Tu contraseña"
                        >
                    </div>
                    
                    <div class="mb-8">
                        <div class="flex items-center justify-center">
                            <div class="relative">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    v-model="user.remember"
                                    class="sr-only"
                                >
                                <label 
                                    for="remember" 
                                    class="flex items-center cursor-pointer group"
                                >
                                    <div class="relative">
                                        <div class="w-6 h-6 bg-gray-100 rounded-md transition-all duration-300 group-hover:bg-crochet-violeta/20 group-hover:shadow-lg group-hover:shadow-crochet-violeta/20" :class="{ 'bg-crochet-violeta': user.remember }">
                                            <div v-if="user.remember" class="absolute inset-0 flex items-center justify-center">
                                                <div class="w-4 h-4 bg-white rounded-md transform rotate-45 shadow-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <span class="ml-3 text-crochet-text-secondary text-sm font-medium group-hover:text-crochet-violeta transition-colors duration-300">
                                        🧶 Recordarme (sesión persistente)
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        class="tejido-accent w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="loading"
                    >
                        <span v-if="loading" class="flex items-center justify-center gap-2">
                            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Ingresando...
                        </span>
                        <span v-else class="flex items-center justify-center gap-2">
                            🚀 Ingresar
                        </span>
                    </button>
                </form>
                
                <div class="mt-6 pt-6 border-t border-crochet-violeta/20 text-center">
                    <p class="text-crochet-text-secondary">
                        ¿No tienes cuenta? 
                        <RouterLink 
                            to="/crear-cuenta" 
                            class="text-crochet-violeta hover:text-crochet-turquesa font-semibold transition-colors"
                        >
                            ✨ Crear cuenta
                        </RouterLink>
                    </p>
                </div>
            </div>
        </div>
    </template>

<style scoped>
/* Estilos personalizados para el checkbox */
.group:hover .w-6 {
    transform: scale(1.05);
}

.group:active .w-6 {
    transform: scale(0.95);
}

/* Animación suave para el checkmark */
.w-3 {
    animation: checkmark-appear 0.2s ease-out;
}

@keyframes checkmark-appear {
    0% {
        opacity: 0;
        transform: rotate(45deg) scale(0.5);
    }
    100% {
        opacity: 1;
        transform: rotate(45deg) scale(1);
    }
}

/* Efecto de brillo en hover */
.group:hover .w-6::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent, rgba(187, 154, 247, 0.15), transparent);
    border-radius: inherit;
    animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
    0%, 100% {
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
}
</style>