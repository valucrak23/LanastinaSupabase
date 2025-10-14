<!-- EXTRA: componente popup personalizado para reemplazar alert() y confirm() -->
<template>
  <div v-if="show" class="popup-overlay" @click="close">
    <div class="popup-content" @click.stop>
      <div class="popup-header">
        <h3 class="popup-title">{{ title }}</h3>
        <button @click="close" class="popup-close">✕</button>
      </div>
      <div class="popup-body">
        <p>{{ message }}</p>
      </div>
      <div class="popup-footer">
        <button 
          v-if="type === 'confirm'"
          @click="confirm(false)" 
          class="popup-btn popup-btn-cancel"
        >
          Cancelar
        </button>
        <button 
          @click="type === 'confirm' ? confirm(true) : close()" 
          class="popup-btn popup-btn-primary"
        >
          {{ type === 'confirm' ? 'Confirmar' : 'Aceptar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Popup',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Información'
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info', // 'info', 'confirm'
      validator: value => ['info', 'confirm'].includes(value)
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    confirm(value) {
      this.$emit('confirm', value);
      this.close();
    }
  }
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.popup-content {
  background: var(--crochet-bg) !important;
  border-radius: 16px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 2px solid var(--crochet-violeta);
  animation: popupIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
  opacity: 1;
}

@keyframes popupIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
  border-bottom: 1px solid var(--crochet-violeta);
  flex-shrink: 0;
}

.popup-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--crochet-text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.popup-title::before {
  content: "✨";
  font-size: 1.25rem;
}

.popup-close {
  background: rgba(247, 118, 142, 0.8);
  border: none;
  font-size: 1.25rem;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  font-weight: bold;
}

.popup-close:hover {
  background: rgba(187, 154, 247, 0.8);
  transform: scale(1.05);
}

.popup-body {
  padding: 1rem 1.5rem;
}

.popup-body p {
  margin: 0;
  color: var(--crochet-text-muted);
  line-height: 1.6;
  font-size: 0.95rem;
}

.popup-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem 1.5rem 1.5rem;
  flex-shrink: 0;
}

.popup-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.9rem;
  min-width: 80px;
}

.popup-btn-primary {
  background: rgba(38, 208, 206, 0.8);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.popup-btn-primary:hover {
  background: rgba(38, 208, 206, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.popup-btn-cancel {
  background: rgba(36, 40, 59, 0.8);
  color: var(--crochet-text);
  border: 1px solid rgba(187, 154, 247, 0.3);
}

.popup-btn-cancel:hover {
  background: rgba(187, 154, 247, 0.2);
  color: white;
  transform: translateY(-1px);
  border-color: rgba(187, 154, 247, 0.5);
}

/* Responsive */
@media (max-width: 640px) {
  .popup-overlay {
    padding: 0.5rem;
  }
  
  .popup-content {
    border-radius: 12px;
  }
  
  .popup-header {
    padding: 1rem 1rem 0.5rem 1rem;
  }
  
  .popup-title {
    font-size: 1rem;
  }
  
  .popup-body {
    padding: 0.75rem 1rem;
  }
  
  .popup-footer {
    padding: 0.5rem 1rem 1rem 1rem;
    flex-direction: column;
  }
  
  .popup-btn {
    width: 100%;
    padding: 0.875rem 1rem;
  }
}
</style>
