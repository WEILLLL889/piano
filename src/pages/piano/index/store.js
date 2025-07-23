import Vue from 'vue';
import Vuex from 'vuex';

import pckey2key from './pckey-key';

Vue.use(Vuex);

export default function () {
  const store = new Vuex.Store({
    state: {
      mainDoc: '', // 主文档
      hideNavBar: false, // 是否隐藏导航条
      background: localStorage.getItem('background') || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1920', // 新增：背景图片名称
      cacheConf: {
        showKbdNum: true, // 显示键盘上的数字
        scale: 1, // 保存对barScale控制的参数，1-20
        barScale: 1, // 键盘可见区比例
        left: 0.5, // 0-1之间，表示键盘偏移数据
        pckey2key: pckey2key(),
      },
    },

    mutations: {
      setData(state, data) {
        state.mainDoc = data && data.doc;
      },
      // 新增：设置背景的 mutation
      SET_BACKGROUND(state, bg) {
        state.background = bg || 'pianobg.jpg'; // 防止传入空值
      },
    },

    actions: {},
  });

  return store;
}