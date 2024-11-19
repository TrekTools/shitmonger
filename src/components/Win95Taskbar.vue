<template>
  <div class="taskbar">
    <div class="start-button">
      <img src="@/assets/win95-logo.png" alt="Start" class="start-icon">
      Start
    </div>
    <div class="task-items">
      <div 
        v-for="window in minimizedWindows" 
        :key="window.id"
        class="task-item"
        @click="$emit('restore', window.id)"
      >
        {{ window.title }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Win95Taskbar',
  props: {
    minimizedWindows: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  background: #c0c0c0;
  border-top: 2px solid #ffffff;
  display: flex;
  align-items: center;
  padding: 2px;
  z-index: 9999;
}

.start-button {
  display: flex;
  align-items: center;
  padding: 2px 8px;
  margin: 2px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  font-family: 'MS Sans Serif', Arial, sans-serif;
  font-size: 11px;
  cursor: pointer;
}

.start-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.task-items {
  display: flex;
  gap: 2px;
  margin-left: 4px;
}

.task-item {
  padding: 2px 8px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  font-family: 'MS Sans Serif', Arial, sans-serif;
  font-size: 11px;
  min-width: 120px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-item:active {
  border-color: #808080 #ffffff #ffffff #808080;
}
</style> 