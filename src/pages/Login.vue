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
                    
                    <div class="mb-8">
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