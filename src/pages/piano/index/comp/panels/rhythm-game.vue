<template>
  <div class="rhythm-game">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="music-note note-1">♪</div>
      <div class="music-note note-2">♫</div>
      <div class="music-note note-3">♩</div>
      <div class="music-note note-4">♬</div>
    </div>

    <div class="fp-header">
      <div class="header-content">
        <h2 class="main-title">
          <span class="title-icon">🎯</span>
          节奏游戏模式
          <span class="title-decoration"></span>
        </h2>
        <p class="subtitle">请按照乐谱弹奏，若超过3秒未按键则视为失败。结束后将给出评分。</p>
        
        <!-- 游戏状态指示器 -->
        <div class="game-status-container">
          <div class="status-info">
            <span class="status-text">状态: {{ gameStatusText }}</span>
            <span class="score-display" v-if="currentScore > 0">得分: {{ currentScore }}</span>
            <span class="combo-display" v-if="combo > 0">连击: {{ combo }}</span>
          </div>          <div class="evaluation-display">{{ evaluation }}</div>
          <div class="progress-bar" v-if="gameStarted">
            <div class="progress-fill" :style="{ width: (currentNoteIndex / currentSheet.notes.length) * 100 + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="sheet-container">
      <div class="sheet-header">
        <div class="sheet-info">
          <h3 class="sheet-title">
            <span class="sheet-icon">🎵</span>
            {{ currentSheet.title || '示例乐谱' }}
          </h3>
          <div class="sheet-meta">
            <span class="difficulty" :class="getDifficultyClass(currentSheet.difficulty)">
              {{ getDifficultyText(currentSheet.difficulty) }}
            </span>
            <span class="note-count">{{ currentSheet.notes.length }} 个音符</span>
          </div>
        </div>
        <div class="sheet-actions">
          <button class="action-btn btn-select" @click="selectSheet">
            <span class="btn-icon">📚</span>
            选择乐谱
          </button>
          <button class="action-btn btn-reset" @click="restartGame">
            <span class="btn-icon">🔄</span>
            重新开始
          </button>
          <button class="action-btn btn-start" @click="startGame" v-if="currentSheet.title">
            <span class="btn-icon">🎮</span>
            开始游戏
          </button>
          <button class="action-btn btn-history" @click="toggleHistory" v-if="currentSheet.title">
            <span class="btn-icon">📊</span>
            历史记录
          </button>
        </div>
      </div>

      <div class="sheet-display">
        <div class="note-list-wrapper" ref="noteListWrapper">
          <div class="note-list" :style="noteListStyle">
            <div
              v-for="(note, index) in currentSheet.notes"
              :key="index"
              class="note-item"
              :class="{
                'current': currentNoteIndex === index,
                'completed': index < currentNoteIndex,
                'upcoming': index === currentNoteIndex + 1
              }"
            >
              <div class="note-content">
                <div class="note-name">{{ note.noteName }}</div>
                <div class="note-symbol">{{ formatDuration(note.duration) }}</div>
                <div class="note-duration">{{ note.duration }}拍</div>
              </div>
              <div class="note-indicator" v-if="currentNoteIndex === index">
                <div class="pulse-ring"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 反馈显示 -->
        <div class="feedback-display" :class="feedbackClass" v-if="currentFeedback">
          {{ currentFeedback }}
        </div>
        
        <!-- 下一个音符预览 -->
        <div class="next-note-preview" v-if="currentNoteIndex < currentSheet.notes.length && gameStarted">
          <div class="preview-label">下一个音符</div>
          <div class="preview-note">
            <span class="preview-name">{{ currentSheet.notes[currentNoteIndex].noteName }}</span>
            <span class="preview-symbol">{{ formatDuration(currentSheet.notes[currentNoteIndex].duration) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 改进的乐谱选择弹窗 -->
    <div class="sheet-selection-overlay" v-if="showSheetSelection" @click="showSheetSelection = false">
      <div class="sheet-selection" @click.stop>
        <div class="selection-header">
          <h3>
            <span class="header-icon">🎼</span>
            选择乐谱
          </h3>
          <button class="close-btn" @click="showSheetSelection = false">
            <span>✕</span>
          </button>
        </div>
        
        <div class="sheet-list">
          <div
            v-for="(sheet, index) in availableSheets"
            :key="index"
            class="sheet-item"
            :class="{ 'active': sheet.id === currentSheet.id }"
            @click="loadSheet(sheet)"
          >
            <div class="sheet-preview">
              <div class="sheet-cover">
                <span class="cover-icon">🎵</span>
              </div>
              <div class="sheet-details">
                <h4 class="sheet-name">{{ sheet.title }}</h4>
                <div class="sheet-stats">
                  <span class="stat-item">
                    <span class="stat-icon">🎹</span>
                    {{ sheet.notes.length }} 音符
                  </span>
                  <span class="stat-item difficulty-badge" :class="getDifficultyClass(sheet.difficulty)">
                    {{ getDifficultyText(sheet.difficulty) }}
                  </span>
                </div>
                <div class="sheet-preview-notes">
                  <span v-for="(note, i) in sheet.notes.slice(0, 8)" :key="i" class="preview-note-mini">
                    {{ note.noteName }}
                  </span>
                  <span v-if="sheet.notes.length > 8" class="more-notes">...</span>
                </div>
              </div>
            </div>
            <div class="selection-indicator" v-if="sheet.id === currentSheet.id">
              <span>✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
     



      <!-- 添加提示信息 -->
      <div class="start-message" v-if="startMessageVisible">
        {{ startMessageText }}
      </div>

      <div class="selection-message" v-if="selectionMessageVisible">
        {{ selectionMessageText }}
      </div>

      <!-- 历史记录弹窗 -->
      <div class="history-feedback" v-if="showHistory">
        <div class="feedback-header">
          <h3>历史得分记录</h3>
          <span class="close-btn" @click="showHistory = false">×</span>
        </div>
        <div class="history-content">
          <div class="history-filters">
            <button class="filter-btn" @click="sortHistory('time')">按时间排序</button>
            <button class="filter-btn" @click="sortHistory('score')">按分数排序</button>
          </div>
          <div class="batch-delete">
            <button class="batch-delete-btn" @click="toggleBatchDelete">{{ batchDelete ? '取消多选' : '多选删除' }}</button>
          </div>
          <div class="history-list">
            <div class="history-item" v-for="(record, index) in filteredHistory" :key="index">
              <div class="history-song">{{ record.songName }}</div>
              <div class="history-score">{{ record.score }}</div>
               <div class="history-time">{{ formatTime(record.time) }}</div>
              <div class="history-status">{{ record.completed ? '已完成' : `未完成 (${record.errorReason === 'timeout' ? '超时' : '按错键'})` }}</div>
              <input type="checkbox" v-model="selectedRecords" :value="index" v-if="batchDelete">
              <button class="delete-btn" @click.stop="deleteHistory(index)" v-else>删除</button>
            </div>
          </div>
          <div class="delete-all-container" v-if="!batchDelete">
            <button class="delete-all-btn" @click="deleteAllHistory">删除全部历史记录</button>
          </div>
          <div class="delete-selected-container" v-else>
            <button class="delete-selected-btn" @click="deleteSelectedHistory">删除选中历史记录</button>
          </div>
        </div>
      </div>

      <!-- 开始提示弹窗 -->
      <div class="start-prompt" v-if="showStartPrompt">
        <div class="prompt-content">
          <h3>提示</h3>
          <p>请点击“开始游戏”按钮开始练习。</p>
          <button class="btn-close" @click="closeStartPrompt">确定</button>
        </div>
      </div>

      <!-- 礼花效果 -->
      <div class="confetti-container" v-if="showConfetti">
        <div class="confetti" v-for="i in 300" :key="i" :style="getConfettiStyle()"></div>
      </div>
      <!-- 鞭炮效果 -->
      <div class="firecracker-container" v-if="showFirecracker">
        <div class="firecracker"></div>
      </div>
      <!-- 最终结束反馈弹窗 -->
    <!-- <div v-if="showResult" class="result-panel">

      <div class="result-content">
        <h2 class="result-title">演奏结束！</h2>
        <div class="result-summary">
          <p>最终得分: <span class="final-score">{{ currentScore }}</span></p>
          <p>最大连击: <span class="max-combo">{{ maxCombo }}</span></p>
        </div>
        <div class="result-details">
          <p class="detail-item perfect">Perfect: <span>{{ perfect }}</span></p>
          <p class="detail-item good">Good: <span>{{ good }}</span></p>
          <p class="detail-item miss">Miss: <span>{{ miss }}</span></p>
        </div>
        <button class="action-btn btn-back" @click="closeResult">
          <span class="btn-icon">返回</span>
        </button>
      </div>
    </div> -->
    
    <div v-if="showResult" class="result-panel">
  <div class="result-content">
    <h2 class="result-title">演奏结束！</h2>
    
    <!-- 原始结果内容 -->
    <div class="result-summary">
      <p>最终得分: <span class="final-score">{{ finalScore.totalScore }}</span></p>
      <p>最大连击: <span class="max-combo">{{ maxCombo }}</span></p>
    </div>
    
    <!-- 原始细节统计 -->
    <div class="result-details">
      <p class="detail-item perfect">Perfect: <span>{{ perfect }}</span></p>
      <p class="detail-item good">Good: <span>{{ good }}</span></p>
      <p class="detail-item miss">Miss: <span>{{ miss }}</span></p>
    </div>
    
    <!-- 优化后的评分反馈内容 -->
    <div class="score-feedback-card">
      <div class="score-feedback-header">
        <h3 class="feedback-title">详细评分反馈</h3>
        <div class="score-badge">
          <span class="score-badge-text">{{ finalScore.totalScore }}</span>
          <span class="score-badge-label">/100</span>
        </div>
      </div>
      
      <div class="score-feedback-body">
        <div class="score-metric">
          <div class="metric-label">准确性</div>
          <div class="metric-value">{{ finalScore.accuracy }}%</div>
          <div class="metric-bar">
            <div class="metric-progress" :style="{ width: finalScore.accuracy + '%' }"></div>
          </div>
        </div>
        
        <div class="score-metric">
          <div class="metric-label">连贯性</div>
          <div class="metric-value">{{ finalScore.maxConsecutiveCorrect }}个连续正确</div>
          <div class="consecutive-counter"></div>
        </div>
        
        <div class="score-metric">
          <div class="metric-label">节奏准确性</div>
          <div class="metric-value">{{ finalScore.rhythmAccuracy }}%</div>
          <div class="metric-bar">
            <div class="metric-progress" :style="{ width: finalScore.rhythmAccuracy + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 关闭按钮 -->
    <button class="action-btn btn-back" @click="showResult = false">
      <span class="btn-icon">关闭</span>
    </button>
  </div>
</div>

  </div>
</template>
  
<script>
  import { miditimeline } from '../piano-control';
  import { getKeyConfig } from '../keyboard-pc';
  
  // 改进的乐谱数据格式
  const sheetData = [
    {
      id: 1,
      title: '欢乐颂',
      difficulty: 'easy',
      composer: '贝多芬',
      description: '经典的欢乐颂主题，适合初学者练习',
      notes: [
        { key: 44, noteName: 'e1', duration: 1 },
        { key: 44, noteName: 'e1', duration: 1 },
        { key: 45, noteName: 'f1', duration: 1 },
        { key: 47, noteName: 'g1', duration: 1 },
        { key: 47, noteName: 'g1', duration: 1 },
        { key: 45, noteName: 'f1', duration: 1 },
        { key: 44, noteName: 'e1', duration: 1 },
        { key: 42, noteName: 'd1', duration: 1 },
        { key: 40, noteName: 'c1', duration: 1 },
        { key: 40, noteName: 'c1', duration: 1 },
        { key: 42, noteName: 'd1', duration: 1 },
        { key: 44, noteName: 'e1', duration: 1 },
        { key: 44, noteName: 'e1', duration: 1.5 },
        { key: 42, noteName: 'd1', duration: 0.5 },
        { key: 42, noteName: 'd1', duration: 2 }
      ]
    },
    {
      id: 2,
      title: '小星星',
      difficulty: 'easy',
      composer: '传统儿歌',
      description: '最受欢迎的儿童歌曲，简单易学',
      notes: [
        { key: 40, noteName: 'c1', duration: 1 },
        { key: 40, noteName: 'c1', duration: 1 },
        { key: 47, noteName: 'g1', duration: 1 },
        { key: 47, noteName: 'g1', duration: 1 },
        { key: 49, noteName: 'a1', duration: 1 },
        { key: 49, noteName: 'a1', duration: 1 },
        { key: 47, noteName: 'g1', duration: 2 },
        { key: 45, noteName: 'f1', duration: 1 },
        { key: 45, noteName: 'f1', duration: 1 },
        { key: 44, noteName: 'e1', duration: 1 },
        { key: 44, noteName: 'e1', duration: 1 },
        { key: 42, noteName: 'd1', duration: 1 },
        { key: 42, noteName: 'd1', duration: 1 },
        { key: 40, noteName: 'c1', duration: 2 }
      ]
    },
    {
      id: 3,
      title: '刻在我心底的名字',
      difficulty: 'medium',
      composer: '卢广仲',
      description: '热门流行歌曲，节奏变化丰富',
      notes: [
        { key: 59, noteName: 'g2', duration: 1 },
        { key: 59, noteName: 'g2', duration: 1 },
        { key: 47, noteName: 'g1', duration: 1 },
        { key: 57, noteName: 'f2', duration: 1 },
        { key: 56, noteName: 'e2', duration: 1 },
        { key: 56, noteName: 'e2', duration: 1 },
        { key: 54, noteName: 'd2', duration: 0.5 },
        { key: 56, noteName: 'e2', duration: 0.5 },
  
        { key: 59, noteName: 'g2', duration: 1 },
        { key: 59, noteName: 'g2', duration: 1 },
        { key: 47, noteName: 'g1', duration: 1 },
        { key: 57, noteName: 'f2', duration: 1 },
        { key: 56, noteName: 'e2', duration: 1 },
        { key: 56, noteName: 'e2', duration: 1 },
        { key: 54, noteName: 'd2', duration: 0.5 },
        { key: 56, noteName: 'e2', duration: 0.5 },
        
        { key: 56, noteName: 'e2', duration: 1 },
        { key: 55, noteName: '#d2', duration: 1 },
        { key: 56, noteName: 'e2', duration: 1 },
        { key: 63, noteName: 'b2', duration: 1 },
        { key: 61, noteName: 'a2', duration: 0.5 },
        { key: 61, noteName: 'a2', duration: 0.5 },
        { key: 56, noteName: 'e2', duration: 1 },
        { key: 63, noteName: 'b2', duration: 1 },
        { key: 61, noteName: 'a2', duration: 1 },
        { key: 56, noteName: 'e2', duration: 1 },
        { key: 56, noteName: 'e2', duration: 1 },
        { key: 54, noteName: 'd2', duration: 1 },
  
        { key: 49, noteName: 'a1', duration: 1 },
        { key: 51, noteName: 'b1', duration: 1 },
        { key: 52, noteName: 'c2', duration: 1 },
        { key: 56, noteName: 'e2', duration: 1 },
        { key: 54, noteName: 'd2', duration: 1 },
        { key: 54, noteName: 'd2', duration: 1 },
        { key: 52, noteName: 'c2', duration: 0.5 },
        { key: 54, noteName: 'd2', duration: 0.5 },
        { key: 51, noteName: 'b1', duration: 1 },
  
        { key: 52, noteName: 'c2', duration: 1 },
        { key: 54, noteName: 'd2', duration: 1 },
        { key: 61, noteName: 'a2', duration: 1 },
        { key: 59, noteName: 'g2', duration: 0.5 },
        { key: 59, noteName: 'g2', duration: 0.5 },
        { key: 51, noteName: 'b1', duration: 1 },
        { key: 54, noteName: 'd2', duration: 1 },
  
        { key: 52, noteName: 'c2', duration: 1 },
        { key: 54, noteName: 'd2', duration: 1 },
        { key: 56, noteName: 'e2', duration: 1 },
        { key: 59, noteName: 'g2', duration: 1 },
        { key: 57, noteName: 'f2', duration: 1 },
        { key: 57, noteName: 'f2', duration: 1 },
        { key: 49, noteName: 'a1', duration: 1 },
        { key: 56, noteName: 'e2', duration: 1 },
        { key: 57, noteName: 'f2', duration: 1 },
        { key: 54, noteName: 'd2', duration: 1 },
        { key: 52, noteName: 'c2', duration: 1 },
        { key: 52, noteName: 'c2', duration: 1 }
      ]
    },
        {
    id: 4,
    title: '梁祝',
    difficulty:'hard' ,
    notes: [
      { key: 32, noteName: 'e0', duration: 2 },
      { key: 35, noteName: 'g0', duration: 1.5 },
      { key: 37, noteName: 'a0', duration: 1 },
      { key: 40, noteName: 'c1', duration: 1.5 },
      { key: 42, noteName: 'd1', duration: 0.5 },
      { key: 37, noteName: 'a0', duration: 0.5 },
      { key: 40, noteName: 'c1', duration: 0.5 },
      { key: 35, noteName: 'g0', duration: 1 },
      { key: 47, noteName: 'g1', duration: 1.5 },
      { key: 52, noteName: 'c2', duration: 0.5 },
      { key: 49, noteName: 'a1', duration: 0.5 },
      { key: 47, noteName: 'g1', duration: 0.5 },
      { key: 44, noteName: 'e1', duration: 0.5 },
      { key: 47, noteName: 'g1', duration: 0.5 },
      { key: 42, noteName: 'd1', duration: 2 },

      { key: 42, noteName: 'd1', duration: 1.5 },
      { key: 44, noteName: 'e1', duration: 0.5 },
      { key: 39, noteName: 'b0', duration: 1 },
      { key: 37, noteName: 'a0', duration: 1 },
      { key: 35, noteName: 'g0', duration: 1.5 },
      { key: 37, noteName: 'a0', duration: 0.5 },
      { key: 40, noteName: 'c1', duration: 1 },
      { key: 42, noteName: 'd1', duration: 1 },
      { key: 32, noteName: 'e0', duration: 1 },
      { key: 40, noteName: 'c1', duration: 1 },
      { key: 37, noteName: 'a0', duration: 0.5 },
      { key: 35, noteName: 'g0', duration: 0.5 },
      { key: 37, noteName: 'a0', duration: 0.5 },
      { key: 40, noteName: 'c1', duration: 0.5 },
      { key: 35, noteName: 'g0', duration: 2 },

      { key: 44, noteName: 'e1', duration: 1.5 },
      { key: 47, noteName: 'g1', duration: 0.5 },
      { key: 39, noteName: 'b0', duration: 1 },
      { key: 42, noteName: 'd1', duration: 1 },
      { key: 37, noteName: 'a0', duration: 0.5 },
      { key: 40, noteName: 'c1', duration: 0.5 },
      { key: 35, noteName: 'g0', duration: 2 },

      { key: 32, noteName: 'e0', duration: 1.5 },
      { key: 35, noteName: 'g0', duration: 0.5 },
      { key: 32, noteName: 'e0', duration: 1 },
      { key: 35, noteName: 'g0', duration: 1.5 },
      { key: 37, noteName: 'a0', duration: 0.5 },
      { key: 39, noteName: 'b0', duration: 0.5 },
      { key: 42, noteName: 'd1', duration: 0.5 },
      { key: 37, noteName: 'a0', duration: 2 },

      { key: 35, noteName: 'g0', duration: 0.5 },
      { key: 37, noteName: 'a0', duration: 0.5 },
      { key: 40, noteName: 'c1', duration: 1.5 },
      { key: 42, noteName: 'd1', duration: 0.5 },
      { key: 47, noteName: 'g1', duration: 1 },
      { key: 44, noteName: 'e1', duration: 1 },
      { key: 42, noteName: 'd1', duration: 1 },
      { key: 44, noteName: 'e1', duration: 0.5 },
      { key: 42, noteName: 'd1', duration: 0.5 },
      { key: 40, noteName: 'c1', duration: 1 },
      { key: 37, noteName: 'a0', duration: 0.5 },
      { key: 35, noteName: 'g0', duration: 0.5 },
      { key: 32, noteName: 'e0', duration: 1 },
      { key: 40, noteName: 'c1', duration: 1 },

      { key: 37, noteName: 'a0', duration: 0.5 },
      { key: 40, noteName: 'c1', duration: 0.5 },
      { key: 37, noteName: 'a0', duration: 0.5 },
      { key: 35, noteName: 'g0', duration: 0.5 },
      { key: 32, noteName: 'e0', duration: 0.5 },
      { key: 35, noteName: 'g0', duration: 0.5 },
      { key: 37, noteName: 'a0', duration: 0.5 },
      { key: 40, noteName: 'c1', duration: 0.5 },
      { key: 35, noteName: 'g0', duration: 2 }
    ]
  },
  {
    id: 5,
    title: '甩葱歌',
    difficulty:'medium' ,
    notes: [
      { key: 44, noteName: 'e1', duration: 1 },
      { key: 49, noteName: 'a1', duration: 1 },
      { key: 49, noteName: 'a1', duration: 1.5 },
      { key: 51, noteName: 'b1', duration: 0.5 },
      { key: 52, noteName: 'c2', duration: 0.5 },
      { key: 52, noteName: 'c2', duration: 0.5 },
      { key: 49, noteName: 'a1', duration: 1 },
      { key: 49, noteName: 'a1', duration: 1 },
      { key: 49, noteName: 'a1', duration: 0.5 },
      { key: 52, noteName: 'c2', duration: 0.5 },
      { key: 51, noteName: 'b1', duration: 1 },
      { key: 47, noteName: 'g1', duration: 1 },
      { key: 47, noteName: 'g1', duration: 1 },
      { key: 47, noteName: 'g1', duration: 1 },
      { key: 51, noteName: 'b1', duration: 0.5 },
      { key: 51, noteName: 'b1', duration: 0.5 },
      { key: 49, noteName: 'a1', duration: 1 },
      { key: 49, noteName: 'a1', duration: 1.5 },

      { key: 44, noteName: 'e1', duration: 1 },
      { key: 49, noteName: 'a1', duration: 1 },
      { key: 49, noteName: 'a1', duration: 1.5 },
      { key: 51, noteName: 'b1', duration: 0.5 },
      { key: 52, noteName: 'c2', duration: 0.5 },
      { key: 52, noteName: 'c2', duration: 0.5 },
      { key: 49, noteName: 'a1', duration: 1 },
      { key: 49, noteName: 'a1', duration: 1 },
      { key: 49, noteName: 'a1', duration: 0.5 },
      { key: 52, noteName: 'c2', duration: 1 },
      { key: 56, noteName: 'e2', duration: 0.5 },
      { key: 56, noteName: 'e2', duration: 0.5 },
      { key: 56, noteName: 'e2', duration: 0.5 },
      { key: 54, noteName: 'd2', duration: 1 },
      { key: 52, noteName: 'c2', duration: 1 },
      { key: 51, noteName: 'b1', duration: 1 },
      { key: 52, noteName: 'c2', duration: 1 },
      { key: 49, noteName: 'a1', duration: 0.5 },
      { key: 49, noteName: 'a1', duration: 0.5 },

      { key: 49, noteName: 'a1', duration: 0.5 },
      { key: 52, noteName: 'c2', duration: 1 },
      { key: 56, noteName: 'e2', duration: 0.5 },
      { key: 56, noteName: 'e2', duration: 0.5 },
      { key: 54, noteName: 'd2', duration: 1 },
      { key: 52, noteName: 'c2', duration: 1 },
      { key: 51, noteName: 'b1', duration: 1 },
      { key: 47, noteName: 'g1', duration: 1 },

      { key: 47, noteName: 'g1', duration: 0.5 },
      { key: 47, noteName: 'g1', duration: 0.5 },
      { key: 47, noteName: 'g1', duration: 0.5 },
      { key: 54, noteName: 'b2', duration: 1 },
      { key: 54, noteName: 'd2', duration: 1 },
      { key: 54, noteName: 'd2', duration: 1 },
      { key: 52, noteName: 'c2', duration: 1 },
      { key: 51, noteName: 'b1', duration: 1 },
      { key: 52, noteName: 'c2', duration: 1 },
      { key: 49, noteName: 'a1', duration: 0.5 },
      { key: 49, noteName: 'a1', duration: 0.5 },
    ]
  }
  ];
  
  export default {
    data() {
      return {
        availableSheets: sheetData,
        currentSheet: sheetData[0], // 默认加载第一首曲子
        currentNoteIndex: 0,
        showSheetSelection: false,
        pianoKeyToKeyboardKey: {}, // 钢琴键到键盘按键的映射
        noteItemWidth: 70, // 每个音符项的宽度，根据实际样式调整
        visibleNoteCount: 5, // 可视区域内能显示的音符数量
        noteListStyle: {
          transform: 'translateX(0)'
        },
        
        // 游戏状态
        gameStarted: false,
        currentScore: 0,
        
        // 评分反馈相关数据
        isScoreFeedbackVisible: false,
        finalScore: null,
        userPerformance: [], // 存储用户的按键表现记录
        practiceCompleted: false, // 是否完成练习
        errorDetails: [], // 错误详情


        // ...其他数据属性
        inactivityTimer: null, // 计时器
        maxInactivityTime: 3000, // 最大无活动时间（毫秒），例如5秒
        waitingForFirstNote: true, // 标志是否在等待第一个音符

        gameStarted: false, // 游戏是否已开始
        startMessageVisible: false, // 是否显示“游戏已开始”提示
        startMessageText: '', // 提示信息内容
        selectionMessageVisible: false, // 是否显示“选择乐谱”提示
        selectionMessageText: '', // 选择乐谱提示信息内容
        timedOut: false, // 是否超时未按下键盘

        // 历史记录相关数据
        showHistory: false, // 是否显示历史记录弹窗
        historyRecords: [], // 历史记录
        filteredHistory: [], // 过滤和排序后的历史记录
        historySort: 'time', // 历史记录排序方式
        batchDelete: false, // 是否处于批量删除模式
        selectedRecords: [], // 选中的历史记录索引
        showStartPrompt: false, // 是否显示开始提示弹窗
        currentFeedback: '', // 当前的反馈信息
        feedbackTimeout: null, // 反馈信息计时器
        startTime: 0, // 游戏开始时间
        lastNoteTime: 0, // 上一个音符的按键时间
        beatDuration: 600, // 每拍的毫秒数
        keyCodeToName: {}, // keyCode到按键名称的映射
        showConfetti: false,
        showFirecracker: false,
        // 新增状态
        combo: 0,
        maxCombo: 0,
        perfect: 0,
        good: 0,
        miss: 0,        evaluation: '',
        showResult: false,
        lastKeyPressTime: 0, // 添加防重复按键的时间戳
        keyPressDelay: 150, // 按键间隔限制（毫秒）
      };
    },    mounted() {
      // 初始化keyCode到按键名称的映射
      this.initKeyCodeToNameMapping();
      // 初始化钢琴键到键盘按键的映射
      this.initPianoToKeyboardMapping();
      
      // 只监听钢琴按键事件，避免重复
      window.addEventListener('pianoKeyPress', this.handlePianoKey);
      
      // 高亮显示第一个音符
      this.highlightCurrentNote();
      
      // 计算可视区域内能显示的音符数量
      this.calculateVisibleNoteCount();

      // 加载历史记录
      this.loadHistory();

        // 监听窗口大小变化
        window.addEventListener('resize', this.calculateVisibleNoteCount);
        miditimeline.on('hit', this.handleGameEvent);
        miditimeline.on('miss', this.handleGameEvent);
    },
      beforeDestroy() {
      // 移除事件监听器
      window.removeEventListener('pianoKeyPress', this.handlePianoKey);
      window.removeEventListener('resize', this.calculateVisibleNoteCount);
      miditimeline.off('hit', this.handleGameEvent);
      miditimeline.off('miss', this.handleGameEvent);
    },
    
    methods: {
      formatDuration(duration) {
        // 将数字时值转换为音乐符号表示
        const durationMap = {
          0.25: '♪',   // 十六分音符
          0.5: '♫',     // 八分音符
          1: '♩',       // 四分音符
          1.5: '♩.',    // 附点四分音符
          2: '',      // 二分音符
          3: '',     // 附点二分音符
          4: ''        // 全音符
        };
        return durationMap[duration] || duration;
      },
      
      // 获取难度等级的CSS类名
      getDifficultyClass(difficulty) {
        return `difficulty-${difficulty || 'easy'}`;
      },
        // 获取难度等级的显示文本
      getDifficultyText(difficulty) {
        const difficultyMap = {
          'easy': '简单',
          'medium': '中等',
          'hard': '困难'
        };
        return difficultyMap[difficulty] || '简单';
      },
      
      // 计算可视区域内能显示的音符数量
      calculateVisibleNoteCount() {
        if (this.$refs.noteListWrapper) {
          const wrapperWidth = this.$refs.noteListWrapper.clientWidth;
          this.visibleNoteCount = 5;
          this.updateNoteListPosition();
        }
      },
      
      // 更新音符列表的位置
      updateNoteListPosition() {
        // 计算需要滚动的距离
        let scrollPosition = 0;
        
        // 当当前音符索引超过可视区域的一半时开始滚动
        if (this.currentNoteIndex >= Math.floor(this.visibleNoteCount / 2)) {
          // 让当前音符保持在可视区域的中心位置
          const centerOffset = Math.floor(this.visibleNoteCount / 2);
          scrollPosition = Math.max(0, (this.currentNoteIndex - centerOffset) * this.noteItemWidth);
          
          // 确保不会滚动超过最后几个音符
          const maxScroll = Math.max(0, (this.currentSheet.notes.length - this.visibleNoteCount) * this.noteItemWidth);
          scrollPosition = Math.min(scrollPosition, maxScroll);
        }
        
        this.noteListStyle = {
          transform: `translateX(-${scrollPosition}px)`,
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        };
      },
      
      // 初始化钢琴键到键盘按键的映射（反向映射）
      initPianoToKeyboardMapping() {
        // 从cacheConf获取当前键盘映射
        const pckey2key = this.$store.state.cacheConf.pckey2key;
        
        // 反转映射关系，从钢琴键找到对应的键盘按键
        Object.keys(pckey2key).forEach(keyCode => {
          const pianoKey = pckey2key[keyCode];
          if (!this.pianoKeyToKeyboardKey[pianoKey]) {
            this.pianoKeyToKeyboardKey[pianoKey] = keyCode;
          }
        });
      },

      // 初始化keyCode到按键名称的映射
      initKeyCodeToNameMapping() {
        const kbdConfig = getKeyConfig();
        kbdConfig.forEach(row => {
          row.forEach(key => {
            this.keyCodeToName[key.c] = key.n;
          });
        });
      },

      getKeyboardKeyName(note) {
        const keyCode = this.pianoKeyToKeyboardKey[note.key];
        return this.keyCodeToName[keyCode] || '';
      },      handlePianoKey(event) {
        const currentTime = Date.now();
        
        // 防止重复按键
        if (currentTime - this.lastKeyPressTime < this.keyPressDelay) {
          return;
        }
        
        this.lastKeyPressTime = currentTime;
        
        const pressedKey = event.detail.key;
        if (this.gameStarted) {
          this.checkNote(pressedKey);
        } else {
          // 显示提示信息
          this.showStartPrompt = true;
        }
      },

      // 处理键盘按键事件
      handleKeyDown(event) {
        // 防止重复触发
        if (event.repeat) {
          return;
        }
        
        if (this.gameStarted) {
          // 获取按键对应的钢琴键
          const pianoKey = this.$store.state.cacheConf.pckey2key[event.keyCode];
          if (pianoKey) {
            this.checkNote(pianoKey);
          }
        }
      },

      // 处理游戏事件（如果需要的话）
      handleGameEvent(event) {
        // 这里可以处理来自 miditimeline 的事件
        console.log('Game event:', event);
      },

      // ...其他方法

      closeStartPrompt() {
        this.showStartPrompt = false;
      },


      //计时器
      startInactivityTimer() {
        // 清除之前的计时器
        this.clearInactivityTimer();
        // 设置新的计时器
        this.inactivityTimer = setTimeout(() => {
          this.timedOut = true; // 设置超时标志
          this.handleInactivity();
        }, this.maxInactivityTime);
      },

      clearInactivityTimer() {
        if (this.inactivityTimer) {
          clearTimeout(this.inactivityTimer);
          this.inactivityTimer = null;
        }
      },

      handleInactivity() {
        // 用户无活动，判定为出错并终止游戏
        this.showScoreFeedback();
        // this.resetPractice();
      },    // 检查按下的键是否是当前需要按的音符
    checkNote(keyPressed) {
      if (this.currentNoteIndex >= this.currentSheet.notes.length) {
        return; // 已经完成了所有音符
      }

      const pressTime = new Date().getTime();
      const currentNote = this.currentSheet.notes[this.currentNoteIndex];
      const expectedTime = (this.lastNoteTime || this.startTime) + currentNote.duration * this.beatDuration;
      const timeDiff = Math.abs(pressTime - expectedTime);

      // 检查按下的键是否与当前音符匹配
      const isCorrect = keyPressed === currentNote.key;

      let performance = {
        note: currentNote,
        keyPressed: keyPressed,
        isCorrect: isCorrect,
        timestamp: pressTime,
        accuracy: 'miss'
      };

      if (isCorrect) {
        // 更新评价统计
        if (timeDiff < 100) { // Perfect: 100ms内
          performance.accuracy = 'perfect';
          this.perfect++;
          this.currentScore += 300;
          this.combo++;
        } else if (timeDiff < 250) { // Good: 250ms内
          performance.accuracy = 'good';
          this.good++;
          this.currentScore += 200;
          this.combo++;
        } else { // Late but correct
          performance.accuracy = 'good';
          this.good++;
          this.currentScore += 100;
          this.combo++;
        }
        
        // 更新最大连击
        if (this.combo > this.maxCombo) {
          this.maxCombo = this.combo;
        }
        
        // 连击奖励
        if (this.combo >= 10) {
          this.currentScore += 50;
        } else if (this.combo >= 20) {
          this.currentScore += 100;
        }
        
        // 立即显示反馈
        this.showFeedback(performance.accuracy);
        this.updateEvaluation(performance.accuracy);
        
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
        
        // 移动到下一个音符
        this.currentNoteIndex++;
        this.lastNoteTime = pressTime;
        
        // 更新音符列表位置（滚动）
        this.updateNoteListPosition();

        // 重置计时器
        this.startInactivityTimer();
        this.waitingForFirstNote = false;

        if (this.currentNoteIndex < this.currentSheet.notes.length) {
          this.highlightCurrentNote();
        } else {
          // 完成了整首曲子
          this.showResult = true;
          this.triggerConfetti();
          setTimeout(() => {
            this.showScoreFeedback();
          }, 2000);
        }
      } else {
        // 按错键了
        performance.accuracy = 'miss';
        this.miss++;
        this.combo = 0; // 重置连击
        
        // 立即显示反馈
        this.showFeedback('miss');
        this.updateEvaluation('miss');
        
        // 按错键时，音符依然前进
        this.currentNoteIndex++;
        this.lastNoteTime = pressTime;
        
        // 更新音符列表位置（滚动）
        this.updateNoteListPosition();

        // 重置计时器
        this.startInactivityTimer();
        this.waitingForFirstNote = false;

        if (this.currentNoteIndex < this.currentSheet.notes.length) {
          this.highlightCurrentNote();
        } else {
          // 完成了整首曲子
          this.showResult = true;
          this.triggerConfetti();
          setTimeout(() => {
            this.showScoreFeedback();
          }, 2000);
        }
      }
      
      this.userPerformance.push(performance);
    },

    triggerConfetti() {
      this.showConfetti = true;
      this.showFirecracker = true;
      setTimeout(() => {
        this.showConfetti = false;
        this.showFirecracker = false;
      }, 3000); // 3秒后隐藏礼花和鞭炮
    },

    getConfettiStyle() {
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
      const x = Math.random() * 100; // vw
      const y = Math.random() * 100; // vh
      const rotation = Math.random() * 360; // deg
      const color = colors[Math.floor(Math.random() * colors.length)];
      const animationDuration = 2 + Math.random() * 3; // seconds
      const animationDelay = Math.random() * 2; // seconds

      return {
        left: `${x}vw`,
        top: `${y - 10}vh`, // Start above the screen
        backgroundColor: color,
        transform: `rotate(${rotation}deg)`,
        animation: `fall ${animationDuration}s linear ${animationDelay}s forwards`,
      };
    },      showFeedback(type) {
        if (this.feedbackTimeout) {
          clearTimeout(this.feedbackTimeout);
        }
        
        const feedbackTexts = {
          'perfect': 'PERFECT!',
          'good': 'GOOD!',
          'miss': 'MISS!'
        };
        
        const newFeedback = feedbackTexts[type] || type.toUpperCase();
        
        // 强制重新渲染以重新触发动画
        this.currentFeedback = ''; 
        
        this.$nextTick(() => {
          this.currentFeedback = newFeedback;
          this.feedbackTimeout = setTimeout(() => {
            this.currentFeedback = '';
          }, 1200); // 显示1.2秒
        });
      },      updateEvaluation(type) {
        this.evaluation = type.toUpperCase();
        // 为评价显示区域添加颜色类
        this.$nextTick(() => {
          const evaluationEl = document.querySelector('.evaluation-display');
          if (evaluationEl) {
            evaluationEl.className = `evaluation-display ${type.toUpperCase()}`;
          }
        });
        
        setTimeout(() => {
          this.evaluation = '';
          const evaluationEl = document.querySelector('.evaluation-display');
          if (evaluationEl) {
            evaluationEl.className = 'evaluation-display';
          }
        }, 800);
      },

      closeResult() {
        this.showResult = false;
        this.resetPractice();
      },

      // 计算得分
      calculateScore() {
      let totalNotes = this.currentSheet.notes.length;
      let correctNotes = this.userPerformance.filter(item => item.isCorrect).length;
      let accuracy = totalNotes > 0 ? correctNotes / totalNotes : 0;

      // 根据 'perfect' 和 'good' 计算得分
      let scoreFromAccuracy = this.userPerformance.reduce((acc, perf) => {
        if (perf.accuracy === 'perfect') {
          return acc + 2;
        } else if (perf.accuracy === 'good') {
          return acc + 1;
        }
        return acc;
      }, 0);

      // 计算连贯性（按键是否连续正确）
      let consecutiveCorrect = 0;
      let maxConsecutiveCorrect = 0;
      for (let i = 0; i < this.userPerformance.length; i++) {
        if (this.userPerformance[i].isCorrect) {
          consecutiveCorrect++;
          if (consecutiveCorrect > maxConsecutiveCorrect) {
            maxConsecutiveCorrect = consecutiveCorrect;
          }
        } else {
          consecutiveCorrect = 0;
        }
      }

      // 计算节奏准确性（根据按键时间间隔与乐谱设定的节拍匹配情况）
      let rhythmAccuracy = 0;
      if (this.userPerformance.length > 1) {
        let totalRhythmMatch = 0;
        for (let i = 1; i < this.userPerformance.length; i++) {
          const prevNote = this.userPerformance[i - 1].note;
          const prevTimestamp = this.userPerformance[i - 1].timestamp;
          const currentTimestamp = this.userPerformance[i].timestamp;
          const expectedDuration = prevNote.duration * this.beatDuration;
          const actualDuration = currentTimestamp - prevTimestamp;
          if (Math.abs(actualDuration - expectedDuration) < 300) { // 允许300毫秒的误差
            totalRhythmMatch++;
          }
        }
        rhythmAccuracy = (this.userPerformance.length > 1) ? (totalRhythmMatch / (this.userPerformance.length - 1)) : 0;
      }

      // 综合评分（可以根据需要调整权重）
      const accuracyWeight = 0.7;
      const consecutiveWeight = 0.1;
      const rhythmWeight = 0.2;
      const maxPossibleScore = totalNotes > 0 ? totalNotes * 2 : 1; // 每个 'perfect' 2分
      const totalScore = 
        (scoreFromAccuracy / maxPossibleScore) * accuracyWeight + 
        (maxConsecutiveCorrect / totalNotes) * consecutiveWeight + 
        rhythmAccuracy * rhythmWeight;

      return {
        totalScore: Math.round(totalScore * 100),
        accuracy: Math.round(accuracy * 100),
        maxConsecutiveCorrect: maxConsecutiveCorrect,
        rhythmAccuracy: Math.round(rhythmAccuracy * 100),
      };
    },


    // 在游戏结束时调用

    //  showScoreFeedback() {
    //     this.finalScore = this.calculateScore();
    //     this.practiceCompleted = this.currentNoteIndex === this.currentSheet.notes.length;

    //     // if (!this.practiceCompleted) {
    //     //   // 收集错误详情
    //     //   this.errorDetails = [];
    //     //   if (this.timedOut) {
    //     //     this.errorDetails.push("错误原因: 超时未按下键盘");
    //     //   } else {
    //     //     const incorrectNote = this.currentSheet.notes[this.currentNoteIndex];
    //     //     this.errorDetails.push(`错误原因: 按错键，正确键应为 ${incorrectNote.noteName}`);
    //     //   }
    //     // }

    //     completed = this.practiceCompleted;
    //     const historyItem = {
    //       songName: this.currentSheet.title,
    //       score: this.finalScore.totalScore,
    //       time: new Date().toISOString(), // 使用ISO时间格式存储
    //       completed: completed,
    //       errorReason: completed ? null : (this.timedOut ? 'timeout' : 'wrongKey')
    //     };

    //     this.saveHistory(historyItem);

    //     this.isScoreFeedbackVisible = true;
    //     this.resetPractice();
    // },
// 在游戏结束时调用
    showScoreFeedback() {
      this.finalScore = this.calculateScore();
      const completed = this.currentNoteIndex === this.currentSheet.notes.length;

      const historyItem = {
        songName: this.currentSheet.title,
        score: this.finalScore.totalScore,
        time: new Date().toISOString(), // 使用ISO时间格式存储
        completed: completed,
        errorReason: completed ? null : (this.timedOut ? 'timeout' : 'wrongKey')
      };

      this.saveHistory(historyItem);
      this.isScoreFeedbackVisible = true;
      this.resetPractice();
    },

      // 高亮当前音符对应的钢琴键
      highlightCurrentNote() {
        if (this.currentNoteIndex < this.currentSheet.notes.length) {
          const note = this.currentSheet.notes[this.currentNoteIndex];
          // 触发高亮显示当前音符对应的键
          const event = new CustomEvent('highlightNote', {
            detail: { key: note.key }
          });
          window.dispatchEvent(event);

          // 触发线圈动画
          const coilEvent = new CustomEvent('playCoil', {
            detail: { key: note.key, duration: note.duration * this.beatDuration / 1000 }
          });
          window.dispatchEvent(coilEvent);
        }
      },
      
      // 选择乐谱
      selectSheet() {
        this.showSheetSelection = true;
        this.clearInactivityTimer();
      },
      
      // 加载选择的乐谱
      loadSheet(sheet) {
        this.currentSheet = sheet;
        this.resetPractice();
        this.showSheetSelection = false;
        this.selectionMessageText = `已选择乐谱: ${sheet.title}`;
        this.selectionMessageVisible = true;
        setTimeout(() => {
          this.selectionMessageVisible = false;
        }, 3000);
      },
        // 重置练习
      resetPractice() {
        this.currentNoteIndex = 0;
        this.updateNoteListPosition();
        this.highlightCurrentNote();
        this.userPerformance = []; // 重置用户表现记录
        this.lastKeyPressTime = 0; // 重置按键时间戳
        this.clearInactivityTimer(); // 清除计时器
        this.waitingForFirstNote = true; // 重置等待状态
        this.startMessageVisible=false; // 隐藏开始提示信息
        this.gameStarted = false; // 重置游戏状态
 
      },

      restartGame() {
        this.resetPractice();
        this.startMessageText = '游戏已重新开始！请按照乐谱顺序弹奏钢琴键。';
        this.startGame();
      },        // 开始提示弹窗
      startGame() {
        this.startTime = new Date().getTime();
        this.lastNoteTime = this.startTime;
        this.lastKeyPressTime = 0; // 重置按键时间戳
        
        this.clearInactivityTimer();
        this.waitingForFirstNote = true;

        this.highlightCurrentNote();

        this.gameStarted = true;
        if (!this.startMessageText) {
          this.startMessageText = '游戏已开始！请按照乐谱顺序弹奏钢琴键。';
        }
        this.startMessageVisible = true;
        miditimeline.gameMode = true;
        // 重置统计
        this.combo = 0;
        this.maxCombo = 0;
        this.perfect = 0;
        this.good = 0;
        this.miss = 0;
        this.currentScore = 0;
        this.evaluation = '';
        this.showResult = false;
      },

    // 删除全部历史记录
    deleteAllHistory() {
      if (confirm('确定要删除所有历史记录吗？')) {
        this.historyRecords = [];
        this.filteredHistory = [];
        localStorage.removeItem('pianoPracticeHistory');
      }
    },

    // 排序历史记录
    sortHistory(criteria) {
      this.historySort = criteria;
      this.filteredHistory.sort((a, b) => {
        if (criteria === 'time') {
          return new Date(b.time) - new Date(a.time);
        } else if (criteria === 'score') {
          return b.score - a.score;
        }
        return 0;
      });
    },

        // 切换批量删除模式
    toggleBatchDelete() {
      this.batchDelete = !this.batchDelete;
      this.selectedRecords = [];
    },

    // 删除选中的历史记录
    deleteSelectedHistory() {
      if (this.selectedRecords.length === 0) {
        alert('请选择要删除的历史记录');
        return;
      }
      if (confirm(`确定要删除 ${this.selectedRecords.length} 条历史记录吗？`)) {
        // 按索引降序排序，避免删除时索引变化影响
        this.selectedRecords.sort((a, b) => b - a).forEach(index => {
          this.filteredHistory.splice(index, 1);
        });
        this.historyRecords = [...this.filteredHistory];
        localStorage.setItem('pianoPracticeHistory', JSON.stringify(this.historyRecords));
        this.selectedRecords = [];
        this.batchDelete = false;
      }
    },

    // 保存历史记录
    saveHistory(record) {
      this.historyRecords.push(record);
      localStorage.setItem('pianoPracticeHistory', JSON.stringify(this.historyRecords));
      this.loadHistory();
    },

    // 加载历史记录
    loadHistory() {
      const saved = localStorage.getItem('pianoPracticeHistory');
      if (saved) {
        this.historyRecords = JSON.parse(saved);
      }
      this.filteredHistory = [...this.historyRecords];
      this.sortHistory('time'); // 默认按时间排序
    },

    // 删除单个历史记录
    deleteHistory(index) {
      if (confirm('确定要删除这条历史记录吗？')) {
        this.filteredHistory.splice(index, 1);
        this.historyRecords = [...this.filteredHistory];
        localStorage.setItem('pianoPracticeHistory', JSON.stringify(this.historyRecords));
      }
    },

    // 格式化时间
    formatTime(timeString) {
      const date = new Date(timeString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },

    toggleHistory() {
      this.showHistory = !this.showHistory;
      if (this.showHistory) {
        this.loadHistory();
      }
    }
  },
  computed: {
    feedbackClass() {
      if (!this.currentFeedback) return '';
      // 从 'PERFECT!' 中提取 'PERFECT' 作为类名
      return this.currentFeedback.slice(0, -1);
    },
    gameStatusText() {
      if (!this.gameStarted) {
        return '未开始';
      } else if (this.currentNoteIndex >= this.currentSheet.notes.length) {
        return '已完成';
      } else {
        return '进行中';
      }
    }
  }
};
</script>
  
  <style lang="stylus">
  .rhythm-game {
    position: relative;
    padding: 20px;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    
    // 背景装饰
    .background-decoration {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      
      .music-note {
        position: absolute;
        font-size: 2rem;
        color: rgba(255, 255, 255, 0.1);
        animation: float 6s ease-in-out infinite;
        
        &.note-1 {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }
        
        &.note-2 {
          top: 20%;
          right: 15%;
          animation-delay: 1s;
        }
        
        &.note-3 {
          bottom: 30%;
          left: 20%;
          animation-delay: 2s;
        }
        
        &.note-4 {
          bottom: 15%;
          right: 10%;
          animation-delay: 3s;
        }
      }
    }
      .fp-header {
      position: relative;
      z-index: 1;
      text-align: center;
      margin-bottom: 15px;
      
      .header-content {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      }
      
      .main-title {
        position: relative;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 6px;
        color: #333;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        
        .title-icon {
          font-size: 22px;
          animation: bounce 2s infinite;
        }
        
        .title-decoration {
          position: absolute;
          bottom: -3px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 1px;
        }
      }
      
      .subtitle {
        color: #666;
        font-size: 12px;
        margin-bottom: 10px;
        line-height: 1.4;
      }        .game-status-container {
          margin-top: 10px;
          
          .status-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            font-size: 12px;
            color: #555;
            
            .score-display {
              font-weight: bold;
              color: #667eea;
            }

            .combo-display {
              font-weight: bold;
              color: #51cf66;
            }
          }

          .evaluation-display {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            color: #667eea;
            min-height: 16px;
            margin-bottom: 6px;
            transition: all 0.3s ease;
          }
          
          .progress-bar {
            width: 100%;
            height: 4px;
            background: #e0e0e0;
            border-radius: 2px;
            overflow: hidden;
            
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #667eea, #764ba2);
              border-radius: 2px;
              transition: width 0.3s ease;
            }
          }
        }
    }
    
    /* 提示信息样式 */
    .start-message, .selection-message {
      position: absolute;
      top: 20px;
      right: 20px;
      background-color: rgba(255, 255, 255, 0.9);
      color: #333;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 100;
      text-align: center;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #0166bd;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
      .sheet-container {
      position: relative;
      z-index: 1;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      padding: 25px;
      margin-bottom: 20px;
      
      .sheet-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 25px;
        flex-wrap: wrap;
        gap: 20px;
        
        .sheet-info {
          flex: 1;
          min-width: 250px;
          
          .sheet-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            
            .sheet-icon {
              font-size: 28px;
              animation: pulse 2s infinite;
            }
          }
          
          .sheet-meta {
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
            
            .difficulty {
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              
              &.difficulty-easy {
                background: #e8f5e8;
                color: #2e7d32;
              }
              
              &.difficulty-medium {
                background: #fff3e0;
                color: #f57c00;
              }
              
              &.difficulty-hard {
                background: #ffebee;
                color: #d32f2f;
              }
            }
            
            .note-count {
              color: #666;
              font-size: 14px;
            }
          }
        }
        
        .sheet-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          
          .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border: none;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            
            .btn-icon {
              font-size: 16px;
            }
            
            &.btn-select {
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              
              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
              }
            }
            
            &.btn-reset {
              background: linear-gradient(135deg, #ff6b6b, #ee5a24);
              color: white;
              
              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
              }
            }
            
            &.btn-start {
              background: linear-gradient(135deg, #51cf66, #40c057);
              color: white;
              
              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(81, 207, 102, 0.4);
              }
            }
            
            &.btn-history {
              background: linear-gradient(135deg, #ffd43b, #fab005);
              color: white;
              
              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(255, 212, 59, 0.4);
              }
            }
          }
        }
      }
        .sheet-display {
        background: linear-gradient(135deg, #f8f9ff, #e8f0ff);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 15px;
        min-height: 100px;
        border: 2px solid rgba(102, 126, 234, 0.1);
        
        .note-list-wrapper {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          margin-bottom: 20px;
        }
        
        .note-list {
          display: inline-flex;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          gap: 8px;
          
          .note-item {
            position: relative;
            padding: 12px 16px;
            background: white;
            border: 2px solid #e0e7ff;
            border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-width: 70px;
            height: 80px;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            
            .note-content {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 2px;
              height: 100%;
              
              .note-name {
                font-size: 14px;
                font-weight: 600;
                color: #333;
                line-height: 1;
              }
              
              .note-symbol {
                font-size: 20px;
                color: #667eea;
                line-height: 1;
              }
              
              .note-duration {
                font-size: 11px;
                color: #666;
                line-height: 1;
              }
            }
            
            .note-indicator {
              position: absolute;
              top: -5px;
              right: -5px;
              width: 20px;
              height: 20px;
              
              .pulse-ring {
                width: 100%;
                height: 100%;
                border: 2px solid #ff6b6b;
                border-radius: 50%;
                animation: pulse-ring 1.5s infinite;
              }
            }
            
            &.current {
              background: linear-gradient(135deg, #ff6b6b, #ee5a24);
              color: white;
              transform: scale(1.1) translateY(-5px);
              border-color: #ff6b6b;
              box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
              z-index: 2;
              
              .note-content {
                .note-name, .note-symbol, .note-duration {
                  color: white;
                }
              }
            }
            
            &.completed {
              background: linear-gradient(135deg, #51cf66, #40c057);
              color: white;
              border-color: #51cf66;
              transform: scale(0.95);
              
              .note-content {
                .note-name, .note-symbol, .note-duration {
                  color: white;
                }
              }
            }
            
            &.upcoming {
              border-color: #ffd43b;
              background: #fff9db;
              
              .note-content {
                .note-symbol {
                  color: #fab005;
                }
              }
            }
          }
        }        .feedback-display {
          position: absolute;
          top: 35%; /* 上移，更突出 */
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Impact', 'Arial Black', sans-serif; /* 使用更有冲击力的字体 */
          font-size: 6em; /* 显著增大字体 */
          font-weight: 900;
          opacity: 0;
          transition: opacity 0.3s ease-out; /* 平滑消失 */
          z-index: 100;
          pointer-events: none;
          -webkit-font-smoothing: antialiased;
          
          &.PERFECT {
            color: #ffc700;
            -webkit-text-stroke: 3px #8c6d00; /* 更粗的描边 */
            text-shadow: 4px 4px 0px #8c6d00, 0 0 25px rgba(255, 199, 0, 0.8);
            opacity: 1;
            animation: feedback-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          
          &.GOOD {
            color: #76ff03;
            -webkit-text-stroke: 2px #33691e;
            text-shadow: 3px 3px 0px #33691e, 0 0 20px rgba(118, 255, 3, 0.7);
            opacity: 1;
            animation: feedback-pop 0.5s ease-out forwards;
          }
          
          &.MISS {
            color: #9e9e9e;
            -webkit-text-stroke: 2px #424242;
            text-shadow: 2px 2px 0px #424242;
            opacity: 1;
            animation: feedback-shake 0.5s cubic-bezier(.36,.07,.19,.97) forwards;
          }
        }

        .evaluation-display {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.2em;
          font-weight: bold;
          z-index: 99;
          pointer-events: none;
          transition: all 0.3s ease;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          
          &.PERFECT {
            color: #FFD700;
          }
          
          &.GOOD {
            color: #32CD32;
          }
          
          &.MISS {
            color: #FF4444;
          }
        }
        
        .next-note-preview {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 10px;
          padding: 15px;
          text-align: center;
          border: 1px solid rgba(102, 126, 234, 0.2);
          
          .preview-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .preview-note {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            
            .preview-name {
              font-size: 18px;
              font-weight: bold;
              color: #333;
            }
            
            .preview-symbol {
              font-size: 24px;
              color: #667eea;
            }
          }
        }
      }
    }
    
    // 改进的乐谱选择弹窗遮罩
    .sheet-selection-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(5px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    }
    
    .sheet-selection {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      animation: modalSlideIn 0.3s ease;
      transform-origin: center center;
      
      .selection-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #f0f0f0;
        
        h3 {
          margin: 0;
          font-size: 24px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 10px;
          
          .header-icon {
            font-size: 28px;
          }
        }
        
        .close-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: #f5f5f5;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          
          &:hover {
            background: #ff6b6b;
            color: white;
            transform: scale(1.1);
          }
          
          span {
            font-size: 18px;
            font-weight: bold;
          }
        }
      }
      
      .sheet-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
        
        .sheet-item {
          position: relative;
          background: #f8f9ff;
          border: 2px solid transparent;
          border-radius: 15px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
          }
          
          &.active {
            border-color: #51cf66;
            background: #e8f5e8;
          }
          
          .sheet-preview {
            display: flex;
            gap: 20px;
            align-items: flex-start;
            
            .sheet-cover {
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #667eea, #764ba2);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              
              .cover-icon {
                font-size: 24px;
                color: white;
              }
            }
            
            .sheet-details {
              flex: 1;
              
              .sheet-name {
                font-size: 18px;
                font-weight: bold;
                color: #333;
                margin: 0 0 10px 0;
              }
              
              .sheet-stats {
                display: flex;
                gap: 15px;
                margin-bottom: 10px;
                flex-wrap: wrap;
                
                .stat-item {
                  display: flex;
                  align-items: center;
                  gap: 5px;
                  font-size: 14px;
                  color: #666;
                  
                  .stat-icon {
                    font-size: 16px;
                  }
                  
                  &.difficulty-badge {
                    padding: 4px 8px;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 12px;
                    
                    &.difficulty-easy {
                      background: #e8f5e8;
                      color: #2e7d32;
                    }
                    
                    &.difficulty-medium {
                      background: #fff3e0;
                      color: #f57c00;
                    }
                    
                    &.difficulty-hard {
                      background: #ffebee;
                      color: #d32f2f;
                    }
                  }
                }
              }
              
              .sheet-preview-notes {
                display: flex;
                gap: 5px;
                flex-wrap: wrap;
                
                .preview-note-mini {
                  background: white;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 12px;
                  color: #667eea;
                  border: 1px solid #e0e7ff;
                }
                
                .more-notes {
                  color: #999;
                  font-size: 12px;
                  align-self: center;
                }
              }
            }
          }
          
          .selection-indicator {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 30px;
            height: 30px;
            background: #51cf66;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
          }
        }
      }
    }
    
    // 动画效果
    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
    }
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }
    
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }
    
    @keyframes pulse-ring {
      0% {
        transform: scale(0.8);
        opacity: 1;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
      @keyframes modalSlideIn {
      from {
        transform: scale(0.7);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes feedback-pop {
      0% {
        transform: translate(-50%, -50%) scale(0.2);
        opacity: 0;
      }
      60% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }

    @keyframes feedback-shake {
      0%, 100% {
        transform: translate(-50%, -50%) rotate(0deg);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translate(-50%, -50%) rotate(3deg);
      }
      20%, 40%, 60%, 80% {
        transform: translate(-50%, -50%) rotate(-3deg);
      }
    }
      // 响应式设计
    @media (max-width: 768px) {
      .rhythm-game {
        padding: 15px;
        
        .fp-header {
          margin-bottom: 15px;
          
          .header-content {
            padding: 15px;
          }
          
          .main-title {
            font-size: 20px;
            flex-direction: column;
            gap: 5px;
          }
          
          .subtitle {
            font-size: 12px;
          }
        }
        
        .sheet-container {
          padding: 20px;
          
          .sheet-header {
            flex-direction: column;
            align-items: stretch;
            
            .sheet-actions {
              justify-content: center;
            }
          }
          
          .sheet-display {
            padding: 15px;
            
            .note-list {
              .note-item {
                min-width: 60px;
                height: 70px;
                padding: 8px 12px;
                
                .note-content {
                  .note-name {
                    font-size: 12px;
                  }
                  
                  .note-symbol {
                    font-size: 16px;
                  }
                  
                  .note-duration {
                    font-size: 10px;
                  }
                }
              }
            }
          }
        }
        
        .sheet-selection {
          width: 95%;
          padding: 20px;
          
          .sheet-list {
            .sheet-item {
              .sheet-preview {
                flex-direction: column;
                text-align: center;
                
                .sheet-cover {
                  align-self: center;
                }
              }
            }
          }
        }
      }
    }

    // 结果面板样式
.result-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  animation: fadeIn 0.5s ease;

  .result-content {


    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    color: white;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 90%;
    height: 90vh; /* 设置高度 */
    overflow-y: auto; /* 添加滚动条 */
    animation: modalSlideIn 0.5s ease;


    .result-title {
      font-size: 28px;
      margin-bottom: 30px;
      font-weight: bold;
    }

    .result-summary {
      margin-bottom: 30px;

      p {
        font-size: 18px;
        margin: 10px 0;
      }

      .final-score {
        font-size: 32px;
        font-weight: bold;
        color: #ffd43b;
      }

      .max-combo {
        font-size: 24px;
        font-weight: bold;
        color: #51cf66;
      }
    }

    .result-details {
      margin-bottom: 30px;

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        margin: 5px 0;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        font-size: 16px;

        &.perfect {
          background: rgba(255, 212, 59, 0.2);
        }

        &.good {
          background: rgba(81, 207, 102, 0.2);
        }

        &.miss {
          background: rgba(255, 107, 107, 0.2);
        }

        span {
          font-weight: bold;
          font-size: 18px;
        }
      }
    }

    /* 优化后的评分反馈样式 */
    .score-feedback-card {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 15px;
    padding: 25px;
    margin: 30px 0;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    text-align: left;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    max-height: 70%; /* 添加最大高度限制 */
    overflow-y: auto; /* 添加滚动条 */

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
      }
    }

    .score-feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .feedback-title {
      font-size: 20px;
      font-weight: bold;
      color: #ffd43b;
    }

    .score-badge {
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #ffd43b, #ff9800);
      padding: 8px 15px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 18px;
    }

    .score-badge-text {
      font-size: 24px;
      margin-right: 5px;
    }

    .score-badge-label {
      font-size: 14px;
      opacity: 0.8;
    }

    .score-feedback-body {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .score-metric {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .metric-label {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.8);
    }

    .metric-value {
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .metric-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      overflow: hidden;
    }

    .metric-progress {
      height: 100%;
      background: linear-gradient(90deg, #ffd43b, #ff9800);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .consecutive-counter {
      width: 30px;
      height: 30px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      color: white;
      margin-left: 10px;
    }

    .btn-back {
      padding: 12px 30px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid white;
      border-radius: 25px;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: white;
        color: #667eea;
        transform: translateY(-2px);
      }
    }
  }
}

    // 历史记录弹窗样式
    .history-feedback {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;

      .feedback-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 2px solid #f0f0f0;

        h3 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          
          &:hover {
            color: #666;
          }
        }
      }

      .history-content {
        background: white;
        border-radius: 15px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .history-filters {
          display: flex;
          gap: 10px;
          padding: 20px;
          border-bottom: 1px solid #f0f0f0;

          .filter-btn {
            padding: 8px 16px;
            border: 2px solid #667eea;
            background: white;
            color: #667eea;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: #667eea;
              color: white;
            }
          }
        }

        .batch-delete {
          padding: 10px 20px;
          border-bottom: 1px solid #f0f0f0;

          .batch-delete-btn {
            padding: 8px 16px;
            border: 2px solid #ff6b6b;
            background: white;
            color: #ff6b6b;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: #ff6b6b;
              color: white;
            }
          }
        }

        .history-list {
          flex: 1;
          overflow-y: auto;
          padding: 20px;

          .history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: #f8f9ff;
            border-radius: 10px;
            border: 1px solid #e0e7ff;
            transition: all 0.3s ease;

            &:hover {
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
            }

            .history-song {
              font-weight: bold;
              color: #333;
              flex: 1;
            }

            .history-score {
              color: #667eea;
              font-weight: bold;
              margin: 0 15px;
            }

            .history-time {
              color: #666;
              font-size: 12px;
              margin: 0 15px;
            }

            .history-status {
              color: #666;
              font-size: 14px;
              margin: 0 15px;
            }

            .delete-btn {
              padding: 4px 12px;
              background: #ff6b6b;
              color: white;
              border: none;
              border-radius: 15px;
              cursor: pointer;
              transition: all 0.3s ease;

              &:hover {
                background: #ff5252;
              }
            }
          }
        }

        .delete-all-container, .delete-selected-container {
          padding: 20px;
          border-top: 1px solid #f0f0f0;
          text-align: center;

          .delete-all-btn, .delete-selected-btn {
            padding: 10px 20px;
            background: #ff6b6b;
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: #ff5252;
            }
          }
        }
      }
    }
}
</style>


