'use client;'
import React from 'react';
import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input, Typography, Alert, Flex, Row, Col } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { credentials } from '@/types/auth';
const { Title, Text, Link } = Typography;

// --- Using Accent Color from Page Palette ---
const DEEP_MUSTARD_YELLOW = '#F2A900'; // 芥末黄 (按钮背景)
const DARK_TEXT_COLOR = '#333'; // 深色文字 (标题等)
const BUTTON_TEXT_DARK = '#4A4A4A'; // **新增: 按钮上的深灰文字**
const MEDIUM_TEXT_COLOR = '#555'; // 中等文字 (Checkbox)
const ICON_COLOR = 'rgba(0,0,0,.25)'; // 图标颜色
const LINK_COLOR = '#1677ff'; // 链接颜色
const FORM_BG_LIGHT = '#FFFFFF'; // 表单背景色 (白色)
// ----------------------------------------

type FieldType = {
  username?: string;
  password?: string;
  remember?: boolean;
};

interface LoginFormProps {
  // 回调函数，处理表单提交，返回 Promise (通常是 void，但可以返回 boolean 等)
  onSubmit: (values: credentials) => Promise<any>; // 父组件负责处理异步和结果
  isLoading: boolean; // 控制按钮加载状态
  className?: string; // 添加 className prop
  // 移除不再需要的 error 和 successMessage props
  // error: string | null;
  // successMessage: string | null;
}


const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit, // 接收 onSubmit 回调
  isLoading, // 接收状态
  className, // 接收 className
  // 移除 props 解构
  // error,
  // successMessage
}) => {
  // 表单提交处理函数 (Antd Form onFinish)
  // 直接调用 props.onSubmit
  const handleFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    const creds: credentials = {
      username: values.username || '',
      password: values.password || '',
    };
    try {
      await onSubmit(creds); // 调用父组件传入的 onSubmit
      // 成功或失败的消息、跳转等逻辑现在由父组件在 onSubmit 内部处理
    } catch (submitError) {
      // 如果 onSubmit promise 被 reject，可以在这里处理（但通常父组件已处理）
      console.error("登录表单提交抛出一个错误:", submitError);
      // 可以选择性地显示一个通用错误 message.error('提交处理失败');
    }
  };

  // 表单验证失败处理 (保持不变或根据需要调整)
  const handleFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('表单验证失败:', errorInfo);
    // message.warning('请检查输入项！'); // 全局提示可以移到父组件或保留
  };


  return (
    <Form
      name="login"
      layout="vertical"
      className={className} // 将 className 应用到 Form 元素
      initialValues={{ remember: true }}
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
      autoComplete="off"
    >

      <Form.Item<FieldType>
        name="username"
        rules={[{ required: true, message: '请输入用户名！' }]}
        style={{ marginBottom: '20px' }}
      >
        <Input
          prefix={<UserOutlined style={{ color: ICON_COLOR }} />} // 默认图标颜色
          placeholder="用户名"
          size="large"
        />
      </Form.Item>

      <Form.Item<FieldType>
        name="password"
        rules={[{ required: true, message: '请输入密码！' }]}
        style={{ marginBottom: '10px' }}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: ICON_COLOR }} />} // 默认图标颜色
          placeholder="密码"
          size="large"
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: '25px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Form.Item<FieldType> name="remember" valuePropName="checked" noStyle>
              <Checkbox style={{ color: MEDIUM_TEXT_COLOR }}>记住我</Checkbox>
            </Form.Item>
          </Col>
          <Col>
            <Link href="#" style={{ color: LINK_COLOR, fontSize: '0.875rem' }}>
              忘记密码?
            </Link>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={isLoading}
          size="large"
          style={{
              fontWeight: 600,
              border: 'none',
              height: '48px' // 保持按钮高度
          }}
        >
          登录
        </Button>
      </Form.Item>

      {/* 添加注册链接 */}
      <div className="text-center text-gray-500 text-sm mt-4">
        还没有账号? <Link href="#" style={{ color: LINK_COLOR }}>立即注册</Link>
      </div>

    </Form>
  );
}

export default LoginForm;