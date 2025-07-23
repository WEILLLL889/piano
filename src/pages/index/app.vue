<template>
  <div class="page-container">
    <div class="main-content">
      <header class="page-header">
        <h1 class="title">
          <span class="icon">🎹</span>
          虚拟钢琴演奏厅
        </h1>
        <p class="subtitle">
          在这里，每一个音符都是您心灵的表达。简洁，优雅，强大。
        </p>
      </header>

      <section class="features-section">
        <div class="feature-card">
          <div class="feature-icon">🎵</div>
          <h3 class="feature-title">在线演奏</h3>
          <p>支持键盘和MIDI设备，提供流畅的演奏体验。</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3 class="feature-title">节奏游戏</h3>
          <p>通过互动游戏提高您的节奏感和识谱能力。</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎼</div>
          <h3 class="feature-title">丰富功能</h3>
          <p>录制与回放、多种音色设置，满足您的创作需求。</p>
        </div>
      </section>

      <footer class="page-footer">
        <router-link to="/piano/" class="start-button">
          立即开始演奏 <span class="arrow-icon">→</span>
        </router-link>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  mounted() {
    // Set a clean, light background for the page
    document.body.style.backgroundImage = "url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070&auto=format&fit=crop')";
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  },
  beforeDestroy() {
    // Reset background when leaving the page
    document.body.style.background = '';
    document.body.style.backgroundImage = '';
  },
};
</script>

<style lang="stylus" scoped>
// Resets and base styles
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

// Main container for the page
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  padding: 40px 20px;
  /* Remove background-color to let the body's background show through */
  color: #343a40;
  text-align: center;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-content {
  max-width: 900px;
  width: 100%;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

// Header section
.page-header {
  margin-bottom: 50px;

  .title {
    font-size: 2.8rem;
    font-weight: 700;
    color: #212529;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;

    .icon {
      font-size: 3rem;
    }
  }

  .subtitle {
    font-size: 1.2rem;
    font-weight: 300;
    color: #6c757d;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

// Features section
.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.feature-card {
  background: linear-gradient(145deg, #ffffff 0%, #f1f3f5 100%);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background-color: #a07c5b; /* Wood color */
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease;
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: #dee2e6;
    
    &:before {
      transform: scaleX(1);
    }
  }

  .feature-icon {
    font-size: 2rem;
    color: #a07c5b; /* Wood color */
    background-color: rgba(160, 124, 91, 0.1); /* Light wood color */
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 25px;
  }
  
  .feature-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #343a40;
    margin-bottom: 12px;
  }

  p {
    font-size: 0.95rem;
    color: #495057;
    line-height: 1.7;
  }
}

// Footer section with call to action
.page-footer {
  .start-button {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 18px 45px;
    background: linear-gradient(45deg, #a07c5b 0%, #85654a 100%); /* Wood gradient */
    color: #ffffff;
    text-decoration: none;
    border-radius: 50px;
    font-size: 1.2rem;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 8px 20px rgba(133, 101, 74, 0.3); /* Wood shadow */
    border: none;

    .arrow-icon {
      transition: transform 0.3s ease;
    }

    &:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 25px rgba(133, 101, 74, 0.4); /* Darker wood shadow */
      
      .arrow-icon {
        transform: translateX(5px);
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .page-container {
    padding: 20px;
  }

  .page-header {
    .title {
      font-size: 2.2rem;
    }
    .subtitle {
      font-size: 1rem;
    }
  }

  .features-section {
    gap: 20px;
  }
}
</style>
