<script>
import { register } from '../services/auth';

export default {
    name: 'Register',
    data() {
        return {
            loading: false,
            user: {
                email: '',
                username: '',
                password: '',
            },
        }
    },
    methods: {
        async handleSubmit() {
            try {
                this.loading = true;

                const result = await register(this.user.email, this.user.password, this.user.username);
                
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
        <div class="max-w-md mx-auto">
            <!-- Hero del registro -->
            <div class="text-center mb-8">
                <div class="text-6xl mb-4">✨</div>
                <h1 class="text-4xl font-bold text-crochet-violeta mb-2">
                    ¡Únete a Lanastina!
                </h1>
                <p class="text-crochet-text-secondary">Crea tu cuenta y forma parte de la comunidad crochet</p>
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
                        <label for="username" class="block mb-3 font-semibold text-crochet-text-primary text-lg">
                            👤 Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            class="crochet-input w-full p-4 text-lg"
                            v-model="user.username"
                            required
                            pattern="[a-zA-Z0-9_]+"
                            placeholder="nombre_usuario"
                        >
                        <p class="mt-2 text-sm text-crochet-text-muted flex items-center gap-2">
                            <span class="text-crochet-verde">✓</span> Solo letras, números y guiones bajos
                        </p>
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
                            minlength="6"
                            placeholder="Mínimo 6 caracteres"
                        >
                        <p class="mt-2 text-sm text-crochet-text-muted flex items-center gap-2">
                            <span class="text-crochet-verde">✓</span> Mínimo 6 caracteres
                        </p>
                    </div>
                    
                    <button 
                        type="submit" 
                        class="tejido-accent w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="loading"
                    >
                        <span v-if="loading" class="flex items-center justify-center gap-2">
                            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Creando cuenta...
                        </span>
                        <span v-else class="flex items-center justify-center gap-2">
                            🎉 Crear cuenta
                        </span>
                    </button>
                </form>
                
                <div class="mt-6 pt-6 border-t border-crochet-violeta/20 text-center">
                    <p class="text-crochet-text-secondary">
                        ¿Ya tienes cuenta? 
                        <RouterLink 
                            to="/ingresar" 
                            class="text-crochet-violeta hover:text-crochet-turquesa font-semibold transition-colors"
                        >
                            🔑 Ingresar
                        </RouterLink>
                    </p>
                </div>
            </div>
        </div>
    </template>