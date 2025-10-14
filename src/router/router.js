import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import CreatePost from '../pages/CreatePost.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import { subscribeToAuthStateChanges } from '../services/auth';
import MyProfile from '../pages/MyProfile.vue';
import UserProfile from '../pages/UserProfile.vue';

// rutas
const routes = [
    { path: '/',                component: Home, },
    { path: '/ingresar',        component: Login, },
    { path: '/crear-cuenta',    component: Register, },
    { path: '/publicar',        component: CreatePost,  meta: { requiresAuth: true, }, },
    { path: '/mi-perfil',       component: MyProfile,   meta: { requiresAuth: true, }, },
    { path: '/usuario/:id',     component: UserProfile, },
];

const router = createRouter({
    routes,
    history: createWebHistory(),
});

// estado de usuario para guards
let user = { id: null, email: null }
subscribeToAuthStateChanges(newUserState => user = newUserState);

// guard para rutas protegidas
router.beforeEach((to, from) => {
    if(to.meta.requiresAuth && user.id === null) {
        return '/ingresar';
    }
});

export default router;