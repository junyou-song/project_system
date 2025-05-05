'use client'; // 标记为客户端组件
import React, { useEffect, useState } from 'react';
// 重新启用 LoginForm 导入
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { credentials } from '@/types/auth';
import { Spin, App, Row, Col, Alert, Typography, Image, Space, Card } from 'antd'; // 引入所需 Antd 组件

const LOGO_URL = '/logo.svg'; 
const ILLUSTRATION_URL = '/bg.svg'; 

// 将页面内容包装在函数组件中以使用 hook
function LoginPageContent() {
  const { login, isLoading, error, successMessage, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const { message: messageApi } = App.useApp(); // 使用 useApp 获取上下文相关的 message
  const successRedirectUrl = "/main/profile";

  useEffect(() => {
    // 检查URL参数
    const logout = searchParams.get('logout');
    const session = searchParams.get('session');
    
    if (logout === 'success') {
      setLogoutMessage('您已成功退出登录');
    }
    
    if (session === 'expired') {
      setSessionMessage('您的会话已过期，请重新登录');
    }
    
    // 添加日志调试认证状态
    console.log('[LoginPage] 认证状态检查:', {
      isLoading, 
      hasUser: !!user,
      params: {
        logout: logout || 'none',
        session: session || 'none'
      }
    });
  }, [searchParams, isLoading, user]);

  useEffect(() => {
    // 检查：不是在加载中 且 用户对象存在
    if (!isLoading && user) {
      console.log('[LoginPage] 用户已登录，正在重定向到个人信息页...');
      router.push(successRedirectUrl);
    }
    // 依赖项：isLoading 和 user 的变化会触发此 effect
  }, [isLoading, user, router, successRedirectUrl]);

  // 使用 Antd Form 的 onFinish 处理提交
  const handleLoginSubmit = async (values: credentials) => {
    try {
      console.log('[LoginPage] 尝试登录:', values.username);
      // 清除所有消息
      setLogoutMessage(null);
      setSessionMessage(null);
      
      const loginSuccess = await login(values); // 调用 useAuth 的 login

      if (loginSuccess) {
        console.log('[LoginPage] 登录成功!');
        messageApi.success('登录成功！即将跳转...', 2); // 提示信息持续 2 秒
        
        setTimeout(() => {
          console.log(`[LoginPage] 准备跳转到: ${successRedirectUrl}`);
          router.push(successRedirectUrl);
        }, 1500); // 设置 1.5 秒延迟
      } else {
        console.log('[LoginPage] 登录失败.');
        // 错误信息现在通过 error prop 传递给 LoginForm，并显示在 page.tsx 的 Alert 中
      }
    } catch (submitError) {
      console.error("[LoginPage] 处理提交时发生意外错误:", submitError);
      messageApi.error('处理登录请求时出错。');
    }
  };

  // 合并需要显示在 Alert 中的消息
  const alertMessage = error || successMessage || logoutMessage || sessionMessage;
  const alertType = error ? 'error' : (successMessage || logoutMessage ? 'success' : (sessionMessage ? 'warning' : undefined));

  // 加载状态或已登录时的显示
  if (isLoading || user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <Spin size="large" />
      </div>
    );
  }

  // 登录页面 UI
  return (
    // 1. 背景层 - 改为浅灰色背景
    <div
      className="min-h-screen flex justify-center items-center p-4"
      style={{ backgroundColor: '#F0F2F5' }} // 使用 Ant Design 常用布局背景色
    >
      {/* 2. 登录卡片 */}
      <Card
        className="w-full max-w-4xl shadow-lg"
        style={{ borderRadius: '12px' }} // 添加圆角
        styles={{ body: { padding: 0}}}
      >
        {/* 3. 卡片内部的左右分栏 */}
        <Row>
          {/* 左栏 - 品牌区 (现在在 Card 内部) */}
          <Col
            xs={0} sm={0} md={10} lg={12} // 在中小屏幕上隐藏左栏
            className="flex flex-col justify-center items-center p-10 bg-slate-50 rounded-l-lg" // 可以给左侧一个非常浅的背景色增加区分度，并设置左侧圆角
            // style={{ backgroundColor: '#F8F9FA' }} // 或者直接用浅色
          >
            <div className="text-center">
              {/* <Image src={LOGO_URL} alt="Logo" width={55} preview={false} className="mb-6" /> */}
              <Image src={ILLUSTRATION_URL} alt="Illustration" width={350} preview={false} />
              <Typography.Title level={4} className="mt-6 text-gray-600 font-sans">
                现代化的项目管理平台
              </Typography.Title>
            </div>
          </Col>

          {/* 右栏 - 表单区 (现在在 Card 内部) */}
          <Col
            xs={24} sm={24} md={14} lg={12}
            className="flex justify-center items-center p-8 md:p-12" // 调整内边距
          >
            <div className="w-full">
              <Typography.Title level={2} className="text-center mb-6 font-pingfang-sc font-bold">
                用户登录
              </Typography.Title>

              {alertMessage && alertType && (
                <Alert message={alertMessage} type={alertType} showIcon className="mb-8" />
              )}

              {/* 添加一个明确的间隔 div */}
              {alertMessage && alertType && <div className="h-4"></div>}

              {/* 使用 LoginForm 组件 - 添加上外边距 */}
              <LoginForm
                onSubmit={handleLoginSubmit}
                isLoading={isLoading}
                className="mt-6" // 保留上边距
              />
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

// 导出默认组件，用 App 包裹内容以提供上下文
export default function LoginPage() {
  return (
    <App>
      <LoginPageContent />
    </App>
  );
}
