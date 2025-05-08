'use client';

import { useRouter } from 'next/navigation';
import { useGlobalLoading } from '@/contexts/LoadingContext';
import { useCallback, useEffect, useRef } from 'react';

// 创建导航事件总线
export const navigationEvents = {
  listeners: new Set<Function>(),
  emit(event: any) {
    this.listeners.forEach(listener => listener(event));
  },
  subscribe(listener: Function) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
};

export const useNavigation = () => {
  const router = useRouter();
  const { setLoading, setLoadingWithMessage } = useGlobalLoading();
  // 添加一个引用来跟踪计时器
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleRouteComplete = () => {
      setLoading(false);
    };
      // Next.js没有内置的路由事件，但我们可以监听文档完成加载
      if (typeof window !== 'undefined') {
        // window.addEventListener('DOMContentLoaded', handleRouteComplete);
        // window.addEventListener('load', handleRouteComplete);
        
        let domInactivityTimer: NodeJS.Timeout | null = null; // MutationObserver 的不活动计时器
        // 监听React的渲染完成
        const observer = new MutationObserver(() => {
          // 每当DOM变化时，清除并重置不活动计时器
          if (domInactivityTimer) {
            clearTimeout(domInactivityTimer);
          }
          domInactivityTimer = setTimeout(() => {
              // 在一段DOM“静默”期后，我们假设页面渲染已稳定
              // 这个时间（假设 750ms）可以根据应用实际情况调整
              requestAnimationFrame(() => { // 确保在下一个绘制周期执行
                setLoading(false);
              });
            }, 750); // 例如，等待750毫秒的DOM静默期
          });
        
        observer.observe(document.body, {
          childList: true, // 监视子节点的添加或删除
          subtree: true,   // 监视所有后代节点
          attributes: false, // 通常我们不需要监视属性变化来判断加载状态
          characterData: false // 也不需要监视字符数据变化
        });
        
        return () => {
          // window.removeEventListener('DOMContentLoaded', handleRouteComplete);
          // window.removeEventListener('load', handleRouteComplete);
          observer.disconnect();
          if (domInactivityTimer) {
            clearTimeout(domInactivityTimer); // 清理不活动计时器
          }

          // 清理计时器
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        };
      }
    }, [setLoading]);
  
  // 导航到新页面，增加回调函数的支持
  const navigateTo = useCallback((
    path: string, 
    options?: { 
      timeout?: number,
      onComplete?: () => void,
      loadingMessage?: string
    }
  ) => {
    const { timeout = 1500, onComplete, loadingMessage } = options || {};
    
    // 清除之前的计时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // 设置加载状态，可以包含自定义消息
    if (loadingMessage) {
      setLoadingWithMessage(true, loadingMessage);
    } else {
      setLoading(true);
    }
    
    // 发出导航事件
    navigationEvents.emit({ 
      type: 'navigation', 
      from: typeof window !== 'undefined' ? window.location.pathname : null, 
      to: path, 
      timestamp: Date.now() 
    });
    
    // 设置超时以确保加载状态最终会结束
    timerRef.current = setTimeout(() => {
      setLoading(false);
      timerRef.current = null;
    }, timeout);
    
    // 尝试跳转到目标页面并添加错误处理
    try {
      // 跳转到目标页面
      router.push(path);
      
      // 使用requestAnimationFrame检测路由变化后的DOM更新完成
      const detectRouteComplete = () => {
        if (typeof window !== 'undefined' && window.location.pathname === path) {
          // URL 已经改变
          // 如果有 onComplete 回调，则在下一个动画帧执行它
          // 路由已经变化，等待DOM完全渲染
          if (onComplete) {
            requestAnimationFrame(onComplete);
          }
          // setLoading(false) 的任务交给 useEffect 中的 MutationObserver 或上面的主超时 timerRef
        } else {
          // 如果路径还未改变，继续检测
          requestAnimationFrame(detectRouteComplete);
        }
      };
      
      // 启动检测
      requestAnimationFrame(detectRouteComplete);
    } catch (error) {
      console.error('导航错误:', error);
      setLoading(false);
      // 可以在这里添加错误通知
    }
  }, [router, setLoading, setLoadingWithMessage]);
  
  // 返回上一页，添加备用路径
  const goBack = useCallback((fallbackPath = '/main/profile', timeout = 1500, loadingMessage?: string) => {
    // 清除之前的计时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // 记录当前路径，用于检测路由变化
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // 设置加载状态，可以包含自定义消息
    if (loadingMessage) {
      setLoadingWithMessage(true, loadingMessage);
    } else {
      setLoading(true);
    }
    
    // 设置超时以确保加载状态最终会结束
    timerRef.current = setTimeout(() => {
      setLoading(false);
      timerRef.current = null;
    }, timeout);
    
    try {
      // 如果有历史记录则返回，否则导航到指定页面
      if (window.history.length > 1) {
        router.back();
      } else {
        // 如果没有历史记录，则导航到回退路径
        router.push(fallbackPath);
      }
      
      // 使用requestAnimationFrame检测路由变化
      const detectRouteChange = () => {
        // 检查路径是否发生了变化
        if (typeof window !== 'undefined' && window.location.pathname !== currentPath) {
          // 路由已经变化，等待DOM完全渲染
          // setTimeout(() => {
          //   setLoading(false);
          // }, 100);
        } else {
          // 继续检测
          requestAnimationFrame(detectRouteChange);
        }
      };
      
      // 启动检测
      requestAnimationFrame(detectRouteChange);
    } catch (error) {
      console.error('返回导航错误:', error);
      setLoading(false);
    }
  }, [router, setLoading, setLoadingWithMessage]);
  
  // 带确认的导航
  const navigateWithConfirm = useCallback((
    path: string, 
    options?: { 
      shouldConfirm?: boolean,
      confirmMessage?: string,
      timeout?: number,
      onComplete?: () => void,
      loadingMessage?: string
    }
  ) => {
    const { 
      shouldConfirm = false, 
      confirmMessage = '你有未保存的更改，确定要离开吗？',
      loadingMessage,
      ...restOptions 
    } = options || {};
    
    if (shouldConfirm && !window.confirm(confirmMessage)) {
      return;
    }
    
    navigateTo(path, { ...restOptions, loadingMessage });
  }, [navigateTo]);
  
  // 带历史记录的导航
  const navigateWithHistory = useCallback((
    path: string, 
    options?: { 
      timeout?: number,
      onComplete?: () => void,
      loadingMessage?: string
    }
  ) => {
    // 保存当前路径到sessionStorage
    if (typeof window !== 'undefined') {
      const prevPath = window.location.pathname;
      sessionStorage.setItem('previousPath', prevPath);
    }
    navigateTo(path, options);
  }, [navigateTo]);

  // 返回保存的页面
  const goBackToSaved = useCallback((
    fallbackPath = '/main/profile', 
    timeout = 1500,
    loadingMessage?: string
  ) => {
    const savedPath = typeof window !== 'undefined' ? sessionStorage.getItem('previousPath') : null;
    if (savedPath) {
      navigateTo(savedPath, { timeout, loadingMessage });
    } else {
      goBack(fallbackPath, timeout, loadingMessage);
    }
  }, [navigateTo, goBack]);
  
  // 条件重定向
  const handleRedirect = useCallback((
    condition: boolean, 
    redirectPath: string, 
    originalPath: string,
    options?: {
      timeout?: number,
      onComplete?: () => void,
      loadingMessage?: string
    }
  ) => {
    if (condition) {
      navigateTo(redirectPath, options);
      return true;
    } else {
      navigateTo(originalPath, options);
      return false;
    }
  }, [navigateTo]);
  
  return { 
    navigateTo, 
    goBack, 
    navigateWithConfirm, 
    navigateWithHistory, 
    goBackToSaved,
    handleRedirect
  };
};