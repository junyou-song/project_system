'use client';

import { useEffect } from 'react';

// 全局变量，标记MSW是否已初始化
declare global {
  interface Window {
    mswReady?: boolean;
  }
}

// 仅在开发环境中加载并启动 MSW
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // 确保在浏览器环境中执行
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // 尝试以最高优先级加载MSW
    const { worker } = await import('@/mocks/browser');

    // 设置更积极的配置启动 MSW
    await worker.start({
      onUnhandledRequest: 'bypass',
      // 不等待ServiceWorker完全激活
      waitUntilReady: false,
      // 减少不必要的日志
      quiet: true
    });
    
    // 设置全局标记，表示MSW已准备好
    window.mswReady = true;
    console.log('[MSW] Mocking enabled, intercepting requests');
  } catch (error) {
    console.error('[MSW] Failed to initialize:', error);
  }
}

export function MSWComponent() {
  useEffect(() => {
    // 立即调用，不使用异步
    enableMocking();
    
    return () => {
      // 组件卸载时修改标记
      if (typeof window !== 'undefined') {
        window.mswReady = false;
      }
    };
  }, []);

  return null; // 这个组件不渲染任何可见的 UI
} 