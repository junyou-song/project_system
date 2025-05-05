import axios from 'axios';
import { Client } from '../Client'; // 导入共享实例
import { User } from '@/types/user'; // 导入用户类型
import { ErrorResponse } from '@/types/auth'; // 导入错误响应类型

// 等待MSW初始化的函数
const waitForMSW = async (timeout = 500): Promise<boolean> => {
  // 仅在开发环境中且浏览器环境中执行
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
    return true; // 在生产环境或服务器端直接返回就绪
  }

  // 如果MSW已准备好，直接返回
  if (window.mswReady === true) {
    return true;
  }

  // 等待短暂时间让MSW初始化
  console.log('[API] 等待MSW初始化...');
  return new Promise(resolve => {
    // 定义检查函数
    const checkReady = () => {
      if (window.mswReady === true) {
        console.log('[API] MSW已准备好');
        resolve(true);
        return;
      }
      
      // 设置超时，避免无限等待
      setTimeout(() => {
        console.log('[API] MSW未能及时初始化，继续请求');
        resolve(false);
      }, timeout);
    };
    
    // 立即执行一次检查
    checkReady();
  });
};

// 获取当前登录用户的信息
export const getUserProfile = async (): Promise<User> => {
  try {
    // 先尝试等待MSW初始化(仅开发环境)
    await waitForMSW();
    
    // Client 需要配置拦截器来自动添加 Authorization 头
    const response = await Client.get<User>('/api/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);

    let errorMessage = '获取用户信息时发生未知错误';

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Server Response Error (Profile):', error.response.status, error.response.data);
        const serverMessage = (error.response.data as ErrorResponse)?.message;
        if (serverMessage) {
          errorMessage = serverMessage;
        } else if (error.response.status === 401) {
          errorMessage = '用户未授权或 Token 已过期'; // 401 对应的信息
        } else if (error.response.status === 403) {
          errorMessage = '用户无权访问此资源'; // 403 对应的信息
        } else {
          errorMessage = `服务器错误 (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = '无法连接到服务器，请检查网络';
      } else {
        errorMessage = `请求设置错误: ${error.message}`;
      }
    } else {
      if (error instanceof Error) {
        errorMessage = error.message;
      }
    }
    // 抛出错误，调用者需要处理
    throw new Error(errorMessage);
  }
}; 