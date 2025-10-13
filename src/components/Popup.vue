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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: popupIn 0.3s ease-out;
}

@keyframes popupIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #e5e7eb;
}

.popup-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.popup-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.popup-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.popup-body {
  padding: 20px;
}

.popup-body p {
  margin: 0;
  color: #4b5563;
  line-height: 1.5;
}

.popup-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 20px 20px 20px;
}

.popup-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.popup-btn-primary {
  background: #ec4899;
  color: white;
}

.popup-btn-primary:hover {
  background: #db2777;
}

.popup-btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.popup-btn-cancel:hover {
  background: #e5e7eb;
}
</style>
