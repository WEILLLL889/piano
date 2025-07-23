<template>
  <div class="settings-panel">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div class="panel-content">
      <header class="panel-header">
        <h2 class="panel-title">
          <span class="title-icon">⚙️</span>
          钢琴设置
        </h2>
        <p class="panel-subtitle">个性化您的演奏体验</p>
      </header>

      <div class="settings-grid">
        <!-- Display Settings -->
        <div class="setting-card">
          <h3 class="card-title">显示</h3>
          <div class="setting-item">
            <label for="showKbdNum">在琴键上显示音名</label>
            <xwSwitch id="showKbdNum" v-model="state.cacheConf.showKbdNum" />
          </div>
        </div>

        <!-- Sizing Settings -->
        <div class="setting-card">
          <h3 class="card-title">键盘尺寸</h3>
          <div class="setting-item">
            <label>缩放键盘</label>
            <div class="control-group">
              <button class="adjust-btn" @click="scaleCG(-1)">-</button>
              <span>{{ state.cacheConf.scale }}x</span>
              <button class="adjust-btn" @click="scaleCG(1)">+</button>
            </div>
          </div>
        </div>

        <!-- Background Settings -->
        <div class="setting-card wide-card">
          <h3 class="card-title">背景</h3>
          <div class="setting-item">
            <label>选择背景主题</label>
            <div class="control-group">
              <select class="styled-select" v-model="selectedBackground" @change="changeBackground">
                <option value="https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1920">音乐灵感</option>
                <option value="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920">静谧森林</option>
                <option value="https://images.unsplash.com/photo-1444703686981-a3abbc4d42e2?auto=format&fit=crop&w=1920">都市夜色</option>
                <option value="https://images.unsplash.com/photo-1507525428034-b723a9ce6890?auto=format&fit=crop&w=1920">海滨假日</option>
                <option value="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920">山川壮丽</option>
                <option value="https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1920">极简白</option>
                <option value="https://images.unsplash.com/photo-1532003884036-40b3eea62c8d?auto=format&fit=crop&w=1920">深邃黑</option>
                <option value="custom">自定义...</option>
              </select>
              <button class="upload-btn" @click="selectFile">
                <span class="icon">📁</span>
                上传
              </button>
              <input type="file" ref="fileInput" @change="handleFileChange" style="display: none" accept="image/*" />
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Keyboard Position Adjuster -->
    <div v-show="state.cacheConf.barScale < 1" class="keyboard-adjuster">
       <span class="adjuster-label">键盘位置</span>
       <button class="adjuster-arrow-btn" @click="mleft(false)">←</button>
       <div class="visible-line">
         <div class="visible-bar" :style="{ width: `${state.cacheConf.barScale * 100}%`, left: `${(1 - state.cacheConf.barScale) * state.cacheConf.left * 100}%` }"/>
       </div>
       <button class="adjuster-arrow-btn" @click="mleft(true)">→</button>
    </div>
  </div>
</template>

<script>
import xwSwitch from '../comp/xw-switch.vue';
import { resize } from '../size';
import xwButton from '../../../../../comp/xw-comp/xw-button.vue';
import settingsMidiPeripheral from './settings-midi-peripheral.vue';

export default {
  components: {
    xwSwitch,
    xwButton,
    settingsMidiPeripheral,
  },
  data() {
    return {
      selectedBackground: localStorage.getItem('background') || 'pianobg.jpg',
      loading: false,
    }
  },
  mounted() {
    this.selectedBackground = this.$store.state.background;
    // The main piano view now controls the background, so we don't apply it here.
  },
  computed: {
    state() {
      return this.$store.state;
    },
  },
  watch: {
    'state.hideNavBar': function () {
      this.$nextTick(resize);
    },
  },
  methods: {
    selectFile() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.loading = true;
        const reader = new FileReader();
        reader.onload = (e) => {
          const customBackground = e.target.result;
          this.$store.commit('SET_BACKGROUND', customBackground);
          localStorage.setItem('background', customBackground);
          this.selectedBackground = 'custom';
          this.loading = false;
        };
        reader.readAsDataURL(file);
      }
    },
    scaleCG(v) {
      let s = this.state.cacheConf.scale;
      s += v;
      if (s < 1) s = 1;
      if (s > 5) s = 5;
      this.state.cacheConf.scale = s;
      this.$nextTick(resize);
    },
    mleft(v) {
      let f = this.state.cacheConf.left;
      f += v ? 0.1 : -0.1;
      if (f < 0) f = 0;
      if (f > 1) f = 1;
      this.state.cacheConf.left = f;
      resize();
    },
    changeBackground() {
      if (this.selectedBackground === 'custom') {
        this.selectFile();
      } else {
        const bg = this.selectedBackground || 'pianobg.jpg';
        this.$store.commit('SET_BACKGROUND', bg);
        localStorage.setItem('background', bg);
      }
    }
  },
};
</script>

<style lang="stylus" scoped>
// Base styles
.settings-panel {
  height: 100%;
  padding: 25px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.panel-content {
  width: 100%;
  max-width: 800px; /* 增加最大宽度 */
  background-color: rgba(255, 255, 255, 0.9); /* 提高不透明度 */
  backdrop-filter: blur(15px); /* 增加模糊度 */
  border-radius: 24px; /* 增加圆角 */
  padding: 35px 40px; /* 增加内边距 */
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12); /* 调整阴影 */
  border: 1px solid rgba(255, 255, 255, 0.25); /* 调整边框 */
}

// Header
.panel-header {
  text-align: center;
  margin-bottom: 25px;
  .panel-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }
  .panel-subtitle {
    font-size: 1rem;
    color: #555;
    margin: 0;
  }
}

// Settings Grid
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* 响应式布局 */
  gap: 25px; /* 增加间距 */
}

.setting-card {
  background: rgba(255, 255, 255, 0.6); /* 增加背景不透明度 */
  border-radius: 18px; /* 调整圆角 */
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px); /* 添加悬停效果 */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  &.wide-card {
    grid-column: span 1; /* 默认为1列 */
    @media (min-width: 600px) {
      grid-column: span 2; /* 在较宽屏幕上跨2列 */
    }
  }
  
  .card-title {
    font-size: 1.2rem; /* 增大标题字号 */
    font-weight: 600;
    margin: 0 0 Bpx 0;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  label {
    font-size: 0.95rem;
    color: #444;
  }
}

// Controls
.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.adjust-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background-color: #fff;
  color: #555;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: #f0f0f0;
    border-color: #a07c5b;
    color: #a07c5b;
  }
}

.styled-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #fff;
  flex-grow: 1;
  &:focus {
    outline: none;
    border-color: #a07c5b;
  }
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  background: linear-gradient(45deg, #a07c5b 0%, #85654a 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    opacity: 0.9;
    box-shadow: 0 4px 15px rgba(133, 101, 74, 0.3);
  }
}


// Keyboard Adjuster
.keyboard-adjuster {
  width: 100%;
  max-width: 500px;
  margin-top: 25px;
  padding: 12px 20px;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 15px;
  .adjuster-label {
    font-size: 0.9rem;
    color: #333;
    font-weight: 500;
  }
  .visible-line {
    flex-grow: 1;
    height: 6px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    position: relative;
    .visible-bar {
      position: absolute;
      height: 100%;
      background: #a07c5b;
      border-radius: 3px;
    }
  }
  .adjuster-arrow-btn {
    border: none;
    background: none;
    font-size: 1.2rem;
    color: #555;
    cursor: pointer;
    &:hover {
      color: #a07c5b;
    }
  }
}

// Loading overlay
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  color: white;
  .spinner {
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 4px solid white;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  p {
    margin-top: 15px;
  }
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Responsive
    @media (max-width: 768px) { /* 调整响应式断点 */
  .settings-grid {
    grid-template-columns: 1fr;
  }
  .setting-card.wide-card {
    grid-column: span 1;
  }
  .panel-content {
    padding: 30px 25px;
  }
}
</style>
