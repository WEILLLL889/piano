<template>
  <piano />
</template>

<script>
import piano from './comp/piano.vue';
import store from './store';

export default {
  name: 'App',

  components: {
    piano,
  },

  store,

  data() {
    return {};
  },

  computed: {
    state() {
      return this.$store.state;
    },
  },  mounted() {
    // 立即应用钢琴页面背景，无延迟
    this.applyPianoBackground();
    
    // 额外确保在组件完全挂载后再次检查背景
    this.$nextTick(() => {
      setTimeout(() => {
        this.applyPianoBackground();
      }, 100);
    });
  },
  watch: {
    // 监听store中background的变化
    '$store.state.background'(newBackground) {
      console.log('检测到背景变化:', newBackground); // 调试用
      this.applyBackground(newBackground || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1920');
    }
  },
  methods: {
    applyPianoBackground() {
      const background = this.$store.state.background || 'pianobg.jpg';
      console.log('应用钢琴背景:', background); // 调试用
      this.applyBackground(background);
    },
    applyBackground(backgroundName) {
      try {
        document.body.style.background = '';
        if (backgroundName.startsWith('data:image') || backgroundName.startsWith('http')) {
          // 自定义上传的图片或网络图片
          document.body.style.backgroundImage = `url(${backgroundName})`;
        } else {
          // 预设的本地背景图片
          document.body.style.backgroundImage = `url(${require(`@/assets/${backgroundName}`)})`;
        }
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundPosition = 'center center';
        document.body.style.backgroundAttachment = 'fixed';
        console.log('背景设置成功:', backgroundName); // 调试用
      } catch (error) {
        console.error('钢琴页面背景设置失败:', error);
        // fallback到默认背景
        try {
          document.body.style.backgroundImage = `url(${require('@/assets/pianobg.jpg')})`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundRepeat = 'no-repeat';
          document.body.style.backgroundPosition = 'center center';
          document.body.style.backgroundAttachment = 'fixed';
        } catch (fallbackError) {
          console.error('默认背景设置失败:', fallbackError);
        }
      }
    }
  },
};
</script>

<style lang="stylus"></style>
