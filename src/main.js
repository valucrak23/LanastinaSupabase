/*
# Nota sobre rutas de npm
Si trabajamos con npm (por ejemplo, via Vite), cuando escribimos una "ruta" del
import sin aclarar el directorio de origen, automáticamente Vite interpreta que
se trata de un paquete de npm.

Por ejemplo, si escribimos:
  import { createApp } from 'vue';

Vite entiende que existe un paquete "vue" instalado, e incluye el contenido del 
mismo.

Si queremos un archivo de la misma carpeta donde estamos, tenemos que asegurarnos
de poner el "./" de prefijo. Por ejemplo:
  import App from './App.vue';

De lo contrario, si tratamos de hacer:
  import App from 'App.vue';

Vite va a entender que estamos buscando un paquete de npm llamado "App.vue" que 
debería existir en la carpeta de [node_modules].
*/
// Importamos la función para crear la aplicación de Vue.
import { createApp } from 'vue';
import './style.css';
import router from './router/router';
import App from './App.vue';

// Creamos la aplicación para montarla en el HTML.
const app = createApp(App);
app.use(router); // Registramos el router.
app.mount('#app');

/*
# Diferencia entre dependencies y devDependencies
Las "dependencias" son los paquetes que necesitamos tener para correr el programa.

Lo que cambia entre una "dependency" y una "devDependency", es que las primeras son
necesarias para correr el programa final, y las segundas son solo necesarias para
compilar el proyecto.
*/