import React from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@ant-design/v5-patch-for-react-19';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { MSWComponent } from '@/components/MSWComponent';
import { App, ConfigProvider, theme as antdTheme } from 'antd';
import { LoadingProvider } from '@/contexts/LoadingContext';
import zhCN from 'antd/locale/zh_CN';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- 配色方案 A ---
const PRIMARY_COLOR = '#2A5F6D'; // 深青蓝色
const ACCENT_COLOR = '#E2725B'; // 赤陶色
const TEXT_COLOR_PRIMARY = '#343A40'; // 主要文字
const TEXT_COLOR_SECONDARY = '#6C757D'; // 次要文字
const BACKGROUND_COLOR = '#F5F5F5'; // 背景色
const CONTAINER_BG_COLOR = '#FFFFFF'; // 容器背景色
const BORDER_COLOR = '#DEE2E6'; // 边框/分割线
const SUCCESS_COLOR = '#28A745'; // 成功
const WARNING_COLOR = '#FFC107'; // 警告
const ERROR_COLOR = '#DC3545';   // 错误
const WHITE_TEXT = '#FFFFFF'; // 白色文字 (用于深色背景)
// --------------------------

export const metadata: Metadata = {
  title: "项目管理系统",
  description: "一个现代化的项目管理与展示平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: BACKGROUND_COLOR }} // 应用全局背景色
      >
      <LoadingProvider>
        <MSWComponent />
        <AntdRegistry>
          <ConfigProvider
            locale={zhCN}
            theme={{
              token: {
                // colorPrimary: PRIMARY_COLOR, // 注释掉此行以恢复 Antd 默认蓝色
                colorSuccess: SUCCESS_COLOR,
                colorWarning: WARNING_COLOR,
                colorError: ERROR_COLOR,
                colorInfo: PRIMARY_COLOR, // 信息色可以保留或也移除
                colorText: TEXT_COLOR_PRIMARY,
                colorTextSecondary: TEXT_COLOR_SECONDARY,
                colorTextLightSolid: WHITE_TEXT,
                colorBgContainer: CONTAINER_BG_COLOR,
                colorBgLayout: BACKGROUND_COLOR,
                colorBorder: BORDER_COLOR,
                colorSplit: BORDER_COLOR,
                borderRadius: 8, // 可以稍微调整圆角增加柔和感
              },
              components: {
                Menu: {
                  // 调整深色菜单样式以适应新配色
                  darkItemSelectedBg: ACCENT_COLOR, // 选中项背景用强调色
                  darkItemSelectedColor: WHITE_TEXT, // 选中项文字用白色
                  darkItemHoverBg: 'rgba(255, 255, 255, 0.1)', // 悬浮背景可以淡一些
                  darkSubMenuItemBg: PRIMARY_COLOR, // 子菜单背景
                  darkItemColor: 'rgba(255, 255, 255, 0.75)', // 未选中项文字
                  darkItemHoverColor: WHITE_TEXT, // 悬浮文字
                },
                Layout: {
                  // Sider 背景色通过 Menu 的 darkBg 控制似乎更好
                  // headerBg: CONTAINER_BG_COLOR, // 如果有 Header
                  // bodyBg: BACKGROUND_COLOR, // 已在 token 中设置 colorBgLayout
                  // triggerBg: 'rgba(255, 255, 255, 0.1)', // 可以考虑用主色或强调色的半透明
                   triggerBg: `rgba(255, 255, 255, 0.1)`, // 保持一个中性选择
                   triggerColor: `rgba(255, 255, 255, 0.75)`,
                },
                Button: {
                  // 可以为按钮添加默认样式，比如主按钮用强调色
                  // colorPrimary: ACCENT_COLOR,
                  // colorPrimaryHover: // ... 悬浮色
                },
                Card: {
                  colorBorderSecondary: BORDER_COLOR, // 卡片分割线颜色
                },
                Tag: {
                  // 可以定义一些默认标签颜色
                  // successColor: SUCCESS_COLOR,
                  // warningColor: WARNING_COLOR,
                  // errorColor: ERROR_COLOR,
                  // infoColor: PRIMARY_COLOR,
                }
              },
            }}
          >
            <App>
              {children}
            </App>
          </ConfigProvider>
        </AntdRegistry>
        </LoadingProvider>
      </body>
    </html>
  );
}
