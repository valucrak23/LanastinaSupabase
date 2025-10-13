// Este es el archivo de configuración de Vite.
// Como todo archivo de configuración (los que terminan en ".config.js") debe
// exportar un objeto de configuración.
//  npm install --save-dev @vitejs/plugin-vue@6

// Importamos el plugin de Vue para Vite, y lo agregamos al objeto de configuración.
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default {
    plugins: [vue(), tailwindcss()],
}