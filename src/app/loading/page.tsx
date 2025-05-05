'use client';

import React, { useEffect } from 'react';
import { Spin, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import styled from 'styled-components'; // 使用 styled-components 来居中

const { Text } = Typography;

// --- Styled Components for Centering --- (可选，或使用 Tailwind/CSS Modules)
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5; // 使用 Ant Design 的背景色或自定义
`;

// ----------------------------------------

export default function LoadingPage() {
  const router = useRouter();
  const destinationUrl = '/main/profile'; // 最终跳转的目标地址

  useEffect(() => {
    // 设置一个短暂延时，让用户看到加载状态
    const timer = setTimeout(() => {
      console.log(`[LoadingPage] 跳转到: ${destinationUrl}`);
      router.push(destinationUrl);
    }, 800); // 800ms 延时，可以调整

    // 清理函数，以防组件在计时器触发前被卸载
    return () => clearTimeout(timer);

  }, [router, destinationUrl]); // 依赖项

  return (
    <LoadingContainer>
      <Spin size="large" />
      <Text style={{ marginTop: '20px', fontSize: '16px', color: '#555' }}>
        登录成功，正在跳转...
      </Text>
    </LoadingContainer>
  );
} 