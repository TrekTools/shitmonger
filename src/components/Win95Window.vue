<template>
  <div 
    class="win95-window"
    :style="windowStyle"
    @mousedown="startDrag"
  >
    <div class="title-bar">
      <div class="title-text">{{ title }}</div>
      <button v-if="showClose" class="close-button" @click="$emit('close')">&times;</button>
    </div>
    <div class="window-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Win95Window',
  props: {
    title: {
      type: String,
      required: true
    },
    initialX: {
      type: Number,
      default: 100
    },
    initialY: {
      type: Number,
      default: 100
    },
    initialWidth: {
      type: Number,
      default: 400
    },
    initialHeight: {
      type: Number,
      default: 300
    },
    showClose: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      x: this.initialX,
      y: this.initialY,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0
    }
  },
  computed: {
    windowStyle() {
      return {
        left: `${this.x}px`,
        top: `${this.y}px`,
        width: `${this.initialWidth}px`,
        height: `${this.initialHeight}px`
      }
    }
  },
  methods: {
    startDrag(event) {
      if (event.target.closest('.title-bar') && !event.target.closest('.close-button')) {
        this.isDragging = true
        this.dragStartX = event.clientX - this.x
        this.dragStartY = event.clientY - this.y
        window.addEventListener('mousemove', this.onDrag)
        window.addEventListener('mouseup', this.stopDrag)
      }
    },
    onDrag(event) {
      if (this.isDragging) {
        this.x = event.clientX - this.dragStartX
        this.y = event.clientY - this.dragStartY
      }
    },
    stopDrag() {
      this.isDragging = false
      window.removeEventListener('mousemove', this.onDrag)
      window.removeEventListener('mouseup', this.stopDrag)
    }
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.onDrag)
    window.removeEventListener('mouseup', this.stopDrag)
  }
}
</script>

<style scoped>
.win95-window {
  position: fixed;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.title-bar {
  background: #000080;
  color: white;
  padding: 2px 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  user-select: none;
}

.title-text {
  font-weight: bold;
  font-size: 12px;
  padding: 2px;
}

.close-button {
  background: #c0c0c0;
  border: 1px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  color: #000000;
  width: 16px;
  height: 16px;
  line-height: 14px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin: 2px;
}

.close-button:active {
  border-color: #808080 #ffffff #ffffff #808080;
}

.window-content {
  flex: 1;
  overflow: auto;
  background: #c0c0c0;
  position: relative;
  height: calc(100% - 24px);
}
</style> 