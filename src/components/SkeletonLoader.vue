<template>
  <div class="w-full">
    <div v-if="type === 'post'" class="skeleton-post">
      <div class="flex items-center gap-4 mb-4">
        <div class="skeleton-avatar"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton-line skeleton-line-short"></div>
          <div class="skeleton-line skeleton-line-medium"></div>
        </div>
      </div>
      <div class="skeleton-image"></div>
      <div class="space-y-2 mb-4">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line skeleton-line-short"></div>
      </div>
      <div class="pt-4 border-t border-crochet-violeta/10">
        <div class="skeleton-button"></div>
      </div>
    </div>

    <div v-else-if="type === 'profile'" class="skeleton-profile">
      <div class="flex items-center gap-6 mb-6">
        <div class="skeleton-avatar skeleton-avatar-large"></div>
        <div class="flex-1 space-y-3">
          <div class="skeleton-line skeleton-line-title"></div>
          <div class="skeleton-line skeleton-line-medium"></div>
        </div>
      </div>
      <div class="space-y-4">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line skeleton-line-short"></div>
        <div class="flex flex-wrap gap-2 mt-4">
          <div class="skeleton-tag"></div>
          <div class="skeleton-tag"></div>
          <div class="skeleton-tag"></div>
        </div>
        <div class="flex gap-4 mt-6">
          <div class="skeleton-button skeleton-button-large"></div>
          <div class="skeleton-button skeleton-button-large"></div>
        </div>
      </div>
    </div>

    <div v-else-if="type === 'post-list'" class="w-full">
      <div v-for="n in count" :key="n" class="skeleton-post">
        <div class="flex items-center gap-4 mb-4">
          <div class="skeleton-avatar"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton-line skeleton-line-short"></div>
            <div class="skeleton-line skeleton-line-medium"></div>
          </div>
        </div>
        <div class="skeleton-image"></div>
        <div class="space-y-2 mb-4">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line skeleton-line-short"></div>
        </div>
        <div class="pt-4 border-t border-crochet-violeta/10">
          <div class="skeleton-button"></div>
        </div>
      </div>
    </div>

    <div v-else class="w-full space-y-3">
      <div v-for="n in count" :key="n" class="skeleton-line"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonLoader',
  props: {
    type: {
      type: String,
      default: 'generic',
      validator: (value) => ['post', 'profile', 'post-list', 'generic'].includes(value)
    },
    count: {
      type: Number,
      default: 3
    }
  }
}
</script>

<style scoped>
.skeleton-post {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid rgba(187, 154, 247, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton-profile {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(187, 154, 247, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(38, 208, 206, 0.1) 0%, rgba(187, 154, 247, 0.1) 50%, rgba(247, 118, 142, 0.1) 100%);
  animation: skeleton-shimmer 2s ease-in-out infinite;
}

.skeleton-avatar-large {
  width: 120px;
  height: 120px;
}

.skeleton-line {
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(38, 208, 206, 0.1) 0%, rgba(187, 154, 247, 0.1) 50%, rgba(247, 118, 142, 0.1) 100%);
  animation: skeleton-shimmer 2s ease-in-out infinite;
}

.skeleton-line-short {
  width: 60%;
}

.skeleton-line-medium {
  width: 80%;
}

.skeleton-line-title {
  height: 24px;
  width: 70%;
}

.skeleton-image {
  width: 100%;
  height: 288px;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(38, 208, 206, 0.1) 0%, rgba(187, 154, 247, 0.1) 50%, rgba(247, 118, 142, 0.1) 100%);
  animation: skeleton-shimmer 2s ease-in-out infinite;
}

.skeleton-button {
  height: 40px;
  width: 128px;
  border-radius: 20px;
  background: linear-gradient(90deg, rgba(38, 208, 206, 0.1) 0%, rgba(187, 154, 247, 0.1) 50%, rgba(247, 118, 142, 0.1) 100%);
  animation: skeleton-shimmer 2s ease-in-out infinite;
}

.skeleton-button-large {
  height: 48px;
  width: 160px;
}

.skeleton-tag {
  height: 32px;
  width: 80px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(38, 208, 206, 0.1) 0%, rgba(187, 154, 247, 0.1) 50%, rgba(247, 118, 142, 0.1) 100%);
  animation: skeleton-shimmer 2s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>
