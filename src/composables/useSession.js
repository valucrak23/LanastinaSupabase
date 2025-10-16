import { ref, onMounted, onUnmounted } from 'vue';
import { updateActivity } from '../services/auth';

export function useSession() {
    const isActive = ref(true);
    const lastActivity = ref(Date.now());
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
        lastActivity.value = Date.now();
        isActive.value = true;
        updateActivity();
    };
    
    const setupActivityDetection = () => {
        events.forEach(event => {
            document.addEventListener(event, handleActivity, true);
        });
    };
    
    const cleanupActivityDetection = () => {
        events.forEach(event => {
            document.removeEventListener(event, handleActivity, true);
        });
    };
    
    onMounted(() => {
        setupActivityDetection();
    });
    
    onUnmounted(() => {
        cleanupActivityDetection();
    });
    
    return {
        isActive,
        lastActivity,
        setupActivityDetection,
        cleanupActivityDetection
    };
}
