'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Typography } from 'antd';

const { Title } = Typography;

// 引用全局配色
import { colors } from '@/data/resumeData'; 

// --- 移除旧的独立颜色定义 ---
/*
const SKY_BLUE_BG = '#1CB9ED';    // 天空蓝背景 (主区域)
const DEEP_MUSTARD_YELLOW = '#F7B733'; // **加深的芥末黄** (用作形状点缀)
const LIGHT_GREY_SHAPE = '#F3F4F6'; // 浅灰色 (用于形状点缀)
const WHITE_TEXT = '#FFFFFF';      // 白色文字/元素
*/
// ---------------------------------------------

export default function HomePageContent() {
  return (
    <main 
      className="flex-grow relative flex items-center justify-center md:justify-start px-6 md:px-16 lg:px-32 py-16 overflow-hidden"
      style={{ background: colors.BACKGROUND }} // 使用新的浅灰背景
    >
      <div 
        className="absolute bottom-[-200px] right-[-150px] w-[550px] h-[550] rounded-full opacity-80 z-0"
        style={{ background: colors.ACCENT }} // 使用强调色
      ></div>
      
      <div 
        className="absolute top-[50px] right-[-100px] w-[350px] h-[200px] opacity-60 transform rotate-12 z-0"
        style={{ background: colors.BORDER, borderRadius: '20px' }} // 使用边框色，更柔和
      ></div>
      <div className="max-w-lg text-center md:text-left z-10 ml-32">
        <Title style={{ color: colors.TEXT_PRIMARY, marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 700 }}>
          项目展示系统
        </Title>
        <Title level={3} style={{ color: colors.TEXT_PRIMARY, marginBottom: '1.5rem', fontWeight: 400, opacity: 0.9 }}>
          一个现代化的平台，用于集中展示和管理您的项目成果。
        </Title>
        <p className="text-lg mb-8" style={{ color: colors.TEXT_SECONDARY, opacity: 0.9 }}>
          请登录以浏览项目详情、管理内容或与我们联系。
        </p>
        <Link href="/login">
          <Button 
            type="primary" // 使用主按钮样式，颜色会继承 ConfigProvider
            size="large" 
            style={{ 
              fontWeight: 600,
              padding: '0 30px',
            }}
          >
            点击登录
          </Button>
        </Link>
      </div>
    </main>
  );
} 