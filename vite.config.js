// configuracion de vite
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default {
    plugins: [vue(), tailwindcss()],
}