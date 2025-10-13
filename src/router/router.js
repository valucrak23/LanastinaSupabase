import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import CreatePost from '../pages/CreatePost.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import { subscribeToAuthStateChanges } from '../services/auth';
import MyProfile from '../pages/MyProfile.vue';
import UserProfile from '../pages/UserProfile.vue';

// Definimos la lista de rutas de nuestra aplicación.
// Esto es, un array de objetos de "ruta".
// Cada "ruta" debe tener, al menos, dos propiedades:
// 1. path: La URL a partir de la raíz del sitio.
// 2. component: El componente que queremos renderizar para esa URL.
// Opcionalmente, pueden tener otras propiedades.
// 3. meta: Objeto de "meta data". Esto es, datos extras que queremos asociar a la ruta.
//  No tiene ninguna propiedad preestablecida.
const routes = [
    { path: '/',                component: Home, },
    { path: '/ingresar',        component: Login, },
    { path: '/crear-cuenta',    component: Register, },
    { path: '/publicar',        component: CreatePost,  meta: { requiresAuth: true, }, },
    { path: '/mi-perfil',       component: MyProfile,   meta: { requiresAuth: true, }, },
    { path: '/usuario/:id',     component: UserProfile, },
];

const router = createRouter({
    // routes: routes,
    routes,
    history: createWebHistory(),
});

// Suscribirnos al estado de autenticación.
let user = {
    id: null,
    email: null,
}
subscribeToAuthStateChanges(newUserState => user = newUserState);

// Vamos a "restringir" el acceso a usuarios no autenticados para la rutas que requieran 
// estar autenticado.
// Esto lo vamos a logar usando los "navigation guards" del Router.
// Los "guards" son funciones (callbacks) que se ejecutan antes de cada cambio de
// ruta de la navegación.
// Nos permiten decidir si permitimos realizar la navegación (si no retornamos nada),
// prohibir la navegación (si retornamos false) o hacer un redireccionamiento (si
// retornamos una nueva ruta o URL).
// **IMPORTANTE** Esto es una medida de "usabilidad", no de "seguridad". La seguridad
// debe implementarse en el backend.
router.beforeEach((to, from) => {
    if(to.meta.requiresAuth && user.id === null) {
        return '/ingresar';
    }

    // Tanto "to" como "from" son objetos con la data de la ruta.
    // console.group('🚦 Rutas');
    // console.log("Navegando desde: ", from);
    // console.log("Navegando hacia: ", to);
    // console.groupEnd();
});

export default router;