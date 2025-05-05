// 全局类型声明

// 为window对象添加MSW准备状态属性
declare global {
  interface Window {
    mswReady?: boolean;
  }
}

export {}; 