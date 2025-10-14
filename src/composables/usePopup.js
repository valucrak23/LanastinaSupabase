// EXTRA: composable para manejar popups personalizados
import { ref } from 'vue'

const showPopup = ref(false)
const popupConfig = ref({
  title: 'Información',
  message: '',
  type: 'info'
})

let resolvePromise = null

export function usePopup() {
  const show = (title, message, type = 'info') => {
    popupConfig.value = { title, message, type }
    showPopup.value = true
    
    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  const close = (result = null) => {
    showPopup.value = false
    if (resolvePromise) {
      resolvePromise(result)
      resolvePromise = null
    }
  }

  return {
    showPopup,
    popupConfig,
    show,
    close
  }
}
