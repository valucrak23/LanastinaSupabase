import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import CreatePost from '../pages/CreatePost.vue';
import EditPost from '../pages/EditPost.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import { subscribeToAuthStateChanges } from '../services/auth';
import { supabase } from '../services/supabase';
import MyProfile from '../pages/MyProfile.vue';
import UserProfile from '../pages/UserProfile.vue';
import NotFound from '../pages/NotFound.vue';

// rutas
const routes = [
    { path: '/',                component: Home, },
    { path: '/ingresar',        component: Login, },
    { path: '/crear-cuenta',    component: Register, },
    { path: '/publicar',        component: CreatePost,  meta: { requiresAuth: true, }, },
    { path: '/editar/:id',      component: EditPost,    meta: { requiresAuth: true, }, },
    { path: '/mi-perfil',       component: MyProfile,   meta: { requiresAuth: true, }, },
    { path: '/usuario/:id',     component: UserProfile, },
    { path: '/:pathMatch(.*)*', component: NotFound, }, // Ruta catch-all para 404
];

const router = createRouter({
    routes,
    history: createWebHistory(),
});

// estado de usuario para guards
let user = { id: null, email: null }
subscribeToAuthStateChanges(newUserState => {
    console.log('[router] Estado del usuario actualizado:', newUserState);
    user = newUserState;
});

// guard para rutas protegidas y redirección de usuarios logueados
router.beforeEach(async (to, from) => {
    // verificar sesión actual en Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const isLoggedIn = session && session.user;
    
    // redirigir usuarios logueados que intenten acceder a login/register
    if((to.path === '/ingresar' || to.path === '/crear-cuenta') && isLoggedIn) {
        return '/mi-perfil';
    }
    
    // redirigir usuarios no logueados a login para rutas protegidas
    if(to.meta.requiresAuth && !isLoggedIn) {
        return '/ingresar';
    }
});

// guard adicional para prevenir navegación hacia atrás a páginas no permitidas
router.beforeResolve(async (to, from) => {
    // verificar sesión actual en Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const isLoggedIn = session && session.user;
    
    // redirigir usuarios logueados que intenten acceder a login/register
    if((to.path === '/ingresar' || to.path === '/crear-cuenta') && isLoggedIn) {
        return '/mi-perfil';
    }
    
    // redirigir usuarios no logueados a login para rutas protegidas
    if(to.meta.requiresAuth && !isLoggedIn) {
        return '/ingresar';
    }
});


export default router;