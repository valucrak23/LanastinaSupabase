<script>
export default {
    name: 'NotFound',
    methods: {
        goHome() {
            this.$router.push('/');
        },
        goBack() {
            this.$router.go(-1);
        }
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center">
        <div class="text-center max-w-md mx-auto p-8">
            <!-- Icono de error -->
            <div class="text-8xl mb-6 animate-bounce">
                🧶
            </div>
            
            <!-- Título -->
            <h1 class="text-6xl font-bold text-crochet-violeta mb-4">
                404
            </h1>
            
            <!-- Mensaje -->
            <h2 class="text-2xl font-semibold text-crochet-text-primary mb-4">
                ¡Ups! Página no encontrada
            </h2>
            
            <p class="text-crochet-text-secondary mb-8 leading-relaxed">
                Parece que te perdiste en el mundo del tejido. Esta página no existe o fue movida a otro lugar.
            </p>
            
            <!-- Botones de acción -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                    @click="goHome"
                    class="px-6 py-3 bg-crochet-violeta hover:bg-crochet-turquesa text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    🏠 Ir al inicio
                </button>
                
                <button 
                    @click="goBack"
                    class="px-6 py-3 bg-crochet-bg-card hover:bg-crochet-bg-hover text-crochet-text-primary font-semibold rounded-lg border border-crochet-violeta/30 hover:border-crochet-violeta transition-all duration-300 transform hover:scale-105"
                >
                    ← Volver atrás
                </button>
            </div>
            
            <!-- Mensaje adicional -->
            <div class="mt-8 p-4 bg-crochet-bg-secondary rounded-lg border border-crochet-violeta/20">
                <p class="text-sm text-crochet-text-muted">
                    💡 <strong>Tip:</strong> Revisa la URL o usa el menú de navegación para encontrar lo que buscas.
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0,0,0);
    }
    40%, 43% {
        transform: translate3d(0, -30px, 0);
    }
    70% {
        transform: translate3d(0, -15px, 0);
    }
    90% {
        transform: translate3d(0, -4px, 0);
    }
}

.animate-bounce {
    animation: bounce 2s infinite;
}
</style>
