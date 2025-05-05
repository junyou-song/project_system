import React from 'react';
import ClientLayout from '@/components/layout/ClientLayout';

// 这是一个服务器组件
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
