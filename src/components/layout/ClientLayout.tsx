'use client';
import React, { useState, useEffect } from 'react';
import { Layout, Spin, App, ConfigProvider, theme } from 'antd';
import Sidebar from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/transitions/PageTransition';

const { Content } = Layout;

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const { token: themeToken } = theme.useToken();

  const handleSidebarCollapse = (isCollapsed: boolean) => {
    setCollapsed(isCollapsed);
  };

  useEffect(() => {
    console.log('[ClientLayout] 组件挂载');
    return () => console.log('[ClientLayout] 组件卸载');
  }, []);

  useEffect(() => {
    console.log('[ClientLayout] 认证状态检查:', { isLoading, user: !!user, token: !!token });
    let isRedirecting = false;
    if (!isLoading && !user && !isRedirecting) {
      console.log('[ClientLayout] 用户未登录，准备重定向');
      isRedirecting = true;
      const timer = setTimeout(() => { router.push('/login?session=expired'); }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, router, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center"><Spin size="large" /></div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: '#1677ff', borderRadius: 8 },
        components: { Layout: { bodyBg: '#F5F5F5' } },
      }}
    >
      <App>
        <Sidebar onCollapse={handleSidebarCollapse}/>
        
        <Layout 
          style={{ 
            marginLeft: collapsed ? '108px' : '248px',
            minHeight: '100vh',
            padding: '24px',
            transition: 'margin-left 0.3s ease-in-out'
          }}
        >
          <Content>
            <AnimatePresence mode="wait">
              <PageTransition>
                {children}
              </PageTransition>
            </AnimatePresence>
          </Content>
        </Layout>
      </App>
    </ConfigProvider>
  );
};

export default ClientLayout; 