'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import { Spin, Typography, theme } from 'antd';
import styled, { keyframes } from 'styled-components';

// 定义Context类型
interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  setLoadingWithMessage: (loading: boolean, message?: string) => void;
}

// 创建Context
const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setLoading: () => {},
  setLoadingWithMessage: () => {},
});

// 定义淡入动画
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// 定义微小的上浮动画，使加载指示器看起来更有活力
const floatUp = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

// 样式化加载覆盖层
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(240, 242, 245, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  opacity: 0;
  animation: ${fadeIn} 0.3s forwards;
`;

// 样式化加载容器，添加上浮动画
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${floatUp} 2s ease-in-out infinite;
`;

// Provider组件
interface LoadingProviderProps {
  children: ReactNode;
  delayMs?: number; // 延迟显示的毫秒数
}

export const LoadingProvider = ({ children, delayMs = 300 }: LoadingProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { Text } = Typography;
  const { token } = theme.useToken();

  // 设置加载状态的函数，添加延迟显示逻辑
  const setLoading = useCallback((loading: boolean) => {
    if (loading) {
      setIsLoading(true);
      // 短暂延迟后显示加载状态，避免快速导航闪烁
      timeoutRef.current = setTimeout(() => {
        setShouldShow(true);
      }, delayMs);
    } else {
      setIsLoading(false);
      setShouldShow(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [delayMs]);
  
  // 设置加载状态和自定义消息
  const setLoadingWithMessage = useCallback((loading: boolean, customMessage?: string) => {
    setMessage(customMessage);
    setLoading(loading);
  }, [setLoading]);
  
  // 清理函数
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setLoading, 
      setLoadingWithMessage
    }}>
      {children}
      {isLoading && shouldShow && (
        <LoadingOverlay>
          <LoadingContainer>
            <Spin size="large" />
            <Text style={{ 
              marginTop: 16, 
              color: token.colorTextSecondary, 
              fontWeight: 500 
            }}>
              {message || '页面加载中，请稍候...'}
            </Text>
            <Text style={{ 
              marginTop: 8, 
              color: token.colorTextDescription, 
              fontSize: 12 
            }}>
              系统正在努力为您跳转
            </Text>
          </LoadingContainer>
        </LoadingOverlay>
      )}
    </LoadingContext.Provider>
  );
};

// 自定义Hook，用于获取和设置加载状态
export const useGlobalLoading = () => useContext(LoadingContext);